import { skills } from "../data/skills";
import "./Skills.css";

export default function Skills() {
  return (
    <section id="skills" class="section skills-section">
      <h2 class="section-title">SKILLS</h2>
      <div class="skills-grid">
        {skills.map((skill, index) => (
          <div class="skill-item neo-box" style={{ 
            "background-color": index % 3 === 0 ? "var(--accent-1)" : index % 3 === 1 ? "var(--accent-3)" : "var(--white)",
            "color": "var(--text-main)"
          }}>
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}
