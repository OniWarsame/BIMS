import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* ── Mouse ── */
    const M = { x: -999, y: -999, px: -999, py: -999, vx: 0, vy: 0, click: false };
    const onMove = (e: MouseEvent) => {
      M.px = M.x; M.py = M.y;
      M.x = e.clientX; M.y = e.clientY;
      M.vx = M.x - M.px; M.vy = M.y - M.py;
    };
    const onDown = () => { M.click = true; setTimeout(() => { M.click = false; }, 200); };
    const onOut  = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseleave", onOut);

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener("resize", resize);

    /* ── Image ── */
    const img = new Image();
    img.src = "/best.jpg";
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.onerror = () => { imgOK = false; };

    /* ── Particle types ── */
    interface Mote   { x:number; y:number; vx:number; vy:number; r:number; br:number; hue:number; amber:boolean; }
    interface Ring   { x:number; y:number; r:number; maxR:number; a:number; w:number; amber:boolean; }
    interface Ember  { x:number; y:number; vx:number; vy:number; life:number; ml:number; amber:boolean; }
    interface Tendril{ pts:{x:number;y:number}[]; a:number; amber:boolean; }
    interface Trail  { x:number; y:number; t:number; }

    let MOTES:   Mote[]    = [];
    const RINGS:    Ring[]    = [];
    const EMBERS:   Ember[]   = [];
    const TENDRILS: Tendril[] = [];
    const TRAIL:    Trail[]   = [];

    function init() {
      const W = canvas.width, H = canvas.height;
      MOTES = Array.from({ length: 55 }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 0, br: i < 8 ? 2.8 + Math.random() * 1.8 : 0.9 + Math.random() * 1.6,
        hue: i % 6 === 0 ? 36 : i % 4 === 0 ? 188 : 195,
        amber: i % 6 === 0,
      }));
      MOTES.forEach(m => { m.r = m.br; });
    }

    function spawnTendril() {
      if (M.x < 0) return;
      const spd = Math.hypot(M.vx, M.vy);
      if (spd < 2) return;
      const ang = Math.atan2(M.vy, M.vx);
      const pts: { x: number; y: number }[] = [];
      let cx = M.x, cy = M.y;
      for (let i = 0; i < 24; i++) {
        pts.push({ x: cx, y: cy });
        const drift = (Math.random() - 0.5) * 0.7;
        cx += Math.cos(ang + drift) * 11 + (Math.random() - 0.5) * 5;
        cy += Math.sin(ang + drift) * 11 + (Math.random() - 0.5) * 5;
      }
      TENDRILS.push({ pts, a: 0.7 + Math.random() * 0.3, amber: Math.random() > 0.55 });
    }

    function spawnEmbers(x: number, y: number) {
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 4.5;
        EMBERS.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, ml: 40 + Math.random() * 45, amber: Math.random() > 0.45 });
      }
    }

    /* ── Draw ── */
    function draw() {
      T += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1 ─ Background image — FULL ORIGINAL, no dark overlay */
      if (imgOK) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "hsl(205,55%,5%)";
        ctx.fillRect(0, 0, W, H);
      }

      /* 2 ─ Barely-there vignette — only outer rim, image centre fully clear */
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.44, W * 0.2, W * 0.5, H * 0.44, W * 0.82);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(0.75, "rgba(2,8,14,0.08)");
      vg.addColorStop(1, "rgba(1,5,10,0.42)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      /* 3 ─ Motes — attract to cursor */
      for (const m of MOTES) {
        m.x += m.vx; m.y += m.vy;
        if (m.x < 0) m.x = W; if (m.x > W) m.x = 0;
        if (m.y < 0) m.y = H; if (m.y > H) m.y = 0;
        if (M.x > 0) {
          const dx = M.x - m.x, dy = M.y - m.y, d = Math.hypot(dx, dy);
          if (d < 230 && d > 1) {
            const f = 0.018 * (1 - d / 230);
            m.vx += dx / d * f; m.vy += dy / d * f;
            m.r = m.br * (1 + 0.85 * (1 - d / 230));
          } else { m.r += (m.br - m.r) * 0.08; }
        }
        const s = Math.hypot(m.vx, m.vy);
        if (s > 0.95) { m.vx *= 0.95 / s; m.vy *= 0.95 / s; }
        m.vx *= 0.994; m.vy *= 0.994;
      }

      /* Mote connections */
      for (let i = 0; i < MOTES.length; i++) {
        for (let j = i + 1; j < MOTES.length; j++) {
          const dx = MOTES[i].x - MOTES[j].x, dy = MOTES[i].y - MOTES[j].y;
          const d = Math.hypot(dx, dy);
          if (d > 145) continue;
          const a = (1 - d / 145) * 0.11;
          const col = (MOTES[i].amber || MOTES[j].amber) ? `rgba(195,135,25,${a})` : `rgba(55,190,215,${a})`;
          ctx.beginPath(); ctx.moveTo(MOTES[i].x, MOTES[i].y); ctx.lineTo(MOTES[j].x, MOTES[j].y);
          ctx.strokeStyle = col; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* Mote dots */
      const pulse = 0.5 + 0.5 * Math.sin(T * 1.4);
      for (const m of MOTES) {
        const alpha = m.br > 2 ? 0.75 * pulse : 0.42 * pulse;
        const col = m.amber ? `hsla(36,82%,58%,${alpha})` : `hsla(${m.hue},72%,68%,${alpha})`;
        const glow = m.amber ? "rgba(195,135,25,0.75)" : "rgba(50,185,215,0.75)";
        if (m.br > 2) {
          ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = glow;
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (0.9 + 0.15 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = m.amber ? `rgba(195,135,25,${0.12 * pulse})` : `rgba(50,185,215,${0.12 * pulse})`;
          ctx.lineWidth = 0.7; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (0.85 + 0.2 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
        }
      }

      /* 4 ─ Iris breath rings from eye centre */
      const EX = W * 0.5, EY = H * 0.44;
      [[W * 0.07, 0.10], [W * 0.12, 0.065], [W * 0.18, 0.040], [W * 0.25, 0.022]].forEach(([r, a], idx) => {
        const breath = r + W * 0.006 * Math.sin(T * 0.65 + idx);
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = "rgba(50,185,215,0.35)";
        ctx.beginPath(); ctx.arc(EX, EY, breath, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(60,195,225,${(a as number) * (0.75 + 0.25 * Math.sin(T * 0.8 + idx))})`;
        ctx.lineWidth = 0.75; ctx.setLineDash([7, 20]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      });

      /* Amber breath rings — mimic the gold in the iris */
      [[W * 0.055, 0.08], [W * 0.09, 0.05]].forEach(([r, a], idx) => {
        const breath = r + W * 0.004 * Math.sin(T * 0.9 + idx + 1.5);
        ctx.beginPath(); ctx.arc(EX, EY, breath, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(195,135,25,${(a as number) * (0.7 + 0.3 * Math.sin(T * 1.1 + idx))})`;
        ctx.lineWidth = 0.6; ctx.setLineDash([4, 16]); ctx.stroke(); ctx.setLineDash([]);
      });

      /* 5 ─ Mouse effects */
      if (M.x > 0) {
        /* Outer teal iris bloom */
        const R1 = 190 + 18 * Math.sin(T * 2.2);
        const g1 = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, R1);
        g1.addColorStop(0, `rgba(45,185,215,${0.11 + 0.04 * Math.sin(T * 3.5)})`);
        g1.addColorStop(0.45, "rgba(20,130,170,0.03)");
        g1.addColorStop(1, "transparent");
        ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(M.x, M.y, R1, 0, Math.PI * 2); ctx.fill();

        /* Inner amber ember glow */
        const R2 = 36 + 5 * Math.sin(T * 6.5);
        const g2 = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, R2);
        g2.addColorStop(0, `rgba(205,145,35,${0.24 + 0.09 * Math.sin(T * 5.5)})`);
        g2.addColorStop(0.6, "rgba(160,100,18,0.05)");
        g2.addColorStop(1, "transparent");
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(M.x, M.y, R2, 0, Math.PI * 2); ctx.fill();

        /* Rotating teal iris ring */
        ctx.save(); ctx.translate(M.x, M.y); ctx.rotate(T * 1.7);
        ctx.beginPath(); ctx.arc(0, 0, 30 + 3.5 * Math.sin(T * 4.2), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(55,195,225,${0.52 + 0.2 * Math.sin(T * 2.8)})`; ctx.lineWidth = 1.1;
        ctx.setLineDash([6, 13]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

        /* Counter-rotating amber ring */
        ctx.save(); ctx.translate(M.x, M.y); ctx.rotate(-T * 2.5);
        ctx.beginPath(); ctx.arc(0, 0, 19 + 2 * Math.sin(T * 7.5), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(205,145,35,${0.42 + 0.16 * Math.sin(T * 4)})`; ctx.lineWidth = 0.85;
        ctx.setLineDash([3, 8]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

        /* Scanning cross-hairs */
        const ch = 22, ca = 0.24 + 0.10 * Math.sin(T * 2.6);
        ctx.strokeStyle = `rgba(55,195,225,${ca})`; ctx.lineWidth = 0.75;
        ctx.beginPath(); ctx.moveTo(M.x - ch, M.y); ctx.lineTo(M.x + ch, M.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x, M.y - ch); ctx.lineTo(M.x, M.y + ch); ctx.stroke();

        /* Corner brackets — like a targeting reticle */
        const bl = 8, bd = 18;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
          const bx = M.x + sx * bd, by = M.y + sy * bd;
          ctx.strokeStyle = `rgba(205,145,35,${ca * 1.1})`; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(bx, by - sy * bl); ctx.lineTo(bx, by); ctx.lineTo(bx - sx * bl, by); ctx.stroke();
        });
      }

      /* 6 ─ Mouse trail */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t: T });
      while (TRAIL.length > 0 && T - TRAIL[0].t > 0.48) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (T - TRAIL[i].t) / 0.48;
        ctx.beginPath(); ctx.moveTo(TRAIL[i - 1].x, TRAIL[i - 1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `rgba(55,192,220,${(1 - age) * 0.45})`; ctx.lineWidth = (1 - age) * 2.2; ctx.stroke();
      }

      /* 7 ─ Organic tendril lines from fast movement */
      spawnTendril();
      for (let i = TENDRILS.length - 1; i >= 0; i--) {
        const v = TENDRILS[i]; v.a *= 0.86;
        if (v.a < 0.02) { TENDRILS.splice(i, 1); continue; }
        ctx.beginPath(); ctx.moveTo(v.pts[0].x, v.pts[0].y);
        for (let j = 1; j < v.pts.length; j++) ctx.lineTo(v.pts[j].x, v.pts[j].y);
        ctx.strokeStyle = v.amber ? `rgba(200,140,30,${v.a * 0.5})` : `rgba(55,192,220,${v.a * 0.48})`;
        ctx.lineWidth = 0.9; ctx.stroke();
      }

      /* 8 ─ Click rings + embers */
      if (M.click && M.x > 0) {
        RINGS.push({ x: M.x, y: M.y, r: 5, maxR: 135, a: 0.9, w: 1.8, amber: false });
        RINGS.push({ x: M.x, y: M.y, r: 5, maxR: 82,  a: 0.7, w: 1.3, amber: true  });
        RINGS.push({ x: M.x, y: M.y, r: 5, maxR: 46,  a: 0.55,w: 1,   amber: false });
        spawnEmbers(M.x, M.y);
      }
      for (let i = RINGS.length - 1; i >= 0; i--) {
        const rp = RINGS[i]; rp.r += 3.4; rp.a *= 0.91;
        ctx.save(); ctx.shadowBlur = 13; ctx.shadowColor = rp.amber ? "rgba(205,145,35,0.7)" : "rgba(50,190,220,0.7)";
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = rp.amber ? `rgba(205,145,35,${rp.a})` : `rgba(55,195,225,${rp.a})`;
        ctx.lineWidth = rp.w; ctx.stroke(); ctx.restore();
        if (rp.r >= rp.maxR) RINGS.splice(i, 1);
      }
      for (let i = EMBERS.length - 1; i >= 0; i--) {
        const e = EMBERS[i]; e.x += e.vx; e.y += e.vy; e.vx *= 0.964; e.vy *= 0.964; e.life++;
        if (e.life >= e.ml) { EMBERS.splice(i, 1); continue; }
        const p = e.life / e.ml, a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        ctx.beginPath(); ctx.arc(e.x, e.y, 2.6 * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = e.amber ? `rgba(210,150,40,${Math.max(0, a) * 0.9})` : `rgba(55,195,225,${Math.max(0, a) * 0.9})`;
        ctx.fill();
      }

      /* 9 ─ Ultra-subtle iris sweep — just a whisper */
      const sY = ((T * 0.026) % 1) * H;
      const sg = ctx.createLinearGradient(0, sY - 2, 0, sY + 2);
      sg.addColorStop(0, "transparent"); sg.addColorStop(0.5, "rgba(55,192,220,0.022)"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(0, sY - 2, W, 4);

      raf = requestAnimationFrame(draw);
    }

    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    init();
    ctx.fillStyle = "hsl(205,55%,5%)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseleave", onOut);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
