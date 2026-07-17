import { experiences } from "../data/experience";
import "./Experience.css";

export default function Experience() {
  return (
    <section id="experience" class="section experience-section">
      <h2 class="section-title">EXPERIENCE</h2>
      <div class="timeline">
        {experiences.map((exp, index) => (
          <div class="timeline-item neo-box">
            <div class="timeline-dot" style={{ "background-color": index % 2 === 0 ? "var(--accent-1)" : "var(--accent-2)" }}></div>
            <div class="timeline-content">
              <h3 class="exp-role">{exp.role}</h3>
              <div class="exp-meta">
                <span class="exp-company">{exp.company}</span>
                <span class="exp-period">{exp.period}</span>
              </div>
              <p class="exp-desc">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
