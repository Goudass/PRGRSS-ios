"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Dumbbell, Settings2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGymStore } from "@/lib/store";
import type { WorkoutSession } from "@/lib/types";
import { formatDate, formatKg, formatShortDate, localIsoDate } from "@/lib/utils";
import { sessionProgressVsPrevious } from "@/lib/comparison";

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

function sessionsThisWeek(sessions: WorkoutSession[], now: Date) {
  const w0 = startOfWeek(now);
  const w6 = new Date(w0);
  w6.setDate(w6.getDate() + 6);
  const a = localIsoDate(w0);
  const b = localIsoDate(w6);
  return [...sessions]
    .filter((s) => s.date >= a && s.date <= b)
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
    });
}

export default function DashboardPage() {
  const sessions = useGymStore((s) => s.sessions);
  const plans = useGymStore((s) => s.plans);
  const active = useGymStore((s) => s.activeDraft);

  const last = sessions[0];
  const now = new Date();
  const w0 = startOfWeek(now);
  const w6 = new Date(w0);
  w6.setDate(w6.getDate() + 6);
  const m0 = startOfMonth(now);
  const weekList = useMemo(() => sessionsThisWeek(sessions, new Date()), [sessions]);
  const weekVol = weekList.reduce((a, s) => a + s.totalVolume, 0);

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Witaj z powrotem</p>
          <h1 className="text-2xl font-semibold tracking-[0.12em]">PRGRSS</h1>
          <p className="text-xs text-muted">Dziennik treningowy</p>
        </div>
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
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-card to-card p-[1px] shadow-glow-sm"
      >
        <div className="rounded-[22px] bg-card/95 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Ten tydzień</p>
              <p className="text-3xl font-semibold tabular-nums">{formatKg(weekVol)} kg</p>
              <p className="text-xs text-muted">sumaryczna objętość</p>
            </div>
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {plans.length} planów
            </Badge>
          </div>
          <Button className="mt-4 w-full" size="lg" asChild>
            <Link href={active ? "/workout/active" : "/workout/start"}>
              {active ? "Wróć do treningu" : "Rozpocznij trening"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatni trening</CardTitle>
          <CardDescription>Na podstawie zapisanego dziennika</CardDescription>
        </CardHeader>
        <CardContent>
          {!last ? (
            <EmptyState
              icon={Dumbbell}
              title="Brak zapisanego treningu"
              description="Po pierwszej sesji zobaczysz tu skrót: plan, data, objętość i porównanie z poprzednim razem."
              className="border-none bg-transparent py-6"
            >
              <Button asChild className="w-full">
                <Link href="/workout/start">Rozpocznij trening</Link>
              </Button>
            </EmptyState>
          ) : (
            <Link href={`/journal/detail?id=${encodeURIComponent(last.id)}`} className="block group">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4 transition group-hover:border-accent/30">
                <div>
                  <p className="font-medium">{last.planName}</p>
                  <p className="text-sm text-muted">{formatDate(last.date)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold tabular-nums">{formatKg(last.totalVolume)} kg</p>
                  <ProgressHint session={last} sessions={sessions} />
                </div>
              </div>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treningi w tym tygodniu</CardTitle>
          <CardDescription>
            Pon.–niedz. ({formatShortDate(localIsoDate(w0))} – {formatShortDate(localIsoDate(w6))})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weekList.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Tydzień bez wpisów"
              description="Treningi zapisane w tym tygodniu (pon.–niedz.) pojawią się na liście poniżej."
              className="border-none bg-transparent py-6"
            >
              <Button variant="secondary" asChild className="w-full">
                <Link href="/journal">Otwórz dziennik</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {weekList.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/journal/detail?id=${encodeURIComponent(s.id)}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 px-3 py-2.5 text-sm transition hover:border-accent/30"
                  >
                    <span className="font-medium">{s.planName}</span>
                    <span className="shrink-0 text-right text-xs text-muted">
                      {formatShortDate(s.date)} · {formatKg(s.totalVolume)} kg
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="hover:border-accent/25 transition-colors">
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Treningi w miesiącu</p>
            <p className="text-2xl font-semibold tabular-nums">
              {sessions.filter((s) => new Date(s.date) >= m0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-accent/25 transition-colors">
          <CardContent className="pt-5">
            <p className="text-xs text-muted">Wszystkie treningi</p>
            <p className="text-2xl font-semibold tabular-nums">{sessions.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgressHint({ session, sessions }: { session: WorkoutSession; sessions: WorkoutSession[] }) {
  const { trend, deltaVolume } = sessionProgressVsPrevious(session, sessions);
  if (trend === "na") return <p className="text-xs text-muted">Pierwszy zapis tego planu</p>;
  const sign = deltaVolume >= 0 ? "+" : "";
  if (trend === "same") return <p className="text-xs text-muted">Tak jak ostatnio</p>;
  return (
    <p className={trend === "up" ? "text-xs text-emerald-400" : "text-xs text-amber-300"}>
      {trend === "up" ? "↑" : "↓"} {sign}
      {formatKg(Math.abs(deltaVolume))} kg vs poprzedni raz
    </p>
  );
}
