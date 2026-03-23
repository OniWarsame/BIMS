import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d"); if (!ctx) return;
    let   raf    = 0;

    /* ── Mouse state ── */
    const M = { x: -999, y: -999, px: -999, py: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.px = M.x; M.py = M.y; M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true;  setTimeout(() => { M.click = false; }, 200); };
    const onUp    = () => { M.down  = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    /* ── Load the image ── */
    const img = new Image();
    img.src = "/bio_theme.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    /* ── Particles that float over the image ── */
    const PARTICLES = Array.from({ length: 80 }, () => ({
      x:  Math.random(),  // 0-1 relative
      y:  Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r:  0.6 + Math.random() * 1.4,
      hue: Math.random() > 0.7 ? 30 : 200,  // orange or cyan
      alpha: 0.25 + Math.random() * 0.45,
    }));

    /* ── Electric arcs (mouse ripples) ── */
    const RIPPLES: { x:number; y:number; r:number; maxR:number; alpha:number; hue:number }[] = [];

    /* ── Scan lines that sweep across different panels ── */
    const SCANLINES = [
      { x:0.02, y:0.05, w:0.45, h:0.44, scanY:0, spd:0.0035, hue:200, label:"BIOMETRIC SCAN" },
      { x:0.53, y:0.05, w:0.45, h:0.44, scanY:0, spd:0.004,  hue:200, label:"FACIAL ANALYSIS" },
      { x:0.02, y:0.52, w:0.45, h:0.45, scanY:0, spd:0.003,  hue:30,  label:"DNA SEQUENCE"    },
      { x:0.53, y:0.52, w:0.45, h:0.45, scanY:0, spd:0.0045, hue:200, label:"SIGNAL TRACE"    },
    ];

    /* ── Data ticker lines ── */
    const TICKERS = Array.from({ length: 6 }, (_, i) => ({
      panel: i % 4,
      y: 0.08 + Math.random() * 0.35,
      x: 0,
      spd: 0.0012 + Math.random() * 0.001,
      text: ["MATCH: 100%", "PATTERN LOCKED", "SCAN COMPLETE", "VERIFIED", "AUTH: OK", "BIO-ID: CONFIRMED", "SERIAL: " + Math.random().toString(36).slice(2,10).toUpperCase()][i],
      hue: i % 2 === 0 ? 200 : 30,
      alpha: 0.4 + Math.random() * 0.3,
    }));

    /* ── Glitch effect state ── */
    let glitchTimer = 0;
    let glitching   = false;

    /* ── Mouse drag: electric trace ── */
    const TRACE: {x:number;y:number;t:number}[] = [];

    let t = 0;

    const draw = () => {
      t += 0.016;
      glitchTimer += 0.016;
      const W = canvas.width, H = canvas.height;

      /* ── 1. DRAW THE IMAGE — FULL BRIGHTNESS, FULL COVERAGE ── */
      if (imgLoaded) {
        // Cover fill — show the entire image
        const iAR = img.width / img.height;
        const cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }

        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "rgb(3,8,22)";
        ctx.fillRect(0, 0, W, H);
      }

      /* ── 2. DARK OVERLAY — preserve image but darken slightly for UI legibility ── */
      ctx.fillStyle = "rgba(2,6,18,0.38)";
      ctx.fillRect(0, 0, W, H);

      /* ── 3. PANEL CORNER BRACKETS — highlight the 4 main image panels ── */
      SCANLINES.forEach((panel, pi) => {
        const px = panel.x * W, py = panel.y * H;
        const pw = panel.w * W, ph = panel.h * H;

        // Animated scan line sweeping through each panel
        panel.scanY += panel.spd;
        if (panel.scanY > 1) panel.scanY = 0;
        const sy = py + panel.scanY * ph;

        const md = M.x > 0 ? Math.min(
          Math.hypot(M.x - (px + pw/2), M.y - (py + ph/2)) / (pw * 0.7),
          1
        ) : 1;
        const proximity = Math.max(0, 1 - md);

        // Scan beam
        const scanGrad = ctx.createLinearGradient(px, sy - 12, px, sy + 12);
        scanGrad.addColorStop(0, "transparent");
        scanGrad.addColorStop(0.5, `hsla(${panel.hue}, 100%, 65%, ${0.25 + proximity * 0.35})`);
        scanGrad.addColorStop(1, "transparent");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(px, sy - 12, pw, 24);

        // Hard scan line
        ctx.beginPath();
        ctx.moveTo(px, sy);
        ctx.lineTo(px + pw, sy);
        ctx.strokeStyle = `hsla(${panel.hue}, 100%, 70%, ${0.6 + proximity * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Corner brackets
        const bLen = 18, bW = 1.8;
        const corners = [
          [px, py, 1, 1], [px+pw, py, -1, 1], [px, py+ph, 1, -1], [px+pw, py+ph, -1, -1]
        ];
        corners.forEach(([bx, by, dx, dy]) => {
          const glow = proximity > 0.3 ? 0.9 : 0.4 + proximity * 1.5;
          ctx.save();
          ctx.shadowBlur = proximity > 0.2 ? 12 : 0;
          ctx.shadowColor = `hsla(${panel.hue}, 100%, 65%, 0.9)`;
          ctx.strokeStyle = `hsla(${panel.hue}, 100%, 68%, ${glow})`;
          ctx.lineWidth = bW;
          ctx.beginPath();
          ctx.moveTo(bx + dx * bLen, by);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx, by + dy * bLen);
          ctx.stroke();
          ctx.restore();
        });

        // Panel label
        ctx.font = `600 ${8 + proximity * 2}px 'Inter', sans-serif`;
        ctx.fillStyle = `hsla(${panel.hue}, 100%, 70%, ${0.35 + proximity * 0.45})`;
        ctx.letterSpacing = "0.2em";
        ctx.fillText(panel.label, px + 4, py - 6);
        ctx.letterSpacing = "0";

        // Horizontal data bars at bottom of each panel (like image's progress bars)
        for (let b = 0; b < 3; b++) {
          const barY = py + ph - 22 + b * 7;
          const barW = (0.3 + 0.5 * Math.abs(Math.sin(t * 0.5 + pi * 0.8 + b * 1.2))) * pw * 0.8;
          ctx.fillStyle = `hsla(${panel.hue}, 100%, 60%, ${0.08 + proximity * 0.07})`;
          ctx.fillRect(px + 6, barY, pw * 0.8, 3);
          ctx.fillStyle = `hsla(${panel.hue === 30 ? 30 : 200}, 90%, 60%, ${0.35 + proximity * 0.25})`;
          ctx.fillRect(px + 6, barY, barW, 3);
        }
      });

      /* ── 4. FLOATING PARTICLES ── */
      PARTICLES.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
        const px = p.x * W, py = p.y * H;
        const md = M.x > 0 ? Math.hypot(px - M.x, py - M.y) : 9999;
        const prx = Math.max(0, 1 - md / 180);

        // Repel from mouse
        if (prx > 0 && md > 1) {
          p.vx += (px - M.x) / md * 0.00008;
          p.vy += (py - M.y) / md * 0.00008;
        }
        // Speed limit + friction
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 0.0015) { p.vx *= 0.0015/spd; p.vy *= 0.0015/spd; }
        p.vx *= 0.998; p.vy *= 0.998;

        // Draw with mouse proximity brightening
        const a = p.alpha + prx * 0.5;
        if (prx > 0.05) {
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(M.x, M.y);
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 65%, ${prx * 0.2})`;
          ctx.lineWidth = prx * 0.8; ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(px, py, p.r + prx * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${a})`;
        if (prx > 0.1) { ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue},100%,65%,0.8)`; }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      /* ── 5. MOUSE DRAG TRACE ── */
      if (M.x > 0 && M.px > 0) {
        TRACE.push({ x: M.x, y: M.y, t });
      }
      // Remove old trace points
      while (TRACE.length > 0 && t - TRACE[0].t > 0.6) TRACE.shift();
      // Draw trace
      if (TRACE.length > 1) {
        for (let i = 1; i < TRACE.length; i++) {
          const age = (t - TRACE[i].t) / 0.6;
          ctx.beginPath();
          ctx.moveTo(TRACE[i-1].x, TRACE[i-1].y);
          ctx.lineTo(TRACE[i].x, TRACE[i].y);
          ctx.strokeStyle = `rgba(0, 220, 255, ${(1 - age) * 0.55})`;
          ctx.lineWidth = (1 - age) * 2.2;
          ctx.stroke();
        }
      }

      /* ── 6. MOUSE INTERACTION — electric field ── */
      if (M.x > 0) {
        // Pulsing glow
        const r = 110 + 12 * Math.sin(t * 4);
        const grd = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r);
        grd.addColorStop(0,   `rgba(0, 200, 255, ${0.12 + 0.05 * Math.sin(t * 3)})`);
        grd.addColorStop(0.4, `rgba(0, 140, 220, 0.04)`);
        grd.addColorStop(1,   "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(M.x, M.y, r, 0, Math.PI * 2); ctx.fill();

        // Expanding ripple ring — adds on click
        if (M.click) {
          RIPPLES.push({ x: M.x, y: M.y, r: 4, maxR: 80 + Math.random() * 40, alpha: 0.8, hue: Math.random() > 0.5 ? 200 : 30 });
        }
      }

      /* ── 7. RIPPLE RINGS ── */
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i];
        rp.r += 2.8; rp.alpha *= 0.93;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.save();
        ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${rp.hue},100%,65%,0.7)`;
        ctx.strokeStyle = `hsla(${rp.hue}, 100%, 68%, ${rp.alpha})`;
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* ── 8. GLITCH EFFECT — random brief distortion ── */
      if (!glitching && glitchTimer > 4 + Math.random() * 6) {
        glitching = true; glitchTimer = 0;
        setTimeout(() => { glitching = false; }, 80 + Math.random() * 120);
      }
      if (glitching && imgLoaded) {
        // Horizontal slice displacement
        const slices = 3 + Math.floor(Math.random() * 4);
        for (let s = 0; s < slices; s++) {
          const gy = Math.random() * H;
          const gh = 2 + Math.random() * 8;
          const gx = (Math.random() - 0.5) * 18;
          ctx.save();
          ctx.drawImage(canvas, 0, gy, W, gh, gx, gy, W, gh);
          ctx.restore();
        }
        // Chromatic aberration stripe
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.globalCompositeOperation = "screen";
        const cy2 = Math.random() * H;
        ctx.fillStyle = "rgba(255, 0, 80, 0.6)";
        ctx.fillRect(-4, cy2, W, 3 + Math.random() * 6);
        ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
        ctx.fillRect(4, cy2 + 2, W, 3 + Math.random() * 6);
        ctx.restore();
      }

      /* ── 9. VIGNETTE ── */
      const vg = ctx.createRadialGradient(W/2, H/2, W * 0.15, W/2, H/2, W * 0.85);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(1,3,12,0.72)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      /* ── 10. PRECISION CROSSHAIR ── */
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const cl  = M.click ? 8  : 12;
        const gap = M.click ? 4  : 7;
        const rr  = M.click ? 7  : 10;

        ctx.save();
        ctx.shadowBlur  = 12;
        ctx.shadowColor = "rgba(0,230,255,0.95)";
        ctx.strokeStyle = "rgba(0,230,255,0.92)";
        ctx.lineWidth   = 1.3;
        ctx.beginPath(); ctx.moveTo(MX-gap-cl, MY); ctx.lineTo(MX-gap, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX+gap, MY); ctx.lineTo(MX+gap+cl, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY-gap-cl); ctx.lineTo(MX, MY-gap); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY+gap); ctx.lineTo(MX, MY+gap+cl); ctx.stroke();
        ctx.beginPath(); ctx.arc(MX, MY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,230,255,${M.click?0.9:0.5})`;
        ctx.lineWidth = 0.9; ctx.stroke();
        ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(MX, MY, M.click?1.5:2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,245,255,0.96)"; ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    ctx.fillStyle = "rgb(3,8,22)"; ctx.fillRect(0,0,canvas.width,canvas.height);
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor:"none" }} />
    </div>
  );
}
