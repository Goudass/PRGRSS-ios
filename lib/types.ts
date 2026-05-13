export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  volume: number;
  note?: string;
}

export interface PlanExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: PlanExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId?: string;
  name: string;
  sets: WorkoutSet[];
  totalVolume: number;
}

export interface WorkoutSession {
  id: string;
  planId?: string;
  planName: string;
  date: string;
  exercises: WorkoutExercise[];
  totalVolume: number;
  notes?: string;
  createdAt: string;
}

export interface ActiveWorkoutDraft {
  id: string;
  planId?: string;
  planName: string;
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
  startedAt: string;
}

export interface AppState {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  activeDraft: ActiveWorkoutDraft | null;
  unit: "kg";
}
