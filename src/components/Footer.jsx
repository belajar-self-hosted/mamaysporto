import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer class="footer neo-box">
      <div class="footer-content">
        <div class="footer-logo">
          <strong>TAMA.</strong>
        </div>
        <div class="footer-social">
          <a
            href="https://github.com/fannandya"
            class="social-link neo-box"
            aria-label="GitHub"
          >
            GH
          </a>
          <a
            href="https://www.linkedin.com/in/fannandya-sutan-2538a831b?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
            class="social-link neo-box"
            aria-label="LinkedIn"
          >
            IN
          </a>
          <a
            href="https://instagram.com/sutanfannandya"
            class="social-link neo-box"
            aria-label="Instagram"
          >
            IG
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {year} Fannandya Sutan Sakti Pratama. Built with SolidJS.</p>
      </div>
    </footer>
  );
}
