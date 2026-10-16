// The penguin ignores pointer events (so it never blocks clicks underneath),
// which means :hover never matches. Track the cursor instead and toggle
// .is-hovered while it is inside the penguin's box.
export function initPenguin(penguin) {
  if (!penguin) return;

  function updateHover(event) {
    const bounds = penguin.getBoundingClientRect();
    const isOver =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    penguin.classList.toggle("is-hovered", isOver);
  }

  document.addEventListener("mousemove", updateHover);
  window.addEventListener("blur", () => {
    penguin.classList.remove("is-hovered");
  });
}
