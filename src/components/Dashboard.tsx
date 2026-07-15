/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrackerData, Workout, Meal, WeightLog, WaterLog } from '../types';
import { formatDateIndonesian, formatDateShort, getPastDates, getTodayDateString } from '../utils';
import { 
  Activity, 
  Flame, 
  Utensils, 
  Droplet, 
  TrendingDown, 
  Award, 
  Plus, 
  Minus,
  CheckCircle,
  TrendingUp,
  Scale
} from 'lucide-react';

interface DashboardProps {
  data: TrackerData;
  onUpdateWater: (amount: number) => void;
}

export default function Dashboard({ data, onUpdateWater }: DashboardProps) {
  const today = getTodayDateString();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredWeightNode, setHoveredWeightNode] = useState<number | null>(null);

  // Compute Today's Totals
  const todayWorkouts = data.workouts.filter(w => w.date === today);
  const todayMeals = data.meals.filter(m => m.date === today);
  const todayWaterLog = data.waterIntake.find(w => w.date === today);
  const todayWater = todayWaterLog ? todayWaterLog.amount : 0;

  const totalBurnedToday = todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalWorkoutTimeToday = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
  
  const totalConsumedToday = todayMeals.reduce((sum, m) => sum + m.calories, 0);

  // Calorie balance math
  const calorieTarget = data.profile.calorieTarget;
  const netCalories = totalConsumedToday - totalBurnedToday;
  const remainingCalories = Math.max(0, calorieTarget - netCalories);
  const caloriePercentage = Math.min(100, Math.round((totalConsumedToday / calorieTarget) * 100));
  const burnPercentage = Math.min(100, Math.round((totalBurnedToday / data.profile.calorieBurnTarget) * 100));
  const waterPercentage = Math.min(100, Math.round((todayWater / data.profile.waterTarget) * 100));

  // Get current weight and weight progress
  const currentWeight = data.profile.currentWeight || (data.weightHistory.length > 0 ? data.weightHistory[data.weightHistory.length - 1].weight : 0);
  const targetWeight = data.profile.weightTarget;
  const startWeight = data.weightHistory.length > 0 ? data.weightHistory[0].weight : currentWeight;
  const totalWeightChange = Number((currentWeight - startWeight).toFixed(1));
  const weightToTarget = Number((currentWeight - targetWeight).toFixed(1));

  // Prepare Last 7 Days chart data
  const past7Days = getPastDates(7);
  const chartData = past7Days.map((date, index) => {
    const dayWorkouts = data.workouts.filter(w => w.date === date);
    const dayMeals = data.meals.filter(m => m.date === date);
    const dayWeightLog = data.weightHistory.find(w => w.date === date);
    const dayWaterLog = data.waterIntake.find(w => w.date === date);

    const burned = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
    const consumed = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const weight = dayWeightLog ? dayWeightLog.weight : (index > 0 ? 0 : currentWeight); // interpolation later if 0
    const water = dayWaterLog ? dayWaterLog.amount : 0;

    return {
      date,
      label: formatDateShort(date),
      burned,
      consumed,
      weight,
      water
    };
  });

  // Fill in any weight zeroes with previous active weight for smooth graph rendering
  let lastValidWeight = startWeight;
  chartData.forEach(item => {
    if (item.weight === 0) {
      item.weight = lastValidWeight;
    } else {
      lastValidWeight = item.weight;
    }
  });

  // Math for SVG Bar Chart (Calories)
  const maxCalorieValue = Math.max(...chartData.map(d => Math.max(d.consumed, d.burned, 2500)));
  const chartHeight = 160;
  const chartWidth = 500;
  const barPadding = 20;
  const colWidth = (chartWidth - 40) / 7;

  // Math for SVG Line Chart (Weight)
  const weights = chartData.map(d => d.weight);
  const minWeight = Math.max(0, Math.min(...weights) - 2);
  const maxWeight = Math.max(...weights) + 2;
  const weightSpan = maxWeight - minWeight || 1;

  const getWeightY = (w: number) => {
    return chartHeight - 20 - ((w - minWeight) / weightSpan) * (chartHeight - 40);
  };

  const getWeightX = (index: number) => {
    return 30 + index * ((chartWidth - 60) / 6);
  };

  // Generate weight line path
  const linePath = chartData.map((d, i) => `${getWeightX(i)},${getWeightY(d.weight)}`).join(' L ');

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs gap-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Halo, {data.profile.name}! 👋
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Hari ini adalah <span className="font-bold text-slate-600">{formatDateIndonesian(today)}</span>. Tetap konsisten dan capai target sehatmu!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <Award className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
            {remainingCalories === 0 ? "Target Konsumsi Tercapai!" : "Target Hari Ini Aktif"}
          </span>
        </div>
      </div>

      {/* Main Rings/Percentages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calorie Intake Ring */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px]">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asupan Kalori</span>
            <Utensils className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="relative flex items-center justify-center my-2">
            {/* SVG Progress Ring */}
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-100 fill-none" strokeWidth="8" />
              <circle 
                cx="56" cy="56" r="48" 
                className="stroke-emerald-500 fill-none transition-all duration-500" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - caloriePercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-slate-900">{totalConsumedToday}</span>
              <span className="text-[9px] text-slate-400 font-mono font-bold">/ {calorieTarget} kcal</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {caloriePercentage}% TERCAPAI
          </div>
        </div>

        {/* Calorie Burn Target */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px]">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pembakaran</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-100 fill-none" strokeWidth="8" />
              <circle 
                cx="56" cy="56" r="48" 
                className="stroke-orange-500 fill-none transition-all duration-500" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - burnPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-slate-900">{totalBurnedToday}</span>
              <span className="text-[9px] text-slate-400 font-mono font-bold">/ {data.profile.calorieBurnTarget} kcal</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {totalWorkoutTimeToday} MENIT OLAHRAGA
          </div>
        </div>

        {/* Water Hydration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px]">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cairan Hidrasi</span>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="relative flex items-center justify-center my-1">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-100 fill-none" strokeWidth="8" />
              <circle 
                cx="56" cy="56" r="48" 
                className="stroke-blue-500 fill-none transition-all duration-500" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - waterPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-slate-900">{todayWater}</span>
              <span className="text-[9px] text-slate-400 font-mono font-bold">/ {data.profile.waterTarget} ml</span>
            </div>
          </div>
          {/* Quick hydration buttons */}
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => onUpdateWater(-250)}
              disabled={todayWater <= 0}
              id="btn-sub-water"
              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-lg border border-slate-200 disabled:opacity-50 transition-colors"
              title="Kurang 250ml"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center px-1">
              +Gelas
            </span>
            <button 
              onClick={() => onUpdateWater(250)}
              id="btn-add-water-250"
              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              title="Tambah 250ml"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weight Tracker Gauge */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px]">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Berat Badan</span>
            <Scale className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-1">
            <div className="text-3xl font-black text-slate-900">
              {currentWeight} <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              TARGET: {targetWeight} kg
            </div>
          </div>
          
          <div className="w-full mt-2 space-y-1">
            <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
              <span>Mulai: {startWeight} kg</span>
              <span>Selisih: {totalWeightChange > 0 ? `+${totalWeightChange}` : totalWeightChange} kg</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              {/* Progress to target weight */}
              <div 
                className={`h-full rounded-full transition-all duration-500 ${weightToTarget <= 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, Math.max(10, (1 - Math.abs(weightToTarget) / 10) * 100))}%` }}
              />
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
              {weightToTarget > 0 
                ? `${weightToTarget} kg menuju target` 
                : weightToTarget === 0 
                ? "Target berat tercapai!" 
                : `${Math.abs(weightToTarget)} kg di bawah target`}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Balance */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">Tren Kalori 7 Hari</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Asupan makan vs Pembakaran olahraga</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span className="text-slate-500">Makan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-orange-400 rounded-sm" />
                <span className="text-slate-500">Bakar</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart SVG */}
          <div className="relative w-full overflow-x-auto pb-2">
            <svg 
              className="min-w-[500px] w-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Y Axis Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 20 + ratio * (chartHeight - 40);
                const val = Math.round(maxCalorieValue * (1 - ratio));
                return (
                  <g key={idx}>
                    <line 
                      x1="40" y1={y} x2={chartWidth - 10} y2={y} 
                      className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3"
                    />
                    <text 
                      x="32" y={y + 4} 
                      className="text-[9px] fill-slate-400 font-mono text-right" 
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((d, index) => {
                const xBase = 45 + index * colWidth;
                const barW = 12;

                // Calorie Consumed Bar
                const consumedHeight = (d.consumed / maxCalorieValue) * (chartHeight - 40);
                const consumedY = chartHeight - 20 - consumedHeight;

                // Calorie Burned Bar
                const burnedHeight = (d.burned / maxCalorieValue) * (chartHeight - 40);
                const burnedY = chartHeight - 20 - burnedHeight;

                const isHovered = hoveredBar === index;

                return (
                  <g key={index}>
                    {/* Hover Area Backplate */}
                    <rect 
                      x={xBase - 6} y="10" 
                      width={colWidth - 4} height={chartHeight - 25} 
                      className={`fill-transparent transition-colors cursor-pointer ${isHovered ? 'fill-slate-50/50' : ''}`}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Consumed Bar */}
                    <rect 
                      x={xBase} 
                      y={consumedY} 
                      width={barW} 
                      height={Math.max(2, consumedHeight)} 
                      rx="3"
                      className="fill-emerald-400 hover:fill-emerald-500 transition-colors cursor-pointer"
                    />

                    {/* Burned Bar */}
                    <rect 
                      x={xBase + barW + 2} 
                      y={burnedY} 
                      width={barW} 
                      height={Math.max(2, burnedHeight)} 
                      rx="3"
                      className="fill-orange-400 hover:fill-orange-500 transition-colors cursor-pointer"
                    />

                    {/* X Axis Label */}
                    <text 
                      x={xBase + barW} 
                      y={chartHeight - 4} 
                      className={`text-[10px] font-medium text-center fill-slate-500 ${isHovered ? 'fill-slate-800 font-semibold' : ''}`}
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>

                    {/* Tooltip Overlay */}
                    {isHovered && (
                      <g>
                        <rect 
                          x={Math.min(chartWidth - 110, Math.max(10, xBase - 40))} 
                          y="15" 
                          width="110" 
                          height="42" 
                          rx="6" 
                          className="fill-slate-900/90 shadow-lg"
                        />
                        <text x={Math.min(chartWidth - 110, Math.max(10, xBase - 40)) + 6} y="28" className="text-[9px] fill-slate-300 font-medium">
                          {formatDateIndonesian(d.date)}
                        </text>
                        <text x={Math.min(chartWidth - 110, Math.max(10, xBase - 40)) + 6} y="38" className="text-[9px] fill-emerald-300 font-semibold">
                          Makan: {d.consumed} kcal
                        </text>
                        <text x={Math.min(chartWidth - 110, Math.max(10, xBase - 40)) + 6} y="48" className="text-[9px] fill-orange-300 font-semibold">
                          Olahraga: {d.burned} kcal
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Weight Progression Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">Tren Berat Badan</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Pantauan berat 7 hari terakhir</p>
              </div>
              <Scale className="w-5 h-5 text-slate-400" />
            </div>

            {/* Weight Line Chart SVG */}
            <div className="relative w-full overflow-x-auto">
              <svg 
                className="w-full" 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                {/* Horizontal reference grids */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = 20 + ratio * (chartHeight - 40);
                  const val = Number((maxWeight - ratio * weightSpan).toFixed(1));
                  return (
                    <g key={idx}>
                      <line 
                        x1="30" y1={y} x2={chartWidth - 10} y2={y} 
                        className="stroke-slate-100" strokeWidth="1"
                      />
                      <text 
                        x="24" y={y + 3} 
                        className="text-[9px] fill-slate-400 font-mono" 
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Target Weight Line */}
                <line 
                  x1="30" 
                  y1={getWeightY(targetWeight)} 
                  x2={chartWidth - 10} 
                  y2={getWeightY(targetWeight)} 
                  className="stroke-emerald-200" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 2"
                />
                <text 
                  x={chartWidth - 12} 
                  y={getWeightY(targetWeight) - 4} 
                  className="text-[8px] fill-emerald-600 font-bold uppercase tracking-wider"
                  textAnchor="end"
                >
                  Target ({targetWeight} kg)
                </text>

                {/* Main weight line */}
                <path 
                  d={`M ${linePath}`}
                  className="stroke-indigo-500 fill-none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Line Nodes */}
                {chartData.map((d, index) => {
                  const cx = getWeightX(index);
                  const cy = getWeightY(d.weight);
                  const isHovered = hoveredWeightNode === index;

                  return (
                    <g key={index}>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isHovered ? 6 : 4} 
                        className={`stroke-indigo-500 fill-white transition-all cursor-pointer ${isHovered ? 'stroke-[3px]' : 'stroke-[2px]'}`}
                        onMouseEnter={() => setHoveredWeightNode(index)}
                        onMouseLeave={() => setHoveredWeightNode(null)}
                      />
                      {/* Interactive hover overlay */}
                      {isHovered && (
                        <g>
                          <rect 
                            x={Math.min(chartWidth - 85, Math.max(10, cx - 40))} 
                            y={cy - 38 < 10 ? cy + 10 : cy - 38} 
                            width="85" 
                            height="28" 
                            rx="4" 
                            className="fill-slate-900/95 shadow-md"
                          />
                          <text 
                            x={Math.min(chartWidth - 85, Math.max(10, cx - 40)) + 6} 
                            y={(cy - 38 < 10 ? cy + 10 : cy - 38) + 11} 
                            className="text-[8px] fill-slate-300 font-medium"
                          >
                            {formatDateIndonesian(d.date)}
                          </text>
                          <text 
                            x={Math.min(chartWidth - 85, Math.max(10, cx - 40)) + 6} 
                            y={(cy - 38 < 10 ? cy + 10 : cy - 38) + 21} 
                            className="text-[9px] fill-white font-bold"
                          >
                            {d.weight} kg
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/30 text-xs text-indigo-800 mt-2 font-bold uppercase tracking-wider">
            <span className="font-semibold text-slate-500">Perubahan:</span>
            <span className="font-extrabold flex items-center gap-1">
              {totalWeightChange > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  +{totalWeightChange} kg
                </>
              ) : totalWeightChange < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  {totalWeightChange} kg
                </>
              ) : (
                "Stabil (0 kg)"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
