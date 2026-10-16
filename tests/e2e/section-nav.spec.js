const { test, expect } = require("@playwright/test");
const { getBox } = require("../support/helpers");

const NAV_ITEMS = [
  { id: "about", label: "about", icon: "about.svg" },
  { id: "experience", label: "work", icon: "work.svg" },
  { id: "projects", label: "projects", icon: "projects.svg" },
  { id: "more", label: "more", icon: "extra.svg" },
  { id: "contact", label: "contact", icon: "contact.svg" },
];

test("section navigation shows one icon tile per window", async ({ page }) => {
  await page.goto("/");

  const nav = page.locator(".section-nav");

  await expect(nav.locator("[data-window-target]")).toHaveCount(
    NAV_ITEMS.length,
  );
  await expect(nav.locator(".section-nav-icon img")).toHaveCount(
    NAV_ITEMS.length,
  );

  for (const { id, label, icon } of NAV_ITEMS) {
    const item = nav.locator(`[data-window-target="${id}"]`);
    await expect(item).toHaveAttribute("href", `#${id}`);
    await expect(item.locator(`img[src="assets/icons/${icon}"]`)).toHaveCount(
      1,
    );
    await expect(item.getByText(label, { exact: true })).toBeVisible();
    await expect(item.getByText(label, { exact: true })).toHaveCSS(
      "color",
      "rgb(116, 109, 98)",
    );
  }

  const workIconBox = await getBox(
    nav.locator('img[src="assets/icons/work.svg"]'),
  );
  expect(workIconBox.width).toBeGreaterThanOrEqual(56);
});

test("section navigation icons scale from the bottom on hover", async ({
  page,
}) => {
  await page.goto("/");

  const nav = page.locator(".section-nav");
  const projectsIcon = nav.locator(
    '[data-window-target="projects"] .section-nav-icon',
  );
  const geometry = await projectsIcon.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const origin = getComputedStyle(element).transformOrigin.split(" ");
    return {
      originX: parseFloat(origin[0]),
      originY: parseFloat(origin[1]),
      width: bounds.width,
      height: bounds.height,
    };
  });
  expect(geometry.originX).toBeCloseTo(geometry.width / 2, 0);
  expect(geometry.originY).toBeCloseTo(geometry.height, 0);
  await expect(projectsIcon).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.34, 1.56, 0.64, 1)",
  );

  const about = nav.locator('[data-window-target="about"]');
  const aboutIcon = about.locator(".section-nav-icon");
  const getTransform = () =>
    aboutIcon.evaluate((element) => getComputedStyle(element).transform);
  const initialTransform = await getTransform();

  await about.hover();

  await expect(about).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(about).toHaveCSS("color", "rgb(116, 109, 98)");
  const iconFilter = await about
    .locator(".section-nav-icon img")
    .evaluate((element) => getComputedStyle(element).filter);
  expect(iconFilter).not.toContain("drop-shadow");
  await expect.poll(getTransform).not.toBe(initialTransform);
});
