import { createResource, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { reveal } from "../lib/scrollReveal";
import { revealText } from "../lib/textReveal";
import "./Skills.css";

export default function Skills() {
  // Memanggil data dari collection "skills" di Directus
  const [skillsData] = createResource(() => fetchCollection("skills"));

  // Daftar warna agar tetap random dan bergaya Neo-Brutalism
  const accentColors = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--white)"];
  const getRandomColor = () => accentColors[Math.floor(Math.random() * accentColors.length)];

  return (
    <section id="skills" class="section skills-section" use:reveal>
      <h2 class="section-title" use:revealText>SKILLS</h2>
      
      <Show when={!skillsData.loading} fallback={<p style={{ "text-align": "center", "margin-top": "2rem" }}>Memuat skill dari server...</p>}>
        <Show when={!skillsData.error} fallback={<p style={{ color: "red", "text-align": "center", "margin-top": "2rem" }}>Gagal memuat skill: Pastikan izin Public 'Read' aktif.</p>}>
          
          <div class="skills-grid">
            <For each={skillsData()}>
              {(skill) => (
                <div class="skill-item neo-box" style={{ 
                  "background-color": getRandomColor(),
                  "color": "var(--text-main)"
                }}>
                  {/* Karena di Directus kita akan membuat kolom bernama "name", kita panggil skill.name */}
                  {skill.name}
                </div>
              )}
            </For>
          </div>

        </Show>
      </Show>
    </section>
  );
}
