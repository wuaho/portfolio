const EMBED_ORIGIN = "https://www.youtube-nocookie.com";

// Videos start as a thumbnail button (data-video-src, data-video-title) and
// become the real YouTube player only when pressed, so More opens instantly
// and nothing from YouTube loads for visitors who do not press play.
export function initVideoFacades(root = document) {
  let warmed = false;

  // Opens the connection to YouTube early, once the visitor shows intent.
  function warmUp() {
    if (warmed) return;
    warmed = true;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = EMBED_ORIGIN;
    document.head.append(link);
  }

  function play(facade) {
    const url = new URL(facade.dataset.videoSrc);
    url.searchParams.set("autoplay", "1");

    const frame = document.createElement("iframe");
    frame.src = url.href;
    frame.title = facade.dataset.videoTitle ?? "Video";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allowFullscreen = true;

    facade.replaceWith(frame);
    frame.focus();
  }

  root.querySelectorAll("[data-video-src]").forEach((facade) => {
    for (const type of ["pointerenter", "focus", "touchstart"]) {
      facade.addEventListener(type, warmUp, { once: true, passive: true });
    }
    facade.addEventListener("click", () => play(facade));
  });
}
