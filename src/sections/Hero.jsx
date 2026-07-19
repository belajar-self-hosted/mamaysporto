import { createResource, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import Button from "../components/Button";
import "./Hero.css";
import ppTama from "../assets/ppTama.jpeg";

export default function Hero() {
  // Memanggil data dari collection "hero" (Singleton)
  const [heroData] = createResource(() => fetchCollection("hero"));

  return (
    <section id="hero" class="section hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          HALO, AKU <span class="highlight-text">TAMA</span>.<br />
          JUNIOR FULL STACK <span class="highlight-box">DEVELOPER</span>.
        </h1>
        
        <Show when={!heroData.loading} fallback={<p class="hero-subtitle">Memuat deskripsi...</p>}>
          <Show when={!heroData.error} fallback={<p class="hero-subtitle" style={{ color: "red" }}>Gagal memuat deskripsi.</p>}>
            <p class="hero-subtitle">
              {heroData().subtitle}
            </p>
          </Show>
        </Show>
        <div class="hero-cta">
          <Button
            variant="primary"
            onClick={() => document.getElementById("projects").scrollIntoView()}
          >
            View Projects
          </Button>
          <Button
            variant="default"
            onClick={() => document.getElementById("contact").scrollIntoView()}
          >
            Contact Me
          </Button>
          <Button
            variant="default"
            class="btn-ai"
            onClick={() => window.open("https://aspriguatuh.my.id", "_blank")}
          >
            YOWMAN
          </Button>
        </div>
      </div>
      <div class="hero-image-container neo-box">
        <img
          src={ppTama}
          alt="Fannandya Sutan Sakti Pratama"
          class="hero-image"
        />
      </div>
    </section>
  );
}
