"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useGymStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export function GymProvider({ children }: { children: ReactNode }) {
  /** SSR / prerender: nie wołaj `persist` (bywa undefined w workerze builda). */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persist = useGymStore.persist;
    const finish = () => {
      useGymStore.getState().seedIfEmpty();
      setReady(true);
    };

    if (!persist || typeof persist.hasHydrated !== "function") {
      finish();
      return;
    }

    if (persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = persist.onFinishHydration(finish);
    return unsub;
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  return <>{children}</>;
}
