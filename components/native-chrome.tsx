"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

async function applyStatusBar() {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#090C11" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* przeglądarka / brak pluginu */
  }
}

/**
 * iOS: spójny pasek statusu z UI (ciemny, tło #090C11, treść nie pod zegarkiem).
 * Ponawiamy po powrocie aplikacji z tła — czasem iOS przywraca domyśl.
 */
export function NativeChrome() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void applyStatusBar();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void applyStatusBar();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
