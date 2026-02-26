"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Users,
  Dumbbell,
  MessageCircle,
  TrendingUp,
  LogOut,
  Search,
  ChevronRight,
  Scale,
  Flame,
  Target,
  Activity,
} from "lucide-react";

export default function CoachClients() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const [clientDetails, setClientDetails] = useState<Record<string, any>>({});
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAll();
  }, [token, isLoading]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subs, u] = await Promise.allSettled([
        get("/subscriptions/my-clients"),
        get("/chat/unread/count"),
      ]);

      if (subs.status === "fulfilled") {
        setClients(subs.value);
        // fetch progress for each client
        subs.value.forEach(async (sub: any) => {
          const clientId = sub.clientId._id;
          try {
            const [progress, stats] = await Promise.allSettled([
              get(`/progress/client/${clientId}/summary`),
              get(`/workout-logs/client/${clientId}`),
            ]);
            setClientDetails((prev) => ({
              ...prev,
              [clientId]: {
                progress:
                  progress.status === "fulfilled" ? progress.value : null,
                logs: stats.status === "fulfilled" ? stats.value : [],
              },
            }));
          } catch {}
        });
      }
      if (u.status === "fulfilled") setUnread(u.value);
    } finally {
      setLoading(false);
    }
  };
  const filtered = clients.filter(
    (sub: any) =>
      sub.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      sub.clientId?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/coach/dashboard" },
    { label: "Clients", icon: Users, href: "/coach/clients", active: true },
    { label: "Plans", icon: Dumbbell, href: "/coach/plans" },
    {
      label: "Messages",
      icon: MessageCircle,
      href: "/coach/chat",
      badge: unread,
    },
    { label: "Revenue", icon: TrendingUp, href: "/coach/revenue" },
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
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
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
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
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
              Active Subscribers
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              My Clients
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700 w-56"
              />
            </div>
            <div className="bg-zinc-950 border border-white/5 rounded-lg px-4 py-2.5 text-sm">
              <span className="text-primary font-black">{clients.length}</span>
              <span className="text-zinc-600 ml-1">total</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 bg-zinc-950 border border-white/5 rounded-xl shimmer"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((sub: any, i: number) => {
              const client =
                typeof sub.clientId === "object"
                  ? sub.clientId
                  : { _id: sub.clientId, name: "", email: "" };
              const clientId = client._id;
              const details = clientDetails[clientId];
              const progress = details?.progress;
              const logs = details?.logs || [];
              const recentLogs = logs.slice(0, 3);

              return (
                <div
                  key={i}
                  className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  {/* Client Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black">
                        {client.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-black">{client.name || "Unknown"}</p>
                        <p className="text-xs text-zinc-600">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${sub.status === "active" ? "bg-primary" : "bg-zinc-600"}`}
                      />
                      <span className="text-[10px] font-bold uppercase text-zinc-500">
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/5">
                    {[
                      {
                        icon: Scale,
                        label: "Weight",
                        value: progress?.latestLog?.weight
                          ? `${progress.latestLog.weight}kg`
                          : "—",
                      },
                      {
                        icon: Activity,
                        label: "Mood",
                        value: progress?.averageMood
                          ? `${progress.averageMood}/5`
                          : "—",
                      },
                      {
                        icon: Flame,
                        label: "Logs",
                        value: progress?.totalLogs ?? "—",
                      },
                      {
                        icon: Target,
                        label: "Change",
                        value:
                          progress?.weightChange != null
                            ? `${progress.weightChange > 0 ? "+" : ""}${progress.weightChange}kg`
                            : "—",
                      },
                    ].map((stat, si) => (
                      <div
                        key={si}
                        className="bg-zinc-950 px-3 py-3 text-center"
                      >
                        <stat.icon className="h-3.5 w-3.5 text-zinc-600 mx-auto mb-1" />
                        <p className="text-sm font-black text-white">
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Workouts */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
                      Recent Sessions
                    </p>
                    {recentLogs.length > 0 ? (
                      <div className="space-y-1.5">
                        {recentLogs.map((log: any, li: number) => (
                          <div
                            key={li}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-zinc-500">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-600">
                                {log.durationMinutes}min
                              </span>
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${log.completed ? "bg-primary" : "bg-zinc-700"}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-700">
                        No sessions logged yet
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-white/5">
                    <button
                      onClick={() => router.push("/coach/chat")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/3 transition-colors border-r border-white/5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Message
                    </button>
                    <button
                      onClick={() => router.push(`/coach/clients/${clientId}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/3 transition-colors"
                    >
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">
              No Clients Yet
            </h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              {search
                ? "No clients match your search"
                : "Clients will appear here once they subscribe to your coaching"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
