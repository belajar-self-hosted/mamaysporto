// src/components/PostList.jsx
//
// Contoh mengganti UI data statis dengan data dinamis dari Directus.
// createResource otomatis menangani state loading/error untuk kita.

import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";

export default function PostList() {
  // Ganti "posts" dengan nama collection Directus kamu yang sebenarnya
  const [posts] = createResource(() => fetchCollection("posts"));

  return (
    <Show when={!posts.loading} fallback={<p>Memuat data...</p>}>
      <Show
        when={!posts.error}
        fallback={<p>Terjadi kesalahan: {posts.error?.message}</p>}
      >
        <ul>
          <For each={posts()}>
            {(post) => <li>{post.title}</li>}
          </For>
        </ul>
      </Show>
    </Show>
  );
}
