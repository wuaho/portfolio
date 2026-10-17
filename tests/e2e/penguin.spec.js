const { test, expect } = require("@playwright/test");
const { VIEWPORTS, getBox } = require("../support/helpers");

test("penguin switches from idle to spin animation on hover", async ({
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

  await page.mouse.move(
    penguinBox.x + penguinBox.width / 2,
    penguinBox.y + penguinBox.height / 2,
  );

  await expect(idleSprite).toBeHidden();
  await expect(spinSprite).toBeVisible();

  await page.mouse.move(10, 10);
  await expect(idleSprite).toBeVisible();
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
