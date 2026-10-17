const { test, expect } = require("@playwright/test");
const { VIEWPORTS, getBox } = require("../support/helpers");

test("clicking the penguin makes it roll, and clicking again stops it", async ({
  page,
}) => {
  await page.goto("/");

  const penguin = page.locator("[data-penguin]");
  const idleSprite = penguin.locator("[data-penguin-idle]");
  const spinSprite = penguin.locator("[data-penguin-spin]");

  await expect(penguin).toBeVisible();
  await expect(idleSprite).toBeVisible();
  await expect(spinSprite).toBeHidden();

  await page.setViewportSize(VIEWPORTS.desktop);
  const penguinBox = await getBox(penguin);
  expect(penguinBox.width).toBeGreaterThanOrEqual(352);
  expect(penguinBox.height).toBeGreaterThanOrEqual(352);

  // Hovering alone does nothing.
  const hit = penguin.locator("[data-penguin-hit]");
  await hit.hover({ force: true });
  await expect(idleSprite).toBeVisible();

  await hit.click({ force: true });
  await expect(penguin).toHaveAttribute("aria-pressed", "true");
  await expect(idleSprite).toBeHidden();
  await expect(spinSprite).toBeVisible();

  await hit.click({ force: true });
  await expect(penguin).toHaveAttribute("aria-pressed", "false");
  await expect(idleSprite).toBeVisible();
});

test("the penguin's empty box does not block clicks underneath", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto("/");

  const penguin = page.locator("[data-penguin]");
  const box = await getBox(penguin);

  // The top-left corner of the box is empty space, not the penguin.
  await page.mouse.click(box.x + 8, box.y + 8);
  await expect(penguin).toHaveAttribute("aria-pressed", "false");
  const topElement = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest("[data-penguin]"),
    [box.x + 8, box.y + 8],
  );
  expect(topElement).toBeNull();
});

test("the penguin can be started from the keyboard", async ({ page }) => {
  await page.goto("/");

  const penguin = page.locator("[data-penguin]");
  await penguin.focus();
  await page.keyboard.press("Enter");
  await expect(penguin).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(penguin).toHaveAttribute("aria-pressed", "false");
});

test("the penguin rolls without music while sound is muted", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__audioContexts = 0;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor() {
        super();
        window.__audioContexts += 1;
      }
    };
    localStorage.setItem("juanjo-sound", "off");
  });
  await page.goto("/");

  const penguin = page.locator("[data-penguin]");
  await penguin.locator("[data-penguin-hit]").click({ force: true });
  await expect(penguin).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__audioContexts)).toBe(0);
});

test("penguin assets load", async ({ page }) => {
  await page.goto("/");

  const images = page.locator("[data-penguin] img");
  await expect(images).toHaveCount(2);

  for (const image of await images.all()) {
    await expect
      .poll(() => image.evaluate((element) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("penguin stands on an ice block in the bottom-right corner", async ({
  page,
}) => {
  await page.goto("/");

  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.mobile]) {
    await page.setViewportSize(viewport);

    const penguinBox = await getBox(page.locator("[data-penguin]"));
    const floeBox = await getBox(page.locator(".ice-floe"));
    const penguinCenterX = penguinBox.x + penguinBox.width / 2;
    const penguinFeetY = penguinBox.y + penguinBox.height / 2;

    // The block is centered under the penguin, and the feet land near its top.
    expect(
      Math.abs(floeBox.x + floeBox.width / 2 - penguinCenterX),
    ).toBeLessThan(4);
    expect(Math.abs(floeBox.y - penguinFeetY)).toBeLessThan(
      floeBox.height * 0.3,
    );

    // The penguin hugs the bottom-right corner of the viewport.
    expect(penguinCenterX).toBeGreaterThan(viewport.width - 140);
    expect(penguinFeetY).toBeGreaterThan(viewport.height - 140);
    expect(penguinFeetY).toBeLessThan(viewport.height);
  }
});
