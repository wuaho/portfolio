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

test("top and bottom chrome only keep the sound control", async ({ page }) => {
  await page.goto("/");

  const topbar = page.locator(".topbar");

  await expect(topbar.locator("[data-sound-toggle]")).toBeVisible();
  await expect(topbar.locator(".topbar-mark")).toHaveCount(0);
  await expect(topbar.locator(".topbar-note")).toHaveCount(0);
  await expect(topbar.locator(":scope > span")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
});

test("re-enabling sound plays the window-open chime", async ({ page }) => {
  await page.addInitScript(() => {
    window.__soundFrequencies = [];

    class FakeAudioContext {
      constructor() {
        this.currentTime = 0;
        this.destination = {};
        this.state = "running";
      }

      createGain() {
        return {
          connect() {},
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
        };
      }

      createOscillator() {
        return {
          connect() {},
          frequency: {
            setValueAtTime(value) {
              window.__soundFrequencies.push(value);
            },
          },
          start() {},
          stop() {},
        };
      }

      resume() {}
    }

    window.AudioContext = FakeAudioContext;
  });

  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("juanjo-sound"));
  await page.reload();

  const soundToggle = page.locator("[data-sound-toggle]");

  await soundToggle.click();
  expect(await page.evaluate(() => window.__soundFrequencies)).toEqual([]);

  await soundToggle.click();
  expect(await page.evaluate(() => window.__soundFrequencies)).toEqual([
    523.25, 659.25, 783.99,
  ]);
});
