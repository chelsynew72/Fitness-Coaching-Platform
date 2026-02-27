"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3, Dumbbell, Target, Apple,
  MessageCircle, CreditCard, LogOut, Menu, X
} from "lucide-react";

interface Props {
  active: string;
  unread?: number;
}

export default function ClientSidebar({ active, unread = 0 }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-2 mb-10">
        <span className="text-xl font-black uppercase tracking-tighter">
          FIT<span className="text-primary">PRO</span>
        </span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button key={item.href}
            onClick={() => { router.push(item.href); setOpen(false); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              active === item.href
                ? "bg-white/5 text-primary border-l-2 border-primary"
                : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
            }`}>
            <item.icon className="h-4 w-4" />
            {item.label}
            {(item.badge ?? 0) > 0 && (
              <span className="ml-auto bg-primary text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
            {user?.name?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">{user?.name}</div>
            <div className="text-[10px] text-zinc-600 uppercase">Client</div>
          </div>
        </div>
        <button onClick={() => { logout(); router.push("/login"); }}
          className="flex items-center gap-2 px-3 py-2 w-full text-zinc-600 hover:text-white text-xs font-semibold transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-white/5 flex-col py-8 px-4 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-black uppercase tracking-tighter">
          FIT<span className="text-primary">PRO</span>
        </span>
        <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-zinc-950 border-r border-white/5 flex flex-col py-8 px-4 h-full">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-zinc-600 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
