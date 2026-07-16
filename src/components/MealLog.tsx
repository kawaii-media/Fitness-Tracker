/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import { getTodayDateString, formatDateIndonesian } from '../utils';
import { Plus, Trash2, Calendar, Utensils, AlertCircle, Sparkles } from 'lucide-react';
import { COMMON_INDONESIAN_FOODS } from '../data/foodData';

interface MealLogProps {
  meals: Meal[];
  onAddMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
}

export default function MealLog({ meals, onAddMeal, onDeleteMeal }: MealLogProps) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [presets, setPresets] = useState<any[]>([]);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('indonesian_food_data');
    if (saved) {
      setPresets(JSON.parse(saved));
    } else {
      setPresets(COMMON_INDONESIAN_FOODS);
    }
  }, []);

  // State to track multiple selected presets
  const [selectedPresets, setSelectedPresets] = useState<any[]>([]);

  // Apply or toggle a preset food selection
  const handleTogglePreset = (preset: any) => {
    let updated: any[] = [];
    const exists = selectedPresets.some(p => p.name === preset.name);
    
    if (exists) {
      updated = selectedPresets.filter(p => p.name !== preset.name);
    } else {
      updated = [...selectedPresets, preset];
    }
    
    setSelectedPresets(updated);

    if (updated.length > 0) {
      // Combine food names cleanly
      const combinedName = updated.map(p => p.name).join(' + ');
      setFoodName(combinedName);
      setSuggestions([]);
      setShowSuggestions(false);

      // Sum calories
      const totalCalories = updated.reduce((sum, p) => sum + p.calories, 0);
      setCalories(totalCalories.toString());

      // Set meal type to match the latest selected preset's type (fallback to snack)
      setMealType('lunch');
    } else {
      setFoodName('');
      setCalories('');
    }
  };

  const handleClearPresets = () => {
    setSelectedPresets([]);
    setFoodName('');
    setCalories('');
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
      setSelectedPresets([]);
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
              <div className="space-y-2 relative">
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFoodName(value);
                    if (value.length > 1) {
                      const filtered = presets.filter(p => 
                        p.name.toLowerCase().includes(value.toLowerCase())
                      );
                      setSuggestions(filtered);
                      setShowSuggestions(true);
                    } else {
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="E.g. Nasi putih dan tempe goreng"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFoodName(s.name);
                          setCalories(s.calories.toString());
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50"
                      >
                        {s.name} - {s.calories} kcal
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            
            <p className="text-[10px] text-slate-400 text-center mt-4">
              *Informasi kalori adalah estimasi berdasarkan data nutrisi umum, bukan sebagai pengganti saran medis.
            </p>

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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Template Makanan (Multi-Pilih)
            </div>
            {selectedPresets.length > 0 && (
              <button
                type="button"
                onClick={handleClearPresets}
                className="text-[10px] text-rose-500 hover:text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              >
                Hapus Pilihan ({selectedPresets.length})
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mb-2">
            Klik beberapa makanan untuk menggabungkan porsi dan kalori secara otomatis.
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {presets.map((p, idx) => {
              const isActive = selectedPresets.some(sp => sp.name === p.name);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTogglePreset(p)}
                  className={`text-left text-xs p-2 rounded-lg transition-all flex flex-col justify-between border cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50/50 hover:bg-emerald-50/50 border-slate-100 hover:border-emerald-200 text-slate-700'
                  }`}
                >
                  <span className={`font-bold truncate w-full ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {p.name.split(' (')[0]}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {p.calories} kcal
                  </span>
                </button>
              );
            })}
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
