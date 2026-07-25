import { createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import { signOut } from "../lib/auth";
import HeroPanel from "./panels/HeroPanel";
import AboutPanel from "./panels/AboutPanel";
import SkillsPanel from "./panels/SkillsPanel";
import ProjectsPanel from "./panels/ProjectsPanel";
import ExperiencePanel from "./panels/ExperiencePanel";
import SiteSettingsPanel from "./panels/SiteSettingsPanel";

const TABS = [
  { key: "hero", label: "Hero", Component: HeroPanel },
  { key: "about", label: "About", Component: AboutPanel },
  { key: "skills", label: "Skills", Component: SkillsPanel },
  { key: "projects", label: "Projects", Component: ProjectsPanel },
  { key: "experience", label: "Experience", Component: ExperiencePanel },
  { key: "settings", label: "Site Settings", Component: SiteSettingsPanel },
];

export default function AdminLayout() {
  const [active, setActive] = createSignal("hero");

  const activeComponent = () => TABS.find((t) => t.key === active())?.Component;

  return (
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-title">CMS Portfolio</div>
        <nav class="admin-nav">
          {TABS.map((tab) => (
            <button
              class={`admin-nav-item ${active() === tab.key ? "active" : ""}`}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <a href="#/" class="admin-nav-item admin-view-site">Lihat Website ↗</a>
        <button class="neo-btn btn-default admin-logout" onClick={() => signOut()}>Logout</button>
      </aside>
      <main class="admin-content">
        <Dynamic component={activeComponent()} />
      </main>
    </div>
  );
}
