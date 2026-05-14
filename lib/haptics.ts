import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Lekki „klik” — dodanie serii, drobne akcje. */
export function hapticLight(): void {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Silniejszy impuls — np. zakończenie treningu. */
export function hapticMedium(): void {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}

/** Sukces (np. zapis treningu). */
export function hapticSuccess(): void {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
