import { useRef, useEffect, useCallback } from "react";

export default function BreathingLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const t = Date.now() / 1000;
    const brightness = 0.4 + 0.6 * ((Math.sin(t * Math.PI) + 1) / 2);

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, `rgba(255, 87, 34, ${brightness * 0.8})`);
    gradient.addColorStop(0.4, `rgba(255, 107, 53, ${brightness})`);
    gradient.addColorStop(0.7, `rgba(255, 140, 66, ${brightness * 0.9})`);
    gradient.addColorStop(1, `rgba(255, 107, 53, ${brightness * 0.5})`);

    ctx.clearRect(0, 0, w, 1);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, 1);

    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(([entry]) => {
      canvas.width = Math.round(entry.contentRect.width);
    });
    ro.observe(canvas.parentElement!);

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [draw]);

  return <canvas ref={canvasRef} height={1} className="w-full h-[1px]" />;
}
