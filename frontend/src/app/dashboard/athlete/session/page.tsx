"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, 
  MoreVertical, 
  Play, 
  Check, 
  Plus, 
  History, 
  Edit2, 
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for the chart
const weightData = [
  { name: "Week 1", weight: 185 },
  { name: "Week 2", weight: 195 },
  { name: "Week 3", weight: 205 },
  { name: "Week 4", weight: 215 },
  { name: "Week 5", weight: 225 },
];

export default function ActiveSessionPage() {
  const router = useRouter();
  useAuth();
  const [activeSet, setActiveSet] = useState(2);
  const [timeLeft, setTimeLeft] = useState(84); // 01:24
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCompleteSession = async () => {
    // In a real app, we would POST to /api/workout-logs
    router.push("/dashboard/athlete");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Active Session</p>
          <h1 className="text-primary font-bold">Leg Day A</h1>
        </div>
        <button className="p-2 -mr-2">
          <MoreVertical className="w-6 h-6" />
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Exercise Progress</p>
          <p className="text-primary font-bold">3 / 8</p>
        </div>
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[37.5%]" />
        </div>
      </div>

      <div className="px-6 mt-4">
        <h2 className="text-4xl font-black italic uppercase leading-none mb-6">Barbell Back Squat</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Target Sets</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">4</span>
              <span className="text-primary font-bold">x</span>
              <span className="text-3xl font-bold">8</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Weight</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">225</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Lbs</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-8 group cursor-pointer">
          <Image 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Squat Form"
            fill
            className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Info className="w-3 h-3 text-black" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider">View Form Guide</span>
          </div>
        </div>

        {/* Recharts Progress Chart (Simplified for this exercise) */}
        <div className="mb-8 p-4 bg-card border border-border rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Weight Progression</p>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
                  itemStyle={{ color: '#ccff00' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#ccff00" 
                  strokeWidth={3} 
                  dot={{ fill: '#ccff00', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sets List */}
        <div className="space-y-3 mb-10">
          <div className="flex justify-between px-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            <span>Set</span>
            <span>Previous</span>
            <span>Status</span>
          </div>
          
          {[1, 2, 3, 4].map((set) => (
            <div 
              key={set}
              className={cn(
                "p-4 rounded-xl border flex items-center justify-between transition-all",
                set === activeSet 
                  ? "bg-primary/10 border-primary" 
                  : set < activeSet 
                    ? "bg-zinc-900/50 border-zinc-800 opacity-80" 
                    : "bg-zinc-900 border-zinc-800 opacity-40"
              )}
              onClick={() => setActiveSet(set)}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-2xl font-black italic uppercase",
                  set === activeSet ? "text-primary" : "text-white"
                )}>{set}</span>
                <div>
                  <p className="text-sm font-bold">225 lbs × 8</p>
                  {set === activeSet ? (
                    <p className="text-[10px] uppercase font-bold text-primary">In Progress</p>
                  ) : set < activeSet ? (
                    <p className="text-[10px] uppercase font-bold text-zinc-500">RPE 8.0</p>
                  ) : (
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Upcoming</p>
                  )}
                </div>
              </div>
              
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-colors",
                set < activeSet 
                  ? "bg-primary border-primary" 
                  : set === activeSet 
                    ? "border-primary bg-transparent" 
                    : "border-zinc-800 bg-transparent"
              )}>
                {set < activeSet ? (
                  <Check className="w-6 h-6 text-black stroke-[3px]" />
                ) : set === activeSet ? (
                  <Plus className="w-6 h-6 text-primary" />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Rest Timer */}
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center mb-8">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Rest Timer</p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-7xl font-black italic tracking-tighter text-primary">
              {formatTime(timeLeft).split(':')[0]}
            </span>
            <span className="text-7xl font-black italic tracking-tighter text-primary">:</span>
            <span className="text-7xl font-black italic tracking-tighter text-primary">
              {formatTime(timeLeft).split(':')[1]}
            </span>
            <span className="text-2xl font-black italic text-zinc-500 ml-1">S</span>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setTimeLeft((p) => Math.max(0, p - 15))}
              className="px-6 py-2 bg-zinc-900 rounded-lg font-bold text-sm border border-zinc-800"
            >
              -15S
            </button>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-10 py-2 bg-primary text-black rounded-lg font-bold text-sm"
            >
              {isTimerRunning ? "PAUSE" : "START"}
            </button>
            <button 
              onClick={() => setTimeLeft((p) => p + 15)}
              className="px-6 py-2 bg-zinc-900 rounded-lg font-bold text-sm border border-zinc-800"
            >
              +15S
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold uppercase italic text-sm">
            <History className="w-4 h-4" />
            History
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold uppercase italic text-sm">
            <Edit2 className="w-4 h-4" />
            Edit Exercise
          </button>
        </div>

        <button 
          onClick={handleCompleteSession}
          className="w-full py-5 bg-primary text-black font-black uppercase italic rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Complete Session
        </button>
      </div>
    </div>
  );
}