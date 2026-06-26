"use client";

import { useEffect, useRef } from "react";

type Theme = "dark" | "light";

export default function MatrixBg({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 12;
    const columns = Math.floor(canvas.width / (fontSize * 2));
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      const bgAlpha = theme === "dark" ? "rgba(10,10,15,0.15)" : "rgba(244,245,247,0.2)";
      ctx.fillStyle = bgAlpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.98) {
          const text = "01"[Math.floor(Math.random() * 2)];
          const x = i * fontSize * 2;
          const y = drops[i] * fontSize;
          const alpha = theme === "dark" ? Math.random() * 0.06 + 0.01 : Math.random() * 0.04 + 0.005;
          ctx.fillStyle = theme === "dark" ? `rgba(0,255,136,${alpha})` : `rgba(0,168,86,${alpha})`;
          ctx.fillText(text, x, y);
        }
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) drops[i] = 0;
        drops[i] += 0.5;
      }
    };

    const interval = setInterval(draw, 80);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }} />;
}
