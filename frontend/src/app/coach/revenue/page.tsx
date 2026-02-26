"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  BarChart3, Users, Dumbbell, MessageCircle,
  TrendingUp, LogOut, DollarSign, CreditCard,
  CheckCircle2, XCircle, Clock
} from "lucide-react";

export default function CoachRevenue() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [revenue, setRevenue] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
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
    if (isLoading) return;
    if (!token) { router.push("/login"); return; }
    fetchAll();
  }, [token, isLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/subscriptions/revenue"),
      get("/subscriptions/my-clients"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setRevenue(results[0].value);
    if (results[1].status === "fulfilled") setSubscriptions(results[1].value);
    if (results[2].status === "fulfilled") setUnread(results[2].value);
    setLoading(false);
  };

  const monthlyData = revenue?.monthlyRevenue
    ? Object.entries(revenue.monthlyRevenue).map(([month, amount]) => ({
        month: new Date(month + "-01").toLocaleDateString("en", { month: "short", year: "2-digit" }),
        revenue: amount,
      }))
    : [];

  const allPayments = subscriptions.flatMap((sub: any) =>
    (sub.paymentHistory || []).map((p: any) => ({
      ...p,
      clientName: typeof sub.clientId === "object" ? sub.clientId.name : "Client",
      clientEmail: typeof sub.clientId === "object" ? sub.clientId.email : "",
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/coach/dashboard" },
    { label: "Clients", icon: Users, href: "/coach/clients" },
    { label: "Plans", icon: Dumbbell, href: "/coach/plans" },
    { label: "Messages", icon: MessageCircle, href: "/coach/chat", badge: unread },
    { label: "Revenue", icon: TrendingUp, href: "/coach/revenue", active: true },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

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
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
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
          <button onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-zinc-600 hover:text-white text-xs font-semibold transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Earnings Overview</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Revenue</h1>
          </div>
          <button onClick={fetchAll}
            className="px-4 py-2 border border-white/5 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-lg hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `$${revenue?.totalRevenue ?? 0}`, unit: "all time", icon: DollarSign },
            { label: "MRR", value: `$${revenue?.mrr ?? 0}`, unit: "this month", icon: TrendingUp },
            { label: "Active Subs", value: revenue?.activeSubscriptions ?? 0, unit: "clients", icon: Users },
            {
              label: "Avg Per Client",
              value: subscriptions.length > 0
                ? `$${Math.round((revenue?.mrr ?? 0) / subscriptions.length)}`
                : "$0",
              unit: "per month",
              icon: CreditCard,
            },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              {loading ? (
                <div className="h-8 bg-zinc-900 rounded shimmer" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-primary">{s.value}</span>
                  <span className="text-xs text-zinc-600 font-bold">{s.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Monthly Revenue</span>
            <span className="text-xs text-zinc-600">{monthlyData.length} months</span>
          </div>
          {loading ? (
            <div className="h-52 bg-zinc-900 rounded shimmer" />
          ) : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
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
                  itemStyle={{ color: "#C8FF00" }}
                  formatter={(v: any) => [`$${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C8FF00" strokeWidth={2.5} fill="url(#rg)" dot={{ fill: "#C8FF00", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-zinc-600 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Active Subscriptions + Payment History */}
        <div className="grid grid-cols-2 gap-4">

          {/* Active Subscriptions */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Active Subscriptions</p>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-14 bg-zinc-900 rounded shimmer" />)}
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="space-y-2">
                {subscriptions.map((sub: any, i: number) => {
                  const client = typeof sub.clientId === "object" ? sub.clientId : { name: "Client", email: "" };
                  return (
                    <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
                          {client.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{client.name}</p>
                          <p className="text-[10px] text-zinc-600">
                            Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">${sub.amount}</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${sub.status === "active" ? "bg-primary" : "bg-zinc-600"}`} />
                          <span className="text-[10px] text-zinc-600 capitalize">{sub.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm text-center py-6">No active subscriptions</p>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Payment History</p>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-900 rounded shimmer" />)}
              </div>
            ) : allPayments.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {allPayments.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-bold">{p.clientName}</p>
                      <p className="text-[10px] text-zinc-600">
                        {new Date(p.date).toLocaleDateString()} · {p.invoiceId?.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">${p.amount}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {p.status === "paid"
                          ? <CheckCircle2 className="h-3 w-3 text-primary" />
                          : p.status === "failed"
                          ? <XCircle className="h-3 w-3 text-red-400" />
                          : <Clock className="h-3 w-3 text-yellow-400" />
                        }
                        <span className={`text-[10px] capitalize ${
                          p.status === "paid" ? "text-primary" :
                          p.status === "failed" ? "text-red-400" : "text-yellow-400"
                        }`}>{p.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm text-center py-6">No payments yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}