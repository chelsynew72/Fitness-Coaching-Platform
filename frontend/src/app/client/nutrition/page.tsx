"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  BarChart3, Dumbbell, Target, Apple,
  MessageCircle, CreditCard, LogOut,
  Search, Plus, X, Flame, Beef, Wheat, Droplets
} from "lucide-react";

interface Food {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  barcode: string;
}

interface MealFood extends Food {
  customQuantity: number;
}

export default function NutritionPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [todayLog, setTodayLog] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [macrosChart, setMacrosChart] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  // food search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedFoods, setSelectedFoods] = useState<MealFood[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
      get("/nutrition/today"),
      get("/nutrition/summary/weekly"),
      get("/nutrition/charts/macros"),
      get("/chat/unread/count"),
    ]);
    if (results[0].status === "fulfilled") setTodayLog(results[0].value);
    if (results[1].status === "fulfilled") setWeeklySummary(results[1].value);
    if (results[2].status === "fulfilled") setMacrosChart(results[2].value);
    if (results[3].status === "fulfilled") setUnread(results[3].value);
    setLoading(false);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await get(`/nutrition/search/food?q=${encodeURIComponent(q)}`);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const addFood = (food: Food) => {
    setSelectedFoods((prev) => [...prev, { ...food, customQuantity: 100 }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, qty: number) => {
    setSelectedFoods((prev) => prev.map((f, i) => i === index ? { ...f, customQuantity: qty } : f));
  };

  // scale nutrition values based on quantity (base is 100g)
  const scale = (value: number, qty: number) => Math.round((value * qty) / 100);

  const mealTotals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + scale(f.calories, f.customQuantity),
    protein: acc.protein + scale(f.protein, f.customQuantity),
    carbs: acc.carbs + scale(f.carbs, f.customQuantity),
    fat: acc.fat + scale(f.fat, f.customQuantity),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const existingMeals = todayLog?.meals || [];

      // find if this meal type already exists
      const existingMealIndex = existingMeals.findIndex(
        (m: any) => m.type === selectedMealType
      );

      const newFoods = selectedFoods.map((f) => ({
        name: f.name,
        brand: f.brand,
        quantity: `${f.customQuantity}g`,
        calories: scale(f.calories, f.customQuantity),
        protein: scale(f.protein, f.customQuantity),
        carbs: scale(f.carbs, f.customQuantity),
        fat: scale(f.fat, f.customQuantity),
        barcode: f.barcode,
      }));

      let meals;
      if (existingMealIndex >= 0) {
        // add to existing meal
        meals = existingMeals.map((m: any, i: number) =>
          i === existingMealIndex
            ? { ...m, foods: [...m.foods, ...newFoods] }
            : m
        );
      } else {
        // create new meal
        meals = [...existingMeals, { type: selectedMealType, foods: newFoods }];
      }

      await fetch(`${API}/api/nutrition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: today, meals }),
      });

      setSuccess(true);
      setShowSearch(false);
      setSelectedFoods([]);
      fetchAll();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Failed to log meal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const calorieGoal = todayLog?.calorieGoal || 2400;
  const todayCalories = todayLog?.totalCalories || 0;
  const caloriePct = Math.min(Math.round((todayCalories / calorieGoal) * 100), 100);

  const chartData = macrosChart.slice(-7).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    calories: d.calories,
    protein: d.protein,
    carbs: d.carbs,
    fat: d.fat,
  }));

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/client/dashboard" },
    { label: "My Plan", icon: Dumbbell, href: "/client/my-plan" },
    { label: "Progress", icon: Target, href: "/client/progress" },
    { label: "Nutrition", icon: Apple, href: "/client/nutrition", active: true },
    { label: "Messages", icon: MessageCircle, href: "/client/chat", badge: unread },
    { label: "Billing", icon: CreditCard, href: "/client/billing" },
  ];

  if (isLoading) return <div className="min-h-screen bg-black" />;

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const mealEmojis: Record<string, string> = {
    breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎"
  };

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
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Daily Intake</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Nutrition</h1>
          </div>
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                ✓ Meal logged!
              </span>
            )}
            <button onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Log Meal
            </button>
          </div>
        </div>

        {/* Today's Calories */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Calories", value: todayLog?.totalCalories ?? 0, goal: calorieGoal, unit: "kcal", icon: Flame, color: "text-primary" },
            { label: "Protein", value: todayLog?.totalProtein ?? 0, goal: todayLog?.proteinGoal ?? 150, unit: "g", icon: Beef, color: "text-red-400" },
            { label: "Carbs", value: todayLog?.totalCarbs ?? 0, goal: null, unit: "g", icon: Wheat, color: "text-yellow-400" },
            { label: "Fat", value: todayLog?.totalFat ?? 0, goal: null, unit: "g", icon: Droplets, color: "text-blue-400" },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              {loading ? (
                <div className="h-8 bg-zinc-900 rounded shimmer" />
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                    <span className="text-xs text-zinc-600">{s.unit}</span>
                    {s.goal && <span className="text-xs text-zinc-600">/ {s.goal}</span>}
                  </div>
                  {s.goal && (
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((s.value / s.goal) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Calorie Progress Bar */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Daily Calorie Goal
            </span>
            <span className="text-sm font-black">
              <span className="text-primary">{todayCalories}</span>
              <span className="text-zinc-600"> / {calorieGoal} kcal</span>
            </span>
          </div>
          <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                caloriePct > 100 ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${caloriePct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-zinc-600">{caloriePct}% of daily goal</span>
            <span className="text-[10px] text-zinc-600">
              {Math.max(calorieGoal - todayCalories, 0)} kcal remaining
            </span>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mealTypes.map((mealType) => {
            const meal = todayLog?.meals?.find((m: any) => m.type === mealType);
            return (
              <div key={mealType} className="bg-zinc-950 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mealEmojis[mealType]}</span>
                    <span className="text-sm font-black uppercase tracking-tight capitalize">{mealType}</span>
                  </div>
                  {meal && (
                    <span className="text-xs font-black text-primary">{meal.totalCalories} kcal</span>
                  )}
                </div>
                {meal?.foods?.length > 0 ? (
                  <div className="space-y-2">
                    {meal.foods.map((food: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-semibold">{food.name}</p>
                          {food.brand && <p className="text-[10px] text-zinc-600">{food.brand} · {food.quantity}</p>}
                        </div>
                        <span className="text-xs font-black text-zinc-400">{food.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-zinc-700 text-xs">No foods logged</p>
                    <button
                      onClick={() => { setSelectedMealType(mealType); setShowSearch(true); }}
                      className="text-[10px] font-black text-primary mt-2 flex items-center gap-1 mx-auto"
                    >
                      <Plus className="h-3 w-3" /> Add food
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Macros Chart */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Weekly Calories
            </span>
            {weeklySummary && (
              <span className="text-xs text-zinc-500">
                Avg {weeklySummary.avgCalories} kcal/day
              </span>
            )}
          </div>
          {loading ? (
            <div className="h-44 bg-zinc-900 rounded shimmer" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#C8FF00" }}
                  formatter={(v: any) => [`${v} kcal`, "Calories"]}
                />
                <Bar dataKey="calories" fill="#C8FF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-zinc-600 text-sm">
              Log meals to see weekly trends
            </div>
          )}
        </div>
      </main>

      {/* Log Meal Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/5 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest">Log Meal</h2>
              <button onClick={() => { setShowSearch(false); setSelectedFoods([]); setSearchResults([]); setSearchQuery(""); }}
                className="text-zinc-600 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Meal Type Selector */}
              <div className="flex gap-2 mb-5">
                {mealTypes.map((type) => (
                  <button key={type} onClick={() => setSelectedMealType(type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      selectedMealType === type
                        ? "bg-primary text-black"
                        : "bg-zinc-900 text-zinc-500 hover:text-white"
                    }`}>
                    {mealEmojis[type]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 text-center mb-5 capitalize">
                Adding to: <span className="text-primary font-bold">{selectedMealType}</span>
              </p>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search foods... (e.g. chicken breast, oats)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-zinc-700"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">Searching...</div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                  {searchResults.map((food, i) => (
                    <button key={i} onClick={() => addFood(food)}
                      className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 rounded-lg px-4 py-3 transition-colors text-left">
                      <div>
                        <p className="text-sm font-semibold">{food.name}</p>
                        <p className="text-[10px] text-zinc-600">{food.brand} · per 100g</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary">{food.calories} kcal</p>
                        <p className="text-[10px] text-zinc-600">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Foods */}
              {selectedFoods.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    Selected Foods
                  </p>
                  <div className="space-y-2">
                    {selectedFoods.map((food, i) => (
                      <div key={i} className="bg-zinc-900 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold">{food.name}</p>
                            <p className="text-[10px] text-zinc-600">{food.brand}</p>
                          </div>
                          <button onClick={() => removeFood(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(i, Math.max(10, food.customQuantity - 10))}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white font-black text-sm flex items-center justify-center">−</button>
                            <span className="text-sm font-black w-12 text-center">{food.customQuantity}g</span>
                            <button onClick={() => updateQuantity(i, food.customQuantity + 10)}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white font-black text-sm flex items-center justify-center">+</button>
                          </div>
                          <div className="flex gap-3 text-[10px] text-zinc-500 ml-auto">
                            <span className="text-primary font-black">{scale(food.calories, food.customQuantity)} kcal</span>
                            <span>P:{scale(food.protein, food.customQuantity)}g</span>
                            <span>C:{scale(food.carbs, food.customQuantity)}g</span>
                            <span>F:{scale(food.fat, food.customQuantity)}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meal Total */}
                  <div className="mt-3 flex justify-between items-center bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
                    <span className="text-xs font-bold text-zinc-400">Meal Total</span>
                    <div className="flex gap-3 text-xs font-black">
                      <span className="text-primary">{mealTotals.calories} kcal</span>
                      <span className="text-zinc-400">P:{mealTotals.protein}g</span>
                      <span className="text-zinc-400">C:{mealTotals.carbs}g</span>
                      <span className="text-zinc-400">F:{mealTotals.fat}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5">
              <button onClick={handleLogMeal} disabled={submitting || selectedFoods.length === 0}
                className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                {submitting ? "Saving..." : `Log ${selectedFoods.length} Food${selectedFoods.length !== 1 ? "s" : ""} to ${selectedMealType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}