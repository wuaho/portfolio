import {
  DESKTOP_QUERY,
  WINDOW_FOCUS_DELAY_MS,
  WINDOW_TRANSITION_MS,
} from "../config.js";
import { trapFocus } from "../lib/focus.js";
import { makeDraggable, resetWindowPosition } from "./window-drag.js";

// Section windows: one modal dialog open at a time, kept in sync with the
// URL hash (#about, #experience, ...).
//
// Markup contract:
//   [data-window-target="id"]  nav link that opens a window
//   [data-window="id"]         dialog panel with .window-chrome and .window-close
//   [data-window-backdrop]     shared backdrop
//   [data-reveal]              content animated in when its window opens
//
// `onOpen` / `onClose` run only for direct user actions, never for history
// navigation or the initial deep link.
export function initWindows({ onOpen = () => {}, onClose = () => {} } = {}) {
  const backdrop = document.querySelector("[data-window-backdrop]");
  const navLinks = document.querySelectorAll("[data-window-target]");
  const panels = document.querySelectorAll("[data-window]");
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);

  let activePanel = null;
  let previousFocus = null;
  // Pending hide timers per panel, so switching windows never cancels the
  // exit of the window being replaced.
  const hideTimers = new Map();

  const getPanel = (id) =>
    id ? document.querySelector(`[data-window="${CSS.escape(id)}"]`) : null;
  const getCloseButton = (panel) => panel.querySelector(".window-close");
  const getHashId = () => window.location.hash.slice(1);

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      const isActive = link.dataset.windowTarget === id;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-expanded", String(isActive));
    });
  }

  function show(panel) {
    window.clearTimeout(hideTimers.get(panel));
    hideTimers.delete(panel);
    panel.hidden = false;
    backdrop.hidden = false;
    panel.querySelectorAll("[data-reveal]").forEach((item) => {
      item.classList.add("is-visible");
    });

    // Wait a frame so the transition starts from the hidden state.
    window.requestAnimationFrame(() => {
      document.body.classList.add("window-open");
      backdrop.classList.add("is-visible");
      panel.classList.add("is-open");
    });
  }

  function hide(panel) {
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    document.body.classList.remove("window-open");

    const timer = window.setTimeout(() => {
      hideTimers.delete(panel);
      panel.hidden = true;
      resetWindowPosition(panel);
      if (!activePanel) backdrop.hidden = true;
    }, WINDOW_TRANSITION_MS);
    hideTimers.set(panel, timer);
  }

  function open(id, { fromUser = false } = {}) {
    const panel = getPanel(id);
    if (!panel) return;

    if (activePanel === panel) {
      getCloseButton(panel).focus();
      return;
    }

    if (activePanel) close();

    previousFocus = document.activeElement;
    activePanel = panel;
    setActiveLink(id);
    show(panel);

    if (fromUser) {
      onOpen(id);
      if (getHashId() !== id) window.history.pushState({}, "", `#${id}`);
    }

    window.setTimeout(() => {
      if (activePanel === panel) getCloseButton(panel).focus();
    }, WINDOW_FOCUS_DELAY_MS);
  }

  function close({ fromUser = false } = {}) {
    if (!activePanel) return;

    const panel = activePanel;
    activePanel = null;
    setActiveLink("");
    hide(panel);

    if (fromUser) {
      onClose(panel.dataset.window);
      if (window.location.hash) {
        const { pathname, search } = window.location;
        window.history.replaceState({}, "", pathname + search);
      }
    }

    previousFocus?.focus?.();
    previousFocus = null;
  }

  function syncWithUrl() {
    const id = getHashId();
    if (getPanel(id)) open(id);
    else close();
  }

  navLinks.forEach((link) => {
    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      open(link.dataset.windowTarget, { fromUser: true });
    });
  });

  panels.forEach((panel) => {
    makeDraggable(panel, panel.querySelector(".window-chrome"), {
      isEnabled: () => desktopQuery.matches,
    });
    getCloseButton(panel).addEventListener("click", () => {
      close({ fromUser: true });
    });
  });

  backdrop.addEventListener("click", () => close({ fromUser: true }));

  document.addEventListener("keydown", (event) => {
    if (!activePanel) return;
    if (event.key === "Escape") close({ fromUser: true });
    else trapFocus(event, activePanel);
  });

  window.addEventListener("hashchange", syncWithUrl);
  window.addEventListener("popstate", syncWithUrl);

  // Deep link: open the window named in the initial URL hash.
  if (getPanel(getHashId())) open(getHashId());

  return { open, close };
}
