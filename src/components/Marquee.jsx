import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { useMarqueeRepeat } from "../lib/marqueeRepeat";
import "./Marquee.css";

export default function Marquee() {
  const [skills] = createResource(() => fetchCollection("skills"));
  const { repeat, setContainerRef, setGroupRef } = useMarqueeRepeat();

  const items = () => (skills() || []).map((s) => s.name);

  return (
    <Show when={items().length > 0}>
      <div class="marquee" aria-hidden="true" ref={setContainerRef}>
        <div class="marquee-track">
          <For each={[0, 1]}>
            {(groupValue) => (
              <div class="marquee-group" ref={groupValue === 0 ? setGroupRef : undefined}>
                <For each={Array.from({ length: repeat() })}>
                  {() => (
                    <For each={items()}>
                      {(item) => (
                        <span class="marquee-item">
                          {item}
                          <span class="marquee-sep">✦</span>
                        </span>
                      )}
                    </For>
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
