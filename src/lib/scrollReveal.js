import { onCleanup } from "solid-js";

// Solid custom directive: use:reveal
// Toggles the "is-visible" class as the element enters/leaves the viewport,
// so it fades in on scroll down and fades back out on scroll up (or past it).
export function reveal(el, accessor) {
  const options = (typeof accessor === "function" ? accessor() : accessor) || {};
  const threshold = options.threshold ?? 0.15;

  el.classList.add("reveal-on-scroll");

  if (typeof IntersectionObserver === "undefined") {
    el.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      el.classList.toggle("is-visible", entry.isIntersecting);
    },
    { threshold, rootMargin: "0px 0px -10% 0px" }
  );

  observer.observe(el);

  onCleanup(() => observer.disconnect());
}
