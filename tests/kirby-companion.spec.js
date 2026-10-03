const { test, expect } = require("@playwright/test");

test("Kirby companion dances when clicked", async ({ page }) => {
  await page.goto("/");

  const kirby = page.locator("[data-kirby]");

  await expect(kirby).toBeVisible();
  await expect(kirby).not.toHaveClass(/is-dancing/);

  await kirby.click();
  await expect(kirby).toHaveClass(/is-dancing/);
  await expect(kirby).toHaveAttribute("aria-label", "Make Kirby dance");
});

test("Kirby companion keeps working when interface sounds are muted", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator("[data-sound-toggle]").click();
  const kirby = page.locator("[data-kirby]");

  await kirby.click();
  await expect(kirby).toHaveClass(/is-dancing/);
});
