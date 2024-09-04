/* eslint-disable no-magic-numbers */
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    rules: {
      indent: ["error", 2],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-trailing-spaces": "error",
      "brace-style": ["error", "1tbs"],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      "no-debugger": "error",
      "no-undef": "error",
      "no-unused-expressions": "error",
      "no-redeclare": "error",
      "no-magic-numbers": [
        "warn",
        { ignore: [0, 1], ignoreArrayIndexes: true },
      ],
      complexity: ["warn", { max: 10 }],
      "max-params": ["warn", 3],
      "no-else-return": "warn",
      "no-useless-escape": "error",
    },
  },
];
