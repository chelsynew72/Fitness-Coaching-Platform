import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, Share, Lock, Star, Zap, Info
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
}

interface CoachData {
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  bio: string;
  specialties: string[];
  experience: number;
  monthlyRate: number;
  rating: number;
  clients: string[];
  totalReviews: number;
}

export default function CoachProfile() {
  const router = useRouter();
  const params = useParams();
  const { token, isLoading: authLoading } = useAuth();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCoachProfile = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/coaches/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCoach(data);
      } else {
        // Fallback for mock/demo
        setCoach({
          userId: { _id: "1", name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=1974&auto=format&fit=crop" },
          bio: "Helping high-performers rebuild their physiques through data-driven hypertrophy and metabolic conditioning. 10+ years of professional experience.",
          specialties: ["POWERLIFTING", "FAT LOSS", "NUTRITIONAL STRATEGY"],
          rating: 4.9,
          experience: 10,
          monthlyRate: 199,
          clients: new Array(50).fill(""),
          totalReviews: 124
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      setIsLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    if (!authLoading && token && isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCoachProfile();
    } else if (!authLoading && !token && isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCoachProfile();
    }
  }, [authLoading, token, fetchCoachProfile, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-black uppercase mb-4">Coach Not Found</h1>
        <button onClick={() => router.back()} className="text-primary font-bold uppercase underline">Go Back</button>
      </div>
    );
  }

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Marcus T.',
      role: 'COMPETITIVE LIFTER',
      rating: 5,
      text: '"Alex transformed my approach to powerlifting. I added 40kg to my total in just 3 months while staying injury-free."',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Sarah J.',
      role: 'FITNESS ENTHUSIAST',
      rating: 5,
      text: '"The results speak for themselves. I feel stronger and have more energy than ever before."',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white font-sans pb-12">
      {/* Hero Header */}
      <header className="relative h-[60vh] w-full">
        <Image 
          src={coach.userId.avatar || "https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=1974&auto=format&fit=crop"} 
          alt={coach.userId.name} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/30" />
        
        {/* Navigation Actions */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
          <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/5">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/5">
            <Share className="h-6 w-6" />
          </button>
        </div>

        {/* Coach Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.85] mb-2">
            {coach.userId.name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none">Elite Strength & Conditioning</p>
          </div>
        </div>
      </header>

      <div className="px-8 mt-8 space-y-12">
        {/* Bio Section */}
        <section>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {coach.bio}
          </p>
          <div className="flex flex-wrap gap-2">
            {coach.specialties.map(s => (
              <span key={s} className="px-3 py-2 bg-zinc-900 border border-white/5 text-[10px] font-black tracking-widest uppercase rounded-md text-zinc-300">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 p-6 aspect-square text-center">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rating</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black italic leading-none">{coach.rating}</span>
              <Star className="h-3 w-3 fill-primary text-primary" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 p-6 aspect-square text-center">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Clients</span>
            <span className="text-xl font-black italic leading-none">{coach.clients.length}+</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 p-6 aspect-square text-center">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Monthly</span>
            <span className="text-xl font-black italic leading-none">${coach.monthlyRate}</span>
          </div>
        </section>

        {/* Sample Plan Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase italic tracking-wider leading-none">Sample Training Plan</h3>
            <Info className="h-4 w-4 text-zinc-600" />
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/50 p-8 min-h-[240px] flex flex-col items-center justify-center text-center">
             {/* Blurred Content Placeholder */}
             <div className="absolute inset-0 p-8 blur-lg opacity-20 select-none pointer-events-none">
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-white rounded" />
                  <div className="h-4 w-1/2 bg-white rounded" />
                  <div className="h-4 w-5/6 bg-white rounded" />
                </div>
             </div>
             
             <div className="relative flex flex-col items-center z-10">
               <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/20">
                  <Lock className="h-8 w-8 text-black" />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest mb-2">Locked Content</h4>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Subscribe to view full program</p>
             </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section>
          <h3 className="text-lg font-black uppercase italic tracking-wider leading-none mb-6">Success Stories</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
            {testimonials.map(t => (
              <div key={t.id} className="flex-none w-[280px] bg-zinc-900/50 border border-white/5 rounded-3xl p-6 transition-colors hover:bg-zinc-900">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs font-medium text-zinc-300 leading-relaxed mb-6 h-12 line-clamp-3 italic">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-tight">{t.name}</h5>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscription Footer */}
        <section className="pt-8 pb-12">
          <button className="group relative w-full h-16 rounded-xl bg-primary flex items-center justify-center overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_40px_rgba(204,255,0,0.2)]">
             <span className="relative z-10 text-black text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                Subscribe & Start Training <Zap className="h-4 w-4 fill-black" />
             </span>
             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
          <p className="mt-4 text-center text-[8px] font-black text-zinc-700 uppercase tracking-widest">
            Cancel Anytime • Secure Payment by Stripe
          </p>
        </section>
      </div>
    </div>
  );
}

