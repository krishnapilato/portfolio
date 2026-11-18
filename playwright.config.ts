import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the production build, served exactly as GitHub Pages serves it: under /portfolio/.
const port = 4322;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: 0,
  reporter: process.env["CI"] ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${port}/portfolio/`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx astro preview --port ${port}`,
    url: `http://localhost:${port}/portfolio/`,
    reuseExistingServer: !process.env["CI"],
  },
});
