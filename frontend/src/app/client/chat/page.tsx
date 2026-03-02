"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import {
  BarChart3, Dumbbell, Target, Apple,
  MessageCircle, CreditCard, LogOut,
  Send, Check, CheckCheck
} from "lucide-react";

interface Message {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name: string; avatar: string };
  receiverId: { _id: string; name: string; avatar: string };
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name: string; avatar: string; role: string };
  receiverId: { _id: string; name: string; avatar: string; role: string };
  content: string;
  createdAt: string;
}

export default function ClientChat() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myCoach, setMyCoach] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

  const post = async (path: string, body: any) => {
    const res = await fetch(`${API}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  // connect socket
  useEffect(() => {
    if (isLoading || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.find((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      // refresh conversations list
      fetchConversations();
    });

    socket.on("userTyping", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== user?.id) setIsTyping(isTyping);
    });

    socket.on("messagesRead", () => {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, isLoading]);

  // fetch initial data
  useEffect(() => {
    if (isLoading) return;
    if (!token) { router.push("/login"); return; }
    fetchConversations();
    fetchUnread();
  }, [token, isLoading]);

  // scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const [convData, subData] = await Promise.allSettled([
        get("/chat/conversations"),
        get("/subscriptions/my"),
      ]);
      if (convData.status === "fulfilled") setConversations(convData.value);
      if (subData.status === "fulfilled" && subData.value?.coachId) {
        setMyCoach(subData.value.coachId);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const startChatWithCoach = async () => {
    if (!myCoach) return;
    // check if conversation already exists
    const existing = conversations.find(c =>
      c.senderId._id === myCoach._id || c.receiverId._id === myCoach._id
    );
    if (existing) {
      openConversation(existing);
      return;
    }
    // send a greeting to start the conversation
    try {
      await post(`/chat/${myCoach._id}`, { content: "Hi! I wanted to reach out." });
      await fetchConversations();
      setActiveUser(myCoach);
      const msgs = await get(`/chat/${myCoach._id}`);
      setMessages(msgs);
      setActiveConv(`${user?.id}_${myCoach._id}`);
    } catch {}
  };

  const fetchUnread = async () => {
    try {
      const count = await get("/chat/unread/count");
      setUnread(count);
    } catch {}
  };

  const openConversation = async (conv: Conversation) => {
    // find the other user
    const other = conv.senderId._id === user?.id ? conv.receiverId : conv.senderId;
    setActiveUser(other);
    setActiveConv(conv.conversationId);

    try {
      const msgs = await get(`/chat/${other._id}`);
      setMessages(msgs);

      // mark as read
      socketRef.current?.emit("markRead", { conversationId: conv.conversationId });
      setUnread(0);
    } catch {}
  };

  const sendMessage = () => {
    if (!input.trim() || !activeUser || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      receiverId: activeUser._id,
      content: input.trim(),
      type: "text",
    });

    setInput("");

    // stop typing indicator
    socketRef.current.emit("typing", {
      receiverId: activeUser._id,
      isTyping: false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (value: string) => {
    setInput(value);
    if (!activeUser || !socketRef.current) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", { receiverId: activeUser._id, isTyping: true });
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      socketRef.current?.emit("typing", { receiverId: activeUser._id, isTyping: false });
    }, 1500);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  // group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const group = groupedMessages.find((g) => g.date === date);
    if (group) group.messages.push(msg);
    else groupedMessages.push({ date, messages: [msg] });
  });

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", active: true, badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col py-8 px-4 sticky top-0 h-screen">
        <div className="px-2 mb-10">
          <span className="text-xl font-black uppercase tracking-tighter">
            FIT<span className="text-primary">PRO</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                item.active
                  ? "bg-white/5 text-primary border-l-2 border-primary"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
             >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-primary text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black text-sm">
              {user?.name?.[0] || "?"}
            </div>
            <div>
              <div className="text-xs font-bold">{user?.name}</div>
              <div className="text-[10px] text-zinc-600 uppercase">Client</div>
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-zinc-600 hover:text-white text-xs font-semibold transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Conversations List */}
        <div className="w-72 border-r border-white/5 flex flex-col">
          <div className="px-5 py-5 border-b border-white/5">
            <h2 className="text-sm font-black uppercase tracking-widest">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded shimmer" />)}
              </div>
            ) : (
              <>
                {/* Coach contact */}
                {myCoach && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Your Coach</p>
                    <button onClick={startChatWithCoach}
                      className="w-full flex items-center gap-3 px-3 py-3 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors text-left mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black text-sm shrink-0">
                        {myCoach.name?.[0] || "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{myCoach.name}</p>
                        <p className="text-[10px] text-primary">Tap to message</p>
                      </div>
                    </button>
                  </div>
                )}
                {/* Existing conversations */}
                {conversations.length > 0 && (
                  <div className="px-4 pb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Recent</p>
                  </div>
                )}
                {conversations.map((conv, i) => {
                  const other = conv.senderId._id === user?.id ? conv.receiverId : conv.senderId;
                  const isActive = activeConv === conv.conversationId;
                  return (
                    <button key={i} onClick={() => openConversation(conv)}
                      className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors border-b border-white/3 text-left ${isActive ? "bg-white/5" : ""}`}>
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-sm shrink-0 relative">
                        {other.name?.[0] || "?"}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold truncate">{other.name}</p>
                          <p className="text-[10px] text-zinc-600 shrink-0 ml-2">{formatTime(conv.createdAt)}</p>
                        </div>
                        <p className="text-xs text-zinc-600 truncate">{conv.content}</p>
                      </div>
                    </button>
                  );
                })}
                {!myCoach && conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                    <MessageCircle className="h-8 w-8 text-zinc-700 mb-3" />
                    <p className="text-zinc-600 text-sm">No conversations yet</p>
                    <p className="text-zinc-700 text-xs mt-1">Subscribe to a coach to start chatting</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-sm">
                  {activeUser.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-black">{activeUser.name}</p>
                  <p className="text-[10px] text-zinc-600 capitalize">{activeUser.role}</p>
                </div>
                {isTyping && (
                  <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    typing...
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        {group.date}
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="space-y-2">
                      {group.messages.map((msg) => {
                        const isMine = msg.senderId._id === user?.id;
                        return (
                          <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                isMine
                                  ? "bg-primary text-black font-medium rounded-br-sm"
                                  : "bg-zinc-900 text-white rounded-bl-sm"
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`flex items-center gap-1 ${isMine ? "justify-end" : ""}`}>
                                <span className="text-[10px] text-zinc-600">{formatTime(msg.createdAt)}</span>
                                {isMine && (
                                  msg.read
                                    ? <CheckCheck className="h-3 w-3 text-primary" />
                                    : <Check className="h-3 w-3 text-zinc-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Send className="h-4 w-4 text-black" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-zinc-700" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Your Messages</h3>
              <p className="text-zinc-600 text-sm max-w-xs">
                Select a conversation from the left to start chatting with your coach
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}