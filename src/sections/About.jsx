import { createResource, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { reveal } from "../lib/scrollReveal";
import "./About.css";

export default function About() {
  // Memanggil data dari collection "about"
  // Karena nanti collection "about" diatur sebagai Singleton (Treat as single object),
  // maka aboutData() akan langsung berisi object data, BUKAN array.
  const [aboutData] = createResource(() => fetchCollection("about"));

  return (
    <section id="about" class="section about-section" use:reveal>
      <div class="about-container neo-box">
        <h2 class="section-title">ABOUT ME</h2>
        
        <Show when={!aboutData.loading} fallback={<p style={{ "text-align": "center" }}>Memuat profil...</p>}>
          <Show when={!aboutData.error} fallback={<p style={{ color: "red", "text-align": "center" }}>Gagal memuat profil: Pastikan izin Public 'Read' aktif.</p>}>
            <div class="about-content">
              {/* innerHTML digunakan agar format tulisan tebal (bold) atau link (a href) dari WYSIWYG Directus bisa tampil sempurna */}
              <div class="about-text" innerHTML={aboutData().content}></div>
              
              <div class="about-stats">
                <div class="stat-box neo-box">
                  <span class="stat-number">{aboutData().stat_1_number}</span>
                  <span class="stat-label">{aboutData().stat_1_label}</span>
                </div>
                <div class="stat-box neo-box">
                  <span class="stat-number">{aboutData().stat_2_number}</span>
                  <span class="stat-label">{aboutData().stat_2_label}</span>
                </div>
                <div class="stat-box neo-box">
                  <span class="stat-number">{aboutData().stat_3_number}</span>
                  <span class="stat-label">{aboutData().stat_3_label}</span>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </section>
  );
}
