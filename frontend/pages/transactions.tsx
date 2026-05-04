// pages/transactions.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { Plus, Trash2, Search, ArrowUpRight, ArrowDownRight, X } from "lucide-react";

const CATEGORIES_EXPENSE = ["Ăn uống","Di chuyển","Giải trí","Mua sắm","Sức khoẻ","Giáo dục","Nhà ở","Khác"];
const CATEGORIES_INCOME = ["Lương","Thưởng","Đầu tư","Kinh doanh","Khác"];

interface Tx { id: string; title: string; amount: number; type: string; category: string; date: string; note?: string; }

export default function Transactions() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense", category: "Ăn uống", date: new Date().toISOString().split("T")[0], note: "" });

  const load = () => api.getTransactions().then(setTransactions).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.amount) return;
    await api.createTransaction({ ...form, amount: parseFloat(form.amount) });
    setForm({ title: "", amount: "", type: "expense", category: "Ăn uống", date: new Date().toISOString().split("T")[0], note: "" });
    setShowForm(false);
    load();
  };

  const del = async (id: string) => { await api.deleteTransaction(id); load(); };

  const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

  const filtered = transactions.filter(tx =>
    (filter === "all" || tx.type === filter) &&
    (tx.title.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout title="Giao dịch">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Giao dịch</h1>
            <p className="text-slate-400 mt-1 text-sm">{transactions.length} giao dịch</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Thêm giao dịch</button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
          <input 
            className="input-galaxy" 
            style={{ paddingLeft: "36px" }}
            placeholder="Tìm kiếm..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            />
          </div>
          {["all","income","expense"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter===f ? "bg-nebula-600 text-white" : "btn-ghost"}`}>
              {f === "all" ? "Tất cả" : f === "income" ? "Thu nhập" : "Chi tiêu"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="glass p-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🌌</div>
              <p className="text-slate-400 text-sm">Không tìm thấy giao dịch</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: tx.type === "income" ? "rgba(52,211,153,0.15)" : "rgba(244,114,182,0.15)" }}>
                  {tx.type === "income" ? "💰" : "💸"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200">{tx.title}</div>
                  <div className="text-xs text-slate-500">{tx.category} · {tx.date}</div>
                  {tx.note && <div className="text-xs text-slate-600 mt-0.5">{tx.note}</div>}
                </div>
                <div className={`font-bold text-sm flex items-center gap-1 ${tx.type === "income" ? "amount-income" : "amount-expense"}`}>
                  {tx.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {fmt(tx.amount)}
                </div>
                <button onClick={() => del(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-comet-400/20 text-comet-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,2,15,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="glass-strong p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-white">Thêm giao dịch</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              {["expense","income"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f,
                type: t,
                category: t === "income" ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0]
}))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type===t ? (t==="income"?"bg-aurora-500/30 text-aurora-400 border border-aurora-500/40":"bg-comet-500/30 text-comet-400 border border-comet-500/40") : "btn-ghost"}`}>
                  {t === "income" ? "💰 Thu nhập" : "💸 Chi tiêu"}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <input className="input-galaxy" placeholder="Tên giao dịch *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <input className="input-galaxy" placeholder="Số tiền (VND) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <select className="input-galaxy" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {(form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="input-galaxy" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <input className="input-galaxy" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn-primary flex-1 justify-center" onClick={submit}>Thêm giao dịch</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}