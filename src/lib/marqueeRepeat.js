import { createSignal, onMount, onCleanup } from "solid-js";

/**
 * Hitung berapa kali satu "set" item perlu diulang di dalam tiap grup marquee,
 * supaya lebar satu grup SELALU >= lebar container — syarat wajib biar teknik
 * infinite-loop (translateX 0 -> -50%) tidak pernah menyisakan celah kosong,
 * berapa pun jumlah item atau lebar layarnya.
 */
export function useMarqueeRepeat(initial = 6) {
  const [repeat, setRepeat] = createSignal(initial);
  let containerRef;
  let groupRef;

  const measure = () => {
    if (!containerRef || !groupRef) return;
    const currentRepeat = repeat();
    const groupWidth = groupRef.scrollWidth;
    const containerWidth = containerRef.clientWidth;
    if (!groupWidth || !containerWidth || !currentRepeat) return;

    const setWidth = groupWidth / currentRepeat;
    if (!setWidth) return;

    // Buffer 1.4x + 1 set ekstra supaya aman dari pembulatan & resize mendadak.
    const needed = Math.ceil((containerWidth / setWidth) * 1.4) + 1;
    if (needed > currentRepeat) setRepeat(needed);
  };

  onMount(() => {
    measure();

    if (typeof ResizeObserver !== "undefined" && containerRef) {
      const ro = new ResizeObserver(measure);
      ro.observe(containerRef);
      onCleanup(() => ro.disconnect());
    }

    // Cadangan di luar ResizeObserver (mis. window di-drag ke monitor lain / zoom berubah).
    window.addEventListener("resize", measure);
    onCleanup(() => window.removeEventListener("resize", measure));
  });

  return {
    repeat,
    setContainerRef: (el) => (containerRef = el),
    setGroupRef: (el) => (groupRef = el),
  };
}
