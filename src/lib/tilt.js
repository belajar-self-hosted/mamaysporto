import { onCleanup } from "solid-js";
import { animate, EASE_OUT, supportsFineHover } from "./motion";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Solid directive: use:tilt
 * Tilt 3D ringan & snappy mengikuti posisi cursor (bukan glossy-smooth khas card modern).
 */
export function tilt(el, accessor) {
  if (!supportsFineHover()) return;

  const options = (typeof accessor === "function" ? accessor() : accessor) || {};
  const maxTilt = options.maxTilt ?? 6;

  const handleMove = (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = clamp(px * maxTilt * 2, -maxTilt, maxTilt);
    const rotateX = clamp(-py * maxTilt * 2, -maxTilt, maxTilt);

    animate(el, {
      perspective: 800,
      rotateX,
      rotateY,
      translateY: -4,
      duration: 150,
      ease: "outQuad",
    });
  };

  const handleLeave = () => {
    animate(el, {
      perspective: 800,
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      duration: 380,
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
