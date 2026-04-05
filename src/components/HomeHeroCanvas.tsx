"use client";

import { useEffect, useRef } from "react";

interface Survivor {
    id: number;
    x: number;
    y: number;
    discovered: boolean;
    discoveredAt?: number;
}

export default function HomeHeroCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -1000, y: -1000 });
    const survivorsRef = useRef<Survivor[]>([]);

    useEffect(() => {
        const initialSurvivors: Survivor[] = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            discovered: false
        }));
        survivorsRef.current = initialSurvivors;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const draw = () => {
            if (!canvas || !ctx) return;
            const w = canvas.width;
            const h = canvas.height;
            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            // Base entirely light background
            ctx.fillStyle = "#eff6ff"; // blue-50 (light blue)
            ctx.fillRect(0, 0, w, h);

            ctx.save();

            // Grid lines
            ctx.strokeStyle = "rgba(147, 197, 253, 0.4)"; // blue-300
            ctx.lineWidth = 1;
            const CELL_SIZE = 40;

            ctx.beginPath();
            for (let x = 0; x <= w; x += CELL_SIZE) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            for (let y = 0; y <= h; y += CELL_SIZE) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();

            // Light generic buildings (slightly darker for better structural contrast)
            ctx.fillStyle = "rgba(148, 163, 184, 0.6)"; // slate-400
            for (let i = 0; i < 30; i++) {
                const bx = (i * 277) % w;
                const by = (i * 131) % h;
                const bw = ((i % 5) + 2) * CELL_SIZE;
                const bh = ((i % 4) + 2) * CELL_SIZE;
                ctx.fillRect(bx, by, bw, bh);
            }

            const now = Date.now();
            survivorsRef.current.forEach((s, idx) => {
                const dist = Math.hypot(s.x - mx, s.y - my);
                const lightRadius = 150;

                if (!s.discovered && dist < lightRadius) {
                    s.discovered = true;
                    s.discoveredAt = now;
                }

                if (s.discovered) {
                    const timeSince = now - (s.discoveredAt || now);
                    // Stay visible 1000ms, then fade out over 3000ms. Total 4000ms life
                    if (timeSince > 4000) {
                        survivorsRef.current[idx] = {
                            id: s.id,
                            x: Math.random() * w,
                            y: Math.random() * h,
                            discovered: false
                        };
                        return;
                    }

                    // Calculation: hold 1.0 alpha until 1000ms, then drop to 0 over 3000ms
                    const alpha = Math.max(0, 1 - Math.max(0, timeSince - 1000) / 3000);
                    ctx.fillStyle = "rgba(239, 68, 68, " + alpha + ")";
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
                    ctx.fill();

                    // radar ping effect
                    const pingRadius = 6 + (timeSince / 2000) * 20;
                    const pingAlpha = Math.max(0, 1 - (timeSince / 1000));
                    if (pingAlpha > 0) {
                        ctx.strokeStyle = "rgba(239, 68, 68, " + pingAlpha + ")";
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, pingRadius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else {
                    // Undiscovered dot (dark gray on light background)
                    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.restore();

            const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 250);
            grad.addColorStop(0, "rgba(239, 246, 255, 0)");      // blue-50 clear
            grad.addColorStop(0.3, "rgba(239, 246, 255, 0.4)"); 
            grad.addColorStop(0.8, "rgba(239, 246, 255, 0.95)");
            grad.addColorStop(1, "rgba(239, 246, 255, 1)");      // blue-50 solid

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10"
        />
    );
}
