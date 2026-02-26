"use client";

import { useState, Suspense } from "react";
import { Eye, EyeOff, Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

function RegisterContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setAuth } = useAuth();
  const role = (searchParams.get("role") || "client").toLowerCase(); // Ensure lowercase for backend enum

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setFormError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Google sign-up failed");
      }
      const data = await res.json();
      setAuth(data.user, data.accessToken, data.refreshToken);
      // if new user go to setup, if existing user go to dashboard
      if (data.isNewUser) {
        if (role === "coach") window.location.href = "/register/coach-setup";
        else window.location.href = "/register/athlete-setup";
      } else {
        if (data.user.role === "coach") window.location.href = "/coach/dashboard";
        else if (data.user.role === "admin") window.location.href = "/admin/dashboard";
        else window.location.href = "/client/dashboard";
      }
    } catch (err: any) {
      setFormError(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
        login(data.accessToken, data.user);
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

        {/* Error */}
        {formError && (
          <p className="mt-3 text-xs text-red-400 text-center">{formError}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">or continue with</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="mt-4 w-full flex items-center justify-center gap-3 h-12 border border-white/5 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:border-white/10 hover:text-white transition-colors disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "Signing up..." : "Continue with Google"}
        </button>
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
