import { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number, W = 0, H = 0, frame = 0;

    const mouse = { x: -9999, y: -9999 };
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onClick = (e: MouseEvent) => spawnBurst(e.clientX, e.clientY);

    /* ── Palette: dark graphite + copper/bronze gold ── */
    const GOLD  = (a=1) => `hsla(38,75%,52%,${a})`;
    const GOLDB = (a=1) => `hsla(42,90%,68%,${a})`;
    const GOLDD = (a=1) => `hsla(32,65%,32%,${a})`;
    const BG    = (a=1) => `hsla(0,0%,6%,${a})`;
    const STL   = (a=1) => `hsla(20,5%,12%,${a})`;
    const WH    = (a=1) => `hsla(38,80%,92%,${a})`;

    type Burst = { x:number;y:number;vx:number;vy:number;r:number;life:number;maxLife:number };
    type HexCell = { cx:number;cy:number;size:number;distort:number;pulse:number;pspd:number;hotAlpha:number };

    let bursts: Burst[] = [];
    let cells:  HexCell[] = [];

    const rnd = (a:number,b:number) => a+Math.random()*(b-a);

    /* ── Hex geometry helpers ── */
    const hexCorners = (cx:number, cy:number, size:number): [number,number][] => {
      const pts:[number,number][] = [];
      for(let i=0;i<6;i++){
        const a = Math.PI/180*(60*i-30);
        pts.push([cx+size*Math.cos(a), cy+size*Math.sin(a)]);
      }
      return pts;
    };

    /* ── Build hex grid ── */
    const init = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      bursts = []; cells = [];

      /* Two-level hex grid matching image:
         Outer large hexes (the big structural ones) */
      const BIG  = Math.min(W,H) * 0.115;   // large hex size
      const SMALL= BIG * 0.245;             // inner micro hex size

      const bw = BIG * Math.sqrt(3);
      const bh = BIG * 1.5;

      for(let row = -1; row < H/bh + 2; row++){
        for(let col = -1; col < W/bw + 2; col++){
          const offset = (col % 2 === 0) ? 0 : BIG * 0.75;
          const cx = col * bw * 0.865 + BIG * 0.5;
          const cy = row * bh + offset + BIG;

          /* Sphere distortion: cells near centre appear larger/closer */
          const dx = cx - W/2, dy = cy - H/2;
          const dist = Math.hypot(dx,dy) / Math.max(W,H);
          const distort = 1 - dist * 0.45;  // centre bigger, edges smaller

          cells.push({
            cx, cy,
            size: BIG * distort,
            distort,
            pulse: rnd(0,Math.PI*2),
            pspd:  rnd(0.004, 0.012),
            hotAlpha: 0,
          });
        }
      }
    };

    const spawnBurst = (x:number,y:number) => {
      for(let i=0;i<55;i++){
        const a=Math.random()*Math.PI*2, spd=rnd(2,9), lf=rnd(35,65);
        bursts.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:rnd(1.5,4),life:lf,maxLife:lf});
      }
    };

    /* ── Draw single hex cell with inner micro pattern ── */
    const drawHex = (cx:number,cy:number,outerSize:number,innerGlow:number,mouseDist:number) => {
      const corners = hexCorners(cx,cy,outerSize);

      /* Outer hex fill — dark steel with sphere depth shading */
      ctx.beginPath();
      corners.forEach(([x,y],i)=> i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath();

      /* Radial depth gradient per cell */
      const dx=cx-W/2, dy=cy-H/2;
      const edgeFactor = Math.hypot(dx,dy)/Math.max(W,H);
      const brightness = Math.max(6, 14 - edgeFactor*12);
      ctx.fillStyle = `hsl(20,4%,${brightness}%)`;
      ctx.fill();

      /* Gold border stroke — thicker near centre */
      const strokeW = Math.max(0.6, outerSize/22);
      ctx.strokeStyle = GOLD(0.55 + innerGlow*0.3 + (1-edgeFactor)*0.15);
      ctx.lineWidth   = strokeW;
      ctx.shadowColor = GOLD(0.4 + innerGlow*0.4);
      ctx.shadowBlur  = 4 + innerGlow*12;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      /* Mouse hot glow overlay */
      if(mouseDist < 1){
        ctx.beginPath();
        corners.forEach(([x,y],i)=> i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
        ctx.closePath();
        ctx.fillStyle = GOLDB(mouseDist * 0.18);
        ctx.fill();
        ctx.strokeStyle = GOLDB(mouseDist * 0.8);
        ctx.lineWidth   = strokeW*1.8;
        ctx.shadowColor = GOLDB(0.6);
        ctx.shadowBlur  = 18*mouseDist;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      /* Inner micro-hex pattern (the tiny hexes inside each big hex) */
      const microSize = outerSize * 0.24;
      const mw = microSize * Math.sqrt(3);
      const mh = microSize * 1.5;
      const gridW = outerSize * 1.8, gridH = outerSize * 1.8;
      const startX = cx - gridW/2, startY = cy - gridH/2;

      ctx.save();
      // Clip to outer hex
      ctx.beginPath();
      corners.forEach(([x,y],i)=> i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath();
      ctx.clip();

      for(let mr=-1; mr<gridH/mh+2; mr++){
        for(let mc=-1; mc<gridW/mw+2; mc++){
          const mOff = (mc%2===0)?0:microSize*0.75;
          const mcx  = startX + mc*mw*0.865;
          const mcy  = startY + mr*mh + mOff;
          const mCorners = hexCorners(mcx,mcy,microSize*0.88);
          ctx.beginPath();
          mCorners.forEach(([x,y],i)=> i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
          ctx.closePath();
          ctx.fillStyle = STL(0.9);
          ctx.fill();
          ctx.strokeStyle = GOLDD(0.35 + innerGlow*0.15 + mouseDist*0.15);
          ctx.lineWidth   = 0.45;
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    /* ── MAIN DRAW ── */
    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0,0,W,H);

      /* Black base */
      ctx.fillStyle = BG(1);
      ctx.fillRect(0,0,W,H);

      /* Global radial vignette (edges dark, matches image) */
      const vig = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.72);
      vig.addColorStop(0,   "hsla(0,0%,0%,0)");
      vig.addColorStop(0.55,"hsla(0,0%,0%,0.15)");
      vig.addColorStop(1,   "hsla(0,0%,0%,0.88)");

      /* Mouse proximity glow */
      if(mouse.x>0){
        const mg = ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,260);
        mg.addColorStop(0, GOLDB(0.12));
        mg.addColorStop(1, GOLDB(0));
        ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
      }

      /* ── Draw all hex cells ── */
      cells.forEach(cell => {
        cell.pulse += cell.pspd;
        const glow = 0.3 + 0.7*Math.sin(cell.pulse)*Math.sin(cell.pulse);

        /* Mouse distance for this cell */
        const mdx = cell.cx - mouse.x, mdy = cell.cy - mouse.y;
        const md  = Math.hypot(mdx,mdy);
        const mHot= Math.max(0, 1 - md/(cell.size*5.5));

        drawHex(cell.cx, cell.cy, cell.size, glow*0.25, mHot);
      });

      /* Vignette on top */
      ctx.fillStyle = vig;
      ctx.fillRect(0,0,W,H);

      /* ── BURST PARTICLES ── */
      bursts=bursts.filter(b=>{
        b.life--; if(b.life<=0) return false;
        b.vx*=0.91; b.vy*=0.91; b.x+=b.vx; b.y+=b.vy;
        const t=b.life/b.maxLife;
        const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*2.5);
        g.addColorStop(0,GOLDB(t)); g.addColorStop(1,GOLDB(0));
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r*2.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        return true;
      });

      /* ── HUD corners ── */
      const bo=14, bsz=26;
      ctx.lineWidth=1.5;
      [[bo,bo,1,1],[W-bo,bo,-1,1],[bo,H-bo,1,-1],[W-bo,H-bo,-1,-1]].forEach(([x,y,sx,sy])=>{
        ctx.beginPath();
        ctx.moveTo(x,y+sy*bsz); ctx.lineTo(x,y); ctx.lineTo(x+sx*bsz,y);
        ctx.strokeStyle=GOLD(0.45); ctx.stroke();
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
        ctx.fillStyle=GOLDB(0.6); ctx.fill();
      });

      /* ── Bottom bar ── */
      ctx.fillStyle="hsla(20,5%,5%,0.65)";
      ctx.fillRect(0,H-24,W,24);
      ctx.beginPath(); ctx.moveTo(0,H-24); ctx.lineTo(W,H-24);
      ctx.strokeStyle=GOLD(0.3); ctx.lineWidth=1; ctx.stroke();
      ctx.font="bold 9px 'IBM Plex Mono',monospace";
      ctx.fillStyle=GOLD(0.55);
      ctx.fillText("BIMS v3.0  ·  BIOMETRIC IDENTITY MANAGEMENT SYSTEM  ·  AES-256  ·  SECURE  ·  ONLINE", bo+4, H-8);
      ctx.fillStyle=GOLDB(0.65);
      ctx.fillText("© 2026 KUMI", W-bo-82, H-8);
    };

    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click",      onClick);
    window.addEventListener("resize",     init);
    init(); draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click",      onClick);
      window.removeEventListener("resize",     init);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none"
      style={{ display:"block", width:"100vw", height:"100vh", background:"hsl(0,0%,5%)" }} />
  );
}
