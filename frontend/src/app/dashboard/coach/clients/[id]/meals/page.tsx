import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, MoreVertical, BarChart2, Sun, Utensils, Moon, 
  Plus, Home, Dumbbell, Users, Settings, Apple
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FoodItem {
  name: string;
  description: string;
  protein: number;
  carbs?: number;
  fat?: number;
  calories: number;
}

interface Meal {
  title: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  calories: number;
  items: FoodItem[];
}

interface NutritionData {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
}

export default function MealPlanner() {
  const router = useRouter();
  const params = useParams();
  const { token, isLoading: authLoading } = useAuth();
  const [activeDay, setActiveDay] = useState(12);
  const [data, setData] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNutrition = useCallback(async () => {
    try {
      const date = `2024-02-${activeDay.toString().padStart(2, '0')}`;
      const res = await fetch(`http://localhost:4000/api/nutrition/${params.id}?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const nutritionData = await res.json();
        setData(nutritionData);
      } else {
        // Mock data if not found
        setData({
          totalCalories: 1250,
          protein: 140,
          carbs: 85,
          fat: 45,
          meals: [
            {
              title: 'BREAKFAST',
              type: 'breakfast',
              calories: 420,
              items: [
                { name: 'Overnight Oats with Berries', description: '120g Oats, 50g Blueberries, 30g Whey', protein: 32, carbs: 45, calories: 380 },
                { name: 'Black Coffee', description: 'No sugar, 200ml', protein: 0, carbs: 0, calories: 5 },
              ]
            },
            {
              title: 'LUNCH',
              type: 'lunch',
              calories: 650,
              items: [
                { name: 'Grilled Chicken & Brown Rice', description: '200g Breast, 150g Rice, Broccoli', protein: 52, carbs: 65, calories: 580 },
              ]
            },
            {
              title: 'DINNER',
              type: 'dinner',
              calories: 0,
              items: []
            },
            {
              title: 'SNACKS',
              type: 'snacks',
              calories: 180,
              items: [
                { name: 'Almonds', description: '30g (Handful)', protein: 6, fat: 14, calories: 180 },
              ]
            }
          ]
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching nutrition:", error);
      setIsLoading(false);
    }
  }, [params.id, activeDay, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (!authLoading && token && isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNutrition();
    }
  }, [authLoading, token, router, fetchNutrition, isLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const macros = [
    { label: 'PROTEIN', current: data?.protein || 0, target: 180, percentage: Math.round(((data?.protein || 0) / 180) * 100), color: 'text-primary' },
    { label: 'CARBS', current: data?.carbs || 0, target: 200, percentage: Math.round(((data?.carbs || 0) / 200) * 100), color: 'text-orange-500' },
    { label: 'FAT', current: data?.fat || 0, target: 75, percentage: Math.round(((data?.fat || 0) / 75) * 100), color: 'text-lime-500' },
  ];

  const days = [
    { day: 'MON', date: 12 },
    { day: 'TUE', date: 13 },
    { day: 'WED', date: 14 },
    { day: 'THU', date: 15 },
    { day: 'FRI', date: 16 },
    { day: 'SAT', date: 17 },
    { day: 'SUN', date: 18 },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
      {/* Side Date Picker */}
      <aside className="w-20 flex flex-col items-center border-r border-white/5 py-8 gap-6 shrink-0">
        {days.map((d) => (
          <button
            key={d.date}
            onClick={() => {
              setIsLoading(true);
              setActiveDay(d.date);
            }}
            className={cn(
              "flex flex-col items-center p-3 rounded-xl transition-all",
              activeDay === d.date ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">{d.day}</span>
            <span className="text-xl font-black">{d.date}</span>
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 pt-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 border border-white/5">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Meal Planner</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Client: Alex Rivera</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5">
              <BarChart2 className="h-5 w-5 text-zinc-400" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5">
              <MoreVertical className="h-5 w-5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Macros Summary */}
        <section className="grid grid-cols-3 gap-4 px-6 mt-4">
          {macros.map((m) => (
            <div key={m.label} className="flex flex-col items-center rounded-2xl bg-zinc-900/50 border border-white/5 p-4">
              <div className="relative h-16 w-16 flex items-center justify-center mb-4">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#27272A" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                    strokeDasharray="100" strokeDashoffset={100 - m.percentage} strokeLinecap="round" 
                    className={m.color}
                  />
                </svg>
                <span className="absolute text-[10px] font-black italic">{m.percentage}%</span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{m.label}</span>
              <p className="text-[10px] font-black italic">
                <span className={m.color}>{m.current}</span>
                <span className="text-zinc-600">/{m.target}g</span>
              </p>
            </div>
          ))}
        </section>

        {/* Meals List */}
        <section className="px-6 mt-8 space-y-8 pb-12">
          {data?.meals.map((meal, idx) => (
            <div key={idx} className="relative">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-full",
                meal.type === 'breakfast' ? "bg-primary" : 
                meal.type === 'lunch' ? "bg-orange-500" : 
                meal.type === 'dinner' ? "bg-lime-500" : "bg-blue-500"
              )} />
              
              <div className="ml-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {meal.type === 'breakfast' && <Sun className="h-4 w-4 text-primary" />}
                    {meal.type === 'lunch' && <Utensils className="h-4 w-4 text-orange-500" />}
                    {meal.type === 'dinner' && <Moon className="h-4 w-4 text-lime-500" />}
                    {meal.type === 'snacks' && <Apple className="h-4 w-4 text-blue-500" />}
                    <h3 className="text-sm font-black uppercase italic tracking-wider">{meal.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {meal.calories > 0 ? `${meal.calories} kcal` : '-- kcal'}
                  </span>
                </div>

                <div className="space-y-3">
                  {meal.items.length > 0 ? (
                    meal.items.map((item, i) => (
                      <div key={i} className="rounded-2xl bg-zinc-900/30 border border-white/5 p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold mb-1">{item.name}</h4>
                          <p className="text-[8px] text-zinc-500 font-medium">{item.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.protein > 0 && (
                            <div className="flex flex-col items-center bg-zinc-900 border border-white/5 rounded-lg p-2 min-w-[40px]">
                              <span className="text-[8px] font-black text-primary uppercase">P:</span>
                              <span className="text-[10px] font-black">{item.protein}g</span>
                            </div>
                          )}
                          {item.carbs !== undefined && item.carbs > 0 && (
                            <div className="flex flex-col items-center bg-zinc-900 border border-white/5 rounded-lg p-2 min-w-[40px]">
                              <span className="text-[8px] font-black text-zinc-500 uppercase">C:</span>
                              <span className="text-[10px] font-black text-zinc-500">{item.carbs}g</span>
                            </div>
                          )}
                          {item.fat !== undefined && item.fat > 0 && (
                            <div className="flex flex-col items-center bg-zinc-900 border border-white/5 rounded-lg p-2 min-w-[40px]">
                              <span className="text-[8px] font-black text-orange-500 uppercase">F:</span>
                              <span className="text-[10px] font-black text-orange-500">{item.fat}g</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5">
                      <Utensils className="h-6 w-6 text-zinc-800 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">No items added</p>
                    </div>
                  )}

                  <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 transition-colors">
                    <Plus className="h-3 w-3 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">Add Food</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/5 px-6 pb-8 pt-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => router.push('/dashboard/coach')} className="flex flex-col items-center gap-1.5 text-zinc-500">
            <Home className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-500">
            <Dumbbell className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Workout</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-primary">
            <Utensils className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Meals</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-500">
            <Users className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Clients</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-500">
            <Settings className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

