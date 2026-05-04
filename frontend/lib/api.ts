// lib/api.ts
import { auth } from "./firebase";

// Trỏ trực tiếp đến Backend FastAPI đang chạy ở port 8000
const BASE_URL = "http://localhost:8000";
const API_BASE = `${BASE_URL}/api`;

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

// Thêm cờ isApiRoute để linh hoạt gọi /api/... hoặc /auth/...
async function request(path: string, options: RequestInit = {}, isApiRoute = true) {
  const token = await getToken();
  const baseUrl = isApiRoute ? API_BASE : BASE_URL;
  
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // ── Auth Endpoints (Gọi vào /auth/...) ──
  login: () => request("/auth/login", { method: "POST" }, false),
  getMe: () => request("/auth/me", { method: "GET" }, false),

  // ── Data Endpoints (Gọi vào /api/...) ──
  getSummary: () => request("/summary"),
  getTransactions: () => request("/transactions"),
  createTransaction: (data: any) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id: string) =>
    request(`/transactions/${id}`, { method: "DELETE" }),
  getBudgets: () => request("/budgets"),
  createBudget: (data: any) =>
    request("/budgets", { method: "POST", body: JSON.stringify(data) }),
  deleteBudget: (id: string) =>
    request(`/budgets/${id}`, { method: "DELETE" }),
};