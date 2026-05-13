"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, Save, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGymStore, useActiveVolume } from "@/lib/store";
import { formatDate, formatKg, localIsoDate } from "@/lib/utils";
import {
  attachPreviousToDraft,
  compareExerciseToPrevious,
  compareSessionVolumes,
  findPreviousExercise,
  summarizeExercisePrevious,
} from "@/lib/comparison";

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const draft = useGymStore((s) => s.activeDraft);
  const sessions = useGymStore((s) => s.sessions);
  const addSet = useGymStore((s) => s.addSet);
  const removeSet = useGymStore((s) => s.removeSet);
  const updateSet = useGymStore((s) => s.updateSet);
  const addExerciseToActive = useGymStore((s) => s.addExerciseToActive);
  const removeExerciseFromActive = useGymStore((s) => s.removeExerciseFromActive);
  const completeActiveWorkout = useGymStore((s) => s.completeActiveWorkout);
  const cancelActiveWorkout = useGymStore((s) => s.cancelActiveWorkout);
  const vol = useActiveVolume();
  const [savedPulse, setSavedPulse] = useState(false);
  const [openEx, setOpenEx] = useState<Record<string, boolean>>({});
  const [newExName, setNewExName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!draft) router.replace("/workout/start");
  }, [draft, router]);

  const prevSession = useMemo(() => {
    if (!draft) return null;
    return attachPreviousToDraft(draft, sessions);
  }, [draft, sessions]);

  const sessionCmp = useMemo(() => {
    if (!draft || !prevSession) return null;
    return compareSessionVolumes(vol, prevSession.totalVolume);
  }, [draft, prevSession, vol]);

  if (!draft) return null;

  const progressMsg =
    sessionCmp?.message === "better"
      ? "Lepszy trening niż ostatnio"
      : sessionCmp?.message === "worse"
        ? "Mniejsza objętość niż ostatnio"
        : sessionCmp?.message === "same"
          ? "Taka sama objętość jak ostatnio"
          : null;

  const todayLocal = localIsoDate(new Date());
  const isBackdated = draft.date !== todayLocal;

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-4">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Aktywny trening</p>
            <h1 className="text-xl font-semibold">{draft.planName}</h1>
            {isBackdated && (
              <p className="mt-1 text-xs text-accent">
                Data zapisu: {formatDate(draft.date)} <span className="text-muted">(wstecz)</span>
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Zamknij
          </Button>
        </div>
        {prevSession && (
          <div className="mt-3 rounded-2xl border border-border bg-card/60 px-3 py-2 text-xs text-muted">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Poprzednio: {formatKg(prevSession.totalVolume)} kg</span>
              <span className="text-foreground">Teraz: {formatKg(vol)} kg</span>
            </div>
            {sessionCmp && prevSession.totalVolume > 0 && (
              <p className="mt-1 text-[11px]">
                Δ {sessionCmp.delta >= 0 ? "+" : ""}
                {formatKg(sessionCmp.delta)} kg ({sessionCmp.delta >= 0 ? "+" : ""}
                {sessionCmp.pct.toFixed(1)}%)
              </p>
            )}
            {progressMsg && (
              <p
                className={
                  sessionCmp?.message === "better"
                    ? "mt-1 font-medium text-emerald-400"
                    : sessionCmp?.message === "worse"
                      ? "mt-1 font-medium text-amber-300"
                      : "mt-1 font-medium text-muted"
                }
              >
                {progressMsg}
              </p>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col space-y-4 p-4 pb-6">
        {draft.exercises.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted">
              Dodaj pierwsze ćwiczenie, aby rozpocząć trening.
            </CardContent>
          </Card>
        ) : (
          draft.exercises.map((ex) => {
            const prevEx = findPreviousExercise(prevSession, ex);
            const summary = prevEx ? summarizeExercisePrevious(prevEx) : null;
            const cmp = compareExerciseToPrevious(ex, prevEx);
            const expanded = openEx[ex.id] !== false;
            return (
              <motion.div key={ex.id} layout className="rounded-3xl border border-border bg-card/80">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                  onClick={() => setOpenEx((s) => ({ ...s, [ex.id]: !expanded }))}
                >
                  <div>
                    <p className="font-medium">{ex.name}</p>
                    <p className="text-xs text-muted">
                      {ex.sets.length} serii · {formatKg(ex.totalVolume)} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cmp.progress === "up" && (
                      <Badge variant="success" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        progres
                      </Badge>
                    )}
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-border/60"
                    >
                      <div className="space-y-3 p-4">
                        {summary && (
                          <div className="rounded-2xl bg-background/60 px-3 py-2 text-xs text-muted">
                            <p className="font-medium text-foreground">Ostatnio</p>
                            <p>
                              {summary.lastSets.map((s) => `${formatKg(s.weight)} kg × ${s.reps}`).join(" · ")}
                            </p>
                            <p className="mt-1">
                              Serie: {summary.setCount} · Objętość: {formatKg(summary.totalVolume)} kg
                            </p>
                            {cmp.progress !== "none" && (
                              <p className="mt-1 text-[11px]">
                                Δ waga (max): {cmp.deltaWeight >= 0 ? "+" : ""}
                                {formatKg(cmp.deltaWeight)} kg · Δ powtórzenia (suma): {cmp.deltaReps >= 0 ? "+" : ""}
                                {cmp.deltaReps} · Δ objętość: {cmp.deltaVolume >= 0 ? "+" : ""}
                                {formatKg(cmp.deltaVolume)} kg
                              </p>
                            )}
                          </div>
                        )}
                        <AnimatePresence initial={false}>
                          {ex.sets.map((st, idx) => {
                            const prevSet = prevEx?.sets[idx];
                            const hint = prevSet
                              ? `Ostatnio: ${formatKg(prevSet.weight)} kg × ${prevSet.reps}`
                              : null;
                            const better =
                              prevSet &&
                              (st.weight > prevSet.weight ||
                                st.reps > prevSet.reps ||
                                st.weight * st.reps > prevSet.weight * prevSet.reps);
                            return (
                              <motion.div
                                key={st.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-2xl border border-border/80 bg-background/50 p-3"
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted">Seria {idx + 1}</span>
                                  {better && (
                                    <Badge variant="success" className="text-[10px]">
                                      progress
                                    </Badge>
                                  )}
                                </div>
                                {hint && <p className="mb-2 text-[11px] text-muted">{hint}</p>}
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-[11px]">Ciężar (kg)</Label>
                                    <Input
                                      inputMode="decimal"
                                      value={st.weight === 0 ? "" : String(st.weight)}
                                      onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        updateSet(ex.id, st.id, {
                                          weight: Number.isFinite(v) ? v : 0,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[11px]">Powtórzenia</Label>
                                    <Input
                                      inputMode="numeric"
                                      value={st.reps === 0 ? "" : String(st.reps)}
                                      onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        updateSet(ex.id, st.id, {
                                          reps: Number.isFinite(v) ? v : 0,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Label className="text-[11px]">Notatka (opcjonalnie)</Label>
                                  <Input
                                    value={st.note ?? ""}
                                    onChange={(e) => updateSet(ex.id, st.id, { note: e.target.value })}
                                    placeholder="np. tempo, RPE"
                                  />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                                  <span>Objętość serii: {formatKg(st.volume)} kg</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-red-400 hover:text-red-300"
                                    onClick={() => removeSet(ex.id, st.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div className="flex gap-2">
                          <Button variant="secondary" className="flex-1" onClick={() => addSet(ex.id)}>
                            <Plus className="h-4 w-4" />
                            Dodaj serię
                          </Button>
                          <Button variant="outline" onClick={() => removeExerciseFromActive(ex.id)}>
                            Usuń ćwiczenie
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4" />
              Dodaj ćwiczenie (tylko ten trening)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowe ćwiczenie</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nazwa</Label>
                <Input value={newExName} onChange={(e) => setNewExName(e.target.value)} placeholder="np. Face pull" />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!newExName.trim()) return;
                  addExerciseToActive(newExName.trim());
                  setNewExName("");
                  setDialogOpen(false);
                }}
              >
                Dodaj
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <motion.div
          animate={savedPulse ? { scale: [1, 1.02, 1] } : {}}
          className="mt-4 rounded-3xl border border-accent/30 bg-card/95 p-4 shadow-glow backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted">Objętość treningu</p>
              <p className="text-2xl font-semibold tabular-nums">{formatKg(vol)} kg</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Anulować trening?")) return;
                  cancelActiveWorkout();
                  router.push("/workout/start");
                }}
              >
                Anuluj
              </Button>
              <Button
                onClick={() => {
                  if (draft.exercises.length === 0) return;
                  completeActiveWorkout();
                  setSavedPulse(true);
                  setTimeout(() => setSavedPulse(false), 500);
                  router.push("/journal");
                }}
              >
                <Save className="h-4 w-4" />
                Zapisz
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
