import { createResource, For } from "solid-js";
import { fetchCollection } from "../lib/api";
import "./Marquee.css";

const FALLBACK_TEXT = "Ada pertanyaan tentang aku? Tanya langsung ke YOWMAN, asisten AI pribadiku!";

/** Teks berjalan kiri-ke-kanan di bawah chat container, isinya diatur lewat Site Settings admin panel. */
export default function ChatTicker() {
  const [settings] = createResource(() => fetchCollection("site_settings"));

  const text = () => settings()?.chat_ticker_text?.trim() || FALLBACK_TEXT;

  return (
    <div class="marquee marquee-reverse" aria-hidden="true">
      <div class="marquee-track">
        <For each={[0, 1]}>
          {() => (
            <div class="marquee-group">
              <For each={[0, 1, 2, 3]}>
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
