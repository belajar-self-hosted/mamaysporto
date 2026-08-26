import { onCleanup } from "solid-js";
import { prefersReducedMotion, supportsFineHover } from "./motion";

// Solid directive: use:stickyReveal
// Dipasang bareng CSS `position: sticky` di Hero — saat section berikutnya meluncur menutupinya,
// directive ini menulis progress scroll (0-1) ke custom property --reveal-progress di elemen,
// dibaca CSS untuk scale-down + fade halus pada konten Hero (lihat Hero.css).
// Di-skip total di mobile/coarse-pointer/reduced-motion — Hero tetap sticky secara visual (itu CSS,
// bukan directive ini), cuma tanpa efek scale/fade tambahan.
export function stickyReveal(el) {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion() || !supportsFineHover() || window.innerWidth < 769) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      el.style.setProperty("--reveal-progress", progress.toFixed(3));
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onCleanup(() => window.removeEventListener("scroll", onScroll));
}
