import {
  DESKTOP_QUERY,
  WINDOW_FOCUS_DELAY_MS,
  WINDOW_TRANSITION_MS,
} from "../config.js";
import { trapFocus } from "../lib/focus.js";
import { findFreeSpot } from "../lib/placement.js";
import { makeDraggable, resetWindowPosition } from "./window-drag.js";

// Section windows, kept in sync with the URL hash (#about, #experience, ...).
//
// Mobile: one full-screen modal dialog at a time, over a backdrop.
// Desktop: any number of floating, non-modal windows open at once. Each new
// window is placed where it overlaps the others least, and the most recently
// used window sits on top (its id is the URL hash).
//
// Markup contract:
//   [data-window-target="id"]  nav link that opens a window
//   [data-window="id"]         dialog panel with .window-chrome and .window-close
//   [data-window-backdrop]     shared backdrop (mobile only)
//   [data-reveal]              content animated in when its window opens
//
// `onOpen` / `onClose` run only for direct user actions, never for history
// navigation or the initial deep link.
export function initWindows({ onOpen = () => {}, onClose = () => {} } = {}) {
  const backdrop = document.querySelector("[data-window-backdrop]");
  const navLinks = document.querySelectorAll("[data-window-target]");
  const panels = document.querySelectorAll("[data-window]");
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);

  // Open panels, bottom to top. The last one is the active window.
  let openPanels = [];
  let backdropTimer = null;
  // Pending hide timers per panel, so switching windows never cancels the
  // exit of the window being replaced.
  const hideTimers = new Map();
  const previousFocus = new Map();

  const isDesktop = () => desktopQuery.matches;
  const getActive = () => openPanels[openPanels.length - 1] ?? null;
  const getPanel = (id) =>
    id ? document.querySelector(`[data-window="${CSS.escape(id)}"]`) : null;
  const getCloseButton = (panel) => panel.querySelector(".window-close");
  const getHashId = () => window.location.hash.slice(1);

  // Pins the panel at a free spot instead of its default CSS position.
  function placePanel(panel, x, y) {
    panel.classList.add("is-placed");
    panel.style.inset = "auto";
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    // Opening animation starts from the center of the screen.
    panel.style.setProperty(
      "--from-x",
      `${(window.innerWidth - panel.offsetWidth) / 2 - x}px`,
    );
    panel.style.setProperty(
      "--from-y",
      `${(window.innerHeight - panel.offsetHeight) / 2 - y}px`,
    );
  }

  function clearPlacement(panel) {
    panel.classList.remove("is-placed");
    panel.style.removeProperty("--from-x");
    panel.style.removeProperty("--from-y");
    resetWindowPosition(panel);
  }

  function refreshLinks() {
    navLinks.forEach((link) => {
      const isOpen = openPanels.some(
        (panel) => panel.dataset.window === link.dataset.windowTarget,
      );
      link.classList.toggle("is-active", isOpen);
      link.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Mobile windows are modal (backdrop, scroll lock); desktop windows are not.
  function refreshModality() {
    const isModal = !isDesktop() && openPanels.length > 0;
    document.body.classList.toggle("window-open", isModal);
    panels.forEach((panel) => {
      panel.setAttribute("aria-modal", String(!isDesktop()));
    });

    window.clearTimeout(backdropTimer);
    if (isModal) {
      backdrop.hidden = false;
      window.requestAnimationFrame(() => {
        if (openPanels.length && !isDesktop()) {
          backdrop.classList.add("is-visible");
        }
      });
    } else {
      backdrop.classList.remove("is-visible");
      backdropTimer = window.setTimeout(() => {
        backdrop.hidden = true;
      }, WINDOW_TRANSITION_MS);
    }
  }

  // Stacks the panels in `openPanels` order and marks the top one.
  function restack() {
    openPanels.forEach((panel, index) => {
      panel.style.zIndex = `calc(var(--z-window) + ${index})`;
      panel.classList.toggle("is-front", index === openPanels.length - 1);
    });
  }

  function raise(panel) {
    if (getActive() === panel) return;
    openPanels = openPanels.filter((item) => item !== panel);
    openPanels.push(panel);
    restack();
  }

  function show(panel) {
    window.clearTimeout(hideTimers.get(panel));
    hideTimers.delete(panel);
    panel.hidden = false;
    clearPlacement(panel);

    // The first window keeps its CSS position; later ones go where there is
    // room, also keeping clear of the home navigation. Measure while the panel is displayed but still transparent.
    if (isDesktop() && openPanels.length) {
      const spot = findFreeSpot(
        { width: panel.offsetWidth, height: panel.offsetHeight },
        [
          ...openPanels.map((other) => other.getBoundingClientRect()),
          ...Array.from(
            document.querySelectorAll("[data-window-keep-clear]"),
            (element) => element.getBoundingClientRect(),
          ),
        ],
        { width: window.innerWidth, height: window.innerHeight },
      );
      placePanel(panel, spot.x, spot.y);
      // Measuring committed the default style; skip the transition from it so
      // the opening animation starts at the screen center.
      panel.style.transition = "none";
      void panel.offsetWidth;
      panel.style.transition = "";
    }

    openPanels.push(panel);
    restack();
    refreshLinks();
    refreshModality();

    panel.querySelectorAll("[data-reveal]").forEach((item) => {
      item.classList.add("is-visible");
    });

    // Wait a frame so the transition starts from the hidden state.
    window.requestAnimationFrame(() => {
      panel.classList.add("is-open");
    });
  }

  function hide(panel) {
    openPanels = openPanels.filter((item) => item !== panel);
    panel.classList.remove("is-open", "is-front");
    restack();
    refreshLinks();
    refreshModality();

    const timer = window.setTimeout(() => {
      hideTimers.delete(panel);
      panel.hidden = true;
      panel.style.zIndex = "";
      clearPlacement(panel);
    }, WINDOW_TRANSITION_MS);
    hideTimers.set(panel, timer);
  }

  function focusPanel(panel) {
    window.setTimeout(() => {
      if (getActive() === panel) getCloseButton(panel).focus();
    }, WINDOW_FOCUS_DELAY_MS);
  }

  function open(id, { fromUser = false } = {}) {
    const panel = getPanel(id);
    if (!panel) return;

    if (openPanels.includes(panel)) {
      raise(panel);
      getCloseButton(panel).focus();
    } else {
      // Mobile shows one modal at a time.
      if (!isDesktop()) closeAll();

      previousFocus.set(panel, document.activeElement);
      show(panel);
      focusPanel(panel);
      if (fromUser) onOpen(id);
    }

    if (fromUser && getHashId() !== id) {
      window.history.pushState({}, "", `#${id}`);
    }
  }

  function close(panel, { fromUser = false } = {}) {
    if (!panel || !openPanels.includes(panel)) return;

    hide(panel);

    if (fromUser) {
      onClose(panel.dataset.window);
      const next = getActive();
      const { pathname, search, hash } = window.location;
      if (next) {
        window.history.replaceState(
          {},
          "",
          `${pathname}${search}#${next.dataset.window}`,
        );
      } else if (hash) {
        window.history.replaceState({}, "", pathname + search);
      }
    }

    const next = getActive();
    if (next) getCloseButton(next).focus();
    else previousFocus.get(panel)?.focus?.();
    previousFocus.delete(panel);
  }

  function closeAll() {
    [...openPanels].reverse().forEach((panel) => close(panel));
  }

  function syncWithUrl() {
    const id = getHashId();
    if (getPanel(id)) open(id);
    else closeAll();
  }

  // Keeps placed windows inside the viewport after a resize.
  function clampPlacedPanels() {
    openPanels.forEach((panel) => {
      if (!panel.classList.contains("is-placed")) return;
      const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
      panel.style.left = `${Math.min(parseFloat(panel.style.left) || 0, maxLeft)}px`;
      panel.style.top = `${Math.min(parseFloat(panel.style.top) || 0, maxTop)}px`;
    });
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
      close(panel, { fromUser: true });
    });
    // Clicking anywhere in a window brings it to the front.
    panel.addEventListener(
      "pointerdown",
      () => {
        if (!isDesktop() || !openPanels.includes(panel)) return;
        raise(panel);
        const { pathname, search } = window.location;
        if (getHashId() !== panel.dataset.window) {
          window.history.replaceState(
            {},
            "",
            `${pathname}${search}#${panel.dataset.window}`,
          );
        }
      },
      true,
    );
  });

  backdrop.addEventListener("click", () => {
    close(getActive(), { fromUser: true });
  });

  document.addEventListener("keydown", (event) => {
    const active = getActive();
    if (!active) return;
    if (event.key === "Escape") close(active, { fromUser: true });
    else if (!isDesktop()) trapFocus(event, active);
  });

  desktopQuery.addEventListener("change", () => {
    if (!isDesktop()) {
      // Back to one full-screen window: keep the top one, drop positions.
      const active = getActive();
      [...openPanels].forEach((panel) => {
        if (panel !== active) hide(panel);
        else clearPlacement(panel);
      });
    }
    refreshModality();
  });

  window.addEventListener("resize", clampPlacedPanels);
  window.addEventListener("hashchange", syncWithUrl);
  window.addEventListener("popstate", syncWithUrl);

  // Deep link: open the window named in the initial URL hash.
  if (getPanel(getHashId())) open(getHashId());

  return { open, close: () => close(getActive(), { fromUser: true }) };
}
