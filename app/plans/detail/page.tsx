"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGymStore } from "@/lib/store";

function Inner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const plans = useGymStore((s) => s.plans);
  const updatePlan = useGymStore((s) => s.updatePlan);
  const deletePlan = useGymStore((s) => s.deletePlan);
  const addPlanExercise = useGymStore((s) => s.addPlanExercise);
  const updatePlanExercise = useGymStore((s) => s.updatePlanExercise);
  const deletePlanExercise = useGymStore((s) => s.deletePlanExercise);
  const activeDraft = useGymStore((s) => s.activeDraft);
  const startWorkoutFromPlan = useGymStore((s) => s.startWorkoutFromPlan);

  const plan = useMemo(() => plans.find((p) => p.id === id), [plans, id]);
  const [exName, setExName] = useState("");
  const [exGroup, setExGroup] = useState("");
  const [open, setOpen] = useState(false);

  if (!id || !plan) {
    return (
      <div className="p-4 text-sm text-muted">
        Nie znaleziono planu.{" "}
        <Link href="/plans" className="text-accent underline-offset-4 hover:underline">
          Wróć
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link href="/plans">Wstecz</Link>
        </Button>
        <Button
          onClick={() => {
            if (activeDraft && typeof window !== "undefined") {
              if (!window.confirm("Masz niezapisany trening. Zastąpić nowym?")) return;
            }
            startWorkoutFromPlan(plan.id);
            router.push("/workout/active");
          }}
        >
          Rozpocznij trening
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edycja planu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nazwa</Label>
            <Input
              value={plan.name}
              onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
            />
          </div>
          <div>
            <Label>Opis</Label>
            <Input
              value={plan.description ?? ""}
              onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
            />
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (!window.confirm("Usunąć plan?")) return;
              deletePlan(plan.id);
              router.replace("/plans");
            }}
          >
            Usuń plan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Ćwiczenia</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Dodaj
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nowe ćwiczenie w planie</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nazwa</Label>
                  <Input value={exName} onChange={(e) => setExName(e.target.value)} />
                </div>
                <div>
                  <Label>Partia (opcjonalnie)</Label>
                  <Input value={exGroup} onChange={(e) => setExGroup(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!exName.trim()) return;
                    addPlanExercise(plan.id, {
                      name: exName.trim(),
                      muscleGroup: exGroup.trim() || undefined,
                    });
                    setExName("");
                    setExGroup("");
                    setOpen(false);
                  }}
                >
                  Zapisz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.exercises.length === 0 ? (
            <p className="text-sm text-muted">Brak ćwiczeń w planie.</p>
          ) : (
            plan.exercises.map((ex) => (
              <div key={ex.id} className="rounded-2xl border border-border bg-background/50 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-[11px]">Nazwa</Label>
                    <Input
                      value={ex.name}
                      onChange={(e) => updatePlanExercise(plan.id, ex.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Partia</Label>
                    <Input
                      value={ex.muscleGroup ?? ""}
                      onChange={(e) =>
                        updatePlanExercise(plan.id, ex.id, { muscleGroup: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={() => deletePlanExercise(plan.id, ex.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlanDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 p-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
