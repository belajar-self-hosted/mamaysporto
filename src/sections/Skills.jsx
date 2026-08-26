import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { reveal } from "../lib/scrollReveal";
import { revealText } from "../lib/textReveal";
import "./Skills.css";

export default function Skills() {
  // Memanggil data dari collection "skills" di Directus
  const [skillsData] = createResource(() => fetchCollection("skills"));

  // Pasangan {bg, text} warna aksen neo-brutalism — dipasangkan (bukan lepas) supaya kontras
  // teks selalu aman walau accent-1/accent-3 sekarang gelap (bukan pastel lagi).
  const accentPairs = [
    { bg: "var(--accent-1)", text: "var(--white)" },
    { bg: "var(--accent-2)", text: "var(--text-main)" },
    { bg: "var(--accent-3)", text: "var(--white)" },
    { bg: "var(--white)", text: "var(--text-main)" },
  ];
  const getRandomAccent = () => accentPairs[Math.floor(Math.random() * accentPairs.length)];

  return (
    <section id="skills" class="section skills-section">
      <h2 class="section-title" use:revealText>SKILLS</h2>
      
      <Show when={!skillsData.loading} fallback={<p style={{ "text-align": "center", "margin-top": "2rem" }}>Memuat skill dari server...</p>}>
        <Show when={!skillsData.error} fallback={<p style={{ color: "red", "text-align": "center", "margin-top": "2rem" }}>Gagal memuat skill: Pastikan izin Public 'Read' aktif.</p>}>
          
          <div class="skills-grid" use:reveal>
            <For each={skillsData()}>
              {(skill) => {
                const accent = getRandomAccent();
                return (
                <div class="skill-item neo-box" style={{
                  "background-color": accent.bg,
                  "color": accent.text
                }}>
                  <Show when={skill.icon_url}>
                    <img class="skill-icon" src={skill.icon_url} alt="" />
                  </Show>
                  {/* Karena di Directus kita akan membuat kolom bernama "name", kita panggil skill.name */}
                  {skill.name}
                </div>
                );
              }}
            </For>
          </div>

        </Show>
      </Show>
    </section>
  );
}
