"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronRight, ChevronDown, ChevronUp,
  Dumbbell, Clock, BarChart3, MessageCircle,
  Target, Apple, CreditCard, LogOut,
  Play, RotateCcw, Users
} from "lucide-react";

export default function MyPlan() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeWeek, setActiveWeek] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [unread, setUnread] = useState(0);

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
    fetchPlan();
  }, [token, isLoading]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const [p, u] = await Promise.allSettled([
        get("/plans/my-plan"),
        get("/chat/unread/count"),
      ]);
      if (p.status === "fulfilled") setPlan(p.value);
      else setError("No plan assigned yet. Ask your coach to assign you a plan.");
      if (u.status === "fulfilled") setUnread(u.value);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black" />;

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan", active: true },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
  ];

  const currentWeek = plan?.weeks?.[activeWeek];
  const totalExercises = currentWeek?.days?.reduce(
    (acc: number, d: any) => acc + (d.exercises?.length || 0), 0
  ) ?? 0;

  const goalColors: Record<string, string> = {
    muscle_gain: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    weight_loss: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    endurance: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    strength: "text-red-400 bg-red-400/10 border-red-400/20",
    general: "text-primary bg-primary/10 border-primary/20",
  };

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
      <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Training Program
            </p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">
              My Plan
            </h1>
          </div>
          <button
            onClick={() => router.push("/client/my-plan/today")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4" /> Start Today's Session
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-zinc-950 border border-white/5 rounded-xl shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">No Plan Yet</h2>
            <p className="text-zinc-500 text-sm max-w-sm">{error}</p>
          </div>
        ) : plan ? (
          <>
            {/* Plan Overview Card */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                      {plan.title}
                    </h2>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                      goalColors[plan.goal] || goalColors.general
                    }`}>
                      {plan.goal?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm max-w-lg mb-4">
                    {plan.description}
                  </p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Duration</p>
                      <p className="text-sm font-black text-white">{plan.durationWeeks} Weeks</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">This Week</p>
                      <p className="text-sm font-black text-white">{currentWeek?.days?.length || 0} Days</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Exercises</p>
                      <p className="text-sm font-black text-white">{totalExercises} Total</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={fetchPlan}
                  className="text-zinc-600 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Week Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {plan.weeks?.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => { setActiveWeek(i); setExpandedDay(0); }}
                  className={`shrink-0 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeWeek === i
                      ? "bg-primary text-black"
                      : "bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white"
                  }`}
                >
                  Week {i + 1}
                </button>
              ))}
            </div>

            {/* Days */}
            <div className="space-y-3">
              {currentWeek?.days?.map((day: any, dayIndex: number) => (
                <div
                  key={dayIndex}
                  className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden"
                >
                  {/* Day Header */}
                  <button
                    onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${
                        day.isRestDay
                          ? "bg-zinc-900 text-zinc-600"
                          : "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                        {dayIndex + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-tight">
                          {day.name || `Day ${dayIndex + 1}`}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                          {day.isRestDay ? "Rest Day" : `${day.exercises?.length || 0} exercises`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!day.isRestDay && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/client/my-plan/today");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90"
                        >
                          <Play className="h-3 w-3" /> Start
                        </button>
                      )}
                      {expandedDay === dayIndex
                        ? <ChevronUp className="h-4 w-4 text-zinc-500" />
                        : <ChevronDown className="h-4 w-4 text-zinc-500" />
                      }
                    </div>
                  </button>

                  {/* Day Content */}
                  {expandedDay === dayIndex && (
                    <div className="px-6 pb-5 border-t border-white/5">
                      {day.isRestDay ? (
                        <div className="py-8 text-center">
                          <div className="text-3xl mb-2">😴</div>
                          <p className="text-zinc-500 text-sm font-semibold">Recovery Day</p>
                          <p className="text-zinc-700 text-xs mt-1">
                            Rest and recovery is essential for muscle growth
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-4">
                          {/* Exercise Table Header */}
                          <div className="grid grid-cols-5 gap-4 px-4 py-2">
                            <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Exercise</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">Sets</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">Reps</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">Weight</span>
                          </div>

                          {day.exercises?.map((ex: any, exIndex: number) => (
                            <div
                              key={exIndex}
                              className="grid grid-cols-5 gap-4 items-center bg-zinc-900 rounded-lg px-4 py-3"
                            >
                              <div className="col-span-2 flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
                                  <Dumbbell className="h-3 w-3 text-zinc-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{ex.name}</p>
                                  {ex.muscleGroup && (
                                    <p className="text-[10px] text-zinc-600 capitalize">{ex.muscleGroup}</p>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm font-black text-primary text-center">{ex.sets}</p>
                              <p className="text-sm font-black text-center">{ex.reps}</p>
                              <div className="text-center">
                                {ex.weight ? (
                                  <span className="text-sm font-black">{ex.weight}<span className="text-xs text-zinc-600">kg</span></span>
                                ) : ex.duration ? (
                                  <span className="text-sm font-black flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3 text-zinc-500" />{ex.duration}s
                                  </span>
                                ) : (
                                  <span className="text-zinc-600">—</span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Rest time */}
                          {day.exercises?.[0]?.restSeconds && (
                            <div className="flex items-center gap-2 px-4 pt-2">
                              <Clock className="h-3.5 w-3.5 text-zinc-600" />
                              <span className="text-xs text-zinc-600">
                                {day.exercises[0].restSeconds}s rest between sets
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}