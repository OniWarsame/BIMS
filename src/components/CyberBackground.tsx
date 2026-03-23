import React, { useEffect, useRef } from "react";

/**
 * CyberBackground — extracted from Index.tsx theme
 * 
 * Theme analysis from the uploaded Index.tsx:
 *  - Background: hsla(215,55%,4%-5%) — very dark blue-navy  
 *  - Primary accent: hsl(192,100%,52-68%) — electric cyan / teal
 *  - Secondary accent: hsl(185,100%,55-76%) — lighter cyan
 *  - Amber/warning: hsl(38,85-100%,60-70%) — warm amber for fingerprint scanner
 *  - Success: hsl(140,100%,50-65%) — neon green
 *  - Error: hsl(0,80-100%,55-80%) — red
 *  - Text: hsl(192,55%,94%) / hsl(200,80%,90%)
 *  - Panels: hsla(215,55%,4-5%,0.82-0.97) — deep navy glass
 *  - Borders: hsla(192,100%,52%,0.18-0.45)
 *  - Font stack: 'Rajdhani','Segoe UI' for body; 'Orbitron',monospace for HUD; 'Courier New',monospace for data
 *  - Glows: drop-shadow and box-shadow with hsla(192,100%,52%) / hsla(185,100%,55%)
 */

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, t = 0;

    /* ── Mouse ── */
    const M = { x: -999, y: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 200); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    /* ── Types ── */
    interface Star      { x:number; y:number; r:number; a:number; twinkle:number; twinkleSpd:number; }
    interface Particle  { x:number; y:number; vx:number; vy:number; r:number; hue:number; a:number; life:number; maxLife:number; }
    interface Ripple    { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface Node      { x:number; y:number; vx:number; vy:number; hue:number; r:number; pulse:number; pulseSpd:number; bright:number; }
    interface DataLine  { x:number; y:number; len:number; spd:number; a:number; hue:number; }

    /* ── Stars (deep space background) ── */
    let STARS: Star[]      = [];
    const PARTICLES: Particle[] = [];
    const RIPPLES:   Ripple[]   = [];
    let NODES:       Node[]     = [];
    let DATALINES:   DataLine[] = [];
    const TRAIL: { x:number; y:number; t:number }[] = [];

    /* ── Colour palette from Index.tsx ── */
    // Primary cyan: hsl(192,100%,52%)  hsl(185,100%,62%)
    // Amber/warm:   hsl(38,85%,62%)
    // Dark navy bg: hsla(215,55%,4-5%)
    const C = {
      cyan:   192,   // primary
      teal:   185,   // secondary
      amber:   38,   // warm accent
      green:  140,   // success
      purple: 270,   // DM / purple accent
    };

    function buildScene(W: number, H: number) {
      /* Stars */
      STARS = Array.from({ length: 180 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.3 + Math.random() * 1.1,
        a: 0.15 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpd: 0.008 + Math.random() * 0.022,
      }));

      /* Neural nodes */
      NODES = Array.from({ length: 55 }, (_, i) => {
        const isHub = i < 7;
        const hues = [C.cyan, C.teal, C.amber, C.green, C.purple];
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * (isHub ? 0.18 : 0.35),
          vy: (Math.random() - 0.5) * (isHub ? 0.18 : 0.35),
          hue: isHub ? C.cyan : hues[Math.floor(Math.random() * hues.length)],
          r: isHub ? 4 + Math.random() * 3 : 1.5 + Math.random() * 2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpd: 0.022 + Math.random() * 0.04,
          bright: isHub ? 0.9 : 0.4 + Math.random() * 0.5,
        };
      });

      /* Vertical data streams (like in Index panels) */
      DATALINES = Array.from({ length: 8 }, () => ({
        x: Math.random() * W,
        y: Math.random(),
        len: 0.05 + Math.random() * 0.18,
        spd: 0.0005 + Math.random() * 0.001,
        a:   0.22 + Math.random() * 0.35,
        hue: Math.random() > 0.6 ? C.cyan : Math.random() > 0.5 ? C.teal : C.amber,
      }));
    }

    function spawnBurst(x: number, y: number, n = 12, hue = C.cyan) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const s = 0.8 + Math.random() * 2.8;
        PARTICLES.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
          r: 1 + Math.random() * 2.2, hue, a: 0.85, life: 0, maxLife: 50 + Math.random() * 55 });
      }
    }

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildScene(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ─────────────────── MAIN LOOP ─────────────────── */
    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* ── 1. BASE BACKGROUND — Index.tsx: hsla(215,55%,4%,1) ── */
      ctx.fillStyle = "hsl(215,55%,3%)";
      ctx.fillRect(0, 0, W, H);

      /* ── 2. RADIAL GRADIENT — deep navy glow (like Index panel bg) ── */
      // Top ambient (cyan tint — Index header glow)
      const ambTop = ctx.createRadialGradient(W*0.5, 0, 0, W*0.5, 0, H*0.55);
      ambTop.addColorStop(0,   "hsla(192,100%,52%,0.06)");
      ambTop.addColorStop(0.5, "hsla(215,55%,4%,0.0)");
      ambTop.addColorStop(1,   "transparent");
      ctx.fillStyle = ambTop; ctx.fillRect(0, 0, W, H);

      // Centre ambient (warm teal — scanner area)
      const ambMid = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.min(W,H)*0.5);
      ambMid.addColorStop(0,   "hsla(185,80%,8%,0.5)");
      ambMid.addColorStop(0.6, "hsla(215,60%,4%,0.2)");
      ambMid.addColorStop(1,   "transparent");
      ctx.fillStyle = ambMid; ctx.fillRect(0, 0, W, H);

      /* ── 3. STARS ── */
      STARS.forEach(s => {
        s.twinkle += s.twinkleSpd;
        const a = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,235,255,${a})`; ctx.fill();
      });

      /* ── 4. HORIZONTAL GRID LINES (subtle, from Index panel style) ── */
      const lineCount = 14;
      for (let i = 0; i <= lineCount; i++) {
        const ly = (i / lineCount) * H;
        const bright = 1 - Math.abs((i / lineCount) - 0.5) * 2;
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly);
        ctx.strokeStyle = `hsla(192,100%,52%,${0.025 + bright * 0.015})`;
        ctx.lineWidth = 0.4; ctx.stroke();
      }

      /* ── 5. VERTICAL LINES (sparse) ── */
      const vCount = 10;
      for (let i = 0; i <= vCount; i++) {
        const lx = (i / vCount) * W;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H);
        ctx.strokeStyle = `hsla(185,100%,55%,0.018)`;
        ctx.lineWidth = 0.4; ctx.stroke();
      }

      /* ── 6. NEURAL NETWORK ── */
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        n.pulse += n.pulseSpd;
        if (M.x > 0) {
          const md = Math.hypot(n.x - M.x, n.y - M.y);
          const prx = Math.max(0, 1 - md / 200);
          if (prx > 0.05 && md > 1) {
            n.vx += (n.x - M.x) / md * 0.02 * prx;
            n.vy += (n.y - M.y) / md * 0.02 * prx;
          }
        }
        const spd = Math.hypot(n.vx, n.vy);
        if (spd > 1.2) { n.vx *= 1.2/spd; n.vy *= 1.2/spd; }
        n.vx *= 0.992; n.vy *= 0.992;
      });

      /* Edges */
      const MAX_D = 155;
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const a = NODES[i], b = NODES[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > MAX_D) continue;
          const ea = (1 - d / MAX_D) * 0.14;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${(a.hue+b.hue)/2},100%,65%,${ea})`;
          ctx.lineWidth = 0.55; ctx.stroke();
        }
      }

      /* Node dots */
      NODES.forEach(n => {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulse);
        const r = n.r * (1 + 0.18 * pulse);
        const a = n.bright * pulse;
        if (n.r > 3) { // hub
          ctx.save();
          ctx.shadowBlur = 18 + 6*pulse; ctx.shadowColor = `hsla(${n.hue},100%,65%,0.8)`;
          ctx.beginPath(); ctx.arc(n.x, n.y, r*2.2, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${n.hue},100%,65%,${a*0.28})`; ctx.lineWidth=0.8; ctx.stroke();
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${n.hue},100%,68%,${a})`; ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${n.hue},90%,70%,${a*0.72})`; ctx.fill();
        }
      });

      /* ── 7. DATA STREAMS ── */
      DATALINES.forEach(dl => {
        dl.y += dl.spd;
        if (dl.y > 1 + dl.len) {
          dl.y = -dl.len;
          dl.x = Math.random() * W;
          dl.hue = Math.random() > 0.6 ? C.cyan : Math.random() > 0.5 ? C.teal : C.amber;
        }
        const y1 = Math.max(0, (dl.y - dl.len)) * H;
        const y2 = Math.min(1, dl.y) * H;
        if (y2 <= y1) return;
        const g = ctx.createLinearGradient(dl.x, y1, dl.x, y2);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.7, `hsla(${dl.hue},100%,68%,${dl.a * 0.5})`);
        g.addColorStop(1, `hsla(${dl.hue},100%,72%,${dl.a})`);
        ctx.beginPath(); ctx.moveTo(dl.x, y1); ctx.lineTo(dl.x, y2);
        ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
        // glowing head
        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${dl.hue},100%,65%,0.9)`;
        ctx.beginPath(); ctx.arc(dl.x, y2, 2, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${dl.hue},100%,80%,${dl.a * 1.3})`; ctx.fill();
        ctx.restore();
      });

      /* ── 8. MOUSE AURA — matches Index.tsx hover style ── */
      if (M.x > 0) {
        // Primary cyan aura
        const r1 = 140 + 15 * Math.sin(t * 4);
        const aura = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r1);
        aura.addColorStop(0,   `hsla(192,100%,52%,${0.14 + 0.05 * Math.sin(t*5)})`);
        aura.addColorStop(0.4, "hsla(192,100%,52%,0.04)");
        aura.addColorStop(1,   "transparent");
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(M.x, M.y, r1, 0, Math.PI*2); ctx.fill();

        // Teal inner halo
        const r2 = 65 + 8 * Math.sin(t * 3.2);
        const halo = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r2);
        halo.addColorStop(0, "hsla(185,100%,55%,0.09)");
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(M.x, M.y, r2, 0, Math.PI*2); ctx.fill();

        if (M.down) spawnBurst(M.x + (Math.random()-0.5)*16, M.y + (Math.random()-0.5)*16, 2, C.cyan);
      }

      /* ── 9. MOUSE TRAIL — Index.tsx uses cyan rgba traces ── */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.5) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.5;
        const hue = 185 + (1 - age) * 10;
        ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x, TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `hsla(${hue},100%,62%,${(1-age)*0.45})`;
        ctx.lineWidth = (1-age) * 2.4; ctx.stroke();
      }

      /* ── 10. PARTICLES ── */
      for (let i = PARTICLES.length - 1; i >= 0; i--) {
        const p = PARTICLES[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.968; p.vy *= 0.968;
        p.life++;
        if (p.life >= p.maxLife) { PARTICLES.splice(i, 1); continue; }
        const prog = p.life / p.maxLife;
        const a = p.a * (prog < 0.18 ? prog/0.18 : 1 - (prog-0.18)/0.82);
        ctx.save(); ctx.shadowBlur=7; ctx.shadowColor=`hsla(${p.hue},100%,65%,0.8)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r*(1-prog*0.55), 0, Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},100%,70%,${Math.max(0,a)})`; ctx.fill(); ctx.restore();
      }

      /* ── 11. CLICK RIPPLES — Index.tsx cyan rings ── */
      if (M.click && M.x > 0) {
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR:105, a:0.9, hue:C.cyan  });
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR: 65, a:0.7, hue:C.teal  });
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR: 35, a:0.6, hue:C.amber });
        spawnBurst(M.x, M.y, 16, C.cyan);
      }
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i]; rp.r += 3.2; rp.a *= 0.91;
        ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=`hsla(${rp.hue},100%,65%,0.65)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
        ctx.strokeStyle=`hsla(${rp.hue},100%,68%,${rp.a})`; ctx.lineWidth=1.5; ctx.stroke();
        ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* ── 12. SLOW SCAN LINE (faint) ── */
      const slY = ((t * 0.048) % 1) * H;
      const slG = ctx.createLinearGradient(0, slY-2, 0, slY+2);
      slG.addColorStop(0,"transparent"); slG.addColorStop(0.5,`hsla(192,100%,52%,0.048)`); slG.addColorStop(1,"transparent");
      ctx.fillStyle=slG; ctx.fillRect(0, slY-2, W, 4);

      /* ── 13. CORNER HUD — Index.tsx corner bracket style ── */
      // Index uses 'hsla(192,100%,52%,0.38)' for borders and 'hsla(185,100%,55%,0.12)' for bg
      [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([bx,by,dx,dy]) => {
        const L = 30;
        ctx.save(); ctx.shadowBlur=10; ctx.shadowColor="hsla(192,100%,52%,0.8)";
        ctx.strokeStyle="hsla(192,100%,52%,0.55)"; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(bx+dx*L, by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+dy*L); ctx.stroke();
        ctx.restore();
      });

      /* ── 14. HUD TEXT — Orbitron monospace from Index.tsx ── */
      ctx.font = "700 7px 'Orbitron',monospace";
      ctx.fillStyle = "hsla(192,100%,52%,0.22)";
      ctx.fillText("BIMS v1.0 // CLASSIFIED", 36, 13);
      ctx.fillText(`T+${(t%99).toFixed(1)}s`, W-96, 13);
      ctx.fillStyle = `hsla(140,100%,50%,${0.28+0.08*Math.sin(t*5)})`;
      const ss = ["◉ SCANNING","◉ ENCRYPTING","◉ AUTHENTICATED","◉ PROCESSING"][Math.floor(t/2.8)%4];
      ctx.fillText(ss, W-120, H-8);
      ctx.fillStyle = "hsla(192,100%,52%,0.18)";
      ctx.fillText("◈ SECURE CHANNEL · AES-256", 36, H-8);

      /* ── 15. VIGNETTE ── */
      const vg = ctx.createRadialGradient(W/2, H/2, W*0.1, W/2, H/2, W*0.85);
      vg.addColorStop(0,"transparent"); vg.addColorStop(1,"hsla(215,60%,2%,0.82)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      /* ── 16. CROSSHAIR — Index.tsx precision style ── */
      if (M.x > 0) {
        const MX=M.x, MY=M.y;
        const s = M.click ? 0.88 : 1;
        const ARM=17*s, GAP=7*s, RR=11*s;
        ctx.save();
        ctx.shadowBlur=18; ctx.shadowColor="hsla(192,100%,52%,0.95)";
        ctx.strokeStyle="hsla(192,100%,65%,0.9)"; ctx.lineWidth=1.3;
        [[MX-GAP-ARM,MY,MX-GAP,MY],[MX+GAP,MY,MX+GAP+ARM,MY],
         [MX,MY-GAP-ARM,MX,MY-GAP],[MX,MY+GAP,MX,MY+GAP+ARM]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(MX,MY,RR,0,Math.PI*2);
        ctx.strokeStyle=`hsla(192,100%,65%,${M.click?0.85:0.4})`; ctx.lineWidth=0.8; ctx.stroke();
        // rotating dashed ring
        ctx.beginPath(); ctx.arc(MX,MY,RR+10,0,Math.PI*2);
        ctx.setLineDash([3,9]); ctx.lineDashOffset=-(t*30%100);
        ctx.strokeStyle="hsla(185,100%,55%,0.22)"; ctx.lineWidth=0.65; ctx.stroke();
        ctx.setLineDash([]);
        // 4 corner ticks on main ring
        [0,90,180,270].forEach(deg => {
          const rad=deg*Math.PI/180;
          ctx.beginPath(); ctx.arc(MX+Math.cos(rad)*RR, MY+Math.sin(rad)*RR, 1.4, 0, Math.PI*2);
          ctx.fillStyle="hsla(185,100%,70%,0.88)"; ctx.fill();
        });
        ctx.shadowBlur=20;
        ctx.beginPath(); ctx.arc(MX,MY,M.click?1.6:2.2,0,Math.PI*2);
        ctx.fillStyle="hsla(192,100%,72%,0.98)"; ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle="hsl(215,55%,3%)"; ctx.fillRect(0,0,canvas.width,canvas.height);
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor:"none" }}/>
    </div>
  );
}
