"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg } from "@/lib/utils";
import { sessionProgressVsPrevious } from "@/lib/comparison";

export default function JournalPage() {
  const sessions = useGymStore((s) => s.sessions);
  const plans = useGymStore((s) => s.plans);
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (planFilter === "all") return sessions;
    return sessions.filter((s) => s.planId === planFilter);
  }, [sessions, planFilter]);

  return (
    <div className="space-y-4 p-4 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Dziennik</h1>
        <p className="text-sm text-muted">Historia zapisanych treningów</p>
      </div>
      <div>
        <label className="text-xs text-muted">Filtruj po planie</label>
        <select
          className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="all">Wszystkie</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Nie masz jeszcze żadnych treningów w tym widoku.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
            const { trend, deltaVolume } = sessionProgressVsPrevious(s, sessions);
            return (
              <Link key={s.id} href={`/journal/detail?id=${encodeURIComponent(s.id)}`}>
                <Card className="transition hover:border-accent/30">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{s.planName}</p>
                      <p className="text-xs text-muted">{formatDate(s.date)}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        {s.exercises.length} ćwiczeń · {sets} serii
                      </p>
                      {s.planId && trend !== "na" && (
                        <p
                          className={
                            trend === "up"
                              ? "mt-1 text-[11px] text-emerald-400"
                              : trend === "down"
                                ? "mt-1 text-[11px] text-amber-300"
                                : "mt-1 text-[11px] text-muted"
                          }
                        >
                          {trend === "up" && `↑ +${formatKg(deltaVolume)} kg vs poprzedni raz`}
                          {trend === "down" && `↓ -${formatKg(Math.abs(deltaVolume))} kg vs poprzedni raz`}
                          {trend === "same" && "Tak samo jak ostatnio"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatKg(s.totalVolume)} kg</p>
                      <ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
