import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d"); if (!ctx) return;
    let   raf    = 0;
    let   t      = 0;

    const M = { x: -999, y: -999, px: -999, py: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.px = M.x; M.py = M.y; M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 180); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    interface INode { x:number;y:number;vx:number;vy:number;r:number;hue:number;alpha:number;pulse:number;pulseSpd:number;type:"hub"|"node"|"micro"; }
    interface IRipple { x:number;y:number;r:number;maxR:number;alpha:number;hue:number; }
    interface IPacket { x:number;y:number;tx:number;ty:number;prog:number;spd:number;hue:number; }
    interface ITrail { x:number;y:number;t:number; }
    interface IFPRing { cx:number;cy:number;r:number;maxR:number;alpha:number; }

    let NODES: INode[] = [];
    const RIPPLES: IRipple[] = [];
    const PACKETS: IPacket[] = [];
    const TRAIL: ITrail[]   = [];
    const FP_RINGS: IFPRing[] = [];
    const MAX_DIST = 165;
    const HEX_S    = 50;
    let packetTimer = 0;

    function buildGrid() {
      const W = canvas.width, H = canvas.height;
      const count = Math.min(Math.floor((W * H) / 16000), 95);
      NODES = Array.from({ length: count }, (_, i) => {
        const isHub   = i < 7;
        const isMicro = i > count * 0.6;
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * (isHub ? 0.12 : 0.28),
          vy: (Math.random() - 0.5) * (isHub ? 0.12 : 0.28),
          r:  isHub ? 5 + Math.random() * 3 : isMicro ? 1 + Math.random() * 0.8 : 2 + Math.random() * 2,
          hue: isHub ? 192 : Math.random() > 0.65 ? 192 : Math.random() > 0.5 ? 155 : 270,
          alpha: isHub ? 0.9 : 0.4 + Math.random() * 0.5,
          pulse: Math.random() * Math.PI * 2,
          pulseSpd: 0.018 + Math.random() * 0.04,
          type: (isHub ? "hub" : isMicro ? "micro" : "node") as "hub"|"node"|"micro",
        };
      });
    }

    function spawnPacket() {
      const hubs = NODES.filter(n => n.type === "hub");
      if (hubs.length < 2) return;
      const a = hubs[Math.floor(Math.random() * hubs.length)];
      const b = hubs[Math.floor(Math.random() * hubs.length)];
      if (a === b) return;
      PACKETS.push({ x: a.x, y: a.y, tx: b.x, ty: b.y, prog: 0, spd: 0.007 + Math.random() * 0.013, hue: Math.random() > 0.5 ? 192 : 155 });
    }

    function drawHex(cx: number, cy: number, s: number, alpha: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + s * Math.cos(a), cy + s * Math.sin(a))
                : ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,180,255,${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; buildGrid(); };
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      t += 0.016;
      packetTimer += 0.016;
      const W = canvas.width, H = canvas.height;

      /* DEEP BACKGROUND */
      ctx.fillStyle = "rgb(2,5,16)";
      ctx.fillRect(0, 0, W, H);

      /* AMBIENT RADIAL */
      const ambCx = W * 0.5, ambCy = H * 0.45;
      const amb = ctx.createRadialGradient(ambCx, ambCy, 0, ambCx, ambCy, Math.min(W, H) * 0.75);
      amb.addColorStop(0,   "rgba(0,55,115,0.4)");
      amb.addColorStop(0.45,"rgba(0,25,75,0.18)");
      amb.addColorStop(1,   "transparent");
      ctx.fillStyle = amb; ctx.fillRect(0, 0, W, H);

      /* HEX GRID */
      const hexAlpha = 0.016 + 0.005 * Math.sin(t * 0.4);
      const colsH = Math.ceil(W / (HEX_S * 1.73)) + 2;
      const rowsH = Math.ceil(H / (HEX_S * 1.5)) + 2;
      for (let row = -1; row < rowsH; row++) {
        for (let col = -1; col < colsH; col++) {
          const cx = col * HEX_S * 1.732 + (row % 2 === 0 ? 0 : HEX_S * 0.866);
          const cy = row * HEX_S * 1.5;
          const md = M.x > 0 ? Math.hypot(cx - M.x, cy - M.y) : 9999;
          const prx = Math.max(0, 1 - md / 280);
          if (prx > 0.05) {
            ctx.fillStyle = `rgba(0,200,255,${prx * 0.06})`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (Math.PI / 3) * i - Math.PI / 6;
              i === 0 ? ctx.moveTo(cx + (HEX_S - 1) * Math.cos(a), cy + (HEX_S - 1) * Math.sin(a))
                      : ctx.lineTo(cx + (HEX_S - 1) * Math.cos(a), cy + (HEX_S - 1) * Math.sin(a));
            }
            ctx.closePath(); ctx.fill();
          }
          drawHex(cx, cy, HEX_S - 1, hexAlpha + prx * 0.14);
        }
      }

      /* HORIZONTAL SCAN SWEEPS */
      for (let i = 0; i < 3; i++) {
        const sy = ((t * (16 + i * 9)) % H + H) % H;
        const sg = ctx.createLinearGradient(0, sy - 2, 0, sy + 2);
        sg.addColorStop(0, "transparent");
        sg.addColorStop(0.5, `rgba(0,200,255,${0.04 + i * 0.01})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.fillRect(0, sy - 2, W, 4);
      }

      /* DNA HELIX — LEFT */
      {
        const hx = W * 0.07, amp = 25, vstep = 16;
        const strands = Math.ceil(H / vstep) + 6;
        for (let i = -3; i < strands; i++) {
          const fy = ((i * vstep - (t * 20) % (vstep * strands)) % (vstep * strands) + vstep * strands) % (vstep * strands);
          const px  = hx + Math.sin((i * 0.55) + t * 0.75) * amp;
          const px2 = hx + Math.sin((i * 0.55) + t * 0.75 + Math.PI) * amp;
          const age = Math.abs(Math.sin(i * 0.8 + t * 0.45));
          ctx.beginPath(); ctx.arc(px,  fy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,200,255,${0.5 * age})`; ctx.fill();
          ctx.beginPath(); ctx.arc(px2, fy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,155,${0.5 * age})`; ctx.fill();
          if (i % 3 === 0) {
            ctx.beginPath(); ctx.moveTo(px, fy); ctx.lineTo(px2, fy);
            ctx.strokeStyle = `rgba(0,220,255,${0.16 * age})`;
            ctx.lineWidth = 0.9; ctx.stroke();
          }
        }
        ctx.save(); ctx.translate(hx - 42, H * 0.5); ctx.rotate(-Math.PI / 2);
        ctx.font = "700 7.5px 'IBM Plex Mono',monospace";
        ctx.fillStyle = "rgba(0,200,255,0.22)";
        ctx.letterSpacing = "0.28em";
        ctx.fillText("DNA · BIOMETRIC SEQUENCE", 0, 0);
        ctx.restore(); ctx.letterSpacing = "0";
      }

      /* BINARY RAIN — RIGHT */
      {
        const cols2 = 7, colW = 15, startX = W - cols2 * colW - 20;
        for (let c = 0; c < cols2; c++) {
          const cxb = startX + c * colW;
          const rowCount = Math.ceil(H / 17) + 2;
          for (let r = 0; r < rowCount; r++) {
            const ry = ((r * 17 - (t * (22 + c * 4)) % (rowCount * 17)) % (rowCount * 17) + rowCount * 17) % (rowCount * 17);
            const v = Math.random() > 0.5 ? "1" : "0";
            const bright = 1 - ry / H;
            ctx.font = `${7 + (c > 3 ? 1 : 0)}px 'IBM Plex Mono',monospace`;
            ctx.fillStyle = `rgba(0,${175 + c * 10},${90 + c * 18},${0.1 + bright * 0.07})`;
            ctx.fillText(v, cxb, ry);
          }
        }
      }

      /* CIRCUIT TRACES */
      {
        const traces = [
          { x1: 0.08, y1: 0.18, x2: 0.32, y2: 0.18, hue: 192 },
          { x1: 0.32, y1: 0.18, x2: 0.32, y2: 0.38, hue: 192 },
          { x1: 0.68, y1: 0.72, x2: 0.92, y2: 0.72, hue: 155 },
          { x1: 0.68, y1: 0.55, x2: 0.68, y2: 0.72, hue: 155 },
          { x1: 0.1,  y1: 0.82, x2: 0.42, y2: 0.82, hue: 270 },
          { x1: 0.42, y1: 0.65, x2: 0.42, y2: 0.82, hue: 270 },
          { x1: 0.55, y1: 0.12, x2: 0.92, y2: 0.12, hue: 192 },
          { x1: 0.55, y1: 0.12, x2: 0.55, y2: 0.32, hue: 192 },
        ];
        const alpha = 0.055 + 0.03 * Math.sin(t * 1.4);
        traces.forEach(({ x1, y1, x2, y2, hue }) => {
          ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H);
          ctx.strokeStyle = `hsla(${hue},100%,65%,${alpha})`;
          ctx.lineWidth = 1; ctx.stroke();
          [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(({ x, y }) => {
            ctx.beginPath(); ctx.arc(x * W, y * H, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue},100%,70%,${alpha * 2.5})`; ctx.fill();
          });
        });
      }

      /* NEURAL NETWORK — update nodes */
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        n.pulse += n.pulseSpd;
        if (M.x > 0) {
          const md = Math.hypot(n.x - M.x, n.y - M.y);
          const prx = Math.max(0, 1 - md / 210);
          if (prx > 0.05 && md > 1) {
            n.vx += (n.x - M.x) / md * 0.018 * prx;
            n.vy += (n.y - M.y) / md * 0.018 * prx;
          }
        }
        const spd = Math.hypot(n.vx, n.vy);
        if (spd > 1.5) { n.vx *= 1.5 / spd; n.vy *= 1.5 / spd; }
        n.vx *= 0.991; n.vy *= 0.991;
      });

      /* NEURAL EDGES */
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const a = NODES[i], b = NODES[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > MAX_DIST) continue;
          const edgeAlpha = (1 - dist / MAX_DIST) * 0.17;
          const hue = (a.hue + b.hue) / 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${hue},100%,65%,${edgeAlpha})`;
          ctx.lineWidth = a.type === "hub" && b.type === "hub" ? 1.1 : 0.55;
          ctx.stroke();
        }
      }

      /* NEURAL NODES */
      NODES.forEach(n => {
        const pulse = 0.65 + 0.35 * Math.sin(n.pulse);
        const r = n.r * (1 + 0.18 * pulse);
        const a = n.alpha * pulse;
        if (n.type === "hub") {
          ctx.save();
          ctx.shadowBlur = 22 + 8 * pulse;
          ctx.shadowColor = `hsla(${n.hue},100%,65%,0.85)`;
          ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${n.hue},100%,65%,${a * 0.3})`;
          ctx.lineWidth = 0.9; ctx.stroke();
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},100%,70%,${a})`;
          ctx.fill(); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},90%,70%,${a * 0.75})`; ctx.fill();
        }
      });

      /* DATA PACKETS */
      if (packetTimer > 1.1 && PACKETS.length < 14) { spawnPacket(); packetTimer = 0; }
      for (let i = PACKETS.length - 1; i >= 0; i--) {
        const p = PACKETS[i];
        p.prog += p.spd;
        if (p.prog >= 1) { PACKETS.splice(i, 1); continue; }
        const interp = (1 - Math.pow(1 - p.prog, 3));
        const px = p.x + (p.tx - p.x) * interp;
        const py = p.y + (p.ty - p.y) * interp;
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${p.hue},100%,70%,0.9)`;
        ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,82%,${1 - p.prog * 0.35})`;
        ctx.fill(); ctx.restore();
      }

      /* MOUSE TRAIL */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.5) TRAIL.shift();
      if (TRAIL.length > 1) {
        for (let i = 1; i < TRAIL.length; i++) {
          const age = (t - TRAIL[i].t) / 0.5;
          ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x, TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
          ctx.strokeStyle = `rgba(0,235,255,${(1 - age) * 0.42})`;
          ctx.lineWidth = (1 - age) * 2.2; ctx.stroke();
        }
      }

      /* MOUSE GLOW */
      if (M.x > 0) {
        const rr = 115 + 14 * Math.sin(t * 3.5);
        const mg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, rr);
        mg.addColorStop(0,   `rgba(0,200,255,${0.13 + 0.05 * Math.sin(t * 4)})`);
        mg.addColorStop(0.5, "rgba(0,130,220,0.04)");
        mg.addColorStop(1,   "transparent");
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(M.x, M.y, rr, 0, Math.PI * 2); ctx.fill();

        if (M.click) {
          RIPPLES.push({ x: M.x, y: M.y, r: 4, maxR: 85 + Math.random() * 45, alpha: 0.85, hue: Math.random() > 0.5 ? 192 : 155 });
          FP_RINGS.push({ cx: M.x, cy: M.y, r: 4, maxR: 58 + Math.random() * 28, alpha: 0.7 });
          FP_RINGS.push({ cx: M.x, cy: M.y, r: 4, maxR: 36 + Math.random() * 18, alpha: 0.5 });
        }
      }

      /* RIPPLES */
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i];
        rp.r += 2.8; rp.alpha *= 0.92;
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${rp.hue},100%,65%,0.6)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,70%,${rp.alpha})`;
        ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* FP RINGS */
      for (let i = FP_RINGS.length - 1; i >= 0; i--) {
        const fp = FP_RINGS[i];
        fp.r += 1.6; fp.alpha *= 0.93;
        ctx.beginPath(); ctx.arc(fp.cx, fp.cy, fp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,195,${fp.alpha})`; ctx.lineWidth = 0.75; ctx.stroke();
        if (fp.r >= fp.maxR) FP_RINGS.splice(i, 1);
      }

      /* CORNER HUD */
      const corners2 = [
        { x: 0, y: 0, dx: 1, dy: 1 }, { x: W, y: 0, dx: -1, dy: 1 },
        { x: 0, y: H, dx: 1, dy: -1 }, { x: W, y: H, dx: -1, dy: -1 },
      ];
      corners2.forEach(({ x, y, dx, dy }) => {
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,200,255,0.6)";
        ctx.strokeStyle = "rgba(0,200,255,0.52)"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x + dx * 40, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * 40); ctx.stroke();
        ctx.restore();
      });
      ctx.font = "700 8px 'IBM Plex Mono',monospace";
      ctx.fillStyle = "rgba(0,200,255,0.25)";
      ctx.fillText("BIMS v1.0 // TOP SECRET", 14, 14);
      ctx.fillText(`SYS_T: ${(t % 100).toFixed(2)}`, W - 138, 14);
      ctx.fillText("◈ AUTH: SECURE", 14, H - 8);
      const statuses = ["SCANNING", "ANALYZING", "VERIFIED", "PROCESSING"];
      ctx.fillStyle = `rgba(0,255,160,${0.3 + 0.1 * Math.sin(t * 4)})`;
      ctx.fillText(`◉ ${statuses[Math.floor(t / 2.5) % statuses.length]}`, W - 128, H - 8);

      /* VIGNETTE */
      const vg = ctx.createRadialGradient(W/2, H/2, W * 0.2, W/2, H/2, W * 0.88);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(1,2,10,0.72)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      /* CROSSHAIR */
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const gap = M.click ? 4 : 7, arm = M.click ? 10 : 14, rr = M.click ? 8 : 11;
        ctx.save();
        ctx.shadowBlur = 16; ctx.shadowColor = "rgba(0,240,255,0.95)";
        ctx.strokeStyle = "rgba(0,240,255,0.92)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(MX - gap - arm, MY); ctx.lineTo(MX - gap, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX + gap, MY); ctx.lineTo(MX + gap + arm, MY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY - gap - arm); ctx.lineTo(MX, MY - gap); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(MX, MY + gap); ctx.lineTo(MX, MY + gap + arm); ctx.stroke();
        ctx.beginPath(); ctx.arc(MX, MY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${M.click ? 0.9 : 0.42})`; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(MX, MY, rr + 8, 0, Math.PI * 2);
        ctx.setLineDash([4, 9]); ctx.lineDashOffset = -t * 28;
        ctx.strokeStyle = "rgba(0,200,255,0.18)"; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(MX, MY, M.click ? 1.8 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,255,0.98)"; ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "rgb(2,5,16)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: "none" }} />
    </div>
  );
}
