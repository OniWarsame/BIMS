import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, t = 0;

    /* ── Mouse / Touch state ── */
    const M = { x: -999, y: -999, px: -999, py: -999, click: false, down: false, vx: 0, vy: 0 };

    const onMove = (e: MouseEvent) => {
      M.px = M.x; M.py = M.y;
      M.x = e.clientX; M.y = e.clientY;
      M.vx = M.x - M.px; M.vy = M.y - M.py;
    };
    const onTouch = (e: TouchEvent) => {
      M.px = M.x; M.py = M.y;
      M.x = e.touches[0].clientX; M.y = e.touches[0].clientY;
      M.vx = M.x - M.px; M.vy = M.y - M.py;
    };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 220); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("touchmove",  onTouch, { passive: true });
    window.addEventListener("touchstart", onDown,  { passive: true });
    window.addEventListener("touchend",   onUp,    { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildNodes();
    };
    window.addEventListener("resize", resize);

    /* ── Background image — hex_bg.jpg ── */
    const img = new Image();
    img.src = "/hex_bg.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    /* ── Types ── */
    interface Node    { x:number; y:number; vx:number; vy:number; r:number; bright:number; pulse:number; pSpd:number; hue:number; }
    interface Ripple  { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface Spark   { x:number; y:number; vx:number; vy:number; life:number; ml:number; hue:number; }
    interface Stream  { x:number; y:number; len:number; spd:number; }
    interface MagLine { ax:number; ay:number; bx:number; by:number; a:number; life:number; ml:number; }

    let NODES: Node[]       = [];
    let STREAMS: Stream[]   = [];
    const RIPPLES: Ripple[] = [];
    const SPARKS:  Spark[]  = [];
    const MAGLINES: MagLine[] = []; // magnetic field lines from mouse
    const TRAIL: { x:number; y:number; t:number; spd:number }[] = [];

    /* ── Cursor ring state ── */
    let cursorScale  = 1;
    let cursorTarget = 1;
    let cursorAngle  = 0;
    let cursorPulse  = 0;

    function buildNodes() {
      const W = canvas.width, H = canvas.height;
      NODES = Array.from({ length: 60 }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  i < 8 ? 3.5 + Math.random() * 2.5 : 1.2 + Math.random() * 2,
        bright: i < 8 ? 0.88 : 0.35 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        pSpd:  0.018 + Math.random() * 0.035,
        hue: [218, 196, 218, 238, 218][Math.floor(Math.random() * 5)],
      }));
      STREAMS = Array.from({ length: 8 }, () => ({
        x: Math.random(),
        y: Math.random(),
        len: 0.06 + Math.random() * 0.14,
        spd: 0.0004 + Math.random() * 0.0009,
      }));
    }

    resize();

    function spawnSparks(x: number, y: number, n: number, hue = 218) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const s = 1.5 + Math.random() * 3.5;
        SPARKS.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 0, ml: 40+Math.random()*45, hue });
      }
    }

    function spawnMagLines(x: number, y: number) {
      // Spawn radial "field lines" emanating from cursor position
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const len = 40 + Math.random() * 60;
        MAGLINES.push({
          ax: x, ay: y,
          bx: x + Math.cos(a) * len,
          by: y + Math.sin(a) * len,
          a: 0.8, life: 0, ml: 35,
        });
      }
    }

    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1 ── BACKGROUND IMAGE ── */
      if (imgLoaded) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "hsl(220,60%,5%)";
        ctx.fillRect(0, 0, W, H);
      }

      /* 2 ── DARK OVERLAY for legibility ── */
      ctx.fillStyle = "rgba(2,6,22,0.72)";
      ctx.fillRect(0, 0, W, H);

      /* Top/bottom edge fades */
      const tg = ctx.createLinearGradient(0, 0, 0, 80);
      tg.addColorStop(0, "rgba(2,6,22,0.90)"); tg.addColorStop(1, "transparent");
      ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 80);
      const bg = ctx.createLinearGradient(0, H - 60, 0, H);
      bg.addColorStop(0, "transparent"); bg.addColorStop(1, "rgba(2,6,22,0.88)");
      ctx.fillStyle = bg; ctx.fillRect(0, H - 60, W, 60);

      /* 3 ── NEURAL NETWORK NODES ── */
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        n.pulse += n.pSpd;
        if (M.x > 0) {
          const md = Math.hypot(n.x - M.x, n.y - M.y);
          const prx = Math.max(0, 1 - md / 230);
          if (prx > 0.02 && md > 1) {
            n.vx += (n.x - M.x) / md * 0.028 * prx;
            n.vy += (n.y - M.y) / md * 0.028 * prx;
          }
        }
        const spd = Math.hypot(n.vx, n.vy);
        if (spd > 1.1) { n.vx *= 1.1 / spd; n.vy *= 1.1 / spd; }
        n.vx *= 0.992; n.vy *= 0.992;
      });

      // Edges
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const a = NODES[i], b = NODES[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 155) continue;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(60,130,255,${(1 - d/155) * 0.16})`;
          ctx.lineWidth = 0.55; ctx.stroke();
        }
      }

      // Dots
      NODES.forEach(n => {
        const p = 0.5 + 0.5 * Math.sin(n.pulse);
        const r = n.r * (1 + 0.22 * p);
        if (n.r > 3) {
          ctx.save();
          ctx.shadowBlur = 20 * p; ctx.shadowColor = `hsla(${n.hue},100%,68%,0.8)`;
          ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${n.hue},100%,68%,${0.2 * p})`; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},100%,72%,${n.bright * p})`; ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},90%,70%,${n.bright * p * 0.75})`; ctx.fill();
        }
      });

      /* 4 ── DATA STREAMS ── */
      STREAMS.forEach(s => {
        s.y += s.spd; if (s.y > 1 + s.len) { s.y = -s.len; s.x = Math.random(); }
        const sx = s.x * W, y1 = Math.max(0, (s.y - s.len)) * H, y2 = Math.min(1, s.y) * H;
        if (y2 <= y1) return;
        const g = ctx.createLinearGradient(sx, y1, sx, y2);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.7, "rgba(50,130,255,0.3)");
        g.addColorStop(1, "rgba(90,180,255,0.65)");
        ctx.beginPath(); ctx.moveTo(sx, y1); ctx.lineTo(sx, y2);
        ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = "rgba(80,170,255,0.9)";
        ctx.beginPath(); ctx.arc(sx, y2, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(130,210,255,0.85)"; ctx.fill(); ctx.restore();
      });

      /* 5 ── MOUSE MAGNETIC FIELD AURA ── */
      if (M.x > 0) {
        const speed = Math.hypot(M.vx, M.vy);
        cursorTarget = M.down ? 0.65 : speed > 8 ? 1.35 : 1.0;
        cursorScale += (cursorTarget - cursorScale) * 0.12;
        cursorAngle += 0.022;
        cursorPulse  = 0.5 + 0.5 * Math.sin(t * 4.5);

        // Multi-layer radial aura
        const layers = [
          { r: 150, a: 0.13, h: 218 },
          { r: 90,  a: 0.09, h: 210 },
          { r: 45,  a: 0.12, h: 200 },
        ];
        layers.forEach(l => {
          const gr = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, l.r * cursorScale);
          gr.addColorStop(0, `hsla(${l.h},100%,65%,${l.a + 0.04 * cursorPulse})`);
          gr.addColorStop(0.5, `hsla(${l.h},100%,55%,${l.a * 0.3})`);
          gr.addColorStop(1, "transparent");
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(M.x, M.y, l.r * cursorScale, 0, Math.PI * 2); ctx.fill();
        });

        // Spawn maglines on fast movement
        if (speed > 12 && Math.random() < 0.18) spawnMagLines(M.x, M.y);
        if (M.down) spawnSparks(M.x + (Math.random()-0.5)*18, M.y + (Math.random()-0.5)*18, 2);
      }

      /* 6 ── MAGNETIC FIELD LINES ── */
      for (let i = MAGLINES.length - 1; i >= 0; i--) {
        const ml = MAGLINES[i];
        ml.life++;
        const prog = ml.life / ml.ml;
        const a = ml.a * (1 - prog);
        ctx.save();
        ctx.shadowBlur = 6; ctx.shadowColor = "rgba(80,160,255,0.7)";
        ctx.beginPath(); ctx.moveTo(ml.ax, ml.ay); ctx.lineTo(ml.bx, ml.by);
        ctx.strokeStyle = `rgba(80,180,255,${a})`;
        ctx.lineWidth = 1.5 * (1 - prog); ctx.stroke();
        ctx.restore();
        if (ml.life >= ml.ml) MAGLINES.splice(i, 1);
      }

      /* 7 ── MOUSE TRAIL — velocity-colored ── */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t, spd: Math.hypot(M.vx, M.vy) });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.55) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.55;
        const spd = TRAIL[i].spd;
        // Color shifts with speed: slow=blue, fast=cyan
        const hue = 218 - Math.min(spd, 20) * 1.1;
        ctx.beginPath();
        ctx.moveTo(TRAIL[i - 1].x, TRAIL[i - 1].y);
        ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `hsla(${hue},100%,68%,${(1 - age) * 0.55})`;
        ctx.lineWidth = (1 - age) * (2 + Math.min(spd, 15) * 0.08);
        ctx.stroke();
      }

      /* 8 ── SPARKS ── */
      for (let i = SPARKS.length - 1; i >= 0; i--) {
        const sp = SPARKS[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vx *= 0.955; sp.vy *= 0.955;
        sp.life++;
        if (sp.life >= sp.ml) { SPARKS.splice(i, 1); continue; }
        const prog = sp.life / sp.ml;
        const a = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8;
        ctx.save(); ctx.shadowBlur = 7; ctx.shadowColor = `hsla(${sp.hue},100%,70%,0.9)`;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 2.2 * (1 - prog * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${sp.hue},100%,75%,${Math.max(0, a)})`; ctx.fill(); ctx.restore();
      }

      /* 9 ── CLICK RIPPLES ── */
      if (M.click && M.x > 0) {
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR:130, a:0.85, hue:218 });
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR:80,  a:0.65, hue:200 });
        RIPPLES.push({ x:M.x, y:M.y, r:3, maxR:40,  a:0.5,  hue:238 });
        spawnSparks(M.x, M.y, 18, 218);
        spawnMagLines(M.x, M.y);
      }
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i]; rp.r += 3.2; rp.a *= 0.91;
        ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = `hsla(${rp.hue},100%,68%,0.7)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,72%,${rp.a})`; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* 10 ── VIGNETTE ── */
      const vg = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.86);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(1,4,16,0.84)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      /* 11 ── ADVANCED CURSOR RETICLE ── */
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const s = cursorScale;
        const speed = Math.hypot(M.vx, M.vy);
        const isMoving = speed > 2;

        ctx.save();

        /* Outer spinning dashed orbit — rotates faster when moving */
        const spinSpd = isMoving ? cursorAngle * 3 : cursorAngle;
        ctx.translate(MX, MY);
        ctx.rotate(spinSpd);
        ctx.translate(-MX, -MY);

        ctx.beginPath(); ctx.arc(MX, MY, 28 * s, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]); ctx.lineDashOffset = -(t * 35 % 100);
        ctx.strokeStyle = `rgba(60,150,255,${0.3 + 0.1 * cursorPulse})`;
        ctx.lineWidth = 0.8; ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();

        /* Inner solid ring — pulses */
        ctx.save();
        ctx.shadowBlur = 18; ctx.shadowColor = "rgba(60,160,255,0.95)";
        ctx.beginPath(); ctx.arc(MX, MY, (M.down ? 9 : 14) * s, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(90,185,255,${M.down ? 0.95 : 0.55 + 0.18 * cursorPulse})`;
        ctx.lineWidth = M.down ? 2 : 1.2; ctx.stroke();
        ctx.restore();

        /* Four directional arms — contract on click */
        const ARM = (M.down ? 9 : 16) * s;
        const GAP = (M.down ? 3 : 6) * s;
        ctx.save();
        ctx.shadowBlur = 16; ctx.shadowColor = "rgba(80,180,255,0.95)";
        ctx.strokeStyle = `rgba(120,200,255,${M.down ? 1 : 0.85})`;
        ctx.lineWidth = 1.4;
        // Tilt arms slightly when moving (gives direction feel)
        ctx.translate(MX, MY);
        ctx.rotate(isMoving ? Math.atan2(M.vy, M.vx) * 0.15 : 0);
        ctx.translate(-MX, -MY);
        [[MX - GAP - ARM, MY, MX - GAP, MY],
         [MX + GAP, MY, MX + GAP + ARM, MY],
         [MX, MY - GAP - ARM, MX, MY - GAP],
         [MX, MY + GAP, MX, MY + GAP + ARM]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        });
        ctx.restore();

        /* Tick marks on inner ring */
        [0, 90, 180, 270].forEach(deg => {
          const rad = deg * Math.PI / 180;
          const R = (M.down ? 9 : 14) * s;
          ctx.beginPath();
          ctx.arc(MX + Math.cos(rad) * R, MY + Math.sin(rad) * R, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(130,210,255,0.9)"; ctx.fill();
        });

        /* Center dot — breathing */
        ctx.save();
        ctx.shadowBlur = 22; ctx.shadowColor = "rgba(80,200,255,1)";
        const dotR = M.down ? 1.8 : (2.5 + 0.5 * cursorPulse) * s;
        ctx.beginPath(); ctx.arc(MX, MY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,230,255,0.98)"; ctx.fill();
        ctx.restore();

        /* Speed indicator — arc segment fills based on velocity */
        if (speed > 3) {
          const arcPct = Math.min(speed / 30, 1);
          ctx.save();
          ctx.shadowBlur = 12; ctx.shadowColor = `rgba(60,220,255,${arcPct * 0.8})`;
          ctx.beginPath();
          ctx.arc(MX, MY, 20 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * arcPct);
          ctx.strokeStyle = `rgba(60,220,255,${0.4 + arcPct * 0.5})`;
          ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "hsl(220,60%,5%)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchend",   onUp);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
