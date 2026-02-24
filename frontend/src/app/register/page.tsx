"use client";

import { useState, Suspense } from "react";
import { Eye, EyeOff, Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "client").toLowerCase(); // Ensure lowercase for backend enum

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.accessToken);
        alert("Registration successful!");
        
        // Navigate based on role
        if (role === "coach") {
          router.push("/register/coach-setup");
        } else {
          router.push("/register/athlete-setup");
        }
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 text-white font-sans">
      <Link href="/register/path" className="fixed left-6 top-12 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors">
        <ChevronLeft className="h-6 w-6" />
      </Link>

      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-primary">
          <Activity className="h-10 w-10 text-black" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Create Account</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
             Registering as a <span className="text-primary italic">{role}</span>
          </p>
        </div>
      </div>

      <div className="w-full max-w-md border border-white/5 bg-zinc-950 p-8">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/10 bg-zinc-900/50 p-4 text-sm focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/10 bg-zinc-900/50 p-4 text-sm focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/10 bg-zinc-900/50 p-4 text-sm focus:border-primary focus:outline-none transition-colors pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary py-4 text-xs font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(204,255,0,0.39)]"
          >
            Create Account
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RegisterContent />
    </Suspense>
  );
}
