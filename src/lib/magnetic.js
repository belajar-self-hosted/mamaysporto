import { onCleanup } from "solid-js";
import { animate, EASE_OUT, supportsFineHover } from "./motion";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Solid directive: use:magnetic
 * Elemen "menempel" dikit ke cursor saat mouse mendekat, balik ke posisi asal saat mouse pergi.
 * Nonaktif otomatis di perangkat tanpa hover presisi (touch).
 */
export function magnetic(el, accessor) {
  if (!supportsFineHover()) return;

  const options = (typeof accessor === "function" ? accessor() : accessor) || {};
  const strength = options.strength ?? 0.35;
  const maxOffset = options.maxOffset ?? 14;

  const handleMove = (e) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clamp((e.clientX - cx) * strength, -maxOffset, maxOffset);
    const dy = clamp((e.clientY - cy) * strength, -maxOffset, maxOffset);
    animate(el, {
      translateX: dx,
      translateY: dy,
      duration: 260,
      ease: "outQuad",
    });
  };

  const handleLeave = () => {
    animate(el, {
      translateX: 0,
      translateY: 0,
      duration: 420,
      ease: EASE_OUT,
    });
  };

  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);

  onCleanup(() => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
  });
}
