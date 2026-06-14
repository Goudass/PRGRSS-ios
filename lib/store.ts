import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActiveWorkoutDraft,
  PlanExercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
} from "./types";
import { uid, formatDate } from "./utils";
import {
  emptySet,
  recalcExerciseVolume,
  recalcSessionVolume,
  setVolume,
} from "./volume";
import { demoDataSnapshot } from "./sample-data";

const LEGACY_STORAGE_KEY = "dziennik-treningowy-storage";
const STORAGE_KEY = "prgrss-storage";

/** Jednorazowa migracja danych po zmianie nazwy klucza localStorage. */
function migrateLegacyPersistedState() {
  if (typeof window === "undefined") return;
  try {
    const next = localStorage.getItem(STORAGE_KEY);
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!next && legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

migrateLegacyPersistedState();

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function pickSessionDate(override?: string): string {
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    const t = new Date(override + "T12:00:00");
    if (!Number.isNaN(t.getTime())) return override;
  }
  return todayIso();
}

function recomputeDraft(d: ActiveWorkoutDraft): ActiveWorkoutDraft {
  const exercises = d.exercises.map((ex) => recalcExerciseVolume(ex));
  return { ...d, exercises };
}

export interface GymStore {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  activeDraft: ActiveWorkoutDraft | null;
  unit: "kg";
  seedIfEmpty: () => void;
  loadDemoData: () => void;
  addPlan: (p: Omit<WorkoutPlan, "id" | "exercises"> & { exercises?: PlanExercise[] }) => string;
  updatePlan: (id: string, patch: Partial<Pick<WorkoutPlan, "name" | "description">>) => void;
  deletePlan: (id: string) => void;
  addPlanExercise: (planId: string, ex: Omit<PlanExercise, "id">) => void;
  updatePlanExercise: (planId: string, exId: string, patch: Partial<PlanExercise>) => void;
  deletePlanExercise: (planId: string, exId: string) => void;
  startWorkoutFromPlan: (planId: string, dateOverride?: string) => void;
  startQuickWorkout: (name?: string, dateOverride?: string) => void;
  updateActiveNotes: (notes: string) => void;
  addExerciseToActive: (name: string, exerciseId?: string) => void;
  removeExerciseFromActive: (exerciseRowId: string) => void;
  addSet: (exerciseRowId: string) => void;
  removeSet: (exerciseRowId: string, setId: string) => void;
  updateSet: (exerciseRowId: string, setId: string, patch: Partial<Pick<WorkoutSet, "weight" | "reps" | "note">>) => void;
  completeActiveWorkout: () => void;
  cancelActiveWorkout: () => void;
  updateSession: (id: string, patch: Partial<Pick<WorkoutSession, "notes" | "date" | "exercises">>) => void;
  deleteSession: (id: string) => void;
  exportJson: () => string;
  exportCsv: () => string;
}

export const useGymStore = create<GymStore>()(
  persist(
    (set, get) => ({
      plans: [],
      sessions: [],
      activeDraft: null,
      unit: "kg",
      seedIfEmpty: () => {
        const { plans, sessions } = get();
        if (plans.length === 0 && sessions.length === 0) {
          const { plans: seededPlans, sessions: seededSessions } = demoDataSnapshot();
          set({ plans: seededPlans, sessions: seededSessions });
        }
      },
      loadDemoData: () => {
        const { plans: seededPlans, sessions: seededSessions } = demoDataSnapshot();
        set({ plans: seededPlans, sessions: seededSessions, activeDraft: null });
      },
      addPlan: (p) => {
        const id = uid();
        const plan: WorkoutPlan = {
          id,
          name: p.name,
          description: p.description,
          exercises: p.exercises ?? [],
        };
        set((s) => ({ plans: [...s.plans, plan] }));
        return id;
      },
      updatePlan: (id, patch) =>
        set((s) => ({
          plans: s.plans.map((pl) => (pl.id === id ? { ...pl, ...patch } : pl)),
        })),
      deletePlan: (id) =>
        set((s) => ({
          plans: s.plans.filter((p) => p.id !== id),
        })),
      addPlanExercise: (planId, ex) =>
        set((s) => ({
          plans: s.plans.map((pl) =>
            pl.id === planId
              ? { ...pl, exercises: [...pl.exercises, { ...ex, id: uid() }] }
              : pl
          ),
        })),
      updatePlanExercise: (planId, exId, patch) =>
        set((s) => ({
          plans: s.plans.map((pl) =>
            pl.id === planId
              ? {
                  ...pl,
                  exercises: pl.exercises.map((e) =>
                    e.id === exId ? { ...e, ...patch } : e
                  ),
                }
              : pl
          ),
        })),
      deletePlanExercise: (planId, exId) =>
        set((s) => ({
          plans: s.plans.map((pl) =>
            pl.id === planId
              ? { ...pl, exercises: pl.exercises.filter((e) => e.id !== exId) }
              : pl
          ),
        })),
      startWorkoutFromPlan: (planId, dateOverride) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;
        const exercises: WorkoutExercise[] = plan.exercises.map((e) =>
          recalcExerciseVolume({
            id: uid(),
            exerciseId: e.id,
            name: e.name,
            sets: [emptySet()],
            totalVolume: 0,
          })
        );
        const draft: ActiveWorkoutDraft = {
          id: uid(),
          planId: plan.id,
          planName: plan.name,
          date: pickSessionDate(dateOverride),
          exercises,
          startedAt: new Date().toISOString(),
        };
        set({ activeDraft: recomputeDraft(draft) });
      },
      startQuickWorkout: (name, dateOverride) => {
        const draft: ActiveWorkoutDraft = {
          id: uid(),
          planId: undefined,
          planName: name?.trim() || "Szybki trening",
          date: pickSessionDate(dateOverride),
          exercises: [],
          startedAt: new Date().toISOString(),
        };
        set({ activeDraft: draft });
      },
      updateActiveNotes: (notes) =>
        set((s) =>
          s.activeDraft ? { activeDraft: { ...s.activeDraft, notes } } : {}
        ),
      addExerciseToActive: (name, exerciseId) =>
        set((s) => {
          if (!s.activeDraft) return {};
          const ex: WorkoutExercise = recalcExerciseVolume({
            id: uid(),
            exerciseId,
            name: name.trim(),
            sets: [emptySet()],
            totalVolume: 0,
          });
          return {
            activeDraft: recomputeDraft({
              ...s.activeDraft,
              exercises: [...s.activeDraft.exercises, ex],
            }),
          };
        }),
      removeExerciseFromActive: (exerciseRowId) =>
        set((s) => {
          if (!s.activeDraft) return {};
          return {
            activeDraft: recomputeDraft({
              ...s.activeDraft,
              exercises: s.activeDraft.exercises.filter((e) => e.id !== exerciseRowId),
            }),
          };
        }),
      addSet: (exerciseRowId) =>
        set((s) => {
          if (!s.activeDraft) return {};
          const exercises = s.activeDraft.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            const last = ex.sets[ex.sets.length - 1];
            return recalcExerciseVolume({
              ...ex,
              sets: [...ex.sets, emptySet(last)],
            });
          });
          return { activeDraft: recomputeDraft({ ...s.activeDraft, exercises }) };
        }),
      removeSet: (exerciseRowId, setId) =>
        set((s) => {
          if (!s.activeDraft) return {};
          const exercises = s.activeDraft.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            const sets = ex.sets.filter((x) => x.id !== setId);
            return recalcExerciseVolume({ ...ex, sets: sets.length ? sets : [emptySet()] });
          });
          return { activeDraft: recomputeDraft({ ...s.activeDraft, exercises }) };
        }),
      updateSet: (exerciseRowId, setId, patch) =>
        set((s) => {
          if (!s.activeDraft) return {};
          const exercises = s.activeDraft.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            const sets = ex.sets.map((st) => {
              if (st.id !== setId) return st;
              const weight = patch.weight !== undefined ? Math.max(0, patch.weight) : st.weight;
              const reps = patch.reps !== undefined ? Math.max(0, Math.floor(patch.reps)) : st.reps;
              const note = patch.note !== undefined ? patch.note : st.note;
              return {
                ...st,
                weight,
                reps,
                note,
                volume: setVolume(weight, reps),
              };
            });
            return recalcExerciseVolume({ ...ex, sets });
          });
          return { activeDraft: recomputeDraft({ ...s.activeDraft, exercises }) };
        }),
      completeActiveWorkout: () => {
        const d = get().activeDraft;
        if (!d) return;
        const exercises = d.exercises.map((e) => recalcExerciseVolume(e));
        const totalVolume = recalcSessionVolume(exercises);
        const session: WorkoutSession = {
          id: d.id,
          planId: d.planId,
          planName: d.planName,
          date: d.date,
          exercises,
          totalVolume,
          notes: d.notes,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeDraft: null,
        }));
      },
      cancelActiveWorkout: () => set({ activeDraft: null }),
      updateSession: (id, patch) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== id) return sess;
            const next: WorkoutSession = { ...sess, ...patch };
            if (patch.exercises) {
              next.exercises = patch.exercises.map((e) => recalcExerciseVolume(e));
            }
            next.totalVolume = recalcSessionVolume(next.exercises);
            return next;
          }),
        })),
      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
      exportJson: () => JSON.stringify({ plans: get().plans, sessions: get().sessions }, null, 2),
      exportCsv: () => {
        const rows = [["date", "plan", "exercise", "weight", "reps", "volume", "note"]];
        for (const sess of get().sessions) {
          for (const ex of sess.exercises) {
            for (const st of ex.sets) {
              rows.push([
                sess.date,
                sess.planName,
                ex.name,
                String(st.weight),
                String(st.reps),
                String(st.volume),
                st.note ?? "",
              ]);
            }
          }
        }
        return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        plans: s.plans,
        sessions: s.sessions,
        activeDraft: s.activeDraft,
        unit: s.unit,
      }),
    }
  )
);

export function useActiveVolume(): number {
  const d = useGymStore((s) => s.activeDraft);
  if (!d) return 0;
  return recalcSessionVolume(d.exercises.map((e) => recalcExerciseVolume(e)));
}

export function formatSessionTitle(sess: WorkoutSession): string {
  return `${sess.planName} — ${formatDate(sess.date)}`;
}
