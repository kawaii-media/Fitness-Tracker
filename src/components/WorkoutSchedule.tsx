/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScheduledWorkout, UserProfile, Workout } from '../types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  Clock, 
  Dumbbell, 
  Award, 
  Info, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  Activity,
  Heart,
  CalendarDays
} from 'lucide-react';

interface WorkoutScheduleProps {
  schedule: ScheduledWorkout[];
  profile: UserProfile;
  onAddScheduledWorkout: (workout: ScheduledWorkout) => void;
  onDeleteScheduledWorkout: (id: string) => void;
  onToggleScheduledWorkout: (id: string) => void;
  onLogCompletedScheduledWorkout: (workout: ScheduledWorkout) => void;
  onApplyRecommendedSchedule: (workouts: ScheduledWorkout[]) => void;
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

type DayType = typeof DAYS_OF_WEEK[number];

// Standard scientific workout templates based on goal
export const RECOMMENDATIONS = {
  lose: [
    { day: 'Senin', type: 'Running / Jogging', duration: 30, timeOfDay: 'Pagi', notes: 'Lari santai luar ruangan atau treadmill. Menjaga detak jantung di zona pembakaran lemak (60-70% Max HR).' },
    { day: 'Selasa', type: 'HIIT Tabata', duration: 20, timeOfDay: 'Sore', notes: 'Olahraga intensitas tinggi untuk memicu efek afterburn (EPOC). 20 detik kerja keras, 10 detik istirahat, ulangi 8x.' },
    { day: 'Rabu', type: 'Plank & Sit Up (Core)', duration: 15, timeOfDay: 'Pagi', notes: 'Fokus pada kekuatan core perut dan stabilitas tulang belakang. Tambahkan peregangan ringan.' },
    { day: 'Kamis', type: 'Sepeda / Cycling', duration: 40, timeOfDay: 'Sore', notes: 'Latihan cardio stabil (LISS) untuk membakar kalori tanpa tekanan sendi yang tinggi.' },
    { day: 'Jumat', type: 'Push Up & Squat (Bodyweight)', duration: 30, timeOfDay: 'Sore', notes: 'Latihan beban dasar tubuh untuk mempertahankan massa otot agar metabolisme tetap tinggi.' },
    { day: 'Sabtu', type: 'Jalan Cepat / Berenang', duration: 45, timeOfDay: 'Pagi', notes: 'Cardio intensitas sedang untuk pemulihan aktif dan sirkulasi darah yang baik.' },
    { day: 'Minggu', type: 'Istirahat / Active Stretching', duration: 0, timeOfDay: 'Pagi', notes: 'Hari pemulihan total. Fokus pada peregangan seluruh tubuh, hidrasi, dan istirahat yang berkualitas.' }
  ],
  gain: [
    { day: 'Senin', type: 'Strength - Chest & Triceps', duration: 40, timeOfDay: 'Sore', notes: 'Dumbbell Bench Press, Push-ups, Overhead Tricep Extension (Dumbbell).' },
    { day: 'Selasa', type: 'Strength - Back & Biceps', duration: 40, timeOfDay: 'Sore', notes: 'Dumbbell Rows, Barbell/Dumbbell Bicep Curls, Hammer Curls.' },
    { day: 'Rabu', type: 'HIIT Cardio Singkat', duration: 20, timeOfDay: 'Sore', notes: 'Burpees, Mountain climbers, Jumping jacks.' },
    { day: 'Kamis', type: 'Strength - Legs & Glutes', duration: 40, timeOfDay: 'Sore', notes: 'Goblet Squats (Dumbbell), Dumbbell Lunges, Romanian Deadlifts (Dumbbell/Barbell).' },
    { day: 'Jumat', type: 'Strength - Shoulders & Core', duration: 40, timeOfDay: 'Sore', notes: 'Dumbbell Shoulder Press, Lateral Raises, Plank, Leg Raises.' },
    { day: 'Sabtu', type: 'Active Recovery & Stretching', duration: 20, timeOfDay: 'Pagi', notes: 'Peregangan seluruh tubuh.' },
    { day: 'Minggu', type: 'Istirahat Total (Muscle Growth)', duration: 0, timeOfDay: 'Malam', notes: 'Pemulihan.' }
  ],
  maintain: [
    { day: 'Senin', type: 'Running / Jogging', duration: 30, timeOfDay: 'Pagi', notes: 'Kebugaran kardiovaskular dasar.' },
    { day: 'Selasa', type: 'Full Body (Dumbbell)', duration: 30, timeOfDay: 'Sore', notes: 'Dumbbell Squats, Push-ups, Dumbbell Overhead Press, Plank.' },
    { day: 'Rabu', type: 'Istirahat / Peregangan', duration: 15, timeOfDay: 'Pagi', notes: 'Fleksibilitas.' },
    { day: 'Kamis', type: 'Sepeda / Berenang', duration: 35, timeOfDay: 'Sore', notes: 'Cardio.' },
    { day: 'Jumat', type: 'HIIT & Core Workout', duration: 25, timeOfDay: 'Sore', notes: 'Burpees, Mountain climbers, Plank.' },
    { day: 'Sabtu', type: 'Olahraga Rekreasi / Walk', duration: 45, timeOfDay: 'Pagi', notes: 'Jalan pagi.' },
    { day: 'Minggu', type: 'Istirahat Total', duration: 0, timeOfDay: 'Pagi', notes: 'Pemulihan.' }
  ]
};

export default function WorkoutSchedule({
  schedule,
  profile,
  onAddScheduledWorkout,
  onDeleteScheduledWorkout,
  onToggleScheduledWorkout,
  onLogCompletedScheduledWorkout,
  onApplyRecommendedSchedule
}: WorkoutScheduleProps) {
  // Local states for custom schedule form
  const [selectedDay, setSelectedDay] = useState<DayType>('Senin');
  const [workoutType, setWorkoutType] = useState('Push Up');
  const [customWorkoutType, setCustomWorkoutType] = useState('');
  const [duration, setDuration] = useState('30');
  const [timeOfDay, setTimeOfDay] = useState('Pagi');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState<DayType | 'Semua'>('Semua');

  const userGoal = profile.goal || 'lose';

  // Apply recommendations automatically
  const handleApplyRecs = () => {
    const list = RECOMMENDATIONS[userGoal].map((rec) => ({
      id: 'sch-' + Math.random().toString(36).substr(2, 9),
      day: rec.day as DayType,
      type: rec.type,
      duration: rec.duration,
      timeOfDay: rec.timeOfDay,
      notes: rec.notes,
      isCompleted: false
    }));
    onApplyRecommendedSchedule(list);
    setSuccessMsg('Jadwal rekomendasi ilmiah sukses diterapkan! 🎯');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalType = workoutType === 'Kustom' ? customWorkoutType.trim() : workoutType;
    if (!finalType) {
      setError('Masukkan jenis latihan terlebih dahulu!');
      return;
    }

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration < 0 || parsedDuration > 480) {
      setError('Masukkan durasi latihan yang valid (0 - 480 menit).');
      return;
    }

    const newSched: ScheduledWorkout = {
      id: 'sch-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      day: selectedDay,
      type: finalType,
      duration: parsedDuration,
      timeOfDay,
      notes: notes.trim() || undefined,
      isCompleted: false
    };

    onAddScheduledWorkout(newSched);
    setNotes('');
    setCustomWorkoutType('');
    setSuccessMsg('Jadwal berhasil ditambahkan secara manual! 📅');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogToActual = (item: ScheduledWorkout) => {
    onLogCompletedScheduledWorkout(item);
    setSuccessMsg(`Latihan "${item.type}" berhasil ditambahkan ke histori olahraga aktif Anda! 💪`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filter schedules based on selection
  const filteredSchedule = schedule.filter(item => 
    activeDayFilter === 'Semua' ? true : item.day === activeDayFilter
  );

  // Group schedules by day for comprehensive calendar view
  const groupedScheduleByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedule.filter(item => item.day === day);
    return acc;
  }, {} as Record<DayType, ScheduledWorkout[]>);

  // Count metrics
  const totalMinutes = schedule.reduce((sum, item) => sum + item.duration, 0);
  const completedCount = schedule.filter(item => item.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-x-1/4 translate-y-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-3 py-1 rounded-full border border-pink-500/30 uppercase tracking-widest inline-block">
              Perencana Mingguan
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Jadwal & Rekomendasi Latihan
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Dapatkan rekomendasi program terstruktur berbasis target Anda atau buat rutinitas manual yang sesuai dengan kesibukan harian Anda secara fleksibel.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-3">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Latihan</div>
              <div className="text-lg font-mono font-black text-pink-400">{schedule.length}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Menit</div>
              <div className="text-lg font-mono font-black text-indigo-400">{totalMinutes}m</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Selesai</div>
              <div className="text-lg font-mono font-black text-emerald-400">{completedCount} / {schedule.length}</div>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Info className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Grid Layout: Left column is creator & recommendation, Right Column is the schedule list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Recommendations & Manual Planner Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* A. REKOMENDASI PANEL */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-50 rounded-xl">
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 leading-tight">Rekomendasi Mingguan</h3>
                <span className="text-[10px] text-pink-500 font-semibold uppercase tracking-wider">Metode Sport-Science</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Target Utama Anda:</span>
                <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase border border-indigo-100">
                  {userGoal === 'lose' ? 'Turun Berat Badan' : userGoal === 'gain' ? 'Tambah Massa Otot' : 'Menjaga Kebugaran'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {userGoal === 'lose' 
                  ? 'Kombinasi HIIT metabolic training dan cardiovascular steady-state (LISS) harian untuk mengoptimalkan defisit kalori serta memobilisasi simpanan asam lemak tanpa merusak serat otot.'
                  : userGoal === 'gain'
                  ? 'Fokus utama pada latihan resistensi berat (hypertrophy) dengan target intensitas 70-85% 1-Repetition Maximum (1RM) dikombinasikan dengan pemulihan harian yang optimal untuk sintesis protein.'
                  : 'Fokus berimbang pada kesehatan jantung fungsional, mobilitas sendi/peregangan dinamis, serta kekuatan core perut untuk mendukung fungsionalitas fisik prima sehari-hari.'
                }
              </p>
              
              <button
                type="button"
                onClick={handleApplyRecs}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                ✨ Pasang Jadwal Rekomendasi
              </button>
            </div>

            <div className="text-[10px] text-slate-400 space-y-1">
              <div className="flex gap-1.5 items-start">
                <span className="text-indigo-500 font-black">•</span>
                <p>Memasukkan rekomendasi ini akan menimpa/menambah rencana baru ke kalender Anda.</p>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-indigo-500 font-black">•</span>
                <p>Didesain secara medis dengan rotasi latihan-istirahat (recovery) 48 jam yang pas.</p>
              </div>
            </div>
          </div>

          {/* B. MANUAL FORM CREATOR */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Plus className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 leading-tight">Buat Jadwal Manual</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Atur Rutinitas Kustom</span>
              </div>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hari Latihan</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer text-slate-700"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Waktu</label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer text-slate-700"
                  >
                    <option value="Pagi">Pagi (05:00 - 10:00)</option>
                    <option value="Siang">Siang (11:00 - 14:00)</option>
                    <option value="Sore">Sore (15:00 - 18:00)</option>
                    <option value="Malam">Malam (19:00 - 22:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Durasi (Menit)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="0"
                    placeholder="Contoh: 30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Jenis Latihan</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer text-slate-700 mb-2"
                >
                  <option value="Push Up">Push Up</option>
                  <option value="Pull Up">Pull Up</option>
                  <option value="Squat">Squat (Bodyweight / Beban)</option>
                  <option value="Bench Press">Bench Press</option>
                  <option value="Deadlift">Deadlift</option>
                  <option value="Bicep Curl">Bicep Curl</option>
                  <option value="Plank">Plank</option>
                  <option value="Running">Running / Jogging</option>
                  <option value="Cycling">Cycling / Bersepeda</option>
                  <option value="HIIT Cardio">HIIT Cardio / Tabata</option>
                  <option value="Yoga / Stretching">Yoga / Stretching</option>
                  <option value="Kustom">-- Lainnya (Kustom) --</option>
                </select>

                {workoutType === 'Kustom' && (
                  <input
                    type="text"
                    value={customWorkoutType}
                    onChange={(e) => setCustomWorkoutType(e.target.value)}
                    placeholder="Contoh: Bulu Tangkis, Lompat Tali"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 animate-fade-in"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Catatan Pendukung (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Fokus pada teknik, minun 500ml sebelum latihan."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambahkan ke Kalender
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Schedule Weekly Visualizer & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Filters */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase px-2 mr-1">Filter Hari:</span>
              <button
                type="button"
                onClick={() => setActiveDayFilter('Semua')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeDayFilter === 'Semua'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                Semua Hari
              </button>
              {DAYS_OF_WEEK.map((day) => {
                const count = schedule.filter(item => item.day === day).length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDayFilter(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeDayFilter === day
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {day}
                    {count > 0 && (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${activeDayFilter === day ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule List */}
          {filteredSchedule.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto border border-pink-100">
                <CalendarDays className="w-8 h-8 text-pink-400" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Tidak ada jadwal latihan terdaftar</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {activeDayFilter === 'Semua' 
                    ? 'Kalender latihan Anda masih kosong. Tekan tombol "Pasang Jadwal Rekomendasi" di kolom kiri untuk menerapkan kalender standar medis, atau tambahkan jadwal kustom Anda.'
                    : `Tidak ada jadwal latihan yang direncanakan pada hari ${activeDayFilter}.`
                  }
                </p>
              </div>
              {activeDayFilter === 'Semua' && (
                <button
                  type="button"
                  onClick={handleApplyRecs}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl text-xs transition-all inline-flex items-center gap-1.5 border border-indigo-100/50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Mulai dengan Rekomendasi Ilmiah
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredSchedule.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group ${
                    item.isCompleted 
                      ? 'border-emerald-100/80 bg-emerald-50/20' 
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Status accent line */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${item.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  
                  {/* Card Left Details */}
                  <div className="flex items-start gap-3.5 pl-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleScheduledWorkout(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-hidden cursor-pointer shrink-0"
                      title={item.isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {item.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                      )}
                    </button>
                    
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
                          {item.day}
                        </span>
                        {item.timeOfDay && (
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {item.timeOfDay}
                          </span>
                        )}
                        {item.duration > 0 && (
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0">
                            {item.duration} Menit
                          </span>
                        )}
                      </div>

                      <h4 className={`font-bold text-sm text-slate-800 break-words ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {item.type}
                      </h4>

                      {item.notes && (
                        <p className="text-slate-500 text-[11px] leading-relaxed break-words">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Right Action Buttons */}
                  <div className="flex items-center gap-2 md:self-center self-end pl-10 md:pl-0 shrink-0">
                    {/* Log completed to actual database */}
                    {!item.isCompleted && item.duration > 0 && (
                      <button
                        type="button"
                        onClick={() => handleLogToActual(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Dumbbell className="w-3 h-3" />
                        Log ke Olahraga Aktif
                      </button>
                    )}

                    {item.isCompleted && (
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Terselesaikan
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteScheduledWorkout(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Hapus jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sport Science Education Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h4 className="font-display font-bold text-md text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            Mengapa Program Rutin Mingguan Sangat Penting?
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Sistematika program latihan (periodisasi) memiliki dasar klinis yang sangat kuat. Melakukan latihan secara acak menghambat adaptasi fisiologis seluler. Tubuh memerlukan pola beban berulang secara berkala agar terjadi adaptasi kardiorespirasi dan hipertrofi myofibril otot. Penjadwalan juga mencegah <strong>overtraining syndrome</strong>, menjaga keharmonisan ritme sirkadian tubuh, dan menstabilkan produksi hormon dopamin agar latihan menjadi kebiasaan permanen.
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-3 shrink-0 self-start md:self-center">
          <Activity className="w-8 h-8 text-indigo-400 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Metode Adaptasi</div>
            <div className="text-xs font-bold text-white leading-tight mt-0.5">Progressive Overload</div>
            <div className="text-[9px] text-slate-400 leading-none mt-1">Intensitas & beban bertahap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
