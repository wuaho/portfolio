const { test, expect } = require("@playwright/test");
const {
  VIEWPORTS,
  getStableBoundingBox,
  openWindow,
} = require("../support/helpers");

test.describe("desktop multi-window", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/");
  });

  test("several windows stay open without a blurred backdrop", async ({
    page,
  }) => {
    const about = await openWindow(page, "about");
    const contact = await openWindow(page, "contact");

    await expect(about).toBeVisible();
    await expect(contact).toBeVisible();
    await expect(page.locator("[data-window-backdrop]")).toBeHidden();
    await expect(about).toHaveAttribute("aria-modal", "false");
    await expect(page.locator("body")).not.toHaveClass(/window-open/);
    for (const id of ["about", "contact"]) {
      await expect(
        page.locator(`[data-window-target="${id}"]`),
      ).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("new windows open away from the existing ones", async ({ page }) => {
    const about = await openWindow(page, "about");
    const aboutBox = await getStableBoundingBox(about);
    const contact = await openWindow(page, "contact");
    await page.waitForTimeout(400);
    const contactBox = await getStableBoundingBox(contact);

    const overlapX =
      Math.min(aboutBox.x + aboutBox.width, contactBox.x + contactBox.width) -
      Math.max(aboutBox.x, contactBox.x);
    const overlapY =
      Math.min(aboutBox.y + aboutBox.height, contactBox.y + contactBox.height) -
      Math.max(aboutBox.y, contactBox.y);

    // Windows are large, so some overlap is fine, but a new window must not
    // stack on top of the existing one.
    const overlap = Math.max(0, overlapX) * Math.max(0, overlapY);
    expect(overlap).toBeLessThan(contactBox.width * contactBox.height * 0.6);
    expect(contactBox.x).toBeGreaterThanOrEqual(0);
    expect(contactBox.x + contactBox.width).toBeLessThanOrEqual(
      VIEWPORTS.desktop.width,
    );
    expect(contactBox.y + contactBox.height).toBeLessThanOrEqual(
      VIEWPORTS.desktop.height,
    );
  });

  test("clicking a window brings it to the front", async ({ page }) => {
    const about = await openWindow(page, "about");
    const experience = await openWindow(page, "experience");
    const zIndex = (panel) =>
      panel.evaluate((node) => Number(getComputedStyle(node).zIndex));

    expect(await zIndex(experience)).toBeGreaterThan(await zIndex(about));

    await about.locator(".window-chrome").click({ position: { x: 20, y: 10 } });

    expect(await zIndex(about)).toBeGreaterThan(await zIndex(experience));
    await expect(page).toHaveURL(/#about$/);
  });

  test("closing one window leaves the others open", async ({ page }) => {
    const about = await openWindow(page, "about");
    const contact = await openWindow(page, "contact");

    await contact.locator(".window-close").click();

    await expect(contact).toBeHidden();
    await expect(about).toBeVisible();
    await expect(page).toHaveURL(/#about$/);
    await expect(
      page.locator('[data-window-target="contact"]'),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes only the top window", async ({ page }) => {
    const about = await openWindow(page, "about");
    const contact = await openWindow(page, "contact");

    await page.keyboard.press("Escape");

    await expect(contact).toBeHidden();
    await expect(about).toBeVisible();
  });

  test("the home navigation stays usable while windows are open", async ({
    page,
  }) => {
    await openWindow(page, "about");
    await openWindow(page, "contact");

    await page.locator('[data-window-target="about"]').click();

    await expect(page).toHaveURL(/#about$/);
  });

  test("placed windows animate out from the center of the screen", async ({
    page,
  }) => {
    await openWindow(page, "about");
    const contact = page.locator('[data-window="contact"]');

    // Record the window's center on every frame once it becomes visible.
    await page.evaluate(() => {
      const panel = document.querySelector('[data-window="contact"]');
      window.__centers = [];
      const record = () => {
        if (!panel.hidden) {
          const box = panel.getBoundingClientRect();
          window.__centers.push({
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
          });
        }
        window.requestAnimationFrame(record);
      };
      record();
    });

    await page.locator('[data-window-target="contact"]').click();
    await expect(contact).toBeVisible();
    const finalBox = await getStableBoundingBox(contact);
    const final = {
      x: finalBox.x + finalBox.width / 2,
      y: finalBox.y + finalBox.height / 2,
    };

    const centers = await page.evaluate(() => window.__centers);
    const first = centers[0];
    const screen = {
      x: VIEWPORTS.desktop.width / 2,
      y: VIEWPORTS.desktop.height / 2,
    };
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    // Starts at the screen center, then travels to the final spot.
    expect(distance(first, screen)).toBeLessThan(40);
    expect(distance(final, screen)).toBeGreaterThan(150);
    expect(distance(first, final)).toBeGreaterThan(150);
    // The path is a smooth glide, not a jump: some frame lies in between.
    expect(
      centers.some(
        (point) => distance(point, screen) > 40 && distance(point, final) > 40,
      ),
    ).toBe(true);
  });
});
