import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer class="footer neo-box">
      <div class="footer-content">
        <div class="footer-logo">
          <strong>PORTFOLIO</strong>
        </div>
        <div class="footer-social">
          <a href="#" class="social-link neo-box" aria-label="GitHub">GH</a>
          <a href="#" class="social-link neo-box" aria-label="LinkedIn">IN</a>
          <a href="#" class="social-link neo-box" aria-label="Twitter">TW</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {year} Fannandya Sutan. Built with SolidJS.</p>
      </div>
    </footer>
  );
}
