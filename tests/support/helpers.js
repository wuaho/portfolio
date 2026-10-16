const { expect } = require("@playwright/test");

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

// Waits until the locator stops moving (e.g. after a CSS transition) and
// returns its bounding box.
async function getStableBoundingBox(locator) {
  let previousPosition = "";

  await expect
    .poll(
      async () => {
        const box = await locator.boundingBox();
        if (!box) return "missing";

        const position = [box.x, box.y, box.width, box.height]
          .map((value) => Math.round(value))
          .join(":");
        const isStable = position === previousPosition;
        previousPosition = position;

        return isStable ? position : "moving";
      },
      { intervals: [50, 100, 200], timeout: 1000 },
    )
    .not.toBe("moving");

  return locator.boundingBox();
}

// Returns the bounding box, failing the test if the element has no box.
async function getBox(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box;
}

async function dragBy(page, locator, deltaX, deltaY, steps = 8) {
  const box = await getBox(locator);
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps });
  await page.mouse.up();
}

async function openWindow(page, id) {
  await page.locator(`[data-window-target="${id}"]`).click();
  const panel = page.locator(`[data-window="${id}"]`);
  await expect(panel).toBeVisible();
  return panel;
}

// Replaces Web Audio with a recorder. Played frequencies are collected in
// window.__soundFrequencies and the last peak gain in window.__soundPeak.
async function installFakeAudio(page) {
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
            exponentialRampToValueAtTime(value) {
              if (value > 0.001) window.__soundPeak = value;
            },
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
}

module.exports = {
  VIEWPORTS,
  dragBy,
  getBox,
  getStableBoundingBox,
  installFakeAudio,
  openWindow,
};
