// pages/analytics.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Tx { id: string; title: string; amount: number; type: string; category: string; date: string; }

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const CATEGORY_ICONS: Record<string, string> = {
  "Ăn uống": "🍜", "Di chuyển": "🚗", "Giải trí": "🎮",
  "Mua sắm": "🛍️", "Sức khoẻ": "💊", "Giáo dục": "📚",
  "Nhà ở": "🏠", "Khác": "📦",
  "Lương": "💰", "Thưởng": "💰", "Đầu tư": "💰", "Kinh doanh": "💰",
};

const COLORS_EXPENSE = ["#ec4899","#f472b6","#fb923c","#f87171","#e879f9","#c084fc","#fb7185","#fda4af"];
const COLORS_INCOME  = ["#34d399","#4ade80","#60a5fa","#38bdf8","#a78bfa","#2dd4bf","#86efac","#6ee7b7"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{ background: "rgba(10,5,32,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: d.payload.fill, fontWeight: 600, fontSize: 13 }}>{CATEGORY_ICONS[d.name] || "💰"} {d.name}</p>
        <p style={{ color: "#e2e8f0", fontSize: 12 }}>{fmt(d.value)}</p>
        <p style={{ color: "#94a3b8", fontSize: 11 }}>{d.payload.percent}%</p>
      </div>
    );
  }
  return null;
};

function PieBlock({ title, data, colors, emptyMsg, type }: {
  title: string; data: any[]; colors: string[]; emptyMsg: string; type: "income" | "expense";
}) {
  return (
    <div className="glass p-5">
      <h3 className="font-semibold text-slate-200 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <span className="text-4xl mb-3">🌌</span>
          <p className="text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {data.slice(0, 5).map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                  <span className="text-slate-300">
                    {type === "income" ? "💰" : (CATEGORY_ICONS[item.name] || "📦")} {item.name}
                  </span>
                </div>
                <span className="text-slate-400">{item.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TopList({ title, items, color, bg, type }: {
  title: string; items: Tx[]; color: string; bg: string; type: "income" | "expense";
}) {
  return (
    <div className="glass p-5">
      <h3 className="font-semibold text-slate-200 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Chưa có dữ liệu</p>
      ) : (
        items.map((tx, i) => (
          <div key={tx.id} className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(139,92,246,0.2)", color: "#8b5cf6" }}>{i + 1}</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: bg }}>
              {type === "income" ? "💰" : (CATEGORY_ICONS[tx.category] || "📦")}
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-200">{tx.title}</div>
              <div className="text-xs text-slate-500">{tx.category} · {tx.date}</div>
            </div>
            <div className="font-bold text-sm" style={{ color }}>{fmt(tx.amount)}</div>
          </div>
        ))
      )}
    </div>
  );
}

export default function Analytics() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    Promise.all([api.getTransactions(), api.getSummary()])
      .then(([txs, s]) => { setTransactions(txs); setSummary(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(tx => {
    if (period === "all") return true;
    const txDate = new Date(tx.date);
    const now = new Date();
    if (period === "week") {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return txDate >= weekAgo;
    }
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  // Khi "Tất cả" dùng số từ backend để match với dashboard
  const income  = period === "all" && summary ? summary.total_income  : filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = period === "all" && summary ? summary.total_expense : filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const savingRate = income > 0 ? ((net / income) * 100).toFixed(1) : "0";

  const makePieData = (type: "income" | "expense") => {
    const total = type === "income" ? income : expense;
    return Object.entries(
      filtered.filter(t => t.type === type)
        .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])
     .map(([name, value]) => ({ name, value, percent: total > 0 ? ((value / total) * 100).toFixed(1) : "0" }));
  };

  const pieExpense = makePieData("expense");
  const pieIncome  = makePieData("income");
  const topExpense = filtered.filter(t => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 5);
  const topIncome  = filtered.filter(t => t.type === "income").sort((a, b) => b.amount - a.amount).slice(0, 5);

  const byMonth = transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][t.type as "income" | "expense"] += t.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const monthList = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonth = Math.max(...monthList.flatMap(([, v]) => [v.income, v.expense]), 1);

  return (
    <Layout title="Phân tích">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Phân tích</h1>
            <p className="text-slate-400 mt-1 text-sm">Tổng quan tài chính của bạn</p>
          </div>
          <div className="flex gap-2">
            {(["week","month","all"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? "bg-nebula-600 text-white" : "btn-ghost"}`}>
                {p === "week" ? "7 ngày" : p === "month" ? "Tháng này" : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Thu nhập", value: fmt(income), icon: <TrendingUp size={18}/>, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
                { label: "Chi tiêu", value: fmt(expense), icon: <TrendingDown size={18}/>, color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
                { label: "Chênh lệch", value: fmt(net), icon: <DollarSign size={18}/>, color: net >= 0 ? "#34d399" : "#f472b6", bg: net >= 0 ? "rgba(52,211,153,0.15)" : "rgba(244,114,182,0.15)" },
                { label: "Tỷ lệ tiết kiệm", value: `${savingRate}%`, icon: <BarChart2 size={18}/>, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
              ].map(card => (
                <div key={card.label} className="glass p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
                    <span className="text-xs text-slate-400">{card.label}</span>
                  </div>
                  <div className="font-bold text-base" style={{ color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* 2 Pie charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <PieBlock title="Chi tiêu theo danh mục" data={pieExpense} colors={COLORS_EXPENSE}
                emptyMsg="Chưa có dữ liệu chi tiêu" type="expense" />
              <PieBlock title="Thu nhập theo danh mục" data={pieIncome} colors={COLORS_INCOME}
                emptyMsg="Chưa có dữ liệu thu nhập" type="income" />
            </div>

            {/* Thu chi theo tháng */}
            <div className="glass p-5 mb-6">
              <h3 className="font-semibold text-slate-200 mb-4">Thu chi theo tháng</h3>
              {monthList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <span className="text-4xl mb-3">🌌</span>
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-2" style={{ height: "160px" }}>
                    {monthList.map(([month, val]) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end" style={{ height: "130px" }}>
                          <div className="flex-1 rounded-t-sm transition-all duration-500"
                            style={{ height: `${(val.income / maxMonth) * 100}%`, background: "rgba(52,211,153,0.7)", minHeight: "2px" }} />
                          <div className="flex-1 rounded-t-sm transition-all duration-500"
                            style={{ height: `${(val.expense / maxMonth) * 100}%`, background: "rgba(244,114,182,0.7)", minHeight: "2px" }} />
                        </div>
                        <span className="text-xs text-slate-500">{month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(52,211,153,0.7)" }} />Thu nhập
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(244,114,182,0.7)" }} />Chi tiêu
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Top 2 lists */}
            <div className="grid grid-cols-2 gap-6">
              <TopList title="Top chi tiêu lớn nhất" items={topExpense} color="#f472b6" bg="rgba(244,114,182,0.1)" type="expense" />
              <TopList title="Top thu nhập lớn nhất" items={topIncome}  color="#34d399" bg="rgba(52,211,153,0.1)"  type="income"  />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
