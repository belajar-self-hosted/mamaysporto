import { createResource, For } from "solid-js";
import { fetchCollection } from "../lib/api";
import "./Marquee.css";

const FALLBACK_ITEMS = ["FULL STACK DEVELOPER", "OPEN TO WORK", "LET'S BUILD SOMETHING"];

export default function Marquee() {
  const [skills] = createResource(() => fetchCollection("skills"));

  const items = () => {
    const list = skills();
    return list && list.length > 0 ? list.map((s) => s.name) : FALLBACK_ITEMS;
  };

  return (
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <For each={[0, 1]}>
          {() => (
            <div class="marquee-group">
              <For each={items()}>
                {(item) => (
                  <span class="marquee-item">
                    {item}
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
