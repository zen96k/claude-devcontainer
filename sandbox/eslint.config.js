import eslintConfigPrettier from "eslint-config-prettier/flat"
import withNuxt from "./.nuxt/eslint.config.mjs"

const config = withNuxt([
  {
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      "@typescript-eslint/return-await": ["error", "always"],
      "arrow-body-style": ["error", "always"],
      curly: "error",
      "vue/attributes-order": ["error", { alphabetical: true }]
    }
  }
]).append(eslintConfigPrettier)

export default config
