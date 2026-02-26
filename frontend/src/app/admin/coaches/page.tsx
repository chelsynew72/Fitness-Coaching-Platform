"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Users, UserCheck, DollarSign, BarChart3,
  LogOut, CheckCircle2, XCircle, Clock
} from "lucide-react";

export default function AdminCoaches() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [pending, setPending] = useState<any[]>([]);
  const [allCoaches, setAllCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const req = async (path: string, method = "GET") => {
    const res = await fetch(`${API}/api${path}`, {
      method,
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
      req("/admin/coaches/pending"),
      req("/admin/users?role=coach"),
    ]);
    if (results[0].status === "fulfilled") setPending(results[0].value);
    if (results[1].status === "fulfilled") setAllCoaches(results[1].value);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setApproving(userId);
    try {
      await req(`/admin/coaches/${userId}/approve`, "PATCH");
      setPending((prev) => prev.filter((p) => p.user._id !== userId));
      setAllCoaches((prev) => prev.map((c) =>
        c._id === userId ? { ...c, isApproved: true } : c
      ));
    } catch { alert("Failed to approve"); }
    finally { setApproving(null); }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Reject this coach?")) return;
    setApproving(userId);
    try {
      await req(`/admin/coaches/${userId}/reject`, "PATCH");
      setPending((prev) => prev.filter((p) => p.user._id !== userId));
      setAllCoaches((prev) => prev.filter((c) => c._id !== userId));
    } catch { alert("Failed to reject"); }
    finally { setApproving(null); }
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Coaches", icon: UserCheck, href: "/admin/coaches", active: true },
    { label: "Revenue", icon: DollarSign, href: "/admin/revenue" },
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
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Manage</p>
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Coaches</h1>
        </div>

        {/* Pending Approvals */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pending Approvals</p>
            {pending.length > 0 && (
              <span className="text-[10px] font-black text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded-lg flex items-center gap-1">
                <Clock className="h-3 w-3" /> {pending.length} waiting
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-zinc-900 rounded shimmer" />)}</div>
          ) : pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-900 border border-orange-400/10 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-lg">
                      {item.user.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-black">{item.user.name}</p>
                      <p className="text-xs text-zinc-600">{item.user.email}</p>
                      {item.profile && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-zinc-500">{item.profile.experience}yr exp</span>
                          <span className="text-xs text-primary font-bold">${item.profile.monthlyRate}/mo</span>
                          <span className="text-xs text-zinc-500">{item.profile.specialties?.slice(0, 3).join(", ")}</span>
                        </div>
                      )}
                      {item.profile?.bio && (
                        <p className="text-xs text-zinc-600 mt-1 max-w-md line-clamp-1">{item.profile.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApprove(item.user._id)} disabled={approving === item.user._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {approving === item.user._id ? "..." : "Approve"}
                    </button>
                    <button onClick={() => handleReject(item.user._id)} disabled={approving === item.user._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No pending approvals — all caught up!</p>
            </div>
          )}
        </div>

        {/* All Coaches */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">All Coaches ({allCoaches.length})</p>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-900 rounded shimmer" />)}</div>
          ) : allCoaches.length > 0 ? (
            <div className="space-y-2">
              {allCoaches.map((coach, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-sm">
                      {coach.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{coach.name}</p>
                      <p className="text-xs text-zinc-600">{coach.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg border ${
                      coach.isApproved
                        ? "text-primary bg-primary/10 border-primary/20"
                        : "text-orange-400 bg-orange-400/10 border-orange-400/20"
                    }`}>
                      {coach.isApproved
                        ? <><CheckCircle2 className="h-3 w-3" /> Approved</>
                        : <><Clock className="h-3 w-3" /> Pending</>
                      }
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${coach.isActive ? "bg-primary" : "bg-zinc-600"}`} />
                    <span className="text-xs text-zinc-600">{new Date(coach.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm text-center py-8">No coaches registered yet</p>
          )}
        </div>
      </main>
    </div>
  );
}