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

  const soundButton = topbar.locator("[data-sound-toggle]");
  const soundButtonBox = await soundButton.boundingBox();
  expect(soundButtonBox).not.toBeNull();
  if (!soundButtonBox) return;

  expect(soundButtonBox.x).toBeLessThan(640);
  expect(soundButtonBox.width).toBeGreaterThanOrEqual(42);
  await expect(page.locator(".hero-kicker")).toHaveCount(0);
});

test("landing content is wrapped in the home operating system window", async ({
  page,
}) => {
  await page.goto("/");

  const homeWindow = page.locator(".home-window");

  await expect(homeWindow.locator(".home-window-title")).toHaveText("home");
  await expect(homeWindow.locator("#hero-title")).toHaveText("hi, i'm Juanjo");
  await expect(homeWindow.locator(".hero-kicker")).toHaveCount(0);
  await expect(homeWindow.locator(".hero-subline")).toHaveText(
    "software engineer, good bread lover & kirby fan",
  );
  await expect(homeWindow.locator(".section-nav")).toBeVisible();
  await expect(page.locator(".topbar [data-sound-toggle]")).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  const homeWindowBox = await homeWindow.boundingBox();
  expect(homeWindowBox).not.toBeNull();
  if (!homeWindowBox) return;

  expect(homeWindowBox.width).toBeLessThanOrEqual(820);
  expect(
    Math.abs(homeWindowBox.x + homeWindowBox.width / 2 - 640),
  ).toBeLessThanOrEqual(2);
  expect(homeWindowBox.y).toBeGreaterThanOrEqual(100);

  const heroTitleBox = await homeWindow.locator("#hero-title").boundingBox();
  const topStarBox = await homeWindow
    .locator(".hero-art:not(.left)")
    .boundingBox();
  expect(heroTitleBox).not.toBeNull();
  expect(topStarBox).not.toBeNull();
  if (!heroTitleBox || !topStarBox) return;

  expect(topStarBox.y + topStarBox.height).toBeLessThanOrEqual(
    heroTitleBox.y + 4,
  );
});

test("section navigation uses clickable icon tiles that scale on hover", async ({
  page,
}) => {
  await page.goto("/");

  const nav = page.locator(".section-nav");
  const items = nav.locator("[data-window-target]");

  await expect(items).toHaveCount(5);
  await expect(nav.locator(".section-nav-icon svg")).toHaveCount(5);
  await expect(nav.getByText("about", { exact: true })).toBeVisible();
  await expect(nav.getByText("experience", { exact: true })).toBeVisible();
  await expect(nav.getByText("projects", { exact: true })).toBeVisible();
  await expect(nav.getByText("more", { exact: true })).toBeVisible();
  await expect(nav.getByText("contact", { exact: true })).toBeVisible();

  const about = nav.locator('[data-window-target="about"]');
  const initialTransform = await about.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  await about.hover();

  await expect
    .poll(() =>
      about.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initialTransform);
});

test("penguin switches from idle to spin animation on hover", async ({
  page,
}) => {
  await page.goto("/");

  const penguin = page.locator("[data-penguin]");
  const idleSprite = penguin.locator("[data-penguin-idle]");
  const spinSprite = penguin.locator("[data-penguin-spin]");

  await expect(penguin).toBeVisible();
  await expect(idleSprite).toBeVisible();
  await expect(spinSprite).toBeHidden();

  await page.setViewportSize({ width: 1280, height: 900 });
  const penguinBox = await penguin.boundingBox();
  expect(penguinBox).not.toBeNull();
  if (!penguinBox) return;
  expect(penguinBox.width).toBeGreaterThanOrEqual(352);
  expect(penguinBox.height).toBeGreaterThanOrEqual(352);

  await page.mouse.move(
    penguinBox.x + penguinBox.width / 2,
    penguinBox.y + penguinBox.height / 2,
  );

  await expect(idleSprite).toBeHidden();
  await expect(spinSprite).toBeVisible();
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
