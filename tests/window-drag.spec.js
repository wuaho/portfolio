const { test, expect } = require("@playwright/test");

async function getStableBoundingBox(locator) {
  let previousPosition = "";

  await expect
    .poll(
      async () => {
        const box = await locator.boundingBox();
        if (!box) return "missing";

        const position = [box.x, box.y, box.width, box.height]
          .map((value) => Math.round(value))
          .join(":");
        const isStable = position === previousPosition;
        previousPosition = position;

        return isStable ? position : "moving";
      },
      { intervals: [50, 100, 200], timeout: 1000 },
    )
    .not.toBe("moving");

  return locator.boundingBox();
}

test("desktop experience window can be dragged from its title bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await page.locator('[data-window-target="experience"]').click();

  const windowPanel = page.locator('[data-window="experience"]');
  await expect(windowPanel).toBeVisible();

  const initialPosition = await getStableBoundingBox(windowPanel);
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

  const finalPosition = await getStableBoundingBox(windowPanel);

  expect(finalPosition).not.toBeNull();
  if (!finalPosition) return;

  expect(finalPosition.x).toBeGreaterThan(initialPosition.x + 100);
  expect(finalPosition.y).toBeGreaterThan(initialPosition.y + 50);
  expect(finalPosition.x + finalPosition.width).toBeLessThanOrEqual(1280);
  expect(finalPosition.y + finalPosition.height).toBeLessThanOrEqual(900);
});

test("mobile experience window stays full-screen and does not drag", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('[data-window-target="experience"]').click();

  const windowPanel = page.locator('[data-window="experience"]');
  const titleBar = windowPanel.locator(".window-chrome");
  const initialPosition = await getStableBoundingBox(windowPanel);
  const titleBarPosition = await titleBar.boundingBox();

  expect(initialPosition).not.toBeNull();
  expect(titleBarPosition).not.toBeNull();

  if (!initialPosition || !titleBarPosition) return;

  const startX = titleBarPosition.x + titleBarPosition.width / 2;
  const startY = titleBarPosition.y + titleBarPosition.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 100, startY + 100, { steps: 4 });
  await page.mouse.up();

  const finalPosition = await getStableBoundingBox(windowPanel);

  expect(finalPosition).not.toBeNull();
  if (!finalPosition || !initialPosition) return;

  expect(finalPosition.x).toBeCloseTo(initialPosition.x, 0);
  expect(finalPosition.y).toBeCloseTo(initialPosition.y, 0);
  expect(finalPosition.x).toBeCloseTo(0, 0);
  expect(finalPosition.y).toBeCloseTo(0, 0);
  expect(finalPosition.width).toBeCloseTo(390, 0);
  expect(finalPosition.height).toBeCloseTo(844, 0);
});
