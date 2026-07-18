import Button from "../components/Button";
import "./Hero.css";
import ppTama from "../assets/ppTama.jpeg";

export default function Hero() {
  return (
    <section id="hero" class="section hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          HALO, AKU <span class="highlight-text">TAMA</span>.<br />
          JUNIOR FULL STACK <span class="highlight-box">DEVELOPER</span>.
        </h1>
        <p class="hero-subtitle">
          Salken! Aku seorang junior full stack developer yang bersemangat untuk
          terus belajar dan berkembang dalam dunia teknologi, pengen tau aku
          lebih lanjut? silahkan kunjungi asisten pribadiku .
        </p>
        <div class="hero-cta">
          <Button
            variant="primary"
            onClick={() => document.getElementById("projects").scrollIntoView()}
          >
            Lihat Projek
          </Button>
          <Button
            variant="default"
            onClick={() => document.getElementById("contact").scrollIntoView()}
          >
            Hubungi Aku
          </Button>
          <Button
            variant="default"
            class="btn-ai"
            onClick={() => window.open("https://aspriguatuh.my.id", "_blank")}
          >
            Asisten Pribadi
          </Button>
        </div>
      </div>
      <div class="hero-image-container neo-box">
        <img
          src={ppTama}
          alt="Fannandya Sutan Sakti Pratama"
          class="hero-image"
        />
      </div>
    </section>
  );
}
