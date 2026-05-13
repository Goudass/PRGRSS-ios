"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";
import { formatKg } from "@/lib/utils";

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

export default function CalendarPage() {
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

  const [selected, setSelected] = useState<string | null>(null);

  const label = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(cursor);

  return (
    <div className="space-y-4 p-4 pb-4">
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold capitalize">{label}</h1>
        <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="aspect-square" />;
          const iso = d.toISOString().slice(0, 10);
          const list = byDay[iso] ?? [];
          const has = list.length > 0;
          const on = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm transition ${
                has
                  ? "border-accent/40 bg-accent/10 text-foreground shadow-glow-sm"
                  : "border-border bg-card/40 text-muted"
              } ${on ? "ring-2 ring-accent/60" : ""}`}
            >
              <span className="font-medium">{d.getDate()}</span>
              {has && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
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
              <p className="text-sm font-medium">
                {new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(new Date(selected))}
              </p>
              {(byDay[selected] ?? []).length === 0 ? (
                <p className="text-sm text-muted">Brak treningów.</p>
              ) : (
                <div className="space-y-2">
                  {(byDay[selected] ?? []).map((s) => (
                    <Link key={s.id} href={`/journal/detail?id=${encodeURIComponent(s.id)}`} className="block rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm transition hover:border-accent/30">
                      <p className="font-medium">{s.planName}</p>
                      <p className="text-xs text-muted">{formatKg(s.totalVolume)} kg</p>
                    </Link>
                  ))}
                </div>
              )}
              {selected && (
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
