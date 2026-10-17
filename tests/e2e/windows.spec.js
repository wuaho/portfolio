const { test, expect } = require("@playwright/test");
const { VIEWPORTS, openWindow } = require("../support/helpers");

const WINDOW_IDS = ["about", "experience", "projects", "more", "contact"];

test("every navigation link opens its window and updates the hash", async ({
  page,
}) => {
  await page.goto("/");

  for (const id of WINDOW_IDS) {
    const link = page.locator(`[data-window-target="${id}"]`);
    const panel = await openWindow(page, id);

    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(panel).toHaveAttribute("role", "dialog");
    await expect(link).toHaveAttribute("aria-expanded", "true");
    await expect(panel.locator(".window-close")).toBeFocused();

    await panel.locator(".window-close").click();
    await expect(panel).toBeHidden();
    await expect(link).toHaveAttribute("aria-expanded", "false");
    await expect(link).toBeFocused();
  }
});

test("a URL hash deep links to its window", async ({ page }) => {
  await page.goto("/#projects");

  await expect(page.locator('[data-window="projects"]')).toBeVisible();
  await expect(page.locator('[data-window-target="projects"]')).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("an unknown hash leaves every window closed", async ({ page }) => {
  await page.goto("/#does-not-exist");

  await expect(page.locator("[data-window]:visible")).toHaveCount(0);
});

test("Escape closes the window and clears the hash", async ({ page }) => {
  await page.goto("/");
  const panel = await openWindow(page, "about");

  await page.keyboard.press("Escape");

  await expect(panel).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});

test("clicking outside a desktop window does not close it", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await openWindow(page, "about");

  await page.setViewportSize(VIEWPORTS.desktop);
  await page.mouse.click(10, 890);

  await expect(panel).toBeVisible();
});

test("browser back closes the window and forward reopens it", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await openWindow(page, "experience");

  await page.goBack();
  await expect(panel).toBeHidden();

  await page.goForward();
  await expect(panel).toBeVisible();
});

test("opening another window replaces the active one on mobile", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto("/#about");
  await expect(page.locator('[data-window="about"]')).toBeVisible();
  await expect(page.locator('[data-window="about"]')).toHaveAttribute(
    "aria-modal",
    "true",
  );

  await page.evaluate(() => {
    window.location.hash = "contact";
  });

  await expect(page.locator('[data-window="contact"]')).toBeVisible();
  await expect(page.locator('[data-window="about"]')).toBeHidden();
});

test("Tab keeps focus trapped inside the open window on mobile", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto("/");
  const panel = await openWindow(page, "contact");
  const focusable = panel.locator("a[href], button");
  const count = await focusable.count();

  await expect(focusable.first()).toBeFocused();

  for (let index = 0; index < count; index += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(focusable.first()).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(focusable.last()).toBeFocused();
});
