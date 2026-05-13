"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";

export default function PlansPage() {
  const plans = useGymStore((s) => s.plans);

  return (
    <div className="space-y-6 p-4 pb-4">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold">Plany treningowe</h1>
          <p className="text-sm text-muted">Twórz i edytuj szablony treningów</p>
        </div>
        <Button asChild size="sm">
          <Link href="/plans/new">
            <Plus className="h-4 w-4" />
            Nowy
          </Link>
        </Button>
      </header>
      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Nie masz jeszcze planów.{" "}
            <Link href="/plans/new" className="text-accent underline-offset-4 hover:underline">
              Dodaj pierwszy plan
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="m-0 list-none flex flex-col gap-4 p-0">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={`/plans/detail?id=${encodeURIComponent(p.id)}`}
                className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="transition hover:border-accent/30">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted">{p.exercises.length} ćwiczeń</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
