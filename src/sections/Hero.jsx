import Button from "../components/Button";
import "./Hero.css";

export default function Hero() {
  return (
    <section id="hero" class="section hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          HALO, AKU <span class="highlight-text">TAMA</span>.<br />
          FULL STACK <span class="highlight-box">DEVELOPER</span>.
        </h1>
        <p class="hero-subtitle">
          Nama lengkapku Fannandya Sutan Sakti Pratama. Seorang mahasiswa prodi Teknik Informasi UMY yang tertarik pada Web Development, Computer Networking, dan optimasi AI.
        </p>
        <div class="hero-cta">
          <Button variant="primary" onClick={() => document.getElementById('projects').scrollIntoView()}>Lihat Projek</Button>
          <Button variant="default" onClick={() => document.getElementById('contact').scrollIntoView()}>Hubungi Aku</Button>
        </div>
      </div>
      <div class="hero-image-container neo-box">
        {/* Placeholder for profile image */}
        <img src="https://placehold.co/400x400/0b0c10/00ebc7?text=Tama" alt="Fannandya Sutan Sakti Pratama" class="hero-image" />
      </div>
    </section>
  );
}
