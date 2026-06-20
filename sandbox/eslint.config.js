import eslintConfigPrettier from "eslint-config-prettier/flat"
import withNuxt from "./.nuxt/eslint.config.mjs"

const config = withNuxt([
  { rules: { "vue/attributes-order": ["warn", { alphabetical: true }] } }
]).append(eslintConfigPrettier)

export default config
