/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrackerData, Workout, Meal, WeightLog, WaterLog, UserProfile, ScheduledWorkout } from './types';
import { getTodayDateString, generateInitialData } from './utils';
import { COMMON_INDONESIAN_FOODS } from './data/foodData';

// Import subcomponents
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import MealLog from './components/MealLog';
import WeightLogTab from './components/WeightLog';
import Timer from './components/Timer';
import DataBackup from './components/DataBackup';
import OnboardingForm from './components/OnboardingForm';
import WorkoutSchedule from './components/WorkoutSchedule';

// Import html compiler
import { generateSingleFileHTML } from './components/htmlTemplate';

// Icons
import { 
  Dumbbell, 
  Flame, 
  Utensils, 
  Droplet, 
  Scale, 
  Clock, 
  Database, 
  LayoutDashboard,
  Menu,
  X,
  FileCode,
  Calendar
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'fitness_tracker_data';

export default function App() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'schedule' | 'meals' | 'weight' | 'timer' | 'backup'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load Initial State from LocalStorage
  useEffect(() => {
    // Initialize Food Data if not present
    if (!localStorage.getItem('indonesian_food_data')) {
      localStorage.setItem('indonesian_food_data', JSON.stringify(COMMON_INDONESIAN_FOODS));
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile && parsed.workouts && parsed.meals && parsed.weightHistory) {
          if (!parsed.workoutSchedule) {
            parsed.workoutSchedule = [];
          }
          setData(parsed);
          return;
        }
      } catch (e) {
        console.error("Gagal membaca LocalStorage. Me-reset ke awal...", e);
      }
    }
    
    // Seed default data if LocalStorage is empty
    const seeded = generateInitialData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
    setData(seeded);
  }, []);

  // Sync state changes with LocalStorage
  const saveState = (updatedData: TrackerData) => {
    setData(updatedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
  };

  // Guard loading state
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <span>Memuat Dasbor Kesehatan...</span>
      </div>
    );
  }

  // Guard onboarding state
  if (!data.profile.isOnboarded) {
    return (
      <OnboardingForm 
        onSubmit={(profileData) => {
          const todayStr = getTodayDateString();
          const initialWeightLog: WeightLog = {
            id: 'wgt-' + Date.now(),
            date: todayStr,
            weight: profileData.currentWeight
          };
          saveState({
            profile: {
              ...profileData,
              isOnboarded: true
            },
            workouts: [],
            meals: [],
            weightHistory: [initialWeightLog],
            waterIntake: []
          });
        }}
      />
    );
  }

  // --- Handlers ---

  // Workouts CRUD
  const handleAddWorkout = (workout: Workout) => {
    const updatedWorkouts = [...data.workouts, workout];
    saveState({ ...data, workouts: updatedWorkouts });
  };

  const handleDeleteWorkout = (id: string) => {
    const updatedWorkouts = data.workouts.filter(w => w.id !== id);
    saveState({ ...data, workouts: updatedWorkouts });
  };

  // Scheduled Workouts Handlers
  const handleAddScheduledWorkout = (workout: ScheduledWorkout) => {
    const updatedSchedule = [...(data.workoutSchedule || []), workout];
    saveState({ ...data, workoutSchedule: updatedSchedule });
  };

  const handleDeleteScheduledWorkout = (id: string) => {
    const updatedSchedule = (data.workoutSchedule || []).filter(item => item.id !== id);
    saveState({ ...data, workoutSchedule: updatedSchedule });
  };

  const handleToggleScheduledWorkout = (id: string) => {
    const updatedSchedule = (data.workoutSchedule || []).map(item => {
      if (item.id === id) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });
    saveState({ ...data, workoutSchedule: updatedSchedule });
  };

  const handleApplyRecommendedSchedule = (schedule: ScheduledWorkout[]) => {
    saveState({ ...data, workoutSchedule: schedule });
  };

  const handleLogCompletedScheduledWorkout = (schedWorkout: ScheduledWorkout) => {
    // Determine category based on name
    let category: 'strength' | 'distance' | 'static' | 'general' = 'general';
    const typeLower = schedWorkout.type.toLowerCase();
    if (typeLower.includes('run') || typeLower.includes('cycle') || typeLower.includes('sepeda') || typeLower.includes('jogging') || typeLower.includes('jalan')) {
      category = 'distance';
    } else if (typeLower.includes('plank')) {
      category = 'static';
    } else if (typeLower.includes('push up') || typeLower.includes('pull up') || typeLower.includes('squat') || typeLower.includes('strength') || typeLower.includes('bench press') || typeLower.includes('deadlift')) {
      category = 'strength';
    }
    
    // Estimate calories burned
    const weightEst = data.profile.currentWeight || 70;
    let met = 5.0;
    if (category === 'distance') met = 7.0;
    else if (category === 'strength') met = 4.0;
    else if (category === 'static') met = 3.0;
    
    const estCal = Math.round(met * 3.5 * weightEst * schedWorkout.duration / 200);

    const loggedWorkout: Workout = {
      id: 'wkt-' + Date.now(),
      date: getTodayDateString(),
      type: schedWorkout.type,
      duration: schedWorkout.duration,
      calories: estCal,
      category,
      notes: schedWorkout.notes || `Sesi terprogram harian dari perencana jadwal (${schedWorkout.day})`
    };

    // Toggle the scheduled workout as completed as well!
    const updatedSchedule = (data.workoutSchedule || []).map(item => {
      if (item.id === schedWorkout.id) {
        return { ...item, isCompleted: true };
      }
      return item;
    });

    saveState({
      ...data,
      workouts: [...data.workouts, loggedWorkout],
      workoutSchedule: updatedSchedule
    });
  };

  // Meals CRUD
  const handleAddMeal = (meal: Meal) => {
    const updatedMeals = [...data.meals, meal];
    saveState({ ...data, meals: updatedMeals });
  };

  const handleDeleteMeal = (id: string) => {
    const updatedMeals = data.meals.filter(m => m.id !== id);
    saveState({ ...data, meals: updatedMeals });
  };

  // Weight logs CRUD
  const handleAddWeightLog = (log: WeightLog) => {
    const updatedHistory = [...data.weightHistory, log];
    saveState({ ...data, weightHistory: updatedHistory, profile: { ...data.profile, currentWeight: log.weight } });
  };

  const handleDeleteWeightLog = (id: string) => {
    const updatedHistory = data.weightHistory.filter(w => w.id !== id);
    saveState({ ...data, weightHistory: updatedHistory });
  };

  // Quick Water logger on Dashboard
  const handleUpdateWater = (amount: number) => {
    const todayStr = getTodayDateString();
    const updatedWaterList = [...data.waterIntake];
    const logIndex = updatedWaterList.findIndex(w => w.date === todayStr);

    if (logIndex >= 0) {
      updatedWaterList[logIndex].amount = Math.max(0, updatedWaterList[logIndex].amount + amount);
    } else {
      updatedWaterList.push({
        id: 'wat-' + Date.now(),
        date: todayStr,
        amount: Math.max(0, amount)
      });
    }

    saveState({ ...data, waterIntake: updatedWaterList });
  };

  // Update Profile Targets
  const handleUpdateProfile = (updatedProfile: Partial<UserProfile & { height?: number }>) => {
    saveState({
      ...data,
      profile: {
        ...data.profile,
        ...updatedProfile
      } as any
    });
  };

  // Backup Import & Reset
  const handleImportData = (importedData: TrackerData) => {
    saveState(importedData);
  };

  const handleResetData = () => {
    const freshSeeded = generateInitialData();
    saveState(freshSeeded);
  };

  // Navigation config
  const navItems = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, color: 'text-indigo-500' },
    { id: 'workouts', label: 'Olahraga', icon: Dumbbell, color: 'text-orange-500' },
    { id: 'schedule', label: 'Jadwal Latihan', icon: Calendar, color: 'text-pink-500' },
    { id: 'meals', label: 'Nutrisi', icon: Utensils, color: 'text-emerald-500' },
    { id: 'weight', label: 'Berat & BMI', icon: Scale, color: 'text-blue-500' },
    { id: 'timer', label: 'Timer HIIT', icon: Clock, color: 'text-purple-500' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, color: 'text-slate-500' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col md:flex-row antialiased font-sans text-slate-800">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 shrink-0 p-6 shadow-xl border-r border-slate-800">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Dumbbell className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-white tracking-tight">FitLife</h1>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Fitness Tracker</span>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                id={`sidebar-nav-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Quick Info Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 text-sm">
            {data.profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{data.profile.name}</h4>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Aktif & Lokal
            </span>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-md z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="w-5 h-5 text-indigo-400" />
          <h1 className="font-display font-bold text-md text-white tracking-tight">FitLife</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          id="btn-mobile-menu-toggle"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE MENUS DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] bg-slate-900 border-b border-slate-800 shadow-xl z-20 flex flex-col p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                id={`mobile-nav-${item.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN VIEWPORT PANELS */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Active Tab View Routing */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={data} 
              onUpdateWater={handleUpdateWater} 
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutLog 
              workouts={data.workouts} 
              onAddWorkout={handleAddWorkout} 
              onDeleteWorkout={handleDeleteWorkout} 
              userWeight={data.profile.currentWeight}
            />
          )}

          {activeTab === 'schedule' && (
            <WorkoutSchedule 
              schedule={data.workoutSchedule || []} 
              profile={data.profile}
              onAddScheduledWorkout={handleAddScheduledWorkout}
              onDeleteScheduledWorkout={handleDeleteScheduledWorkout}
              onToggleScheduledWorkout={handleToggleScheduledWorkout}
              onLogCompletedScheduledWorkout={handleLogCompletedScheduledWorkout}
              onApplyRecommendedSchedule={handleApplyRecommendedSchedule}
            />
          )}

          {activeTab === 'meals' && (
            <MealLog 
              meals={data.meals} 
              onAddMeal={handleAddMeal} 
              onDeleteMeal={handleDeleteMeal} 
            />
          )}

          {activeTab === 'weight' && (
            <WeightLogTab 
              weightHistory={data.weightHistory} 
              profile={data.profile} 
              onAddWeightLog={handleAddWeightLog} 
              onDeleteWeightLog={handleDeleteWeightLog} 
              onUpdateProfile={handleUpdateProfile} 
            />
          )}

          {activeTab === 'timer' && (
            <Timer />
          )}

          {activeTab === 'backup' && (
            <DataBackup 
              data={data} 
              onImportData={handleImportData} 
              onResetData={handleResetData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
