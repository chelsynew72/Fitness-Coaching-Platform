"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  Users, UserCheck, DollarSign, BarChart3,
  LogOut, TrendingUp, CreditCard, CheckCircle2, XCircle
} from "lucide-react";

export default function AdminRevenue() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  useEffect(() => {
    if (isLoading) return;
    if (!token || user?.role !== "admin") { router.push("/login"); return; }
    fetchAll();
  }, [token, isLoading, user]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/admin/stats"),
      get("/admin/revenue"),
      get("/admin/subscriptions"),
    ]);
    if (results[0].status === "fulfilled") setStats(results[0].value);
    if (results[1].status === "fulfilled") {
      const monthly = results[1].value.monthly || [];
      setRevenueData(monthly.map((m: any) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        revenue: m.revenue,
        payments: m.count,
      })));
    }
    if (results[2].status === "fulfilled") setSubscriptions(results[2].value);
    setLoading(false);
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Coaches", icon: UserCheck, href: "/admin/coaches" },
    { label: "Revenue", icon: DollarSign, href: "/admin/revenue", active: true },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-white/5 flex-col py-8 px-4 sticky top-0 h-screen">
        <div className="px-2 mb-2">
          <span className="text-xl font-black uppercase tracking-tighter">FIT<span className="text-primary">PRO</span></span>
        </div>
        <div className="px-2 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                item.active ? "bg-white/5 text-primary border-l-2 border-primary" : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}>
              <item.icon className="h-4 w-4" />{item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-black text-sm">A</div>
            <div>
              <div className="text-xs font-bold">{user?.name}</div>
              <div className="text-[10px] text-red-400 uppercase">Admin</div>
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-zinc-600 hover:text-white text-xs font-semibold transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Financial Overview</p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Revenue</h1>
          </div>
          <button onClick={fetchAll}
            className="px-4 py-2 border border-white/5 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-lg hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `$${stats?.totalRevenue ?? 0}`, icon: DollarSign },
            { label: "MRR", value: `$${stats?.mrr ?? 0}`, icon: TrendingUp },
            { label: "Active Subs", value: stats?.activeSubscriptions ?? 0, icon: CreditCard },
            { label: "Total Subs", value: stats?.totalSubscriptions ?? 0, icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              {loading ? <div className="h-8 bg-zinc-900 rounded shimmer" /> : (
                <span className="text-3xl font-black text-primary">{s.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Monthly Revenue</p>
          {loading ? <div className="h-48 bg-zinc-900 rounded shimmer" /> : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`$${v}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#C8FF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* All Subscriptions */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">
            All Subscriptions ({subscriptions.length})
          </p>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-900 rounded shimmer" />)}</div>
          ) : subscriptions.length > 0 ? (
            <>
              <div className="grid grid-cols-5 gap-4 px-4 py-2 mb-1">
                {["Client", "Coach", "Amount", "Status", "Renews"].map(h => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{h}</span>
                ))}
              </div>
              <div className="space-y-2">
                {subscriptions.map((sub: any, i: number) => {
                  const client = typeof sub.clientId === "object" ? sub.clientId : { name: "Client" };
                  const coach = typeof sub.coachId === "object" ? sub.coachId : { name: "Coach" };
                  return (
                    <div key={i} className="grid grid-cols-5 gap-4 items-center bg-zinc-900 rounded-lg px-4 py-3">
                      <span className="text-sm font-bold">{client.name}</span>
                      <span className="text-sm text-zinc-400">{coach.name}</span>
                      <span className="text-sm font-black text-primary">${sub.amount}</span>
                      <div className="flex items-center gap-1.5">
                        {sub.status === "active"
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          : <XCircle className="h-3.5 w-3.5 text-red-400" />
                        }
                        <span className={`text-xs font-bold capitalize ${sub.status === "active" ? "text-primary" : "text-red-400"}`}>
                          {sub.status}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-zinc-600 text-sm text-center py-8">No subscriptions yet</p>
          )}
        </div>
      </main>
    </div>
  );
}