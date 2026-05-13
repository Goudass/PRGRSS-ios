import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "pl.prgrss.app",
  appName: "PRGRSS",
  webDir: "out",
  backgroundColor: "#090c11",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
