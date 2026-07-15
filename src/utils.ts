/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrackerData, Workout, Meal, WeightLog, WaterLog } from './types';

// Web Audio API Sound alerts (synthesized purely in client)
export function playTimerAlert(type: 'beep' | 'success' | 'countdown' = 'success') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'success') {
      // High-quality double chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.35); // B5
      gain2.gain.setValueAtTime(0.12, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.65);
    } else if (type === 'beep') {
      // Standard timer tick/beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'countdown') {
      // Soft clock tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (error) {
    console.warn("Web Audio API is not fully supported or active in this frame context.", error);
  }
}

// Date helpers
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `${day} ${months[monthIndex] || parts[1]} ${year}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${months[monthIndex] || parts[1]}`;
}

export function getPastDates(count: number = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

// Generate premium mock data for user so that charts and history look beautiful on load
export function generateInitialData(): TrackerData {
  const pastDates = getPastDates(7);
  const todayDate = getTodayDateString();

  // Create Workout History
  const workouts: Workout[] = [
    { id: 'w-1', date: pastDates[0], type: 'Lari Pagi', duration: 30, calories: 320, notes: 'Lari keliling komplek rumah, cuaca mendung' },
    { id: 'w-2', date: pastDates[1], type: 'Angkat Beban', duration: 45, calories: 250, notes: 'Latihan Push Day di gym lokal' },
    { id: 'w-3', date: pastDates[2], type: 'Bersepeda', duration: 40, calories: 350, notes: 'Rute menanjak ringan, angin kencang' },
    { id: 'w-4', date: pastDates[3], type: 'Angkat Beban', duration: 50, calories: 280, notes: 'Latihan Pull Day, fokus pada deadlift' },
    { id: 'w-5', date: pastDates[4], type: 'Lari Sore', duration: 35, calories: 380, notes: 'Kecepatan stabil di lintasan lari' },
    { id: 'w-6', date: pastDates[5], type: 'Yoga', duration: 30, calories: 110, notes: 'Sesi relaksasi dan peregangan intens' },
    { id: 'w-7', date: todayDate, type: 'Angkat Beban', duration: 40, calories: 220, notes: 'Sesi Leg Day singkat tapi padat' }
  ];

  // Create Meal History
  const meals: Meal[] = [
    // Day 1
    { id: 'm-1', date: pastDates[0], name: 'Bubur Ayam', calories: 350, type: 'breakfast' },
    { id: 'm-2', date: pastDates[0], name: 'Nasi Padang Ayam Bakar', calories: 750, type: 'lunch' },
    { id: 'm-3', date: pastDates[0], name: 'Sate Ayam Tanpa Kulit', calories: 450, type: 'dinner' },
    { id: 'm-4', date: pastDates[0], name: 'Pisang & Whey Protein', calories: 220, type: 'snack' },

    // Day 2
    { id: 'm-5', date: pastDates[1], name: 'Oatmeal & Madu', calories: 280, type: 'breakfast' },
    { id: 'm-6', date: pastDates[1], name: 'Gado-Gado', calories: 500, type: 'lunch' },
    { id: 'm-7', date: pastDates[1], name: 'Ikan Bakar & Cah Kangkung', calories: 400, type: 'dinner' },
    { id: 'm-8', date: pastDates[1], name: 'Apel Merah', calories: 80, type: 'snack' },

    // Day 3
    { id: 'm-9', date: pastDates[2], name: 'Roti Gandum & Telur', calories: 310, type: 'breakfast' },
    { id: 'm-10', date: pastDates[2], name: 'Nasi Merah & Ayam Goreng Dada', calories: 620, type: 'lunch' },
    { id: 'm-11', date: pastDates[2], name: 'Sup Daging Sapi', calories: 450, type: 'dinner' },

    // Day 4
    { id: 'm-12', date: pastDates[3], name: 'Oatmeal & Pisang', calories: 350, type: 'breakfast' },
    { id: 'm-13', date: pastDates[3], name: 'Gado-gado Komplit', calories: 550, type: 'lunch' },
    { id: 'm-14', date: pastDates[3], name: 'Tumis Dada Ayam', calories: 380, type: 'dinner' },
    { id: 'm-15', date: pastDates[3], name: 'Yogurt Rendah Lemak', calories: 120, type: 'snack' },

    // Day 5
    { id: 'm-16', date: pastDates[4], name: 'Roti Gandum Alpukat', calories: 320, type: 'breakfast' },
    { id: 'm-17', date: pastDates[4], name: 'Nasi Goreng Sehat (Tanpa Minyak)', calories: 580, type: 'lunch' },
    { id: 'm-18', date: pastDates[4], name: 'Pecel Ayam Dada', calories: 420, type: 'dinner' },

    // Day 6
    { id: 'm-19', date: pastDates[5], name: 'Oatmeal Madu', calories: 280, type: 'breakfast' },
    { id: 'm-20', date: pastDates[5], name: 'Soto Ayam Nasi', calories: 520, type: 'lunch' },
    { id: 'm-21', date: pastDates[5], name: 'Steak Tempe & Salad', calories: 350, type: 'dinner' },

    // Day 7 (Today)
    { id: 'm-22', date: todayDate, name: 'Telur Rebus 2 Butir & Roti Gandum', calories: 290, type: 'breakfast' },
    { id: 'm-23', date: todayDate, name: 'Nasi Merah, Pepes Tahu, & Ayam Panggang', calories: 590, type: 'lunch' },
    { id: 'm-24', date: todayDate, name: 'Sup Ikan Kemangi', calories: 350, type: 'dinner' },
  ];

  // Create Weight History (gradual decline)
  const weightHistory: WeightLog[] = [
    { id: 'wgt-1', date: pastDates[0], weight: 75.8 },
    { id: 'wgt-2', date: pastDates[1], weight: 75.6 },
    { id: 'wgt-3', date: pastDates[2], weight: 75.5 },
    { id: 'wgt-4', date: pastDates[3], weight: 75.2 },
    { id: 'wgt-5', date: pastDates[4], weight: 75.3 },
    { id: 'wgt-6', date: pastDates[5], weight: 75.0 },
    { id: 'wgt-7', date: todayDate, weight: 74.8 }
  ];

  // Water logs
  const waterIntake: WaterLog[] = [
    { id: 'wat-1', date: pastDates[0], amount: 2000 },
    { id: 'wat-2', date: pastDates[1], amount: 2500 },
    { id: 'wat-3', date: pastDates[2], amount: 1800 },
    { id: 'wat-4', date: pastDates[3], amount: 2200 },
    { id: 'wat-5', date: pastDates[4], amount: 3000 },
    { id: 'wat-6', date: pastDates[5], amount: 2400 },
    { id: 'wat-7', date: todayDate, amount: 1500 }
  ];

  return {
    profile: {
      name: 'Budi Pratama',
      currentWeight: 74.8,
      weightTarget: 70.0,
      calorieTarget: 2100,
      calorieBurnTarget: 400,
      waterTarget: 2500
    },
    workouts,
    meals,
    weightHistory,
    waterIntake
  };
}
