import type { WorkoutSession } from "./types";
import { localIsoDate } from "./utils";

export function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function sessionsInRange(sessions: WorkoutSession[], from: Date, to: Date) {
  const a = localIsoDate(from);
  const b = localIsoDate(to);
  return sessions.filter((s) => s.date >= a && s.date <= b);
}

export function weekVolumeByDay(sessions: WorkoutSession[], weekStart: Date) {
  const days: { iso: string; label: string; volume: number; count: number }[] = [];
  const labels = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = localIsoDate(d);
    const daySessions = sessions.filter((s) => s.date === iso);
    days.push({
      iso,
      label: labels[i],
      volume: daySessions.reduce((a, s) => a + s.totalVolume, 0),
      count: daySessions.length,
    });
  }
  return days;
}

export function sessionSetCount(s: WorkoutSession) {
  return s.exercises.reduce((a, e) => a + e.sets.length, 0);
}

export function aggregateSets(sessions: WorkoutSession[]) {
  return sessions.reduce((a, s) => a + sessionSetCount(s), 0);
}

export function weekComparison(sessions: WorkoutSession[], now = new Date()) {
  const thisStart = startOfWeek(now);
  const thisEnd = new Date(thisStart);
  thisEnd.setDate(thisEnd.getDate() + 6);
  const prevStart = new Date(thisStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(thisStart);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const thisWeek = sessionsInRange(sessions, thisStart, thisEnd);
  const prevWeek = sessionsInRange(sessions, prevStart, prevEnd);
  const thisVol = thisWeek.reduce((a, s) => a + s.totalVolume, 0);
  const prevVol = prevWeek.reduce((a, s) => a + s.totalVolume, 0);
  const pct = prevVol > 0 ? ((thisVol - prevVol) / prevVol) * 100 : thisVol > 0 ? 100 : 0;

  return {
    thisWeek,
    prevWeek,
    thisVol,
    prevVol,
    pct,
    thisCount: thisWeek.length,
    prevCount: prevWeek.length,
  };
}

export interface ExerciseVolumeRow {
  key: string;
  name: string;
  volume: number;
  exerciseId?: string;
}

export function topExercisesByVolume(sessions: WorkoutSession[], limit = 5): ExerciseVolumeRow[] {
  const map = new Map<string, ExerciseVolumeRow>();
  for (const s of sessions) {
    for (const ex of s.exercises) {
      const key = ex.exerciseId ?? ex.name.toLowerCase().trim();
      const cur = map.get(key);
      if (cur) cur.volume += ex.totalVolume;
      else
        map.set(key, {
          key,
          name: ex.name,
          volume: ex.totalVolume,
          exerciseId: ex.exerciseId,
        });
    }
  }
  return [...map.values()].sort((a, b) => b.volume - a.volume).slice(0, limit);
}

export function formatDurationMs(ms: number) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
