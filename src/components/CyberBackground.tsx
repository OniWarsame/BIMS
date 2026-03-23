import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, t = 0;

    const M = { x: -999, y: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 200); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);

    // Load background image
    const img = new Image();
    img.src = "/cyber_bg.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    interface Particle { x:number; y:number; vx:number; vy:number; r:number; hue:number; alpha:number; life:number; maxLife:number; }
    interface Ripple { x:number; y:number; r:number; maxR:number; a:number; hue:number; rings:number; }
    interface Arc { cx:number; cy:number; r:number; startA:number; endA:number; spd:number; hue:number; width:number; alpha:number; }
    interface Spark { x:number; y:number; vx:number; vy:number; life:number; hue:number; }
    interface ScanLine { y:number; spd:number; alpha:number; }

    const PARTICLES: Particle[] = [];
    const RIPPLES: Ripple[] = [];
    const SPARKS: Spark[] = [];
    const ARCS: Arc[] = [];
    const SCANLINES: ScanLine[] = [];

    // Mouse trail
    const TRAIL: {x:number;y:number;t:number}[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rebuildArcs();
    };

    function rebuildArcs() {
      ARCS.length = 0;
      const W = canvas.width, H = canvas.height;
      const cx = W * 0.5, cy = H * 0.5;
      const baseR = Math.min(W, H) * 0.08;
      // Concentric spinning rings centred on screen
      const configs = [
        { r: baseR * 0.6,  spd:  0.008, hue: 192, w: 1.2, a: 0.5 },
        { r: baseR * 1.1,  spd: -0.006, hue: 175, w: 0.8, a: 0.35 },
        { r: baseR * 1.7,  spd:  0.005, hue: 192, w: 1.5, a: 0.4 },
        { r: baseR * 2.4,  spd: -0.004, hue: 160, w: 1.0, a: 0.3 },
        { r: baseR * 3.2,  spd:  0.003, hue: 192, w: 1.8, a: 0.25 },
        { r: baseR * 4.1,  spd: -0.0025,hue: 175, w: 0.7, a: 0.2 },
        { r: baseR * 5.1,  spd:  0.002, hue: 192, w: 1.2, a: 0.15 },
      ];
      configs.forEach(c => {
        const gap = Math.random() * Math.PI;
        ARCS.push({ cx, cy, r: c.r, startA: gap, endA: gap + Math.PI * (1.2 + Math.random() * 0.8), spd: c.spd, hue: c.hue, width: c.w, alpha: c.a });
      });
      SCANLINES.length = 0;
      for (let i = 0; i < 5; i++) {
        SCANLINES.push({ y: Math.random(), spd: 0.0006 + Math.random() * 0.0008, alpha: 0.04 + Math.random() * 0.04 });
      }
    }

    function spawnParticle(x: number, y: number) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.3 + Math.random() * 1.5;
      PARTICLES.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 1 + Math.random() * 2.5,
        hue: Math.random() > 0.6 ? 192 : 160,
        alpha: 0.7 + Math.random() * 0.3,
        life: 0, maxLife: 60 + Math.random() * 80,
      });
    }

    // Ambient floating particles
    let ambTimer = 0;

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      t += 0.016;
      ambTimer += 0.016;
      const W = canvas.width, H = canvas.height;

      // ── 1. DRAW IMAGE BACKGROUND ──
      if (imgLoaded) {
        const iAR = img.width / img.height;
        const cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "rgb(0,8,20)"; ctx.fillRect(0, 0, W, H);
      }

      // ── 2. DARK OVERLAY — preserve image, add depth ──
      ctx.fillStyle = "rgba(0,4,14,0.52)";
      ctx.fillRect(0, 0, W, H);

      // ── 3. MOUSE-REACTIVE RADIAL LIGHT ──
      if (M.x > 0) {
        const pulse = 1 + 0.06 * Math.sin(t * 5);
        const r1 = (180 + 20 * Math.sin(t * 2.5)) * pulse;
        const mg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r1);
        mg.addColorStop(0,   `rgba(0,220,255,${0.18 + 0.06 * Math.sin(t * 4)})`);
        mg.addColorStop(0.35,`rgba(0,160,220,0.07)`);
        mg.addColorStop(1,   "transparent");
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(M.x, M.y, r1, 0, Math.PI * 2); ctx.fill();

        // Secondary green halo
        const r2 = 80 + 10 * Math.sin(t * 3.2);
        const mg2 = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r2);
        mg2.addColorStop(0,   `rgba(0,255,180,0.1)`);
        mg2.addColorStop(1,   "transparent");
        ctx.fillStyle = mg2;
        ctx.beginPath(); ctx.arc(M.x, M.y, r2, 0, Math.PI * 2); ctx.fill();
      }

      // ── 4. SPINNING RING ARCS ──
      ARCS.forEach(arc => {
        arc.startA += arc.spd;
        arc.endA   += arc.spd;
        const md = M.x > 0 ? Math.min(Math.hypot(M.x - arc.cx, M.y - arc.cy) / (arc.r * 3), 1) : 1;
        const boost = 1 + (1 - md) * 0.8;
        ctx.save();
        ctx.shadowBlur  = 8 + (1 - md) * 18;
        ctx.shadowColor = `hsla(${arc.hue},100%,65%,0.9)`;
        ctx.strokeStyle = `hsla(${arc.hue},100%,70%,${arc.alpha * boost})`;
        ctx.lineWidth   = arc.width * boost;
        ctx.beginPath();
        ctx.arc(arc.cx, arc.cy, arc.r, arc.startA, arc.endA);
        ctx.stroke();
        // Tick marks on arcs
        const ticks = Math.floor(arc.r / 12);
        for (let k = 0; k < ticks; k++) {
          const a = arc.startA + (arc.endA - arc.startA) * (k / ticks);
          const tx1 = arc.cx + (arc.r - 4) * Math.cos(a);
          const ty1 = arc.cy + (arc.r - 4) * Math.sin(a);
          const tx2 = arc.cx + (arc.r + 4) * Math.cos(a);
          const ty2 = arc.cy + (arc.r + 4) * Math.sin(a);
          ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2);
          ctx.strokeStyle = `hsla(${arc.hue},100%,75%,${arc.alpha * 0.6 * boost})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
        ctx.restore();
      });

      // ── 5. SCAN LINES ──
      SCANLINES.forEach(sl => {
        sl.y += sl.spd;
        if (sl.y > 1) sl.y = 0;
        const sy = sl.y * H;
        const sg = ctx.createLinearGradient(0, sy - 3, 0, sy + 3);
        sg.addColorStop(0, "transparent");
        sg.addColorStop(0.5, `rgba(0,220,255,${sl.alpha})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.fillRect(0, sy - 3, W, 6);
      });

      // ── 6. AMBIENT SPAWNING PARTICLES ──
      if (ambTimer > 0.3) {
        ambTimer = 0;
        spawnParticle(Math.random() * W, Math.random() * H);
      }
      if (M.down) spawnParticle(M.x + (Math.random()-0.5)*20, M.y + (Math.random()-0.5)*20);

      // ── 7. PARTICLES ──
      for (let i = PARTICLES.length - 1; i >= 0; i--) {
        const p = PARTICLES[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97;
        p.life++;
        if (p.life >= p.maxLife) { PARTICLES.splice(i, 1); continue; }
        const prog = p.life / p.maxLife;
        const alpha = p.alpha * (prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8);
        ctx.save();
        ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue},100%,70%,0.8)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - prog * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,72%,${Math.max(0, alpha)})`;
        ctx.fill(); ctx.restore();
      }

      // ── 8. MOUSE TRAIL ──
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.6) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.6;
        const hue = 170 + (1 - age) * 22;
        ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x, TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `hsla(${hue},100%,65%,${(1-age)*0.5})`;
        ctx.lineWidth = (1-age)*2.8; ctx.stroke();
      }

      // ── 9. RIPPLES ──
      if (M.click && M.x > 0) {
        RIPPLES.push({ x: M.x, y: M.y, r: 3, maxR: 100 + Math.random() * 60, a: 0.9, hue: 192, rings: 3 + Math.floor(Math.random() * 3) });
        RIPPLES.push({ x: M.x, y: M.y, r: 3, maxR: 55,  a: 0.7, hue: 160, rings: 2 });
        for (let s = 0; s < 12; s++) spawnParticle(M.x, M.y);
      }
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i];
        rp.r += 3.2; rp.a *= 0.91;
        for (let ring = 0; ring < rp.rings; ring++) {
          const rr = rp.r - ring * 10;
          if (rr <= 0) continue;
          ctx.save();
          ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${rp.hue},100%,65%,0.7)`;
          ctx.beginPath(); ctx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${rp.hue},100%,70%,${rp.a * (1 - ring * 0.25)})`;
          ctx.lineWidth = 1.5 - ring * 0.3; ctx.stroke();
          ctx.restore();
        }
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      // ── 10. HUD CORNER BRACKETS ──
      const cBrk = [
        [0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]
      ] as const;
      cBrk.forEach(([bx, by, dx, dy]) => {
        const L = 36;
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = "rgba(0,220,255,0.8)";
        ctx.strokeStyle = "rgba(0,220,255,0.65)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + dx * L, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + dy * L); ctx.stroke();
        // Small inner dot
        ctx.beginPath(); ctx.arc(bx + dx * 3, by + dy * 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,200,0.6)"; ctx.fill();
        ctx.restore();
      });

      // ── 11. HUD TEXT ──
      ctx.font = "700 7.5px 'IBM Plex Mono',monospace";
      ctx.fillStyle = "rgba(0,220,255,0.28)";
      ctx.fillText("BIMS v1.0 · CLASSIFIED", 42, 14);
      ctx.fillText(`T+${(t%100).toFixed(1)}s`, W - 110, 14);
      ctx.fillText("◈ SYSTEM SECURE", 42, H - 9);
      const st = ["SCANNING","AUTHENTICATING","VERIFIED","ENCRYPTING"][Math.floor(t/2.5)%4];
      ctx.fillStyle = `rgba(0,255,160,${0.3+0.1*Math.sin(t*4)})`;
      ctx.fillText(`◉ ${st}`, W - 138, H - 9);

      // ── 12. VIGNETTE ──
      const vg = ctx.createRadialGradient(W/2, H/2, W*0.18, W/2, H/2, W*0.9);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,2,8,0.78)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // ── 13. CROSSHAIR ──
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const gap = M.click ? 4 : 7, arm = M.click ? 12 : 16, rr = M.click ? 9 : 13;
        const rot = t * 35; // degrees
        ctx.save();
        ctx.translate(MX, MY); ctx.rotate(rot * Math.PI / 180); ctx.translate(-MX, -MY);
        ctx.shadowBlur = 18; ctx.shadowColor = "rgba(0,240,255,0.95)";
        ctx.strokeStyle = "rgba(0,240,255,0.9)"; ctx.lineWidth = 1.3;
        // Four arms
        ctx.beginPath(); ctx.moveTo(MX-gap-arm, MY); ctx.lineTo(MX-gap, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX+gap, MY); ctx.lineTo(MX+gap+arm, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY-gap-arm); ctx.lineTo(MX, MY-gap); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY+gap); ctx.lineTo(MX, MY+gap+arm); ctx.stroke();
        ctx.restore();
        // Static rings
        ctx.save();
        ctx.shadowBlur = 16; ctx.shadowColor = "rgba(0,240,255,0.8)";
        ctx.beginPath(); ctx.arc(MX, MY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${M.click?0.85:0.45})`; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.setLineDash([3, 8]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.arc(MX, MY, rr + 9, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,200,255,0.22)"; ctx.lineWidth = 0.7; ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 22;
        ctx.beginPath(); ctx.arc(MX, MY, M.click?1.6:2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,255,0.98)"; ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "rgb(0,4,12)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: "none" }} />
    </div>
  );
}
