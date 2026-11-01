import { animate, stagger, utils } from "animejs";

export { animate, stagger, utils };

export const EASE_OUT = "outExpo";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const supportsFineHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;
