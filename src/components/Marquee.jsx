import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import "./Marquee.css";

export default function Marquee() {
  const [skills] = createResource(() => fetchCollection("skills"));

  const items = () => (skills() || []).map((s) => s.name);

  return (
    <Show when={items().length > 0}>
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
    </Show>
  );
}
