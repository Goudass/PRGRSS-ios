import type { WorkoutPlan, WorkoutSession, WorkoutExercise } from "./types";
import { uid } from "./utils";
import { recalcExerciseVolume, recalcSessionVolume, setVolume } from "./volume";

export function seedPlans(): WorkoutPlan[] {
  const goraId = uid();
  const dolId = uid();
  const ex = (name: string, group?: string) => ({
    id: uid(),
    name,
    muscleGroup: group,
  });
  const gora: WorkoutPlan = {
    id: goraId,
    name: "Góra",
    description: "Klatka, plecy, ramiona",
    exercises: [
      ex("Wyciskanie sztangi na ławce", "klata"),
      ex("Wiosłowanie hantlem", "plecy"),
      ex("Podciąganie / lat pulldown", "plecy"),
      ex("Wyciskanie hantli na barki", "barki"),
    ],
  };
  const dol: WorkoutPlan = {
    id: dolId,
    name: "Dół",
    description: "Nogi i core",
    exercises: [
      ex("Przysiad", "nogi"),
      ex("Martwy ciąg rumuński", "nogi"),
      ex("Wykroki", "nogi"),
      ex("Plank", "core"),
    ],
  };
  return [gora, dol];
}

function mkSession(
  plan: WorkoutPlan,
  date: string,
  setsSpec: { name: string; sets: [number, number][] }[]
): WorkoutSession {
  const exercises: WorkoutExercise[] = setsSpec.map((spec) => {
    const planEx = plan.exercises.find((e) => e.name === spec.name);
    const sets = spec.sets.map(([w, r]) => ({
      id: uid(),
      weight: w,
      reps: r,
      volume: setVolume(w, r),
    }));
    return recalcExerciseVolume({
      id: uid(),
      exerciseId: planEx?.id,
      name: spec.name,
      sets,
      totalVolume: 0,
    });
  });
  const totalVolume = recalcSessionVolume(exercises);
  return {
    id: uid(),
    planId: plan.id,
    planName: plan.name,
    date,
    exercises,
    totalVolume,
    createdAt: new Date(date + "T12:00:00").toISOString(),
  };
}

export function seedSessions(plans: WorkoutPlan[]): WorkoutSession[] {
  const gora = plans.find((p) => p.name === "Góra");
  const dol = plans.find((p) => p.name === "Dół");
  if (!gora || !dol) return [];
  const d1 = new Date();
  d1.setDate(d1.getDate() - 10);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 7);
  const d3 = new Date();
  d3.setDate(d3.getDate() - 3);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return [
    mkSession(gora, iso(d1), [
      { name: "Wyciskanie sztangi na ławce", sets: [[60, 10], [60, 10], [60, 8]] },
      { name: "Wiosłowanie hantlem", sets: [[32, 12], [32, 12]] },
      { name: "Podciąganie / lat pulldown", sets: [[0, 10], [0, 8]] },
      { name: "Wyciskanie hantli na barki", sets: [[14, 12], [14, 10]] },
    ]),
    mkSession(dol, iso(d2), [
      { name: "Przysiad", sets: [[80, 5], [80, 5], [70, 8]] },
      { name: "Martwy ciąg rumuński", sets: [[70, 10], [70, 10]] },
    ]),
    mkSession(gora, iso(d3), [
      { name: "Wyciskanie sztangi na ławce", sets: [[62.5, 10], [62.5, 10], [62.5, 9]] },
      { name: "Wiosłowanie hantlem", sets: [[34, 12], [34, 11]] },
      { name: "Podciąganie / lat pulldown", sets: [[5, 10], [5, 10]] },
      { name: "Wyciskanie hantli na barki", sets: [[14, 12], [14, 12]] },
    ]),
  ];
}
