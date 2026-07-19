import { createSignal, onCleanup, onMount } from "solid-js";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = createSignal(false);
  
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
          <a href="#hero" onClick={closeMenu}><strong>WEBLOG</strong></a>
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
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#skills" onClick={closeMenu}>Skills</a></li>
          <li><a href="#projects" onClick={closeMenu}>Projects</a></li>
          <li><a href="#experience" onClick={closeMenu}>Experience</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          <li><a href="https://wa.me/6285190847766?text=halo%20admin%20saya%20ingin%20melaporkan%20bug%20yang%20terdapat%20di%20website%20mamay.my.id%20berupa:%20" onClick={closeMenu} class="report-btn">Report</a></li>
        </ul>
      </nav>
    </header>
  );
}
