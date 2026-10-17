// Application entry point: wires the independent features together.
import { initPenguin } from "./features/penguin.js";
import { initSound } from "./features/sound.js";
import { initWindows } from "./features/windows.js";

const sound = initSound({
  toggle: document.querySelector("[data-sound-toggle]"),
});

initWindows({
  onOpen: () => sound.play("open"),
  onClose: () => sound.play("close"),
});

initPenguin(document.querySelector("[data-penguin]"), {
  playMusic: sound.playMusic,
  onHover: () => sound.play("hover"),
});
