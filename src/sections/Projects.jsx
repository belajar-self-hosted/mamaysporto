import { projects } from "../data/projects";
import Card from "../components/Card";
import Button from "../components/Button";
import "./Projects.css";

export default function Projects() {
  return (
    <section id="projects" class="section projects-section">
      <h2 class="section-title">PROJECTS</h2>
      <div class="projects-grid">
        {projects.map((project) => (
          <Card class="project-card">
            <div class="project-image-wrapper">
              <img src={project.image} alt={project.title} loading="lazy" class="project-image" />
            </div>
            <div class="project-info">
              <h3 class="project-title">{project.title}</h3>
              <p class="project-desc">{project.description}</p>
              <div class="project-tags">
                {project.tags.map(tag => (
                  <span class="project-tag">{tag}</span>
                ))}
              </div>
              <div class="project-links">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary">Live Demo</Button>
                </a>
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="default">GitHub</Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
