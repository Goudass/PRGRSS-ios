"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatMetric } from "@/components/stat-metric";
import { useGymStore } from "@/lib/store";
import { formatKg, isValidIsoDate, localIsoDate } from "@/lib/utils";
import { sessionsInRange } from "@/lib/stats-aggregates";

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarInner() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");
  const sessions = useGymStore((s) => s.sessions);
  const activeDraft = useGymStore((s) => s.activeDraft);
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthMatrix(year, month), [year, month]);

  const byDay = useMemo(() => {
    const m: Record<string, typeof sessions> = {};
    for (const s of sessions) {
      const sd = new Date(s.date + "T12:00:00");
      if (sd.getFullYear() !== year || sd.getMonth() !== month) continue;
      m[s.date] = m[s.date] ? [...m[s.date], s] : [s];
    }
    return m;
  }, [sessions, year, month]);

  const [selected, setSelected] = useState<string | null>(
    isValidIsoDate(dayParam) ? dayParam : null
  );

  useEffect(() => {
    if (isValidIsoDate(dayParam)) setSelected(dayParam);
  }, [dayParam]);

  const monthStats = useMemo(() => {
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    const list = sessionsInRange(sessions, from, to);
    return {
      count: list.length,
      volume: list.reduce((a, s) => a + s.totalVolume, 0),
    };
  }, [sessions, year, month]);

  const label = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(cursor);
  const today = localIsoDate(new Date());

  return (
    <div className="space-y-4 p-4 pb-4">
      <PageHeader title="Kalendarz" subtitle="Dni z treningami" />
      <div className="grid grid-cols-2 gap-2">
        <StatMetric label="Ten miesiąc" value={monthStats.count} hint="treningów" accent="accent" />
        <StatMetric label="Objętość" value={`${formatKg(monthStats.volume)} kg`} hint="w miesiącu" />
      </div>
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-semibold capitalize">{label}</h2>
        <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="aspect-square" />;
          const iso = localIsoDate(d);
          const list = byDay[iso] ?? [];
          const has = list.length > 0;
          const on = selected === iso;
          const isToday = iso === today;
          const vol = list.reduce((a, s) => a + s.totalVolume, 0);
          const intensity =
            vol > 0 ? Math.min(1, vol / Math.max(...Object.values(byDay).flat().map((s) => s.totalVolume), 1)) : 0;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm transition ${
                has
                  ? "border-accent/40 text-foreground shadow-glow-sm"
                  : "border-border/80 bg-card/30 text-muted"
              } ${on ? "ring-2 ring-accent/70" : ""} ${isToday && !on ? "border-accent/30" : ""}`}
              style={
                has
                  ? { backgroundColor: `rgba(255, 238, 50, ${0.06 + intensity * 0.18})` }
                  : undefined
              }
            >
              <span className={`font-semibold tabular-nums ${isToday ? "text-accent" : ""}`}>
                {d.getDate()}
              </span>
              {has && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent shadow-[0_0_6px_rgba(255,238,50,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
      <Card>
        <CardContent className="space-y-3 py-4">
          {!selected ? (
            <p className="text-sm text-muted">Wybierz dzień, aby zobaczyć treningi.</p>
          ) : (
            <>
              <p className="font-semibold">
                {new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(
                  new Date(selected + "T12:00:00")
                )}
              </p>
              {(byDay[selected] ?? []).length === 0 ? (
                <p className="text-sm text-muted">Brak treningów.</p>
              ) : (
                <div className="space-y-2">
                  {(byDay[selected] ?? []).map((s) => (
                    <Link
                      key={s.id}
                      href={`/journal/detail?id=${encodeURIComponent(s.id)}`}
                      className="block rounded-2xl border border-border/80 bg-background/50 px-3 py-2.5 text-sm transition hover:border-accent/30"
                    >
                      <p className="font-medium">{s.planName}</p>
                      <p className="font-display text-xs font-semibold tabular-nums text-muted-bright">
                        {formatKg(s.totalVolume)} kg
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <Button className="w-full" asChild>
                  <Link href={`/workout/start?date=${encodeURIComponent(selected)}`}>
                    <Plus className="h-4 w-4" />
                    Dodaj trening tego dnia
                  </Link>
                </Button>
                {activeDraft && (
                  <p className="text-center text-[11px] text-muted">
                    Masz niezapisany trening — przy starcie nowego zapytamy, czy go zastąpić.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted">Ładowanie kalendarza…</div>}>
      <CalendarInner />
    </Suspense>
  );
}
