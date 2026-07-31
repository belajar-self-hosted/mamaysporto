import { createResource, For } from "solid-js";
import { fetchCollection } from "../lib/api";
import { useMarqueeRepeat } from "../lib/marqueeRepeat";
import "./Marquee.css";

const FALLBACK_TEXT = "Ada pertanyaan tentang aku? Tanya langsung ke YOWMAN, asisten AI pribadiku!";

/** Teks berjalan kiri-ke-kanan di bawah chat container, isinya diatur lewat Site Settings admin panel. */
export default function ChatTicker() {
  const [settings] = createResource(() => fetchCollection("site_settings"));
  const { repeat, setContainerRef, setGroupRef } = useMarqueeRepeat();

  const text = () => settings()?.chat_ticker_text?.trim() || FALLBACK_TEXT;

  return (
    <div class="marquee marquee-reverse" aria-hidden="true" ref={setContainerRef}>
      <div class="marquee-track">
        <For each={[0, 1]}>
          {(groupValue) => (
            <div class="marquee-group" ref={groupValue === 0 ? setGroupRef : undefined}>
              <For each={Array.from({ length: repeat() })}>
                {() => (
                  <span class="marquee-item">
                    {text()}
                    <span class="marquee-sep">✦</span>
                  </span>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
