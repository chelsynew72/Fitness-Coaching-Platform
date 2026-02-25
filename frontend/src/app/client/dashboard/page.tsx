"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import {
  Flame, Dumbbell, Scale, Target, Bell,
  ChevronRight, LogOut, BarChart3, Apple,
  MessageCircle, CreditCard, Calendar
} from "lucide-react";

export default function ClientDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [weightChart, setWeightChart] = useState<any[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
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

    if (!token) {
      router.push("/login");
      return;
    }
    fetchAll();
  }, [token, isLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/workout-logs/stats"),
      get("/progress/summary"),
      get("/progress/charts/weight"),
      get("/plans/my-plan"),
      get("/subscriptions/my-subscription"),
      get("/chat/unread/count"),
    ]);

    if (results[0].status === "fulfilled") setStats(results[0].value);
    if (results[1].status === "fulfilled") setSummary(results[1].value);
    if (results[2].status === "fulfilled") setWeightChart(results[2].value);
    if (results[3].status === "fulfilled") setPlan(results[3].value);
    if (results[4].status === "fulfilled") setSubscription(results[4].value);
    if (results[5].status === "fulfilled") setUnread(results[5].value);
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const todayWorkout = plan?.weeks?.[0]?.days?.find((d: any) => !d.isRestDay);
  const weightChange = summary?.weightChange ?? 0;
  const weeklyPct = stats
    ? Math.min(Math.round((stats.completedWorkouts / Math.max(stats.totalWorkouts, 1)) * 100), 100)
    : 0;

  const chartData = weightChart.map((d: any, i: number) => ({
    day: `Day ${i + 1}`,
    weight: d.weight,
  }));

  const radialData = [{ value: weeklyPct, fill: "#C8FF00" }];

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard", active: true },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col py-8 px-4 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-2 mb-10">
          <span className="text-xl font-black uppercase tracking-tighter">
            FIT<span className="text-primary">PRO</span>
          </span>
        </div>

        {/* Nav */}
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

        {/* User + logout */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
              {user?.name?.[0] || "?"}
            </div>
            <div>
              <div className="text-xs font-bold">{user?.name}</div>
              <div className="text-[10px] text-zinc-600 uppercase">Client</div>
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
              {greeting}
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              {loading ? "Loading..." : user?.name}
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
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Current Streak",
              value: stats?.currentStreak ?? 0,
              unit: "days",
              icon: Flame,
              color: "text-primary",
            },
            {
              label: "Workouts Done",
              value: stats?.completedWorkouts ?? 0,
              unit: "total",
              icon: Dumbbell,
              color: "text-primary",
            },
            {
              label: "Weight Change",
              value: `${weightChange > 0 ? "+" : ""}${weightChange}`,
              unit: "kg",
              icon: Scale,
              color: weightChange <= 0 ? "text-primary" : "text-orange-400",
            },
            {
              label: "Completion Rate",
              value: stats?.completionRate ?? 0,
              unit: "%",
              icon: Target,
              color: "text-primary",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-white/5 rounded-xl p-5"
            >
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

          {/* Today's Session */}
          <div className="col-span-2 bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Today's Session
              </span>
              <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>

            {loading ? (
              <div className="p-6"><div className="h-24 bg-zinc-900 rounded shimmer" /></div>
            ) : todayWorkout ? (
              <div className="p-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                  {todayWorkout.name}
                </h2>
                <div className="flex gap-6 mb-6">
                  <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {todayWorkout.exercises?.length * 5 || 45} min
                  </span>
                  <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                    <Dumbbell className="h-3.5 w-3.5" />
                    {todayWorkout.exercises?.length || 0} exercises
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                  {todayWorkout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3"
                    >
                      <span className="text-sm font-semibold">{ex.name}</span>
                      <span className="text-xs text-zinc-500">
                        {ex.sets}×{ex.reps} @ {ex.weight}kg
                      </span>
                    </div>
                  ))}
                  {todayWorkout.exercises?.length > 3 && (
                    <p className="text-xs text-zinc-600 text-center py-1">
                      +{todayWorkout.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>

                <button
                  onClick={() => router.push("/client/my-plan/today")}
                  className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity rounded-lg"
                >
                  Start Session →
                </button>
              </div>
            ) : (
              <div className="p-6 text-center py-12">
                <div className="text-4xl mb-3"></div>
                <p className="text-zinc-400 font-semibold">Rest day — recovery is progress!</p>
                <p className="text-zinc-600 text-sm mt-1">No plan assigned yet</p>
              </div>
            )}
          </div>

          {/* Weekly Goal */}
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                  Weekly Goal
                </p>
                {loading ? (
                  <div className="h-10 w-20 bg-zinc-900 rounded shimmer" />
                ) : (
                  <>
                    <p className="text-4xl font-black text-primary">{weeklyPct}%</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {stats?.completedWorkouts ?? 0} of {stats?.totalWorkouts ?? 0} sessions
                    </p>
                  </>
                )}
              </div>
              <RadialBarChart width={80} height={80} innerRadius={28} outerRadius={40} data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#1a1a1a" }} />
              </RadialBarChart>
            </div>

            {/* Subscription */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                Subscription
              </p>
              {loading ? (
                <div className="h-16 bg-zinc-900 rounded shimmer" />
              ) : subscription ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${subscription.status === "active" ? "bg-primary" : "bg-orange-400"}`} />
                    <span className="text-sm font-bold capitalize">{subscription.status}</span>
                  </div>
                  <p className="text-2xl font-black text-primary">${subscription.amount}<span className="text-xs text-zinc-600 font-normal">/mo</span></p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <div>
                  <p className="text-sm text-zinc-600 mb-3">No active subscription</p>
                  <button
                    onClick={() => router.push("/coaches")}
                    className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
                  >
                    Find a Coach <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Weight Chart */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Weight Trend
              </span>
              <span className="text-[10px] text-zinc-600">
                Last {weightChart.length} logs
              </span>
            </div>
            {loading ? (
              <div className="h-36 bg-zinc-900 rounded shimmer" />
            ) : chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8FF00" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C8FF00" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="day" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#666" }}
                    itemStyle={{ color: "#C8FF00" }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#C8FF00" strokeWidth={2} fill="url(#wg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-36 flex items-center justify-center text-zinc-600 text-sm">
                Log your weight to see trends
              </div>
            )}
          </div>

          {/* Progress Summary */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Progress Summary
              </span>
              <button
                onClick={() => router.push("/client/progress")}
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {loading ? (
              <div className="h-36 bg-zinc-900 rounded shimmer" />
            ) : summary?.totalLogs > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Total check-ins</span>
                  <span className="text-sm font-black text-white">{summary.totalLogs}</span>
                </div>

                {[
                  { label: "Avg Mood", value: summary.averageMood, max: 5, color: "bg-primary" },
                  { label: "Avg Energy", value: summary.averageEnergy, max: 5, color: "bg-orange-400" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-zinc-500">{item.label}</span>
                      <span className="text-xs font-bold text-white">{item.value}/5</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}

                {summary.latestLog && (
                  <div className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3 mt-2">
                    <span className="text-xs text-zinc-500">Latest Weight</span>
                    <span className="text-lg font-black text-primary">
                      {summary.latestLog.weight} kg
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center gap-2">
                <p className="text-zinc-600 text-sm">No progress logged yet</p>
                <button
                  onClick={() => router.push("/client/progress")}
                  className="text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  Log Progress →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}