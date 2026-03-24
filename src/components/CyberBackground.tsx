import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  NEURAL FINGERPRINT — nnn.jpg
  
  Palette pulled directly from image:
    Violet    hsl(270,100%) — dominant background purple
    Magenta   hsl(300,100%) — neon pink/magenta glow
    Blue      hsl(225,100%) — deep electric blue
    Cyan      hsl(190,100%) — bright data streams
    White     rgba(240,230,255) — node sparkle
  
  Art concept:
    The image is the base. On top: a living circuit board world.
    Fingerprint ridges pulse from the centre outward.
    Circuit traces snake across the void with neon nodes.
    Your cursor is a biometric scanner head — it PULSES when near nodes.
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* Mouse */
    const M = { x:-999, y:-999, px:-999, py:-999, vx:0, vy:0, click:false };
    const onMove  = (e:MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.click=true; setTimeout(()=>{ M.click=false; }, 250); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    /* Image */
    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK = true; };
    img.src = BG_IMAGE;

    /* ── Colour helpers ── */
    const VI = (a:number) => `rgba(160,60,255,${a})`;   // violet
    const MG = (a:number) => `rgba(255,0,200,${a})`;    // magenta
    const BL = (a:number) => `rgba(60,100,255,${a})`;   // blue
    const CY = (a:number) => `rgba(0,220,255,${a})`;    // cyan
    const WH = (a:number) => `rgba(240,220,255,${a})`;  // white-violet

    /* ── Types ── */
    interface Node   { x:number; y:number; r:number; hue:number; pulse:number; pSpeed:number; }
    interface Trace  { pts:{x:number;y:number}[]; hue:number; alpha:number; flow:number; }
    interface Spark  { x:number; y:number; vx:number; vy:number; life:number; ml:number; hue:number; }
    interface Ring   { x:number; y:number; r:number; max:number; a:number; hue:number; }
    interface FPRing { r:number; phase:number; alpha:number; }
    interface Beam   { t:number; hue:number; alpha:number; speed:number; }

    let NODES:  Node[]  = [];
    let TRACES: Trace[] = [];
    const SPARKS: Spark[] = [];
    const RINGS:  Ring[]  = [];
    let FPRINGS: FPRing[] = [];
    let BEAMS:   Beam[]   = [];

    function init() {
      const W = canvas.width, H = canvas.height;

      /* Circuit nodes — scattered, biased toward image's circuit positions */
      NODES = Array.from({ length: 55 }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: i < 8 ? 4 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
        hue: 270 + Math.floor(Math.random() * 4) * 20, // 270→330 violet→magenta
        pulse: Math.random() * Math.PI * 2,
        pSpeed: 0.8 + Math.random() * 1.2,
      }));

      /* Circuit traces — Manhattan-style paths */
      TRACES = Array.from({ length: 28 }, () => {
        const pts: {x:number;y:number}[] = [];
        let cx = Math.random() * W, cy = Math.random() * H;
        pts.push({ x: cx, y: cy });
        const segments = 4 + Math.floor(Math.random() * 5);
        for (let s = 0; s < segments; s++) {
          if (Math.random() > 0.5) cx += (Math.random() - 0.5) * 180;
          else cy += (Math.random() - 0.5) * 140;
          pts.push({ x: cx, y: cy });
        }
        return {
          pts,
          hue: 270 + Math.floor(Math.random() * 6) * 12,
          alpha: 0.10 + Math.random() * 0.18,
          flow: Math.random(),
        };
      });

      /* Fingerprint ridges radiating from centre */
      FPRINGS = Array.from({ length: 12 }, (_, i) => ({
        r: 0,
        phase: i * (Math.PI * 2 / 12),
        alpha: 0.25 + Math.random() * 0.35,
      }));

      /* Diagonal sweep beams */
      BEAMS = Array.from({ length: 5 }, (_, i) => ({
        t: Math.random(),
        hue: 270 + i * 15,
        alpha: 0.08 + i * 0.025,
        speed: 0.00035 + i * 0.00012,
      }));
    }

    /* ── Draw circuit trace with flowing light ── */
    function drawTrace(tr: Trace) {
      if (tr.pts.length < 2) return;
      tr.flow = (tr.flow + 0.003) % 1;

      /* Trace line */
      ctx.beginPath();
      ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
      for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
      ctx.strokeStyle = `hsla(${tr.hue},100%,55%,${tr.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      /* Flowing photon along trace */
      const totalLen = tr.pts.reduce((acc, p, i) => {
        if (i === 0) return 0;
        return acc + Math.hypot(p.x - tr.pts[i-1].x, p.y - tr.pts[i-1].y);
      }, 0);

      let target = tr.flow * totalLen;
      let walked = 0;
      for (let i = 1; i < tr.pts.length; i++) {
        const seg = Math.hypot(tr.pts[i].x - tr.pts[i-1].x, tr.pts[i].y - tr.pts[i-1].y);
        if (walked + seg >= target) {
          const t = (target - walked) / seg;
          const px = tr.pts[i-1].x + t * (tr.pts[i].x - tr.pts[i-1].x);
          const py = tr.pts[i-1].y + t * (tr.pts[i].y - tr.pts[i-1].y);
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsla(${tr.hue},100%,80%,1)`;
          ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${tr.hue},100%,90%,0.95)`;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
          break;
        }
        walked += seg;
      }

      /* Node dots at corners */
      for (const pt of tr.pts) {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${tr.hue},100%,70%,${tr.alpha * 1.8})`;
        ctx.fill();
      }
    }

    /* ── Draw fingerprint ring cluster from a centre point ── */
    function drawFPCentre(cx:number, cy:number, maxR:number) {
      for (let i = 1; i <= 10; i++) {
        const r = maxR * i / 10;
        const a = 0.18 - i * 0.014;
        const hue = 270 + i * 8;
        ctx.beginPath();
        const gap = 0.08 + i * 0.015;
        ctx.arc(cx, cy, r, gap, Math.PI * 2 - gap);
        ctx.strokeStyle = `hsla(${hue},100%,65%,${a * (0.7 + 0.3 * Math.sin(T * 0.6 + i))})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
      // Centre glow
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = VI(0.9);
      ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = VI(0.6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    /* ── Main draw ── */
    function draw() {
      T += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1 — Background image */
      if (imgOK) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw:number, ih:number, ix:number, iy:number;
        if (cAR > iAR) { iw=W; ih=W/iAR; ix=0; iy=(H-ih)/2; }
        else            { ih=H; iw=H*iAR; ix=(W-iw)/2; iy=0; }
        ctx.drawImage(img, ix, iy, iw, ih);
        // Light overlay — preserve the purple richness, don't kill it
        ctx.fillStyle = "rgba(10,0,30,0.42)";
        ctx.fillRect(0, 0, W, H);
      } else {
        const bg = ctx.createRadialGradient(W*0.4, H*0.5, 0, W*0.5, H*0.5, W*0.75);
        bg.addColorStop(0, "#1a0040");
        bg.addColorStop(0.5, "#0d0028");
        bg.addColorStop(1, "#04000f");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      }

      /* 2 — Rich ambient radial — adds depth and richness */
      const amb = ctx.createRadialGradient(W*0.42, H*0.50, 0, W*0.42, H*0.50, W*0.55);
      amb.addColorStop(0,   "rgba(130,0,255,0.22)");
      amb.addColorStop(0.35,"rgba(200,0,200,0.10)");
      amb.addColorStop(0.7, "rgba(60,0,180,0.06)");
      amb.addColorStop(1,   "transparent");
      ctx.fillStyle = amb; ctx.fillRect(0, 0, W, H);

      /* 3 — Dot grid (violet hue-cycling) */
      for (let gx = 0; gx < W; gx += 36) {
        for (let gy = 0; gy < H; gy += 36) {
          const hue = 270 + ((gx * 0.3 + gy * 0.2 + T * 18) % 60);
          const a   = 0.06 + 0.04 * Math.sin(T * 0.7 + gx * 0.04 + gy * 0.03);
          ctx.beginPath(); ctx.arc(gx, gy, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},100%,70%,${a})`;
          ctx.fill();
        }
      }

      /* 4 — Fingerprint ridges from image centre */
      drawFPCentre(W * 0.42, H * 0.50, Math.min(W, H) * 0.28);

      /* 5 — Circuit traces with flowing photons */
      for (const tr of TRACES) drawTrace(tr);

      /* 6 — Circuit nodes with pulse rings */
      for (const n of NODES) {
        n.pulse += n.pSpeed * 0.016;
        const glow = 0.5 + 0.5 * Math.sin(n.pulse);

        // Glow halo
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.5);
        g.addColorStop(0,   `hsla(${n.hue},100%,70%,${glow * 0.35})`);
        g.addColorStop(1,   "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.save();
        ctx.shadowBlur = n.r > 3 ? 16 : 8;
        ctx.shadowColor = `hsla(${n.hue},100%,75%,0.9)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (0.88 + 0.15 * glow), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${n.hue},100%,75%,${0.5 + 0.4 * glow})`;
        ctx.lineWidth = n.r > 3 ? 1.5 : 1;
        ctx.stroke();
        ctx.restore();

        // Inner fill
        if (n.r > 3) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},100%,80%,${0.6 * glow})`;
          ctx.fill();
        }
      }

      /* 7 — Diagonal sweep beams */
      for (const b of BEAMS) {
        b.t = (b.t + b.speed) % 1;
        const x = b.t * W;
        const grad = ctx.createLinearGradient(x - 80, 0, x, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.6, `hsla(${b.hue},100%,65%,${b.alpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${b.hue},100%,85%,${b.alpha})`);
        ctx.beginPath(); ctx.moveTo(x - 80, 0); ctx.lineTo(x, H);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();

        // Bright head
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${b.hue},100%,85%,1)`;
        ctx.beginPath(); ctx.arc(x, H * b.t * 0.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.hue},100%,90%,${b.alpha * 1.8})`;
        ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
      }

      /* 8 — Node-to-node connection lines (only close pairs) */
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const dx = NODES[i].x - NODES[j].x, dy = NODES[i].y - NODES[j].y;
          const d = Math.hypot(dx, dy);
          if (d > 150) continue;
          const a = (1 - d / 150) * 0.14;
          const hue = (NODES[i].hue + NODES[j].hue) / 2;
          ctx.beginPath(); ctx.moveTo(NODES[i].x, NODES[i].y); ctx.lineTo(NODES[j].x, NODES[j].y);
          ctx.strokeStyle = `hsla(${hue},100%,65%,${a})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }

      /* 9 — MOUSE: Biometric scanner head */
      if (M.x > 0) {
        const cx = M.x, cy = M.y;
        const spd = Math.hypot(M.vx, M.vy);
        const scanning = spd > 1;

        // Find nearest node — cursor pulses toward it
        let nearDist = 9999, nearNode = NODES[0];
        for (const n of NODES) {
          const d = Math.hypot(cx - n.x, cy - n.y);
          if (d < nearDist) { nearDist = d; nearNode = n; }
        }

        // Attraction line to nearest node
        if (nearDist < 180) {
          const a = (1 - nearDist / 180) * 0.5;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nearNode.x, nearNode.y);
          ctx.strokeStyle = VI(a); ctx.lineWidth = 0.8; ctx.setLineDash([4, 6]);
          ctx.stroke(); ctx.setLineDash([]);
        }

        // Outer violet glow bloom
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
        bloom.addColorStop(0,   VI(0.18 + 0.06 * Math.sin(T * 3)));
        bloom.addColorStop(0.5, VI(0.05));
        bloom.addColorStop(1,   "transparent");
        ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.fill();

        // Inner magenta pulse
        const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
        inner.addColorStop(0, MG(0.28 + 0.12 * Math.sin(T * 5)));
        inner.addColorStop(1, "transparent");
        ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill();

        // Outer scan arc — rotates, split violet/magenta halves
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(T * 1.4 + spd * 0.06);
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * (0.6 + spd * 0.04));
        ctx.strokeStyle = VI(0.75); ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 40, Math.PI, Math.PI * (1.6 + spd * 0.04));
        ctx.strokeStyle = MG(0.65); ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();

        // Counter-rotating ring
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-T * 2.2);
        ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(285,100%,70%,${scanning ? 0.55 : 0.30})`;
        ctx.lineWidth = 1; ctx.setLineDash([5, 8]); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();

        // Inner static ring
        ctx.save();
        ctx.shadowBlur = scanning ? 16 : 8;
        ctx.shadowColor = scanning ? MG(0.9) : VI(0.7);
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.strokeStyle = scanning ? MG(0.85) : VI(0.6);
        ctx.lineWidth = 1.4; ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();

        // Centre dot
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = WH(1);
        ctx.beginPath(); ctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = WH(0.95); ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();

        // 4 tick marks — extend when scanning
        const tLen = scanning ? 14 : 8;
        [0, 90, 180, 270].forEach(deg => {
          const rad = deg * Math.PI / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * 16, cy + Math.sin(rad) * 16);
          ctx.lineTo(cx + Math.cos(rad) * (16 + tLen), cy + Math.sin(rad) * (16 + tLen));
          ctx.strokeStyle = scanning ? MG(0.9) : VI(0.65);
          ctx.lineWidth = 1.8; ctx.stroke();
        });

        // HUD readout
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.fillStyle = VI(0.7);
        ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`, cx + 50, cy - 4);
        ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`, cx + 50, cy + 8);
        ctx.fillStyle = scanning ? MG(0.8) : VI(0.5);
        ctx.fillText(scanning ? "● SCANNING" : "○ STANDBY", cx + 50, cy + 22);
      }

      /* 10 — Click: shockwave rings + multicolour sparks */
      if (M.click && M.x > 0) {
        for (let i = 0; i < 4; i++)
          RINGS.push({ x:M.x, y:M.y, r:6, max:120+i*40, a:0.95-i*0.18, hue:270+i*20 });
        for (let i = 0; i < 22; i++) {
          const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
          SPARKS.push({ x:M.x, y:M.y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0, ml:38+Math.random()*50, hue:260+Math.random()*70 });
        }
      }
      for (let i = RINGS.length-1; i >= 0; i--) {
        const rp = RINGS[i]; rp.r += 3.8; rp.a *= 0.89;
        if (rp.r > rp.max || rp.a < 0.01) { RINGS.splice(i,1); continue; }
        ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = `hsla(${rp.hue},100%,70%,0.85)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,75%,${rp.a})`;
        ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore();
      }
      for (let i = SPARKS.length-1; i >= 0; i--) {
        const s = SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.958; s.vy*=0.958; s.life++;
        if (s.life >= s.ml) { SPARKS.splice(i,1); continue; }
        const p = s.life/s.ml, a = p<0.2 ? p/0.2 : 1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.8*(1-p*0.5), 0, Math.PI*2);
        ctx.fillStyle = `hsla(${s.hue},100%,75%,${a*0.9})`; ctx.fill();
      }

      /* 11 — Corner HUD brackets (violet glow) */
      [[12,12,1,1],[W-12,12,-1,1],[W-12,H-12,-1,-1],[12,H-12,1,-1]].forEach(([x,y,sx,sy],i)=>{
        const hue = 270 + i * 18;
        ctx.strokeStyle = `hsla(${hue},100%,65%,0.45)`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x+sx*22,y); ctx.lineTo(x,y); ctx.lineTo(x,y+sy*22); ctx.stroke();
        const pa = 0.4 + 0.45 * Math.sin(T * 1.4 + i);
        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${hue},100%,72%,0.8)`;
        ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${hue},100%,78%,${pa})`; ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      });

      /* 12 — Bottom status strip */
      const strip = ctx.createLinearGradient(0, H-22, 0, H);
      strip.addColorStop(0, "rgba(20,0,40,0)"); strip.addColorStop(1, "rgba(20,0,40,0.65)");
      ctx.fillStyle = strip; ctx.fillRect(0, H-22, W, 22);
      ctx.font = "7px 'Orbitron',monospace"; ctx.textAlign = "center";
      ctx.fillStyle = VI(0.35);
      ctx.fillText(`NEURAL BIOMETRIC INTERFACE  •  ${new Date().toLocaleTimeString()}  •  ${NODES.length} NODES ACTIVE`, W/2, H-5);

      /* 13 — Scan line */
      const sY = ((T * 0.024) % 1) * H;
      const sl = ctx.createLinearGradient(0, sY-1.5, 0, sY+1.5);
      sl.addColorStop(0, "transparent"); sl.addColorStop(0.5, VI(0.025)); sl.addColorStop(1, "transparent");
      ctx.fillStyle = sl; ctx.fillRect(0, sY-1.5, W, 3);

      raf = requestAnimationFrame(draw);
    }

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
    ctx.fillStyle = "#0a0018"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseleave",onLeave);
    };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0 }} aria-hidden>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
    </div>
  );
}
