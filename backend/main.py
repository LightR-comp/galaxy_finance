from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import firebase_admin
from firebase_admin import credentials, auth, firestore
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

# ── Firebase init ──
if os.path.exists("serviceAccountKey.json") and not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ── Models ──
class Transaction(BaseModel):
    id: Optional[str] = None
    title: str
    amount: float
    type: str
    category: str
    date: str
    note: Optional[str] = ""

class Budget(BaseModel):
    id: Optional[str] = None
    category: str
    limit: float
    spent: float = 0.0
    month: str

# ── Auth helper & Database Helper ──
async def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

def get_user_db(uid: str):
    """Lấy dữ liệu của 1 user từ Firestore, nếu chưa có thì tạo mới rỗng"""
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    
    if doc.exists:
        return doc.to_dict()
    else:
        return {"transactions": [], "budgets": []}

def save_user_db(uid: str, user_data: dict):
    """Lưu cập nhật dữ liệu của 1 user lên Firestore"""
    db.collection("users").document(uid).set(user_data)

# ── Basic ──
@app.get("/")
async def root():
    return {
        "message": "Welcome to Galaxy Finance API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }

# ── Auth endpoints ──
@app.post("/auth/login")
async def login(decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user_db = get_user_db(uid)

    try:
        firebase_user = auth.get_user(uid)
        display_name = firebase_user.display_name or ""
        email = firebase_user.email or ""
        photo_url = firebase_user.photo_url or ""
    except Exception:
        display_name = decoded.get("name", "")
        email = decoded.get("email", "")
        photo_url = decoded.get("picture", "")

    return {
        "uid": uid,
        "email": email,
        "display_name": display_name,
        "photo_url": photo_url,
        "transaction_count": len(user_db["transactions"]),
        "budget_count": len(user_db["budgets"]),
    }

@app.get("/auth/me")
async def get_me(decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user_db = get_user_db(uid)
    txs = user_db["transactions"]

    try:
        firebase_user = auth.get_user(uid)
        display_name = firebase_user.display_name or ""
        email = firebase_user.email or ""
        photo_url = firebase_user.photo_url or ""
        provider = firebase_user.provider_data[0].provider_id if firebase_user.provider_data else "unknown"
    except Exception:
        display_name = decoded.get("name", "")
        email = decoded.get("email", "")
        photo_url = decoded.get("picture", "")
        provider = "unknown"

    total_income  = sum(t["amount"] for t in txs if t["type"] == "income")
    total_expense = sum(t["amount"] for t in txs if t["type"] == "expense")

    return {
        "uid": uid,
        "email": email,
        "display_name": display_name,
        "photo_url": photo_url,
        "provider": provider,
        "stats": {
            "transaction_count": len(txs),
            "budget_count": len(user_db["budgets"]),
            "total_income": total_income,
            "total_expense": total_expense,
            "net_profit": total_income - total_expense,
        }
    }

# ── Transactions ──
@app.get("/api/transactions", response_model=List[Transaction])
async def list_transactions(decoded: dict = Depends(get_current_user)):
    return get_user_db(decoded["uid"])["transactions"]

@app.post("/api/transactions", response_model=Transaction)
async def create_transaction(tx: Transaction, decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user = get_user_db(uid)
    tx.id = str(datetime.now().timestamp()).replace(".", "")
    user["transactions"].insert(0, tx.dict())
    
    save_user_db(uid, user)
    return tx

@app.delete("/api/transactions/{tx_id}")
async def delete_transaction(tx_id: str, decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user = get_user_db(uid)
    user["transactions"] = [t for t in user["transactions"] if t["id"] != tx_id]
    
    save_user_db(uid, user)
    return {"ok": True}

# ── Summary ──
@app.get("/api/summary")
async def get_summary(decoded: dict = Depends(get_current_user)):
    txs = get_user_db(decoded["uid"])["transactions"]
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
async def list_budgets(decoded: dict = Depends(get_current_user)):
    user = get_user_db(decoded["uid"])
    budgets = user["budgets"].copy()
    transactions = user["transactions"]

    for budget in budgets:
        budget["spent"] = sum(
            t["amount"] for t in transactions
            if t["type"] == "expense"
            and t["category"] == budget["category"]
            and t["date"].startswith(budget["month"])
        )

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
async def create_budget(budget: Budget, decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user = get_user_db(uid)
    budget.id = str(datetime.now().timestamp()).replace(".", "")
    user["budgets"].append(budget.dict())
    
    save_user_db(uid, user)
    return budget

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str, decoded: dict = Depends(get_current_user)):
    uid = decoded["uid"]
    user = get_user_db(uid)
    user["budgets"] = [b for b in user["budgets"] if b["id"] != budget_id]
    
    save_user_db(uid, user)
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)