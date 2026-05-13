"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";
import { formatDate, isValidIsoDate } from "@/lib/utils";

function WorkoutStartInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateRaw = searchParams.get("date");
  const scheduledDate = isValidIsoDate(dateRaw) ? dateRaw : undefined;

  const plans = useGymStore((s) => s.plans);
  const active = useGymStore((s) => s.activeDraft);
  const startWorkoutFromPlan = useGymStore((s) => s.startWorkoutFromPlan);
  const startQuickWorkout = useGymStore((s) => s.startQuickWorkout);

  const beginPlan = (planId: string) => {
    if (active && typeof window !== "undefined") {
      if (!window.confirm("Masz niezapisany trening. Zastąpić nowym?")) return;
    }
    startWorkoutFromPlan(planId, scheduledDate);
    router.push("/workout/active");
  };

  const beginQuick = () => {
    if (active && typeof window !== "undefined") {
      if (!window.confirm("Masz niezapisany trening. Zastąpić nowym?")) return;
    }
    startQuickWorkout(undefined, scheduledDate);
    router.push("/workout/active");
  };

  return (
    <div className="space-y-5 p-4 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Rozpocznij trening</h1>
        <p className="text-sm text-muted">Wybierz plan lub szybki trening</p>
        {scheduledDate && (
          <p className="mt-2 rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
            Trening zostanie zapisany z datą: <strong>{formatDate(scheduledDate)}</strong>
          </p>
        )}
      </div>
      {active && (
        <Button className="w-full" size="lg" onClick={() => router.push("/workout/active")}>
          Wróć do aktywnego treningu
        </Button>
      )}
      <div className="space-y-2">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted">
              Brak planów.{" "}
              <Link href="/plans/new" className="text-accent underline-offset-4 hover:underline">
                Utwórz pierwszy plan
              </Link>
            </CardContent>
          </Card>
        ) : (
          plans.map((p) => (
            <Card
              key={p.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer transition hover:border-accent/35 hover:shadow-glow-sm"
              onClick={() => beginPlan(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  beginPlan(p.id);
                }
              }}
            >
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.exercises.length} ćwiczeń
                    {p.description ? ` · ${p.description}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Button variant="secondary" className="w-full" onClick={beginQuick}>
        <Plus className="h-4 w-4" />
        Szybki trening (bez planu)
      </Button>
    </div>
  );
}

export default function WorkoutStartPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 pb-4 text-sm text-muted">Ładowanie…</div>
      }
    >
      <WorkoutStartInner />
    </Suspense>
  );
}
