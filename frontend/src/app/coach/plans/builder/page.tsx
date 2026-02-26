"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft, Plus, Trash2, Save,
  Dumbbell, RotateCcw, GripVertical
} from "lucide-react";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number;
  restSeconds: number;
  notes: string;
}

interface Day {
  dayNumber: number;
  name: string;
  isRestDay: boolean;
  exercises: Exercise[];
}

interface Week {
  weekNumber: number;
  days: Day[];
}

const defaultExercise = (): Exercise => ({
  name: "",
  muscleGroup: "",
  sets: 3,
  reps: 10,
  weight: 0,
  duration: 0,
  restSeconds: 60,
  notes: "",
});

const defaultDay = (dayNumber: number): Day => ({
  dayNumber,
  name: `Day ${dayNumber}`,
  isRestDay: false,
  exercises: [defaultExercise()],
});

const defaultWeek = (weekNumber: number): Week => ({
  weekNumber,
  days: [defaultDay(1), defaultDay(2), defaultDay(3)],
});

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "legs", "glutes", "core", "cardio", "full body"
];

const GOALS = ["muscle_gain", "weight_loss", "endurance", "strength", "general"];

function BuilderContent() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("muscle_gain");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [weeks, setWeeks] = useState<Week[]>([defaultWeek(1)]);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (isLoading) return;
    if (!token) { router.push("/login"); return; }
    if (editId) loadPlan(editId);
  }, [token, isLoading]);

  const loadPlan = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/plans/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTitle(data.title || "");
      setDescription(data.description || "");
      setGoal(data.goal || "muscle_gain");
      setDurationWeeks(data.durationWeeks || 8);
      setWeeks(data.weeks || [defaultWeek(1)]);
    } catch {
      alert("Failed to load plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { alert("Plan title is required."); return; }
    setSaving(true);
    try {
      const payload = { title, description, goal, durationWeeks, weeks, isTemplate: true };
      const url = editId
        ? `${API}/api/plans/templates/${editId}`
        : `${API}/api/plans/templates`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      router.push("/coach/plans");
    } catch {
      alert("Failed to save plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Week operations
  const addWeek = () => {
    setWeeks((prev) => [...prev, defaultWeek(prev.length + 1)]);
    setActiveWeek(weeks.length);
    setActiveDay(0);
  };

  const removeWeek = (wi: number) => {
    if (weeks.length === 1) return;
    setWeeks((prev) => prev.filter((_, i) => i !== wi));
    setActiveWeek(Math.max(0, wi - 1));
    setActiveDay(0);
  };

  // Day operations
  const addDay = () => {
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? { ...w, days: [...w.days, defaultDay(w.days.length + 1)] }
        : w
    ));
    setActiveDay(weeks[activeWeek].days.length);
  };

  const removeDay = (di: number) => {
    if (weeks[activeWeek].days.length === 1) return;
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? { ...w, days: w.days.filter((_, i) => i !== di) }
        : w
    ));
    setActiveDay(Math.max(0, di - 1));
  };

  const updateDay = (di: number, field: string, value: any) => {
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? {
            ...w, days: w.days.map((d, dii) =>
              dii === di ? { ...d, [field]: value } : d
            )
          }
        : w
    ));
  };

  // Exercise operations
  const addExercise = () => {
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? {
            ...w, days: w.days.map((d, di) =>
              di === activeDay
                ? { ...d, exercises: [...d.exercises, defaultExercise()] }
                : d
            )
          }
        : w
    ));
  };

  const removeExercise = (ei: number) => {
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? {
            ...w, days: w.days.map((d, di) =>
              di === activeDay
                ? { ...d, exercises: d.exercises.filter((_, i) => i !== ei) }
                : d
            )
          }
        : w
    ));
  };

  const updateExercise = (ei: number, field: string, value: any) => {
    setWeeks((prev) => prev.map((w, wi) =>
      wi === activeWeek
        ? {
            ...w, days: w.days.map((d, di) =>
              di === activeDay
                ? {
                    ...d, exercises: d.exercises.map((ex, eii) =>
                      eii === ei ? { ...ex, [field]: value } : ex
                    )
                  }
                : d
            )
          }
        : w
    ));
  };

  const currentDay = weeks[activeWeek]?.days[activeDay];

  if (isLoading || loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/coach/plans")}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Plans
            </button>
            <div className="w-px h-4 bg-white/10" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Plan title..."
              className="bg-transparent text-lg font-black uppercase tracking-tight focus:outline-none placeholder:text-zinc-700 w-72"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTitle(""); setDescription(""); setGoal("muscle_gain");
                setDurationWeeks(8); setWeeks([defaultWeek(1)]);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-zinc-950 text-zinc-500 text-xs font-bold rounded-lg hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : editId ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-65px)]">

        {/* Left Panel — Plan Settings + Week/Day Navigation */}
        <div className="w-full lg:w-64 border-r border-white/5 flex flex-col overflow-y-auto">

          {/* Plan Settings */}
          <div className="p-4 border-b border-white/5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Plan Settings</p>

            <div>
              <label className="text-[10px] text-zinc-600 block mb-1">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 capitalize"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>{g.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-600 block mb-1">Duration (weeks)</label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                min={1}
                max={52}
                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-600 block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this plan..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 resize-none placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Weeks */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Weeks</p>
              <button onClick={addWeek}
                className="text-primary hover:opacity-70 transition-opacity">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 mb-4">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveWeek(wi); setActiveDay(0); }}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeWeek === wi
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Week {wi + 1}
                    <span className="text-zinc-600 font-normal ml-1">({w.days.length}d)</span>
                  </button>
                  {weeks.length > 1 && (
                    <button onClick={() => removeWeek(wi)} className="text-zinc-700 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Days for active week */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Days</p>
              <button onClick={addDay} className="text-primary hover:opacity-70 transition-opacity">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {weeks[activeWeek]?.days.map((d, di) => (
                <div key={di} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDay(di)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeDay === di
                        ? "bg-white/5 text-white border-l-2 border-primary"
                        : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                  >
                    <span className={d.isRestDay ? "text-zinc-600" : ""}>
                      {d.name || `Day ${di + 1}`}
                    </span>
                    {d.isRestDay && <span className="text-zinc-700 ml-1">(rest)</span>}
                  </button>
                  {weeks[activeWeek].days.length > 1 && (
                    <button onClick={() => removeDay(di)} className="text-zinc-700 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Day Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentDay && (
            <>
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="text"
                  value={currentDay.name}
                  onChange={(e) => updateDay(activeDay, "name", e.target.value)}
                  className="bg-transparent text-xl font-black uppercase tracking-tight focus:outline-none border-b border-white/10 focus:border-primary pb-1 flex-1"
                />
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentDay.isRestDay}
                    onChange={(e) => updateDay(activeDay, "isRestDay", e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  Rest Day
                </label>
              </div>

              {currentDay.isRestDay ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-5xl mb-4">😴</div>
                  <p className="text-zinc-500 font-semibold">Rest & Recovery Day</p>
                  <p className="text-zinc-700 text-sm mt-1">No exercises for this day</p>
                </div>
              ) : (
                <>
                  {/* Exercises */}
                  <div className="space-y-3 mb-4">
                    {currentDay.exercises.map((ex, ei) => (
                      <div key={ei} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">

                        {/* Exercise Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
                          <GripVertical className="h-4 w-4 text-zinc-700" />
                          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                            Exercise {ei + 1}
                          </span>
                          <button
                            onClick={() => removeExercise(ei)}
                            disabled={currentDay.exercises.length === 1}
                            className="ml-auto text-zinc-700 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Name + Muscle Group */}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1.5">
                                Exercise Name
                              </label>
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => updateExercise(ei, "name", e.target.value)}
                                placeholder="e.g. Bench Press"
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1.5">
                                Muscle Group
                              </label>
                              <select
                                value={ex.muscleGroup}
                                onChange={(e) => updateExercise(ei, "muscleGroup", e.target.value)}
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 capitalize"
                              >
                                <option value="">Select...</option>
                                {MUSCLE_GROUPS.map((mg) => (
                                  <option key={mg} value={mg}>{mg}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Sets, Reps, Weight, Rest */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                              { label: "Sets", field: "sets", min: 1, max: 10 },
                              { label: "Reps", field: "reps", min: 1, max: 100 },
                              { label: "Weight (kg)", field: "weight", min: 0, max: 500 },
                              { label: "Rest (sec)", field: "restSeconds", min: 0, max: 600 },
                            ].map((f) => (
                              <div key={f.field}>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1.5">
                                  {f.label}
                                </label>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateExercise(ei, f.field, Math.max(f.min, (ex[f.field as keyof Exercise] as number) - 1))}
                                    className="w-7 h-9 rounded-l-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white font-black flex items-center justify-center"
                                  >−</button>
                                  <input
                                    type="number"
                                    value={ex[f.field as keyof Exercise] as number}
                                    onChange={(e) => updateExercise(ei, f.field, parseFloat(e.target.value) || 0)}
                                    className="flex-1 bg-zinc-900 border-y border-white/5 h-9 text-center text-sm font-black focus:outline-none focus:border-primary/50 w-0"
                                  />
                                  <button
                                    onClick={() => updateExercise(ei, f.field, Math.min(f.max, (ex[f.field as keyof Exercise] as number) + 1))}
                                    className="w-7 h-9 rounded-r-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white font-black flex items-center justify-center"
                                  >+</button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1.5">
                              Notes (optional)
                            </label>
                            <input
                              type="text"
                              value={ex.notes}
                              onChange={(e) => updateExercise(ei, "notes", e.target.value)}
                              placeholder="e.g. Focus on controlled descent"
                              className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Exercise Button */}
                  <button
                    onClick={addExercise}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/10 rounded-xl text-sm font-bold text-zinc-600 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Exercise
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanBuilder() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <BuilderContent />
    </Suspense>
  );
}