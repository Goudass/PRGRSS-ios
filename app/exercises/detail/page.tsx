"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg } from "@/lib/utils";
import { collectExerciseHistory, aggregateExerciseStats } from "@/lib/exercise-history";

function Inner() {
  const sessions = useGymStore((s) => s.sessions);
  const params = useSearchParams();
  const exerciseId = params.get("exerciseId") || undefined;
  const name = params.get("name") || undefined;

  const history = useMemo(
    () => collectExerciseHistory(sessions, { exerciseId, name: exerciseId ? undefined : name }),
    [sessions, exerciseId, name]
  );
  const stats = aggregateExerciseStats(history);

  const chartW = history.map((h) => ({
    label: h.date.slice(5),
    weight: h.maxWeight,
  }));
  const chartV = history.map((h) => ({
    label: h.date.slice(5),
    volume: h.volume,
  }));

  return (
    <div className="space-y-4 p-4 pb-4">
      <div className="flex gap-2">
        <Link href="/stats" className="text-sm text-accent underline-offset-4 hover:underline">
          ← Statystyki
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Szczegóły ćwiczenia</h1>
        <p className="text-sm text-muted">{name || "Ćwiczenie"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <Card>
          <CardContent className="py-4">
            <p className="text-muted">Największy ciężar</p>
            <p className="text-lg font-semibold">{formatKg(stats.bestWeight)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-muted">Najwięcej powtórzeń</p>
            <p className="text-lg font-semibold">{stats.bestReps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-muted">Największa objętość</p>
            <p className="text-lg font-semibold">{formatKg(stats.bestVolume)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ciężar w czasie</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          {chartW.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartW}>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#757B81" fontSize={11} />
                <YAxis stroke="#757B81" fontSize={11} width={32} />
                <Tooltip
                  contentStyle={{
                    background: "#262B32",
                    border: "1px solid rgba(117,123,129,0.35)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="#FFEE32" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">Brak danych.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Objętość w czasie</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          {chartV.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartV}>
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
                <Line type="monotone" dataKey="volume" stroke="#D6D6D6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">Brak danych.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historia serii</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {stats.seriesLog.length === 0 ? (
            <p className="text-muted">Brak wpisów.</p>
          ) : (
            stats.seriesLog.map((row, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted">
                  {formatDate(row.date)} · {row.label}
                </p>
                <p className="font-medium">{row.sets}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExerciseDetailPage() {
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
