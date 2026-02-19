import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party JS files that we don't own
    "lib/optimized_risk_engine.js",
  ]),
  {
    rules: {
      // setMounted(true) in useEffect is the standard Next.js hydration guard pattern
      "react-hooks/set-state-in-effect": "off",
      // Legacy CommonJS require() is necessary for the JS risk engine module
      "@typescript-eslint/no-require-imports": "warn",
      // Downgrade to warnings so they don't block the build
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
