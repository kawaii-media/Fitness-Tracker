/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { playTimerAlert } from '../utils';
import { Play, Pause, RotateCcw, Flame, Hourglass, Settings, Zap } from 'lucide-react';

const TIMER_PRESETS = [
  { name: 'Plank (2 Menit)', duration: 120, label: 'Plank' },
  { name: 'Rest Singkat (30 Detik)', duration: 30, label: 'Istirahat' },
  { name: 'HIIT Kerja (45 Detik)', duration: 45, label: 'HIIT Kerja' },
  { name: 'Kardio Blast (1 Menit)', duration: 60, label: 'Kardio' }
];

export default function Timer() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalDuration, setTotalDuration] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  // Custom input state
  const [inputMin, setInputMin] = useState('1');
  const [inputSec, setInputSec] = useState('0');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevSecondsLeft = useRef(secondsLeft);

  // Synchronize ticker count and sound warnings on last 3 seconds
  useEffect(() => {
    if (isRunning && secondsLeft <= 3 && secondsLeft > 0 && secondsLeft !== prevSecondsLeft.current) {
      playTimerAlert('countdown');
    }
    if (isRunning && secondsLeft === 0 && prevSecondsLeft.current > 0) {
      playTimerAlert('success');
      setIsRunning(false);
    }
    prevSecondsLeft.current = secondsLeft;
  }, [secondsLeft, isRunning]);

  // Main Timer Interval Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalDuration);
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(false);

    const min = parseInt(inputMin, 10) || 0;
    const sec = parseInt(inputSec, 10) || 0;
    const total = min * 60 + sec;

    if (total > 0 && total <= 7200) {
      setTotalDuration(total);
      setSecondsLeft(total);
    }
  };

  const handleSelectPreset = (duration: number) => {
    setIsRunning(false);
    setTotalDuration(duration);
    setSecondsLeft(duration);
  };

  // Format Time
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // SVG Circular math
  const progressRatio = secondsLeft / totalDuration;
  const strokeDashoffset = 2 * Math.PI * 88 * (1 - progressRatio);

  const getTimerColorClass = () => {
    return 'stroke-indigo-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri: Timer Display Utama */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[380px] animate-fade-in">

        <div className="relative flex items-center justify-center my-4">
          {/* Main Circular Timer */}
          <svg className="w-64 h-64 transform -rotate-90">
            <circle cx="128" cy="128" r="88" className="stroke-slate-50 fill-none" strokeWidth="12" />
            <circle 
              cx="128" cy="128" r="88" 
              className={`fill-none transition-all duration-300 ${getTimerColorClass()}`} 
              strokeWidth="12" 
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              {isRunning ? 'Berjalan' : secondsLeft === 0 ? 'Waktu Habis!' : 'Jeda'}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            onClick={handleStartStop}
            id="btn-timer-toggle"
            className={`px-8 py-3 rounded-xl font-medium text-white transition-all flex items-center gap-2 shadow-xs ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Jeda
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Mulai
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            id="btn-timer-reset"
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kolom Kanan: Preset & Kustom Settings */}
      <div className="lg:col-span-1 space-y-6">
        {/* Atur Waktu Kustom Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-indigo-500" />
            Waktu Kustom
          </h4>
          <form onSubmit={handleApplyCustomTime} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Menit</label>
                <input
                  type="number"
                  value={inputMin}
                  onChange={(e) => setInputMin(e.target.value)}
                  min="0"
                  max="120"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detik</label>
                <input
                  type="number"
                  value={inputSec}
                  onChange={(e) => setInputSec(e.target.value)}
                  min="0"
                  max="59"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <button
              type="submit"
              id="btn-apply-timer"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Terapkan Durasi
            </button>
          </form>
        </div>

        {/* Preset Standar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Preset Durasi Olahraga
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {TIMER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.duration)}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${
                  totalDuration === preset.duration
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold'
                    : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-100 text-slate-600'
                }`}
              >
                {preset.label} ({formatTime(preset.duration)})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
