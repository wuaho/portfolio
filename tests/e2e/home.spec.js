const { test, expect } = require("@playwright/test");
const { VIEWPORTS, getBox } = require("../support/helpers");

test("top and bottom chrome only keep the sound control", async ({ page }) => {
  await page.goto("/");

  const topbar = page.locator(".topbar");
  const soundButton = topbar.locator("[data-sound-toggle]");

  await expect(soundButton).toBeVisible();
  await expect(topbar.locator(".topbar-mark")).toHaveCount(0);
  await expect(topbar.locator(".topbar-note")).toHaveCount(0);
  await expect(topbar.locator(":scope > span")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.locator(".hero-kicker")).toHaveCount(0);

  const soundButtonBox = await getBox(soundButton);
  expect(soundButtonBox.x).toBeLessThan(640);
  expect(soundButtonBox.width).toBeGreaterThanOrEqual(42);
});

test("landing content is wrapped in the home operating system window", async ({
  page,
}) => {
  await page.goto("/");

  const homeWindow = page.locator(".home-window");
  const title = homeWindow.locator("#hero-title");
  const name = homeWindow.locator(".hero-title-name");
  const subline = homeWindow.locator(".hero-subline");

  await expect(homeWindow.locator(".home-window-title")).toHaveText("home");
  await expect(title).toHaveText("hi! i'm juanjo");
  await expect(homeWindow.locator(".hero-title-greeting")).toHaveCSS(
    "font-weight",
    "300",
  );
  await expect(name).toHaveText("i'm juanjo");
  await expect(name).toHaveCSS("font-weight", "500");
  await expect(name).toHaveCSS("color", "rgb(236, 120, 100)");
  await expect(subline).toHaveText("software engineer");
  await expect(homeWindow.locator(".section-nav")).toBeVisible();
  await expect(page.locator(".topbar [data-sound-toggle]")).toBeVisible();

  const titleBox = await getBox(title);
  const sublineBox = await getBox(subline);
  expect(sublineBox.y).toBeGreaterThanOrEqual(
    titleBox.y + titleBox.height + 16,
  );

  await page.setViewportSize(VIEWPORTS.desktop);
  const homeWindowBox = await getBox(homeWindow);
  expect(homeWindowBox.width).toBeLessThanOrEqual(820);
  expect(
    Math.abs(
      homeWindowBox.x + homeWindowBox.width / 2 - VIEWPORTS.desktop.width / 2,
    ),
  ).toBeLessThanOrEqual(2);
  expect(homeWindowBox.y).toBeGreaterThanOrEqual(100);
});

test("mobile greeting and description each fit on one line", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto("/");

  for (const selector of ["#hero-title", ".hero-subline"]) {
    const metrics = await page.locator(selector).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: parseFloat(style.lineHeight),
        overflows: element.scrollWidth > element.clientWidth,
      };
    });
    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.2);
    expect(metrics.overflows).toBe(false);
  }

  const iconTile = page.locator(".section-nav-icon").first();
  await expect(iconTile).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("page loads without console errors or failed requests", async ({
  page,
}) => {
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });

  expect(problems).toEqual([]);
});
