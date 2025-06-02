import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import "eslint-plugin-import";

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
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: "eslint-plugin-import",
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Suppress defaultProps deprecation warnings from Recharts
      "react/no-deprecated": "off",
      "react/default-props-match-prop-types": "off",
      "no-unused-expressions": "warn",
      "no-console": "warn",
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
      complexity: ["warn", 10],
      "max-lines": ["warn", 500],
      "max-lines-per-function": ["warn", 50],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
      "max-statements": ["warn", 20],
      "no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-no-bind": ["warn", { allowArrowFunctions: true }],
      "react/jsx-no-duplicate-props": "warn",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-react": "warn",
      "react/jsx-uses-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
      "import/no-unresolved": "error",
      "import/no-extraneous-dependencies": "warn",
    },
  },
);
