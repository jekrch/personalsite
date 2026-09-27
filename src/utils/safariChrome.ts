const isIOS = () =>
  /iP(hone|ad|od)/.test(navigator.platform ?? '') ||
  (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);

// Give the unlocked page time to reach Safari's compositor before resampling.
const SETTLE_MS = 100;

/**
 * Makes iOS Safari re-sample the page for its status-bar / toolbar tint after
 * an overlay closes.
 *
 * Safari 26 colors those bands from a `position: fixed` element at the
 * viewport edge (a scroll-locked, pinned <body> counts), and only re-samples
 * on scroll events, holding the result until the next one. Scroll locks
 * restore the page offset in the same task that unpins the body, so the
 * scroll Safari samples on still sees the pinned body (or the viewer's dark
 * canvas) and the bands stay opaque after close. Once the unlocked page has
 * rendered, fire one real scroll: a pixel off and back on the next frame.
 */
export function resampleSafariChrome(): void {
  if (!isIOS()) return;

  const startY = window.scrollY;
  window.setTimeout(() => {
    // The user already scrolled, which re-samples on its own.
    if (Math.abs(window.scrollY - startY) >= 1) return;
    if ('scrollLocked' in document.documentElement.dataset) return;

    const root = document.documentElement;
    const heldY = window.scrollY;
    const previousMinHeight = root.style.minHeight;
    // A page too short to scroll is lent 2px of range so it has somewhere to go.
    const lend = heldY < 1 && root.scrollHeight - root.clientHeight < 1;
    const lent = `${root.clientHeight + 2}px`;
    if (lend) root.style.minHeight = lent;

    // 'instant' so Bootstrap's smooth scroll-behavior doesn't animate it
    window.scrollTo({ top: heldY >= 1 ? heldY - 1 : heldY + 1, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: heldY, behavior: 'instant' });
      if (lend && root.style.minHeight === lent) root.style.minHeight = previousMinHeight;
    });
  }, SETTLE_MS);
}
