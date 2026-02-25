"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3, Dumbbell, Target, Apple,
  MessageCircle, CreditCard, LogOut,
  CheckCircle2, XCircle, Clock, ChevronRight,
  AlertTriangle
} from "lucide-react";

export default function BillingPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [subscription, setSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const get = async (path: string) => {
    const res = await fetch(`${API}/api${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.status.toString());
    return res.json();
  };

  useEffect(() => {
    if (isLoading) return;
    if (!token) { router.push("/login"); return; }
    fetchAll();
  }, [token, isLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get("/subscriptions/my-subscription"),
      get("/subscriptions/my-history"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setSubscription(results[0].value);
    if (results[1].status === "fulfilled") setHistory(results[1].value);
    if (results[2].status === "fulfilled") setUnread(results[2].value);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    try {
      await fetch(`${API}/api/subscriptions/cancel/${subscription.coachId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Subscription cancelled. You'll have access until the end of your billing period.");
      setShowConfirm(false);
      fetchAll();
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      alert("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    active: { color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: CheckCircle2, label: "Active" },
    cancelled: { color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: XCircle, label: "Cancelled" },
    past_due: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle, label: "Past Due" },
    inactive: { color: "text-zinc-500", bg: "bg-zinc-900 border-white/5", icon: Clock, label: "Inactive" },
  };

  const paymentStatusConfig: Record<string, string> = {
    paid: "text-primary",
    failed: "text-red-400",
    pending: "text-yellow-400",
  };

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition" },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing", active: true },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  const status = subscription ? statusConfig[subscription.status] || statusConfig.inactive : null;

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

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Subscription & Payments
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Billing</h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-950 border border-white/5 rounded-xl shimmer" />)}
          </div>
        ) : subscription ? (
          <>
            {/* Current Subscription */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Current Plan
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                    Coaching Subscription
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    Personal coaching with your assigned coach
                  </p>
                </div>
                {status && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                    <status.icon className="h-3.5 w-3.5" />
                    {status.label}
                  </div>
                )}
              </div>

              {/* Billing Details Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Monthly Amount", value: `$${subscription.amount}`, sub: subscription.currency?.toUpperCase() },
                  { label: "Billing Cycle", value: "Monthly", sub: "30 days" },
                  { label: "Period Start", value: new Date(subscription.currentPeriodStart).toLocaleDateString() },
                  {
                    label: subscription.cancelAtPeriodEnd ? "Access Until" : "Next Payment",
                    value: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
                    highlight: subscription.cancelAtPeriodEnd,
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">{item.label}</p>
                    <p className={`text-lg font-black ${item.highlight ? "text-orange-400" : "text-white"}`}>
                      {item.value}
                    </p>
                    {item.sub && <p className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Cancel at period end warning */}
              {subscription.cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 mb-6">
                  <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-orange-400 mb-1">Cancellation Scheduled</p>
                    <p className="text-xs text-zinc-500">
                      Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                      You'll keep full access until then.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-5 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
                <button
                  onClick={() => router.push("/coaches")}
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/5 bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-lg hover:text-white transition-colors"
                >
                  Browse Coaches <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">
                Payment History
              </p>
              {subscription.paymentHistory?.length > 0 ? (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 px-4 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Date</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Invoice</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-right">Amount</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-right">Status</span>
                  </div>
                  {subscription.paymentHistory.map((payment: any, i: number) => (
                    <div key={i} className="grid grid-cols-4 gap-4 items-center bg-zinc-900 rounded-lg px-4 py-3">
                      <span className="text-sm text-zinc-400">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-zinc-600 font-mono truncate">
                        {payment.invoiceId?.slice(0, 12)}...
                      </span>
                      <span className="text-sm font-black text-right">
                        ${payment.amount}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest text-right ${
                        paymentStatusConfig[payment.status] || "text-zinc-500"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-zinc-600 text-sm">No payment history yet</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Subscription */
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-5">
              <CreditCard className="h-8 w-8 text-zinc-700" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">No Active Subscription</h2>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8">
              Subscribe to a coach to get personalized workout plans, progress tracking and direct messaging.
            </p>
            <button
              onClick={() => router.push("/coaches")}
              className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Find a Coach
            </button>
          </div>
        )}
      </main>

      {/* Cancel Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/5 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest">Cancel Subscription</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-2">
              Are you sure you want to cancel your subscription?
            </p>
            <p className="text-zinc-600 text-xs mb-6">
              You'll keep full access until <strong className="text-zinc-400">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </strong>. After that your plan and coaching access will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-white/5 bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-lg hover:text-white transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}