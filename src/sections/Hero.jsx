import { createResource, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { normalizeUrl } from "../lib/url";
import Button from "../components/Button";
import "./Hero.css";
import ppTama from "../assets/ppTama.jpeg";

export default function Hero() {
  // Memanggil data dari collection "hero" (Singleton)
  const [heroData] = createResource(() => fetchCollection("hero"));

  return (
    <section id="hero" class="section hero-section">
      <div class="hero-content">
        <Show when={!heroData.loading} fallback={<h1 class="hero-title">Memuat...</h1>}>
          <Show when={!heroData.error} fallback={<h1 class="hero-title">Gagal memuat data.</h1>}>
            <h1 class="hero-title">
              {heroData().greeting} <span class="highlight-text">{heroData().display_name}</span>.<br />
              {heroData().role_prefix} <span class="highlight-box">{heroData().role_highlight}</span>.
            </h1>
            <p class="hero-subtitle">
              {heroData().subtitle}
            </p>
            <div class="hero-cta">
              <Button
                variant="primary"
                onClick={() => document.getElementById("projects").scrollIntoView()}
              >
                {heroData().cta_projects_label}
              </Button>
              <Button
                variant="default"
                onClick={() => document.getElementById("contact").scrollIntoView()}
              >
                {heroData().cta_contact_label}
              </Button>
              <Button
                variant="default"
                class="btn-ai"
                onClick={() => window.open(normalizeUrl(heroData().cta_yowman_link), "_blank")}
              >
                {heroData().cta_yowman_label}
              </Button>
            </div>
          </Show>
        </Show>
      </div>
      <div class="hero-image-container neo-box">
        <img
          src={heroData()?.image || ppTama}
          alt="Fannandya Sutan Sakti Pratama"
          class="hero-image"
        />
      </div>
    </section>
  );
}
