import type { WorkoutExercise, WorkoutSet } from "./types";
import { uid } from "./utils";

export function setVolume(weight: number, reps: number): number {
  return Math.max(0, weight) * Math.max(0, reps);
}

export function recalcExerciseVolume(ex: WorkoutExercise): WorkoutExercise {
  const sets = ex.sets.map((s) => ({
    ...s,
    volume: setVolume(s.weight, s.reps),
  }));
  const totalVolume = sets.reduce((a, s) => a + s.volume, 0);
  return { ...ex, sets, totalVolume };
}

export function recalcSessionVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
}

export function emptySet(prev?: WorkoutSet): WorkoutSet {
  return {
    id: uid(),
    weight: prev?.weight ?? 0,
    reps: prev?.reps ?? 0,
    volume: setVolume(prev?.weight ?? 0, prev?.reps ?? 0),
    note: "",
  };
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}
