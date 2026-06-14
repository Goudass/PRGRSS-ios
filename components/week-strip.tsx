"use client";

import Link from "next/link";
import { cn, localIsoDate } from "@/lib/utils";
import type { WorkoutSession } from "@/lib/types";
import { startOfWeek } from "@/lib/stats-aggregates";

export function WeekStrip({
  sessions,
  selectedIso,
  className,
}: {
  sessions: WorkoutSession[];
  selectedIso?: string;
  className?: string;
}) {
  const today = localIsoDate(new Date());
  const w0 = startOfWeek(new Date());
  const days: { iso: string; dow: string; num: number; hasWorkout: boolean }[] = [];
  const fmt = new Intl.DateTimeFormat("pl-PL", { weekday: "short" });

  for (let i = 0; i < 7; i++) {
    const d = new Date(w0);
    d.setDate(d.getDate() + i);
    const iso = localIsoDate(d);
    days.push({
      iso,
      dow: fmt.format(d).replace(".", ""),
      num: d.getDate(),
      hasWorkout: sessions.some((s) => s.date === iso),
    });
  }

  return (
    <div className={cn("flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]", className)}>
      {days.map((d) => {
        const on = (selectedIso ?? today) === d.iso;
        return (
          <Link
            key={d.iso}
            href={`/calendar?day=${d.iso}`}
            className={cn(
              "flex min-w-[2.75rem] flex-col items-center rounded-2xl border px-2 py-2 text-center transition",
              on
                ? "border-accent/50 bg-accent text-black shadow-glow-sm"
                : d.hasWorkout
                  ? "border-accent/25 bg-accent/8 text-foreground"
                  : "border-border/60 bg-card/40 text-muted"
            )}
          >
            <span className="text-[9px] font-semibold uppercase">{d.dow}</span>
            <span className="text-sm font-bold tabular-nums">{d.num}</span>
          </Link>
        );
      })}
    </div>
  );
}
