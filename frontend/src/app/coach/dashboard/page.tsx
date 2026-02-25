"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  Users, TrendingUp, BarChart3, MessageCircle,
  Bell, LogOut, Dumbbell, CreditCard,
  ChevronRight, Activity, Calendar
} from "lucide-react";

export default function CoachDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [revenue, setRevenue] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
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
  // wait until auth is done loading
  if (isLoading) return;
  
  if (!token) {
    router.push("/login");
    return;
  }
  
  fetchAll();
}, [token, isLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/subscriptions/revenue"),
      get("/coaches/my-clients"),
      get("/plans/templates"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setRevenue(results[0].value);
    if (results[1].status === "fulfilled") setClients(results[1].value);
    if (results[2].status === "fulfilled") setPlans(results[2].value);
    if (results[3].status === "fulfilled") setUnread(results[3].value);
    setLoading(false);
  };

  // build monthly revenue chart data
  const revenueChartData = revenue?.monthlyRevenue
    ? Object.entries(revenue.monthlyRevenue).map(([month, amount]) => ({
        month: month.slice(5), // "2026-02" → "02"
        revenue: amount,
      }))
    : [];

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/coach/dashboard", active: true },
    { label: "Clients", icon: Users, href: "/coach/clients" },
    { label: "Plans", icon: Dumbbell, href: "/coach/plans" },
    { label: "Messages", icon: MessageCircle, href: "/coach/chat", badge: unread },
    { label: "Revenue", icon: TrendingUp, href: "/coach/revenue" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col py-8 px-4 sticky top-0 h-screen">
        <div className="px-2 mb-10">
          <span className="text-xl font-black uppercase tracking-tighter">
            FIT<span className="text-primary">PRO</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                item.active
                  ? "bg-white/5 text-primary border-l-2 border-primary"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
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
            <div>
              <div className="text-xs font-bold">{user?.name}</div>
              <div className="text-[10px] text-zinc-600 uppercase">Coach</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-zinc-600 hover:text-white text-xs font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Coach Dashboard
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              {user?.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center border border-white/5 bg-zinc-950 rounded-lg">
              <Bell className="h-4 w-4 text-zinc-400" />
              {unread > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-black" />
              )}
            </button>
            <button
              onClick={fetchAll}
              className="px-4 py-2 border border-white/5 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-lg hover:text-white transition-colors"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => router.push("/coach/plans/builder")}
              className="px-4 py-2 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
            >
              + New Plan
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Clients",
              value: loading ? "—" : clients.length,
              unit: "active",
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Monthly Revenue",
              value: loading ? "—" : `$${revenue?.mrr ?? 0}`,
              unit: "mrr",
              icon: TrendingUp,
              color: "text-primary",
            },
            {
              label: "Total Revenue",
              value: loading ? "—" : `$${revenue?.totalRevenue ?? 0}`,
              unit: "all time",
              icon: CreditCard,
              color: "text-primary",
            },
            {
              label: "Plan Templates",
              value: loading ? "—" : plans.length,
              unit: "templates",
              icon: Dumbbell,
              color: "text-primary",
            },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {s.label}
                </span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              {loading ? (
                <div className="h-8 bg-zinc-900 rounded shimmer" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                  <span className="text-xs text-zinc-600 font-bold">{s.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* Revenue Chart */}
          <div className="col-span-2 bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Monthly Revenue
              </span>
              <button
                onClick={() => router.push("/coach/revenue")}
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
              >
                Full Report <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="h-48 bg-zinc-900 rounded shimmer" />
            ) : revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8FF00" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C8FF00" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="month" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#666" }}
                    itemStyle={{ color: "#C8FF00" }}
                    formatter={(v: any) => [`$${v}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C8FF00" strokeWidth={2.5} fill="url(#rg)" dot={{ fill: "#C8FF00", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                Quick Actions
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Create Plan", icon: Dumbbell, href: "/coach/plans/builder", accent: true },
                  { label: "View Clients", icon: Users, href: "/coach/clients" },
                  { label: "Messages", icon: MessageCircle, href: "/coach/chat" },
                  { label: "Revenue", icon: TrendingUp, href: "/coach/revenue" },
                ].map((action) => (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                      action.accent
                        ? "bg-primary text-black hover:opacity-90"
                        : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Active Clients */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Active Clients
              </span>
              <button
                onClick={() => router.push("/coach/clients")}
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-900 rounded shimmer" />)}
              </div>
            ) : clients.length > 0 ? (
              <div className="space-y-2">
                {clients.slice(0, 5).map((client: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-xs font-black">
                        {client.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{client.name}</p>
                        <p className="text-[10px] text-zinc-600">{client.email}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-600 text-sm mb-3">No clients yet</p>
                <p className="text-xs text-zinc-700">Clients will appear here after subscribing</p>
              </div>
            )}
          </div>

          {/* Plan Templates */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Plan Templates
              </span>
              <button
                onClick={() => router.push("/coach/plans")}
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-900 rounded shimmer" />)}
              </div>
            ) : plans.length > 0 ? (
              <div className="space-y-2">
                {plans.slice(0, 5).map((plan: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Dumbbell className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{plan.title}</p>
                        <p className="text-[10px] text-zinc-600">{plan.durationWeeks} weeks · {plan.goal}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-600 text-sm mb-3">No templates yet</p>
                <button
                  onClick={() => router.push("/coach/plans/builder")}
                  className="text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  Create First Plan →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}