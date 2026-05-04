// lib/api.ts
import { auth } from "./firebase";

const BASE = "/api";

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
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