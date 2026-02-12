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
      "no-unused-expressions": "warn",
      // Allow console.error and console.warn for production error tracking
      // but warn on console.log and other console methods
      "no-console": [
        "warn",
        {
          allow: ["error", "warn"],
        },
      ],
      "no-duplicate-imports": "warn",
      "no-unreachable": "warn",
      "no-unused-labels": "warn",

      // Mimic Typescripts noUnusedLocals and noUnusedParameters behaviour
      // https://typescript-eslint.io/rules/no-unused-vars/#what-benefits-does-this-rule-have-over-typescript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Refactor hints: high enough to flag real problems, not so low they hide other warnings
      // complexity 15 = flag very complex logic (e.g. 20+); 10 was ~62 warnings, mostly 11–14
      complexity: ["warn", 15],
      // max-lines 500 = only a few files exceed; keeps signal for very long files
      "max-lines": ["warn", 500],
      // 80 lines default = flag long hooks/utils; 50 was noisy. Components get 200 below.
      "max-lines-per-function": ["warn", 80],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
      // 30 statements = flag very branchy/long functions; 20 triggered on many 23–26 line functions
      "max-statements": ["warn", 30],
      // Temporarily disabled - too many warnings hiding more valuable issues
      "no-magic-numbers": "off",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-no-bind": ["warn", { allowArrowFunctions: true }],
      "react/jsx-no-duplicate-props": "warn",
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
  // Also disable max-lines for api-types.ts since it's auto-generated from the API
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
  {
    files: ["**/api-types.ts"],
    rules: {
      "max-lines": "off",
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
      "max-lines-per-function": ["warn", 200],
    },
  },
  // Scripts and tests: relax refactor metrics so they don't hide more important warnings
  {
    files: [
      "scripts/**/*.{ts,js}",
      "**/*.test.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
    ],
    rules: {
      complexity: "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
    },
  },
  // Allow console in scripts and build-only lib (intentional CLI/build output)
  {
    files: ["scripts/**/*.{ts,js}", "src/lib/sitemap-generator.ts"],
    rules: {
      "no-console": "off",
    },
  },
);
