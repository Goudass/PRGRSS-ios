import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { NativeChrome } from "@/components/native-chrome";
import { GymProvider } from "@/components/gym-provider";
import { BottomNav } from "@/components/bottom-nav";

/** Noto Sans Mono (variable) — domyślna czcionka UI (`font-sans`). OFL: `app/fonts/NotoSansMono-OFL.txt` */
const notoSansMono = localFont({
  src: "./fonts/NotoSansMono-VariableFont_wdth,wght.ttf",
  variable: "--font-noto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRGRSS",
  description:
    "PRGRSS — plan treningowy, dziennik sesji i progres w jednej aplikacji. Działa w przeglądarce i jako paczka iOS (Capacitor); dane lokalnie na urządzeniu.",
  applicationName: "PRGRSS",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "PRGRSS",
    /* black-translucent = treść pod zegarkiem (env safe-area bywa 0 w WKWebView) */
    statusBarStyle: "black" as const,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090C11",
  viewportFit: "cover" as const,
};

const criticalCss = `
/* Gdy główny bundle CSS się nie załaduje (np. Messenger, restrykcyjny WKWebView) */
:root{color-scheme:dark}
html,body{height:100%;margin:0;overflow:hidden;background:#090c11!important;color:#f5f5f5;-webkit-text-size-adjust:100%}
a{color:#757b81;text-decoration:none}
#app-root-shell{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box}
#app-root-shell>div:first-of-type{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;width:100%;max-width:32rem;margin:0 auto}
#app-scroll{flex:1;min-height:0;overflow-y:auto;padding-bottom:10rem;-webkit-overflow-scrolling:touch}
#app-bottom-nav{flex-shrink:0;width:100%;background:#090c11;border-top:1px solid rgba(117,123,129,.32)}
#app-bottom-nav nav>div{display:flex;max-width:32rem;margin:0 auto;justify-content:space-around;align-items:flex-end;padding:.5rem .25rem;gap:.25rem}
#app-bottom-nav a{display:flex;flex-direction:column;align-items:center;font-size:11px;font-weight:500;gap:.25rem;color:#757b81}
#app-bottom-nav svg{width:1.25rem;height:1.25rem;flex-shrink:0}
#app-bottom-nav a[aria-label="Rozpocznij trening"]{min-width:4rem;height:4rem;border-radius:9999px;background:#ffee32;color:#090c11;justify-content:center;margin-top:-2rem;box-shadow:0 0 20px rgba(255,238,50,.25)}
#app-bottom-nav a[aria-label="Rozpocznij trening"] svg{width:1.75rem;height:1.75rem}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${notoSansMono.variable} h-full overflow-hidden`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
      <body className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#090C11] font-sans antialiased">
        <NativeChrome />
        <AmbientBackground />
        {/* Obcięcie do viewportu — inaczej iOS przesuwa całą stronę razem z menu */}
        <div
          id="app-root-shell"
          className="app-shell pointer-events-auto fixed inset-0 z-10 flex w-full flex-col overflow-hidden"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden">
            <div
              id="app-scroll"
              className="app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain overscroll-x-none pb-40 [-webkit-overflow-scrolling:touch]"
            >
              <GymProvider>{children}</GymProvider>
            </div>
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
