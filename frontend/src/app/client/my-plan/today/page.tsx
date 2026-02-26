"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Circle, Clock, ChevronLeft, Trophy, RotateCcw } from "lucide-react";

interface SetLog {
  setNumber: number;
  repsCompleted: number;
  weightUsed: number;
  completed: boolean;
}

interface ExerciseLog {
  name: string;
  setsCompleted: SetLog[];
}

export default function TodaySession() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<any>(null);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // track completed sets per exercise
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  // rest timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMax, setTimerMax] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // session timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionRef = useRef<NodeJS.Timeout | null>(null);

  // rating
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState("");

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
    startSessionTimer();
    return () => {
      if (sessionRef.current) clearInterval(sessionRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token, isLoading]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const p = await get("/plans/my-plan");
      setPlan(p);
      const workout = p?.weeks?.[0]?.days?.find((d: any) => !d.isRestDay);
      setTodayWorkout(workout);

      // initialize exercise logs
      if (workout?.exercises) {
        setExerciseLogs(
          workout.exercises.map((ex: any) => ({
            name: ex.name,
            setsCompleted: Array.from({ length: ex.sets }, (_, i) => ({
              setNumber: i + 1,
              repsCompleted: ex.reps,
              weightUsed: ex.weight || 0,
              completed: false,
            })),
          }))
        );
      }
    } catch {
      router.push("/client/my-plan");
    } finally {
      setLoading(false);
    }
  };

  const startSessionTimer = () => {
    sessionRef.current = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
  };

  const startRestTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerMax(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const toggleSet = (exIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const wasCompleted = updated[exIndex].setsCompleted[setIndex].completed;
      updated[exIndex].setsCompleted[setIndex].completed = !wasCompleted;

      // start rest timer when completing a set
      if (!wasCompleted && todayWorkout?.exercises?.[exIndex]?.restSeconds) {
        startRestTimer(todayWorkout.exercises[exIndex].restSeconds);
      }

      return updated;
    });
  };

  const updateReps = (exIndex: number, setIndex: number, value: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      updated[exIndex].setsCompleted[setIndex].repsCompleted = value;
      return updated;
    });
  };

  const updateWeight = (exIndex: number, setIndex: number, value: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      updated[exIndex].setsCompleted[setIndex].weightUsed = value;
      return updated;
    });
  };

  const completedSets = exerciseLogs.reduce(
    (acc, ex) => acc + ex.setsCompleted.filter((s) => s.completed).length, 0
  );
  const totalSets = exerciseLogs.reduce(
    (acc, ex) => acc + ex.setsCompleted.length, 0
  );
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await fetch(`${API}/api/workout-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan._id,
          date: today,
          weekNumber: 1,
          dayNumber: todayWorkout.dayNumber,
          completed: completedSets === totalSets,
          durationMinutes: Math.round(sessionSeconds / 60),
          rating,
          notes,
          exercises: exerciseLogs,
        }),
      });
      if (sessionRef.current) clearInterval(sessionRef.current);
      setDone(true);
    } catch {
      alert("Failed to save workout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-600 text-sm">Loading session...</div>
    </div>;
  }

  // ── Done Screen ──────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Session Complete!</h1>
        <p className="text-zinc-500 text-sm mb-8">
          {completedSets}/{totalSets} sets completed in {formatTime(sessionSeconds)}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/client/dashboard")}
            className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push("/client/progress")}
            className="px-8 py-3 border border-white/5 bg-zinc-950 text-zinc-400 font-black uppercase tracking-widest text-sm rounded-lg hover:text-white transition-colors"
          >
            Log Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/client/my-plan")}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Plan
          </button>

          <div className="flex items-center gap-6">
            {/* Session Timer */}
            <div className="flex items-center gap-2 text-sm font-black">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="font-mono">{formatTime(sessionSeconds)}</span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-black text-primary">{progressPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Session Header */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
            Today's Session
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">
            {todayWorkout?.name}
          </h1>
          <p className="text-zinc-500 text-sm">
            {totalSets} sets · {todayWorkout?.exercises?.length} exercises
          </p>
        </div>

        {/* Rest Timer */}
        {timerActive && (
          <div className="bg-zinc-950 border border-primary/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Rest Timer</p>
                <p className="text-xl font-black font-mono text-primary">{formatTime(timerSeconds)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${((timerMax - timerSeconds) / timerMax) * 100}%` }}
                />
              </div>
              <button
                onClick={() => { setTimerActive(false); if (timerRef.current) clearInterval(timerRef.current); }}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-4 mb-8">
          {todayWorkout?.exercises?.map((ex: any, exIndex: number) => {
            const exLog = exerciseLogs[exIndex];
            const completedExSets = exLog?.setsCompleted.filter((s) => s.completed).length ?? 0;
            const allDone = completedExSets === ex.sets;

            return (
              <div
                key={exIndex}
                className={`bg-zinc-950 border rounded-xl overflow-hidden transition-all ${
                  allDone ? "border-primary/30" : "border-white/5"
                }`}
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                      allDone ? "bg-primary text-black" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      {allDone ? "✓" : exIndex + 1}
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-tight">{ex.name}</p>
                      <p className="text-[10px] text-zinc-600 capitalize">{ex.muscleGroup}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary">{completedExSets}/{ex.sets}</p>
                    <p className="text-[10px] text-zinc-600">sets done</p>
                  </div>
                </div>

                {/* Sets */}
                <div className="p-4 space-y-2">
                  {/* Column Headers */}
                  <div className="grid grid-cols-5 gap-2 px-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Set</span>
                    <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Reps</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Weight</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">Done</span>
                  </div>

                  {exLog?.setsCompleted.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`grid grid-cols-5 gap-2 items-center px-2 py-2 rounded-lg transition-all ${
                        set.completed ? "bg-primary/5 border border-primary/10" : "bg-zinc-900"
                      }`}
                    >
                      <span className="text-sm font-black text-zinc-500">{set.setNumber}</span>

                      {/* Reps input */}
                      <div className="col-span-2 flex items-center gap-2">
                        <button
                          onClick={() => updateReps(exIndex, setIndex, Math.max(0, set.repsCompleted - 1))}
                          className="w-7 h-7 rounded bg-zinc-800 text-zinc-400 hover:text-white font-black flex items-center justify-center"
                        >−</button>
                        <span className="text-sm font-black w-6 text-center">{set.repsCompleted}</span>
                        <button
                          onClick={() => updateReps(exIndex, setIndex, set.repsCompleted + 1)}
                          className="w-7 h-7 rounded bg-zinc-800 text-zinc-400 hover:text-white font-black flex items-center justify-center"
                        >+</button>
                      </div>

                      {/* Weight input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={set.weightUsed}
                          onChange={(e) => updateWeight(exIndex, setIndex, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-zinc-800 text-white text-sm font-black text-center rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-[10px] text-zinc-600">kg</span>
                      </div>

                      {/* Complete toggle */}
                      <button
                        onClick={() => toggleSet(exIndex, setIndex)}
                        className="flex justify-center"
                      >
                        {set.completed
                          ? <CheckCircle2 className="h-6 w-6 text-primary" />
                          : <Circle className="h-6 w-6 text-zinc-700 hover:text-zinc-400 transition-colors" />
                        }
                      </button>
                    </div>
                  ))}
                </div>

                {/* Rest time hint */}
                {ex.restSeconds > 0 && (
                  <div className="px-5 pb-3">
                    <button
                      onClick={() => startRestTimer(ex.restSeconds)}
                      className="text-[10px] text-zinc-600 hover:text-primary transition-colors font-bold flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" /> Start {ex.restSeconds}s rest timer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Session Rating */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Rate This Session
          </p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                  rating >= r
                    ? "bg-primary text-black"
                    : "bg-zinc-900 text-zinc-600 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this session? (optional)"
            rows={2}
            className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Finish Button */}
        <button
          onClick={handleFinish}
          disabled={submitting}
          className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Saving..." : `Finish Session · ${completedSets}/${totalSets} Sets`}
        </button>
      </div>
    </div>
  );
}