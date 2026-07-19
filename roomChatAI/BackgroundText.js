"use client";

import { useEffect, useRef } from "react";
import styles from "./BackgroundText.module.css";

const TEXTS = [
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
  "MARI BERKOLABORASI • WUJUDKAN IDE MENJADI SOLUSI",
];

export default function BackgroundText() {
  const containerRef = useRef(null);
  const elsRef = useRef([]);
  const posRef = useRef([]);
  const speedsRef = useRef([]);
  const dirRef = useRef(1);
  const rafRef = useRef(null);

  useEffect(() => {
    posRef.current = TEXTS.map(() => Math.random() * 160 - 30);
    speedsRef.current = TEXTS.map(() => 0.05 + Math.random() * 0.08);

    const chatArea = document.querySelector("[data-chat-area]");
    if (!chatArea) return;

    let lastScroll = chatArea.scrollTop;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const curr = chatArea.scrollTop;
          const diff = curr - lastScroll;
          if (Math.abs(diff) > 2) {
            dirRef.current = diff > 0 ? -1 : 1;
          }
          lastScroll = curr;
          ticking = false;
        });
        ticking = true;
      }
    };

    chatArea.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      const dir = dirRef.current;
      posRef.current = posRef.current.map((pos, i) => {
        let newPos = pos + dir * speedsRef.current[i];
        if (newPos < -40) newPos = 140;
        if (newPos > 140) newPos = -40;
        return newPos;
      });

      elsRef.current.forEach((el, i) => {
        if (el) el.style.transform = `translateX(${posRef.current[i]}vw)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      chatArea.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {TEXTS.map((text, i) => (
        <span
          key={i}
          ref={(el) => { elsRef.current[i] = el; }}
          className={styles.text}
          style={{
            top: `${5 + (i / TEXTS.length) * 90}%`,
            fontSize: `${1.2 + Math.sin(i * 2.7) * 1.2 + 1.3}rem`,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
