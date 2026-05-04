// pages/budgets.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { Plus, Trash2, X, PiggyBank } from "lucide-react";

const CATEGORIES = ["Ăn uống","Di chuyển","Giải trí","Mua sắm","Sức khoẻ","Giáo dục","Nhà ở","Khác"];

const CATEGORY_ICONS: Record<string, string> = {
  "Ăn uống": "🍜", "Di chuyển": "🚗", "Giải trí": "🎮",
  "Mua sắm": "🛍️", "Sức khoẻ": "💊", "Giáo dục": "📚",
  "Nhà ở": "🏠", "Khác": "📦",
};

interface Budget { id: string; category: string; limit: number; spent: number; month: string; }

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Ăn uống", limit: "", month: currentMonth() });

  const load = () => api.getBudgets().then(setBudgets).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.limit) return;
    await api.createBudget({ ...form, limit: parseFloat(form.limit), spent: 0 });
    setForm({ category: "Ăn uống", limit: "", month: currentMonth() });
    setShowForm(false);
    load();
  };

  const del = async (id: string) => { await api.deleteBudget(id); load(); };

  const getStatus = (spent: number, limit: number) => {
  if (limit === 0) return { color: "#f472b6", label: "Chưa đặt hạn mức", bg: "rgba(244,114,182,0.15)" };
  const pct = (spent / limit) * 100;
  if (pct >= 100) return { color: "#f472b6", label: "Vượt hạn mức", bg: "rgba(244,114,182,0.15)" };
  if (pct >= 80)  return { color: "#fb923c", label: "Gần hạn mức", bg: "rgba(251,146,60,0.15)" };
  return { color: "#34d399", label: "Trong hạn mức", bg: "rgba(52,211,153,0.15)" };
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <Layout title="Ngân sách">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Ngân sách</h1>
            <p className="text-slate-400 mt-1 text-sm">{budgets.length} danh mục đang theo dõi</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Thêm ngân sách
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Tổng hạn mức", value: fmt(totalLimit), icon: "💰", color: "#8b5cf6" },
            { label: "Đã chi tiêu", value: fmt(totalSpent), icon: "💸", color: "#f472b6" },
            { label: "Còn lại", value: fmt(Math.max(0, totalLimit - totalSpent)), icon: "✅", color: "#34d399" },
          ].map(card => (
            <div key={card.label} className="glass p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{card.icon}</span>
                <span className="text-xs text-slate-400">{card.label}</span>
              </div>
              <div className="font-bold text-lg" style={{ color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Budget list */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải...</div>
        ) : budgets.length === 0 ? (
          <div className="glass p-12 text-center">
            <PiggyBank size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-sm">Chưa có ngân sách nào. Hãy thêm ngân sách đầu tiên!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {budgets.map(b => {
              const pct = Math.min((b.spent / b.limit) * 100, 100);
              const status = getStatus(b.spent, b.limit);
              return (
                <div key={b.id} className="glass p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: status.bg }}>
                        {CATEGORY_ICONS[b.category] || "📦"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{b.category}</div>
                        <div className="text-xs text-slate-500">{b.month}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </div>
                      </div>
                      <button onClick={() => del(b.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-comet-400/20 text-comet-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: status.color }} />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Đã chi: <span style={{ color: status.color }}>{fmt(b.spent)}</span></span>
                    <span>{pct.toFixed(0)}%</span>
                    <span>Hạn mức: <span className="text-slate-300">{fmt(b.limit)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,2,15,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="glass-strong p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-white">Thêm ngân sách</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <select className="input-galaxy" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="input-galaxy" placeholder="Hạn mức (VND) *" type="number"
                value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
              <input className="input-galaxy" type="month"
                value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn-primary flex-1 justify-center" onClick={submit}>Thêm ngân sách</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
