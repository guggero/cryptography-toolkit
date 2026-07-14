import {defineConfig, devices} from '@playwright/test';

const PORT = 8947;

// The app serves page templates from source pages/**/*.html when the
// hostname is localhost/127.0.0.1 ("dev"), and from the compiled
// libs/templates.js on any other hostname ("prod") — see index.html.
// Browsers resolve *.localhost to loopback (RFC 6761), so app.localhost
// exercises the prod path without any host mapping.
//
// The full golden-value suite runs on the prod path (that's what is
// deployed); the dev path runs the @smoke subset so template-source
// breakage is still caught while iterating locally.
const DEV_URL = `http://127.0.0.1:${PORT}`;
const PROD_URL = `http://app.localhost:${PORT}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The WASM pages ship an 8.5 MB module; give slow CI runners headroom.
  timeout: 60_000,
  expect: {timeout: 15_000},
  reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-prod',
      use: {...devices['Desktop Chrome'], baseURL: PROD_URL},
    },
    {
      name: 'firefox-prod',
      use: {...devices['Desktop Firefox'], baseURL: PROD_URL},
    },
    {
      name: 'chromium-dev',
      grep: /@smoke/,
      use: {...devices['Desktop Chrome'], baseURL: DEV_URL},
    },
    {
      name: 'firefox-dev',
      grep: /@smoke/,
      use: {...devices['Desktop Firefox'], baseURL: DEV_URL},
    },
  ],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: `${DEV_URL}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});
