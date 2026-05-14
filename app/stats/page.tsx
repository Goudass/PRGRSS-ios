"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useGymStore } from "@/lib/store";
import { formatKg } from "@/lib/utils";
import { collectExerciseHistory, aggregateExerciseStats } from "@/lib/exercise-history";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function exerciseOptionValue(e: { id?: string; name: string }) {
  return e.id ? `id:${e.id}` : `name:${e.name}`;
}

export default function StatsPage() {
  const sessions = useGymStore((s) => s.sessions);
  const plans = useGymStore((s) => s.plans);
  const now = new Date();
  const w0 = startOfWeek(now);
  const m0 = startOfMonth(now);

  const weekVol = useMemo(
    () => sessions.filter((s) => new Date(s.date) >= w0).reduce((a, s) => a + s.totalVolume, 0),
    [sessions, w0]
  );
  const monthVol = useMemo(
    () => sessions.filter((s) => new Date(s.date) >= m0).reduce((a, s) => a + s.totalVolume, 0),
    [sessions, m0]
  );
  const monthCount = useMemo(
    () => sessions.filter((s) => new Date(s.date) >= m0).length,
    [sessions, m0]
  );
  const bestSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions.reduce((a, b) => (a.totalVolume >= b.totalVolume ? a : b));
  }, [sessions]);

  const exerciseOptions = useMemo(() => {
    const map = new Map<string, { id?: string; name: string }>();
    for (const p of plans) {
      for (const e of p.exercises) {
        map.set(e.id, { id: e.id, name: e.name });
      }
    }
    for (const s of sessions) {
      for (const e of s.exercises) {
        const key = e.exerciseId ?? `name:${e.name}`;
        if (!map.has(key)) map.set(key, { id: e.exerciseId, name: e.name });
      }
    }
    return [...map.values()];
  }, [plans, sessions]);

  const [pick, setPick] = useState("");

  useEffect(() => {
    if (exerciseOptions.length > 0 && !pick) {
      setPick(exerciseOptionValue(exerciseOptions[0]));
    }
  }, [exerciseOptions, pick]);

  const picked = useMemo(() => {
    if (exerciseOptions.length === 0) return null;
    if (!pick) return exerciseOptions[0];
    if (pick.startsWith("id:")) {
      const id = pick.slice(3);
      return exerciseOptions.find((e) => e.id === id) ?? exerciseOptions[0];
    }
    if (pick.startsWith("name:")) {
      const name = pick.slice(5);
      return exerciseOptions.find((e) => e.name === name) ?? exerciseOptions[0];
    }
    return exerciseOptions[0];
  }, [exerciseOptions, pick]);

  const history = useMemo(() => {
    if (!picked) return [];
    return collectExerciseHistory(sessions, picked.id ? { exerciseId: picked.id } : { name: picked.name });
  }, [sessions, picked]);

  const stats = aggregateExerciseStats(history);
  const chartData = history.map((h) => ({
    label: h.date.slice(5),
    weight: h.maxWeight,
    volume: h.volume,
  }));

  return (
    <div className="space-y-6 p-4 pb-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Statystyki</h1>
        <p className="text-sm text-muted">Tygodniowe i miesięczne podsumowanie</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Tydzień (kg)</p>
            <p className="text-xl font-semibold tabular-nums">{formatKg(weekVol)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Miesiąc (kg)</p>
            <p className="text-xl font-semibold tabular-nums">{formatKg(monthVol)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Treningi w miesiącu</p>
            <p className="text-xl font-semibold tabular-nums">{monthCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Najlepsza sesja</p>
            <p className="text-xl font-semibold tabular-nums">
              {bestSession ? formatKg(bestSession.totalVolume) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progres ćwiczenia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exerciseOptions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Jeszcze brak ćwiczeń w danych"
              description="Dodaj plan z ćwiczeniami albo zapisz trening — wtedy zobaczysz tutaj wykres i rekordy wybranego ruchu."
            >
              <Button asChild className="w-full">
                <Link href="/plans/new">Nowy plan</Link>
              </Button>
              <Button variant="secondary" asChild className="w-full">
                <Link href="/workout/start">Rozpocznij trening</Link>
              </Button>
            </EmptyState>
          ) : (
            <>
              <div>
                <label className="text-xs text-muted">Wybierz ćwiczenie</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                >
                  {exerciseOptions.map((e) => (
                    <option key={exerciseOptionValue(e)} value={exerciseOptionValue(e)}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              {picked && (
                <Link
                  href={`/exercises/detail?exerciseId=${encodeURIComponent(picked.id ?? "")}&name=${encodeURIComponent(picked.name)}`}
                  className="inline-flex text-xs text-accent underline-offset-4 hover:underline"
                >
                  Otwórz szczegóły ćwiczenia
                </Link>
              )}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl border border-border bg-background/50 p-2">
                  <p className="text-muted">Max kg</p>
                  <p className="text-base font-semibold">{formatKg(stats.bestWeight)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-2">
                  <p className="text-muted">Max powt.</p>
                  <p className="text-base font-semibold">{stats.bestReps}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-2">
                  <p className="text-muted">Max obj.</p>
                  <p className="text-base font-semibold">{formatKg(stats.bestVolume)}</p>
                </div>
              </div>
              {chartData.length > 0 ? (
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke="#757B81" fontSize={11} />
                      <YAxis stroke="#757B81" fontSize={11} width={36} />
                      <Tooltip
                        contentStyle={{
                          background: "#262B32",
                          border: "1px solid rgba(117,123,129,0.35)",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#FFEE32" strokeWidth={2} dot={false} name="Ciężar" />
                      <Line type="monotone" dataKey="volume" stroke="#D6D6D6" strokeWidth={2} dot={false} name="Objętość" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Za mało punktów na wykres"
                  description="Zapisz co najmniej dwa treningi z tym ćwiczeniem (w różnych dniach), żeby zobaczyć trend."
                  className="border-dashed py-8"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
