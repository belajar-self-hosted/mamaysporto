import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { supportsFineHover } from "../lib/motion";
import "./CustomCursor.css";

/** Cursor kustom kotak neobrutalism. Hanya aktif di device dengan hover presisi (bukan touch). */
export default function CustomCursor() {
  const [enabled] = createSignal(supportsFineHover());
  const [active, setActive] = createSignal(false);
  const [hovering, setHovering] = createSignal(false);
  let dotRef;

  onMount(() => {
    if (!enabled()) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-on");

    const handleMove = (e) => {
      setActive(true);
      if (dotRef) dotRef.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const target = e.target.closest?.('[data-cursor="hover"]');
      setHovering(!!target);
    };
    const handleLeave = () => setActive(false);
    const handleEnter = () => setActive(true);

    window.addEventListener("mousemove", handleMove);
    root.addEventListener("mouseleave", handleLeave);
    root.addEventListener("mouseenter", handleEnter);

    onCleanup(() => {
      root.classList.remove("custom-cursor-on");
      window.removeEventListener("mousemove", handleMove);
      root.removeEventListener("mouseleave", handleLeave);
      root.removeEventListener("mouseenter", handleEnter);
    });
  });

  return (
    <Show when={enabled()}>
      <div
        ref={dotRef}
        class="custom-cursor"
        classList={{ "custom-cursor-active": active(), "custom-cursor-hover": hovering() }}
      />
    </Show>
  );
}
