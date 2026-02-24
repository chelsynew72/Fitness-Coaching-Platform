"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  GripVertical, 
  Search, 
  Filter, 
  MoreHorizontal,
  Dumbbell,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for volume distribution chart
const volumeData = [
  { muscle: "Quads", volume: 45 },
  { muscle: "Glutes", volume: 30 },
  { muscle: "Hamstrings", volume: 25 },
  { muscle: "Calves", volume: 15 },
  { muscle: "Back", volume: 20 },
];

const COLORS = ["#ccff00", "#a3cc00", "#7a9900", "#526600", "#293300"];

export default function NewPlanPage() {
  const router = useRouter();
  useAuth();
  const [activeDay, setActiveDay] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleSave = async () => {
    // In a real app, we would POST to /api/plans/templates
    router.push("/dashboard/coach");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <input 
                defaultValue="Hypertrophy Phase 1"
                className="bg-transparent border-none text-xl font-bold focus:ring-0 p-0 w-48"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={cn(
              "p-3 rounded-xl border transition-all",
              showAnalytics ? "bg-primary text-black border-primary" : "bg-zinc-900 border-zinc-800 text-zinc-400"
            )}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-bold uppercase italic text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            Save & Assign
          </button>
        </div>
      </header>

      {/* Analytics Panel (Recharts) */}
      {showAnalytics && (
        <div className="mx-6 mt-6 p-6 bg-card border border-primary/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold uppercase italic">Volume Distribution</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total sets: 135</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="muscle" stroke="#525252" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Days Tabs */}
      <div className="px-6 py-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "flex-none px-6 py-4 rounded-xl border-2 font-black italic uppercase text-sm transition-all whitespace-nowrap",
                activeDay === day 
                  ? "bg-primary border-primary text-black" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              )}
            >
              Day {day}: {day === 1 ? "Leg Day" : day === 2 ? "Push" : "Pull"}
            </button>
          ))}
          <button className="flex-none w-14 h-14 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black italic uppercase">Exercises</h2>
          <div className="flex gap-2">
            <button className="p-2 text-zinc-500"><Filter className="w-5 h-5" /></button>
            <button className="p-2 text-zinc-500"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {[
            { name: "Back Squat (High Bar)", tags: ["QUADS", "GLUTES"], sets: 4, reps: "8-10", weight: "225 lbs", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop" },
            { name: "Bulgarian Split Squat", tags: ["QUADS"], sets: 3, reps: "12", weight: "40 lbs", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop" }
          ].map((ex, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex gap-4 group hover:border-zinc-700 transition-all">
              <div className="flex-none flex flex-col items-center justify-center text-zinc-700">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold uppercase italic leading-tight mb-1">{ex.name}</h3>
                    <div className="flex gap-2">
                      {ex.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black tracking-widest rounded-sm border border-primary/20">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <Image src={ex.img} width={64} height={48} className="object-cover rounded-lg border border-border" alt="" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Sets</label>
                    <input defaultValue={ex.sets} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm font-bold focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Reps</label>
                    <input defaultValue={ex.reps} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm font-bold focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Weight</label>
                    <input defaultValue={ex.weight} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm font-bold focus:ring-1 focus:ring-primary text-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Library (Floating Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-border p-6 rounded-t-[32px] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic uppercase">Exercise Library</h3>
          <span className="text-primary text-[10px] font-bold">542 AVAILABLE</span>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            placeholder="Search exercises..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {["All", "Compound", "Isolation", "Dumbbell", "Barbell", "Machine"].map((cat, i) => (
            <button 
              key={cat}
              className={cn(
                "flex-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                i === 0 ? "bg-primary border-primary text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar">
          {[
            { name: "Leg Press", type: "MACHINE", muscle: "LEGS", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=100&auto=format&fit=crop" },
            { name: "Lying Leg Curl", type: "MACHINE", muscle: "HAMSTRINGS", img: "https://images.unsplash.com/photo-1541534741688-6078c64b52d2?q=80&w=100&auto=format&fit=crop" },
            { name: "Goblet Squat", type: "DUMBBELL", muscle: "QUADS", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=100&auto=format&fit=crop" }
          ].map((ex, i) => (
            <div key={i} className="flex items-center gap-4 p-2 group hover:bg-zinc-900 rounded-xl transition-all">
              <Image src={ex.img} width={56} height={56} className="object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all border border-border" alt="" />
              <div className="flex-grow">
                <h4 className="font-bold text-sm uppercase italic leading-none mb-1">{ex.name}</h4>
                <p className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">{ex.type} • {ex.muscle}</p>
              </div>
              <button className="w-10 h-10 bg-primary text-black rounded-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}