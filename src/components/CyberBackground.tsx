import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  BIOMETRIC IDENTITY SYSTEM — Full animated background
  
  Design concept:
  ─ The eye.jpg lives in a breathing iris aperture at screen centre
  ─ LEFT SIDE: animated fingerprint scanner panel
  ─ RIGHT SIDE: DNA helix / biometric data stream
  ─ Scattered: HEX nodes, circuit traces, floating particles
  ─ Mouse: precision targeting reticle that the system "tracks"
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let raf = 0, T = 0;
    const M = { x: -999, y: -999, px: -999, py: -999, click: false };
    const SM = { x: -999, y: -999 };

    const onMove  = (e: MouseEvent) => { M.px = M.x; M.py = M.y; M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; setTimeout(() => { M.click = false; }, 260); };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    /* Image */
    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK = true; };
    img.src = BG_IMAGE;

    /* Colours */
    const CY = (a: number) => `rgba(0,210,255,${a})`;
    const GO = (a: number) => `rgba(255,190,30,${a})`;
    const GN = (a: number) => `rgba(0,255,140,${a})`;
    const PU = (a: number) => `rgba(180,80,255,${a})`;
    const IC = (a: number) => `rgba(200,240,255,${a})`;

    /* State */
    interface Node    { x:number;y:number;ox:number;oy:number;vx:number;vy:number;r:number;hue:number;phase:number; }
    interface Trace   { pts:{x:number;y:number}[];hue:number;alpha:number;flow:number; }
    interface Ring    { x:number;y:number;r:number;max:number;a:number;hue:number; }
    interface Spark   { x:number;y:number;vx:number;vy:number;age:number;life:number;hue:number; }
    interface Mote    { x:number;y:number;vx:number;vy:number;r:number;life:number; }

    let NODES:  Node[]  = [];
    let TRACES: Trace[] = [];
    let MOTES:  Mote[]  = [];
    const RINGS:  Ring[]  = [];
    const SPARKS: Spark[] = [];

    /* Iris */
    let IW = 0, IH = 0, IOffX = 0, IOffY = 0, IRot = 0;

    /* Left panel — fingerprint */
    let fpScan = 0;

    /* Right panel — DNA helix */
    let dnaT = 0;

    function init() {
      const W = canvas.width, H = canvas.height;
      IW = Math.min(W, H) * 0.44;
      IH = Math.min(W, H) * 0.28;

      /* Circuit nodes */
      NODES = Array.from({ length: 48 }, (_, i) => {
        const x = 30 + Math.random() * (W - 60);
        const y = 30 + Math.random() * (H - 60);
        return { x, y, ox: x, oy: y, vx: 0, vy: 0,
          r: i < 8 ? 3.5 + Math.random() * 2.5 : 1.2 + Math.random() * 2,
          hue: [193, 210, 42, 165, 270][Math.floor(Math.random() * 5)],
          phase: Math.random() * Math.PI * 2 };
      });

      /* Manhattan circuit traces */
      TRACES = Array.from({ length: 38 }, () => {
        const pts: {x:number;y:number}[] = [];
        let cx = Math.random() * W, cy = Math.random() * H;
        pts.push({ x: cx, y: cy });
        for (let s = 0; s < 3 + Math.floor(Math.random() * 4); s++) {
          Math.random() > 0.5 ? (cx += (Math.random() - 0.5) * 200) : (cy += (Math.random() - 0.5) * 160);
          pts.push({ x: cx, y: cy });
        }
        return { pts, hue: [193, 42, 165, 270, 145][Math.floor(Math.random() * 5)],
          alpha: 0.06 + Math.random() * 0.12, flow: Math.random() };
      });

      /* Ambient dust motes */
      MOTES = Array.from({ length: 70 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.14,
        r: 0.5 + Math.random() * 1.4, life: Math.random() * Math.PI * 2,
      }));
    }

    /* ── Left side: Fingerprint panel ── */
    function drawFingerprintPanel(W: number, H: number) {
      const pw = Math.min(180, W * 0.14);
      const ph = pw * 1.35;
      const px = 28;
      const py = H / 2 - ph / 2;
      const cx = px + pw / 2, cy = py + ph * 0.44;
      const r  = pw * 0.36;

      ctx.save();

      /* Glass panel bg */
      const bg = ctx.createLinearGradient(px, py, px, py + ph);
      bg.addColorStop(0, "rgba(0,12,30,0.72)");
      bg.addColorStop(1, "rgba(0,6,18,0.82)");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.fill();

      /* Fingerprint arcs */
      for (let i = 1; i <= 9; i++) {
        const rr = r * (i / 9);
        const hue = 145 + i * 8;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.08, rr, Math.PI * 0.06 + i * 0.025, Math.PI * 0.94 - i * 0.025);
        ctx.strokeStyle = `hsla(${hue},90%,58%,${0.12 + i * 0.055})`;
        ctx.lineWidth = 0.85; ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.08, rr, Math.PI * 1.06 + i * 0.025, Math.PI * 1.94 - i * 0.025);
        ctx.strokeStyle = `hsla(${hue},90%,48%,${0.08 + i * 0.04})`;
        ctx.lineWidth = 0.7; ctx.stroke();
      }

      /* Scan line */
      fpScan = (fpScan + 1.2) % (ph * 0.85);
      const scanY = py + ph * 0.08 + fpScan;
      const sg = ctx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, GN(0.80));
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(px + 4, scanY - 3, pw - 8, 6);

      /* Centre dot */
      ctx.save();
      ctx.shadowBlur = 14; ctx.shadowColor = GN(1);
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = GN(0.9); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();

      /* Progress bar */
      const pct = (fpScan / (ph * 0.85));
      ctx.fillStyle = "rgba(0,20,10,0.6)";
      ctx.fillRect(px + 8, py + ph - 18, pw - 16, 6);
      const pgrd = ctx.createLinearGradient(px + 8, 0, px + 8 + (pw - 16) * pct, 0);
      pgrd.addColorStop(0, GN(0.9)); pgrd.addColorStop(1, CY(0.8));
      ctx.fillStyle = pgrd;
      ctx.fillRect(px + 8, py + ph - 18, (pw - 16) * pct, 6);

      /* Border + brackets */
      ctx.save();
      ctx.shadowBlur = 14; ctx.shadowColor = GN(0.8);
      ctx.strokeStyle = GN(0.55); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();

      const bs = 14;
      [[px, py, 1, 1], [px + pw, py, -1, 1], [px + pw, py + ph, -1, -1], [px, py + ph, 1, -1]].forEach(([bx, by, sx, sy]) => {
        ctx.strokeStyle = GN(0.95); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(bx + sx * bs, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + sy * bs); ctx.stroke();
      });

      /* Label */
      ctx.font = "bold 7.5px 'Orbitron',monospace"; ctx.textAlign = "center";
      ctx.fillStyle = GN(0.7); ctx.fillText("FINGERPRINT SCAN", cx, py - 8);
      const pulse = 0.5 + 0.5 * Math.sin(T * 3);
      ctx.fillStyle = GN(0.5 + 0.4 * pulse);
      ctx.fillText("● SCANNING", cx, py + ph + 14);

      ctx.restore();
    }

    /* ── Right side: DNA / Biometric helix ── */
    function drawDNAPanel(W: number, H: number) {
      dnaT += 0.022;
      const pw = Math.min(170, W * 0.13);
      const ph = H * 0.62;
      const px = W - pw - 28;
      const py = H / 2 - ph / 2;
      const cx = px + pw / 2;

      ctx.save();

      /* Glass bg */
      const bg = ctx.createLinearGradient(px, py, px, py + ph);
      bg.addColorStop(0, "rgba(0,8,26,0.72)");
      bg.addColorStop(1, "rgba(0,4,16,0.80)");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.fill();

      /* Helix strands */
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const progress = i / steps;
        const y = py + 16 + progress * (ph - 32);
        const ang = progress * Math.PI * 4.5 + dnaT;
        const amp = pw * 0.28;

        const x1 = cx + Math.cos(ang) * amp;
        const x2 = cx + Math.cos(ang + Math.PI) * amp;

        /* Connecting rung */
        const t2 = 0.5 + 0.5 * Math.sin(ang * 1.5);
        const hue = 193 + t2 * 80;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsla(${hue},100%,60%,${0.12 + t2 * 0.22})`; ctx.lineWidth = 0.9; ctx.stroke();

        /* Node dots */
        const bright = Math.abs(Math.cos(ang));
        if (bright > 0.5) {
          ctx.save();
          ctx.shadowBlur = 6; ctx.shadowColor = `hsla(${hue},100%,70%,0.9)`;
          ctx.beginPath(); ctx.arc(x1, y, 2.4 * bright, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},100%,72%,${0.6 + bright * 0.35})`; ctx.fill();
          ctx.beginPath(); ctx.arc(x2, y, 2.4 * bright, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue + 40},100%,72%,${0.6 + bright * 0.35})`; ctx.fill();
          ctx.shadowBlur = 0; ctx.restore();
        }
      }

      /* Border */
      ctx.save();
      ctx.shadowBlur = 12; ctx.shadowColor = CY(0.7);
      ctx.strokeStyle = CY(0.45); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();

      /* Corner brackets */
      const bs = 14;
      [[px, py, 1, 1], [px + pw, py, -1, 1], [px + pw, py + ph, -1, -1], [px, py + ph, 1, -1]].forEach(([bx, by, sx, sy]) => {
        ctx.strokeStyle = CY(0.9); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(bx + sx * bs, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + sy * bs); ctx.stroke();
      });

      /* Label */
      ctx.font = "bold 7.5px 'Orbitron',monospace"; ctx.textAlign = "center";
      ctx.fillStyle = CY(0.7); ctx.fillText("DNA SEQUENCE", cx, py - 8);
      const p2 = 0.5 + 0.5 * Math.sin(T * 2.2 + 1);
      ctx.fillStyle = CY(0.5 + 0.4 * p2);
      ctx.fillText("● ANALYSING", cx, py + ph + 14);

      ctx.restore();
    }

    /* ── Centre iris aperture ── */
    function drawIris(W: number, H: number) {
      const CX = W * 0.5, CY = H * 0.5;
      const breath = Math.sin(T * 0.52) * 0.022;
      const iw = IW * (1 + breath), ih = IH * (1 + breath * 0.8);
      IRot += 0.0013;

      /* Smooth parallax */
      if (M.x > 0) {
        IOffX += ((M.x - CX) / W * 26 - IOffX) * 0.04;
        IOffY += ((M.y - CY) / H * 18 - IOffY) * 0.04;
      }

      /* Halo */
      const halo = ctx.createRadialGradient(CX, CY, iw * 0.55, CX, CY, iw * 1.55);
      halo.addColorStop(0, CY(0.09 + 0.04 * Math.sin(T * 0.9)));
      halo.addColorStop(0.5, CY(0.03));
      halo.addColorStop(1, "transparent");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.ellipse(CX, CY, iw * 1.55, ih * 1.55, 0, 0, Math.PI * 2); ctx.fill();

      /* Image */
      if (imgOK) {
        ctx.save();
        ctx.beginPath(); ctx.ellipse(CX, CY, iw, ih, 0, 0, Math.PI * 2); ctx.clip();
        const sc = (iw * 2.3) / img.width;
        ctx.drawImage(img, CX - img.width * sc / 2 + IOffX, CY - img.height * sc / 2 + IOffY, img.width * sc, img.height * sc);
        /* Inner vignette */
        const vig = ctx.createRadialGradient(CX, CY, iw * 0.42, CX, CY, iw);
        vig.addColorStop(0, "transparent"); vig.addColorStop(0.65, "rgba(0,4,14,0.08)"); vig.addColorStop(1, "rgba(0,4,14,0.80)");
        ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      /* Iris fibers */
      ctx.save();
      ctx.beginPath(); ctx.ellipse(CX, CY, iw * 0.97, ih * 0.97, 0, 0, Math.PI * 2); ctx.clip();
      for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * Math.PI * 2 + IRot;
        const jit = Math.sin(T * 0.4 + i * 0.8) * 0.04;
        const r1 = Math.min(iw, ih) * 0.34, r2 = Math.min(iw, ih) * 0.88;
        ctx.beginPath();
        ctx.moveTo(CX + Math.cos(ang + jit) * r1, CY + Math.sin(ang + jit) * r1 * (ih / iw));
        ctx.lineTo(CX + Math.cos(ang) * r2,       CY + Math.sin(ang) * r2 * (ih / iw));
        ctx.strokeStyle = `hsla(${i % 3 === 0 ? 42 : 193},100%,65%,${0.055 + 0.035 * Math.sin(T * 0.6 + i)})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
      ctx.restore();

      /* Border */
      const bp = 0.5 + 0.5 * Math.sin(T * 0.72);
      ctx.save();
      ctx.shadowBlur = 28 + 12 * bp; ctx.shadowColor = CY(0.85);
      ctx.strokeStyle = CY(0.60 + 0.28 * bp); ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(CX, CY, iw, ih, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();

      /* Outer thin */
      ctx.beginPath(); ctx.ellipse(CX, CY, iw + 7, ih + 5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = CY(0.10 * bp); ctx.lineWidth = 0.8; ctx.stroke();

      /* Pulse rings */
      for (let i = 0; i < 3; i++) {
        const ph2 = (T * 0.38 + i * 2.1) % (Math.PI * 2);
        const pr = iw * (1.05 + 0.24 * (ph2 / (Math.PI * 2)));
        const pa = Math.max(0, 0.18 * (1 - ph2 / (Math.PI * 2)));
        ctx.beginPath(); ctx.ellipse(CX, CY, pr, pr * (ih / iw), 0, 0, Math.PI * 2);
        ctx.strokeStyle = CY(pa); ctx.lineWidth = 0.85; ctx.stroke();
      }

      /* Eyelid arcs */
      ctx.beginPath(); ctx.ellipse(CX, CY - ih * 0.14, iw * 1.06, ih * 1.12, 0, Math.PI + 0.07, Math.PI * 2 - 0.07);
      ctx.strokeStyle = CY(0.055); ctx.lineWidth = 0.6; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CX, CY + ih * 0.14, iw * 1.06, ih * 1.12, 0, 0.07, Math.PI - 0.07);
      ctx.strokeStyle = CY(0.055); ctx.lineWidth = 0.6; ctx.stroke();
    }

    /* ── Mouse: precision biometric reticle ── */
    function drawMouse(W: number, H: number) {
      if (M.x < 0) return;

      /* Smooth interpolation */
      SM.x = SM.x < 0 ? M.x : SM.x + (M.x - SM.x) * 0.10;
      SM.y = SM.y < 0 ? M.y : SM.y + (M.y - SM.y) * 0.10;
      const cx = SM.x, cy = SM.y;

      const CX = W * 0.5, CY = H * 0.5;
      const inside = Math.hypot((cx - CX) / IW, (cy - CY) / IH) < 0.88;
      const spd = Math.hypot(M.x - M.px, M.y - M.py);
      const hot = spd > 1.5;

      /* Base colour: cyan inside iris, gold outside */
      const baseCol = inside ? CY : GO;

      /* Soft bloom */
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      bloom.addColorStop(0, inside ? CY(hot ? 0.14 : 0.08) : GO(hot ? 0.12 : 0.07));
      bloom.addColorStop(1, "transparent");
      ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill();

      /* ① Outer rotating arc (3/4 open) */
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(T * 1.8 + spd * 0.06);
      ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 1.5);
      ctx.strokeStyle = baseCol(0.55 + 0.22 * Math.sin(T * 2.5));
      ctx.lineWidth = 1.6; ctx.stroke();
      /* Arc end cap dot */
      const ec = Math.PI * 1.5;
      ctx.save(); ctx.shadowBlur = 6; ctx.shadowColor = baseCol(1);
      ctx.beginPath(); ctx.arc(Math.cos(ec) * 32, Math.sin(ec) * 32, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = baseCol(0.9); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
      ctx.restore();

      /* ② Counter-rotating inner arc */
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-T * 1.3);
      ctx.beginPath(); ctx.arc(0, 0, 20, Math.PI * 0.3, Math.PI * 1.8);
      ctx.strokeStyle = baseCol(0.38 + 0.18 * Math.sin(T * 3));
      ctx.lineWidth = 1.0; ctx.stroke();
      ctx.restore();

      /* ③ Static diamond */
      const ds = 11;
      ctx.save();
      ctx.shadowBlur = 7; ctx.shadowColor = baseCol(0.8);
      ctx.strokeStyle = baseCol(0.70); ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ds); ctx.lineTo(cx + ds * 0.65, cy);
      ctx.lineTo(cx, cy + ds); ctx.lineTo(cx - ds * 0.65, cy);
      ctx.closePath(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();

      /* ④ Centre dot */
      ctx.save();
      ctx.shadowBlur = hot ? 18 : 10; ctx.shadowColor = hot ? GN(1) : baseCol(0.9);
      ctx.beginPath(); ctx.arc(cx, cy, hot ? 3.8 : 2.8, 0, Math.PI * 2);
      ctx.fillStyle = hot ? GN(0.96) : IC(0.95); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();

      /* ⑤ 4 tick marks with gap */
      const arm = 13, gap = 7;
      ctx.strokeStyle = baseCol(hot ? 0.80 : 0.52); ctx.lineWidth = hot ? 1.4 : 1.0;
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + dx * gap, cy + dy * gap);
        ctx.lineTo(cx + dx * (gap + arm), cy + dy * (gap + arm));
        ctx.stroke();
      });

      /* ⑥ HUD coordinate readout (when moving fast) */
      if (hot) {
        ctx.font = "6.5px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
        ctx.fillStyle = baseCol(0.65);
        ctx.fillText(`X:${String(Math.floor(cx)).padStart(4, "0")}`, cx + 46, cy - 2);
        ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4, "0")}`, cx + 46, cy + 10);
        ctx.fillStyle = baseCol(0.45);
        ctx.fillText("● TRACKING", cx + 46, cy + 24);
      }
    }

    /* ── Main draw loop ── */
    function draw() {
      T += 0.016;
      const W = canvas.width, H = canvas.height;
      const CX = W * 0.5, CY = H * 0.5;

      /* 1 — Void */
      ctx.fillStyle = "#000610"; ctx.fillRect(0, 0, W, H);

      /* 2 — Ambient glow */
      const amb = ctx.createRadialGradient(CX, CY, 0, CX, CY, W * 0.7);
      amb.addColorStop(0, "rgba(0,18,44,0.58)"); amb.addColorStop(0.4, "rgba(0,10,28,0.26)"); amb.addColorStop(1, "transparent");
      ctx.fillStyle = amb; ctx.fillRect(0, 0, W, H);

      /* 3 — Dust motes */
      for (const mo of MOTES) {
        mo.x += mo.vx; mo.y += mo.vy; mo.life += 0.007;
        if (mo.x < 0) mo.x = W; if (mo.x > W) mo.x = 0;
        if (mo.y < 0) mo.y = H; if (mo.y > H) mo.y = 0;
        const a = 0.30 + 0.30 * Math.sin(mo.life);
        const gold = (mo.life * 3 | 0) % 5 === 0;
        ctx.beginPath(); ctx.arc(mo.x, mo.y, mo.r, 0, Math.PI * 2);
        ctx.fillStyle = gold ? GO(a * 0.5) : CY(a * 0.28); ctx.fill();
      }

      /* 4 — Circuit traces */
      for (const tr of TRACES) {
        tr.flow = (tr.flow + 0.0022) % 1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
        for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
        ctx.strokeStyle = `hsla(${tr.hue},100%,58%,${tr.alpha})`; ctx.lineWidth = 0.65; ctx.stroke();
        for (const pt of tr.pts) {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${tr.hue},100%,68%,${tr.alpha * 1.8})`; ctx.fill();
        }
        /* Photon */
        const total = tr.pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p.x - tr.pts[i].x, p.y - tr.pts[i].y), 0);
        let tgt = tr.flow * total, walked = 0;
        for (let i = 1; i < tr.pts.length; i++) {
          const seg = Math.hypot(tr.pts[i].x - tr.pts[i-1].x, tr.pts[i].y - tr.pts[i-1].y);
          if (walked + seg >= tgt) {
            const t2 = (tgt - walked) / seg;
            const px = tr.pts[i-1].x + t2 * (tr.pts[i].x - tr.pts[i-1].x);
            const py2 = tr.pts[i-1].y + t2 * (tr.pts[i].y - tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${tr.hue},100%,80%,1)`;
            ctx.beginPath(); ctx.arc(px, py2, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${tr.hue},100%,88%,0.95)`; ctx.fill();
            ctx.shadowBlur = 0; ctx.restore(); break;
          }
          walked += seg;
        }
      }

      /* 5 — Dot grid */
      for (let gx = 0; gx < W; gx += 42) {
        for (let gy = 0; gy < H; gy += 42) {
          const hue = 42 + ((gx * 0.2 + gy * 0.15 + T * 14) % 30);
          const a = 0.028 + 0.018 * Math.sin(T * 0.45 + gx * 0.04 + gy * 0.03);
          ctx.beginPath(); ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},100%,62%,${a})`; ctx.fill();
        }
      }

      /* 6 — Circuit nodes */
      for (const n of NODES) {
        n.phase += 0.011;
        const pulse = 0.5 + 0.5 * Math.sin(n.phase);
        if (M.x > 0) {
          const dx = M.x - n.x, dy = M.y - n.y, d = Math.hypot(dx, dy);
          if (d < 200 && d > 0.5) { const f = 0.020 * (1 - d / 200); n.vx += dx / d * f; n.vy += dy / d * f; }
        }
        n.vx += (n.ox - n.x) * 0.013; n.vy += (n.oy - n.y) * 0.013;
        n.vx *= 0.87; n.vy *= 0.87; n.x += n.vx; n.y += n.vy;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.5);
        g.addColorStop(0, `hsla(${n.hue},100%,65%,${pulse * 0.28})`); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.shadowBlur = n.r > 3 ? 14 : 7; ctx.shadowColor = `hsla(${n.hue},100%,70%,0.9)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (0.88 + 0.14 * pulse), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${n.hue},100%,70%,${0.45 + 0.42 * pulse})`; ctx.lineWidth = n.r > 3 ? 1.4 : 0.9; ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
      }

      /* 7 — Node connection lines */
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const d = Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y);
          if (d > 140) continue;
          ctx.beginPath(); ctx.moveTo(NODES[i].x, NODES[i].y); ctx.lineTo(NODES[j].x, NODES[j].y);
          ctx.strokeStyle = CY((1 - d / 140) * 0.09); ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* 8 — LEFT: Fingerprint panel */
      drawFingerprintPanel(W, H);

      /* 9 — RIGHT: DNA helix panel */
      drawDNAPanel(W, H);

      /* 10 — CENTRE: Iris aperture */
      drawIris(W, H);

      /* 11 — MOUSE: reticle */
      drawMouse(W, H);

      /* 12 — Click effects */
      if (M.click && M.x > 0) {
        const inside = Math.hypot((M.x - CX) / IW, (M.y - CY) / IH) < 0.88;
        for (let i = 0; i < 4; i++) RINGS.push({ x: M.x, y: M.y, r: 5, max: 65 + i * 28, a: 0.9 - i * 0.18, hue: inside ? 193 : 42 });
        for (let i = 0; i < 16; i++) {
          const ang = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 4.5;
          SPARKS.push({ x: M.x, y: M.y, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, age: 0, life: 32 + Math.random() * 42, hue: [193, 42, 145, 270][Math.floor(Math.random() * 4)] });
        }
      }
      for (let i = RINGS.length - 1; i >= 0; i--) {
        const rp = RINGS[i]; rp.r += 3.5; rp.a *= 0.90;
        if (rp.r > rp.max || rp.a < 0.01) { RINGS.splice(i, 1); continue; }
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${rp.hue},100%,70%,0.8)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,72%,${rp.a})`; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
      }
      for (let i = SPARKS.length - 1; i >= 0; i--) {
        const s = SPARKS[i]; s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy *= 0.96; s.age++;
        if (s.age >= s.life) { SPARKS.splice(i, 1); continue; }
        const p = s.age / s.life, a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.2 * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},100%,72%,${a * 0.90})`; ctx.fill();
      }

      /* 13 — Corner HUD brackets */
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([x, y, sx, sy], i) => {
        const hue = i % 2 === 0 ? 193 : 42, s = 20;
        ctx.strokeStyle = `hsla(${hue},100%,62%,0.28)`; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x + sx * s, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * s); ctx.stroke();
        const pa = 0.30 + 0.30 * Math.sin(T * 1.4 + i);
        ctx.save(); ctx.shadowBlur = 7; ctx.shadowColor = `hsla(${hue},100%,72%,0.8)`;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,76%,${pa})`; ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      });

      /* 14 — Scan line */
      const sY = ((T * 0.019) % 1) * H;
      const sl = ctx.createLinearGradient(0, sY - 1, 0, sY + 1);
      sl.addColorStop(0, "transparent"); sl.addColorStop(0.5, CY(0.014)); sl.addColorStop(1, "transparent");
      ctx.fillStyle = sl; ctx.fillRect(0, sY - 1, W, 2);

      raf = requestAnimationFrame(draw);
    }

    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    init();
    ctx.fillStyle = "#000610"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1 }} aria-hidden>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
