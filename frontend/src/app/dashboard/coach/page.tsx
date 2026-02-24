"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, DollarSign, MessageSquare, TrendingUp, Bell, Plus, 
  LayoutDashboard, 
  BarChart3, Settings, MessageCircle
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ActivityItem {
  id: number;
  name: string;
  type: string;
  action: string;
  value: string;
  subValue: string;
  time: string;
  avatar: string;
}

interface CheckinItem {
  id: number;
  name: string;
  time: string;
  label: string;
  action: string;
  type: string;
}

interface DashboardData {
  totalClients: number;
  mrr: number;
  unreadCount: number;
  avgProgress: number;
  monthlyRevenue: Record<string, number>;
  recentActivity: ActivityItem[];
  upcomingCheckins: CheckinItem[];
}

export default function CoachDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [revRes, unreadRes, clientsRes] = await Promise.all([
        fetch("http://localhost:4000/api/subscriptions/revenue", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:4000/api/chat/unread/count", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:4000/api/coaches/my-clients", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const revData = await revRes.json();
      const unreadData = await unreadRes.json();
      const clientsData = await clientsRes.json();

      setData({
        totalClients: Array.isArray(clientsData) ? clientsData.length : 42,
        mrr: revData.mrr || 12450,
        unreadCount: unreadData.unreadCount || 8,
        avgProgress: 88,
        monthlyRevenue: revData.monthlyRevenue || {
          "2024-01": 4500, "2024-02": 5200, "2024-03": 8900, 
          "2024-04": 9800, "2024-05": 11200, "2024-06": 12450
        },
        recentActivity: [
          { id: 1, name: "David Chen", type: "completed", action: "Hypertrophy - Session A", value: "11,240kg Volume", subValue: "PR: Bench Press", time: "2m ago", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop" },
          { id: 2, name: "Elena Rodriguez", type: "log", action: "Logged weight:", value: "64.2kg", subValue: "(-0.4kg)", time: "14m ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" }
        ],
        upcomingCheckins: [
          { id: 1, name: "Marcus Sterling", time: "09:30 AM", label: "Bi-Weekly Strategy Call", action: "JOIN", type: "video" },
          { id: 2, name: "Sarah Jenkins", time: "11:00 AM", label: "Nutrition Log Review", action: "REVIEW", type: "review" }
        ]
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
      fetchDashboardData();
    }
  }, [authLoading, token, router, fetchDashboardData, isLoading]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary">
            <Image 
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"} 
              alt="Avatar" 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter text-primary">Command Center</h1>
            <p className="text-xs text-zinc-500">Welcome back, Coach {user?.name?.split(' ')[0] || "Alex"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors">
            <Bell className="h-6 w-6" />
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(204,255,0,0.3)]">
            <Plus className="h-6 w-6 text-black" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 p-6 pt-0">
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-950 border border-white/5 p-5">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Clients</span>
          <span className="text-3xl font-black tracking-tighter">{data?.totalClients}</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-950 border border-white/5 p-5">
          <div className="flex items-center justify-between w-full">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary italic">
              <TrendingUp className="h-3 w-3" /> 15%
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Monthly Rev</span>
          <span className="text-3xl font-black tracking-tighter">${(data?.mrr || 0 / 1000).toFixed(1)}k</span>
        </div>
        <div className="relative flex flex-col gap-2 rounded-2xl bg-zinc-950 border border-white/5 p-5">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Unread</span>
          <span className="text-3xl font-black tracking-tighter">{String(data?.unreadCount).padStart(2, '0')}</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-zinc-950 border border-white/5 p-5">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Avg Progress</span>
          <span className="text-3xl font-black tracking-tighter">{data?.avgProgress}%</span>
        </div>
      </section>

      {/* MRR Chart */}
      <section className="p-6 pt-0">
        <div className="rounded-3xl bg-zinc-950 border border-white/5 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">MRR Growth</span>
              <h2 className="text-4xl font-black tracking-tighter text-primary mt-1">${(data?.mrr || 0).toLocaleString()}</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 italic">Last 6 Months</span>
          </div>
          
          {/* Simple Chart Visualization */}
          <div className="relative h-48 w-full">
             <svg className="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#ccff00" stopOpacity="0.3" />
                   <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
                 </linearGradient>
               </defs>
               <path 
                 d="M 0 80 Q 50 85, 100 65 T 200 40 T 300 35 T 400 20" 
                 fill="none" 
                 stroke="#ccff00" 
                 strokeWidth="3" 
                 strokeLinecap="round"
               />
               <path 
                 d="M 0 80 Q 50 85, 100 65 T 200 40 T 300 35 T 400 20 L 400 100 L 0 100 Z" 
                 fill="url(#chartGradient)" 
               />
             </svg>
             <div className="absolute bottom-0 left-0 flex w-full justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-700 px-1">
               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
             </div>
          </div>
        </div>
      </section>

      {/* Upcoming Check-ins */}
      <section className="px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest">Upcoming Check-ins</h3>
          <button className="text-[10px] font-bold uppercase tracking-widest text-primary italic underline underline-offset-4">View Calendar</button>
        </div>
        <div className="space-y-4">
          {data?.upcomingCheckins.map(item => (
            <div 
              key={item.id} 
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-zinc-950 border border-white/5 p-5 transition-all hover:bg-zinc-900 cursor-pointer"
              onClick={() => router.push(`/dashboard/coach/clients/${item.id}/meals`)}
            >
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-900 p-2 min-w-[60px] border border-white/5 group-hover:border-primary/30">
                  <span className="text-xs font-black text-primary">{item.time.split(' ')[0]}</span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase">{item.time.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">{item.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">{item.label}</p>
                </div>
              </div>
              <button className={`h-10 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                item.type === 'video' ? 'bg-primary text-black' : 'bg-zinc-900 text-zinc-400 border border-white/5'
              }`}>
                {item.action}
              </button>
              {item.type === 'video' && <div className="absolute left-0 top-0 h-full w-1 bg-primary" />}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">Recent Activity</h3>
        <div className="space-y-6">
          {data?.recentActivity.map(item => (
            <div key={item.id} className="flex items-start gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 shrink-0">
                <Image src={item.avatar} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                   <h4 className="text-xs font-black uppercase tracking-tight">{item.name}</h4>
                   <span className="text-[8px] font-bold text-zinc-700 uppercase">{item.time}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {item.type === 'completed' ? "Completed" : "Logged weight:"} <span className={item.type === 'completed' ? "text-primary italic" : "text-white font-bold"}>{item.action} {item.value}</span>
                </p>
                <div className="flex gap-2 mt-3">
                   <span className="px-2 py-1 bg-zinc-900 border border-white/5 text-[8px] font-bold uppercase tracking-widest text-primary">{item.value}</span>
                   <span className="px-2 py-1 bg-zinc-900 border border-white/5 text-[8px] font-bold uppercase tracking-widest text-zinc-400">{item.subValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-black/90 py-4 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Dashboard</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <Users className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Clients</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors relative">
          <MessageCircle className="h-6 w-6" />
          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Messages</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <BarChart3 className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Metrics</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <Settings className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Config</span>
        </div>
      </nav>
    </div>
  );
}
