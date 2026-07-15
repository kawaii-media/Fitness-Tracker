/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Workout } from '../types';
import { getTodayDateString, formatDateIndonesian } from '../utils';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Flame, 
  AlertCircle, 
  Dumbbell, 
  Compass, 
  Timer,
  Heart,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface WorkoutLogProps {
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  userWeight?: number;
}

const CARDIO_PRESETS = [
  { type: 'Lari', met: 9.8, label: 'Lari (Running)', hasDistance: true, avgSpeed: 10 }, // 10 km/h
  { type: 'Bersepeda', met: 7.5, label: 'Bersepeda (Cycling)', hasDistance: true, avgSpeed: 20 }, // 20 km/h
  { type: 'Jalan Kaki', met: 3.8, label: 'Jalan Kaki (Walking)', hasDistance: true, avgSpeed: 5 }, // 5 km/h
  { type: 'Renang', met: 8.0, label: 'Renang (Swimming)', hasDistance: false, avgSpeed: 0 },
  { type: 'Lompat Tali', met: 11.0, label: 'Lompat Tali (Jump Rope)', hasDistance: false, avgSpeed: 0 },
  { type: 'Yoga', met: 3.0, label: 'Yoga', hasDistance: false, avgSpeed: 0 },
  { type: 'Lainnya (Kustom)', met: 5.0, label: 'Lainnya (Kustom Cardio)', hasDistance: true, avgSpeed: 8 }
] as const;

const STRENGTH_PRESETS = [
  { type: 'Push Up', met: 4.0, label: 'Push Up', needsWeight: false, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Pull Up', met: 4.5, label: 'Pull Up', needsWeight: false, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Squat', met: 5.5, label: 'Squat (Latihan Beban)', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Bench Press', met: 5.0, label: 'Bench Press', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Deadlift', met: 6.0, label: 'Deadlift', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Bicep Curl', met: 3.5, label: 'Bicep Curl', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Lateral Raise', met: 3.0, label: 'Lateral Raise', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Sit Up', met: 3.8, label: 'Sit Up', needsWeight: false, needsReps: true, needsSets: true, needsDuration: true, isStatic: false },
  { type: 'Plank', met: 4.0, label: 'Plank (Static Hold)', needsWeight: false, needsReps: false, needsSets: false, needsDuration: false, isStatic: true },
  { type: 'Lainnya (Kustom Strength)', met: 4.0, label: 'Lainnya (Kustom)', needsWeight: true, needsReps: true, needsSets: true, needsDuration: true, isStatic: false }
] as const;

export default function WorkoutLog({ workouts, onAddWorkout, onDeleteWorkout, userWeight = 70 }: WorkoutLogProps) {
  // Main Category Tab
  const [activeTab, setActiveTab] = useState<'cardio' | 'strength'>('cardio');

  // Cardio Specific Selection states
  const [cardioType, setCardioType] = useState<string>('Lari');
  const [customCardioType, setCustomCardioType] = useState('');
  const [customCardioHasDistance, setCustomCardioHasDistance] = useState(true);

  // Strength Specific Selection states
  const [strengthType, setStrengthType] = useState<string>('Push Up');
  const [customStrengthType, setCustomStrengthType] = useState('');

  // General inputs
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  // Cardio input states
  const [distanceKm, setDistanceKm] = useState('');
  const [isDistanceAuto, setIsDistanceAuto] = useState(true);

  // Strength input states
  const [weightKg, setWeightKg] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  
  // Plank/Static Specific inputs
  const [staticMinutes, setStaticMinutes] = useState('2');
  const [staticSeconds, setStaticSeconds] = useState('0');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab switcher
  const handleTabChange = (tab: 'cardio' | 'strength') => {
    setActiveTab(tab);
    setError('');
    setDuration('');
    setCalories('');
    setNotes('');
    
    if (tab === 'cardio') {
      setCardioType('Lari');
      setDistanceKm('');
      setIsDistanceAuto(true);
    } else {
      setStrengthType('Push Up');
      setWeightKg('');
      setReps('');
      setSets('');
      setStaticMinutes('2');
      setStaticSeconds('0');
    }
  };

  // Cardio Duration input handler
  const handleCardioDurationChange = (val: string) => {
    setDuration(val);
    const parsedDur = parseFloat(val);
    if (!isNaN(parsedDur) && parsedDur > 0) {
      // Calculate estimated calories
      const preset = CARDIO_PRESETS.find(p => p.type === cardioType) || CARDIO_PRESETS[CARDIO_PRESETS.length - 1];
      const weightEst = userWeight; // use actual user weight
      const estCal = Math.round(preset.met * 3.5 * weightEst * parsedDur / 200);
      setCalories(estCal.toString());

      // Calculate estimated distance
      const hasDist = cardioType === 'Lainnya (Kustom)' ? customCardioHasDistance : preset.hasDistance;
      if (hasDist && isDistanceAuto) {
        const speed = cardioType === 'Lainnya (Kustom)' ? 8 : preset.avgSpeed;
        const estDist = (parsedDur / 60) * speed;
        setDistanceKm(estDist.toFixed(2));
      }
    } else {
      setCalories('');
      if (isDistanceAuto) {
        setDistanceKm('');
      }
    }
  };

  // Cardio Preset Selection handler
  const handleCardioTypeChange = (typeVal: string) => {
    setCardioType(typeVal);
    const preset = CARDIO_PRESETS.find(p => p.type === typeVal);
    if (preset) {
      const parsedDur = parseFloat(duration);
      const hasDist = typeVal === 'Lainnya (Kustom)' ? customCardioHasDistance : preset.hasDistance;

      if (!isNaN(parsedDur) && parsedDur > 0) {
        const weightEst = userWeight;
        const estCal = Math.round(preset.met * 3.5 * weightEst * parsedDur / 200);
        setCalories(estCal.toString());

        if (hasDist && isDistanceAuto) {
          const speed = typeVal === 'Lainnya (Kustom)' ? 8 : preset.avgSpeed;
          const estDist = (parsedDur / 60) * speed;
          setDistanceKm(estDist.toFixed(2));
        } else {
          setDistanceKm('');
        }
      } else {
        setDistanceKm('');
      }
    }
  };

  // Custom Cardio distance tracking toggle
  useEffect(() => {
    if (cardioType === 'Lainnya (Kustom)') {
      const parsedDur = parseFloat(duration);
      if (customCardioHasDistance) {
        if (!isNaN(parsedDur) && parsedDur > 0 && isDistanceAuto) {
          setDistanceKm(((parsedDur / 60) * 8).toFixed(2));
        }
      } else {
        setDistanceKm('');
      }
    }
  }, [customCardioHasDistance, cardioType]);

  // Handle manual distance edit
  const handleDistanceChange = (val: string) => {
    setDistanceKm(val);
    if (val === '') {
      setIsDistanceAuto(true);
      // Recalculate if duration exists
      const parsedDur = parseFloat(duration);
      const preset = CARDIO_PRESETS.find(p => p.type === cardioType);
      if (!isNaN(parsedDur) && parsedDur > 0 && preset) {
        const hasDist = cardioType === 'Lainnya (Kustom)' ? customCardioHasDistance : preset.hasDistance;
        if (hasDist) {
          const speed = cardioType === 'Lainnya (Kustom)' ? 8 : preset.avgSpeed;
          setDistanceKm(((parsedDur / 60) * speed).toFixed(2));
        }
      }
    } else {
      setIsDistanceAuto(false);
    }
  };

  // Strength Preset Selection handler
  const handleStrengthTypeChange = (typeVal: string) => {
    setStrengthType(typeVal);
    const preset = STRENGTH_PRESETS.find(p => p.type === typeVal);
    
    // Clear custom and dynamic fields
    setCustomStrengthType('');
    setWeightKg('');
    setReps('');
    setSets('');
    setDuration('');
    setCalories('');

    if (preset) {
      if (preset.isStatic) {
        setStaticMinutes('2');
        setStaticSeconds('0');
        // Auto set duration to 2 mins
        setDuration('2');
        const weightEst = userWeight;
        const estCal = Math.round(preset.met * 3.5 * weightEst * 2 / 200);
        setCalories(estCal.toString());
      }
    }
  };

  // Strength duration change handler
  const handleStrengthDurationChange = (val: string) => {
    setDuration(val);
    const parsedDur = parseFloat(val);
    if (!isNaN(parsedDur) && parsedDur > 0) {
      const preset = STRENGTH_PRESETS.find(p => p.type === strengthType) || STRENGTH_PRESETS[STRENGTH_PRESETS.length - 1];
      const weightEst = userWeight;
      const estCal = Math.round(preset.met * 3.5 * weightEst * parsedDur / 200);
      setCalories(estCal.toString());
    } else {
      setCalories('');
    }
  };

  // Plank static time changes
  const handleStaticTimeChange = (mins: string, secs: string) => {
    setStaticMinutes(mins);
    setStaticSeconds(secs);

    const parsedMins = parseFloat(mins) || 0;
    const parsedSecs = parseFloat(secs) || 0;
    const totalMinutes = parsedMins + (parsedSecs / 60);

    if (totalMinutes > 0) {
      setDuration(totalMinutes.toFixed(2));
      const preset = STRENGTH_PRESETS.find(p => p.type === 'Plank')!;
      const weightEst = userWeight;
      const estCal = Math.round(preset.met * 3.5 * weightEst * totalMinutes / 200);
      setCalories(estCal.toString());
    } else {
      setDuration('');
      setCalories('');
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalType = '';
    let finalCategory: 'strength' | 'distance' | 'static' | 'general' = 'general';
    let computedDuration = parseFloat(duration);
    let parsedCalories = parseInt(calories, 10);
    
    // Specialized values
    let finalWeight: number | undefined;
    let finalReps: number | undefined;
    let finalSets: number | undefined;
    let finalDistance: number | undefined;

    if (activeTab === 'cardio') {
      finalType = cardioType === 'Lainnya (Kustom)' ? (customCardioType.trim() || 'Cardio Kustom') : cardioType;
      const preset = CARDIO_PRESETS.find(p => p.type === cardioType) || CARDIO_PRESETS[CARDIO_PRESETS.length - 1];
      const hasDist = cardioType === 'Lainnya (Kustom)' ? customCardioHasDistance : preset.hasDistance;
      
      finalCategory = hasDist ? 'distance' : 'general';

      if (isNaN(computedDuration) || computedDuration <= 0) {
        setError('Durasi latihan cardio harus diisi dengan angka positif!');
        return;
      }

      if (hasDist) {
        const d = parseFloat(distanceKm);
        if (isNaN(d) || d <= 0) {
          setError('Jarak tempuh (km) harus diisi dengan angka positif untuk olahraga ini!');
          return;
        }
        finalDistance = d;
      }
    } else {
      // STRENGTH
      finalType = strengthType === 'Lainnya (Kustom Strength)' ? (customStrengthType.trim() || 'Strength Kustom') : strengthType;
      const preset = STRENGTH_PRESETS.find(p => p.type === strengthType) || STRENGTH_PRESETS[STRENGTH_PRESETS.length - 1];
      
      if (preset.isStatic) {
        finalCategory = 'static';
        const mins = parseFloat(staticMinutes) || 0;
        const secs = parseFloat(staticSeconds) || 0;
        computedDuration = mins + (secs / 60);
        if (computedDuration <= 0) {
          setError('Durasi Plank harus lebih dari 0 detik!');
          return;
        }
      } else {
        finalCategory = 'strength';
        if (isNaN(computedDuration) || computedDuration <= 0) {
          setError('Durasi latihan beban harus diisi dengan angka positif!');
          return;
        }

        // Validate optional weight, reps, sets
        if (weightKg) {
          const w = parseFloat(weightKg);
          if (isNaN(w) || w < 0) {
            setError('Beban olahraga harus berupa angka positif!');
            return;
          }
          finalWeight = w;
        }

        if (reps) {
          const r = parseInt(reps, 10);
          if (isNaN(r) || r < 0) {
            setError('Repetisi harus berupa angka positif!');
            return;
          }
          finalReps = r;
        }

        if (sets) {
          const s = parseInt(sets, 10);
          if (isNaN(s) || s < 0) {
            setError('Jumlah set harus berupa angka positif!');
            return;
          }
          finalSets = s;
        }
      }
    }

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      setError('Kalori tidak boleh kosong atau negatif!');
      return;
    }
    if (!date) {
      setError('Tanggal olahraga harus diisi!');
      return;
    }

    setIsSubmitting(true);

    const newWorkout: Workout = {
      id: 'w-' + Date.now(),
      date,
      type: finalType,
      duration: Math.round(computedDuration * 10) / 10, // Round to 1 decimal place
      calories: parsedCalories,
      category: finalCategory,
      weightKg: finalWeight,
      reps: finalReps,
      sets: finalSets,
      distanceKm: finalDistance,
      notes: notes.trim() || undefined
    };

    setTimeout(() => {
      onAddWorkout(newWorkout);
      
      // Reset common fields
      setDuration('');
      setCalories('');
      setNotes('');
      setCustomCardioType('');
      setCustomStrengthType('');
      
      // Reset specialized fields
      setWeightKg('');
      setReps('');
      setSets('');
      setDistanceKm('');
      setIsDistanceAuto(true);
      setStaticMinutes('2');
      setStaticSeconds('0');
      
      setIsSubmitting(false);
    }, 200);
  };

  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Log Latihan */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit animate-fade-in space-y-4">
        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Catat Olahraga Baru
        </h3>

        {/* Category Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => handleTabChange('cardio')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cardio'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'cardio' ? 'text-indigo-500 fill-indigo-100' : ''}`} />
            Cardio
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('strength')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'strength'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dumbbell className={`w-3.5 h-3.5 ${activeTab === 'strength' ? 'text-indigo-500' : ''}`} />
            Strength
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'cardio' ? (
            /* --- CARDIO TAB FORM --- */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Jenis Cardio
                </label>
                <select
                  value={cardioType}
                  onChange={(e) => handleCardioTypeChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                >
                  {CARDIO_PRESETS.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {cardioType === 'Lainnya (Kustom)' && (
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Nama Cardio Kustom
                    </label>
                    <input
                      type="text"
                      required
                      value={customCardioType}
                      onChange={(e) => setCustomCardioType(e.target.value)}
                      placeholder="E.g. Zumba, Aerobik, Treadmill"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hitung Jarak Tempuh?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customCardioHasDistance}
                        onChange={(e) => setCustomCardioHasDistance(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-indigo-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Cardio Duration input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Durasi (menit)
                </label>
                <input
                  type="number"
                  required
                  value={duration}
                  onChange={(e) => handleCardioDurationChange(e.target.value)}
                  placeholder="E.g. 30"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Distance Input with logic checks */}
              {((cardioType !== 'Lainnya (Kustom)' && CARDIO_PRESETS.find(p => p.type === cardioType)?.hasDistance) || 
                (cardioType === 'Lainnya (Kustom)' && customCardioHasDistance)) && (
                <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Parameter Jarak Tempuh
                  </span>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={distanceKm}
                        onChange={(e) => handleDistanceChange(e.target.value)}
                        placeholder="E.g. 5.20"
                        min="0"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-20 py-2 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {isDistanceAuto && distanceKm && (
                        <span className="absolute right-3 top-2 text-[9px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                          Estimasi
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      {isDistanceAuto ? (
                        <span>Jarak diestimasi berdasarkan rata-rata kecepatan jenis olahraga Anda. Ubah angka untuk input manual.</span>
                      ) : (
                        <span className="text-indigo-600 font-medium">Input manual terdeteksi. Hapus isi kolom untuk kembali ke estimasi otomatis.</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- STRENGTH TAB FORM --- */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Jenis Strength Training
                </label>
                <select
                  value={strengthType}
                  onChange={(e) => handleStrengthTypeChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                >
                  {STRENGTH_PRESETS.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {strengthType === 'Lainnya (Kustom Strength)' && (
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 animate-fade-in">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Nama Gerakan Kustom
                  </label>
                  <input
                    type="text"
                    required
                    value={customStrengthType}
                    onChange={(e) => setCustomStrengthType(e.target.value)}
                    placeholder="E.g. Shoulder Press, Leg Press"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              {/* Dynamic strength parameter layout */}
              {strengthType === 'Plank' ? (
                /* Static duration hold for Plank */
                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3 animate-fade-in">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    Waktu Menahan Plank
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Menit
                      </label>
                      <input
                        type="number"
                        required
                        value={staticMinutes}
                        onChange={(e) => handleStaticTimeChange(e.target.value, staticSeconds)}
                        placeholder="2"
                        min="0"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Detik
                      </label>
                      <input
                        type="number"
                        required
                        value={staticSeconds}
                        onChange={(e) => handleStaticTimeChange(staticMinutes, e.target.value)}
                        placeholder="0"
                        min="0"
                        max="59"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Plank adalah latihan isometrik statis. Durasi bertahan dikonversi ke desimal menit.
                  </p>
                </div>
              ) : (
                /* Reps, Sets, Weights, and Duration for normal Strength lifts */
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3.5">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      Parameter Gerakan Strength
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">
                          Beban (kg)
                        </label>
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          placeholder="Bebas"
                          min="0"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">
                          Repetisi
                        </label>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder="12"
                          min="0"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">
                          Jumlah Set
                        </label>
                        <input
                          type="number"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                          placeholder="3"
                          min="0"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Durasi Total Latihan (menit)
                    </label>
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => handleStrengthDurationChange(e.target.value)}
                      placeholder="E.g. 15"
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calorie Output (Shared) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kalori Terbakar (kcal)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="E.g. 150"
                min="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Dihitung personal berdasarkan berat badan aktif Anda: <strong className="font-bold text-indigo-700">{userWeight} kg</strong>
              </p>
            </div>
          </div>

          {/* Date Selector (Shared) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tanggal Olahraga
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getTodayDateString()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Optional Notes (Shared) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. denyut jantung normal, rekor repetisi bertambah"
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-medium"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            id="btn-add-workout"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
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
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            Total: {workouts.length} entri
          </span>
        </div>

        {sortedWorkouts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-3xl">
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
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 hover:border-indigo-100 hover:bg-slate-50/80 transition-all duration-200 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{w.type}</span>
                    
                    {/* Render Category badges */}
                    {w.category === 'strength' && (
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        Strength
                        {w.weightKg ? ` • ${w.weightKg}kg` : ''} 
                        {w.sets ? ` • ${w.sets} Set` : ''} 
                        {w.reps ? ` • ${w.reps} Rep` : ''}
                      </span>
                    )}

                    {w.category === 'distance' && w.distanceKm && (
                      <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        {w.distanceKm} km
                      </span>
                    )}

                    {w.category === 'static' && (
                      <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Static Hold
                      </span>
                    )}

                    {w.category === 'general' && (
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-indigo-100" />
                        Cardio
                      </span>
                    )}

                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {w.duration} menit
                    </span>
                  </div>
                  
                  {w.notes && (
                    <p className="text-xs text-slate-500 italic max-w-sm">
                      "{w.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateIndonesian(w.date)}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5" />
                      {w.calories} kcal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteWorkout(w.id)}
                  id={`btn-delete-workout-${w.id}`}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 shrink-0"
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
