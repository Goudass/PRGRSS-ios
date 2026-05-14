import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

const config = [
  {
    ignores: [".next/**", "out/**", "node_modules/**", "ios/**", "android/**"],
  },
  ...eslintConfig,
];

export default config;
