/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeightLog, UserProfile } from '../types';
import { getTodayDateString, formatDateIndonesian } from '../utils';
import { Plus, Trash2, Calendar, Scale, Award, Info, AlertCircle, Edit2 } from 'lucide-react';

interface WeightLogProps {
  weightHistory: WeightLog[];
  profile: UserProfile & { height?: number };
  onAddWeightLog: (log: WeightLog) => void;
  onDeleteWeightLog: (id: string) => void;
  onUpdateProfile: (profile: Partial<UserProfile & { height?: number }>) => void;
}

export default function WeightLogTab({ 
  weightHistory, 
  profile, 
  onAddWeightLog, 
  onDeleteWeightLog, 
  onUpdateProfile 
}: WeightLogProps) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  
  // Profile targets editing
  const [userName, setUserName] = useState(profile.name);
  const [targetWeight, setTargetWeight] = useState(profile.weightTarget.toString());
  const [calorieTarget, setCalorieTarget] = useState(profile.calorieTarget.toString());
  const [burnTarget, setBurnTarget] = useState(profile.calorieBurnTarget.toString());
  const [waterTarget, setWaterTarget] = useState(profile.waterTarget.toString());
  const [height, setHeight] = useState((profile.height || 170).toString());

  const [weightError, setWeightError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError('');

    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 20 || parsedWeight >= 300) {
      setWeightError('Masukkan berat badan yang valid antara 20 - 300 kg!');
      return;
    }
    if (!date) {
      setWeightError('Tanggal harus diisi!');
      return;
    }

    const newLog: WeightLog = {
      id: 'wt-' + Date.now(),
      date,
      weight: parsedWeight
    };

    onAddWeightLog(newLog);
    
    // Auto-update current weight in profile too
    onUpdateProfile({ currentWeight: parsedWeight });
    
    setWeight('');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSuccessMsg('');

    const parsedTarget = parseFloat(targetWeight);
    const parsedCalorie = parseInt(calorieTarget, 10);
    const parsedBurn = parseInt(burnTarget, 10);
    const parsedWater = parseInt(waterTarget, 10);
    const parsedHeight = parseInt(height, 10);

    if (!userName.trim()) {
      setProfileError('Nama pengguna tidak boleh kosong!');
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget <= 20 || parsedTarget >= 300) {
      setProfileError('Target berat badan harus antara 20 - 300 kg!');
      return;
    }
    if (isNaN(parsedCalorie) || parsedCalorie < 500 || parsedCalorie > 10000) {
      setProfileError('Target kalori harian harus antara 500 - 10000 kcal!');
      return;
    }
    if (isNaN(parsedBurn) || parsedBurn < 50 || parsedBurn > 5000) {
      setProfileError('Target olahraga harian harus antara 50 - 5000 kcal!');
      return;
    }
    if (isNaN(parsedWater) || parsedWater < 500 || parsedWater > 10000) {
      setProfileError('Target air harian harus antara 500 - 10000 ml!');
      return;
    }
    if (isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
      setProfileError('Tinggi badan harus antara 100 - 250 cm!');
      return;
    }

    onUpdateProfile({
      name: userName.trim(),
      weightTarget: parsedTarget,
      calorieTarget: parsedCalorie,
      calorieBurnTarget: parsedBurn,
      waterTarget: parsedWater,
      height: parsedHeight
    });

    setSuccessMsg('Profil dan target sukses diperbarui! ✨');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Compute BMI
  const userHeightM = (profile.height || 170) / 100;
  const currentWeightVal = profile.currentWeight || (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 70);
  const bmi = Number((currentWeightVal / (userHeightM * userHeightM)).toFixed(1));

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Kekurangan Berat (Underweight)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (val >= 18.5 && val < 25) return { label: 'Normal / Sehat (Ideal)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (val >= 25 && val < 30) return { label: 'Kelebihan Berat (Overweight)', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'Obesitas (Obese)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const bmiCat = getBmiCategory(bmi);

  // Sort logs by date descending
  const sortedLogs = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profil & Atur Target */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-6 animate-fade-in">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-500" />
            Pengaturan Profil & Target
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="E.g. Budi"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Target Berat (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="70"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Target Asupan Kalori (kcal)
                </label>
                <input
                  type="number"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  placeholder="2000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Target Bakar (kcal)
                  </label>
                  <input
                    type="number"
                    value={burnTarget}
                    onChange={(e) => setBurnTarget(e.target.value)}
                    placeholder="400"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Target Air (ml)
                  </label>
                  <input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {profileError && (
              <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-emerald-600 text-xs bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              id="btn-update-profile"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-xl transition-all shadow-xs text-xs"
            >
              Simpan Target Baru
            </button>
          </form>
        </div>
      </div>

      {/* Log Berat Badan Baru & Status Kesehatan BMI */}
      <div className="lg:col-span-2 space-y-6 flex flex-col justify-between h-full animate-fade-in">
        {/* BMI & Stats Display */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kalkulator BMI Real-Time</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-slate-800">{bmi}</span>
              <span className="text-sm text-slate-400">BMI</span>
            </div>
            <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border w-fit ${bmiCat.color}`}>
              {bmiCat.label}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-0.5">Rentang BMI Sehat:</p>
              BMI ideal berkisar antara 18.5 - 24.9. 
              Rumus BMI: <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">BB (kg) / (TB (m))²</span>.
              Pertahankan pola makan seimbang dan olahraga teratur untuk mencapai berat ideal.
            </div>
          </div>
        </div>

        {/* Input Log Harian & List */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1">
          {/* Input Log Berat */}
          <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-500" />
              Log Berat Badan
            </h3>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Berat Sekarang (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="E.g. 74.5"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tanggal Pengukuran
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getTodayDateString()}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {weightError && (
                <div className="text-rose-500 text-[11px] font-medium">
                  {weightError}
                </div>
              )}

              <button
                type="submit"
                id="btn-add-weight"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Catat Berat
              </button>
            </form>
          </div>

          {/* List Riwayat Berat */}
          <div className="md:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[260px]">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Riwayat Pengukuran
            </h4>

            {sortedLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-100 rounded-xl">
                <p className="text-xs font-medium text-slate-500">Belum ada riwayat timbangan.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {sortedLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/40 hover:bg-slate-50 hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{log.weight} kg</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDateIndonesian(log.date)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteWeightLog(log.id)}
                      id={`btn-delete-weight-${log.id}`}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0"
                      title="Hapus log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
