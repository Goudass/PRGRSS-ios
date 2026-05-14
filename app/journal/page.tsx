"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
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

  const filterEmpty = filtered.length === 0 && sessions.length > 0;
  const totallyEmpty = sessions.length === 0;

  return (
    <div className="space-y-6 p-4 pb-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Dziennik</h1>
        <p className="text-sm text-muted">Historia zapisanych treningów</p>
      </header>
      <div className="space-y-2">
        <label className="text-xs text-muted">Filtruj po planie</label>
        <select
          className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
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
      {totallyEmpty ? (
        <EmptyState
          icon={BookOpen}
          title="Jeszcze nic nie zapisano"
          description="Po treningu zapiszesz tu objętość, datę i porównanie z poprzednim razem — wszystko offline, na Twoim telefonie."
        >
          <Button asChild className="w-full">
            <Link href="/workout/start">Rozpocznij pierwszy trening</Link>
          </Button>
          <Button variant="secondary" asChild className="w-full">
            <Link href="/plans">Przejdź do planów</Link>
          </Button>
        </EmptyState>
      ) : filterEmpty ? (
        <EmptyState
          icon={Filter}
          title="Brak wpisów dla tego filtra"
          description="Dla wybranego planu nie ma jeszcze zapisanych treningów. Zmień filtr albo zapisz trening z tym planem."
        >
          <Button variant="secondary" className="w-full" onClick={() => setPlanFilter("all")}>
            Pokaż wszystkie treningi
          </Button>
        </EmptyState>
      ) : (
        <ul className="m-0 list-none flex flex-col gap-4 p-0">
          {filtered.map((s) => {
            const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
            const { trend, deltaVolume } = sessionProgressVsPrevious(s, sessions);
            return (
              <li key={s.id}>
                <Link
                  href={`/journal/detail?id=${encodeURIComponent(s.id)}`}
                  className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
