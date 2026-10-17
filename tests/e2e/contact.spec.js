const { test, expect } = require("@playwright/test");
const { openWindow } = require("../support/helpers");

test("contact window contains the LinkedIn, GitHub, X, and blog links", async ({
  page,
}) => {
  await page.goto("/");
  const contactWindow = await openWindow(page, "contact");

  for (const href of [
    "https://linkedin.com/in/juanjorequena",
    "https://github.com/wuaho",
    "https://x.com/wuaho22",
    "https://blog.juanjorequena.com/",
  ]) {
    await expect(contactWindow.locator(`a[href="${href}"]`)).toBeVisible();
  }
  await expect(
    contactWindow.getByText("hashnode", { exact: true }),
  ).toBeVisible();
});

test("external links open in a new tab without an opener", async ({ page }) => {
  await page.goto("/");

  const externalLinks = page.locator('a[href^="http"]');
  expect(await externalLinks.count()).toBeGreaterThan(0);

  for (const link of await externalLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});
