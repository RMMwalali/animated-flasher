import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3100)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL, trace: 'off', reducedMotion: 'reduce' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}) } },
    { name: 'phone', use: { ...devices['Pixel 7'], ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}) } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: `pnpm start --port ${PORT}`, url: baseURL, reuseExistingServer: true, timeout: 120_000 },
})
