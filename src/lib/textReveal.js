import { onCleanup } from "solid-js";
import { animate, stagger, EASE_OUT, prefersReducedMotion } from "./motion";

/** Bungkus tiap kata (text node) di dalam `root` dengan <span class="reveal-word">, tanpa merusak elemen anak (mis. <br>, <span> highlight). */
function wrapWords(root) {
  if (typeof document === "undefined") return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() !== "") textNodes.push(node);
  }

  const spans = [];
  textNodes.forEach((textNode) => {
    const frag = document.createDocumentFragment();
    textNode.nodeValue.split(/(\s+)/).forEach((part) => {
      if (part === "") return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.className = "reveal-word";
      span.textContent = part;
      frag.appendChild(span);
      spans.push(span);
    });
    textNode.parentNode.replaceChild(frag, textNode);
  });

  return spans;
}

/**
 * Solid directive: use:revealText
 * Split teks jadi per kata, stagger-in saat elemen masuk viewport (fade out lagi saat keluar).
 * Pakai accessor `{ immediate: true }` untuk elemen yang sudah above-the-fold (mis. Hero) —
 * animasi langsung jalan saat mount, tidak menunggu scroll.
 */
export function revealText(el, accessor) {
  const options = (typeof accessor === "function" ? accessor() : accessor) || {};
  const immediate = options.immediate ?? false;
  const delayStep = options.stagger ?? 24;

  if (prefersReducedMotion()) return;

  // onCleanup harus didaftarkan sinkron (di owner context directive ini) — observer-nya
  // baru dibuat belakangan di dalam microtask, makanya pakai closure var yang diisi nanti.
  let observer;
  onCleanup(() => observer?.disconnect());

  // Elemen dengan child dinamis (mis. {heroData().greeting}) baru diisi Solid lewat
  // render-effect SETELAH directive ini jalan. queueMicrotask nunggu render-effect itu
  // selesai dulu supaya wrapWords lihat teks final, bukan node kosong/placeholder.
  queueMicrotask(() => {
    const spans = wrapWords(el);
    if (spans.length === 0) return;

    const play = () => {
      animate(spans, {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(delayStep),
        duration: 480,
        ease: EASE_OUT,
      });
    };

    const hide = () => {
      animate(spans, {
        opacity: 0,
        translateY: 16,
        duration: 220,
        ease: "outQuad",
      });
    };

    if (immediate) {
      requestAnimationFrame(play);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else hide();
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
  });
}
