import solid from "eslint-plugin-solid";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: {
      solid,
    },
    rules: {
      ...solid.configs.recommended.rules,
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
