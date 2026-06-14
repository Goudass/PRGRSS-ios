import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKg } from "@/lib/utils";

export function TrendBadge({
  trend,
  deltaVolume,
  pct,
  compact,
}: {
  trend: "up" | "down" | "same" | "na";
  deltaVolume?: number;
  pct?: number;
  compact?: boolean;
}) {
  if (trend === "na") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Pierwszy zapis
      </Badge>
    );
  }
  if (trend === "same") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Bez zmian
      </Badge>
    );
  }
  const up = trend === "up";
  const sign = up ? "+" : "−";
  const label = compact
    ? `${sign}${pct !== undefined ? `${Math.abs(pct).toFixed(0)}%` : formatKg(Math.abs(deltaVolume ?? 0))}`
    : `${sign}${formatKg(Math.abs(deltaVolume ?? 0))} kg${pct !== undefined ? ` (${sign}${Math.abs(pct).toFixed(0)}%)` : ""}`;

  return (
    <Badge variant={up ? "success" : "warn"} className="gap-0.5 text-[10px]">
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
