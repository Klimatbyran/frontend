import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      // Suppress defaultProps deprecation warnings from Recharts
      "react/no-deprecated": "off",
      "react/default-props-match-prop-types": "off",
      "no-unused-expressions": "off",
      "no-console": "off",
      "no-duplicate-imports": "off",
      "no-unreachable": "off",
      "no-unused-labels": "off",

      // Mimic Typescripts noUnusedLocals and noUnusedParameters behaviour
      // https://typescript-eslint.io/rules/no-unused-vars/#what-benefits-does-this-rule-have-over-typescript
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      complexity: "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-depth": "off",
      "max-params": "off",
      "max-statements": "off",
      "no-magic-numbers": "off",
      "react/jsx-boolean-value": "off",
      "react/jsx-no-bind": "off",
      "react/jsx-no-duplicate-props": "off",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "import/order": "off",
      "import/no-unresolved": "error",
      "import/no-extraneous-dependencies": "off",
    },
  },
  // Disable magic numbers rule for utils files (they often contain intentional constants)
  {
    files: ["**/utils/**/*.{ts,tsx}", "**/lib/utils/**/*.{ts,tsx}"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
  // Disable magic numbers rule for API files (API responses often contain hard-coded values)
  {
    files: [
      "**/api-types.ts",
      "**/api.ts",
      "**/api/**/*.{ts,tsx}",
      "**/lib/api*.ts",
    ],
    rules: {
      "no-magic-numbers": "off",
    },
  },
  // Increase function line limit for component files (React components are often longer)
  {
    files: [
      "**/components/**/*.{ts,tsx}",
      "**/pages/**/*.{ts,tsx}",
      "**/*Page.tsx",
      "**/*Component.tsx",
    ],
    rules: {
      "max-lines-per-function": ["warn", 100],
    },
  },
);
