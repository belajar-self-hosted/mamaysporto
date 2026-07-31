import { onMount, onCleanup } from "solid-js";
import { animate, prefersReducedMotion, supportsFineHover } from "../lib/motion";
import "./FloatingSticker.css";

/** Badge dekoratif yang melayang idle + parallax tipis mengikuti mouse di dalam .hero-section terdekat. */
export default function FloatingSticker(props) {
  let ref;
  const depth = props.depth ?? 12;
  const baseRotate = props.rotate ?? 0;

  onMount(() => {
    let idleAnim;
    if (!prefersReducedMotion()) {
      idleAnim = animate(ref, {
        translateY: [-6, 6],
        rotate: [baseRotate - 3, baseRotate + 3],
        duration: 2000 + Math.random() * 900,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });
    }

    const hero = ref.closest(".hero-section");
    let handleMove;
    if (hero && supportsFineHover()) {
      handleMove = (e) => {
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        animate(ref, {
          translateX: px * depth,
          duration: 700,
          ease: "outQuad",
        });
      };
      hero.addEventListener("mousemove", handleMove);
    }

    onCleanup(() => {
      idleAnim?.pause();
      if (handleMove && hero) hero.removeEventListener("mousemove", handleMove);
    });
  });

  return (
    <div ref={ref} class="floating-sticker" style={props.style}>
      {props.children}
    </div>
  );
}
