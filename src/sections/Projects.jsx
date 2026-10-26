import { createResource, createSignal, For, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import { normalizeUrl } from "../lib/url";
import Card from "../components/Card";
import Button from "../components/Button";
import { reveal } from "../lib/scrollReveal";
import { revealText } from "../lib/textReveal";
import "./Projects.css";

const CATEGORY_TABS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "localhost", label: "Localhost" },
];

export default function Projects() {
  // Memanggil data dari collection "projects" (sesuai nama yang Anda buat di Directus)
  const [projectsData] = createResource(() => fetchCollection("projects"));
  const [activeCategory, setActiveCategory] = createSignal("all");

  const sortedAndFilteredProjects = () => {
    const all = projectsData() || [];
    const filtered = activeCategory() === "all" ? all : all.filter((p) => p.category === activeCategory());

    return [...filtered].sort((a, b) => {
      const hasImageA = Boolean(a.image && a.image.trim() !== "");
      const hasImageB = Boolean(b.image && b.image.trim() !== "");

      // 1. Prioritaskan project yang memiliki foto di posisi atas
      if (hasImageA && !hasImageB) return -1;
      if (!hasImageA && hasImageB) return 1;

      // 2. Urutan sekunder: ID terbaru ke terlama (ID descending)
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  };

  // Pasangan {bg, text} warna aksen neo-brutalism dari index.css — dipasangkan (bukan lepas)
  // supaya kontras teks selalu aman walau accent-1/accent-3 sekarang gelap (bukan pastel lagi).
  const accentPairs = [
    { bg: "var(--accent-1)", text: "var(--white)" },
    { bg: "var(--accent-2)", text: "var(--text-main)" },
    { bg: "var(--accent-3)", text: "var(--white)" },
  ];

  // Fungsi untuk mengambil pasangan warna secara acak
  const getRandomAccent = () => accentPairs[Math.floor(Math.random() * accentPairs.length)];

  return (
    <section id="projects" class="section projects-section">
      <h2 class="section-title" use:revealText>PROJECTS</h2>
      
      {/* Menampilkan teks loading jika data sedang diambil */}
      <Show when={!projectsData.loading} fallback={<p style={{ "text-align": "center", "margin-top": "2rem" }}>Loading projects from server...</p>}>
        
        {/* Menampilkan error jika ada masalah koneksi/permission */}
        <Show when={!projectsData.error} fallback={<p style={{ color: "red", "text-align": "center", "margin-top": "2rem" }}>Failed to load projects: Please check server connection.</p>}>

          <div class="projects-tabs">
            <For each={CATEGORY_TABS}>
              {(tab) => (
                <button
                  type="button"
                  class="projects-tab"
                  classList={{ "is-active": activeCategory() === tab.value }}
                  onClick={() => setActiveCategory(tab.value)}
                >
                  {tab.label}
                </button>
              )}
            </For>
          </div>

          <Show
            when={sortedAndFilteredProjects().length > 0}
            fallback={<p class="projects-empty">No projects found in this category.</p>}
          >
            <div class="projects-grid" use:reveal={{ threshold: 0.02 }}>
              {/* Menggunakan <For> dari SolidJS untuk melakukan iterasi data reaktif */}
              <For each={sortedAndFilteredProjects()}>
                {(project, index) => {
                  const accent = getRandomAccent();
                  return (
                  <Card class="project-card">
                    <div class="project-image-wrapper">
                      <Show
                        when={project.image && project.image.trim() !== ""}
                        fallback={
                          <div class="project-image-placeholder">
                            <span class="project-placeholder-title">{project.title}</span>
                          </div>
                        }
                      >
                        <img src={project.image} alt={project.title} loading="lazy" class="project-image" />
                      </Show>
                      <span class="project-index">{index() + 1}</span>
                    </div>
                    {/* Memanggil fungsi random color di sini */}
                    <div class="project-info" style={{ "background-color": accent.bg, color: accent.text }}>
                      <div class="project-title-row">
                        <h3 class="project-title">{project.title}</h3>
                        <span class={`project-status-badge project-status-${project.category === "localhost" ? "localhost" : "live"}`}>
                          {project.category === "localhost" ? "💻 Localhost" : "🟢 Live"}
                        </span>
                      </div>
                      <p class="project-desc">{project.description}</p>
                      <div class="project-tags">
                        {/* Pastikan project.tags adalah array (JSON di Directus) */}
                        {project.tags && project.tags.map(tag => (
                          <span class="project-tag">{tag}</span>
                        ))}
                      </div>
                      <div class="project-links">
                        {/* Tampilkan tombol Live Demo hanya jika link diisi */}
                        <Show when={project.link && project.link !== "#" && project.link !== ""}>
                          <a href={normalizeUrl(project.link)} target="_blank" rel="noopener noreferrer">
                            <Button variant="live">Live Demo</Button>
                          </a>
                        </Show>
                        {/* Tampilkan tombol GitHub hanya jika github diisi */}
                        <Show when={project.github && project.github !== "#" && project.github !== ""}>
                          <a href={normalizeUrl(project.github)} target="_blank" rel="noopener noreferrer">
                            <Button variant="default">GitHub</Button>
                          </a>
                        </Show>
                      </div>
                    </div>
                  </Card>
                  );
                }}
              </For>
            </div>
          </Show>

        </Show>
      </Show>
    </section>
  );
}
