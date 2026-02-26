"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, ArrowRight, Star, Activity, Check, Instagram, Twitter, Youtube, Home as HomeIcon, Dumbbell, BarChart3, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

 useEffect(() => {
  if (!isLoading && token && user) {
    if (user.role === "coach") {
      router.push("/coach/dashboard");  // ← fix
    } else if (user.role === "client") {
      router.push("/client/dashboard");  // ← fix
    }
  }
}, [user, token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-black/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-primary rounded-sm">
             <Activity className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter">PRODATA</span>
        </div>
        <div className="flex items-center gap-6">
          <Search className="h-6 w-6 cursor-pointer" />
          <Menu className="h-6 w-6 cursor-pointer" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-screen w-full items-end justify-center overflow-hidden px-6 pb-24">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
             <Image 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
                alt="Trainer" 
                fill 
                className="object-cover opacity-60"
                priority
             />
          </div>
          
          <div className="relative z-20 flex w-full max-w-4xl flex-col items-start gap-6">
            <span className="bg-primary px-3 py-1 text-[10px] font-bold tracking-widest text-black">
              ELITE PERFORMANCE ONLY
            </span>
            <h1 className="text-6xl font-black uppercase leading-tight tracking-tighter md:text-8xl">
              Train <br /> Like A <br /> <span className="italic text-primary">Pro</span>
            </h1>
            <p className="max-w-xs text-sm text-zinc-400">
              The premium data-driven platform connecting elite trainers with peak athletes.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link href="/register/path" className="w-full">
                <button className="flex h-14 w-full items-center justify-center gap-2 bg-primary font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  START TRANSFORMATION <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <button className="h-14 w-full border border-white/20 bg-white/5 font-bold backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
                EXPLORE COACHES
              </button>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="bg-black px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">The Methodology</span>
            <h2 className="mb-12 mt-2 text-4xl font-black uppercase tracking-tighter">Precision Coaching</h2>
            
            <div className="space-y-12">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-900 border border-primary/20">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase">Match with a Pro</h3>
                  <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                    Custom matching based on biometric potential and specific performance goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-900 border border-primary/20">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase">Track your data</h3>
                  <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                    Real-time biometric integration with predictive performance analytics dashboards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-900 border border-primary/20">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase">Get Elite Results</h3>
                  <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                    Break plateaus with expert guidance and weekly scientific programming adjustments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coaches Section */}
        <section className="bg-zinc-950 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">The Directors</span>
                <h2 className="mt-2 text-4xl font-black uppercase tracking-tighter">Top Tier Coaches</h2>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary pb-1">View All</button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Coach Card */}
              <div className="group relative overflow-hidden bg-zinc-900 border border-white/5">
                <div className="relative aspect-[3/4] w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?q=80&w=2070&auto=format&fit=crop" 
                    alt="Marcus Vane" 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary px-2 py-0.5 text-[8px] font-bold tracking-widest text-black">STRENGTH</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Marcus Vane</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">4.9</span>
                      <Star className="h-3 w-3 fill-primary text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Ex-Olympic lifting specialist. Data-driven hypertrophy.
                  </p>
                  <button className="mt-6 w-full border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>

              {/* Coach Card 2 */}
              <div className="group relative overflow-hidden bg-zinc-900 border border-white/5">
                <div className="relative aspect-[3/4] w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1548690312-e3b507d17a4d?q=80&w=1974&auto=format&fit=crop" 
                    alt="Sarah Loomis" 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary px-2 py-0.5 text-[8px] font-bold tracking-widest text-black">ENDURANCE</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Sarah Loomis</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">4.8</span>
                      <Star className="h-3 w-3 fill-primary text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Ironman coach. Metabolic efficiency specialist.
                  </p>
                  <button className="mt-6 w-full border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-black px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Access Levels</span>
            <h2 className="mb-12 mt-2 text-4xl font-black uppercase tracking-tighter">Choose Your Tier</h2>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Standard */}
              <div className="flex flex-col border border-white/10 bg-zinc-950 p-8">
                <span className="text-xs font-bold tracking-widest uppercase">Standard</span>
                <div className="my-8 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black">$49</span>
                  <span className="text-zinc-500 text-xs">/MO</span>
                </div>
                <ul className="mb-12 space-y-4 text-left text-sm">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Digital Training Log</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Performance Dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Community Forums</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-600">
                    <div className="h-4 w-4 border border-zinc-800 rounded-sm" /> <span>1-on-1 Video Coaching</span>
                  </li>
                </ul>
                <Link href="/register/path">
                  <button className="mt-auto w-full border border-white/20 py-4 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
                    Select Standard
                  </button>
                </Link>
              </div>

              {/* Elite */}
              <div className="relative flex flex-col border-2 border-primary bg-zinc-950 p-8">
                <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-[10px] font-bold tracking-widest text-black">
                  RECOMMENDED
                </div>
                <span className="text-xs font-bold tracking-widest uppercase italic text-primary">Elite Performance</span>
                <div className="my-8 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black">$199</span>
                  <span className="text-zinc-500 text-xs">/MO</span>
                </div>
                <ul className="mb-12 space-y-4 text-left text-sm">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Everything in Standard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>1-on-1 Video Coaching</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Biometric Wearable Sync</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" /> <span>Bloodwork Analysis Integration</span>
                  </li>
                </ul>
                <Link href="/register/path">
                  <button className="mt-auto w-full bg-primary py-4 text-xs font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity">
                    Select Elite
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 px-6 py-20 pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12 flex items-center justify-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tighter">PRODATA</span>
          </div>
          
          <nav className="mb-12 flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <a href="#" className="hover:text-primary transition-colors">Coaches</a>
            <a href="#" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </nav>

          <div className="mb-12 flex justify-center gap-8">
            <Instagram className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
            <Twitter className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
            <Youtube className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
          </div>

          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            © 2024 PRODATA PERFORMANCE SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* Bottom Nav Mobile */}
    <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-white/10 bg-black/80 py-4 backdrop-blur-lg md:hidden">
        <div className="flex flex-col items-center gap-1 text-primary">
          <HomeIcon className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <Dumbbell className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase">Trainers</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <BarChart3 className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase">Data</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <UserCircle className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase">Profile</span>
        </div>
      </nav>
    </div>
  );
}
