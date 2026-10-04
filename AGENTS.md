# AGENTS.md

## Project Overview

This is Juanjo Requena's personal portfolio. It is a dependency-light static website with no framework or build step. The page is designed to be opened from a static web server and is intentionally easy to edit directly.

## Project Structure

- `index.html`: All visible portfolio content, section markup, external links, SVG decorations, and window dialog markup.
- `styles.css`: All layout, colors, typography, responsive behavior, modal/window styling, and animations.
- `script.js`: Window opening/closing, URL hash synchronization, focus trapping, Escape/backdrop handling, desktop window dragging, and synthesized interface sounds.
- `GIFs/`: User-provided GIF animation assets reserved for the About section.
- `Spritesheets/`: User-provided spritesheet assets reserved for the About section.
- `tests/`: Playwright end-to-end tests for user-visible interactions.
- `playwright.config.js`: Playwright configuration and the local static server command.
- `package.json`: Test commands and the Playwright development dependency.

The previous Gatsby/React implementation was intentionally removed. Do not reintroduce Gatsby, React, Tailwind, or a frontend framework unless explicitly requested.

## Running The Site

Use a static server from the repository root:

```bash
python3 -m http.server 4173
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
- Every section window is a dialog with a `.window-chrome` title bar and `.window-close` button.
- Desktop windows use the `52rem` breakpoint. Their title bar is draggable, and the window is clamped inside the viewport.
- Mobile windows are full-screen modals. They must not be draggable.
- `Escape`, the backdrop, the close button, and browser history close or change the active window.
- URL hashes such as `#experience` are part of the navigation contract.
- Opening and closing windows play short Web Audio cues after direct user actions. The sound toggle persists its preference in local storage.
- Keep the stable attributes and class names used by the E2E tests unless the tests are updated in the same change.

## Editing Guidelines

- Edit content in `index.html`, visual rules in `styles.css`, and behavior in `script.js`.
- Keep the CSS mobile-first. Add desktop behavior inside the existing media queries.
- Preserve the full portfolio content unless the user explicitly asks to remove it.
- Keep external links using `target="_blank"` and `rel="noopener noreferrer"`.
- Prefer semantic HTML, visible keyboard focus, accessible names, and reduced-motion support.
- Do not add image dependencies for the profile; the current design intentionally has no profile image.
- Use ASCII for new code and comments unless content requires another character.

## Verification And Commits

Before completing a feature:

1. Run `npm run test:e2e`.
2. Run `npx prettier --check index.html styles.css script.js package.json playwright.config.js tests/*.js README.md`.
3. Run `node --check script.js` and `git diff --check`.
4. Inspect `git diff` and `git status --short`.
5. Commit the completed changes. The working tree should be clean after the commit.

Use concise imperative commit messages, for example:

```text
Add mobile modal coverage
```
