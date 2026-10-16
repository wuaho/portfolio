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
