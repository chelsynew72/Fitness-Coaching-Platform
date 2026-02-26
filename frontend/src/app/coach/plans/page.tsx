"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3, Users, Dumbbell, MessageCircle,
  TrendingUp, LogOut, Plus, Trash2, Copy,
  ChevronRight, Calendar, Target, Search
} from "lucide-react";

export default function CoachPlans() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState("");

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
      get("/plans/templates"),
      get("/subscriptions/my-clients"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setPlans(results[0].value);
    if (results[1].status === "fulfilled") setClients(results[1].value);
    if (results[2].status === "fulfilled") setUnread(results[2].value);
    setLoading(false);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Delete this plan template?")) return;
    setDeleting(planId);
    try {
      await fetch(`${API}/api/plans/templates/${planId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans((prev) => prev.filter((p) => p._id !== planId));
    } catch {
      alert("Failed to delete plan.");
    } finally {
      setDeleting(null);
    }
  };

  const handleAssign = async (planId: string, clientId: string) => {
    setAssigning(true);
    try {
      await fetch(`${API}/api/plans/templates/${planId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clientId }),
      });
      setSuccess("Plan assigned successfully!");
      setShowAssign(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      alert("Failed to assign plan.");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = plans.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.goal?.toLowerCase().includes(search.toLowerCase())
  );

  const goalColors: Record<string, string> = {
    muscle_gain: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    weight_loss: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    endurance: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    strength: "text-red-400 bg-red-400/10 border-red-400/20",
    general: "text-primary bg-primary/10 border-primary/20",
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/coach/dashboard" },
    { label: "Clients", icon: Users, href: "/coach/clients" },
    { label: "Plans", icon: Dumbbell, href: "/coach/plans", active: true },
    { label: "Messages", icon: MessageCircle, href: "/coach/chat", badge: unread },
    { label: "Revenue", icon: TrendingUp, href: "/coach/revenue" },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">

      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-white/5 flex-col py-8 px-4 sticky top-0 h-screen">
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
      <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Workout Templates
            </p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Plans</h1>
          </div>
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                ✓ {success}
              </span>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700 w-48"
              />
            </div>
            <button
              onClick={() => router.push("/coach/plans/builder")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> New Plan
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 mb-6">
          {[
            { label: "Total Templates", value: plans.length, icon: Dumbbell },
            { label: "Active Clients", value: clients.length, icon: Users },
            {
              label: "Avg Duration",
              value: plans.length > 0
                ? `${Math.round(plans.reduce((a, p) => a + (p.durationWeeks || 0), 0) / plans.length)}w`
                : "—",
              icon: Calendar,
            },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{s.label}</p>
                <p className="text-3xl font-black text-primary">{s.value}</p>
              </div>
              <s.icon className="h-8 w-8 text-zinc-800" />
            </div>
          ))}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 bg-zinc-950 border border-white/5 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {filtered.map((plan, i) => (
              <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">

                {/* Plan Header */}
                <div className="px-5 py-4 border-b border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-black uppercase tracking-tight mb-1">{plan.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{plan.description}</p>
                    </div>
                    <span className={`ml-3 shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                      goalColors[plan.goal] || goalColors.general
                    }`}>
                      {plan.goal?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {plan.durationWeeks} weeks
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Target className="h-3.5 w-3.5" />
                      {plan.weeks?.reduce((acc: number, w: any) =>
                        acc + w.days?.filter((d: any) => !d.isRestDay).length, 0
                      ) || 0} training days
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Dumbbell className="h-3.5 w-3.5" />
                      {plan.weeks?.reduce((acc: number, w: any) =>
                        acc + w.days?.reduce((a: number, d: any) =>
                          a + (d.exercises?.length || 0), 0
                        ), 0
                      ) || 0} exercises
                    </div>
                  </div>
                </div>

                {/* Week Preview */}
                <div className="px-5 py-3 border-b border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Week 1 Preview</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {plan.weeks?.[0]?.days?.map((day: any, di: number) => (
                      <div key={di} className={`px-2 py-1 rounded text-[10px] font-bold ${
                        day.isRestDay
                          ? "bg-zinc-900 text-zinc-600"
                          : "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                        {day.isRestDay ? "Rest" : `D${di + 1}`}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-white/5">
                  <button
                    onClick={() => setShowAssign(plan._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-zinc-500 hover:text-primary hover:bg-white/3 transition-colors border-r border-white/5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Assign
                  </button>
                  <button
                    onClick={() => router.push(`/coach/plans/builder?edit=${plan._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/3 transition-colors border-r border-white/5"
                  >
                    Edit <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    disabled={deleting === plan._id}
                    className="px-4 flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-white/3 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">No Plans Yet</h2>
            <p className="text-zinc-500 text-sm max-w-sm mb-6">
              {search ? "No plans match your search" : "Create your first workout plan template to assign to clients"}
            </p>
            <button
              onClick={() => router.push("/coach/plans/builder")}
              className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90"
            >
              Create First Plan
            </button>
          </div>
        )}
      </main>

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/5 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-sm font-black uppercase tracking-widest mb-5">Assign Plan to Client</h2>
            {clients.length > 0 ? (
              <div className="space-y-2">
                {clients.map((sub: any, i: number) => {
                  const client = typeof sub.clientId === "object" ? sub.clientId : { _id: sub.clientId, name: "", email: "" };
                  return (
                    <button
                      key={i}
                      onClick={() => handleAssign(showAssign, client._id)}
                      disabled={assigning}
                      className="w-full flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
                        {client.name?.[0] || "?"}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{client.name}</p>
                        <p className="text-xs text-zinc-600">{client.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm text-center py-4">No active clients</p>
            )}
            <button
              onClick={() => setShowAssign(null)}
              className="w-full mt-4 py-3 border border-white/5 bg-zinc-900 text-zinc-500 text-xs font-black uppercase tracking-widest rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}