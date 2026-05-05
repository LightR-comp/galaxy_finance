// components/Sidebar.tsx
"use client";

import { useRouter } from "next/router";
import { signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, TrendingUp, UserCircle } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { label: "Tổng quan",  icon: LayoutDashboard, href: "/dashboard" },
  { label: "Giao dịch",  icon: ArrowLeftRight,  href: "/transactions" },
  { label: "Ngân sách",  icon: PiggyBank,        href: "/budgets" },
  { label: "Phân tích",  icon: TrendingUp,       href: "/analytics" },
];

export default function Sidebar({ user }: { user: User | null }) {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-6 px-4 z-30"
      style={{ background: "rgba(10,5,32,0.95)", borderRight: "1px solid rgba(139,92,246,0.15)" }}>

      {/* Logo */}
      <div className="flex flex-col items-center px-3 mb-8">
        <img src="/logo.gif" alt="logo" className="object-cover flex-shrink-0"
          style={{ clipPath: "circle(50%)", objectFit: "cover", width: "96px", height: "96px" }} />
        <div className="text-center mt-2">
          <div className="font-display font-bold text-base tracking-widest uppercase text-gradient">Galaxy</div>
          <div className="font-display font-bold text-base tracking-widest uppercase text-gradient">Finance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ label, icon: Icon, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className={clsx("nav-item", router.pathname === href && "active")}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="mt-auto">
        <button
          onClick={() => router.push("/profile")}
          className={clsx(
            "glass p-3 flex items-center gap-3 mb-3 w-full text-left transition-all hover:bg-white/5 rounded-xl",
            router.pathname === "/profile" && "ring-1 ring-nebula-500/40"
          )}>
          {user?.photoURL ? (
            <Image src={user.photoURL} alt="avatar" width={32} height={32}
              className="rounded-full ring-2 ring-nebula-500/40 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-nebula-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || "User"}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
          <UserCircle size={14} className="text-slate-500 flex-shrink-0" />
        </button>

        <button onClick={() => signOut(auth)} className="nav-item w-full text-comet-400 hover:bg-comet-400/10">
          <span>↩</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
