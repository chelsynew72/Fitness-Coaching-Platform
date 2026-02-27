"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Wallet, FileText, Zap, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SPECIALTIES = [
  "Hypertrophy", "HIIT", "Yoga", "Powerlifting", "Weight Loss", "Nutrition", "Mobility", "Cardio"
];

export default function CoachSetup() {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["Hypertrophy", "Yoga"]);
  const [rate, setRate] = useState("149");
  const [bio, setBio] = useState("I am a dedicated fitness professional with over 8 years of experience in high-performance hypertrophy training and nutritional optimization. My approach combines scientific data with practical intensity to help clients shatter plateaus. I believe in sustainable lifestyle shifts rather than quick fixes.");
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [token, isLoading, router]);

  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleSubmit = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${API}/api/coaches/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Assuming token is stored in localStorage
        },
        body: JSON.stringify({
          bio,
          specialties: selectedSpecialties,
          monthlyRate: parseFloat(rate),
          experience: 8, // Fixed for now as per image
        })
      });

      if (response.ok) {
        alert("Profile created successfully!");
        // Redirect to dashboard or next step
      } else {
        const error = await response.json();
        console.error("Failed to create profile:", error);
        alert("Failed to create profile. Check console for details.");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("Error submitting profile. Is the backend running?");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 py-12 text-white">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link href="/register/path" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold tracking-tighter uppercase">Coach Profile</h1>
        <div className="w-10" />
      </header>

      <div className="mt-12 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-tight">Professional Setup</h2>
          <p className="text-zinc-500 text-sm">Define your expertise and start growing.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black tracking-widest text-primary uppercase leading-none">Step 2 of 4</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 flex h-1.5 w-full bg-zinc-900 overflow-hidden">
        <div className="h-full w-1/2 bg-primary" />
      </div>

      <div className="mt-12 space-y-12">
        {/* Specialties */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <Activity className="h-4 w-4 text-primary" />
               <h3 className="text-[10px] font-black tracking-widest uppercase">Professional Specialties</h3>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Select all that apply</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {SPECIALTIES.map(specialty => (
              <button
                key={specialty}
                onClick={() => toggleSpecialty(specialty)}
                className={`h-11 px-6 text-sm font-bold border transition-all ${
                  selectedSpecialties.includes(specialty)
                    ? "bg-primary text-black border-primary"
                    : "bg-zinc-950 text-zinc-400 border-white/5 hover:border-white/10"
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </section>

        {/* Monthly Rate */}
        <section>
          <div className="flex items-center gap-2 mb-6">
             <Wallet className="h-4 w-4 text-primary" />
             <h3 className="text-[10px] font-black tracking-widest uppercase">Monthly Rate</h3>
          </div>
          <div className="relative flex items-center border border-white/5 bg-zinc-950 p-6">
             <span className="text-xl font-bold text-primary mr-4">$</span>
             <input 
                type="text" 
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-black focus:outline-none"
             />
             <span className="text-[10px] font-bold text-zinc-600 uppercase">Per Month</span>
          </div>
          <p className="mt-3 text-[10px] font-medium italic text-zinc-600">
            Average platform rate for your specialties is $120 - $180
          </p>
        </section>

        {/* Bio */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <FileText className="h-4 w-4 text-primary" />
               <h3 className="text-[10px] font-black tracking-widest uppercase">Professional Bio</h3>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">{bio.length} / 500</span>
          </div>
          <textarea 
            className="w-full min-h-[200px] border border-white/5 bg-zinc-950 p-6 text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-white/10 resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />

          {/* Tips Card */}
          <div className="mt-6 flex items-start gap-4 border border-white/5 bg-primary/5 p-6">
             <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary">
                <Zap className="h-5 w-5 text-black" />
             </div>
             <div>
                <h4 className="text-xs font-black uppercase">Top Coaches Earn More</h4>
                <p className="mt-2 text-[10px] text-zinc-400 leading-normal">
                   Profiles with a bio over 300 characters see a 45% increase in client conversion rates.
                </p>
             </div>
          </div>
        </section>
      </div>

      <div className="mt-auto pt-12">
        <button 
          onClick={handleSubmit}
          className="flex h-16 w-full items-center justify-center gap-2 bg-primary font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
        >
          Continue Registration <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
