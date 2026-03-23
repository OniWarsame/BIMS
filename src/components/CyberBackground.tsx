import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, t = 0;

    const M = { x: -1, y: -1, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => { M.click = false; }, 220); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -1; M.y = -1; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    /* ── Background image ── */
    const img = new Image();
    img.src = "/fp_bg.jpg";
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.onerror = () => { imgOK = false; };

    /* ── Interfaces ── */
    interface Ring { x: number; y: number; r: number; maxR: number; a: number; hue: number; }
    interface Dot  { x: number; y: number; vx: number; vy: number; life: number; ml: number; }
    interface Beam { x: number; y: number; len: number; spd: number; a: number; }

    /* ── Circuit lines emanating from image focal point (center-ish) ── */
    const N = 44;
    const nx  = Array.from({ length: N }, () => Math.random());
    const ny  = Array.from({ length: N }, () => Math.random());
    const nvx = Array.from({ length: N }, () => (Math.random() - 0.5) * 0.00022);
    const nvy = Array.from({ length: N }, () => (Math.random() - 0.5) * 0.00022);
    const nr  = Array.from({ length: N }, (_,i) => i < 6 ? 3 + Math.random() * 2.5 : 1 + Math.random() * 2);

    /* ── Horizontal data streams (matching circuit board aesthetic) ── */
    const BEAMS: Beam[] = Array.from({ length: 10 }, () => ({
      x: -0.1,
      y: Math.random(),
      len: 0.04 + Math.random() * 0.12,
      spd: 0.0004 + Math.random() * 0.0006,
      a: 0.4 + Math.random() * 0.5,
    }));

    const RINGS: Ring[] = [];
    const DOTS:  Dot[]  = [];
    const TRAIL: { x: number; y: number; t: number }[] = [];

    function spawnDots(x: number, y: number) {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3.5;
        DOTS.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, ml: 45 + Math.random() * 35 });
      }
    }

    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1 — Draw background image */
      if (imgOK) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        /* Fallback gradient — teal/dark matching fp_bg */
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, "hsl(218,65%,5%)");
        g.addColorStop(0.5, "hsl(225,60%,4%)");
        g.addColorStop(1, "hsl(220,65%,4%)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      /* 2 — Layered overlay: dark base + teal tint matching the image palette */
      ctx.fillStyle = "rgba(0,8,18,0.58)";
      ctx.fillRect(0, 0, W, H);

      /* Teal accent overlay matching the circuit board image */
      const blueGlow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
      blueGlow.addColorStop(0, `rgba(50,150,255,${0.04 + 0.02 * Math.sin(t * 0.8)})`);
      blueGlow.addColorStop(0.6, "rgba(30,100,220,0.02)");
      blueGlow.addColorStop(1, "transparent");
      ctx.fillStyle = blueGlow;
      ctx.fillRect(0, 0, W, H);

      /* 3 — Floating network nodes */
      for (let i = 0; i < N; i++) {
        nx[i] += nvx[i]; ny[i] += nvy[i];
        if (nx[i] < 0) nx[i] = 1; if (nx[i] > 1) nx[i] = 0;
        if (ny[i] < 0) ny[i] = 1; if (ny[i] > 1) ny[i] = 0;
        /* repel from mouse */
        if (M.x >= 0) {
          const dx = nx[i] * W - M.x, dy = ny[i] * H - M.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180 && d > 1) { nvx[i] += (dx / d) * 0.00005; nvy[i] += (dy / d) * 0.00005; }
        }
        const spd = Math.sqrt(nvx[i] ** 2 + nvy[i] ** 2);
        if (spd > 0.0012) { nvx[i] *= 0.0012 / spd; nvy[i] *= 0.0012 / spd; }
        nvx[i] *= 0.994; nvy[i] *= 0.994;
      }
      /* edges */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = (nx[i] - nx[j]) * W, dy = (ny[i] - ny[j]) * H;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(nx[i] * W, ny[i] * H);
            ctx.lineTo(nx[j] * W, ny[j] * H);
            ctx.strokeStyle = `rgba(50,150,255,${(1 - d / 130) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      /* dots */
      const pulse = 0.6 + 0.4 * Math.sin(t * 1.6);
      for (let i = 0; i < N; i++) {
        const x = nx[i] * W, y = ny[i] * H, r = nr[i];
        ctx.beginPath();
        ctx.arc(x, y, r * (0.85 + 0.2 * pulse), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(55,158,255,${(i < 6 ? 0.72 : 0.28) * pulse})`;
        ctx.fill();
        if (i < 6) {
          ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(50,150,255,${0.16 * pulse})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      /* 4 — Horizontal data beams (circuit line aesthetic) */
      for (const b of BEAMS) {
        b.x += b.spd;
        if (b.x - b.len > 1.1) { b.x = -b.len; b.y = Math.random(); }
        const x1 = Math.max(0, (b.x - b.len)) * W, x2 = Math.min(1, b.x) * W, y = b.y * H;
        if (x2 > x1) {
          const g = ctx.createLinearGradient(x1, y, x2, y);
          g.addColorStop(0, "transparent");
          g.addColorStop(0.7, `rgba(60,165,255,${b.a * 0.35})`);
          g.addColorStop(1, `rgba(80,190,255,${b.a * 0.7})`);
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
          ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
          /* bright head dot */
          ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = "rgba(80,195,255,0.92)";
          ctx.beginPath(); ctx.arc(x2, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80,190,255,${b.a * 0.9})`; ctx.fill(); ctx.restore();
        }
      }

      /* 5 — Mouse soft teal aura */
      if (M.x >= 0) {
        const R = 170;
        const mg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, R);
        mg.addColorStop(0, `rgba(50,150,255,${0.10 + 0.04 * Math.sin(t * 3)})`);
        mg.addColorStop(0.5, "rgba(30,100,220,0.04)");
        mg.addColorStop(1, "transparent");
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(M.x, M.y, R, 0, Math.PI * 2); ctx.fill();
      }

      /* 6 — Mouse trail */
      if (M.x >= 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.38) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.38;
        ctx.beginPath();
        ctx.moveTo(TRAIL[i - 1].x, TRAIL[i - 1].y);
        ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `rgba(60,165,255,${(1 - age) * 0.45})`;
        ctx.lineWidth = (1 - age) * 2;
        ctx.stroke();
      }

      /* 7 — Click: teal rings + sparks */
      if (M.click && M.x >= 0) {
        RINGS.push({ x: M.x, y: M.y, r: 4, maxR: 95, a: 0.85, hue: 180 });
        RINGS.push({ x: M.x, y: M.y, r: 4, maxR: 55, a: 0.6,  hue: 190 });
        spawnDots(M.x, M.y);
      }
      for (let i = RINGS.length - 1; i >= 0; i--) {
        const rp = RINGS[i]; rp.r += 3.2; rp.a *= 0.90;
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = `rgba(60,170,255,0.85)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,70%,${rp.a})`;
        ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        if (rp.r >= rp.maxR) RINGS.splice(i, 1);
      }
      for (let i = DOTS.length - 1; i >= 0; i--) {
        const d = DOTS[i];
        d.x += d.vx; d.y += d.vy; d.vx *= 0.965; d.vy *= 0.965; d.life++;
        if (d.life >= d.ml) { DOTS.splice(i, 1); continue; }
        const p = d.life / d.ml, a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        ctx.beginPath(); ctx.arc(d.x, d.y, 2.5 * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60,165,255,${Math.max(0, a) * 0.88})`; ctx.fill();
      }

      /* 8 — Subtle scanning horizontal line that slowly moves */
      const scanY = ((t * 0.035) % 1) * H;
      const scanG = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
      scanG.addColorStop(0, "transparent");
      scanG.addColorStop(0.5, `rgba(60,165,255,0.04)`);
      scanG.addColorStop(1, "transparent");
      ctx.fillStyle = scanG; ctx.fillRect(0, scanY - 1, W, 2);

      /* 9 — Deep vignette */
      const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.22, W / 2, H / 2, W * 0.9);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,4,12,0.78)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "hsl(220,62%,5%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
