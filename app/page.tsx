"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Layers,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlowCard } from "@/components/glow-card";
import { PageHeader } from "@/components/page-header";
import { StatMetric } from "@/components/stat-metric";
import { TrendBadge } from "@/components/trend-badge";
import { VolumeMiniChart } from "@/components/volume-mini-chart";
import { WeekStrip } from "@/components/week-strip";
import { useGymStore } from "@/lib/store";
import type { WorkoutSession } from "@/lib/types";
import {
  aggregateSets,
  sessionsInRange,
  startOfMonth,
  startOfWeek,
  weekComparison,
  weekVolumeByDay,
} from "@/lib/stats-aggregates";
import { sessionProgressVsPrevious } from "@/lib/comparison";
import { formatDate, formatKg, formatShortDate, localIsoDate } from "@/lib/utils";

function sessionsThisWeek(sessions: WorkoutSession[], now: Date) {
  const w0 = startOfWeek(now);
  const w6 = new Date(w0);
  w6.setDate(w6.getDate() + 6);
  return [...sessionsInRange(sessions, w0, w6)].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
  });
}

export default function DashboardPage() {
  const sessions = useGymStore((s) => s.sessions);
  const plans = useGymStore((s) => s.plans);
  const active = useGymStore((s) => s.activeDraft);

  const last = sessions[0];
  const now = useMemo(() => new Date(), []);
  const w0 = startOfWeek(now);
  const w6 = new Date(w0);
  w6.setDate(w6.getDate() + 6);
  const m0 = startOfMonth(now);

  const weekList = useMemo(() => sessionsThisWeek(sessions, now), [sessions]);
  const weekCmp = useMemo(() => weekComparison(sessions, now), [sessions]);
  const weekDays = useMemo(() => weekVolumeByDay(sessions, w0), [sessions, w0]);
  const weekSets = useMemo(() => aggregateSets(weekList), [weekList]);
  const monthCount = sessions.filter((s) => new Date(s.date) >= m0).length;

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="PRGRSS"
        subtitle="Dziennik treningowy siłowy"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" asChild>
              <Link href="/calendar" aria-label="Kalendarz">
                <CalendarDays className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="icon" asChild>
              <Link href="/settings" aria-label="Ustawienia">
                <Settings2 className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        }
      />

      <WeekStrip sessions={sessions} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <GlowCard innerClassName="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="stat-label">Objętość tygodnia</p>
              <p className="stat-value-lg">{formatKg(weekCmp.thisVol)} kg</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {weekCmp.prevVol > 0 && (
                  <TrendBadge
                    trend={weekCmp.pct > 0.5 ? "up" : weekCmp.pct < -0.5 ? "down" : "same"}
                    pct={weekCmp.pct}
                    compact
                  />
                )}
                <span className="text-xs text-muted">
                  {weekList.length} trening{weekList.length === 1 ? "" : weekList.length < 5 ? "i" : "ów"} · {weekSets} serii
                </span>
              </div>
            </div>
            <div className="flex h-16 w-[45%] min-w-[7rem] items-end">
              <VolumeMiniChart days={weekDays} highlightIso={localIsoDate(now)} className="w-full" />
            </div>
          </div>
          <Button className="mt-5 w-full" size="lg" asChild>
            <Link href={active ? "/workout/active" : "/workout/start"}>
              {active ? "Wróć do treningu" : "Rozpocznij trening"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </GlowCard>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatMetric
          icon={Dumbbell}
          label="Treningi"
          value={weekList.length}
          hint={`W miesiącu: ${monthCount}`}
          accent="accent"
        />
        <StatMetric
          icon={Layers}
          label="Serie"
          value={weekSets}
          hint="Ten tydzień"
          accent="warm"
        />
        <StatMetric
          icon={TrendingUp}
          label="Rekord sesji"
          value={
            sessions.length
              ? `${formatKg(Math.max(...sessions.map((s) => s.totalVolume)))} kg`
              : "—"
          }
          hint="Najwyższa objętość"
        />
        <StatMetric
          icon={CalendarDays}
          label="Wszystkie"
          value={sessions.length}
          hint={`${plans.length} planów`}
        />
      </div>

      <Card className="border-accent/10">
        <CardHeader>
          <CardTitle>Ostatni trening</CardTitle>
          <CardDescription>Skrót z dziennika</CardDescription>
        </CardHeader>
        <CardContent>
          {!last ? (
            <EmptyState
              icon={Dumbbell}
              title="Brak zapisanego treningu"
              description="Po pierwszej sesji zobaczysz tu plan, datę, objętość i porównanie z poprzednim razem."
              className="border-none bg-transparent py-6"
            >
              <Button asChild className="w-full">
                <Link href="/workout/start">Rozpocznij trening</Link>
              </Button>
            </EmptyState>
          ) : (
            <Link href={`/journal/detail?id=${encodeURIComponent(last.id)}`} className="block group">
              <div className="rounded-2xl border border-border bg-background/60 p-4 transition group-hover:border-accent/35 group-hover:bg-background/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{last.planName}</p>
                    <p className="text-sm text-muted">{formatDate(last.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="stat-value text-xl">{formatKg(last.totalVolume)} kg</p>
                    <ProgressHint session={last} sessions={sessions} />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Ten tydzień</CardTitle>
            <CardDescription>
              {formatShortDate(localIsoDate(w0))} – {formatShortDate(localIsoDate(w6))}
            </CardDescription>
          </div>
          <Link href="/stats" className="text-xs font-medium text-accent hover:underline">
            Statystyki →
          </Link>
        </CardHeader>
        <CardContent>
          {weekList.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Tydzień bez wpisów"
              description="Treningi z tego tygodnia pojawią się tutaj."
              className="border-none bg-transparent py-4"
            >
              <Button variant="secondary" asChild className="w-full">
                <Link href="/journal">Otwórz dziennik</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-2">
              {weekList.map((s) => {
                const { trend, deltaVolume } = sessionProgressVsPrevious(s, sessions);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/journal/detail?id=${encodeURIComponent(s.id)}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/40 px-3 py-2.5 text-sm transition hover:border-accent/30 hover:bg-background/60"
                    >
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{s.planName}</span>
                        <span className="text-xs text-muted">{formatShortDate(s.date)}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {trend !== "na" && (
                          <TrendBadge trend={trend} deltaVolume={deltaVolume} compact />
                        )}
                        <span className="font-display font-semibold tabular-nums">
                          {formatKg(s.totalVolume)} kg
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressHint({ session, sessions }: { session: WorkoutSession; sessions: WorkoutSession[] }) {
  const { trend, deltaVolume, pct } = sessionProgressVsPrevious(session, sessions);
  return (
    <div className="mt-1 flex justify-end">
      <TrendBadge trend={trend} deltaVolume={deltaVolume} pct={pct} compact />
    </div>
  );
}
