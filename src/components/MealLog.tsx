/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Meal } from '../types';
import { getTodayDateString, formatDateIndonesian } from '../utils';
import { Plus, Trash2, Calendar, Utensils, AlertCircle, Sparkles } from 'lucide-react';

interface MealLogProps {
  meals: Meal[];
  onAddMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
}

const FOOD_PRESETS = [
  { name: 'Nasi Putih (1 piring)', calories: 200, type: 'lunch' },
  { name: 'Telur Rebus (1 butir)', calories: 75, type: 'breakfast' },
  { name: 'Dada Ayam Panggang', calories: 165, type: 'lunch' },
  { name: 'Bubur Ayam Komplit', calories: 370, type: 'breakfast' },
  { name: 'Nasi Padang + Ayam Bakar', calories: 750, type: 'lunch' },
  { name: 'Gado-Gado Rendah Kalori', calories: 320, type: 'lunch' },
  { name: 'Sate Ayam Tanpa Kulit (5 tusuk)', calories: 220, type: 'dinner' },
  { name: 'Pisang Cavandish (1 buah)', calories: 95, type: 'snack' },
  { name: 'Apel Merah (1 buah)', calories: 80, type: 'snack' },
  { name: 'Whey Protein Shake', calories: 140, type: 'snack' },
  { name: 'Roti Gandum (2 lembar)', calories: 150, type: 'breakfast' },
  { name: 'Alpukat Mentega (1 buah)', calories: 160, type: 'snack' }
];

export default function MealLog({ meals, onAddMeal, onDeleteMeal }: MealLogProps) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply a preset food selection
  const handleSelectPreset = (preset: typeof FOOD_PRESETS[0]) => {
    setFoodName(preset.name);
    setCalories(preset.calories.toString());
    setMealType(preset.type as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedCalories = parseInt(calories, 10);

    // Validation
    if (!foodName.trim()) {
      setError('Nama makanan tidak boleh kosong!');
      return;
    }
    if (isNaN(parsedCalories) || parsedCalories <= 0) {
      setError('Kalori makanan harus berupa angka positif!');
      return;
    }
    if (!date) {
      setError('Tanggal konsumsi harus diisi!');
      return;
    }

    setIsSubmitting(true);

    const newMeal: Meal = {
      id: 'm-' + Date.now(),
      date,
      name: foodName.trim(),
      calories: parsedCalories,
      type: mealType
    };

    setTimeout(() => {
      onAddMeal(newMeal);
      
      // Reset input (except date)
      setFoodName('');
      setCalories('');
      setIsSubmitting(false);
    }, 200);
  };

  // Sort meals by date descending, then id descending
  const sortedMeals = [...meals].sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });

  // Category Translation Helper
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Sarapan';
      case 'lunch': return 'Makan Siang';
      case 'dinner': return 'Makan Malam';
      case 'snack': return 'Cemilan';
      default: return type;
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'lunch': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'dinner': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'snack': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Log Makanan */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-5 animate-fade-in">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" />
            Catat Asupan Makanan
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kategori Waktu
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`text-xs font-medium py-1.5 rounded-lg transition-all ${
                      mealType === type
                        ? 'bg-white text-emerald-600 shadow-xs border border-slate-100'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {getMealTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nama Makanan
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="E.g. Dada Ayam Panggang, Nasi Putih"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Kalori (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="E.g. 150"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tanggal Makan
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getTodayDateString()}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 p-3 rounded-xl border border-rose-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-add-meal"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Tambah ke Log'}
            </button>
          </form>
        </div>

        {/* Cepat Tambah Makanan Preset */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Template Makanan Populer
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {FOOD_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-left text-xs bg-slate-50/50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 p-2 rounded-lg transition-colors group flex flex-col justify-between"
              >
                <span className="font-medium text-slate-700 truncate w-full group-hover:text-emerald-800">{p.name.split(' (')[0]}</span>
                <span className="text-[10px] text-slate-400 font-mono group-hover:text-emerald-600 font-medium">{p.calories} kcal</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Riwayat Log Makanan */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" />
            Riwayat Konsumsi Makanan
          </h3>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            Total: {meals.length} entri
          </span>
        </div>

        {sortedMeals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 rounded-2xl">
            <div className="p-3 bg-slate-50 rounded-full mb-3">
              <Utensils className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">Belum ada makanan dicatat.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan form atau daftar makanan populer untuk memasukkan asupan kalori.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {sortedMeals.map((m) => (
              <div 
                key={m.id} 
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100/40 hover:border-emerald-100 hover:bg-slate-50/80 transition-all duration-200 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{m.name}</span>
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${getMealTypeColor(m.type)}`}>
                      {getMealTypeLabel(m.type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateIndonesian(m.date)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <Utensils className="w-3 h-3" />
                      {m.calories} kcal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMeal(m.id)}
                  id={`btn-delete-meal-${m.id}`}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 shrink-0"
                  title="Hapus makanan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
