// The penguin's hit area (data-penguin-hit) is the only part that takes
// pointer events, so the rest of its large box never blocks clicks beneath it.
// Clicking (or Enter/Space) makes it roll while the music plays; clicking
// again stops both. `playMusic(onEnd)` returns a stop function or null.
export function initPenguin(penguin, { playMusic } = {}) {
  if (!penguin) return;

  const hit = penguin.querySelector("[data-penguin-hit]") ?? penguin;
  let stopMusic = null;
  let fallbackTimer = 0;

  function setRolling(rolling) {
    penguin.classList.toggle("is-rolling", rolling);
    penguin.setAttribute("aria-pressed", String(rolling));
  }

  function stop() {
    const stopper = stopMusic;
    stopMusic = null;
    window.clearTimeout(fallbackTimer);
    setRolling(false);
    stopper?.();
  }

  function start() {
    setRolling(true);
    // When muted there is no music, so roll for a moment instead.
    const stopper = playMusic?.(stop);
    stopMusic = stopper ?? null;
    if (!stopper) fallbackTimer = window.setTimeout(stop, 1800);
  }

  function toggle() {
    if (penguin.classList.contains("is-rolling")) stop();
    else start();
  }

  hit.addEventListener("click", toggle);
  penguin.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  });
}
