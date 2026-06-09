import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/**
 * Konfigurasi ESLint Flat Config untuk proyek TanStack Start.
 * Menghapus ketergantungan pada eslint-config-next dan menggantinya dengan plugin
 * typescript-eslint dan eslint-react standar untuk stabilitas build.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Mengaktifkan aturan hooks React standar
      ...reactHooksPlugin.configs.recommended.rules,
      // Konfigurasi agar variabel dengan prefix underscore diabaikan dari warning unused vars
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    // Folder dan file yang diabaikan dari linting
    ignores: [
      ".next/**",
      ".output/**",
      ".vinxi/**",
      "dist/**",
      "build/**",
      "scripts/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
      "public/**",
      "tests/**",
      "src/lib/next-headers-shim.ts",
      "src/lib/next-navigation-shim.ts"
    ],
  }
);
