import "./About.css";

export default function About() {
  return (
    <section id="about" class="section about-section">
      <div class="about-container neo-box">
        <h2 class="section-title">ABOUT ME</h2>
        <div class="about-content">
          <div class="about-text">
            <p>
              Hello! I'm a developer who loves building things that live on the internet. My interest in web development started back in 2018 when I decided to try editing custom Tumblr themes — turns out hacking together HTML & CSS taught me a lot about HTML & CSS!
            </p>
            <p>
              Fast-forward to today, and I've had the privilege of working at an advertising agency, a start-up, a huge corporation, and a student-led design studio. My main focus these days is building accessible, inclusive products and digital experiences at Upstatement for a variety of clients.
            </p>
          </div>
          <div class="about-stats">
            <div class="stat-box neo-box">
              <span class="stat-number">5+</span>
              <span class="stat-label">Years of Experience</span>
            </div>
            <div class="stat-box neo-box">
              <span class="stat-number">50+</span>
              <span class="stat-label">Projects Completed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
