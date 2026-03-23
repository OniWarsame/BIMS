import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, t = 0;

    const M = { x: -999, y: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onTouch = (e: TouchEvent) => { M.x = e.touches[0].clientX; M.y = e.touches[0].clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 200); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseleave", onLeave);

    /* Background image */
    const img = new Image();
    img.src = "/hex_bg.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    /* Types */
    interface Ripple { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface Spark  { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; hue:number; }
    interface HexNode { col:number; row:number; lit:number; pulse:number; pulseSpd:number; }
    interface DataPkt { hcol:number; hrow:number; prog:number; spd:number; }

    const RIPPLES: Ripple[] = [];
    const SPARKS:  Spark[]  = [];
    const TRAIL:   { x:number; y:number; t:number }[] = [];

    /* Hex grid state */
    const HEX_SIZE = 52;
    let HEX_NODES: HexNode[] = [];
    let DATA_PKTS: DataPkt[] = [];

    function buildHexNodes(W: number, H: number) {
      HEX_NODES = [];
      const cols = Math.ceil(W / (HEX_SIZE * 1.73)) + 3;
      const rows = Math.ceil(H / (HEX_SIZE * 1.5)) + 3;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          HEX_NODES.push({
            col: c, row: r,
            lit: Math.random() * 0.3,
            pulse: Math.random() * Math.PI * 2,
            pulseSpd: 0.008 + Math.random() * 0.018,
          });
        }
      }
      DATA_PKTS = Array.from({ length: 6 }, () => ({
        hcol: Math.floor(Math.random() * Math.ceil(W / (HEX_SIZE * 1.73))),
        hrow: Math.floor(Math.random() * Math.ceil(H / (HEX_SIZE * 1.5))),
        prog: Math.random(),
        spd: 0.003 + Math.random() * 0.005,
      }));
    }

    function hexCenter(col: number, row: number, W: number, _H: number): [number, number] {
      const x = col * HEX_SIZE * 1.732 + (row % 2 === 0 ? 0 : HEX_SIZE * 0.866);
      const y = row * HEX_SIZE * 1.5;
      return [x, y];
    }

    function drawHex(cx: number, cy: number, s: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + s * Math.cos(a), cy + s * Math.sin(a))
                : ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a));
      }
      ctx.closePath();
    }

    function spawnSparks(x: number, y: number, n = 10) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const s = 1 + Math.random() * 3;
        SPARKS.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
          life: 0, maxLife: 40 + Math.random() * 40, hue: 210 + Math.random() * 20 });
      }
    }

    buildHexNodes(canvas.width, canvas.height);

    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1. Image background */
      if (imgLoaded) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "rgb(2,6,18)"; ctx.fillRect(0, 0, W, H);
      }

      /* 2. Strong dark overlay so UI is readable */
      ctx.fillStyle = "rgba(1,5,18,0.72)"; ctx.fillRect(0, 0, W, H);

      /* 3. Mouse proximity glow on hex cells */
      HEX_NODES.forEach(nd => {
        nd.pulse += nd.pulseSpd;
        const [cx, cy] = hexCenter(nd.col, nd.row, W, H);
        const md = M.x > 0 ? Math.hypot(cx - M.x, cy - M.y) : 9999;
        const prx = Math.max(0, 1 - md / 200);
        nd.lit = Math.max(0, Math.min(1, nd.lit + prx * 0.12 - 0.006));
        const pulse = 0.4 + 0.6 * Math.sin(nd.pulse);
        const glow = nd.lit * pulse;

        if (glow > 0.02) {
          /* Hex fill glow */
          drawHex(cx, cy, HEX_SIZE - 2);
          ctx.fillStyle = `rgba(30,120,255,${glow * 0.12})`;
          ctx.fill();

          /* Hex border */
          drawHex(cx, cy, HEX_SIZE - 2);
          ctx.strokeStyle = `rgba(60,160,255,${0.15 + glow * 0.55})`;
          ctx.lineWidth = 0.8 + glow * 1.2;
          ctx.stroke();

          /* Center dot on lit cells */
          if (glow > 0.35) {
            ctx.save();
            ctx.shadowBlur = 12; ctx.shadowColor = `rgba(80,160,255,${glow})`;
            ctx.beginPath(); ctx.arc(cx, cy, 2.5 * glow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120,200,255,${glow * 0.9})`; ctx.fill();
            ctx.restore();
          }
        }
      });

      /* 4. Data packets travelling along grid */
      DATA_PKTS.forEach(pk => {
        pk.prog += pk.spd;
        if (pk.prog > 1) {
          pk.prog = 0;
          pk.hcol = Math.floor(Math.random() * Math.ceil(W / (HEX_SIZE * 1.73)));
          pk.hrow = Math.floor(Math.random() * Math.ceil(H / (HEX_SIZE * 1.5)));
        }
        const targetCol = pk.hcol + Math.floor(Math.sin(t * 0.8 + pk.hrow) * 3);
        const targetRow = pk.hrow + 1;
        const [x1, y1] = hexCenter(pk.hcol, pk.hrow, W, H);
        const [x2, y2] = hexCenter(targetCol, targetRow, W, H);
        const px = x1 + (x2 - x1) * pk.prog;
        const py = y1 + (y2 - y1) * pk.prog;
        ctx.save();
        ctx.shadowBlur = 14; ctx.shadowColor = "rgba(80,180,255,0.9)";
        ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,210,255,${0.8 + 0.2 * Math.sin(t * 8 + pk.hcol)})`; ctx.fill();
        ctx.restore();
        /* Tail */
        const tailLen = 0.25;
        const tx = px - (x2 - x1) * tailLen * 0.4;
        const ty = py - (y2 - y1) * tailLen * 0.4;
        const tailGrad = ctx.createLinearGradient(tx, ty, px, py);
        tailGrad.addColorStop(0, "rgba(80,160,255,0)");
        tailGrad.addColorStop(1, "rgba(120,200,255,0.5)");
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py);
        ctx.strokeStyle = tailGrad; ctx.lineWidth = 2; ctx.stroke();
      });

      /* 5. Mouse aura */
      if (M.x > 0) {
        const r = 160 + 18 * Math.sin(t * 3);
        const aura = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r);
        aura.addColorStop(0,   `rgba(40,120,255,${0.16 + 0.06 * Math.sin(t * 4)})`);
        aura.addColorStop(0.5, "rgba(20,80,200,0.05)");
        aura.addColorStop(1,   "transparent");
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(M.x, M.y, r, 0, Math.PI * 2); ctx.fill();
        if (M.down) spawnSparks(M.x + (Math.random()-0.5)*20, M.y + (Math.random()-0.5)*20, 2);
      }

      /* 6. Trail */
      if (M.x > 0) TRAIL.push({ x: M.x, y: M.y, t });
      while (TRAIL.length > 0 && t - TRAIL[0].t > 0.5) TRAIL.shift();
      for (let i = 1; i < TRAIL.length; i++) {
        const age = (t - TRAIL[i].t) / 0.5;
        ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x, TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x, TRAIL[i].y);
        ctx.strokeStyle = `rgba(80,160,255,${(1-age)*0.45})`; ctx.lineWidth = (1-age)*2.5; ctx.stroke();
      }

      /* 7. Sparks */
      for (let i = SPARKS.length - 1; i >= 0; i--) {
        const sp = SPARKS[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vx *= 0.94; sp.vy *= 0.94;
        sp.life++;
        if (sp.life >= sp.maxLife) { SPARKS.splice(i, 1); continue; }
        const prog = sp.life / sp.maxLife;
        const a = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8;
        ctx.save(); ctx.shadowBlur = 6; ctx.shadowColor = `hsl(${sp.hue},100%,70%,0.8)`;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 2 * (1 - prog), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${sp.hue},100%,72%,${Math.max(0, a)})`; ctx.fill(); ctx.restore();
      }

      /* 8. Click ripples */
      if (M.click && M.x > 0) {
        RIPPLES.push({ x: M.x, y: M.y, r: 3, maxR: 120, a: 0.85, hue: 210 });
        RIPPLES.push({ x: M.x, y: M.y, r: 3, maxR:  70, a: 0.65, hue: 230 });
        spawnSparks(M.x, M.y, 14);
      }
      for (let i = RIPPLES.length - 1; i >= 0; i--) {
        const rp = RIPPLES[i]; rp.r += 3.2; rp.a *= 0.91;
        ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${rp.hue},100%,65%,0.7)`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue},100%,70%,${rp.a})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        if (rp.r >= rp.maxR) RIPPLES.splice(i, 1);
      }

      /* 9. Vignette */
      const vg = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.85);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(1,3,14,0.85)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      /* 10. Crosshair */
      if (M.x > 0) {
        const MX = M.x, MY = M.y;
        const s = M.click ? 0.85 : 1;
        const ARM = 16*s, GAP = 6*s, RR = 10*s;
        ctx.save();
        ctx.shadowBlur = 16; ctx.shadowColor = "rgba(80,180,255,0.95)";
        ctx.strokeStyle = "rgba(100,190,255,0.9)"; ctx.lineWidth = 1.3;
        [[MX-GAP-ARM,MY,MX-GAP,MY],[MX+GAP,MY,MX+GAP+ARM,MY],
         [MX,MY-GAP-ARM,MX,MY-GAP],[MX,MY+GAP,MX,MY+GAP+ARM]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(MX,MY,RR,0,Math.PI*2);
        ctx.strokeStyle=`rgba(100,190,255,${M.click?0.85:0.4})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.setLineDash([3,9]); ctx.lineDashOffset=-(t*25%100);
        ctx.beginPath(); ctx.arc(MX,MY,RR+9,0,Math.PI*2);
        ctx.strokeStyle="rgba(80,160,255,0.2)"; ctx.lineWidth=0.65; ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur=20;
        ctx.beginPath(); ctx.arc(MX,MY,M.click?1.6:2.2,0,Math.PI*2);
        ctx.fillStyle="rgba(140,210,255,0.98)"; ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle="rgb(2,6,18)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
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
