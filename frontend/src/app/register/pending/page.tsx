"use client";
import Link from "next/link";

export default function PendingApproval() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white text-center">
      <div className="flex h-20 w-20 items-center justify-center bg-lime-400/10 border border-lime-400/20 rounded-full mb-8">
        <span className="text-4xl">⏳</span>
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
        Pending Approval
      </h1>
      <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-12">
        Your coach account is under review. We'll notify you once an admin approves your profile. This usually takes less than 24 hours.
      </p>
      <Link href="/login">
        <button className="h-14 px-12 bg-lime-400 font-black uppercase tracking-widest text-black hover:opacity-90 transition-opacity">
          Back to Login
        </button>
      </Link>
    </div>
  );
}