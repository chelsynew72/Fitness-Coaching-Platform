"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Star, CheckCircle2, ArrowRight,
  Activity, ChevronLeft, Dumbbell, Users
} from "lucide-react";

export default function CoachesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [myCoachId, setMyCoachId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  useEffect(() => {
    if (isLoading) return;
    fetchCoaches();
    if (token) fetchMySubscription();
  }, [token, isLoading]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const data = await get("/coaches");
      setCoaches(data);
    } catch {
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const sub = await get("/subscriptions/my-subscription");
      if (sub?.coachId) setMyCoachId(sub.coachId);
    } catch {}
  };

  const handleSubscribe = async (coachId: string) => {
    if (!token) { router.push("/login"); return; }
    setSubscribing(coachId);
    try {
      const res = await fetch(`${API}/api/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coachId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to subscribe");
        return;
      }
      setMyCoachId(coachId);
      setSuccess("Successfully subscribed! Redirecting to dashboard...");
      setTimeout(() => router.push("/client/dashboard"), 2000);
    } catch {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const allSpecialties = [...new Set(
    coaches.flatMap((c) => c.specialties || [])
  )];

  const filtered = coaches.filter((coach) => {
    const matchSearch =
      coach.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      coach.bio?.toLowerCase().includes(search.toLowerCase()) ||
      coach.specialties?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSpecialty = selectedSpecialty
      ? coach.specialties?.includes(selectedSpecialty)
      : true;
    return matchSearch && matchSpecialty;
  });

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(user?.role === "client" ? "/client/dashboard" : "/")}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
              {user?.role === "client" ? "Dashboard" : "Home"}
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-primary rounded-sm">
                <Activity className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-black uppercase tracking-tighter">FITPRO</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => router.push(user.role === "client" ? "/client/dashboard" : "/coach/dashboard")}
                className="px-4 py-2 border border-white/5 bg-zinc-950 text-xs font-black uppercase tracking-widest rounded-lg hover:text-primary transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => router.push("/login")}
                  className="px-4 py-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                  Sign In
                </button>
                <button onClick={() => router.push("/register/path")}
                  className="px-4 py-2 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Elite Coaching Network</span>
          <h1 className="mt-3 text-5xl font-black uppercase italic tracking-tighter mb-4">Find Your Coach</h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Connect with certified fitness professionals and get a personalized program built for your goals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search by name, specialty or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSpecialty("")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !selectedSpecialty ? "bg-primary text-black" : "bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              All
            </button>
            {allSpecialties.slice(0, 6).map((s) => (
              <button key={s} onClick={() => setSelectedSpecialty(s === selectedSpecialty ? "" : s)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedSpecialty === s ? "bg-primary text-black" : "bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="mb-6 border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
          </div>
        )}

        <p className="text-xs text-zinc-600 mb-5">
          {loading ? "Loading..." : `${filtered.length} coach${filtered.length !== 1 ? "es" : ""} available`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-zinc-950 border border-white/5 rounded-xl shimmer" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((coach, i) => {
              const coachUserId = coach.userId?._id || coach.userId;
              const isSubscribed = myCoachId === coachUserId || myCoachId === coach._id;
              const isSubscribing = subscribing === coachUserId || subscribing === coach._id;

              return (
                <div key={i} className={`bg-zinc-950 border rounded-xl overflow-hidden transition-all hover:border-white/10 ${
                  isSubscribed ? "border-primary/30" : "border-white/5"
                }`}>
                  <div className="relative h-32 bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center border-b border-white/5">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-black font-black text-3xl">
                      {coach.userId?.name?.[0] || "C"}
                    </div>
                    {isSubscribed && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/20 border border-primary/30 rounded-lg px-2.5 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Your Coach</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-black uppercase tracking-tight">{coach.userId?.name || "Coach"}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs font-bold">4.9</span>
                          <span className="text-xs text-zinc-600">· {coach.experience || 1}yr exp</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">${coach.monthlyRate}</p>
                        <p className="text-[10px] text-zinc-600">/month</p>
                      </div>
                    </div>

                    {coach.bio && (
                      <p className="text-xs text-zinc-500 leading-relaxed mb-4 line-clamp-2">{coach.bio}</p>
                    )}

                    {coach.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {coach.specialties.slice(0, 4).map((s: string) => (
                          <span key={s} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-900 border border-white/5 rounded text-zinc-400">
                            {s}
                          </span>
                        ))}
                        {coach.specialties.length > 4 && (
                          <span className="text-[10px] text-zinc-600 py-1">+{coach.specialties.length - 4} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 mb-4 py-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Users className="h-3.5 w-3.5" />{coach.clients?.length || 0} clients
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Dumbbell className="h-3.5 w-3.5" />{coach.experience || 1}+ years
                      </div>
                    </div>

                    {isSubscribed ? (
                      <button onClick={() => router.push("/client/dashboard")}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors">
                        <CheckCircle2 className="h-4 w-4" /> Go to Dashboard
                      </button>
                    ) : user?.role === "coach" ? (
                      <button disabled
                        className="w-full py-3 bg-zinc-900 border border-white/5 text-zinc-600 text-xs font-black uppercase tracking-widest rounded-lg cursor-not-allowed">
                        Coaches Cannot Subscribe
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(coachUserId)}
                        disabled={isSubscribing || !!myCoachId}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isSubscribing ? "Subscribing..." : (
                          <>Subscribe ${coach.monthlyRate}/mo <ArrowRight className="h-4 w-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">No Coaches Found</h2>
            <p className="text-zinc-500 text-sm">Try a different search or filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
