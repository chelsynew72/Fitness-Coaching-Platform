"use client";

import { useState } from "react";
import { Eye, EyeOff, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { login, setAuth } = useAuth();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: "client" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Google sign-in failed");
      }
      const data = await res.json();
      setAuth(data.user, data.accessToken, data.refreshToken);
      if (data.user.role === "coach") window.location.href = "/coach/dashboard";
      else if (data.user.role === "admin") window.location.href = "/admin/dashboard";
      else window.location.href = "/client/dashboard";
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // save to localStorage directly first
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    // then update context
    login(data.accessToken, data.user);

    // then redirect based on role
    const role = data.user.role;
    console.log("Logged in as:", role);

  // find this section and update it
if (data.user.role === "coach") {
  window.location.href = "/coach/dashboard";
} else if (data.user.role === "admin") {
  window.location.href = "/admin/dashboard";
} else {
  window.location.href = "/client/dashboard";
}
  } catch (err) {
    console.error("Login error:", err);
    setError("Cannot connect to server. Is the backend running?");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-primary rounded-sm">
            <Activity className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter">PRODATA</span>
        </Link>
        <Link
          href="/register/path"
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors"
        >
          Create Account
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-12">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
              Welcome Back
            </span>
            <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tighter">
              Sign In
            </h1>
            <p className="mt-3 text-sm text-zinc-500">
              Performance data-driven coaching platform.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/5 bg-zinc-950 p-5 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-bold text-zinc-600 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-white/5 bg-zinc-950 p-5 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-700 pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 bg-primary font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_14px_0_rgba(200,255,0,0.3)]"
            >
              {loading ? "Signing in..." : (
                <>Sign In <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleGoogleLogin} disabled={googleLoading} className="flex h-12 items-center justify-center gap-3 border border-white/5 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:border-white/10 hover:text-white transition-colors disabled:opacity-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Signing in..." : "Google"}
            </button>
            <button disabled className="flex h-12 items-center justify-center gap-3 border border-white/5 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-600 cursor-not-allowed opacity-40">
              <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple (soon)
            </button>
          </div>

          {/* Register link */}
          <p className="mt-10 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register/path"
              className="font-bold text-primary hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}