import React, { useEffect, useRef } from "react";

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
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseleave", onLeave);

    /* ── Background Image ── */
    const img = new Image();
    img.src = "/cyber_bg.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    /* ── Types ── */
    interface Particle  { x:number; y:number; vx:number; vy:number; r:number; hue:number; a:number; life:number; maxLife:number; }
    interface Ripple    { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface GridNode  { x:number; y:number; lit:number; pulse:number; }
    interface DataFlow  { col:number; y:number; len:number; spd:number; alpha:number; }

    /* ── Grid for connection lines ── */
    const GRID_COLS = 14, GRID_ROWS = 8;
    let grid: GridNode[][] = [];
    const PARTICLES: Particle[] = [];
    const RIPPLES: Ripple[]     = [];
    const FLOWS: DataFlow[]     = [];
    const TRAIL: {x:number;y:number;t:number}[] = [];

    function buildGrid(W: number, H: number) {
      grid = [];
      for (let r = 0; r <= GRID_ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c <= GRID_COLS; c++) {
          grid[r][c] = {
            x: (c / GRID_COLS) * W,
            y: (r / GRID_ROWS) * H,
            lit: Math.random(),
            pulse: Math.random() * Math.PI * 2,
          };
        }
      }
      /* Seed some data flows */
      FLOWS.length = 0;
      for (let i = 0; i < 10; i++) {
        FLOWS.push({
          col:   Math.floor(Math.random() * (GRID_COLS + 1)),
          y:     Math.random(),
          len:   0.06 + Math.random() * 0.12,
          spd:   0.0004 + Math.random() * 0.0008,
          alpha: 0.25 + Math.random() * 0.35,
        });
      }
    }

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGrid(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    function spawnBurst(x: number, y: number, count = 14) {
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const s = 1 + Math.random() * 3;
        PARTICLES.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
          r: 1.2 + Math.random() * 2, hue: Math.random() > 0.5 ? 192 : 155,
          a: 0.9, life: 0, maxLife: 55 + Math.random() * 60 });
      }
    }

    /* ─── MAIN LOOP ─── */
    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1. IMAGE */
      if (imgLoaded) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "rgb(0,6,18)"; ctx.fillRect(0, 0, W, H);
      }

      /* 2. DARKENING OVERLAY — stronger, to let UI breathe */
      ctx.fillStyle = "rgba(0,4,14,0.65)";
      ctx.fillRect(0, 0, W, H);

      /* 3. PERSPECTIVE GRID — horizontal lines */
      const vp = { x: W * 0.5, y: H * 0.46 }; // vanishing point
      const gridLines = 16;
      for (let i = 0; i <= gridLines; i++) {
        const frac = i / gridLines;
        // vertical lines fanning from vanishing point
        const bx = W * frac;
        const bright = 1 - Math.abs(frac - 0.5) * 2;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(bx, H);
        ctx.strokeStyle = `rgba(0,200,255,${0.05 + bright * 0.04})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      // horizontal rings from vp
      for (let i = 1; i <= 8; i++) {
        const prog = i / 8;
        const rx = vp.x + (W * 0 - vp.x) * prog;
        const ry = vp.y + (H - vp.y) * prog;
        const rw = W * prog;
        const rh = (H - vp.y) * prog * 0.28;
        ctx.beginPath();
        ctx.ellipse(vp.x, ry, rw * 0.5, rh, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,200,255,${0.04 + prog * 0.03})`;
        ctx.lineWidth = 0.5 + prog * 0.3;
        ctx.stroke();
      }

      /* 4. CONNECTION GRID — nodes + edges */
      for (let r = 0; r <= GRID_ROWS; r++) {
        for (let c = 0; c <= GRID_COLS; c++) {
          const nd = grid[r][c];
          nd.pulse += 0.018;
          const gx = nd.x, gy = nd.y;
          const md = M.x > 0 ? Math.hypot(gx - M.x, gy - M.y) : 9999;
          const prx = Math.max(0, 1 - md / 220);
          nd.lit = Math.min(1, nd.lit + prx * 0.08 - 0.004);
          if (nd.lit < 0) nd.lit = 0;

          // Horizontal edge
          if (c < GRID_COLS) {
            const nb = grid[r][c + 1];
            const avg = (nd.lit + nb.lit) * 0.5;
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(nb.x, nb.y);
            ctx.strokeStyle = `rgba(0,180,255,${0.06 + avg * 0.18})`;
            ctx.lineWidth = 0.5 + avg * 0.8; ctx.stroke();
          }
          // Vertical edge
          if (r < GRID_ROWS) {
            const nb = grid[r + 1][c];
            const avg = (nd.lit + nb.lit) * 0.5;
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(nb.x, nb.y);
            ctx.strokeStyle = `rgba(0,180,255,${0.06 + avg * 0.18})`;
            ctx.lineWidth = 0.5 + avg * 0.8; ctx.stroke();
          }
          // Node dot
          const pulse = 0.5 + 0.5 * Math.sin(nd.pulse);
          const dotR = 1.2 + nd.lit * 3 + pulse * nd.lit * 1.5;
          if (dotR > 0.5) {
            ctx.save();
            if (nd.lit > 0.3) { ctx.shadowBlur = 10; ctx.shadowColor = `rgba(0,220,255,${nd.lit * 0.7})`; }
            ctx.beginPath(); ctx.arc(gx, gy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,220,255,${0.3 + nd.lit * 0.65})`;
            ctx.fill(); ctx.restore();
          }
        }
      }

      /* 5. DATA FLOWS — streaks along grid columns */
      FLOWS.forEach(f => {
        f.y += f.spd;
        if (f.y > 1 + f.len) { f.y = -f.len; f.col = Math.floor(Math.random() * (GRID_COLS + 1)); }
        if (f.col > GRID_COLS) return;
        const fx = grid[0][f.col].x;
        const fy1 = Math.max(0, (f.y - f.len)) * H;
        const fy2 = Math.min(1, f.y) * H;
        if (fy2 <= fy1) return;
        const g = ctx.createLinearGradient(fx, fy1, fx, fy2);
        g.addColorStop(0, "transparent");
        g.addColorStop(1, `rgba(0,220,255,${f.alpha})`);
        ctx.beginPath(); ctx.moveTo(fx, fy1); ctx.lineTo(fx, fy2);
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
        // Head glow
        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = "rgba(0,229,255,0.9)";
        ctx.beginPath(); ctx.arc(fx, fy2, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,220,${f.alpha * 1.4})`; ctx.fill(); ctx.restore();
      });

      /* 6. MOUSE REACTIVE AURA */
      if (M.x > 0) {
        const pulse = 1 + 0.07 * Math.sin(t * 4.5);
        const r1 = 160 * pulse;
        const aura = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r1);
        aura.addColorStop(0,    `rgba(0,220,255,${0.16 + 0.05 * Math.sin(t * 5)})`);
        aura.addColorStop(0.4,  "rgba(0,160,220,0.05)");
        aura.addColorStop(1,    "transparent");
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(M.x, M.y, r1, 0, Math.PI * 2); ctx.fill();

        // Second halo — green
        const r2 = 70 * pulse;
        const halo2 = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r2);
        halo2.addColorStop(0, "rgba(0,255,160,0.08)");
        halo2.addColorStop(1, "transparent");
        ctx.fillStyle = halo2; ctx.beginPath(); ctx.arc(M.x, M.y, r2, 0, Math.PI * 2); ctx.fill();

        if (M.down) spawnBurst(M.x + (Math.random()-0.5)*12, M.y + (Math.random()-0.5)*12, 2);
      }

      /* 7. MOUSE TRAIL */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.55) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.55;
        ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x, TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `hsla(${175 + (1-age)*20},100%,65%,${(1-age)*0.48})`;
        ctx.lineWidth = (1-age) * 2.5; ctx.stroke();
      }

      /* 8. PARTICLES */
      for (let i = PARTICLES.length - 1; i >= 0; i--) {
        const p = PARTICLES[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.965; p.vy *= 0.965;
        p.life++;
        if (p.life >= p.maxLife) { PARTICLES.splice(i, 1); continue; }
        const prog = p.life / p.maxLife;
        const a = p.a * (prog < 0.15 ? prog / 0.15 : 1 - (prog - 0.15) / 0.85);
        ctx.save(); ctx.shadowBlur = 7; ctx.shadowColor = `hsla(${p.hue},100%,68%,0.8)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - prog * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,72%,${Math.max(0,a)})`; ctx.fill(); ctx.restore();
      }

      /* 9. CLICK RIPPLES */
      if (M.click && M.x > 0) {
        RIPPLES.push({ x: M.x, y: M.y, r: 2, maxR: 110, a: 0.9, hue: 192 });
        RIPPLES.push({ x: M.x, y: M.y, r: 2, maxR:  68, a: 0.7, hue: 155 });
        RIPPLES.push({ x: M.x, y: M.y, r: 2, maxR:  36, a: 0.6, hue: 210 });
        spawnBurst(M.x, M.y, 18);
      }
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i]; rp.r += 3; rp.a *= 0.91;
        ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = `hsla(${rp.hue},100%,68%,0.6)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,72%,${rp.a})`; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* 10. SCAN LINE */
      const slY = ((t * 0.055) % 1) * H;
      const slG = ctx.createLinearGradient(0, slY - 2, 0, slY + 2);
      slG.addColorStop(0, "transparent"); slG.addColorStop(0.5, "rgba(0,220,255,0.055)"); slG.addColorStop(1, "transparent");
      ctx.fillStyle = slG; ctx.fillRect(0, slY - 2, W, 4);

      /* 11. VIGNETTE */
      const vg = ctx.createRadialGradient(W/2, H/2, W*0.1, W/2, H/2, W*0.82);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,2,10,0.82)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      /* 12. CORNER HUD MARKS */
      const corners2 = [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]] as const;
      corners2.forEach(([bx,by,dx,dy]) => {
        const L = 32;
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,220,255,0.75)";
        ctx.strokeStyle = "rgba(0,220,255,0.6)"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(bx+dx*L, by); ctx.lineTo(bx,by); ctx.lineTo(bx, by+dy*L); ctx.stroke();
        ctx.restore();
      });

      /* 13. STATUS TEXT */
      ctx.font = "700 7px 'IBM Plex Mono',monospace";
      ctx.fillStyle = "rgba(0,200,255,0.22)";
      ctx.fillText("BIMS v1.0 // CLASSIFIED // TOP SECRET", 38, 14);
      ctx.fillText(`SYS ${(t%99).toFixed(1)}s`, W-102, 14);
      ctx.fillStyle = `rgba(0,255,160,${0.28+0.08*Math.sin(t*5)})`;
      const ss = ["◉ SCANNING","◉ ENCRYPTING","◉ AUTHENTICATED","◉ PROCESSING"][Math.floor(t/2.8)%4];
      ctx.fillText(ss, W-128, H-9);
      ctx.fillStyle = "rgba(0,200,255,0.2)";
      ctx.fillText("◈ SYSTEM SECURE · AES-256", 38, H-9);

      /* 14. CROSSHAIR — clean targeting reticle */
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const s = M.click ? 0.88 : 1;
        const ARM = 18*s, GAP = 6*s, RR = 10*s;
        ctx.save();
        ctx.shadowBlur = 16; ctx.shadowColor = "rgba(0,240,255,0.9)";
        ctx.strokeStyle = "rgba(0,240,255,0.88)"; ctx.lineWidth = 1.2;
        // four arms
        [[MX-GAP-ARM,MY,MX-GAP,MY],[MX+GAP,MY,MX+GAP+ARM,MY],
         [MX,MY-GAP-ARM,MX,MY-GAP],[MX,MY+GAP,MX,MY+GAP+ARM]].forEach(([x1,y1,x2,y2])=>{
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
        // inner circle
        ctx.beginPath(); ctx.arc(MX,MY,RR,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,240,255,${M.click?0.85:0.42})`; ctx.lineWidth=0.8; ctx.stroke();
        // outer dashed ring — rotates
        ctx.beginPath(); ctx.arc(MX,MY,RR+10,0,Math.PI*2);
        ctx.setLineDash([3,9]); ctx.lineDashOffset = -(t*28%100);
        ctx.strokeStyle="rgba(0,200,255,0.2)"; ctx.lineWidth=0.6; ctx.stroke();
        ctx.setLineDash([]);
        // center dot
        ctx.shadowBlur=20;
        ctx.beginPath(); ctx.arc(MX,MY,M.click?1.5:2,0,Math.PI*2);
        ctx.fillStyle="rgba(0,255,255,0.98)"; ctx.fill();
        // tiny corner ticks on circle
        [0,90,180,270].forEach(deg=>{
          const rad = deg*Math.PI/180;
          const tx = MX+Math.cos(rad)*RR, ty = MY+Math.sin(rad)*RR;
          ctx.beginPath(); ctx.arc(tx,ty,1.2,0,Math.PI*2);
          ctx.fillStyle="rgba(0,255,200,0.9)"; ctx.fill();
        });
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle="rgb(0,4,12)"; ctx.fillRect(0,0,canvas.width,canvas.height);
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor:"none" }}/>
    </div>
  );
}
