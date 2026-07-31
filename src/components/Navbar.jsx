import { createResource, createSignal, onCleanup, onMount } from "solid-js";
import { fetchCollection } from "../lib/api";
import { buildWhatsAppLink } from "../lib/whatsapp";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [settings] = createResource(() => fetchCollection("site_settings"));

  const toggleMenu = () => setIsOpen(!isOpen());
  const closeMenu = () => setIsOpen(false);

  const handleKeydown = (e) => {
    if (e.key === "Escape" && isOpen()) {
      closeMenu();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    onCleanup(() => window.removeEventListener("keydown", handleKeydown));
  });

  return (
    <header class="navbar-header">
      <nav class="navbar neo-box">
        <div class="navbar-brand">
          <a href="#hero" data-cursor="hover" onClick={closeMenu}><strong>{settings()?.navbar_brand || "WEBLOG"}</strong></a>
        </div>
        
        <button 
          class="hamburger-btn" 
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen()}
          onClick={toggleMenu}
        >
          <span class="hamburger-line" classList={{ 'open': isOpen() }}></span>
          <span class="hamburger-line" classList={{ 'open': isOpen() }}></span>
          <span class="hamburger-line" classList={{ 'open': isOpen() }}></span>
        </button>

        <ul class={`nav-links ${isOpen() ? "open" : ""}`}>
          <li><a href="#about" data-cursor="hover" onClick={closeMenu}>About</a></li>
          <li><a href="#skills" data-cursor="hover" onClick={closeMenu}>Skills</a></li>
          <li><a href="#projects" data-cursor="hover" onClick={closeMenu}>Projects</a></li>
          <li><a href="#experience" data-cursor="hover" onClick={closeMenu}>Experience</a></li>
          <li><a href="#contact" data-cursor="hover" onClick={closeMenu}>Contact</a></li>
          <li><a href={buildWhatsAppLink(settings()?.report_whatsapp_number, settings()?.report_whatsapp_message) || "#"} data-cursor="hover" onClick={closeMenu} class="report-btn">Report</a></li>
        </ul>
      </nav>
    </header>
  );
}
