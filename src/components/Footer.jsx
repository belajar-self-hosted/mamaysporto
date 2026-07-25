import { createResource, For } from "solid-js";
import { fetchCollection } from "../lib/api";
import { normalizeUrl } from "../lib/url";
import SocialIcon, { platformLabel } from "../lib/socialIcons.jsx";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings] = createResource(() => fetchCollection("site_settings"));

  return (
    <footer class="footer neo-box">
      <div class="footer-content">
        <div class="footer-logo">
          <strong>{settings()?.footer_name || "FANNANDYA."}</strong>
        </div>
        <div class="footer-social">
          <For each={settings()?.social_links || []}>
            {(link) => (
              <a
                href={normalizeUrl(link.url)}
                class="social-link neo-box"
                aria-label={platformLabel(link.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon url={link.url} />
              </a>
            )}
          </For>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {year} Fannandya Sutan Sakti Pratama. Built with SolidJS.</p>
      </div>
    </footer>
  );
}
