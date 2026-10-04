const { test, expect } = require("@playwright/test");

test("interface sound toggle persists the mute preference", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("juanjo-sound"));
  await page.reload();

  const soundToggle = page.locator("[data-sound-toggle]");
  const soundIconOn = page.locator('[data-sound-icon="on"]');
  const soundIconOff = page.locator('[data-sound-icon="off"]');

  await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
  await expect(soundToggle).toHaveAttribute(
    "aria-label",
    "Mute interface sounds",
  );
  await expect(soundIconOn).toBeVisible();
  await expect(soundIconOff).toBeHidden();

  await soundToggle.click();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "false");
  await expect(soundToggle).toHaveAttribute(
    "aria-label",
    "Enable interface sounds",
  );
  await expect(soundIconOn).toBeHidden();
  await expect(soundIconOff).toBeVisible();

  await soundToggle.click();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
  await expect(soundToggle).toHaveAttribute(
    "aria-label",
    "Mute interface sounds",
  );
  await expect(soundIconOn).toBeVisible();
  await expect(soundIconOff).toBeHidden();

  await soundToggle.click();
  await page.reload();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "false");
  await expect(soundIconOn).toBeHidden();
  await expect(soundIconOff).toBeVisible();
});
