"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft, Activity, Scale, Flame, Target,
  TrendingUp, TrendingDown, Calendar, Dumbbell, MessageCircle
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [client, setClient] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "workouts">("overview");

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed: ${path}`);
    return res.json();
  };

  useEffect(() => {
    if (!token || !clientId) return;
    const load = async () => {
      try {
        const [subs, sum, logs, wlogs] = await Promise.allSettled([
          get(`/subscriptions/my-clients`),
          get(`/progress/client/${clientId}/summary`),
          get(`/progress/client/${clientId}`),
          get(`/workout-logs/client/${clientId}`),
        ]);

        if (subs.status === "fulfilled") {
          const sub = subs.value.find((s: any) =>
            (s.clientId?._id || s.clientId) === clientId
          );
          if (sub) setClient(sub.clientId);
        }

        if (sum.status === "fulfilled") setSummary(sum.value);
        if (logs.status === "fulfilled") setProgressLogs(logs.value);
        if (wlogs.status === "fulfilled") setWorkoutLogs(wlogs.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, clientId]);

  const weightData = progressLogs
    .filter((l) => l.weight > 0)
    .slice(-12)
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      weight: l.weight,
    }));

  const moodData = progressLogs
    .filter((l) => l.mood > 0)
    .slice(-10)
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      mood: l.mood,
      energy: l.energyLevel,
    }));

  const workoutsByWeek = workoutLogs.slice(-8).map((l) => ({
    date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    exercises: l.exercises?.length || 0,
    duration: l.duration || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { icon: Scale, label: "Current Weight", value: summary?.latestLog?.weight ? `${summary.latestLog.weight}kg` : "—" },
    { icon: TrendingDown, label: "Weight Change", value: summary?.weightChange != null ? `${summary.weightChange > 0 ? "+" : ""}${summary.weightChange}kg` : "—", color: summary?.weightChange < 0 ? "text-primary" : "text-red-400" },
    { icon: Activity, label: "Avg Mood", value: summary?.averageMood ? `${summary.averageMood}/5` : "—" },
    { icon: Flame, label: "Avg Energy", value: summary?.averageEnergy ? `${summary.averageEnergy}/5` : "—" },
    { icon: Calendar, label: "Total Logs", value: summary?.totalLogs ?? "—" },
    { icon: Dumbbell, label: "Workouts", value: workoutLogs.length },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4 sticky top-0 bg-black/95 backdrop-blur z-10">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black">
            {client?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="font-black text-lg">{client?.name || "Client"}</h1>
            <p className="text-xs text-zinc-500">{client?.email}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => router.push("/coach/chat")}
            className="flex items-center gap-2 px-3 py-2 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Message
          </button>
          <button
            onClick={() => router.push("/coach/plans")}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <Dumbbell className="h-4 w-4" /> Assign Plan
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 lg:gap-4 mb-8">
          {stats.map((st, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-4 text-center">
              <st.icon className="h-4 w-4 text-zinc-600 mx-auto mb-2" />
              <div className={`text-xl font-black mb-1 ${st.color || "text-white"}`}>{st.value}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/5">
          {(["overview", "progress", "workouts"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-zinc-500 hover:text-white"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weight Chart */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Weight Trend</h3>
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="weight" stroke="#C8FF00" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">No weight data yet</div>
              )}
            </div>

            {/* Mood/Energy Chart */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Mood & Energy</h3>
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis domain={[1, 5]} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mood" stroke="#C8FF00" strokeWidth={2} dot={false} name="Mood" />
                    <Line type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={2} dot={false} name="Energy" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">No mood data yet</div>
              )}
            </div>

            {/* Recent Workout Logs */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 lg:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Recent Workouts</h3>
              {workoutLogs.length > 0 ? (
                <div className="space-y-2">
                  {workoutLogs.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-bold">{log.planTitle || "Workout"}</p>
                        <p className="text-xs text-zinc-600">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs font-black text-primary">{log.exercises?.length || 0}</p>
                          <p className="text-[10px] text-zinc-600">exercises</p>
                        </div>
                        <div>
                          <p className="text-xs font-black">{log.overallRating || "—"}/5</p>
                          <p className="text-[10px] text-zinc-600">rating</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-600 text-sm">No workouts logged yet</div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            {progressLogs.length > 0 ? progressLogs.slice().reverse().map((log: any, i: number) => (
              <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black">{new Date(log.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Day {i + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {log.weight > 0 && <div className="bg-black/40 rounded-lg p-3 text-center"><p className="text-lg font-black text-primary">{log.weight}kg</p><p className="text-[10px] text-zinc-600">Weight</p></div>}
                  {log.mood > 0 && <div className="bg-black/40 rounded-lg p-3 text-center"><p className="text-lg font-black">{log.mood}/5</p><p className="text-[10px] text-zinc-600">Mood</p></div>}
                  {log.energyLevel > 0 && <div className="bg-black/40 rounded-lg p-3 text-center"><p className="text-lg font-black">{log.energyLevel}/5</p><p className="text-[10px] text-zinc-600">Energy</p></div>}
                  {log.sleepHours > 0 && <div className="bg-black/40 rounded-lg p-3 text-center"><p className="text-lg font-black">{log.sleepHours}h</p><p className="text-[10px] text-zinc-600">Sleep</p></div>}
                </div>
                {log.notes && <p className="text-xs text-zinc-500 mt-3 italic">"{log.notes}"</p>}
              </div>
            )) : (
              <div className="text-center py-16 text-zinc-600">No progress logs yet</div>
            )}
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === "workouts" && (
          <div className="space-y-4">
            {workoutsByWeek.length > 0 && (
              <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Workout Activity</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={workoutsByWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                    <Bar dataKey="exercises" fill="#C8FF00" radius={[4, 4, 0, 0]} name="Exercises" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {workoutLogs.length > 0 ? workoutLogs.slice().reverse().map((log: any, i: number) => (
              <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black">{log.planTitle || "Workout Session"}</p>
                  <p className="text-xs text-zinc-600">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center"><p className="text-lg font-black text-primary">{log.exercises?.length || 0}</p><p className="text-[10px] text-zinc-600">Exercises</p></div>
                  <div className="text-center"><p className="text-lg font-black">{log.duration || "—"}</p><p className="text-[10px] text-zinc-600">Minutes</p></div>
                  <div className="text-center"><p className="text-lg font-black">{log.overallRating || "—"}/5</p><p className="text-[10px] text-zinc-600">Rating</p></div>
                </div>
                {log.notes && <p className="text-xs text-zinc-500 italic">"{log.notes}"</p>}
              </div>
            )) : (
              <div className="text-center py-16 text-zinc-600">No workout logs yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
