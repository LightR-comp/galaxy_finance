from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import firebase_admin
from firebase_admin import credentials, auth
import json
from datetime import datetime
import os

app = FastAPI(title="Galaxy Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DB_FILE = "data.json"

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {}

def save_db():
    with open(DB_FILE, "w") as f:
        json.dump(db, f)

db = load_db()

# ── Firebase init ──
# Place your serviceAccountKey.json in the backend folder
if os.path.exists("serviceAccountKey.json") and not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# ── Models ──
class Transaction(BaseModel):
    id: Optional[str] = None
    title: str
    amount: float
    type: str          # "income" | "expense"
    category: str
    date: str
    note: Optional[str] = ""

class Budget(BaseModel):
    id: Optional[str] = None
    category: str
    limit: float
    spent: float = 0.0
    month: str         # "2024-01"

# ── Auth helper ──
async def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        decoded = auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

def get_user_db(uid: str):
    if uid not in db:
        db[uid] = {"transactions": [], "budgets": []}
    return db[uid]


# ── Basic ──
@app.get("/")
async def root():
    return {
        "message": "Welcome to Galaxy Finance API"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok"
    }
# ── Transactions ──
@app.get("/api/transactions", response_model=List[Transaction])
async def list_transactions(uid: str = Depends(get_current_user)):
    return get_user_db(uid)["transactions"]

@app.post("/api/transactions", response_model=Transaction)
async def create_transaction(tx: Transaction, uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    tx.id = str(datetime.now().timestamp()).replace(".", "")
    user["transactions"].insert(0, tx.dict())
    save_db()
    return tx

@app.delete("/api/transactions/{tx_id}")
async def delete_transaction(tx_id: str, uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    user["transactions"] = [t for t in user["transactions"] if t["id"] != tx_id]
    save_db()
    return {"ok": True}

# ── Summary ──
@app.get("/api/summary")
async def get_summary(uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    txs = user["transactions"]
    total_income  = sum(t["amount"] for t in txs if t["type"] == "income")
    total_expense = sum(t["amount"] for t in txs if t["type"] == "expense")
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_profit": total_income - total_expense,
        "transaction_count": len(txs),
    }

# ── Budgets ──
@app.get("/api/budgets", response_model=List[dict])
async def list_budgets(uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    budgets = user["budgets"].copy()
    transactions = user["transactions"]

    # Tính spent cho budgets đã tạo
    for budget in budgets:
        budget["spent"] = sum(
            t["amount"] for t in transactions
            if t["type"] == "expense"
            and t["category"] == budget["category"]
            and t["date"].startswith(budget["month"])
        )

    # Tìm các category có giao dịch nhưng chưa có ngân sách
    current_month = datetime.now().strftime("%Y-%m")
    existing_categories = {b["category"] for b in budgets if b["month"] == current_month}

    for t in transactions:
        if (t["type"] == "expense"
            and t["date"].startswith(current_month)
            and t["category"] not in existing_categories):
            
            spent = sum(
                x["amount"] for x in transactions
                if x["type"] == "expense"
                and x["category"] == t["category"]
                and x["date"].startswith(current_month)
            )
            budgets.append({
                "id": f"auto_{t['category']}",
                "category": t["category"],
                "limit": 0,
                "spent": spent,
                "month": current_month,
            })
            existing_categories.add(t["category"])

    return budgets

@app.post("/api/budgets", response_model=Budget)
async def create_budget(budget: Budget, uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    budget.id = str(datetime.now().timestamp()).replace(".", "")
    user["budgets"].append(budget.dict())
    save_db()
    return budget

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str, uid: str = Depends(get_current_user)):
    user = get_user_db(uid)
    user["budgets"] = [b for b in user["budgets"] if b["id"] != budget_id]
    save_db()
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)