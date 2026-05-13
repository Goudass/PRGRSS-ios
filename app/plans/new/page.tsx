"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";

export default function NewPlanPage() {
  const router = useRouter();
  const addPlan = useGymStore((s) => s.addPlan);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-4 p-4 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Nowy plan</h1>
        <p className="text-sm text-muted">Nazwij plan i dodaj ćwiczenia w szczegółach</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dane planu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nazwa</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. FBW A" />
          </div>
          <div>
            <Label>Opis (opcjonalnie)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis"
            />
          </div>
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => {
              const id = addPlan({ name: name.trim(), description: description.trim() || undefined });
              router.replace(`/plans/detail?id=${encodeURIComponent(id)}`);
            }}
          >
            Utwórz i dodaj ćwiczenia
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
