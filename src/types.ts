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
}

export interface TrackerData {
  profile: UserProfile;
  workouts: Workout[];
  meals: Meal[];
  weightHistory: WeightLog[];
  waterIntake: WaterLog[];
}
