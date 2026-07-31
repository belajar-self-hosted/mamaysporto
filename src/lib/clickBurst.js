import { animate, utils, prefersReducedMotion } from "./motion";
import "./clickBurst.css";

const COLORS = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--text-main)"];

/** Ledakan kotak-kotak kecil di titik (x, y), dipakai di klik tombol CTA penting. */
export function burst(x, y, count = 8) {
  if (typeof document === "undefined" || prefersReducedMotion()) return;

  const container = document.createElement("div");
  container.className = "click-burst";
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  document.body.appendChild(container);

  const pieces = [];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "click-burst-piece";
    piece.style.backgroundColor = COLORS[i % COLORS.length];
    container.appendChild(piece);
    pieces.push(piece);
  }

  animate(pieces, {
    translateX: () => utils.random(-70, 70),
    translateY: () => utils.random(-70, 70),
    rotate: () => utils.random(-180, 180),
    scale: [1, 0],
    opacity: [1, 0],
    duration: () => utils.random(500, 750),
    ease: "outExpo",
    onComplete: () => container.remove(),
  });
}
