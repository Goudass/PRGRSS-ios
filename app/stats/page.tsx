"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Clock,
  Dumbbell,
  Layers,
  Trophy,
} from "lucide-react";
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
import { GlowCard } from "@/components/glow-card";
import { PageHeader } from "@/components/page-header";
import { StatMetric } from "@/components/stat-metric";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg, formatShortDate, localIsoDate } from "@/lib/utils";
import {
  aggregateSets,
  sessionSetCount,
  startOfMonth,
  startOfWeek,
  topExercisesByVolume,
  weekComparison,
} from "@/lib/stats-aggregates";
import { collectExerciseHistory, aggregateExerciseStats } from "@/lib/exercise-history";

type Period = "week" | "month" | "all";

function exerciseOptionValue(e: { id?: string; name: string }) {
  return e.id ? `id:${e.id}` : `name:${e.name}`;
}

export default function StatsPage() {
  const sessions = useGymStore((s) => s.sessions);
  const plans = useGymStore((s) => s.plans);
  const [period, setPeriod] = useState<Period>("week");
  const now = useMemo(() => new Date(), []);
  const w0 = startOfWeek(now);
  const m0 = startOfMonth(now);
  const weekCmp = useMemo(() => weekComparison(sessions, now), [sessions]);

  const periodSessions = useMemo(() => {
    if (period === "all") return sessions;
    if (period === "month") return sessions.filter((s) => new Date(s.date) >= m0);
    return weekCmp.thisWeek;
  }, [sessions, period, m0, weekCmp.thisWeek]);

  const periodVol = periodSessions.reduce((a, s) => a + s.totalVolume, 0);
  const periodSets = aggregateSets(periodSessions);
  const bestSession = useMemo(() => {
    if (!periodSessions.length) return null;
    return periodSessions.reduce((a, b) => (a.totalVolume >= b.totalVolume ? a : b));
  }, [periodSessions]);

  const lastSession = sessions[0] ?? null;
  const allTimeVol = sessions.reduce((a, s) => a + s.totalVolume, 0);
  const allTimeSets = aggregateSets(sessions);
  const topExercises = useMemo(() => topExercisesByVolume(sessions, 5), [sessions]);

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

  const periodLabel =
    period === "week"
      ? `${formatShortDate(localIsoDate(w0))} – ${formatShortDate(localIsoDate(new Date(w0.getTime() + 6 * 86400000)))}`
      : period === "month"
        ? new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(now)
        : "Cała historia";

  return (
    <div className="space-y-6 p-4 pb-4">
      <PageHeader title="Statystyki" subtitle="Objętość, serie i progres siłowy" />

      <div className="flex gap-2">
        {(
          [
            ["week", "Tydzień"],
            ["month", "Miesiąc"],
            ["all", "Wszystko"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
              period === key
                ? "border-accent/50 bg-accent text-black shadow-glow-sm"
                : "border-border bg-card/50 text-muted hover:border-accent/25"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {lastSession && (
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="section-title flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent" />
                Ostatni trening
              </CardTitle>
              <Link
                href={`/journal/detail?id=${encodeURIComponent(lastSession.id)}`}
                className="text-xs text-accent hover:underline"
              >
                Szczegóły →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{lastSession.planName}</p>
              <p className="text-xs text-muted">{formatDate(lastSession.date)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatMetric
                icon={Clock}
                label="Objętość"
                value={`${formatKg(lastSession.totalVolume)} kg`}
                accent="accent"
              />
              <StatMetric
                icon={Layers}
                label="Serie"
                value={sessionSetCount(lastSession)}
                hint={`${lastSession.exercises.length} ćwiczeń`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <GlowCard innerClassName="p-5" glow="warm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="section-title">
            {period === "week" ? "Ten tydzień" : period === "month" ? "Ten miesiąc" : "Podsumowanie"}
          </p>
          <span className="text-[10px] text-muted">{periodLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatMetric
            icon={Dumbbell}
            label="Treningi"
            value={periodSessions.length}
            accent="accent"
          />
          <StatMetric icon={Layers} label="Serie" value={periodSets} accent="warm" />
          <StatMetric
            icon={BarChart3}
            label="Objętość"
            value={`${formatKg(periodVol)} kg`}
          />
          <StatMetric
            icon={Trophy}
            label="Najlepsza"
            value={bestSession ? `${formatKg(bestSession.totalVolume)} kg` : "—"}
            hint={bestSession ? formatShortDate(bestSession.date) : undefined}
          />
        </div>
      </GlowCard>

      {period === "week" && weekCmp.prevVol > 0 && (
        <p className="text-center text-xs text-muted">
          vs poprzedni tydzień:{" "}
          <span
            className={
              weekCmp.pct > 0 ? "font-semibold text-emerald-400" : weekCmp.pct < 0 ? "font-semibold text-amber-300" : ""
            }
          >
            {weekCmp.pct >= 0 ? "+" : ""}
            {weekCmp.pct.toFixed(0)}% objętości
          </span>
          {" · "}
          {weekCmp.thisCount} vs {weekCmp.prevCount} treningów
        </p>
      )}

      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="section-title">Cała historia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <StatMetric label="Treningi" value={sessions.length} />
              <StatMetric label="Serie" value={allTimeSets} />
              <StatMetric
                label="Objętość"
                value={`${formatKg(allTimeVol)} kg`}
                className="col-span-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {topExercises.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="section-title">Top ćwiczenia (objętość)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topExercises.map((ex, i) => (
              <Link
                key={ex.key}
                href={`/exercises/detail?exerciseId=${encodeURIComponent(ex.exerciseId ?? "")}&name=${encodeURIComponent(ex.name)}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-2.5 text-sm transition hover:border-accent/30"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-[11px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="font-medium">{ex.name}</span>
                </span>
                <span className="font-display font-semibold tabular-nums text-muted-bright">
                  {formatKg(ex.volume)} kg
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="section-title flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Progres ćwiczenia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exerciseOptions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Brak ćwiczeń w danych"
              description="Zapisz trening z planem — wtedy pojawi się wykres i rekordy."
            >
              <Button asChild className="w-full">
                <Link href="/workout/start">Rozpocznij trening</Link>
              </Button>
            </EmptyState>
          ) : (
            <>
              <div>
                <label className="stat-label">Wybierz ćwiczenie</label>
                <select
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background/80 px-3 py-2.5 text-sm font-medium focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
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
                  className="inline-flex text-xs font-medium text-accent underline-offset-4 hover:underline"
                >
                  Szczegóły ćwiczenia →
                </Link>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-3">
                  <p className="stat-label">Max kg</p>
                  <p className="stat-value text-lg">{formatKg(stats.bestWeight)}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="stat-label">Max powt.</p>
                  <p className="stat-value text-lg">{stats.bestReps}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="stat-label">Max obj.</p>
                  <p className="stat-value text-lg">{formatKg(stats.bestVolume)}</p>
                </div>
              </div>
              {chartData.length > 0 ? (
                <div className="h-52 w-full rounded-2xl border border-border/60 bg-background/30 p-2 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(117,123,129,0.15)" strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke="#757B81" fontSize={10} tickLine={false} />
                      <YAxis stroke="#757B81" fontSize={10} width={36} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#262B32",
                          border: "1px solid rgba(117,123,129,0.35)",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#FFEE32"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#FFEE32" }}
                        activeDot={{ r: 5 }}
                        name="Ciężar"
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#757B81"
                        strokeWidth={2}
                        dot={false}
                        name="Objętość"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Za mało danych na wykres"
                  description="Zapisz co najmniej dwa treningi z tym ćwiczeniem."
                  className="border-dashed py-6"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {sessions.length >= 2 && (
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/compare">Porównaj dwa treningi</Link>
        </Button>
      )}
    </div>
  );
}
