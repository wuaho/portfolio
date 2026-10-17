const { test, expect } = require("@playwright/test");
const { openWindow } = require("../support/helpers");

test("videos show a thumbnail and load YouTube only after pressing play", async ({
  page,
}) => {
  const youtubeRequests = [];
  page.on("request", (request) => {
    if (/youtube|ytimg/.test(request.url()))
      youtubeRequests.push(request.url());
  });

  await page.goto("/");
  const more = await openWindow(page, "more");
  const facades = more.locator("[data-video-src]");
  await expect(facades).toHaveCount(2);

  // Thumbnails are local images; no iframe and no YouTube traffic yet.
  for (const image of await facades.locator("img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(more.locator("iframe")).toHaveCount(0);
  expect(youtubeRequests).toEqual([]);

  const first = facades.first();
  await first.scrollIntoViewIfNeeded();
  await first.click();

  const frame = more.locator("iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute(
    "title",
    "Juanjo on KBS, Korean television",
  );
  await expect(frame).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/bDn45Y9e7Sc\?.*start=4015.*autoplay=1/,
  );
  await expect(facades).toHaveCount(1);
});
