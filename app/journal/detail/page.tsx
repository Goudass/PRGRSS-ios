"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg } from "@/lib/utils";
import { sessionProgressVsPrevious } from "@/lib/comparison";
import { emptySet, recalcExerciseVolume, setVolume } from "@/lib/volume";
import type { WorkoutExercise, WorkoutSet } from "@/lib/types";

function Inner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const sessions = useGymStore((s) => s.sessions);
  const updateSession = useGymStore((s) => s.updateSession);
  const deleteSession = useGymStore((s) => s.deleteSession);
  const session = useMemo(() => sessions.find((x) => x.id === id), [sessions, id]);
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<WorkoutExercise[] | null>(null);

  if (!id || !session) {
    return (
      <div className="p-4 text-sm text-muted">
        Brak treningu.{" "}
        <Link className="text-accent underline-offset-4 hover:underline" href="/journal">
          Dziennik
        </Link>
      </div>
    );
  }

  const exercises = editing && local ? local : session.exercises;
  const { trend, deltaVolume } = sessionProgressVsPrevious(session, sessions);

  const startEdit = () => {
    setLocal(JSON.parse(JSON.stringify(session.exercises)) as WorkoutExercise[]);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!local) return;
    updateSession(session.id, { exercises: local });
    setEditing(false);
    setLocal(null);
  };

  const updateLocalSet = (exId: string, setId: string, patch: Partial<WorkoutSet>) => {
    if (!local) return;
    const next = local.map((ex) => {
      if (ex.id !== exId) return ex;
      const sets = ex.sets.map((st) => {
        if (st.id !== setId) return st;
        const weight = patch.weight !== undefined ? Math.max(0, patch.weight) : st.weight;
        const reps = patch.reps !== undefined ? Math.max(0, Math.floor(patch.reps)) : st.reps;
        return {
          ...st,
          ...patch,
          weight,
          reps,
          volume: setVolume(weight, reps),
        };
      });
      return recalcExerciseVolume({ ...ex, sets });
    });
    setLocal(next);
  };

  return (
    <div className="space-y-4 p-4 pb-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link href="/journal">Wstecz</Link>
        </Button>
        {!editing ? (
          <>
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edytuj
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/compare?planId=${encodeURIComponent(session.planId ?? "")}&a=${encodeURIComponent(session.id)}`}>
                Porównaj
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!window.confirm("Usunąć trening?")) return;
                deleteSession(session.id);
                router.replace("/journal");
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={saveEdit}>Zapisz zmiany</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setLocal(null);
              }}
            >
              Anuluj
            </Button>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{session.planName}</CardTitle>
          <p className="text-sm text-muted">{formatDate(session.date)}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Objętość: <span className="font-semibold">{formatKg(session.totalVolume)} kg</span>
          </p>
          {session.planId && trend !== "na" && (
            <p className="text-xs text-muted">
              vs poprzedni ten sam plan:{" "}
              <span className={trend === "up" ? "text-emerald-400" : trend === "down" ? "text-amber-300" : ""}>
                {trend === "up" && `+${formatKg(deltaVolume)} kg`}
                {trend === "down" && `-${formatKg(Math.abs(deltaVolume))} kg`}
                {trend === "same" && "bez zmian"}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {exercises.map((ex) => (
          <Card key={ex.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <Link
                  href={`/exercises/detail?exerciseId=${encodeURIComponent(ex.exerciseId ?? "")}&name=${encodeURIComponent(ex.name)}`}
                  className="text-xs text-accent underline-offset-4 hover:underline"
                >
                  Progres
                </Link>
              </div>
              <p className="text-xs text-muted">Objętość ćwiczenia: {formatKg(ex.totalVolume)} kg</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {ex.sets.map((st, i) => (
                <div key={st.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background/50 px-3 py-2 text-sm">
                  {editing ? (
                    <div className="flex flex-1 flex-wrap gap-2">
                      <div>
                        <Label className="text-[10px]">kg</Label>
                        <Input
                          className="h-9 w-24"
                          value={st.weight === 0 ? "" : String(st.weight)}
                          onChange={(e) => {
                            const v = e.target.value === "" ? 0 : Number(e.target.value);
                            updateLocalSet(ex.id, st.id, { weight: Number.isFinite(v) ? v : 0 });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">powt.</Label>
                        <Input
                          className="h-9 w-20"
                          value={st.reps === 0 ? "" : String(st.reps)}
                          onChange={(e) => {
                            const v = e.target.value === "" ? 0 : Number(e.target.value);
                            updateLocalSet(ex.id, st.id, { reps: Number.isFinite(v) ? v : 0 });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span>
                      Seria {i + 1}: {formatKg(st.weight)} kg × {st.reps}
                    </span>
                  )}
                  <span className="text-xs text-muted">{formatKg(st.volume)} kg</span>
                </div>
              ))}
              {editing && local && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const last = ex.sets[ex.sets.length - 1];
                      const newSet = emptySet(last);
                      const next = local.map((e) =>
                        e.id === ex.id
                          ? recalcExerciseVolume({ ...e, sets: [...e.sets, newSet] })
                          : e
                      );
                      setLocal(next);
                    }}
                  >
                    Dodaj serię
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function JournalDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 p-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
