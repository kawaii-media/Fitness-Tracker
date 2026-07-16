/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Scale, 
  Flame, 
  Droplet, 
  ChevronRight, 
  Dumbbell, 
  Sparkles,
  Info
} from 'lucide-react';

interface OnboardingFormProps {
  onSubmit: (profile: Omit<UserProfile, 'isOnboarded'> & { height: number }) => void;
}

export default function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('170');
  const [currentWeight, setCurrentWeight] = useState('70');
  const [weightTarget, setWeightTarget] = useState('65');
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [calorieBurnTarget, setCalorieBurnTarget] = useState('300');
  const [waterTarget, setWaterTarget] = useState('2000');
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain'>('lose');
  
  const [error, setError] = useState('');

  // Mifflin-St Jeor Equation for BMR with standard multiplier
  const weightVal = parseFloat(currentWeight) || 70;
  const heightVal = parseFloat(height) || 170;
  const computedBmr = (10 * weightVal) + (6.25 * heightVal) - (5 * 25); // Assumes active adult median age (25)
  const computedTdee = Math.round(computedBmr * 1.375); // Moderately active multiplier

  let recommendedCalories = 2000;
  let recommendedWater = 2000;
  let recommendedBurn = 300;

  if (goal === 'lose') {
    recommendedCalories = Math.max(1200, computedTdee - 400);
    recommendedWater = Math.round((weightVal * 35 + 250) / 100) * 100;
    recommendedBurn = 350;
  } else if (goal === 'gain') {
    recommendedCalories = computedTdee + 350;
    recommendedWater = Math.round((weightVal * 35 + 500) / 100) * 100;
    recommendedBurn = 300;
  } else {
    recommendedCalories = computedTdee;
    recommendedWater = Math.round((weightVal * 35) / 100) * 100;
    recommendedBurn = 250;
  }

  const handleApplyRecommendation = () => {
    setCalorieTarget(recommendedCalories.toString());
    setWaterTarget(recommendedWater.toString());
    setCalorieBurnTarget(recommendedBurn.toString());
    // Auto-fill target weight if logical
    if (goal === 'lose' && parseFloat(weightTarget) >= weightVal) {
      setWeightTarget(Math.round(weightVal - 5).toString());
    } else if (goal === 'gain' && parseFloat(weightTarget) <= weightVal) {
      setWeightTarget(Math.round(weightVal + 5).toString());
    } else if (goal === 'maintain') {
      setWeightTarget(weightVal.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }

    const h = parseFloat(height);
    const cw = parseFloat(currentWeight);
    const wt = parseFloat(weightTarget);
    const ct = parseFloat(calorieTarget);
    const cbt = parseFloat(calorieBurnTarget);
    const wtTarget = parseFloat(waterTarget);

    if (isNaN(h) || h <= 50 || h > 280) {
      setError('Mohon masukkan tinggi badan yang valid (50cm - 280cm).');
      return;
    }
    if (isNaN(cw) || cw <= 20 || cw > 300) {
      setError('Mohon masukkan berat badan saat ini yang valid (20kg - 300kg).');
      return;
    }
    if (isNaN(wt) || wt <= 20 || wt > 300) {
      setError('Mohon masukkan target berat badan yang valid.');
      return;
    }
    if (isNaN(ct) || ct < 500 || ct > 10000) {
      setError('Mohon masukkan target kalori harian yang wajar (500 - 10,000 kcal).');
      return;
    }
    if (isNaN(cbt) || cbt < 50 || cbt > 5000) {
      setError('Mohon masukkan target bakar kalori olahraga yang wajar (50 - 5,000 kcal).');
      return;
    }
    if (isNaN(wtTarget) || wtTarget < 500 || wtTarget > 10000) {
      setError('Mohon masukkan target hidrasi yang wajar (500 - 10,000 ml).');
      return;
    }

    onSubmit({
      name: name.trim(),
      currentWeight: cw,
      weightTarget: wt,
      calorieTarget: ct,
      calorieBurnTarget: cbt,
      waterTarget: wtTarget,
      height: h,
      goal: goal
    });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in flex flex-col md:flex-row">
        
        {/* Left column decorative brand panel */}
        <div className="md:w-1/3 bg-slate-900 text-slate-200 p-8 flex flex-col justify-between shrink-0 border-r border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Dumbbell className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">FitLife</span>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight leading-tight mb-2">
              Mulai Langkah Sehatmu
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan target tubuh ideal, pantau latihan fisik secara presisi, serta kelola nutrisi dan hidrasi harianmu.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-medium leading-normal">
                <strong>100% Privat & Lokal</strong>: Semua informasi disimpan di dalam browser Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Right column form panel */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Profil Kesehatan Baru</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1.5">Silakan lengkapi data dasar berikut</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 font-medium flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Pratama"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Goal Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Tujuan Utama Olahraga & Kebugaran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setGoal('lose')}
                  className={`p-3 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between h-20 cursor-pointer ${
                    goal === 'lose'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${goal === 'lose' ? 'text-indigo-700' : 'text-slate-700'}`}>
                    Menurunkan Berat
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Defisit kalori sehat untuk memangkas lemak.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGoal('gain')}
                  className={`p-3 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between h-20 cursor-pointer ${
                    goal === 'gain'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${goal === 'gain' ? 'text-indigo-700' : 'text-slate-700'}`}>
                    Tambah Massa Otot
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Surplus kalori & air untuk hipertrofi otot.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGoal('maintain')}
                  className={`p-3 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between h-20 cursor-pointer ${
                    goal === 'maintain'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${goal === 'maintain' ? 'text-indigo-700' : 'text-slate-700'}`}>
                    Menjaga Kebugaran
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Nutrisi & hidrasi seimbang pemeliharaan fisik.
                  </span>
                </button>
              </div>
            </div>

            {/* Height, Weight & Target Weight Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Tinggi (cm)
                </label>
                <input
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="50"
                  max="280"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="70"
                  min="20"
                  max="300"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Target (kg)
                </label>
                <input
                  type="number"
                  required
                  value={weightTarget}
                  onChange={(e) => setWeightTarget(e.target.value)}
                  placeholder="65"
                  min="20"
                  max="300"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* Scientific Recommendations Panel */}
            <div className="p-4 bg-indigo-900 text-white rounded-2xl space-y-3.5 relative overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold tracking-wider uppercase text-indigo-200">
                  Rekomendasi Target Sehat Personal (Mifflin-St Jeor)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-700/20">
                  <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Makan Harian</div>
                  <div className="text-xs font-mono font-black text-amber-300">{recommendedCalories} kcal</div>
                  <div className="text-[8px] text-indigo-400 leading-none mt-0.5">
                    {goal === 'lose' ? 'TDEE - 400 Defisit' : goal === 'gain' ? 'TDEE + 350 Surplus' : 'TDEE Maintenance'}
                  </div>
                </div>

                <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-700/20">
                  <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Hidrasi Air</div>
                  <div className="text-xs font-mono font-black text-indigo-300">{recommendedWater} ml</div>
                  <div className="text-[8px] text-indigo-400 leading-none mt-0.5">
                    {goal === 'lose' ? 'Kebutuhan + 250ml' : goal === 'gain' ? 'Kebutuhan + 500ml' : 'Kebutuhan dasar'}
                  </div>
                </div>

                <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-700/20">
                  <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Bakar Olahraga</div>
                  <div className="text-xs font-mono font-black text-emerald-400">{recommendedBurn} kcal</div>
                  <div className="text-[8px] text-indigo-400 leading-none mt-0.5">Latihan Harian</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1.5 border-t border-indigo-800/60">
                <p className="text-[9px] text-indigo-200 leading-normal max-w-sm">
                  Formula disesuaikan untuk berat badan dan target <strong>{goal === 'lose' ? 'menurunkan berat' : goal === 'gain' ? 'menambah otot' : 'menjaga kebugaran'}</strong> Anda.
                </p>
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  className="bg-white hover:bg-indigo-50 text-indigo-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-xs self-end sm:self-auto cursor-pointer"
                >
                  ✨ Terapkan Target
                </button>
              </div>
            </div>

            {/* Calories & Water Intake Targets Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-500" />
                  Target Makan (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  placeholder="2000"
                  min="500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Bakar Olahraga (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={calorieBurnTarget}
                  onChange={(e) => setCalorieBurnTarget(e.target.value)}
                  placeholder="300"
                  min="50"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-blue-500" />
                  Target Air (ml)
                </label>
                <input
                  type="number"
                  required
                  value={waterTarget}
                  onChange={(e) => setWaterTarget(e.target.value)}
                  placeholder="2000"
                  min="500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            Mulai Perjalanan Sehat Saya
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
