const { test, expect } = require("@playwright/test");

test("desktop experience window can be dragged from its title bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await page.locator('[data-window-target="experience"]').click();

  const windowPanel = page.locator('[data-window="experience"]');
  await expect(windowPanel).toBeVisible();

  const initialPosition = await windowPanel.boundingBox();
  const titleBar = windowPanel.locator(".window-chrome");
  const titleBarPosition = await titleBar.boundingBox();

  expect(initialPosition).not.toBeNull();
  expect(titleBarPosition).not.toBeNull();

  if (!initialPosition || !titleBarPosition) return;

  const startX = titleBarPosition.x + titleBarPosition.width / 2;
  const startY = titleBarPosition.y + titleBarPosition.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 180, startY + 110, { steps: 8 });
  await page.mouse.up();

  const finalPosition = await windowPanel.boundingBox();

  expect(finalPosition).not.toBeNull();
  if (!finalPosition) return;

  expect(finalPosition.x).toBeGreaterThan(initialPosition.x + 100);
  expect(finalPosition.y).toBeGreaterThan(initialPosition.y + 50);
});
