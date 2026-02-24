"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Menu, Search, Bell, Video, BarChart3, Plus, 
  Send, LayoutDashboard, Users, MessageSquare, User, 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  text: string;
  sender: 'coach' | 'client';
  timestamp: string;
  status: 'sent' | 'read';
}

interface ChatClient {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  unreadCount: number;
}

export default function CoachChatPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [selectedClient, setSelectedClient] = useState<ChatClient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const chatClients: ChatClient[] = [
      { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop', status: 'HYPERTROPHY PHASE', lastMessage: 'Got it, Coach!', unreadCount: 2 },
      { id: '2', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop', status: 'RECOMP MASTERY', lastMessage: 'Thank you!', unreadCount: 0 },
    ];

    if (chatClients.length > 0 && !selectedClient) {
      setSelectedClient(chatClients[0]);
      setMessages([
        { id: '1', text: 'Hey John! I just reviewed your deadlift footage from this morning. Form looks solid, but let’s focus on keeping the lats tighter during the pull.', sender: 'coach', timestamp: '09:45 AM', status: 'read' },
        { id: '2', text: 'Got it, Coach! I felt that on the last set. Also, can we adjust my macros for tomorrow? I have a long travel day and might need more portable options.', sender: 'client', timestamp: '10:12 AM', status: 'sent' },
        { id: '3', text: 'Absolutely. I’ll swap your mid-day meal for a high-protein snack pack and a shake. I’ve updated your plan in the dashboard.', sender: 'coach', timestamp: '10:15 AM', status: 'sent' },
      ]);
    }
  }, [selectedClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'coach',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between p-6 bg-[#0F0F0F] border-b border-white/5">
        <div className="flex items-center gap-4">
          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Coach Chat</h1>
        </div>
        <div className="flex gap-3">
          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900">
            <Search className="h-5 w-5" />
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 relative">
            <Bell className="h-5 w-5" />
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 px-6 pt-4 bg-[#0F0F0F]">
        {['All Clients', 'Unread', 'Groups'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0] as any)}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-widest relative",
              (activeTab === tab.toLowerCase().split(' ')[0] || (activeTab === 'all' && tab === 'All Clients'))
                ? "text-white" 
                : "text-zinc-500"
            )}
          >
            {tab}
            {(activeTab === tab.toLowerCase().split(' ')[0] || (activeTab === 'all' && tab === 'All Clients')) && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]">
        {/* Chat Client Header */}
        {selectedClient && (
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                <Image src={selectedClient.avatar} alt={selectedClient.name} fill className="object-cover" />
                <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-primary border-2 border-[#0A0A0A]" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight leading-none mb-1">{selectedClient.name}</h3>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{selectedClient.status}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5">
                <Video className="h-5 w-5" />
              </button>
              <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5">
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex justify-center">
            <span className="px-4 py-1.5 rounded-full bg-zinc-900 text-[8px] font-black uppercase tracking-widest text-zinc-500">Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[85%]",
              msg.sender === 'coach' ? "ml-auto" : "mr-auto"
            )}>
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed",
                msg.sender === 'coach' 
                  ? "bg-zinc-900/50 border border-white/5 rounded-tr-none text-zinc-300" 
                  : "bg-primary text-black font-medium rounded-tl-none shadow-[0_4px_14px_0_rgba(204,255,0,0.2)]"
              )}>
                {msg.text}
              </div>
              <div className={cn(
                "flex items-center gap-2 mt-2 px-1 text-[10px] font-bold uppercase tracking-tighter text-zinc-600",
                msg.sender === 'coach' ? "justify-end" : "justify-start"
              )}>
                <span>{msg.timestamp}</span>
                {msg.sender === 'coach' && (
                  <>
                    <span>•</span>
                    <span className={cn(msg.status === 'read' ? "text-primary" : "")}>{msg.status === 'read' ? 'Read' : 'Sent'}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#0F0F0F] border-t border-white/5">
          <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-2 pl-6">
            <button className="h-8 w-8 flex items-center justify-center text-primary">
              <Plus className="h-6 w-6 stroke-[3]" />
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent py-4 text-sm font-medium focus:outline-none placeholder:text-zinc-600"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="h-12 w-16 flex items-center justify-center rounded-xl bg-primary text-black shadow-lg shadow-primary/10 transition-transform active:scale-95"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="flex w-full items-center justify-around border-t border-white/5 bg-[#0F0F0F] py-4 px-6 pb-10">
        <button onClick={() => router.push('/dashboard/coach')} className="flex flex-col items-center gap-1 text-zinc-500">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button onClick={() => router.push('/dashboard/coach/clients')} className="flex flex-col items-center gap-1 text-zinc-500">
          <Users className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Clients</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary relative">
          <MessageSquare className="h-6 w-6" />
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
