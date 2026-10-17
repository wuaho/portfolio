# AGENTS.md

## Project Overview

This is Juanjo Requena's personal portfolio. It is a dependency-light static website with no framework or build step: plain HTML, CSS split into small files, and native ES modules. The page must be served from a static web server (ES modules do not load from `file://`).

## Project Structure

- `index.html`: All visible portfolio content, section markup, external links, SVG decorations, and window dialog markup.
- `src/styles/main.css`: Stylesheet entry point. Imports the other files in cascade order and documents the breakpoints.
- `src/styles/tokens.css`: Design tokens (colors, fonts, durations, z-index scale). Add new colors and timings here instead of hardcoding them.
- `src/styles/base.css`, `layout.css`, `motion.css`: Element defaults, page layout, reveal animation, and reduced-motion overrides.
- `src/styles/components/`: One file per UI component, each with its own mobile-first media queries. `antarctica.css` holds the sea band and the ice block under the penguin.
- `src/scripts/main.js`: Script entry point. Initializes features and connects them.
- `src/scripts/config.js`: Shared constants (desktop breakpoint, timings, storage keys).
- `src/scripts/features/`: `windows.js` (open/close, URL hash sync, focus, Escape/backdrop), `window-drag.js` (desktop dragging), `sound.js` (Web Audio cues and the mute toggle), `penguin.js` (hover tracking).
- `src/scripts/lib/`: Small framework-free helpers (`storage.js`, `focus.js`).
- `assets/icons/`: Local SVG navigation icons.
- `assets/penguin/gifs/`, `assets/penguin/spritesheets/`: User-provided penguin animation assets, kebab-case file names.
- `tests/e2e/`: Playwright end-to-end specs, one file per feature.
- `tests/support/helpers.js`: Shared test helpers (viewports, stable bounding boxes, drag, fake Web Audio).
- `playwright.config.js`, `eslint.config.js`, `.prettierignore`, `.editorconfig`: Tooling configuration.
- `.github/workflows/ci.yml`: CI that runs lint, format check, and E2E tests.

The previous Gatsby/React implementation was intentionally removed. Do not reintroduce Gatsby, React, Tailwind, a bundler, or a frontend framework unless explicitly requested.

## Running The Site

```bash
npm start
```

Open `http://127.0.0.1:4173` in a browser.

## Running Tests

Install dependencies and the browser once:

```bash
npm install
npx playwright install chromium
```

Run all end-to-end tests:

```bash
npm run test:e2e
```

The Playwright config starts the static server automatically. Run the relevant E2E tests after every interaction or layout change.

## Interaction Model

- The navigation links use `data-window-target` and open the matching section identified by `data-window`. The current windows are `about`, `experience`, `projects`, `more`, and `contact`.
- The landing hero and section navigation live inside the `.home-window` OS-style card. The sound toggle stays outside it as a fixed viewport control.
- The sea band (`.antarctic-scene`) and the ice block (`.ice-floe`) are decorative. The block's position is derived from the penguin's `--perch-*` variables in `penguin.css`, so move the penguin and the block together by changing those variables.
- The bottom-right penguin companion uses the first frame of `assets/penguin/spritesheets/idle.png` by default and swaps to `assets/penguin/gifs/spin-attack.gif` on hover/focus.
- Every section window is a dialog with a `.window-chrome` title bar and `.window-close` button.
- Desktop windows use the `52rem` breakpoint (`DESKTOP_QUERY` in `config.js`). Their title bar is draggable, and the window is clamped inside the viewport.
- Mobile windows are full-screen modals. They must not be draggable.
- `Escape`, the backdrop, the close button, and browser history close or change the active window.
- URL hashes such as `#experience` are part of the navigation contract.
- Opening and closing windows play short Web Audio cues after direct user actions only (not deep links or history navigation). The sound toggle persists its preference in local storage under `juanjo-sound`.
- Keep the stable attributes and class names used by the E2E tests unless the tests are updated in the same change.

## Editing Guidelines

- Edit content in `index.html`, visual rules in `src/styles/`, and behavior in `src/scripts/`.
- Keep the CSS mobile-first. Put desktop behavior in `@media (min-width: ...)` blocks inside the component file it belongs to.
- New component styles go in a new file under `src/styles/components/`, imported from `main.css`.
- Use `data-*` attributes as JavaScript hooks; do not select elements in JavaScript by styling classes unless the class is part of the documented window contract.
- Keep feature modules independent. Cross-feature wiring belongs in `main.js`.
- Preserve the full portfolio content unless the user explicitly asks to remove it.
- Keep external links using `target="_blank"` and `rel="noopener noreferrer"` (enforced by `tests/e2e/contact.spec.js`).
- Prefer semantic HTML, visible keyboard focus, accessible names, and reduced-motion support.
- Do not add image dependencies for the profile; the current design intentionally has no profile image.
- Use ASCII for new code and comments unless content requires another character.

## Verification And Commits

Before completing a feature:

1. Run `npm run check` (ESLint, Prettier check, and the E2E suite).
2. Run `git diff --check`.
3. Inspect `git diff` and `git status --short`.
4. Commit the completed changes. The working tree should be clean after the commit.

Use concise imperative commit messages, for example:

```text
Add mobile modal coverage
```
