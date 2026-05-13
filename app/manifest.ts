import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRGRSS",
    short_name: "PRGRSS",
    description: "Plany treningowe, dziennik i progres.",
    start_url: "/",
    display: "standalone",
    background_color: "#090C11",
    theme_color: "#090C11",
    orientation: "portrait-primary",
    lang: "pl",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
