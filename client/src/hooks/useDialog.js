import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;
// Open dialogs, topmost last: only the topmost reacts to Escape and Tab (e.g. a sign-in prompt over a spot modal).
const stack = [];

/**
 * Shared dialog behaviour (DESIGN-SYSTEM §10): Escape to close, focus trap, focus restore and
 * body scroll lock. `lockScroll` and `trapFocus` can be switched off for non-blocking sheets.
 */
export function useDialog(ref, { open, onClose, lockScroll = true, trapFocus = true }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const node = ref.current;
    const token = {};
    stack.push(token);

    if (trapFocus && node && !node.contains(document.activeElement)) {
      (node.querySelector('[data-autofocus]') ?? node.querySelector(FOCUSABLE) ?? node).focus({
        preventScroll: true,
      });
    }

    const onKeyDown = (event) => {
      if (stack[stack.length - 1] !== token) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !trapFocus || !node) return;

      const items = [...node.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    if (lockScroll) {
      scrollLocks += 1;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      stack.splice(stack.indexOf(token), 1);
      if (lockScroll) {
        scrollLocks -= 1;
        if (scrollLocks === 0) document.body.style.overflow = '';
      }
      if (trapFocus && previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, ref, lockScroll, trapFocus]);
}
