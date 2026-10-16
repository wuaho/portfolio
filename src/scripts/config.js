// Shared constants. Keep timings in sync with src/styles/tokens.css.

// Mirrors the 52rem desktop breakpoint used throughout the stylesheets.
export const DESKTOP_QUERY = "(min-width: 52rem)";

// Matches --duration-window; the panel is hidden after its exit transition.
export const WINDOW_TRANSITION_MS = 220;

// Delay before moving focus into a newly opened window.
export const WINDOW_FOCUS_DELAY_MS = 20;

// Pointer travel (px) before a title bar press becomes a drag.
export const DRAG_THRESHOLD_PX = 4;

export const STORAGE_KEYS = {
  sound: "juanjo-sound",
};
