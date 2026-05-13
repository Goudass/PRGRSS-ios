"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, BookMarked, BarChart3, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store";

const items = [
  { href: "/", label: "Pulpit", icon: Home },
  { href: "/plans", label: "Plany", icon: Dumbbell },
  { href: "/journal", label: "Dziennik", icon: BookMarked },
  { href: "/stats", label: "Staty", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const active = useGymStore((s) => s.activeDraft);

  if (pathname?.startsWith("/workout/active")) return null;

  return (
    <div id="app-bottom-nav" className="relative z-50 w-full shrink-0 bg-[#090C11]">
      <nav
        className="border-t border-border/80 shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
        aria-label="Nawigacja główna"
      >
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2 pb-2">
          {items.slice(0, 2).map((it) => (
            <NavIcon key={it.href} {...it} pathname={pathname} />
          ))}
          <Link
            href={active ? "/workout/active" : "/workout/start"}
            className="relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-black shadow-glow ring-4 ring-[#090C11] transition-transform active:scale-95"
            aria-label="Rozpocznij trening"
          >
            <Play className="h-7 w-7 fill-current" />
          </Link>
          {items.slice(2).map((it) => (
            <NavIcon key={it.href} {...it} pathname={pathname} />
          ))}
        </div>
      </nav>
      {/* Osobny pas pod ikonami — wypełnia strefę home indicatora (WKWebView bywa 0px env() w CSS mimo fizycznego miejsca) */}
      <div
        aria-hidden
        className="w-full bg-[#090C11]"
        style={{ height: "max(0px, env(safe-area-inset-bottom, 0px))" }}
      />
    </div>
  );
}

function NavIcon({
  href,
  label,
  icon: Icon,
  pathname,
}: (typeof items)[0] & { pathname: string | null }) {
  const on = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-[4.25rem] flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-medium transition-colors",
        on ? "text-accent" : "text-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", on && "drop-shadow-[0_0_8px_rgba(255,214,10,0.35)]")} />
      {label}
    </Link>
  );
}
