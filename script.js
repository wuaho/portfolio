(function () {
  var body = document.body;
  var backdrop = document.querySelector("[data-window-backdrop]");
  var navLinks = document.querySelectorAll("[data-window-target]");
  var panels = document.querySelectorAll("[data-window]");
  var activePanel = null;
  var previousFocus = null;
  var closeTimer = null;
  var desktopQuery = window.matchMedia("(min-width: 52rem)");
  var dragThreshold = 4;
  var dragState = null;
  var focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getPanel(id) {
    return document.querySelector('[data-window="' + id + '"]');
  }

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("data-window-target") === id;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-expanded", isActive ? "true" : "false");
    });
  }

  function showPanel(panel) {
    window.clearTimeout(closeTimer);
    panel.hidden = false;
    backdrop.hidden = false;
    panel.querySelectorAll("[data-reveal]").forEach(function (item) {
      item.classList.add("is-visible");
    });

    window.requestAnimationFrame(function () {
      body.classList.add("window-open");
      backdrop.classList.add("is-visible");
      panel.classList.add("is-open");
    });
  }

  function openWindow(id, updateUrl) {
    var panel = getPanel(id);
    if (!panel) return;

    if (activePanel === panel) {
      panel.querySelector(".window-close").focus();
      return;
    }

    if (activePanel) closeWindow(false);

    previousFocus = document.activeElement;
    activePanel = panel;
    setActiveLink(id);
    showPanel(panel);

    if (updateUrl && window.location.hash !== "#" + id) {
      window.history.pushState({}, "", "#" + id);
    }

    window.setTimeout(function () {
      if (activePanel === panel) panel.querySelector(".window-close").focus();
    }, 20);
  }

  function closeWindow(updateUrl) {
    if (!activePanel) return;

    var panel = activePanel;
    activePanel = null;
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    body.classList.remove("window-open");
    setActiveLink("");

    closeTimer = window.setTimeout(function () {
      panel.hidden = true;
      backdrop.hidden = true;
      resetPanelPosition(panel);
    }, 220);

    if (updateUrl && window.location.hash) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search,
      );
    }

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
    previousFocus = null;
  }

  function resetPanelPosition(panel) {
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.inset = "";
    panel.style.transform = "";
  }

  function startDragging(event, panel) {
    if (!desktopQuery.matches || event.button !== 0) return;
    if (event.target.closest("button, a")) return;

    var bounds = panel.getBoundingClientRect();
    var handle = event.currentTarget;

    handle.setPointerCapture(event.pointerId);
    dragState = {
      pointerId: event.pointerId,
      panel: panel,
      handle: handle,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: bounds.left,
      startTop: bounds.top,
      isDragging: false,
    };
  }

  function dragPanel(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    var panel = dragState.panel;
    var deltaX = event.clientX - dragState.startX;
    var deltaY = event.clientY - dragState.startY;

    if (!dragState.isDragging && Math.hypot(deltaX, deltaY) <= dragThreshold) {
      return;
    }

    if (!dragState.isDragging) {
      panel.style.left = dragState.startLeft + "px";
      panel.style.top = dragState.startTop + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.inset = "auto";
      panel.style.transform = "none";
      panel.style.transition = "none";
      panel.classList.add("is-dragging");
      dragState.isDragging = true;
    }

    var maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    var maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    var nextLeft = dragState.startLeft + deltaX;
    var nextTop = dragState.startTop + deltaY;

    panel.style.left = Math.min(Math.max(0, nextLeft), maxLeft) + "px";
    panel.style.top = Math.min(Math.max(0, nextTop), maxTop) + "px";
    event.preventDefault();
  }

  function stopDragging(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (dragState.handle.hasPointerCapture(event.pointerId)) {
      dragState.handle.releasePointerCapture(event.pointerId);
    }
    dragState.panel.style.transition = "";
    dragState.panel.classList.remove("is-dragging");
    dragState = null;
  }

  function trapFocus(event) {
    if (!activePanel || event.key !== "Tab") return;

    var focusable = Array.prototype.slice.call(
      activePanel.querySelectorAll(focusableSelector),
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  navLinks.forEach(function (link) {
    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openWindow(link.getAttribute("data-window-target"), true);
    });
  });

  panels.forEach(function (panel) {
    panel
      .querySelector(".window-chrome")
      .addEventListener("pointerdown", function (event) {
        startDragging(event, panel);
      });
    panel.querySelector(".window-close").addEventListener("click", function () {
      closeWindow(true);
    });
  });

  document.addEventListener("pointermove", dragPanel);
  document.addEventListener("pointerup", stopDragging);
  document.addEventListener("pointercancel", stopDragging);

  backdrop.addEventListener("click", function () {
    closeWindow(true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activePanel) closeWindow(true);
    trapFocus(event);
  });

  function syncWindowWithUrl() {
    var id = window.location.hash.slice(1);
    if (getPanel(id)) {
      openWindow(id, false);
    } else if (activePanel) {
      closeWindow(false);
    }
  }

  window.addEventListener("hashchange", syncWindowWithUrl);
  window.addEventListener("popstate", syncWindowWithUrl);

  var initialId = window.location.hash.slice(1);
  if (getPanel(initialId)) openWindow(initialId, false);
})();
