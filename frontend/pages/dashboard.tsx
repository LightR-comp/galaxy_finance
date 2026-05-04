  // pages/dashboard.tsx
  import { useEffect, useState } from "react";
  import Layout from "../components/Layout";
  import { api } from "../lib/api";
  import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
  import { useRouter } from "next/router";

  const CATEGORY_COLORS: Record<string, string> = {
    "Ăn uống": "#f472b6",
    "Di chuyển": "#60a5fa",
    "Giải trí": "#a78bfa",
    "Mua sắm": "#fbbf24",
    "Sức khoẻ": "#34d399",
    "Giáo dục": "#f97316",
    "Nhà ở": "#e2e8f0",
    "Thu nhập": "#34d399",
    "Khác": "#94a3b8",
  };

  export default function Dashboard() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      Promise.all([api.getSummary(), api.getTransactions()])
        .then(([s, t]) => { setSummary(s); setTransactions(t.slice(0, 8)); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const fmt = (n: number) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

    return (
      <Layout title="Tổng quan">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Tổng quan</h1>
              <p className="text-slate-400 mt-1 text-sm">Theo dõi tài chính của bạn</p>
            </div>
            <button className="btn-primary" onClick={() => router.push("/transactions")}>
              <Plus size={16} /> Thêm giao dịch
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="stat-card glow-green">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-400 text-sm font-medium">Tổng thu nhập</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
                  <TrendingUp size={18} className="text-aurora-400" />
                </div>
              </div>
              <div className="font-display text-2xl font-bold amount-income">
                {loading ? "..." : fmt(summary?.total_income || 0)}
              </div>
            </div>

            <div className="stat-card glow-pink">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-400 text-sm font-medium">Tổng chi tiêu</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(244,114,182,0.15)" }}>
                  <TrendingDown size={18} className="text-comet-400" />
                </div>
              </div>
              <div className="font-display text-2xl font-bold amount-expense">
                {loading ? "..." : fmt(summary?.total_expense || 0)}
              </div>
            </div>

            <div className="stat-card glow-purple">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-400 text-sm font-medium">Số dư ròng</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <DollarSign size={18} className="text-nebula-400" />
                </div>
              </div>
              <div className={`font-display text-2xl font-bold ${(summary?.net_profit || 0) >= 0 ? "amount-income" : "amount-expense"}`}>
                {loading ? "..." : fmt(summary?.net_profit || 0)}
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-white">Giao dịch gần đây</h2>
              <button className="btn-ghost text-xs" onClick={() => router.push("/transactions")}>Xem tất cả →</button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🌌</div>
                <p className="text-slate-400 text-sm">Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!</p>
                <button className="btn-primary mt-4" onClick={() => router.push("/transactions")}>
                  <Plus size={14} /> Thêm ngay
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{ background: `${CATEGORY_COLORS[tx.category] || "#8b5cf6"}20` }}>
                      {tx.type === "income" ? "💰" : getCategoryEmoji(tx.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{tx.title}</div>
                      <div className="text-xs text-slate-500">{tx.category} · {tx.date}</div>
                    </div>
                    <div className={`font-semibold text-sm flex items-center gap-1 ${tx.type === "income" ? "amount-income" : "amount-expense"}`}>
                      {tx.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {fmt(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  function getCategoryEmoji(cat: string): string {
    const m: Record<string, string> = {
      "Ăn uống": "🍜", "Di chuyển": "🚗", "Giải trí": "🎮",
      "Mua sắm": "🛍️", "Sức khoẻ": "💊", "Giáo dục": "📚",
      "Nhà ở": "🏠", "Khác": "📦",
    };
    return m[cat] || "💸";
  }