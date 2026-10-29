import { defineConfig, devices } from '@playwright/test';

/**
 * Protocolo de testes da Bíblia Sagrada — veja TESTES.md.
 *
 * - Usa o Google Chrome instalado no computador (channel: 'chrome'): nada para baixar.
 * - Reaproveita o `ng serve` se ele já estiver rodando na porta 4200.
 * - PROD=1 testa o build de produção (offline/PWA) servido na porta 4400.
 */
const prod = !!process.env['PROD'];
const baseURL = prod ? 'http://localhost:4400' : 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { outputFolder: 'e2e-relatorio', open: 'never' }]],
  outputDir: 'e2e-resultados',
  use: {
    baseURL,
    channel: 'chrome',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // O trace já guarda capturas de cada passo (vídeo exigiria baixar o ffmpeg)
    video: 'off',
  },
  projects: [
    // Testes de lógica (sem navegador): leitor de referências e importação da revista
    { name: 'logica', testMatch: /logica\/.*\.spec\.ts/ },
    {
      name: 'celular',
      testIgnore: /logica\/|offline\.spec/,
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
    {
      name: 'computador',
      testIgnore: /logica\/|offline\.spec/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1366, height: 860 } },
    },
    ...(prod ? [{ name: 'producao', testMatch: /offline\.spec/, use: { ...devices['Pixel 7'], channel: 'chrome' } }] : []),
  ],
  // SO_LOGICA=1: só os testes de lógica, que não abrem o app (usado no CI antes de publicar)
  webServer: process.env['SO_LOGICA']
    ? undefined
    : prod
    ?{ command: 'npx ng build && node e2e/servir-build.mjs 4400', url: baseURL, reuseExistingServer: true, timeout: 300_000 }
    : { command: 'npx ng serve --port 4200', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
