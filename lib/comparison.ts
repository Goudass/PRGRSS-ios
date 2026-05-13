import type { ActiveWorkoutDraft, WorkoutExercise, WorkoutSession } from "./types";
import { normalizeName, recalcExerciseVolume } from "./volume";
import { formatKg } from "./utils";

export interface ExercisePreviousSummary {
  setsPreview: string;
  setCount: number;
  avgWeight: number;
  avgReps: number;
  totalVolume: number;
  lastSets: { weight: number; reps: number }[];
}

function findMatchingExercise(
  prev: WorkoutSession,
  ex: WorkoutExercise
): WorkoutExercise | undefined {
  return prev.exercises.find((p) => {
    if (ex.exerciseId && p.exerciseId) return p.exerciseId === ex.exerciseId;
    return normalizeName(p.name) === normalizeName(ex.name);
  });
}

export function summarizeExercisePrevious(prevEx: WorkoutExercise): ExercisePreviousSummary {
  const lastSets = prevEx.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
  const setsPreview = lastSets.map((s) => `${formatKg(s.weight)} kg × ${s.reps}`).join(", ");
  const setCount = prevEx.sets.length;
  const totalVolume = prevEx.totalVolume;
  const avgWeight =
    setCount > 0 ? prevEx.sets.reduce((a, s) => a + s.weight, 0) / setCount : 0;
  const avgReps = setCount > 0 ? prevEx.sets.reduce((a, s) => a + s.reps, 0) / setCount : 0;
  return { setsPreview, setCount, avgWeight, avgReps, totalVolume, lastSets };
}

export function getPreviousSessionForPlanBeforeTime(
  sessions: WorkoutSession[],
  planId: string | undefined,
  beforeTime: number
): WorkoutSession | null {
  if (!planId) return null;
  return (
    [...sessions]
      .filter((s) => s.planId === planId && new Date(s.createdAt).getTime() < beforeTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
  );
}

export function getPreviousSessionForPlanExcluding(
  sessions: WorkoutSession[],
  planId: string | undefined,
  excludeSessionId: string
): WorkoutSession | null {
  if (!planId) return null;
  return (
    [...sessions]
      .filter((s) => s.planId === planId && s.id !== excludeSessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
  );
}

export function compareExerciseToPrevious(
  current: WorkoutExercise,
  previous: WorkoutExercise | undefined
): {
  deltaWeight: number;
  deltaReps: number;
  deltaVolume: number;
  progress: "up" | "same" | "down" | "none";
} {
  if (!previous || previous.sets.length === 0) {
    return { deltaWeight: 0, deltaReps: 0, deltaVolume: 0, progress: "none" };
  }
  const cur = recalcExerciseVolume(current);
  const maxWCur = Math.max(...cur.sets.map((s) => s.weight), 0);
  const maxWPrev = Math.max(...previous.sets.map((s) => s.weight), 0);
  const sumRepsCur = cur.sets.reduce((a, s) => a + s.reps, 0);
  const sumRepsPrev = previous.sets.reduce((a, s) => a + s.reps, 0);
  const deltaWeight = maxWCur - maxWPrev;
  const deltaReps = sumRepsCur - sumRepsPrev;
  const deltaVolume = cur.totalVolume - previous.totalVolume;
  let progress: "up" | "same" | "down" | "none" = "same";
  if (deltaVolume > 0 || deltaWeight > 0 || deltaReps > 0) progress = "up";
  else if (deltaVolume < 0 || (deltaWeight < 0 && sumRepsCur <= sumRepsPrev)) progress = "down";
  return { deltaWeight, deltaReps, deltaVolume, progress };
}

export function compareSessionVolumes(
  currentVolume: number,
  previousVolume: number
): {
  delta: number;
  pct: number;
  message: "better" | "same" | "worse";
} {
  const delta = currentVolume - previousVolume;
  const pct = previousVolume > 0 ? (delta / previousVolume) * 100 : currentVolume > 0 ? 100 : 0;
  let message: "better" | "same" | "worse" = "same";
  if (delta > 0.5) message = "better";
  else if (delta < -0.5) message = "worse";
  return { delta, pct, message };
}

export function sessionProgressVsPrevious(
  session: WorkoutSession,
  sessions: WorkoutSession[]
): { deltaVolume: number; pct: number; trend: "up" | "down" | "same" | "na" } {
  if (!session.planId) return { deltaVolume: 0, pct: 0, trend: "na" };
  const prev = getPreviousSessionForPlanExcluding(sessions, session.planId, session.id);
  if (!prev) return { deltaVolume: 0, pct: 0, trend: "na" };
  const deltaVolume = session.totalVolume - prev.totalVolume;
  const pct = prev.totalVolume > 0 ? (deltaVolume / prev.totalVolume) * 100 : 0;
  let trend: "up" | "down" | "same" = "same";
  if (deltaVolume > 0.5) trend = "up";
  else if (deltaVolume < -0.5) trend = "down";
  return { deltaVolume, pct, trend };
}

export function attachPreviousToDraft(
  draft: ActiveWorkoutDraft,
  sessions: WorkoutSession[]
): WorkoutSession | null {
  return getPreviousSessionForPlanBeforeTime(
    sessions,
    draft.planId,
    new Date(draft.startedAt).getTime()
  );
}

export function findPreviousExercise(
  prevSession: WorkoutSession | null,
  ex: WorkoutExercise
): WorkoutExercise | undefined {
  if (!prevSession) return undefined;
  return findMatchingExercise(prevSession, ex);
}
