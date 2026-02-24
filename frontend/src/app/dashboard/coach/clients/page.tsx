"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, Search, Plus, LayoutDashboard, 
  BarChart3, MessageCircle, User, 
  Activity
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClientData {
  _id: string;
  name: string;
  avatar?: string;
}

interface Client {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  status: 'active' | 'inactive' | 'pending' | 'all';
  currentPlan: string;
  lastActive: string;
}

export default function MyClientsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Client['status']>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/api/coaches/my-clients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Map backend client to frontend model
        const mappedClients = data.map((c: ClientData) => ({
          id: c._id,
          name: c.name,
          avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
          tier: 'Premium Tier', // Backend doesn't have tier yet
          status: 'active', // Backend doesn't have status yet
          currentPlan: 'Hypertrophy V4.2', // Mock
          lastActive: '12m ago' // Mock
        }));
        setClients(mappedClients);
      } else {
        // Fallback mock data
        setClients([
          { id: '1', name: "Marcus Chen", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop", tier: "Premium Tier", status: "active", currentPlan: "Hypertrophy V4.2", lastActive: "12m ago" },
          { id: '2', name: "Elena Rodriguez", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop", tier: "Standard Tier", status: "active", currentPlan: "Endurance Pro", lastActive: "2h ago" },
          { id: '3', name: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop", tier: "Trial Period", status: "inactive", currentPlan: "Fat Loss Intro", lastActive: "3d ago" },
          { id: '4', name: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop", tier: "Premium Tier", status: "active", currentPlan: "Recomp Mastery", lastActive: "1h ago" },
        ]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching clients:", error);
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
      fetchClients();
    }
  }, [authLoading, token, router, fetchClients, isLoading]);

  const filteredClients = clients.filter(c => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">My Clients</h1>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(204,255,0,0.3)]">
          <Plus className="h-6 w-6 text-black" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search clients by name..." 
            className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 px-6 overflow-x-auto no-scrollbar mb-8">
        {[
          { id: 'all', label: 'All Status' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'pending', label: 'Pending' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-none h-11 px-6 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clients List */}
      <div className="px-6 flex-1">
        <div className="flex justify-between items-center mb-6 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span className="w-1/2">Client</span>
          <span className="w-1/4 text-center">Status</span>
          <span className="w-1/4 text-right">Last Active</span>
        </div>

        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              onClick={() => router.push(`/dashboard/coach/clients/${client.id}/meals`)}
              className="group flex items-center justify-between p-5 rounded-2xl bg-zinc-950 border border-white/5 hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 w-1/2">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10">
                  <Image src={client.avatar} alt={client.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{client.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{client.tier}</p>
                </div>
              </div>

              <div className="flex justify-center w-1/4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                  client.status === 'active' ? "bg-primary/10 text-primary border border-primary/20" : 
                  client.status === 'inactive' ? "bg-zinc-900 text-zinc-500 border border-white/5" :
                  "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                )}>
                  <div className={cn("h-1.5 w-1.5 rounded-full", client.status === 'active' ? "bg-primary" : "bg-zinc-500")} />
                  {client.status}
                </span>
              </div>

              <div className="flex flex-col items-end w-1/4">
                <span className="text-xs font-black italic text-zinc-400">{client.lastActive}</span>
                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{client.currentPlan}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Stats Card */}
        <div className="mt-12 rounded-3xl bg-zinc-950 border border-white/5 p-8 relative overflow-hidden group hover:border-primary/20 transition-colors">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Portfolio</span>
              <p className="text-4xl font-black mt-2 leading-none">{clients.length} <span className="text-xs text-zinc-600">Clients</span></p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Average Growth</span>
              <p className="text-2xl font-black mt-1 text-primary">+12%</p>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-black/90 py-4 backdrop-blur-xl px-6">
        <button onClick={() => router.push('/dashboard/coach')} className="flex flex-col items-center gap-1 text-zinc-500">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button onClick={() => router.push('/dashboard/coach/clients')} className="flex flex-col items-center gap-1 text-primary">
          <Users className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Clients</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500 relative">
          <MessageCircle className="h-6 w-6" />
          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Inbox</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <User className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}
