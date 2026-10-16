const { test, expect } = require("@playwright/test");
const {
  VIEWPORTS,
  dragBy,
  getBox,
  getStableBoundingBox,
  openWindow,
} = require("../support/helpers");

test.describe("desktop windows", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/");
  });

  test("can be dragged from the title bar", async ({ page }) => {
    const panel = await openWindow(page, "experience");
    const initial = await getStableBoundingBox(panel);

    await dragBy(page, panel.locator(".window-chrome"), 180, 110);

    const final = await getStableBoundingBox(panel);
    expect(final.x).toBeGreaterThan(initial.x + 100);
    expect(final.y).toBeGreaterThan(initial.y + 50);
    expect(final.x + final.width).toBeLessThanOrEqual(VIEWPORTS.desktop.width);
    expect(final.y + final.height).toBeLessThanOrEqual(
      VIEWPORTS.desktop.height,
    );
  });

  test("stay inside the viewport when dragged past the edge", async ({
    page,
  }) => {
    const panel = await openWindow(page, "experience");
    await getStableBoundingBox(panel);

    await dragBy(page, panel.locator(".window-chrome"), -2000, -2000);

    const final = await getStableBoundingBox(panel);
    expect(final.x).toBeCloseTo(0, 0);
    expect(final.y).toBeCloseTo(0, 0);
  });

  test("do not move when the title bar is only clicked", async ({ page }) => {
    const panel = await openWindow(page, "experience");
    const initial = await getStableBoundingBox(panel);
    const titleBar = await getBox(panel.locator(".window-chrome"));

    await page.mouse.click(
      titleBar.x + titleBar.width / 2,
      titleBar.y + titleBar.height / 2,
    );

    await expect(panel).toBeVisible();
    const final = await getStableBoundingBox(panel);
    expect(final.x).toBeCloseTo(initial.x, 0);
    expect(final.y).toBeCloseTo(initial.y, 0);
  });

  test("close from the dragged position and reopen centered", async ({
    page,
  }) => {
    const panel = await openWindow(page, "experience");
    const initial = await getStableBoundingBox(panel);

    await dragBy(page, panel.locator(".window-chrome"), 180, 110);
    const dragged = await getStableBoundingBox(panel);

    await panel.locator(".window-close").click();
    await page.waitForTimeout(100);

    const closing = await getBox(panel);
    expect(closing.x).toBeCloseTo(dragged.x, 0);
    expect(closing.y).toBeCloseTo(dragged.y, 0);
    await expect(panel).toBeHidden();

    await openWindow(page, "experience");
    const reopened = await getStableBoundingBox(panel);
    expect(reopened.x).toBeCloseTo(initial.x, 0);
    expect(reopened.y).toBeCloseTo(initial.y, 0);
  });
});

test("mobile windows stay full-screen and do not drag", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto("/");

  const panel = await openWindow(page, "experience");
  const initial = await getStableBoundingBox(panel);

  await dragBy(page, panel.locator(".window-chrome"), 100, 100, 4);

  const final = await getStableBoundingBox(panel);
  expect(final.x).toBeCloseTo(initial.x, 0);
  expect(final.y).toBeCloseTo(initial.y, 0);
  expect(final.x).toBeCloseTo(0, 0);
  expect(final.y).toBeCloseTo(0, 0);
  expect(final.width).toBeCloseTo(VIEWPORTS.mobile.width, 0);
  expect(final.height).toBeCloseTo(VIEWPORTS.mobile.height, 0);
});
