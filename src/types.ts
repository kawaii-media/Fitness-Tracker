/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  type: string; // e.g., Running, Cycling, Strength, Yoga, Custom
  duration: number; // in minutes
  calories: number; // kcal
  notes?: string;
  category?: 'strength' | 'distance' | 'static' | 'general';
  weightKg?: number; // for strength training
  reps?: number; // for strength training
  sets?: number; // for strength training
  distanceKm?: number; // for running/walking/cycling
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  name: string; // e.g., Oatmeal, Grilled Chicken
  calories: number; // kcal
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // ml
}

export interface UserProfile {
  name: string;
  currentWeight: number;
  weightTarget: number;
  calorieTarget: number; // daily intake goal
  calorieBurnTarget: number; // daily burn goal
  waterTarget: number; // daily water goal in ml
  height?: number; // height in cm
  isOnboarded?: boolean; // flag for setup form
}

export interface TrackerData {
  profile: UserProfile;
  workouts: Workout[];
  meals: Meal[];
  weightHistory: WeightLog[];
  waterIntake: WaterLog[];
}
