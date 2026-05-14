"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useGymStore } from "@/lib/store";

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
      <div className="flex min-h-[45vh] flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <div
          className="h-11 w-11 rounded-full border-2 border-accent/25 border-t-accent animate-spin"
          aria-hidden
        />
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-muted">PRGRSS</p>
          <p className="mt-2 text-xs text-muted">Wczytywanie danych…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
