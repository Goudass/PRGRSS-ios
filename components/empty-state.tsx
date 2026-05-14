import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-border/70 bg-card/35 px-5 py-10 text-center sm:px-8 sm:py-12",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-accent shadow-inner">
        <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {children ? <div className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-2">{children}</div> : null}
    </div>
  );
}
