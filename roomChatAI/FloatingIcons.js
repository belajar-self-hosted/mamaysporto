"use client";

import { useState, useEffect } from "react";
import styles from "./FloatingIcons.module.css";

const TECH_STACKS = [
  { name: "React.js", bg: "#00e5ff" },
  { name: "Next.js", bg: "#ffffff" },
  { name: "Node.js", bg: "#33ff57" },
  { name: "PostgreSQL", bg: "#3388ff" },
  { name: "MySQL", bg: "#ffa500" },
  { name: "TailwindCSS", bg: "#38bdf8" },
  { name: "SQL Server", bg: "#ff3366" },
  { name: "Laravel", bg: "#a020f0" },
  { name: "PHP", bg: "#ffeb3b" },
  { name: "Javascript", bg: "#f7df1e" },
  { name: "Angular", bg: "#1b8a4d" },
  { name: "Vue.js", bg: "#42b883" },
  { name: "Express.js", bg: "#f7df1e" },
  { name: "MongoDB", bg: "#4db33d" },
  { name: "Redis", bg: "#dc382d" },
  { name: "Docker", bg: "#0db7ed" },
  { name: "Kubernetes", bg: "#326ce5" },
  { name: "AWS", bg: "#ff9900" },
  { name: "Azure", bg: "#007fff" },
  { name: "GCP", bg: "#4285f4" },
  { name: "Git", bg: "#f05032" },
  { name: "GitHub", bg: "#19202b" },
  { name: "Bitbucket", bg: "#205081" },
  { name: "Jenkins", bg: "#d33833" },
  { name: "CircleCI", bg: "#343434" },
  { name: "Travis CI", bg: "#3eaaaf" },
  { name: "Vercel", bg: "#053305" },
  { name: "Netlify", bg: "#00c7b7" },
  { name: "Heroku", bg: "#6762a6" },
  { name: "Firebase", bg: "#ffca28" },
  { name: "GraphQL", bg: "#e535ab" },
  { name: "REST API", bg: "#f7df1e" },
  { name: "WebSocket", bg: "#4db33d" },
  { name: "Socket.io", bg: "#25c2a0" },
  { name: "TypeScript", bg: "#3178c6" },
  { name: "Sass", bg: "#cc6699" },
  { name: "Less", bg: "#1d365d" },
  { name: "Bootstrap", bg: "#563d7c" },
  { name: "Material-UI", bg: "#0081cb" },
  { name: "Ant Design", bg: "#1890ff" },
  { name: "Chakra UI", bg: "#319795" },
  { name: "Styled Components", bg: "#db7093" },
  { name: "Emotion", bg: "#f7df1e" },
  { name: "Framer Motion", bg: "#0055ff" },
  { name: "GSAP", bg: "#00ff55" },
  { name: "Three.js", bg: "#000000" },
  { name: "D3.js", bg: "#f7df1e" },
  { name: "Chart.js", bg: "#ff6384" },
  { name: "Highcharts", bg: "#2b908f" },
  { name: "ECharts", bg: "#c23531" },
  { name: "Leaflet", bg: "#3388ff" },
  { name: "Mapbox", bg: "#f7df1e" },
  { name: "OpenLayers", bg: "#007fff" },
  { name: "TensorFlow.js", bg: "#ff6f00" },
  { name: "PyTorch", bg: "#ee4c2c" },
  { name: "Keras", bg: "#d00000" },
  { name: "Scikit-learn", bg: "#f7df1e" },
  { name: "Pandas", bg: "#150458" },
  { name: "NumPy", bg: "#013243" },
  { name: "Matplotlib", bg: "#11557c" },
  { name: "Seaborn", bg: "#4c72b0" },
  { name: "Plotly", bg: "#3f4f75" },
  { name: "Jupyter Notebook", bg: "#f7931e" },
  { name: "VS Code", bg: "#007acc" },
  { name: "Sublime Text", bg: "#ff9800" },
  { name: "Atom", bg: "#66595c" },
  { name: "Vim", bg: "#019733" },
  { name: "Emacs", bg: "#3e3e3e" },
];

export default function FloatingIcons() {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const generatedIcons = TECH_STACKS.map((tech, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      return {
        ...tech,
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * -40,
        duration: 25 + Math.random() * 40,
        startX: -moveX,
        startY: -moveY,
        endX: moveX,
        endY: moveY,
        startRot: Math.random() * 360,
        endRot: Math.random() * 360 + (Math.random() > 0.5 ? 360 : -360),
        scale: 0.6 + Math.random() * 0.8,
      };
    });
    setIcons(generatedIcons);
  }, []);

  return (
    <div className={styles.container}>
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={styles.iconBox}
          style={{
            backgroundColor: icon.bg,
            left: `${icon.left}%`,
            top: `${icon.top}%`,
            animationDelay: `${icon.delay}s`,
            animationDuration: `${icon.duration}s`,
            "--start-x": `${icon.startX}vw`,
            "--start-y": `${icon.startY}vh`,
            "--end-x": `${icon.endX}vw`,
            "--end-y": `${icon.endY}vh`,
            "--start-rot": `${icon.startRot}deg`,
            "--end-rot": `${icon.endRot}deg`,
            "--scale": icon.scale,
          }}
        >
          {icon.name}
        </div>
      ))}
    </div>
  );
}
