"use client";

import { useState } from "react";
import { 
  X, HelpCircle, Camera, Send,
  Frown, Meh, Smile, Heart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DailyLogPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  const [weight, setWeight] = useState("00.0");
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [mood, setMood] = useState<number | null>(3);
  const [energy, setEnergy] = useState(85);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { value: 1, label: 'POOR', icon: Frown, color: 'text-red-500' },
    { value: 2, label: 'LOW', icon: Frown, color: 'text-orange-500' },
    { value: 3, label: 'OKAY', icon: Meh, color: 'text-yellow-500' },
    { value: 4, label: 'GOOD', icon: Smile, color: 'text-green-500' },
    { value: 5, label: 'ELITE', icon: Heart, color: 'text-primary' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:4000/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          weight: parseFloat(weight),
          weightUnit: unit,
          mood: mood,
          energyLevel: Math.round(energy / 20), // Convert to 1-5 scale
          notes: notes
        })
      });

      if (response.ok) {
        router.push("/dashboard/athlete");
      } else {
        alert("Failed to save log. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white font-sans overflow-y-auto pb-12">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/5">
        <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full">
          <X className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Daily Log</h1>
        <button className="h-10 w-10 flex items-center justify-center rounded-full">
          <HelpCircle className="h-6 w-6 text-primary" />
        </button>
      </header>

      <div className="p-8 space-y-12">
        {/* Body Stats */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black tracking-widest uppercase text-primary">Body Stats</h2>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step 1 of 4</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Current Weight</label>
            <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <input 
                type="text" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 bg-transparent text-5xl font-black tracking-tighter focus:outline-none placeholder:text-zinc-800"
              />
              <div className="flex bg-black rounded-xl p-1 border border-white/5">
                <button 
                  onClick={() => setUnit('kg')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                    unit === 'kg' ? "bg-primary text-black" : "text-zinc-500"
                  )}
                >KG</button>
                <button 
                  onClick={() => setUnit('lbs')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                    unit === 'lbs' ? "bg-primary text-black" : "text-zinc-500"
                  )}
                >LBS</button>
              </div>
            </div>
          </div>
        </section>

        {/* Subjective Mood */}
        <section>
          <h2 className="text-[10px] font-black tracking-widest uppercase text-primary mb-6">Subjective Mood</h2>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all aspect-square",
                  mood === m.value 
                    ? "bg-primary/10 border-primary shadow-[0_4px_14px_0_rgba(204,255,0,0.1)]" 
                    : "bg-zinc-900 border-white/5"
                )}
              >
                <m.icon className={cn("h-6 w-6 mb-2", mood === m.value ? "text-primary" : "text-zinc-600")} />
                <span className={cn(
                  "text-[8px] font-black tracking-widest uppercase",
                  mood === m.value ? "text-primary" : "text-zinc-600"
                )}>{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Energy Levels */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black tracking-widest uppercase text-primary">Energy Levels</h2>
            <span className="text-lg font-black italic text-primary">{energy}%</span>
          </div>
          <div className="px-2">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-[8px] font-black uppercase tracking-widest text-zinc-700">
              <span>Depleted</span>
              <span>Peak Performance</span>
            </div>
          </div>
        </section>

        {/* Visual Evidence */}
        <section>
          <h2 className="text-[10px] font-black tracking-widest uppercase text-primary mb-6">Visual Evidence</h2>
          <div className="relative aspect-video rounded-3xl border-2 border-dashed border-white/5 bg-zinc-900/50 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 transition-all overflow-hidden">
            <div className="h-16 w-16 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
              <Camera className="h-8 w-8 text-zinc-500 group-hover:text-black transition-all" />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Upload Progress Photo</p>
            <p className="mt-1 text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Front, side or back view</p>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </section>

        {/* Daily Notes */}
        <section>
          <h2 className="text-[10px] font-black tracking-widest uppercase text-primary mb-6">Daily Notes</h2>
          <textarea 
            placeholder="How was your training? Any hurdles today?"
            className="w-full min-h-[160px] bg-zinc-900/50 border border-white/5 rounded-3xl p-6 text-sm font-medium leading-relaxed focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-zinc-700"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="group relative w-full h-16 rounded-xl bg-primary flex items-center justify-center overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20 mt-12"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <span className="relative z-10 text-black text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
              Submit Log <Send className="h-4 w-4 fill-black" />
            </span>
          )}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
}
