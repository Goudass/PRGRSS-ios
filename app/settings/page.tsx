"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGymStore } from "@/lib/store";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const exportJson = useGymStore((s) => s.exportJson);
  const exportCsv = useGymStore((s) => s.exportCsv);

  return (
    <div className="space-y-4 p-4 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Ustawienia</h1>
        <p className="text-sm text-muted">Eksport danych i preferencje</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Jednostki</CardTitle>
          <CardDescription>Aplikacja korzysta z kilogramów (kg).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">kg</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dane przykładowe</CardTitle>
          <CardDescription>
            Załaduj plany i ok. 20 przykładowych treningów z progresją (nadpisze obecne dane).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm(
                  "Zastąpić wszystkie plany i treningi przykładowymi danymi? Tej operacji nie można cofnąć (chyba że masz eksport JSON)."
                )
              ) {
                return;
              }
              useGymStore.getState().loadDemoData();
            }}
          >
            Załaduj przykładowe treningi
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eksport</CardTitle>
          <CardDescription>Pobierz kopię zapasową danych z przeglądarki.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => download("prgrss.json", exportJson(), "application/json")}>
            JSON
          </Button>
          <Button variant="secondary" onClick={() => download("prgrss.csv", exportCsv(), "text/csv;charset=utf-8")}>
            CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
