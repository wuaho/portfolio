const { test, expect } = require("@playwright/test");

test("contact window contains the LinkedIn, GitHub, and blog links", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-window-target="contact"]').click();

  const contactWindow = page.locator('[data-window="contact"]');

  await expect(contactWindow).toBeVisible();
  await expect(
    contactWindow.locator('a[href="https://linkedin.com/in/juanjorequena"]'),
  ).toBeVisible();
  await expect(
    contactWindow.locator('a[href="https://github.com/wuaho"]'),
  ).toBeVisible();
  await expect(
    contactWindow.locator('a[href="https://blog.juanjorequena.com/"]'),
  ).toBeVisible();
  await expect(contactWindow.getByText("Blog", { exact: true })).toBeVisible();
});
