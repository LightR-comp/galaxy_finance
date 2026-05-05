// pages/profile.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Image from "next/image";
import { User, Mail, Shield, BarChart2, TrendingUp, TrendingDown, DollarSign, LogOut } from "lucide-react";
import { api } from "../lib/api";

interface UserStats {
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  provider: string;
  stats: {
    transaction_count: number;
    budget_count: number;
    total_income: number;
    total_expense: number;
    net_profit: number;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const PROVIDER_LABEL: Record<string, string> = {
  "google.com": "Google",
  "password": "Email & Mật khẩu",
  "unknown": "Không xác định",
};

export default function Profile() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/"); return; }
      try {
        const data = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        }).then(r => r.json());
        setUserStats(data);
      } catch {
        // fallback từ Firebase client
        setUserStats({
          uid: user.uid,
          email: user.email || "",
          display_name: user.displayName || "",
          photo_url: user.photoURL || "",
          provider: user.providerData[0]?.providerId || "unknown",
          stats: { transaction_count: 0, budget_count: 0, total_income: 0, total_expense: 0, net_profit: 0 }
        });
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  return (
    <Layout title="Tài khoản">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Tài khoản</h1>
          <p className="text-slate-400 mt-1 text-sm">Thông tin cá nhân của bạn</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Đang tải...</div>
        ) : (
          <>
            {/* Avatar + name card */}
            <div className="glass p-6 flex items-center gap-5 mb-6">
              {userStats?.photo_url ? (
                <Image
                  src={userStats.photo_url}
                  alt="avatar"
                  width={72} height={72}
                  className="rounded-full ring-2 ring-nebula-500/40 flex-shrink-0"
                />
              ) : (
                <div className="w-18 h-18 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#3b1fa8,#8b5cf6)", width: 72, height: 72 }}>
                  {userStats?.display_name?.[0]?.toUpperCase() || userStats?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-xl text-white truncate">
                  {userStats?.display_name || "Người dùng"}
                </div>
                <div className="text-slate-400 text-sm mt-1 truncate">{userStats?.email}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield size={12} className="text-nebula-400" />
                  <span className="text-xs text-nebula-400">
                    {PROVIDER_LABEL[userStats?.provider || "unknown"]}
                  </span>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="glass p-6 mb-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <User size={16} className="text-nebula-400" /> Thông tin cơ bản
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Họ tên", value: userStats?.display_name || "Chưa cập nhật", icon: <User size={14}/> },
                  { label: "Email", value: userStats?.email || "", icon: <Mail size={14}/> },
                  { label: "Phương thức đăng nhập", value: PROVIDER_LABEL[userStats?.provider || "unknown"], icon: <Shield size={14}/> },
                  { label: "User ID", value: userStats?.uid || "", icon: <BarChart2 size={14}/> },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 py-2"
                    style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                    <div className="text-slate-500">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                      <div className="text-sm text-slate-200 truncate">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="glass p-6 mb-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-nebula-400" /> Thống kê tài khoản
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tổng thu nhập", value: fmt(userStats?.stats?.total_income || 0), icon: <TrendingUp size={16}/>, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
{ label: "Tổng chi tiêu", value: fmt(userStats?.stats?.total_expense || 0), icon: <TrendingDown size={16}/>, color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
{ label: "Chênh lệch", value: fmt(userStats?.stats?.net_profit || 0), icon: <DollarSign size={16}/>, color: (userStats?.stats?.net_profit || 0) >= 0 ? "#34d399" : "#f472b6", bg: (userStats?.stats?.net_profit || 0) >= 0 ? "rgba(52,211,153,0.15)" : "rgba(244,114,182,0.15)" },
{ label: "Số giao dịch", value: `${userStats?.stats?.transaction_count || 0} giao dịch`, icon: <BarChart2 size={16}/>, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
                ].map(card => (
                  <div key={card.label} className="p-4 rounded-xl" style={{ background: card.bg }}>
                    <div className="flex items-center gap-2 mb-2" style={{ color: card.color }}>
                      {card.icon}
                      <span className="text-xs font-medium">{card.label}</span>
                    </div>
                    <div className="font-bold text-sm" style={{ color: card.color }}>{card.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)" }}>
              <LogOut size={16} />
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
