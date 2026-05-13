import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { GymProvider } from "@/components/gym-provider";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRGRSS",
  description: "Plany treningowe, dziennik i progres.",
  applicationName: "PRGRSS",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "PRGRSS",
    statusBarStyle: "black-translucent",
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} h-full overflow-hidden`}>
      <body className="font-sans flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden antialiased">
        <AmbientBackground />
        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
          <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
            <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain overscroll-x-none pt-4 [-webkit-overflow-scrolling:touch]">
              <GymProvider>{children}</GymProvider>
            </div>
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
