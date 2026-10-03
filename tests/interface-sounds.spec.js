const { test, expect } = require("@playwright/test");

test("interface sound toggle persists the mute preference", async ({
  page,
}) => {
  await page.goto("/");

  const soundToggle = page.locator("[data-sound-toggle]");
  const soundLabel = page.locator("[data-sound-label]");

  await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
  await expect(soundLabel).toHaveText("sound on");

  await soundToggle.click();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "false");
  await expect(soundLabel).toHaveText("sound off");

  await page.reload();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "false");
  await expect(soundLabel).toHaveText("sound off");
});
