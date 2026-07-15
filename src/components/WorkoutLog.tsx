/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Workout } from '../types';
import { getTodayDateString, formatDateIndonesian } from '../utils';
import { Plus, Trash2, Calendar, Clock, Flame, BookOpen, AlertCircle } from 'lucide-react';

interface WorkoutLogProps {
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
}

const WORKOUT_PRESETS = [
  { type: 'Lari', met: 9.8, label: 'Lari (Running)' },
  { type: 'Angkat Beban', met: 5.0, label: 'Angkat Beban (Strength)' },
  { type: 'Bersepeda', met: 7.5, label: 'Bersepeda (Cycling)' },
  { type: 'Renang', met: 8.0, label: 'Renang (Swimming)' },
  { type: 'Yoga', met: 3.0, label: 'Yoga' },
  { type: 'Jalan Kaki', met: 3.8, label: 'Jalan Kaki (Walking)' },
  { type: 'Lompat Tali', met: 11.0, label: 'Lompat Tali (Jump Rope)' },
  { type: 'Lainnya', met: 5.0, label: 'Lainnya (Kustom)' }
];

export default function WorkoutLog({ workouts, onAddWorkout, onDeleteWorkout }: WorkoutLogProps) {
  const [type, setType] = useState('Lari');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate estimated calories based on duration and MET values
  const handleEstimateCalories = () => {
    const min = parseFloat(duration);
    if (!min || min <= 0) {
      setError('Masukkan durasi latihan terlebih dahulu untuk mengestimasi kalori!');
      return;
    }
    setError('');
    const preset = WORKOUT_PRESETS.find(p => p.type === type) || WORKOUT_PRESETS[WORKOUT_PRESETS.length - 1];
    
    // Simple calorie estimation formula: MET * 3.5 * weightKg / 200 * durationMinutes
    // Assuming average weight of 70kg for quick estimation
    const weightEst = 70;
    const estimated = Math.round(preset.met * 3.5 * weightEst * min / 200);
    setCalories(estimated.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalType = type === 'Lainnya' ? (customType.trim() || 'Olahraga Kustom') : type;
    const parsedDuration = parseInt(duration, 10);
    const parsedCalories = parseInt(calories, 10);

    // Validation
    if (!finalType) {
      setError('Jenis olahraga tidak boleh kosong!');
      return;
    }
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError('Durasi harus berupa angka positif!');
      return;
    }
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      setError('Kalori tidak boleh negatif!');
      return;
    }
    if (!date) {
      setError('Tanggal pengerjaan harus diisi!');
      return;
    }

    setIsSubmitting(true);
    
    const newWorkout: Workout = {
      id: 'w-' + Date.now(),
      date,
      type: finalType,
      duration: parsedDuration,
      calories: parsedCalories,
      notes: notes.trim() || undefined
    };

    setTimeout(() => {
      onAddWorkout(newWorkout);
      
      // Reset form (except date)
      setDuration('');
      setCalories('');
      setNotes('');
      setCustomType('');
      setIsSubmitting(false);
    }, 200);
  };

  // Sort workouts newest date first, then newest ID first
  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Log Latihan */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit animate-fade-in">
        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Catat Olahraga Baru
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Jenis Olahraga
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {WORKOUT_PRESETS.map((p) => (
                <option key={p.type} value={p.type}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {type === 'Lainnya' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nama Olahraga Kustom
              </label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="E.g. Pilates, Zumba"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Durasi (menit)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="E.g. 30"
                min="1"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kalori (kcal)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="E.g. 250"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-12 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleEstimateCalories}
                  className="absolute right-2 top-1.5 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-1.5 py-1 rounded-md font-medium transition-colors"
                  title="Estimasi kalori otomatis berdasarkan durasi"
                >
                  Est
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tanggal Olahraga
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getTodayDateString()}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. rute lari, denyut nadi rata-rata, dll"
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
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
            id="btn-add-workout"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Tambah ke Log'}
          </button>
        </form>
      </div>

      {/* Riwayat Log Latihan */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Riwayat Aktivitas Fisik
          </h3>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            Total: {workouts.length} entri
          </span>
        </div>

        {sortedWorkouts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 rounded-2xl">
            <div className="p-3 bg-slate-50 rounded-full mb-3">
              <Flame className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">Belum ada olahraga dicatat.</p>
            <p className="text-xs text-slate-400 mt-1">Masukkan data olahraga pertama Anda menggunakan form di samping.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {sortedWorkouts.map((w) => (
              <div 
                key={w.id} 
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100/40 hover:border-indigo-100 hover:bg-slate-50/80 transition-all duration-200 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{w.type}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
                      {w.duration} menit
                    </span>
                  </div>
                  
                  {w.notes && (
                    <p className="text-xs text-slate-500 italic max-w-sm">
                      "{w.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateIndonesian(w.date)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-orange-500">
                      <Flame className="w-3 h-3" />
                      {w.calories} kcal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteWorkout(w.id)}
                  id={`btn-delete-workout-${w.id}`}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 shrink-0"
                  title="Hapus entri"
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
