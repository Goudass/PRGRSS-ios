"use client";

import Link from "next/link";
import { ChevronRight, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { useGymStore } from "@/lib/store";

export default function PlansPage() {
  const plans = useGymStore((s) => s.plans);

  return (
    <div className="space-y-6 p-4 pb-4">
      <PageHeader
        title="Plany treningowe"
        subtitle="Szablony ćwiczeń i serii"
        action={
          <Button asChild size="sm">
            <Link href="/plans/new">
              <Plus className="h-4 w-4" />
              Nowy
            </Link>
          </Button>
        }
      />
      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Zacznij od planu"
          description="Plan to szablon ćwiczeń i serii — zapiszesz go raz i będziesz wracać do treningu jednym tapnięciem."
        >
          <Button asChild className="w-full">
            <Link href="/plans/new">
              <Plus className="h-4 w-4" />
              Utwórz pierwszy plan
            </Link>
          </Button>
        </EmptyState>
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
