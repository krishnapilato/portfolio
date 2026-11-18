import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const CHAPTERS = ["start", "latitudes", "restraint", "judgment", "work", "contact"];
const idle = async (page: Page): Promise<void> => {
  await expect(page.locator("[data-story]")).toHaveAttribute("data-state", "idle");
};
const ready = async (page: Page, path = ""): Promise<void> => {
  await page.goto(path);
  await expect(page.locator("[data-story][data-ready]")).toBeAttached();
  await idle(page);
};
const chapter = async (page: Page, id: string): Promise<void> => {
  await expect(page.locator(`#${id}`)).toHaveAttribute("aria-hidden", "false");
  await idle(page);
  await expect(page.locator(`#${id} h1, #${id} h2`)).toHaveCSS("opacity", "1");
};
const visit = async (page: Page, index: number): Promise<void> => {
  await page.locator(`.chapters [data-go="${index}"]`).click();
  await chapter(page, CHAPTERS[index] ?? "start");
};
const axe = (page: Page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]);

// Errors are observed throughout a complete read, not only during initial loading.
test("reads every chapter without console, request or CSP errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", message => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", error => problems.push(error.message));
  page.on("requestfailed", request => problems.push(request.url()));
  page.on("response", response => { if (response.status() >= 400) problems.push(response.url()); });
  await ready(page);
  for (let index = 0; index < CHAPTERS.length; index++) await visit(page, index);
  expect(problems).toEqual([]);
});

test("has accurate metadata and a single document title", async ({ page }) => {
  await ready(page);
  await expect(page).toHaveTitle("Khova Krishna Pilato — Full Stack Software Engineer");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /^.{50,160}$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://krishnapilato.github.io/portfolio/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Pilato/);
  await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveAttribute("content", /default-src 'none'/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(5);
  await expect(page.locator("header, footer, canvas, svg")).toHaveCount(0);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`all chapters and work panels pass accessibility with a ${colorScheme} system preference`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme });
    await ready(page);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(250, 249, 246)");
    for (let index = 0; index < CHAPTERS.length; index++) {
      await visit(page, index);
      expect((await axe(page).analyze()).violations, CHAPTERS[index]).toEqual([]);
    }
    await visit(page, 4);
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      expect((await axe(page).analyze()).violations, (await tab.textContent()) ?? "Work panel").toEqual([]);
    }
  });
}

test("keyboard navigation and the chapter index agree", async ({ page }) => {
  await ready(page);
  for (const [key, id] of [["ArrowDown", "latitudes"], ["PageDown", "restraint"], [" ", "judgment"]] as const) {
    await page.keyboard.press(key);
    await chapter(page, id);
  }
  await chapter(page, "judgment");
  await expect(page.locator("[data-announce]")).toHaveText("4 of 6: The judgment is still yours.");
  await expect(page.locator('.chapters [aria-current="step"]')).toHaveAttribute("href", "#judgment");
  await page.keyboard.press("Shift+Space");
  await chapter(page, "restraint");
  await page.keyboard.press("ArrowUp");
  await chapter(page, "latitudes");
  await page.keyboard.press("Home");
  await chapter(page, "start");
  await page.keyboard.press("ArrowUp");
  await chapter(page, "start");
  await page.keyboard.press("End");
  await chapter(page, "contact");
  await page.keyboard.press("PageDown");
  await chapter(page, "contact");
  await visit(page, 2);
  await expect(page).toHaveURL(/#restraint$/);
});

test("wheel inertia cannot skip chapters during a transition", async ({ page }, { project }) => {
  test.skip(project.name !== "desktop", "Desktop wheel input.");
  await ready(page);
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, 120);
  await expect(page.locator("[data-story]")).toHaveAttribute("data-state", "transitioning");
  for (let index = 0; index < 8; index++) await page.mouse.wheel(0, 120);
  await chapter(page, "latitudes");
  await page.mouse.wheel(0, -120);
  await chapter(page, "start");
});

test("touch swipe advances one chapter and can go back", async ({ page, context }, { project }) => {
  test.skip(project.name !== "mobile", "Mobile Chromium touch input.");
  await ready(page);
  const session = await context.newCDPSession(page);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Mobile tests require a viewport.");
  const swipe = async (from: number, to: number): Promise<void> => {
    const x = viewport.width / 2;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: viewport.height * from }] });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: viewport.height * (from + (to - from) * step / 8) }] });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  await swipe(.8, .2);
  await chapter(page, "latitudes");
  await expect(page).toHaveURL(/#latitudes$/);
  await swipe(.2, .8);
  await chapter(page, "start");
  await session.detach();
});

test("deep links work and unknown fragments fall back safely", async ({ page }) => {
  await ready(page, "#contact");
  await chapter(page, "contact");
  await expect(page.locator('.chapters [aria-current="step"]')).toHaveAttribute("href", "#contact");
  await ready(page, "#unknown");
  await chapter(page, "start");
});

test("only the active chapter is interactive and focus follows departing content", async ({ page }) => {
  await ready(page, "#contact");
  await expect(page.locator("[data-scene][inert]")).toHaveCount(5);
  await page.getByRole("link", { name: "GitHub", exact: true }).focus();
  await page.keyboard.press("Home");
  await chapter(page, "start");
  await expect(page.locator("h1")).toBeFocused();
});

test("work tabs support arrows without changing chapter", async ({ page }) => {
  await ready(page, "#work");
  const first = page.getByRole("tab", { name: "ATM Milano" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "SEA Vision" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Angular 18");
  await page.keyboard.press("End");
  await expect(page.getByRole("tabpanel")).toContainText("PixelPaper");
  await expect(page.getByRole("link", { name: "BiMap", exact: true })).toHaveAttribute("href", "https://github.com/krishnapilato/bimap");
  await chapter(page, "work");
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
});

test("contact links are safe and copying has an accessible result", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page, "#contact");
  for (const name of ["LinkedIn", "GitHub"]) {
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("rel", "noopener noreferrer");
  }
  await page.getByRole("button", { name: "Copy address" }).click();
  await expect(page.getByRole("status")).toHaveText("Address copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("krishnak.pilato@gmail.com");
});

test("clipboard denial leaves a usable email link", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Denied")) } }); });
  await ready(page, "#contact");
  await page.getByRole("button", { name: "Copy address" }).click();
  await expect(page.getByRole("status")).toContainText("Copy is unavailable");
  await expect(page.locator('a[href^="mailto:"]')).toHaveAttribute("href", "mailto:krishnak.pilato@gmail.com");
});

test("chapter transitions remain animated with reduced motion requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.keyboard.press("End");
  await expect(page.locator("[data-story]")).toHaveAttribute("data-state", "transitioning");
  await chapter(page, "contact");
  await expect(page.locator("#contact h2")).toHaveCSS("filter", "none");
});

for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 640 }, { width: 667, height: 375 }, { width: 800, height: 420 }]) {
  test(`every chapter and work panel fits ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await ready(page);
    const fits = async (): Promise<void> => {
      const bounds = await page.locator('[data-scene][aria-hidden="false"] .statement, [data-scene][aria-hidden="false"] .reading').evaluateAll(elements => elements.map(element => {
        const { top, left, right, bottom } = element.getBoundingClientRect();
        return { top, left, right, bottom };
      }));
      for (const box of bounds) {
        expect(box.top).toBeGreaterThanOrEqual(0);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(viewport.width);
        expect(box.bottom).toBeLessThanOrEqual(viewport.height);
      }
      expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 });
    };
    for (let index = 0; index < CHAPTERS.length; index++) { await visit(page, index); await fits(); }
    await visit(page, 4);
    for (const tab of await page.getByRole("tab").all()) { await tab.click(); await fits(); }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("all chapters, projects and contact details remain readable", async ({ page }) => {
    await page.goto("");
    for (const scene of await page.locator("[data-scene]").all()) {
      await scene.scrollIntoViewIfNeeded();
      await expect(scene).toBeInViewport();
      await expect(scene.getByRole("heading").first()).toBeVisible();
      await expect(scene).not.toHaveAttribute("inert", "");
    }
    await expect(page.locator(".project:visible")).toHaveCount(5);
    await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
  });
});
