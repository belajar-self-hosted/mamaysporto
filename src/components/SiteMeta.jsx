import { createResource, createEffect } from "solid-js";
import { fetchCollection } from "../lib/api";

function setFavicon(url) {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

/** Menerapkan judul tab browser & favicon dari site_settings (tanpa render DOM). */
export default function SiteMeta() {
  const [settings] = createResource(() => fetchCollection("site_settings"));

  createEffect(() => {
    const data = settings();
    if (!data) return;
    if (data.site_title) document.title = data.site_title;
    if (data.favicon_url) setFavicon(data.favicon_url);
  });

  return null;
}
