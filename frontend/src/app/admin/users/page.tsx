"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Users, UserCheck, DollarSign, BarChart3,
  LogOut, Search, CheckCircle2, XCircle,
  Trash2, Shield, User
} from "lucide-react";

export default function AdminUsers() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    fetchUsers();
  }, [token, isLoading, user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (search) params.append("search", search);
      const data = await req(`/admin/users?${params}`);
      setUsers(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timeout);
  }, [search, roleFilter]);

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      await req(`/admin/users/${userId}/${isActive ? "deactivate" : "activate"}`, "PATCH");
      setUsers((prev) => prev.map((u) =>
        u._id === userId ? { ...u, isActive: !isActive } : u
      ));
    } catch { alert("Failed to update user"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionLoading(userId);
    try {
      await req(`/admin/users/${userId}`, "DELETE");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch { alert("Failed to delete user"); }
    finally { setActionLoading(null); }
  };

  const roleColors: Record<string, string> = {
    admin: "text-red-400 bg-red-400/10 border-red-400/20",
    coach: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    client: "text-primary bg-primary/10 border-primary/20",
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
    { label: "Users", icon: Users, href: "/admin/users", active: true },
    { label: "Coaches", icon: UserCheck, href: "/admin/coaches" },
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Manage</p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">All Users</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input type="text" placeholder="Search users..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700 w-56"
              />
            </div>
            <div className="flex gap-2">
              {["", "admin", "coach", "client"].map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    roleFilter === r ? "bg-primary text-black" : "bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white"
                  }`}>
                  {r || "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-white/5 bg-zinc-900/50">
            {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-zinc-900 rounded shimmer" />)}
            </div>
          ) : users.length > 0 ? (
            users.map((u, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center px-5 py-4 border-b border-white/3 hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-sm">
                    {u.role === "admin" ? <Shield className="h-4 w-4 text-red-400" /> : u.name?.[0] || "?"}
                  </div>
                  <span className="text-sm font-bold truncate">{u.name}</span>
                </div>
                <span className="text-xs text-zinc-500 truncate">{u.email}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border w-fit ${roleColors[u.role] || "text-zinc-500 bg-zinc-900 border-white/5"}`}>
                  {u.role}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-primary" : "bg-zinc-600"}`} />
                  <span className={`text-xs font-bold ${u.isActive ? "text-primary" : "text-zinc-600"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {u.role !== "admin" && (
                    <>
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        disabled={actionLoading === u._id}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          u.isActive
                            ? "text-zinc-600 hover:text-orange-400 hover:bg-orange-400/10"
                            : "text-zinc-600 hover:text-primary hover:bg-primary/10"
                        }`}
                        title={u.isActive ? "Deactivate" : "Activate"}
                      >
                        {u.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={actionLoading === u._id}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <User className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}