"use client";

import { useState } from "react";
import { Eye, EyeOff, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, data.user);
        
        // Role-based redirection
        if (data.user.role === "coach") {
          router.push("/dashboard/coach");
        } else if (data.user.role === "client") {
          router.push("/dashboard/athlete");
        } else {
          router.push("/");
        }
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 text-white font-sans">
      {/* Logo Section */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center bg-primary">
          <Activity className="h-10 w-10 text-black" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Titan Coaching</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Performance Data-Driven</p>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="w-full max-w-md border border-white/5 bg-zinc-950 p-8">
        <h2 className="text-2xl font-bold mb-8">Sign In</h2>
        
        <form onSubmit={handleSignIn} className="space-y-6">
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
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
              <Link href="/forgot-password" title="Forgot Password?" className="text-[10px] font-bold text-zinc-500 hover:text-primary transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
            className="w-full bg-primary py-4 text-xs font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <span className="bg-zinc-950 px-4">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 border border-white/5 bg-zinc-900/50 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
             <span className="text-sm">G</span> Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/5 bg-zinc-900/50 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
             <span className="text-sm"></span> Apple
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/register/path" className="font-bold text-primary hover:underline">
          Create an Account
        </Link>
      </p>
    </div>
  );
}
