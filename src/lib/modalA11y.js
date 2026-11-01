import { onCleanup } from "solid-js";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function accessibleDialog(element, accessor) {
  const previousFocus = document.activeElement;
  const focusFrame = requestAnimationFrame(() => {
    const firstFocusable = element.querySelector(FOCUSABLE_SELECTOR);
    (firstFocusable || element).focus();
  });

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      accessor()();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [...element.querySelectorAll(FOCUSABLE_SELECTOR)];
    if (focusable.length === 0) {
      event.preventDefault();
      element.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  element.addEventListener("keydown", handleKeydown);
  onCleanup(() => {
    cancelAnimationFrame(focusFrame);
    element.removeEventListener("keydown", handleKeydown);
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
  });
}
