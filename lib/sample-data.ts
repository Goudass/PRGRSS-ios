import type { WorkoutPlan, WorkoutSession, WorkoutExercise } from "./types";
import { localIsoDate, uid } from "./utils";
import { recalcExerciseVolume, recalcSessionVolume, setVolume } from "./volume";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localIsoDate(d);
}

export function seedPlans(): WorkoutPlan[] {
  const ex = (name: string, group?: string) => ({
    id: uid(),
    name,
    muscleGroup: group,
  });

  const gora: WorkoutPlan = {
    id: uid(),
    name: "Góra",
    description: "Klatka, plecy, ramiona",
    exercises: [
      ex("Wyciskanie sztangi na ławce", "klata"),
      ex("Wiosłowanie hantlem", "plecy"),
      ex("Podciąganie / lat pulldown", "plecy"),
      ex("Wyciskanie hantli na barki", "barki"),
      ex("Face pull", "barki"),
    ],
  };

  const dol: WorkoutPlan = {
    id: uid(),
    name: "Dół",
    description: "Nogi i core",
    exercises: [
      ex("Przysiad ze sztangą", "nogi"),
      ex("Martwy ciąg rumuński", "nogi"),
      ex("Wypychanie nóg", "nogi"),
      ex("Wykroki z hantlami", "nogi"),
      ex("Plank", "core"),
    ],
  };

  const push: WorkoutPlan = {
    id: uid(),
    name: "Push",
    description: "Klatka, triceps, barki",
    exercises: [
      ex("Wyciskanie hantli skos", "klata"),
      ex("Rozpiętki na wyciągu", "klata"),
      ex("Wyciskanie wąskim chwytem", "triceps"),
      ex("Prostowanie na wyciągu", "triceps"),
      ex("Unoszenie boczne", "barki"),
    ],
  };

  return [gora, dol, push];
}

function mkSession(
  plan: WorkoutPlan,
  date: string,
  setsSpec: { name: string; sets: [number, number][] }[],
  createdAt: string
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
  return {
    id: uid(),
    planId: plan.id,
    planName: plan.name,
    date,
    exercises,
    totalVolume: recalcSessionVolume(exercises),
    createdAt,
  };
}

type SessionSpec = {
  planName: string;
  daysAgo: number;
  hour: number;
  exercises: { name: string; sets: [number, number][] }[];
};

export function seedSessions(plans: WorkoutPlan[]): WorkoutSession[] {
  const byName = (name: string) => plans.find((p) => p.name === name);
  const gora = byName("Góra");
  const dol = byName("Dół");
  const push = byName("Push");
  if (!gora || !dol || !push) return [];

  const specs: SessionSpec[] = [
    // ~10 tygodni wstecz — progresja siłowa
    {
      planName: "Góra",
      daysAgo: 68,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[55, 10], [55, 10], [55, 8]] },
        { name: "Wiosłowanie hantlem", sets: [[28, 12], [28, 12], [28, 10]] },
        { name: "Podciąganie / lat pulldown", sets: [[35, 10], [35, 9]] },
        { name: "Wyciskanie hantli na barki", sets: [[12, 12], [12, 10]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 65,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[70, 8], [70, 8], [65, 10]] },
        { name: "Martwy ciąg rumuński", sets: [[60, 10], [60, 10]] },
        { name: "Wypychanie nóg", sets: [[80, 12], [80, 12], [80, 10]] },
      ],
    },
    {
      planName: "Push",
      daysAgo: 62,
      hour: 19,
      exercises: [
        { name: "Wyciskanie hantli skos", sets: [[22, 10], [22, 10], [22, 9]] },
        { name: "Rozpiętki na wyciągu", sets: [[12, 15], [12, 14]] },
        { name: "Wyciskanie wąskim chwytem", sets: [[40, 8], [40, 8]] },
        { name: "Unoszenie boczne", sets: [[8, 15], [8, 14]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 58,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[57.5, 10], [57.5, 9], [57.5, 8]] },
        { name: "Wiosłowanie hantlem", sets: [[30, 12], [30, 11]] },
        { name: "Podciąganie / lat pulldown", sets: [[37.5, 10], [37.5, 9]] },
        { name: "Wyciskanie hantli na barki", sets: [[12, 12], [12, 12]] },
        { name: "Face pull", sets: [[15, 15], [15, 15]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 55,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[72.5, 8], [72.5, 7], [70, 8]] },
        { name: "Martwy ciąg rumuński", sets: [[65, 10], [65, 9]] },
        { name: "Wypychanie nóg", sets: [[85, 12], [85, 11]] },
        { name: "Wykroki z hantlami", sets: [[16, 12], [16, 12]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 51,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[60, 10], [60, 10], [60, 8]] },
        { name: "Wiosłowanie hantlem", sets: [[32, 12], [32, 11]] },
        { name: "Podciąganie / lat pulldown", sets: [[40, 10], [40, 9]] },
        { name: "Wyciskanie hantli na barki", sets: [[14, 12], [14, 10]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 48,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[75, 8], [75, 7], [70, 8]] },
        { name: "Martwy ciąg rumuński", sets: [[70, 10], [70, 10]] },
        { name: "Wypychanie nóg", sets: [[90, 12], [90, 10]] },
        { name: "Plank", sets: [[0, 60], [0, 45]] },
      ],
    },
    {
      planName: "Push",
      daysAgo: 44,
      hour: 19,
      exercises: [
        { name: "Wyciskanie hantli skos", sets: [[24, 10], [24, 9], [24, 8]] },
        { name: "Rozpiętki na wyciągu", sets: [[14, 14], [14, 13]] },
        { name: "Prostowanie na wyciągu", sets: [[25, 12], [25, 11]] },
        { name: "Unoszenie boczne", sets: [[9, 14], [9, 13]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 41,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[62.5, 10], [62.5, 9], [62.5, 8]] },
        { name: "Wiosłowanie hantlem", sets: [[34, 12], [34, 11]] },
        { name: "Podciąganie / lat pulldown", sets: [[42.5, 10], [42.5, 9]] },
        { name: "Face pull", sets: [[17.5, 15], [17.5, 14]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 38,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[80, 6], [80, 6], [75, 8]] },
        { name: "Martwy ciąg rumuński", sets: [[72.5, 10], [72.5, 9]] },
        { name: "Wypychanie nóg", sets: [[95, 12], [95, 10]] },
        { name: "Wykroki z hantlami", sets: [[18, 12], [18, 11]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 34,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[65, 8], [65, 8], [62.5, 9]] },
        { name: "Wiosłowanie hantlem", sets: [[36, 11], [36, 10]] },
        { name: "Podciąganie / lat pulldown", sets: [[45, 9], [45, 8]] },
        { name: "Wyciskanie hantli na barki", sets: [[16, 10], [16, 9]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 31,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[82.5, 5], [82.5, 5], [80, 6]] },
        { name: "Martwy ciąg rumuński", sets: [[75, 10], [75, 9]] },
        { name: "Wypychanie nóg", sets: [[100, 12], [100, 10]] },
      ],
    },
    {
      planName: "Push",
      daysAgo: 27,
      hour: 19,
      exercises: [
        { name: "Wyciskanie hantli skos", sets: [[26, 9], [26, 9], [26, 8]] },
        { name: "Rozpiętki na wyciągu", sets: [[16, 13], [16, 12]] },
        { name: "Wyciskanie wąskim chwytem", sets: [[50, 8], [50, 7]] },
        { name: "Prostowanie na wyciągu", sets: [[27.5, 12], [27.5, 11]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 24,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[67.5, 8], [67.5, 7], [65, 8]] },
        { name: "Wiosłowanie hantlem", sets: [[38, 10], [38, 10]] },
        { name: "Podciąganie / lat pulldown", sets: [[47.5, 9], [47.5, 8]] },
        { name: "Face pull", sets: [[20, 14], [20, 13]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 20,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[85, 5], [85, 5], [80, 6]] },
        { name: "Martwy ciąg rumuński", sets: [[77.5, 9], [77.5, 9]] },
        { name: "Wypychanie nóg", sets: [[105, 11], [105, 10]] },
        { name: "Plank", sets: [[0, 75], [0, 60]] },
      ],
    },
    // ostatnie 2 tygodnie — pełny kalendarz i statystyki
    {
      planName: "Góra",
      daysAgo: 14,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[70, 6], [70, 6], [67.5, 7]] },
        { name: "Wiosłowanie hantlem", sets: [[40, 10], [40, 9]] },
        { name: "Podciąganie / lat pulldown", sets: [[50, 8], [50, 8]] },
        { name: "Wyciskanie hantli na barki", sets: [[18, 10], [18, 9]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 11,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[87.5, 5], [87.5, 5], [85, 6]] },
        { name: "Martwy ciąg rumuński", sets: [[80, 9], [80, 8]] },
        { name: "Wypychanie nóg", sets: [[110, 10], [110, 10]] },
        { name: "Wykroki z hantlami", sets: [[20, 10], [20, 10]] },
      ],
    },
    {
      planName: "Push",
      daysAgo: 8,
      hour: 19,
      exercises: [
        { name: "Wyciskanie hantli skos", sets: [[28, 8], [28, 8], [26, 9]] },
        { name: "Rozpiętki na wyciągu", sets: [[18, 12], [18, 11]] },
        { name: "Wyciskanie wąskim chwytem", sets: [[55, 7], [55, 6]] },
        { name: "Unoszenie boczne", sets: [[10, 12], [10, 12]] },
      ],
    },
    {
      planName: "Góra",
      daysAgo: 5,
      hour: 18,
      exercises: [
        { name: "Wyciskanie sztangi na ławce", sets: [[72.5, 5], [72.5, 5], [70, 6]] },
        { name: "Wiosłowanie hantlem", sets: [[42, 10], [42, 9]] },
        { name: "Podciąganie / lat pulldown", sets: [[52.5, 8], [52.5, 7]] },
        { name: "Face pull", sets: [[22.5, 14], [22.5, 13]] },
      ],
    },
    {
      planName: "Dół",
      daysAgo: 2,
      hour: 17,
      exercises: [
        { name: "Przysiad ze sztangą", sets: [[90, 5], [90, 5], [87.5, 5]] },
        { name: "Martwy ciąg rumuński", sets: [[82.5, 8], [82.5, 8]] },
        { name: "Wypychanie nóg", sets: [[115, 10], [115, 9]] },
        { name: "Plank", sets: [[0, 90], [0, 75]] },
      ],
    },
  ];

  const built = specs
    .map((spec) => {
      const plan = byName(spec.planName);
      if (!plan) return null;
      const date = daysAgo(spec.daysAgo);
      const createdAt = new Date(
        `${date}T${String(spec.hour).padStart(2, "0")}:30:00`
      ).toISOString();
      return mkSession(plan, date, spec.exercises, createdAt);
    })
    .filter((s): s is WorkoutSession => s !== null);

  return built.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function demoDataSnapshot(): { plans: WorkoutPlan[]; sessions: WorkoutSession[] } {
  const plans = seedPlans();
  return { plans, sessions: seedSessions(plans) };
}
