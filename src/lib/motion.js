import { animate, stagger, utils } from "animejs";

export { animate, stagger, utils };

// Easing "snap" — sedikit overshoot, kesan tegas/klik, bukan smooth-lerp khas UI modern.
export const EASE_SNAP = "outBack";
export const EASE_OUT = "outExpo";

export const DURATION_FAST = 180;
export const DURATION_BASE = 320;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const supportsFineHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;
