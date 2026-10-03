# Juanjo's Portfolio

Static portfolio website with Playwright end-to-end tests.

## Local Preview

Serve the directory with any static web server. For example:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## E2E Tests

Install dependencies and the Chromium browser once:

```bash
npm install
npx playwright install chromium
```

Run the tests:

```bash
npm run test:e2e
```

Run them in Playwright's interactive UI:

```bash
npm run test:e2e:ui
```

The test suite starts the static site automatically and currently covers dragging a desktop portfolio window from its title bar and verifying its final position.
