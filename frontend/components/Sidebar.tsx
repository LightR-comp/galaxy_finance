// components/Sidebar.tsx
"use client"; // Thêm nếu dùng App Router

import { useRouter, usePathname } from "next/navigation";
import { signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, LogOut, TrendingUp } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Giao dịch", icon: ArrowLeftRight,  href: "/transactions" },
  { label: "Ngân sách", icon: PiggyBank,        href: "/budgets" },
  { label: "Phân tích", icon: TrendingUp,       href: "/analytics" },
];

export default function Sidebar({ user }: { user: User | null }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-6 px-4 z-30"
      style={{ background: "rgba(10,5,32,0.95)", borderRight: "1px solid rgba(139,92,246,0.15)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <img src="/logo.gif" alt="logo" className="object-cover w-16 h-16  flex-shrink-0" style={{ 
              clipPath: "circle(50%)",
              objectFit: "cover"
              }} />
        <div className="text-center mt-2">
          <div className="font-display font-bold text-lg tracking-widest uppercase text-gradient">Galaxy</div>
          <div className="font-display font-bold text-lg tracking-widest uppercase text-gradient">Finance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ label, icon: Icon, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className={clsx("nav-item", pathname === href && "active")}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="mt-auto">
        <div className="glass p-3 flex items-center gap-3 mb-3">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt="avatar" width={32} height={32}
              className="rounded-full ring-2 ring-nebula-500/40" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-nebula-600 flex items-center justify-center text-xs font-bold">
              {user?.displayName?.[0] || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || "User"}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="nav-item w-full text-comet-400 hover:bg-comet-400/10">
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}