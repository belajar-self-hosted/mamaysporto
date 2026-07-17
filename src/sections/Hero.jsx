import Button from "../components/Button";
import "./Hero.css";

export default function Hero() {
  return (
    <section id="hero" class="section hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          HI, I'M <span class="highlight-text">JOHN DOE</span>.<br />
          I BUILD <span class="highlight-box">THINGS</span> FOR THE WEB.
        </h1>
        <p class="hero-subtitle">
          I'm a Frontend Developer passionate about creating interactive, accessible, and brutalist user experiences using SolidJS.
        </p>
        <div class="hero-cta">
          <Button variant="primary" onClick={() => document.getElementById('projects').scrollIntoView()}>View My Work</Button>
          <Button variant="default" onClick={() => document.getElementById('contact').scrollIntoView()}>Contact Me</Button>
        </div>
      </div>
      <div class="hero-image-container neo-box">
        {/* Placeholder for profile image */}
        <img src="https://placehold.co/400x400/0b0c10/00ebc7?text=Profile" alt="John Doe" class="hero-image" />
      </div>
    </section>
  );
}
