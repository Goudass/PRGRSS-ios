import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
  innerClassName,
  glow = "accent",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: "accent" | "warm";
}) {
  const border =
    glow === "warm"
      ? "border-accent-warm/25 from-accent-warm/12"
      : "border-accent/25 from-accent/12";

  return (
    <div
      className={cn(
        "rounded-3xl border bg-gradient-to-br via-card to-card p-px shadow-glow-sm",
        border,
        className
      )}
    >
      <div className={cn("rounded-[22px] bg-card/95 backdrop-blur-sm", innerClassName)}>{children}</div>
    </div>
  );
}
