import { DRAG_THRESHOLD_PX } from "../config.js";

const POSITION_PROPERTIES = [
  "left",
  "top",
  "right",
  "bottom",
  "inset",
  "transform",
];

// Clears inline positioning so the panel returns to its CSS layout.
export function resetWindowPosition(panel) {
  POSITION_PROPERTIES.forEach((property) => {
    panel.style[property] = "";
  });
}

// Makes `panel` draggable by `handle` while `isEnabled()` is true. The
// panel is clamped inside the viewport. Presses on buttons and links are
// ignored so the close button keeps working.
export function makeDraggable(panel, handle, { isEnabled }) {
  let drag = null;

  function onPointerDown(event) {
    if (!isEnabled() || event.button !== 0) return;
    if (event.target.closest("button, a")) return;

    const bounds = panel.getBoundingClientRect();
    handle.setPointerCapture(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: bounds.left,
      startTop: bounds.top,
      isDragging: false,
    };
  }

  // Pins the panel to absolute coordinates so it can move freely.
  function beginDrag() {
    Object.assign(panel.style, {
      left: `${drag.startLeft}px`,
      top: `${drag.startTop}px`,
      right: "auto",
      bottom: "auto",
      inset: "auto",
      transform: "none",
      transition: "none",
    });
    panel.classList.add("is-dragging");
    drag.isDragging = true;
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.isDragging) {
      if (Math.hypot(deltaX, deltaY) <= DRAG_THRESHOLD_PX) return;
      beginDrag();
    }

    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    const left = clamp(drag.startLeft + deltaX, 0, maxLeft);
    const top = clamp(drag.startTop + deltaY, 0, maxTop);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    panel.style.transition = "";
    panel.classList.remove("is-dragging");
    drag = null;
  }

  // Pointer capture routes all move/up events for the drag to the handle.
  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
}

function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
}
