"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  Users, UserCheck, DollarSign, TrendingUp,
  ShieldCheck, Clock, BarChart3, LogOut,
  CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  const patch = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  useEffect(() => {
    if (isLoading) return;
    if (!token) { router.push("/login"); return; }
    if (user?.role !== "admin") { router.push("/login"); return; }
    fetchAll();
  }, [token, isLoading, user]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/admin/stats"),
      get("/admin/coaches/pending"),
      get("/admin/revenue"),
    ]);
    if (results[0].status === "fulfilled") setStats(results[0].value);
    if (results[1].status === "fulfilled") setPending(results[1].value);
    if (results[2].status === "fulfilled") {
      const monthly = results[2].value.monthly || [];
      setRevenueData(monthly.map((m: any) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        revenue: m.revenue,
        payments: m.count,
      })));
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setApproving(userId);
    try {
      await patch(`/admin/coaches/${userId}/approve`);
      setPending((prev) => prev.filter((p) => p.user._id !== userId));
      setStats((prev: any) => prev ? { ...prev, pendingCoaches: prev.pendingCoaches - 1, totalCoaches: prev.totalCoaches } : prev);
    } catch {
      alert("Failed to approve coach");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Reject this coach application?")) return;
    setApproving(userId);
    try {
      await patch(`/admin/coaches/${userId}/reject`);
      setPending((prev) => prev.filter((p) => p.user._id !== userId));
    } catch {
      alert("Failed to reject coach");
    } finally {
      setApproving(null);
    }
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/admin/dashboard", active: true },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Coaches", icon: UserCheck, href: "/admin/coaches" },
    { label: "Revenue", icon: DollarSign, href: "/admin/revenue" },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col py-8 px-4 sticky top-0 h-screen">
        <div className="px-2 mb-2">
          <span className="text-xl font-black uppercase tracking-tighter">
            FIT<span className="text-primary">PRO</span>
          </span>
        </div>
        <div className="px-2 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">
            Admin Panel
          </span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                item.active
                  ? "bg-white/5 text-primary border-l-2 border-primary"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-black text-sm">
              A
            </div>
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Overview</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
          </div>
          <button onClick={fetchAll}
            className="px-4 py-2 border border-white/5 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-lg hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
            { label: "Total Coaches", value: stats?.totalCoaches ?? 0, icon: UserCheck, color: "text-blue-400" },
            { label: "Total Clients", value: stats?.totalClients ?? 0, icon: Users, color: "text-purple-400" },
            { label: "Pending Approval", value: stats?.pendingCoaches ?? 0, icon: Clock, color: "text-orange-400", alert: true },
          ].map((s, i) => (
            <div key={i} className={`bg-zinc-950 border rounded-xl p-5 ${s.alert && s.value > 0 ? "border-orange-400/30" : "border-white/5"}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              {loading ? (
                <div className="h-8 bg-zinc-900 rounded shimmer" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                  {s.alert && s.value > 0 && (
                    <AlertTriangle className="h-4 w-4 text-orange-400 ml-1" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `$${stats?.totalRevenue ?? 0}`, icon: DollarSign, color: "text-primary" },
            { label: "MRR", value: `$${stats?.mrr ?? 0}`, icon: TrendingUp, color: "text-primary" },
            { label: "Total Subscriptions", value: stats?.totalSubscriptions ?? 0, icon: ShieldCheck, color: "text-blue-400" },
            { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: CheckCircle2, color: "text-primary" },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              {loading ? (
                <div className="h-8 bg-zinc-900 rounded shimmer" />
              ) : (
                <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Revenue Over Time</p>
          {loading ? (
            <div className="h-48 bg-zinc-900 rounded shimmer" />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8FF00" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#C8FF00" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`$${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C8FF00" strokeWidth={2} fill="url(#ag)" dot={{ fill: "#C8FF00", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Pending Coach Approvals */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Pending Coach Approvals
            </p>
            {pending.length > 0 && (
              <span className="text-[10px] font-black text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded-lg">
                {pending.length} pending
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-zinc-900 rounded shimmer" />)}
            </div>
          ) : pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black">
                      {item.user.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-black">{item.user.name}</p>
                      <p className="text-xs text-zinc-600">{item.user.email}</p>
                      {item.profile && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.profile.specialties?.join(", ")} · ${item.profile.monthlyRate}/mo · {item.profile.experience}yr exp
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item.user._id)}
                      disabled={approving === item.user._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {approving === item.user._id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(item.user._id)}
                      disabled={approving === item.user._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No pending approvals</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}