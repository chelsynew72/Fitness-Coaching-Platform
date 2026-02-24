"use client";

import { useState } from "react";
import { ChevronLeft, CheckCircle2, Circle, Dumbbell, Activity } from "lucide-react";
import Link from "next/link";

export default function ChoosePath() {
  const [role, setRole] = useState<"coach" | "athlete">("coach");

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 py-12 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex gap-2">
          <div className="h-1.5 w-12 rounded-full bg-primary" />
          <div className="h-1.5 w-12 rounded-full bg-zinc-800" />
          <div className="h-1.5 w-12 rounded-full bg-zinc-800" />
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Choose Your <span className="text-primary">Path</span>
        </h1>
        <p className="text-zinc-400">
          Tailor your experience based on your fitness goals and professional needs.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {/* Coach Card */}
        <div 
          onClick={() => setRole("coach")}
          className={`relative cursor-pointer border-2 p-8 transition-all ${
            role === "coach" ? "border-primary bg-primary/5" : "border-zinc-900 bg-zinc-950"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-14 w-14 items-center justify-center ${
              role === "coach" ? "bg-primary/20" : "bg-zinc-900"
            }`}>
               <Activity className={`h-8 w-8 ${role === "coach" ? "text-primary" : "text-zinc-600"}`} />
            </div>
            {role === "coach" ? (
              <CheckCircle2 className="h-6 w-6 text-primary fill-black" />
            ) : (
              <Circle className="h-6 w-6 text-zinc-800" />
            )}
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter">I am a coach</h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Manage athletes, create data-driven programs, and track performance metrics in real-time.
            </p>
          </div>
        </div>

        {/* Athlete Card */}
        <div 
          onClick={() => setRole("athlete")}
          className={`relative cursor-pointer border-2 p-8 transition-all ${
            role === "athlete" ? "border-primary bg-primary/5" : "border-zinc-900 bg-zinc-950"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-14 w-14 items-center justify-center ${
              role === "athlete" ? "bg-primary/20" : "bg-zinc-900"
            }`}>
               <Dumbbell className={`h-8 w-8 ${role === "athlete" ? "text-primary" : "text-zinc-600"}`} />
            </div>
            {role === "athlete" ? (
              <CheckCircle2 className="h-6 w-6 text-primary fill-black" />
            ) : (
              <Circle className="h-6 w-6 text-zinc-800" />
            )}
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter">I am an athlete</h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Access elite coaching, track your progress with biometric data, and reach your peak performance.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-12">
        <Link href={role === "coach" ? "/register/coach-setup" : "/register/athlete-setup"}>
          <button className="h-16 w-full bg-primary font-black uppercase tracking-widest text-black">
            Continue
          </button>
        </Link>
        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          Step 1 of 3
        </p>
      </div>
    </div>
  );
}
