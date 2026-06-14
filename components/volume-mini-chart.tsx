"use client";

import { cn } from "@/lib/utils";

export function VolumeMiniChart({
  days,
  highlightIso,
  className,
}: {
  days: { iso: string; label: string; volume: number; count: number }[];
  highlightIso?: string;
  className?: string;
}) {
  const max = Math.max(...days.map((d) => d.volume), 1);
  const maxBarPx = 56;

  return (
    <div className={cn("flex h-16 items-end justify-between gap-1", className)}>
      {days.map((d) => {
        const barPx =
          d.volume > 0 ? Math.max(8, Math.round((d.volume / max) * maxBarPx)) : 3;
        const active = highlightIso ? d.iso === highlightIso : d.count > 0;
        return (
          <div key={d.iso} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "w-full max-w-[2rem] rounded-t-md transition-all",
                active ? "bg-accent shadow-[0_0_12px_rgba(255,238,50,0.35)]" : "bg-foreground/10"
              )}
              style={{ height: `${barPx}px` }}
              title={d.volume > 0 ? `${d.label}: ${d.volume} kg` : d.label}
            />
            <span
              className={cn(
                "text-[9px] font-medium uppercase",
                active ? "text-accent" : "text-muted"
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
