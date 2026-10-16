const { test, expect } = require("@playwright/test");
const { installFakeAudio, openWindow } = require("../support/helpers");

const OPEN_CUE = [523.25, 659.25, 783.99];
const CLOSE_CUE = [783.99, 659.25, 523.25];

const getFrequencies = (page) => page.evaluate(() => window.__soundFrequencies);

test.beforeEach(async ({ page }) => {
  await installFakeAudio(page);
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("juanjo-sound"));
  await page.reload();
});

test("sound toggle persists the mute preference", async ({ page }) => {
  const soundToggle = page.locator("[data-sound-toggle]");
  const soundIconOn = page.locator('[data-sound-icon="on"]');
  const soundIconOff = page.locator('[data-sound-icon="off"]');

  async function expectEnabled(enabled) {
    await expect(soundToggle).toHaveAttribute("aria-pressed", String(enabled));
    await expect(soundToggle).toHaveAttribute(
      "aria-label",
      enabled ? "Mute interface sounds" : "Enable interface sounds",
    );
    await expect(soundIconOn).toBeVisible({ visible: enabled });
    await expect(soundIconOff).toBeVisible({ visible: !enabled });
  }

  await expectEnabled(true);

  await soundToggle.click();
  await expectEnabled(false);

  await soundToggle.click();
  await expectEnabled(true);

  await soundToggle.click();
  await page.reload();
  await expectEnabled(false);
});

test("re-enabling sound plays the window-open chime", async ({ page }) => {
  const soundToggle = page.locator("[data-sound-toggle]");

  await soundToggle.click();
  expect(await getFrequencies(page)).toEqual([]);

  await soundToggle.click();
  expect(await getFrequencies(page)).toEqual(OPEN_CUE);
  expect(await page.evaluate(() => window.__soundPeak)).toBeCloseTo(0.084);
});

test("opening and closing a window play their cues", async ({ page }) => {
  const panel = await openWindow(page, "about");
  expect(await getFrequencies(page)).toEqual(OPEN_CUE);

  await panel.locator(".window-close").click();
  expect(await getFrequencies(page)).toEqual([...OPEN_CUE, ...CLOSE_CUE]);
});

test("muted windows stay silent", async ({ page }) => {
  await page.locator("[data-sound-toggle]").click();
  const panel = await openWindow(page, "about");
  await panel.locator(".window-close").click();

  expect(await getFrequencies(page)).toEqual([]);
});

test("deep links and history navigation stay silent", async ({ page }) => {
  await page.goto("/#about");
  await expect(page.locator('[data-window="about"]')).toBeVisible();
  await page.evaluate(() => {
    window.location.hash = "";
  });
  await expect(page.locator('[data-window="about"]')).toBeHidden();

  expect(await getFrequencies(page)).toEqual([]);
});
