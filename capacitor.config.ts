import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "pl.prgrss.app",
  appName: "PRGRSS",
  webDir: "out",
  backgroundColor: "#090c11",
  ios: {
    /* "automatic" potrafi dodać natywny inset do WKWebView + nasze CSS safe-area = czarna szczelina pod menu */
    contentInset: "never",
    /* Gdy true (domyślnie), iOS przewija cały dokument WKWebView — menu w flex „pływa” w górę. false = tylko wewnętrzny overflow (.app-scroll). */
    scrollEnabled: false,
    preferredContentMode: "mobile",
  },
};

export default config;
