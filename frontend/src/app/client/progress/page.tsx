"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  BarChart3, Dumbbell, Target, Apple,
  MessageCircle, CreditCard, LogOut,
  Scale, TrendingDown, Activity, Plus, X
} from "lucide-react";

export default function ProgressPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<any>(null);
  const [weightChart, setWeightChart] = useState<any[]>([]);
  const [moodChart, setMoodChart] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    bodyFatPercentage: "",
    mood: 4,
    energyLevel: 3,
    notes: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
    },
  });

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
      get("/progress/summary"),
      get("/progress/charts/weight"),
      get("/progress/charts/mood"),
      get("/progress"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setSummary(results[0].value);
    if (results[1].status === "fulfilled") setWeightChart(results[1].value);
    if (results[2].status === "fulfilled") setMoodChart(results[2].value);
    if (results[3].status === "fulfilled") setLogs(results[3].value);
    if (results[4].status === "fulfilled") setUnread(results[4].value);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        date: form.date,
        mood: form.mood,
        energyLevel: form.energyLevel,
        notes: form.notes,
      };
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.bodyFatPercentage) payload.bodyFatPercentage = parseFloat(form.bodyFatPercentage);

      const measurements: any = {};
      Object.entries(form.measurements).forEach(([k, v]) => {
        if (v) measurements[k] = parseFloat(v);
      });
      if (Object.keys(measurements).length > 0) payload.measurements = measurements;

      await fetch(`${API}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setShowForm(false);
      fetchAll();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Failed to save progress. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const weightData = weightChart.map((d: any, i: number) => ({
    day: `${i + 1}`,
    weight: d.weight,
    date: new Date(d.date).toLocaleDateString(),
  }));

  const moodData = moodChart.map((d: any, i: number) => ({
    day: `${i + 1}`,
    mood: d.mood,
    energy: d.energy,
    date: new Date(d.date).toLocaleDateString(),
  }));

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress", active: true },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
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
              <div className="text-[10px] text-zinc-600 uppercase">Client</div>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Body Metrics</p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Progress</h1>
          </div>
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                ✓ Progress saved!
              </span>
            )}
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Log Today
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
          {[
            {
              label: "Total Logs",
              value: summary?.totalLogs ?? 0,
              unit: "check-ins",
              icon: Activity,
            },
            {
              label: "Weight Change",
              value: `${(summary?.weightChange ?? 0) > 0 ? "+" : ""}${summary?.weightChange ?? 0}`,
              unit: "kg",
              icon: TrendingDown,
              color: (summary?.weightChange ?? 0) <= 0 ? "text-primary" : "text-orange-400",
            },
            {
              label: "Avg Mood",
              value: summary?.averageMood ?? 0,
              unit: "/ 5",
              icon: Activity,
            },
            {
              label: "Avg Energy",
              value: summary?.averageEnergy ?? 0,
              unit: "/ 5",
              icon: Scale,
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
                  <span className={`text-3xl font-black ${s.color || "text-primary"}`}>{s.value}</span>
                  <span className="text-xs text-zinc-600 font-bold">{s.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 mb-6">

          {/* Weight Chart */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weight Trend</span>
              {summary?.latestLog && (
                <span className="text-sm font-black text-primary">{summary.latestLog.weight} kg</span>
              )}
            </div>
            {loading ? (
              <div className="h-44 bg-zinc-900 rounded shimmer" />
            ) : weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weightData}>
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
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
                    itemStyle={{ color: "#C8FF00" }}
                    formatter={(v: any) => [`${v} kg`, "Weight"]}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#C8FF00" strokeWidth={2} fill="url(#wg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-zinc-600 text-sm">
                Log at least 2 entries to see trend
              </div>
            )}
          </div>

          {/* Mood & Energy Chart */}
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Mood & Energy</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Mood
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <div className="w-2 h-2 rounded-full bg-orange-400" /> Energy
                </span>
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-zinc-900 rounded shimmer" />
            ) : moodData.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="day" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
                  />
                  <Line type="monotone" dataKey="mood" stroke="#C8FF00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energy" stroke="#FF6B00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-zinc-600 text-sm">
                Log at least 2 entries to see trend
              </div>
            )}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Recent Logs</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-900 rounded shimmer" />)}
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 8).map((log: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 font-bold w-24">
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    {log.weight && (
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="text-sm font-black text-white">{log.weight} kg</span>
                      </div>
                    )}
                    {log.bodyFatPercentage && (
                      <div className="text-xs text-zinc-500">{log.bodyFatPercentage}% BF</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-600">Mood</span>
                      <span className="text-xs font-black text-primary">{log.mood}/5</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-600">Energy</span>
                      <span className="text-xs font-black text-orange-400">{log.energyLevel}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-zinc-600 text-sm mb-3">No progress logged yet</p>
              <button onClick={() => setShowForm(true)}
                className="text-[10px] font-black uppercase tracking-widest text-primary">
                Log Your First Entry →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Log Progress Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/5 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest">Log Progress</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-600 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Date */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Date</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Weight & Body Fat */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Weight (kg)</label>
                  <input type="number" placeholder="85.0" value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Body Fat (%)</label>
                  <input type="number" placeholder="18.0" value={form.bodyFatPercentage}
                    onChange={(e) => setForm({ ...form, bodyFatPercentage: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">
                  Measurements (cm) — optional
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["chest", "waist", "hips", "arms", "thighs"].map((m) => (
                    <div key={m}>
                      <label className="text-[10px] text-zinc-600 capitalize block mb-1">{m}</label>
                      <input type="number" placeholder="0"
                        value={form.measurements[m as keyof typeof form.measurements]}
                        onChange={(e) => setForm({
                          ...form,
                          measurements: { ...form.measurements, [m]: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                  Mood — {form.mood}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setForm({ ...form, mood: r })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                        form.mood >= r ? "bg-primary text-black" : "bg-zinc-900 text-zinc-600"
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                  Energy Level — {form.energyLevel}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setForm({ ...form, energyLevel: r })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                        form.energyLevel >= r ? "bg-orange-400 text-black" : "bg-zinc-900 text-zinc-600"
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="How are you feeling today?"
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}