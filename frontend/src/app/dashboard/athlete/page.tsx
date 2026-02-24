"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Dumbbell, Bell, 
  Home as HomeIcon, Utensils, User, Plus, Clock, Activity
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AthleteData {
  stats: {
    totalWorkouts: number;
    completedWorkouts: number;
    completionRate: number;
    currentStreak: number;
  };
  currentPlan: {
    name: string;
    coach: string;
    exercises: number;
    id?: string;
  };
  weightHistory: { date: string; weight: number }[];
  progressSummary: {
    weightChange: number;
    averageEnergy: number;
    currentWeight: number;
    targetWeight: number;
  };
}

export default function AthleteDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAthleteData = useCallback(async () => {
    try {
      const [statsRes, planRes, chartRes, profileRes] = await Promise.all([
        fetch("http://localhost:4000/api/workout-logs/stats", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:4000/api/plans/my-plan", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:4000/api/progress/charts/weight", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:4000/api/clients/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const stats = await statsRes.json();
      const currentPlan = await planRes.json();
      const weightChart = await chartRes.json();
      const profile = await profileRes.json();

      setData({
        stats: stats.totalWorkouts !== undefined ? stats : { totalWorkouts: 48, completedWorkouts: 36, completionRate: 75, currentStreak: 12 },
        currentPlan: currentPlan.id ? currentPlan : { name: "Upper Body Power", coach: "Marcus Vane", exercises: 8 },
        weightHistory: Array.isArray(weightChart) ? weightChart : [
          { date: 'Day 1', weight: 85 },
          { date: 'Day 5', weight: 84.5 },
          { date: 'Day 10', weight: 84.8 },
          { date: 'Day 15', weight: 83.5 },
          { date: 'Day 20', weight: 83.2 },
          { date: 'Day 25', weight: 83.8 },
          { date: 'Today', weight: 82.6 },
        ],
        progressSummary: {
          weightChange: -2.4,
          averageEnergy: 8,
          currentWeight: profile.currentWeight || 82.6,
          targetWeight: profile.targetWeight || 80.0
        }
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching athlete data:", error);
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (!authLoading && token && isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAthleteData();
    }
  }, [authLoading, token, router, fetchAthleteData, isLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white font-sans pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between p-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#E6D5C3]">
            <Image 
              src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop"} 
              alt="Avatar" 
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Good Morning</h2>
            <p className="text-xl font-black">{user?.name || "Alex Rivera"}</p>
          </div>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5">
          <Bell className="h-6 w-6 text-zinc-400" />
        </button>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-3 gap-3 px-6 mt-4">
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900/50 border border-white/5 p-4">
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Streak</span>
          <p className="text-xl font-black text-primary">{data?.stats.currentStreak || 12} <span className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Days</span></p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900/50 border border-white/5 p-4">
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Completed</span>
          <p className="text-xl font-black">{data?.stats.totalWorkouts || 48} <span className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Tot</span></p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900/50 border border-white/5 p-4">
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Weight</span>
          <p className="text-xl font-black text-primary">{data?.progressSummary.weightChange || -2.4} <span className="text-[10px] text-zinc-500 font-bold ml-1 uppercase">Kg</span></p>
        </div>
      </section>

      {/* Current Session Hero */}
      <section className="p-6 mt-4">
        <div className="group relative h-80 overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900 shadow-2xl">
          <Image 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Workout"
            fill
            className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="inline-flex items-center self-start rounded-md bg-primary px-2 py-1 mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-black">Today&apos;s Session</span>
            </div>
            <h3 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter mb-4 italic">
              {data?.currentPlan.name || "Upper Body Power"}
            </h3>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-zinc-400 text-xs font-bold uppercase">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> 45 MIN
                </div>
                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4" /> ADVANCED
                </div>
              </div>
              
              <button className="flex h-20 w-32 items-center justify-center rounded-2xl bg-primary text-black transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(204,255,0,0.3)]">
                <span className="text-xs font-black uppercase tracking-tighter leading-tight text-center">Start<br/>Session</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Weight Trend */}
      <section className="px-6 mt-2">
        <div className="rounded-[32px] bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Weight Trend</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Last 30 Days</span>
          </div>
          
          <div className="relative h-32 w-full mt-4">
            {/* Simple SVG Chart */}
            <svg className="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 80 Q 50 85 100 75 T 200 60 T 300 70 T 400 20" 
                fill="none" 
                stroke="#CCFF00" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              <path 
                d="M 0 80 Q 50 85 100 75 T 200 60 T 300 70 T 400 20 V 100 H 0 Z" 
                fill="url(#chartGradient)" 
              />
            </svg>
            <div className="flex justify-between mt-2 text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Row */}
      <section className="px-6 mt-6 grid grid-cols-1 gap-4">
        {/* Weekly Goal Card */}
        <div className="rounded-[32px] bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Weekly Goal</h4>
            <p className="text-4xl font-black mb-1">75%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">3 of 4 sessions done</p>
          </div>
          <div className="relative h-20 w-20">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#27272A" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="16" fill="none" stroke="#CCFF00" strokeWidth="3" 
                strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black italic text-zinc-600">FITBIT</span>
            </div>
          </div>
        </div>

        {/* Nutrition Goal Card */}
        <div className="rounded-[32px] bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800">
               <Utensils className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nutrition Goal</h4>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">1,850 / 2,400 kcal</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[77%] bg-primary shadow-[0_0_10px_rgba(204,255,0,0.4)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-black shadow-2xl shadow-primary/20 transition-all hover:scale-110 active:scale-95">
          <Plus className="h-8 w-8 stroke-[3]" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/5 px-6 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <button className="flex flex-col items-center gap-1.5 text-primary">
            <HomeIcon className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-500 transition-colors hover:text-white">
            <Dumbbell className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Workouts</span>
          </button>
          
          <div className="h-8 w-px bg-white/5" />
          
          <button className="flex flex-col items-center gap-1.5 text-zinc-500 transition-colors hover:text-white">
            <Utensils className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Nutrition</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-500 transition-colors hover:text-white">
            <User className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
