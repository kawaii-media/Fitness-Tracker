/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrackerData } from '../types';

export function generateSingleFileHTML(currentData: TrackerData): string {
  const dataJSON = JSON.stringify(currentData);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fitness Tracker Offline PWA</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }
    /* Scrollbar Style */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">

  <!-- APP LAYOUT -->
  <div class="flex flex-col md:flex-row min-h-screen">
    
    <!-- DESKTOP SIDEBAR -->
    <aside class="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 p-6 shrink-0 shadow-xl border-r border-slate-800">
      <div class="flex items-center gap-2 mb-8">
        <svg class="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="font-display font-bold text-xl tracking-tight text-white">FitLife Tracker</span>
      </div>
      
      <nav class="space-y-1 flex-1">
        <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-indigo-600 text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
          Ringkasan Harian
        </button>
        <button onclick="switchTab('workout')" id="nav-workout" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          Log Olahraga
        </button>
        <button onclick="switchTab('meals')" id="nav-meals" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Log Makanan
        </button>
        <button onclick="switchTab('weight')" id="nav-weight" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          Berat & Profil
        </button>
        <button onclick="switchTab('timer')" id="nav-timer" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Timer HIIT
        </button>
        <button onclick="switchTab('backup')" id="nav-backup" class="nav-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>
          Data Backup
        </button>
      </nav>
      
      <div class="mt-auto border-t border-slate-800 pt-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20" id="sidebar-avatar">
            U
          </div>
          <div class="truncate">
            <div class="text-sm font-bold text-white truncate" id="sidebar-name">User</div>
            <div class="text-xs text-slate-500 font-mono">Offline App</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- MOBILE NAVIGATION HEADER -->
    <header class="md:hidden bg-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="font-display font-bold text-lg">FitLife</span>
      </div>
      <div class="flex gap-2">
        <select onchange="switchTab(this.value)" class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-medium">
          <option value="dashboard">Dashboard</option>
          <option value="workout">Log Olahraga</option>
          <option value="meals">Log Makanan</option>
          <option value="weight">Berat & Profil</option>
          <option value="timer">Timer HIIT</option>
          <option value="backup">Data Backup</option>
        </select>
      </div>
    </header>

    <!-- MAIN CONTENT SCROLL AREA -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
      
      <!-- TAB: DASHBOARD -->
      <section id="tab-dashboard" class="tab-content space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div>
            <h2 class="text-2xl font-display font-semibold text-slate-800" id="dash-greeting">Halo! 👋</h2>
            <p class="text-sm text-slate-500 mt-1">Hari ini adalah <span class="font-medium text-slate-700" id="dash-date">Hari Ini</span>. Capai target sehatmu!</p>
          </div>
        </div>

        <!-- 4-Card Ring Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Card 1 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <span class="text-sm font-medium text-slate-500 block mb-2">Asupan Kalori</span>
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" class="stroke-slate-100 fill-none" stroke-width="6" />
                <circle cx="48" cy="48" r="40" id="ring-consumed" class="stroke-emerald-500 fill-none transition-all duration-500" stroke-width="6" stroke-dasharray="251" stroke-dashoffset="251" />
              </svg>
              <div class="absolute flex flex-col">
                <span class="text-base font-bold text-slate-800" id="val-consumed">0</span>
                <span class="text-[9px] text-slate-400 font-mono" id="tgt-consumed">/ 2000 kcal</span>
              </div>
            </div>
          </div>
          <!-- Card 2 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <span class="text-sm font-medium text-slate-500 block mb-2">Bakar Kalori</span>
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" class="stroke-slate-100 fill-none" stroke-width="6" />
                <circle cx="48" cy="48" r="40" id="ring-burned" class="stroke-orange-500 fill-none transition-all duration-500" stroke-width="6" stroke-dasharray="251" stroke-dashoffset="251" />
              </svg>
              <div class="absolute flex flex-col">
                <span class="text-base font-bold text-slate-800" id="val-burned">0</span>
                <span class="text-[9px] text-slate-400 font-mono" id="tgt-burned">/ 400 kcal</span>
              </div>
            </div>
          </div>
          <!-- Card 3 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between">
            <span class="text-sm font-medium text-slate-500 block">Kebutuhan Cairan</span>
            <div class="relative w-24 h-24 flex items-center justify-center my-1">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" class="stroke-slate-100 fill-none" stroke-width="6" />
                <circle cx="48" cy="48" r="40" id="ring-water" class="stroke-blue-500 fill-none transition-all duration-500" stroke-width="6" stroke-dasharray="251" stroke-dashoffset="251" />
              </svg>
              <div class="absolute flex flex-col">
                <span class="text-base font-bold text-slate-800" id="val-water">0</span>
                <span class="text-[9px] text-slate-400 font-mono" id="tgt-water">/ 2500 ml</span>
              </div>
            </div>
            <div class="flex gap-2 text-xs">
              <button onclick="updateWater(-250)" class="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 font-bold">-</button>
              <button onclick="updateWater(250)" class="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 font-bold">+250ml</button>
            </div>
          </div>
          <!-- Card 4 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between">
            <span class="text-sm font-medium text-slate-500 block">Berat Sekarang</span>
            <div class="my-2">
              <div class="text-2xl font-bold text-slate-800"><span id="val-weight">0</span> <span class="text-xs text-slate-400">kg</span></div>
              <div class="text-[10px] text-slate-400 mt-1">Target: <span id="val-weight-tgt">0</span> kg</div>
            </div>
            <div class="w-full text-[10px] text-indigo-600 italic bg-indigo-50 py-1 rounded" id="weight-status-text">
              Status berat ideal
            </div>
          </div>
        </div>

        <!-- Custom SVG Trend Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 class="text-lg font-display font-semibold text-slate-800 mb-2">Tren Kalori 7 Hari Terakhir</h3>
          <div class="w-full overflow-x-auto">
            <svg viewBox="0 0 500 160" class="min-w-[500px] w-full" id="svg-trend-chart">
              <!-- Rendered via JS dynamically -->
            </svg>
          </div>
        </div>
      </section>

      <!-- TAB: WORKOUT -->
      <section id="tab-workout" class="tab-content hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4">Catat Olahraga Baru</h3>
            <form id="form-workout" onsubmit="addWorkout(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jenis Olahraga</label>
                <select id="workout-type" onchange="toggleCustomWorkout(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                  <option value="Lari">Lari (Running)</option>
                  <option value="Angkat Beban">Angkat Beban (Strength)</option>
                  <option value="Bersepeda">Bersepeda (Cycling)</option>
                  <option value="Renang">Renang (Swimming)</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Jalan Kaki">Jalan Kaki (Walking)</option>
                  <option value="Lainnya">Lainnya (Kustom)</option>
                </select>
              </div>
              <div id="custom-workout-container" class="hidden">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Olahraga Kustom</label>
                <input type="text" id="workout-custom-type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Durasi (menit)</label>
                  <input type="number" id="workout-duration" required min="1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kalori (kcal)</label>
                  <input type="number" id="workout-calories" required min="0" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal</label>
                <input type="date" id="workout-date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
              </div>
              <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors">
                Tambah ke Log
              </button>
            </form>
          </div>
          
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[450px]">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4">Riwayat Olahraga</h3>
            <div id="workout-list" class="flex-1 overflow-y-auto space-y-2">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: MEALS -->
      <section id="tab-meals" class="tab-content hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4">Catat Makanan</h3>
            <form id="form-meal" onsubmit="addMeal(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kategori Waktu</label>
                <select id="meal-type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                  <option value="breakfast">Sarapan</option>
                  <option value="lunch">Makan Siang</option>
                  <option value="dinner">Makan Malam</option>
                  <option value="snack">Cemilan</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Makanan</label>
                <input type="text" id="meal-name" required placeholder="E.g. Oatmeal, Sup Ayam" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kalori (kcal)</label>
                  <input type="number" id="meal-calories" required min="1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal</label>
                  <input type="date" id="meal-date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
              </div>
              <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors">
                Tambah ke Log
              </button>
            </form>
          </div>

          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[450px]">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4">Riwayat Makan</h3>
            <div id="meal-list" class="flex-1 overflow-y-auto space-y-2">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: WEIGHT & PROFILE -->
      <section id="tab-weight" class="tab-content hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4">Target Kesehatan</h3>
            <form id="form-profile" onsubmit="updateProfile(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <input type="text" id="prof-name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tinggi (cm)</label>
                  <input type="number" id="prof-height" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Berat (kg)</label>
                  <input type="number" step="0.1" id="prof-weight-tgt" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Kalori Harian (kcal)</label>
                <input type="number" id="prof-cal-tgt" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Bakar (kcal)</label>
                  <input type="number" id="prof-burn-tgt" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Air (ml)</label>
                  <input type="number" id="prof-water-tgt" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                </div>
              </div>
              <button type="submit" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors">
                Perbarui Profil
              </button>
            </form>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">BMI Real-Time</h4>
              <div class="flex items-baseline gap-2">
                <span id="bmi-val" class="text-4xl font-display font-bold text-slate-800">22.4</span>
                <span class="text-sm text-slate-400">BMI</span>
              </div>
              <div id="bmi-lbl" class="text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit mt-2">
                Normal / Sehat (Ideal)
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h4 class="text-sm font-display font-semibold text-slate-800 mb-3">Catat Berat Badan</h4>
                <form id="form-weight" onsubmit="addWeight(event)" class="space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Berat (kg)</label>
                    <input type="number" step="0.1" id="weight-input" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tanggal</label>
                    <input type="date" id="weight-date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                  </div>
                  <button type="submit" class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl text-xs">Simpan Timbangan</button>
                </form>
              </div>

              <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[230px]">
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Riwayat Pengukuran</h4>
                <div id="weight-list" class="flex-1 overflow-y-auto space-y-2">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: TIMER -->
      <section id="tab-timer" class="tab-content hidden space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div class="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" class="stroke-slate-50 fill-none" stroke-width="10" />
              <circle cx="96" cy="96" r="80" id="timer-progress" class="stroke-indigo-600 fill-none transition-all duration-300" stroke-width="10" stroke-dasharray="502" stroke-dashoffset="0" />
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-4xl font-display font-bold text-slate-800" id="timer-display">01:00</span>
              <span class="text-[10px] text-slate-400 font-mono tracking-wider mt-1" id="timer-status">Jeda</span>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button onclick="resetTimer()" class="p-3 border border-slate-200 rounded-xl hover:bg-slate-50">Reset</button>
            <button onclick="toggleTimer()" id="btn-timer-play" class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm">Mulai</button>
          </div>

          <div class="flex gap-2 mt-6">
            <button onclick="setTimerSecs(30)" class="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded hover:bg-slate-200">30 d</button>
            <button onclick="setTimerSecs(60)" class="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded hover:bg-slate-200">1 m</button>
            <button onclick="setTimerSecs(120)" class="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded hover:bg-slate-200">2 m</button>
            <button onclick="setTimerSecs(300)" class="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded hover:bg-slate-200">5 m</button>
          </div>
        </div>
      </section>

      <!-- TAB: BACKUP -->
      <section id="tab-backup" class="tab-content hidden space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 class="text-lg font-display font-semibold text-slate-800">Manajemen Data Lokal</h3>
          <p class="text-sm text-slate-500">Semua data disimpan 100% secara lokal di browser Anda. Lakukan backup berkala.</p>
          
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button onclick="exportJSON()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs">
              Unduh Backup JSON
            </button>
            <button onclick="document.getElementById('file-upload-input').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs">
              Unggah Backup JSON
            </button>
            <input type="file" id="file-upload-input" onchange="importJSON(event)" accept=".json" class="hidden">
            <button onclick="resetAllData()" class="bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold py-2 px-4 rounded-xl text-xs border border-rose-200">
              Reset Total Data
            </button>
          </div>
          <div id="backup-msg" class="text-xs font-semibold text-emerald-600"></div>
        </div>
      </section>

    </main>
  </div>

  <script>
    // State Initialization
    let appState = ${dataJSON};

    // Load from LocalStorage if available
    const savedData = localStorage.getItem('fitness_tracker_data');
    if (savedData) {
      try {
        appState = JSON.parse(savedData);
      } catch (e) {
        console.warn("Gagal memuat local storage, menggunakan state default.", e);
      }
    }

    // Sound alert generator
    function playAudioAlert(type = 'success') {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        if (type === 'success') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.45);
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.1);
        }
      } catch (e) {
        console.log("Audio not supported in this environment");
      }
    }

    // Save state helper
    function saveState() {
      localStorage.setItem('fitness_tracker_data', JSON.stringify(appState));
      renderAll();
    }

    // Switch Tabs
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const activeTab = document.getElementById('tab-' + tabId);
      if (activeTab) activeTab.classList.remove('hidden');

      // Style active buttons
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('text-slate-400', 'hover:bg-slate-800');
      });
      const activeBtn = document.getElementById('nav-' + tabId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-400', 'hover:bg-slate-800');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
      }
    }

    // Date formatting
    function formatDate(str) {
      const p = str.split('-');
      if (p.length !== 3) return str;
      const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return p[2] + ' ' + m[parseInt(p[1])-1] + ' ' + p[0];
    }

    function getTodayString() {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // Water tracker adjustments
    function updateWater(amt) {
      const today = getTodayString();
      let log = appState.waterIntake.find(w => w.date === today);
      if (!log) {
        log = { id: 'wat-' + Date.now(), date: today, amount: 0 };
        appState.waterIntake.push(log);
      }
      log.amount = Math.max(0, log.amount + amt);
      saveState();
    }

    // Add Workout
    function addWorkout(e) {
      e.preventDefault();
      const type = document.getElementById('workout-type').value;
      const custom = document.getElementById('workout-custom-type').value;
      const duration = parseInt(document.getElementById('workout-duration').value);
      const calories = parseInt(document.getElementById('workout-calories').value);
      const date = document.getElementById('workout-date').value;

      const finalType = type === 'Lainnya' ? (custom || 'Olahraga Kustom') : type;
      appState.workouts.push({
        id: 'w-' + Date.now(),
        date,
        type: finalType,
        duration,
        calories
      });

      document.getElementById('form-workout').reset();
      document.getElementById('custom-workout-container').classList.add('hidden');
      saveState();
    }

    function deleteWorkout(id) {
      appState.workouts = appState.workouts.filter(w => w.id !== id);
      saveState();
    }

    function toggleCustomWorkout(val) {
      const el = document.getElementById('custom-workout-container');
      if (val === 'Lainnya') el.classList.remove('hidden');
      else el.classList.add('hidden');
    }

    // Add Meal
    function addMeal(e) {
      e.preventDefault();
      const name = document.getElementById('meal-name').value;
      const type = document.getElementById('meal-type').value;
      const calories = parseInt(document.getElementById('meal-calories').value);
      const date = document.getElementById('meal-date').value;

      appState.meals.push({
        id: 'm-' + Date.now(),
        date,
        name,
        calories,
        type
      });

      document.getElementById('form-meal').reset();
      saveState();
    }

    function deleteMeal(id) {
      appState.meals = appState.meals.filter(m => m.id !== id);
      saveState();
    }

    // Add Weight
    function addWeight(e) {
      e.preventDefault();
      const wt = parseFloat(document.getElementById('weight-input').value);
      const date = document.getElementById('weight-date').value;

      appState.weightHistory.push({
        id: 'wt-' + Date.now(),
        date,
        weight: wt
      });
      appState.profile.currentWeight = wt;
      document.getElementById('form-weight').reset();
      saveState();
    }

    function deleteWeight(id) {
      appState.weightHistory = appState.weightHistory.filter(w => w.id !== id);
      saveState();
    }

    // Update Profile Targets
    function updateProfile(e) {
      e.preventDefault();
      appState.profile.name = document.getElementById('prof-name').value;
      appState.profile.height = parseInt(document.getElementById('prof-height').value) || 170;
      appState.profile.weightTarget = parseFloat(document.getElementById('prof-weight-tgt').value) || 70;
      appState.profile.calorieTarget = parseInt(document.getElementById('prof-cal-tgt').value) || 2000;
      appState.profile.calorieBurnTarget = parseInt(document.getElementById('prof-burn-tgt').value) || 400;
      appState.profile.waterTarget = parseInt(document.getElementById('prof-water-tgt').value) || 2500;
      saveState();
      
      const backupMsg = document.getElementById('backup-msg');
      backupMsg.innerText = 'Profil diperbarui!';
      setTimeout(() => backupMsg.innerText = '', 3000);
    }

    // Backup & Reset Operations
    function exportJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "fitness_tracker_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function importJSON(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.profile && parsed.workouts && parsed.meals && parsed.weightHistory) {
            appState = parsed;
            saveState();
            document.getElementById('backup-msg').innerText = 'Data sukses diunggah!';
          } else {
            alert('File backup rusak!');
          }
        } catch(err) {
          alert('Gagal mengimpor file!');
        }
      }
      reader.readAsText(file);
    }

    function resetAllData() {
      if (confirm('Apakah Anda yakin ingin me-reset semua data?')) {
        localStorage.removeItem('fitness_tracker_data');
        location.reload();
      }
    }

    // Timer Variables
    let timerInterval = null;
    let timerSecsLeft = 60;
    let timerTotal = 60;

    function renderTimer() {
      document.getElementById('timer-display').innerText = 
        String(Math.floor(timerSecsLeft / 60)).padStart(2, '0') + ':' + String(timerSecsLeft % 60).padStart(2, '0');
      
      const ratio = timerSecsLeft / timerTotal;
      const offset = 502 * (1 - ratio);
      document.getElementById('timer-progress').setAttribute('stroke-dashoffset', offset);
    }

    function toggleTimer() {
      const btn = document.getElementById('btn-timer-play');
      const status = document.getElementById('timer-status');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.innerText = 'Mulai';
        status.innerText = 'Jeda';
      } else {
        btn.innerText = 'Jeda';
        status.innerText = 'Berjalan';
        timerInterval = setInterval(() => {
          if (timerSecsLeft <= 1) {
            timerSecsLeft = 0;
            renderTimer();
            clearInterval(timerInterval);
            timerInterval = null;
            btn.innerText = 'Mulai';
            status.innerText = 'Waktu Habis!';
            playAudioAlert('success');
          } else {
            timerSecsLeft--;
            if (timerSecsLeft <= 3) playAudioAlert('countdown');
            renderTimer();
          }
        }, 1000);
      }
    }

    function resetTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      document.getElementById('btn-timer-play').innerText = 'Mulai';
      document.getElementById('timer-status').innerText = 'Jeda';
      timerSecsLeft = timerTotal;
      renderTimer();
    }

    function setTimerSecs(secs) {
      resetTimer();
      timerTotal = secs;
      timerSecsLeft = secs;
      renderTimer();
    }

    // Main Renderer
    function renderAll() {
      const today = getTodayString();
      
      // Update sidebar/header profile
      document.getElementById('sidebar-name').innerText = appState.profile.name;
      document.getElementById('sidebar-avatar').innerText = appState.profile.name.charAt(0).toUpperCase();
      document.getElementById('dash-greeting').innerText = 'Halo, ' + appState.profile.name + '! 👋';
      document.getElementById('dash-date').innerText = formatDate(today);

      // Math for dashboard today metrics
      const workoutsToday = appState.workouts.filter(w => w.date === today);
      const mealsToday = appState.meals.filter(m => m.date === today);
      const waterLogToday = appState.waterIntake.find(w => w.date === today);

      const consumedVal = mealsToday.reduce((sum, m) => sum + m.calories, 0);
      const burnedVal = workoutsToday.reduce((sum, w) => sum + w.calories, 0);
      const waterVal = waterLogToday ? waterLogToday.amount : 0;
      
      const currentWeightVal = appState.profile.currentWeight || (appState.weightHistory.length > 0 ? appState.weightHistory[appState.weightHistory.length - 1].weight : 70);

      // Set input values in profile edit
      document.getElementById('prof-name').value = appState.profile.name;
      document.getElementById('prof-height').value = appState.profile.height || 170;
      document.getElementById('prof-weight-tgt').value = appState.profile.weightTarget;
      document.getElementById('prof-cal-tgt').value = appState.profile.calorieTarget;
      document.getElementById('prof-burn-tgt').value = appState.profile.calorieBurnTarget;
      document.getElementById('prof-water-tgt').value = appState.profile.waterTarget;

      // Values
      document.getElementById('val-consumed').innerText = consumedVal;
      document.getElementById('tgt-consumed').innerText = '/ ' + appState.profile.calorieTarget + ' kcal';
      document.getElementById('val-burned').innerText = burnedVal;
      document.getElementById('tgt-burned').innerText = '/ ' + appState.profile.calorieBurnTarget + ' kcal';
      document.getElementById('val-water').innerText = waterVal;
      document.getElementById('tgt-water').innerText = '/ ' + appState.profile.waterTarget + ' ml';
      document.getElementById('val-weight').innerText = currentWeightVal;
      document.getElementById('val-weight-tgt').innerText = appState.profile.weightTarget;

      // Circle offsets
      const consumedOffset = 251 * (1 - Math.min(1, consumedVal / appState.profile.calorieTarget));
      const burnedOffset = 251 * (1 - Math.min(1, burnedVal / appState.profile.calorieBurnTarget));
      const waterOffset = 251 * (1 - Math.min(1, waterVal / appState.profile.waterTarget));

      document.getElementById('ring-consumed').setAttribute('stroke-dashoffset', consumedOffset);
      document.getElementById('ring-burned').setAttribute('stroke-dashoffset', burnedOffset);
      document.getElementById('ring-water').setAttribute('stroke-dashoffset', waterOffset);

      // BMI Rendering
      const heightM = (appState.profile.height || 170) / 100;
      const bmi = Number((currentWeightVal / (heightM * heightM)).toFixed(1));
      document.getElementById('bmi-val').innerText = bmi;
      
      const bmiLbl = document.getElementById('bmi-lbl');
      if (bmi < 18.5) {
        bmiLbl.innerText = 'Kekurangan Berat (Underweight)';
        bmiLbl.className = 'text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg w-fit mt-2';
      } else if (bmi >= 18.5 && bmi < 25) {
        bmiLbl.innerText = 'Normal / Sehat (Ideal)';
        bmiLbl.className = 'text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit mt-2';
      } else {
        bmiLbl.innerText = 'Kelebihan Berat (Overweight/Obese)';
        bmiLbl.className = 'text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg w-fit mt-2';
      }

      // Weight Status Text on Dashboard
      const weightDiff = Number((currentWeightVal - appState.profile.weightTarget).toFixed(1));
      const wtStatus = document.getElementById('weight-status-text');
      if (weightDiff > 0) {
        wtStatus.innerText = weightDiff + ' kg lagi menuju target!';
        wtStatus.className = 'w-full text-[10px] text-indigo-600 italic bg-indigo-50 py-1 rounded';
      } else if (weightDiff === 0) {
        wtStatus.innerText = 'Target tercapai! Hebat!';
        wtStatus.className = 'w-full text-[10px] text-emerald-600 italic bg-emerald-50 py-1 rounded';
      } else {
        wtStatus.innerText = Math.abs(weightDiff) + ' kg di bawah target!';
        wtStatus.className = 'w-full text-[10px] text-amber-600 italic bg-amber-50 py-1 rounded';
      }

      // Render Lists
      renderWorkouts();
      renderMeals();
      renderWeights();
      renderChart();
    }

    function renderWorkouts() {
      const container = document.getElementById('workout-list');
      if (appState.workouts.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-4">Belum ada olahraga dicatat.</p>';
        return;
      }
      const sorted = [...appState.workouts].sort((a,b) => b.date.localeCompare(a.date));
      container.innerHTML = sorted.map(w => \`
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div class="text-xs font-bold text-slate-800">\${w.type} <span class="font-normal text-[10px] text-slate-400">(\${w.duration} m)</span></div>
            <div class="text-[9px] text-slate-400">\${formatDate(w.date)} • <span class="text-orange-500 font-semibold">\${w.calories} kcal</span></div>
          </div>
          <button onclick="deleteWorkout('\${w.id}')" class="text-xs text-rose-500 hover:bg-rose-50 p-1 rounded">Hapus</button>
        </div>
      \`).join('');
    }

    function renderMeals() {
      const container = document.getElementById('meal-list');
      if (appState.meals.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-4">Belum ada makanan dicatat.</p>';
        return;
      }
      const sorted = [...appState.meals].sort((a,b) => b.date.localeCompare(a.date));
      container.innerHTML = sorted.map(m => \`
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div class="text-xs font-bold text-slate-800">\${m.name} <span class="font-normal text-[9px] bg-slate-200 px-1 rounded">\${m.type}</span></div>
            <div class="text-[9px] text-slate-400">\${formatDate(m.date)} • <span class="text-emerald-600 font-semibold">\${m.calories} kcal</span></div>
          </div>
          <button onclick="deleteMeal('\${m.id}')" class="text-xs text-rose-500 hover:bg-rose-50 p-1 rounded">Hapus</button>
        </div>
      \`).join('');
    }

    function renderWeights() {
      const container = document.getElementById('weight-list');
      if (appState.weightHistory.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-4">Belum ada timbangan dicatat.</p>';
        return;
      }
      const sorted = [...appState.weightHistory].sort((a,b) => b.date.localeCompare(a.date));
      container.innerHTML = sorted.map(w => \`
        <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div class="text-xs font-bold text-slate-800">\${w.weight} kg</div>
            <div class="text-[9px] text-slate-400">\${formatDate(w.date)}</div>
          </div>
          <button onclick="deleteWeight('\${w.id}')" class="text-xs text-rose-500 hover:bg-rose-50 p-1 rounded">Hapus</button>
        </div>
      \`).join('');
    }

    // Render Custom SVG Chart
    function renderChart() {
      const chart = document.getElementById('svg-trend-chart');
      if (!chart) return;

      // Compute last 7 days dates
      const dates = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const dy = String(d.getDate()).padStart(2,'0');
        dates.push(y + '-' + m + '-' + dy);
      }

      const chartData = dates.map(date => {
        const consumed = appState.meals.filter(m => m.date === date).reduce((sum,m)=>sum+m.calories, 0);
        const burned = appState.workouts.filter(w => w.date === date).reduce((sum,w)=>sum+w.calories, 0);
        
        const dObj = new Date(date);
        const lbl = dObj.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][dObj.getMonth()];
        return { label: lbl, consumed, burned };
      });

      const maxVal = Math.max(...chartData.map(d => Math.max(d.consumed, d.burned, 2000)));
      const chartHeight = 160;
      const colW = (500 - 40) / 7;

      // Generate grid lines
      let svgContent = '';
      [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = 20 + ratio * (chartHeight - 40);
        const val = Math.round(maxVal * (1 - ratio));
        svgContent += \`
          <line x1="35" y1="\${y}" x2="490" y2="\${y}" stroke="#f1f5f9" stroke-width="1" />
          <text x="30" y="\${y+4}" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">\${val}</text>
        \`;
      });

      // Generate Bars
      chartData.map((d, i) => {
        const x = 40 + i * colW;
        const bW = 14;
        
        const conH = (d.consumed / maxVal) * (chartHeight - 40);
        const conY = chartHeight - 20 - conH;

        const burnH = (d.burned / maxVal) * (chartHeight - 40);
        const burnY = chartHeight - 20 - burnH;

        svgContent += \`
          <!-- Consumed Bar (Green) -->
          <rect x="\${x}" y="\${conY}" width="\${bW}" height="\${Math.max(2, conH)}" rx="2" fill="#10b981" />
          <!-- Burned Bar (Orange) -->
          <rect x="\${x + bW + 2}" y="\${burnY}" width="\${bW}" height="\${Math.max(2, burnH)}" rx="2" fill="#f97316" />
          <!-- X Axis Label -->
          <text x="\${x + bW}" y="\${chartHeight - 4}" fill="#64748b" font-size="8" font-weight="500" text-anchor="middle">\${d.label}</text>
        \`;
      });

      chart.innerHTML = svgContent;
    }

    // Initial load
    window.onload = function() {
      // Set dates inputs
      const today = getTodayString();
      document.getElementById('workout-date').value = today;
      document.getElementById('meal-date').value = today;
      document.getElementById('weight-date').value = today;

      renderAll();
      renderTimer();
    }
  </script>
</body>
</html>`;
}
