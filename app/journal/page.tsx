"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TrendBadge } from "@/components/trend-badge";
import { useGymStore } from "@/lib/store";
import { formatDate, formatKg } from "@/lib/utils";
import { sessionProgressVsPrevious } from "@/lib/comparison";
import { sessionSetCount } from "@/lib/stats-aggregates";

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
      <PageHeader title="Dziennik" subtitle="Historia zapisanych treningów" />
      <div className="space-y-2">
        <label className="stat-label">Filtruj po planie</label>
        <select
          className="w-full rounded-2xl border border-border bg-background/80 px-3 py-2.5 text-sm font-medium focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
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
          description="Po treningu zobaczysz tu objętość, datę i porównanie z poprzednim razem."
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
          description="Dla wybranego planu nie ma jeszcze zapisanych treningów."
        >
          <Button variant="secondary" className="w-full" onClick={() => setPlanFilter("all")}>
            Pokaż wszystkie treningi
          </Button>
        </EmptyState>
      ) : (
        <ul className="m-0 list-none flex flex-col gap-3 p-0">
          {filtered.map((s) => {
            const sets = sessionSetCount(s);
            const { trend, deltaVolume, pct } = sessionProgressVsPrevious(s, sessions);
            return (
              <li key={s.id}>
                <Link
                  href={`/journal/detail?id=${encodeURIComponent(s.id)}`}
                  className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <Card className="overflow-hidden transition hover:border-accent/35">
                    <CardContent className="flex items-center justify-between gap-3 py-4">
                      <div className="min-w-0">
                        <p className="font-semibold">{s.planName}</p>
                        <p className="text-xs text-muted">{formatDate(s.date)}</p>
                        <p className="mt-1 text-[11px] text-muted">
                          {s.exercises.length} ćwiczeń · {sets} serii
                        </p>
                        {s.planId && trend !== "na" && (
                          <div className="mt-2">
                            <TrendBadge trend={trend} deltaVolume={deltaVolume} pct={pct} compact />
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="stat-value text-xl">{formatKg(s.totalVolume)} kg</p>
                        <ChevronRight className="h-4 w-4 text-muted" />
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
