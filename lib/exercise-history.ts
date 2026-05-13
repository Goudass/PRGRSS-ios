import type { WorkoutSession, WorkoutExercise, WorkoutSet } from "./types";
import { normalizeName } from "./volume";

export interface ExerciseHistoryPoint {
  date: string;
  sessionId: string;
  planName: string;
  sets: WorkoutSet[];
  maxWeight: number;
  maxReps: number;
  volume: number;
}

export function collectExerciseHistory(
  sessions: WorkoutSession[],
  opts: { exerciseId?: string; name?: string }
): ExerciseHistoryPoint[] {
  const nameNorm = opts.name ? normalizeName(opts.name) : "";
  const points: ExerciseHistoryPoint[] = [];
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  for (const s of sorted) {
    const ex = s.exercises.find((e) => {
      if (opts.exerciseId && e.exerciseId) return e.exerciseId === opts.exerciseId;
      if (opts.name) return normalizeName(e.name) === nameNorm;
      return false;
    });
    if (!ex || ex.sets.length === 0) continue;
    const maxWeight = Math.max(...ex.sets.map((st) => st.weight));
    const maxReps = Math.max(...ex.sets.map((st) => st.reps));
    points.push({
      date: s.date,
      sessionId: s.id,
      planName: s.planName,
      sets: ex.sets,
      maxWeight,
      maxReps,
      volume: ex.totalVolume,
    });
  }
  return points;
}

export function aggregateExerciseStats(points: ExerciseHistoryPoint[]) {
  if (points.length === 0) {
    return {
      bestWeight: 0,
      bestReps: 0,
      bestVolume: 0,
      seriesLog: [] as { date: string; label: string; sets: string }[],
    };
  }
  let bestWeight = 0;
  let bestReps = 0;
  let bestVolume = 0;
  const seriesLog: { date: string; label: string; sets: string }[] = [];
  for (const p of points) {
    bestWeight = Math.max(bestWeight, p.maxWeight);
    bestReps = Math.max(bestReps, p.maxReps);
    bestVolume = Math.max(bestVolume, p.volume);
    seriesLog.push({
      date: p.date,
      label: p.planName,
      sets: p.sets.map((s) => `${s.weight}×${s.reps}`).join(", "),
    });
  }
  return { bestWeight, bestReps, bestVolume, seriesLog };
}
