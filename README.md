# Juanjo's Portfolio

Personal portfolio of Juanjo Requena, built as a dependency-free static site:
plain HTML, CSS, and native ES modules with no framework or build step.
Playwright end-to-end tests cover every user-visible interaction.

## Quick Start

```bash
npm install
npx playwright install chromium
npm start
```

Then open `http://127.0.0.1:4173`. ES modules do not load from `file://`, so
always use a static server.

## Scripts

| Command                | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `npm start`            | Serve the site at `http://127.0.0.1:4173`    |
| `npm run lint`         | Lint JavaScript with ESLint                  |
| `npm run format`       | Format every file with Prettier              |
| `npm run format:check` | Verify formatting without writing            |
| `npm test`             | Run the Playwright end-to-end suite          |
| `npm run test:e2e:ui`  | Run the suite in Playwright's interactive UI |
| `npm run check`        | Lint, format check, and tests (same as CI)   |

## Project Structure

```text
index.html                 All page content and window markup
assets/
  icons/                   Navigation icons
  penguin/                 Penguin companion GIFs and spritesheets
src/
  styles/
    main.css               Entry point; imports everything below in order
    tokens.css             Colors, fonts, timings, z-index scale
    base.css               Reset and element defaults
    layout.css             Page wrapper and top bar
    motion.css             Reveal animation and reduced-motion overrides
    components/            One file per UI component
  scripts/
    main.js                Entry point; wires features together
    config.js              Shared constants (breakpoint, timings, storage keys)
    features/              windows, window-drag, sound, penguin
    lib/                   Framework-free helpers (storage, focus trap)
tests/
  e2e/                     Playwright specs, one per feature
  support/helpers.js       Shared test helpers and fakes
```

## Architecture

- **Content lives in HTML.** Every section is a static `role="dialog"` panel
  in `index.html`, so the content is crawlable and readable without
  JavaScript.
- **Behavior is attached through `data-*` attributes**, never through styling
  classes. `[data-window-target]` links open `[data-window]` panels; the full
  contract is documented at the top of `src/scripts/features/windows.js`.
- **Features are independent modules.** `main.js` connects them; for
  example, the window manager exposes `onOpen` / `onClose` hooks and `main.js`
  routes them to the sound module.
- **Design tokens drive the styles.** Colors, durations, and stacking order
  are custom properties in `tokens.css`. The two breakpoints (`35rem`,
  `52rem`) are documented in `main.css`; `52rem` is mirrored in `config.js`.

## Adding A New Section

1. Add a nav link in `.section-nav` with `data-window-target="my-section"`,
   `href="#my-section"`, and an icon in `assets/icons/`.
2. Copy an existing `.window-panel` section, then set `id` and
   `data-window` to `my-section` and update `aria-labelledby`.
3. Reuse existing card components, or add a new file in
   `src/styles/components/` and import it from `main.css`.
4. Add coverage in `tests/e2e/` (the `WINDOW_IDS` list in `windows.spec.js`
   covers open/close behavior).
5. Run `npm run check`.
