// localStorage wrappers that degrade to no-ops when storage is unavailable
// (private mode, disabled cookies, sandboxed iframes).

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The value stays session-only.
  }
}
