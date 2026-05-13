"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg } from "@/lib/utils";
import { normalizeName } from "@/lib/volume";
import type { WorkoutExercise, WorkoutSession } from "@/lib/types";

function matchExercise(a: WorkoutExercise, list: WorkoutExercise[]) {
  return list.find((b) => {
    if (a.exerciseId && b.exerciseId) return a.exerciseId === b.exerciseId;
    return normalizeName(a.name) === normalizeName(b.name);
  });
}

function Inner() {
  const sessions = useGymStore((s) => s.sessions);
  const params = useSearchParams();
  const rawPlan = params.get("planId");
  const planId = rawPlan && rawPlan.length > 0 ? rawPlan : undefined;
  const defaultA = params.get("a") || "";

  const pool: WorkoutSession[] = useMemo(
    () => (planId ? sessions.filter((s) => s.planId === planId) : sessions),
    [sessions, planId]
  );

  const [aId, setAId] = useState(defaultA);
  const [bId, setBId] = useState("");

  useEffect(() => {
    if (defaultA) setAId(defaultA);
  }, [defaultA]);

  useEffect(() => {
    if (!pool.length) return;
    if (!pool.some((s) => s.id === aId)) {
      setAId(pool[0].id);
      return;
    }
    if (!pool.some((s) => s.id === bId) || aId === bId) {
      const second = pool.find((s) => s.id !== aId);
      if (second && second.id !== bId) setBId(second.id);
    }
  }, [pool, aId, bId]);

  const A = pool.find((s) => s.id === aId);
  const B = pool.find((s) => s.id === bId);

  const rows = useMemo(() => {
    if (!A || !B || A.id === B.id) return [];
    const out: { name: string; exA?: WorkoutExercise; exB?: WorkoutExercise }[] = [];
    for (const ex of A.exercises) {
      out.push({ name: ex.name, exA: ex, exB: matchExercise(ex, B.exercises) });
    }
    for (const ex of B.exercises) {
      if (!matchExercise(ex, A.exercises)) {
        out.push({ name: ex.name, exA: undefined, exB: ex });
      }
    }
    return out;
  }, [A, B]);

  if (!pool.length) {
    return (
      <div className="p-4 text-sm text-muted">
        Brak treningów do porównania.{" "}
        <Link href="/journal" className="text-accent underline-offset-4 hover:underline">
          Dziennik
        </Link>
      </div>
    );
  }

  if (!A || !B) {
    return (
      <div className="p-4 text-sm text-muted">
        Wybierz treningi na liście.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-4">
      <Link href="/journal" className="text-sm text-accent underline-offset-4 hover:underline">
        ← Dziennik
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Porównanie treningów</h1>
        <p className="text-sm text-muted">Dwa zapisy obok siebie</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted">Trening A</label>
          <select
            className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
            value={aId}
            onChange={(e) => setAId(e.target.value)}
          >
            {pool.map((s) => (
              <option key={s.id} value={s.id}>
                {s.planName} · {formatDate(s.date)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Trening B</label>
          <select
            className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
            value={bId}
            onChange={(e) => setBId(e.target.value)}
          >
            {pool.map((s) => (
              <option key={s.id} value={s.id}>
                {s.planName} · {formatDate(s.date)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {A.id === B.id ? (
        <p className="text-sm text-muted">Potrzebujesz co najmniej dwóch treningów, aby porównać.</p>
      ) : (
        <div className="space-y-3">
          <Card>
            <CardContent className="flex flex-wrap justify-between gap-2 py-4 text-sm">
              <div>
                <p className="text-xs text-muted">Objętość A</p>
                <p className="text-lg font-semibold">{formatKg(A.totalVolume)} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted">Objętość B</p>
                <p className="text-lg font-semibold">{formatKg(B.totalVolume)} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted">Różnica (B − A)</p>
                <p className="text-lg font-semibold">
                  {formatKg(B.totalVolume - A.totalVolume)} kg (
                  {A.totalVolume > 0
                    ? `${(((B.totalVolume - A.totalVolume) / A.totalVolume) * 100).toFixed(1)}%`
                    : "—"}
                  )
                </p>
              </div>
            </CardContent>
          </Card>
          {rows.map((row) => (
            <Card key={`${row.name}-${row.exA?.id ?? "x"}-${row.exB?.id ?? "y"}`}>
              <CardHeader>
                <CardTitle className="text-base">{row.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted">Serie A</p>
                  {row.exA ? (
                    <>
                      <p className="mt-1 font-medium">
                        {row.exA.sets.map((s) => `${formatKg(s.weight)}×${s.reps}`).join(" · ")}
                      </p>
                      <p className="mt-2 text-xs text-muted">Objętość: {formatKg(row.exA.totalVolume)} kg</p>
                    </>
                  ) : (
                    <p className="mt-1 text-muted">Brak w treningu A</p>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted">Serie B</p>
                  {row.exB ? (
                    <>
                      <p className="mt-1 font-medium">
                        {row.exB.sets.map((s) => `${formatKg(s.weight)}×${s.reps}`).join(" · ")}
                      </p>
                      <p className="mt-2 text-xs text-muted">Objętość: {formatKg(row.exB.totalVolume)} kg</p>
                      {row.exA && (
                        <p className="mt-2 text-xs text-accent">
                          Δ ciężar (max):{" "}
                          {formatKg(
                            Math.max(...row.exB.sets.map((s) => s.weight), 0) -
                              Math.max(...row.exA.sets.map((s) => s.weight), 0)
                          )}{" "}
                          kg · Δ powt. (suma):{" "}
                          {row.exB.sets.reduce((a, s) => a + s.reps, 0) -
                            row.exA.sets.reduce((a, s) => a + s.reps, 0)}{" "}
                          · Δ obj.: {formatKg(row.exB.totalVolume - row.exA.totalVolume)} kg
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-muted">Brak w treningu B</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
