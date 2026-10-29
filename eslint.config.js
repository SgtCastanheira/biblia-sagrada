// @ts-check
// Linter (npm run lint). Regras recomendadas do TypeScript e do Angular, mais as de acessibilidade dos templates.
// Uma exceção pontual vai com comentário explicando por quê, logo acima da linha.
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // `const { apagado: _, ...resto } = obj` é o jeito de tirar uma chave sem mudar o objeto
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Os controles do Angular Material também contam como campo de um <label>
      "@angular-eslint/template/label-has-associated-control": [
        "error",
        { controlComponents: ["mat-slide-toggle", "mat-checkbox", "mat-select", "mat-radio-button"] },
      ],
    },
  }
]);
