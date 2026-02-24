"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AthleteSetup() {
  const [goal, setGoal] = useState("");
  const [currentWeight, setCurrentWeight] = useState("00.0");
  const [targetWeight, setTargetWeight] = useState("00.0");
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [token, isLoading, router]);

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/clients/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          goals: [goal],
          currentWeight: parseFloat(currentWeight),
          targetWeight: parseFloat(targetWeight),
          weightUnit: "KG"
        })
      });

      if (response.ok) {
        alert("Objectives saved successfully!");
        router.push("/");
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 py-12 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 pb-8 mb-8">
        <Link href="/register/path" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-[10px] font-black tracking-[0.3em] uppercase">Registration</h1>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase">Step 02</span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase">Client Profile</span>
        </div>
        <div className="flex h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary" />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your Objectives</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
          Tell us about your physical starting point to help your coach calculate your metabolic needs.
        </p>
      </div>

      <div className="mt-12 space-y-10 flex-1">
        {/* Goal Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fitness Goals</label>
          <div className="relative">
            <select 
               value={goal}
               onChange={(e) => setGoal(e.target.value)}
               className="w-full appearance-none border border-white/5 bg-zinc-900/50 p-6 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="" disabled>Select your primary goal</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="performance">Peak Performance</option>
              <option value="health">General Health</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Weights */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Current Weight</label>
            <div className="relative border border-white/5 bg-zinc-900/50 p-6 flex items-baseline justify-between">
               <input 
                  type="text" 
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="bg-transparent text-2xl font-black focus:outline-none w-20"
               />
               <span className="text-[10px] font-bold text-zinc-600">KG</span>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target Weight</label>
            <div className="relative border border-white/5 bg-zinc-900/50 p-6 flex items-baseline justify-between">
               <input 
                  type="text" 
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="bg-transparent text-2xl font-black focus:outline-none w-20"
               />
               <span className="text-[10px] font-bold text-zinc-600">KG</span>
            </div>
          </div>
        </div>

        {/* Precision Tracking Card */}
        <div className="flex items-start gap-4 border border-white/5 bg-primary/5 p-6">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-zinc-900 border border-primary/20 rounded-sm">
              <BarChart3 className="h-5 w-5 text-primary" />
           </div>
           <div>
              <h4 className="text-xs font-black uppercase text-primary">Precision Tracking</h4>
              <p className="mt-2 text-[10px] text-zinc-400 leading-normal">
                 Your target weight will be used to calibrate your macro-nutrient distribution for optimal recovery.
              </p>
           </div>
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        <Link href="/register/path" className="flex-1">
          <button className="h-16 w-full border border-white/5 bg-zinc-900/50 font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-colors">
            Back
          </button>
        </Link>
        <button 
          onClick={handleSubmit}
          className="flex-[1.5] flex items-center justify-center gap-2 bg-primary h-16 font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
        >
          Continue <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
