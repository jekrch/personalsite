import { useEffect } from 'react';
import { resampleSafariChrome } from './safariChrome';

/**
 * Locks page scroll while `locked` is true. Pins the page where it is (body
 * fixed at its scroll offset) so there is nothing left to scroll: wheel,
 * touch, keys, scrollbar drags and scroll chaining out of iframes all do
 * nothing. A classic scrollbar is kept (as an empty track) because hiding it
 * would change the viewport width and shift the page and everything fixed
 * to it.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const { body } = document;
    const scrollY = window.scrollY;
    const hasScrollbar = window.innerWidth > html.clientWidth;
    const previous = {
      overflowY: html.style.overflowY,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
    };

    html.dataset.scrollLocked = '';
    if (hasScrollbar) html.style.overflowY = 'scroll';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';

    return () => {
      html.style.overflowY = previous.overflowY;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      // 'instant' so Bootstrap's smooth scroll-behavior doesn't animate it
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      delete html.dataset.scrollLocked;
      // Otherwise iOS Safari keeps its bars tinted with the pinned body
      resampleSafariChrome();
    };
  }, [locked]);
}
