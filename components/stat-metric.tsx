import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatMetric({
  icon: Icon,
  label,
  value,
  hint,
  accent = "default",
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: "default" | "accent" | "warm";
  className?: string;
}) {
  const iconBg =
    accent === "accent"
      ? "bg-accent/15 text-accent"
      : accent === "warm"
        ? "bg-accent-warm/15 text-accent-warm"
        : "bg-foreground/5 text-muted";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-background/40 p-3 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
        {Icon && (
          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="stat-value mt-1.5">{value}</p>
      {hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>}
    </div>
  );
}
