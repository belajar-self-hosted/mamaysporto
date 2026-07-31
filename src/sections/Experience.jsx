import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { reveal } from "../lib/scrollReveal";
import "./Experience.css";

export default function Experience() {
  // Memanggil data dari collection "experience" di Directus
  const [experienceData] = createResource(() => fetchCollection("experience"));

  return (
    <section id="experience" class="section experience-section" use:reveal>
      <h2 class="section-title">EXPERIENCE</h2>
      
      <Show when={!experienceData.loading} fallback={<p style={{ "text-align": "center", "margin-top": "2rem" }}>Memuat pengalaman dari server...</p>}>
        <Show when={!experienceData.error} fallback={<p style={{ color: "red", "text-align": "center", "margin-top": "2rem" }}>Gagal memuat pengalaman: Pastikan izin Public 'Read' aktif.</p>}>
          
          <div class="timeline">
            <For each={experienceData()}>
              {(exp, index) => (
                <div class="timeline-item neo-box">
                  {/* Gunakan fungsi SolidJS (index()) untuk angka indeks loop */}
                  <div class="timeline-dot" style={{ "background-color": index() % 2 === 0 ? "var(--accent-1)" : "var(--accent-2)" }}></div>
                  <div class="timeline-content">
                    <h3 class="exp-role">{exp.role}</h3>
                    <div class="exp-meta">
                      <span class="exp-company">{exp.company}</span>
                      <span class="exp-period">{exp.period}</span>
                    </div>
                    <p class="exp-desc">{exp.description}</p>
                  </div>
                </div>
              )}
            </For>
          </div>

        </Show>
      </Show>
    </section>
  );
}
