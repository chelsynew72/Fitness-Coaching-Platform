"use client";

import { useState } from "react";
import { ChevronLeft, Mail, RefreshCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Reset link sent to ${email} (Mock)`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 text-white font-sans">
      <Link href="/login" className="fixed left-6 top-12 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors">
        <ChevronLeft className="h-6 w-6" />
      </Link>

      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 mb-8">
        <RefreshCcw className="h-10 w-10 text-primary" />
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Forgot Password</h1>
        <p className="mt-4 text-zinc-500 text-sm max-w-xs mx-auto">
          Enter your email to receive a secure link to reset your account.
        </p>
      </div>

      <form onSubmit={handleSendReset} className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="email"
              placeholder="coach@fitness-pro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/10 bg-zinc-900/50 p-4 pl-12 text-sm focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-xs font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(204,255,0,0.39)]"
        >
          Send Reset Link <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <div className="mt-12 flex flex-col items-center gap-6">
        <Link href="/login" className="text-sm text-zinc-500">
          Back to <span className="font-bold text-primary">Login</span>
        </Link>
        <div className="flex gap-2">
          <div className="h-0.5 w-6 rounded-full bg-primary" />
          <div className="h-0.5 w-6 rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
