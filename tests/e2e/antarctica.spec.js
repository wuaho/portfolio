const { test, expect } = require("@playwright/test");
const { VIEWPORTS, getBox } = require("../support/helpers");

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`${name}: sea band is ${name === "desktop" ? 35 : 30}% of the viewport height`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const sea = await getBox(page.locator(".sea"));

    expect(sea.height / viewport.height).toBeCloseTo(
      name === "desktop" ? 0.35 : 0.3,
      2,
    );
    expect(sea.y + sea.height).toBeCloseTo(viewport.height, 0);
  });
}

test("desktop: sea band rises behind the home window", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto("/");

  const sea = await getBox(page.locator(".sea"));
  const home = await getBox(page.locator(".home-window"));

  expect(sea.y).toBeGreaterThan(home.y);
  expect(sea.y).toBeLessThan(home.y + home.height);
});
