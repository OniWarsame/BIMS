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
    const M = { x: -1, y: -1, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => { M.click = false; }, 220); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -1; M.y = -1; };
    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Background image ── */
    const img = new Image();
    img.src   = "/hex_bg.jpg";
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.onerror = () => { imgOK = false; };

    /* ── Particles ── */
    interface Dot { x:number; y:number; vx:number; vy:number; r:number; a:number; life:number; ml:number; }
    interface Ring { x:number; y:number; r:number; maxR:number; a:number; }

    // Floating network nodes
    const N = 48;
    const nx  = Array.from({length:N}, () => Math.random());
    const ny  = Array.from({length:N}, () => Math.random());
    const nvx = Array.from({length:N}, () => (Math.random()-0.5)*0.00025);
    const nvy = Array.from({length:N}, () => (Math.random()-0.5)*0.00025);
    const nr  = Array.from({length:N}, (_,i) => i<7 ? 3.5+Math.random()*2 : 1.2+Math.random()*2);

    const DOTS:  Dot[]  = [];
    const RINGS: Ring[] = [];
    const TRAIL: {x:number;y:number;t:number}[] = [];

    function spawnDots(x:number, y:number, n=10) {
      for (let i=0;i<n;i++) {
        const a = Math.random()*Math.PI*2;
        const s = 1+Math.random()*3;
        DOTS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.5+Math.random()*2,a:0.85,life:0,ml:40+Math.random()*40});
      }
    }

    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      /* 1 — Background */
      if (imgOK) {
        const iAR = img.width/img.height, cAR = W/H;
        let iw:number, ih:number, ix:number, iy:number;
        if (cAR > iAR) { iw=W; ih=W/iAR; ix=0; iy=(H-ih)/2; }
        else            { ih=H; iw=H*iAR; ix=(W-iw)/2; iy=0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        // Fallback: rich hex-blue gradient so page is never pure black
        const g = ctx.createLinearGradient(0,0,W,H);
        g.addColorStop(0,"hsl(218,55%,8%)");
        g.addColorStop(0.5,"hsl(225,60%,5%)");
        g.addColorStop(1,"hsl(215,65%,7%)");
        ctx.fillStyle = g;
        ctx.fillRect(0,0,W,H);
      }

      /* 2 — Subtle dark overlay — keep image visible */
      ctx.fillStyle = "rgba(3,8,22,0.52)";
      ctx.fillRect(0,0,W,H);

      /* 3 — Floating network nodes + edges */
      for (let i=0;i<N;i++) {
        nx[i] += nvx[i]; ny[i] += nvy[i];
        if (nx[i]<0) nx[i]=1; if (nx[i]>1) nx[i]=0;
        if (ny[i]<0) ny[i]=1; if (ny[i]>1) ny[i]=0;
      }
      // Edges between close nodes
      for (let i=0;i<N;i++) {
        for (let j=i+1;j<N;j++) {
          const dx=(nx[i]-nx[j])*W, dy=(ny[i]-ny[j])*H;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(nx[i]*W, ny[i]*H);
            ctx.lineTo(nx[j]*W, ny[j]*H);
            ctx.strokeStyle = `rgba(60,150,255,${(1-d/140)*0.13})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }
      // Node dots
      const pulse = Math.sin(t*1.4)*0.4+0.6;
      for (let i=0;i<N;i++) {
        const x=nx[i]*W, y=ny[i]*H, r=nr[i];
        ctx.beginPath();
        ctx.arc(x,y,r*(0.9+0.2*pulse),0,Math.PI*2);
        ctx.fillStyle = `rgba(80,175,255,${(i<7?0.75:0.35)*pulse})`;
        ctx.fill();
        if (i<7) {
          ctx.beginPath();
          ctx.arc(x,y,r*2.2,0,Math.PI*2);
          ctx.strokeStyle = `rgba(80,175,255,${0.18*pulse})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      /* 4 — Mouse proximity aura — soft blue radial */
      if (M.x >= 0) {
        const R = 160;
        const mg = ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R);
        mg.addColorStop(0, `rgba(50,140,255,${0.12+0.04*Math.sin(t*3)})`);
        mg.addColorStop(0.5, "rgba(30,100,200,0.04)");
        mg.addColorStop(1, "transparent");
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(M.x,M.y,R,0,Math.PI*2);
        ctx.fill();

        // Nodes near cursor get pulled slightly
        for (let i=0;i<N;i++) {
          const dx=(nx[i]*W-M.x), dy=(ny[i]*H-M.y);
          const d=Math.sqrt(dx*dx+dy*dy);
          if (d<200 && d>1) {
            nvx[i] += (dx/d)*0.00004;
            nvy[i] += (dy/d)*0.00004;
          }
        }
      }

      /* 5 — Mouse trail — thin fading line */
      if (M.x >= 0) TRAIL.push({x:M.x,y:M.y,t});
      while (TRAIL.length>0 && t-TRAIL[0].t>0.4) TRAIL.shift();
      if (TRAIL.length>1) {
        for (let i=1;i<TRAIL.length;i++) {
          const age = (t-TRAIL[i].t)/0.4;
          ctx.beginPath();
          ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y);
          ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
          ctx.strokeStyle = `rgba(80,170,255,${(1-age)*0.38})`;
          ctx.lineWidth = (1-age)*1.8;
          ctx.stroke();
        }
      }

      /* 6 — Click sparks + rings */
      if (M.click && M.x>=0) {
        RINGS.push({x:M.x,y:M.y,r:4,maxR:90,a:0.8});
        RINGS.push({x:M.x,y:M.y,r:4,maxR:52,a:0.55});
        spawnDots(M.x,M.y,12);
      }
      for (let i=RINGS.length-1;i>=0;i--) {
        const rp=RINGS[i]; rp.r+=3; rp.a*=0.91;
        ctx.beginPath();
        ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle = `rgba(80,175,255,${rp.a})`;
        ctx.lineWidth=1.4;
        ctx.stroke();
        if (rp.r>=rp.maxR) RINGS.splice(i,1);
      }
      for (let i=DOTS.length-1;i>=0;i--) {
        const d=DOTS[i];
        d.x+=d.vx; d.y+=d.vy; d.vx*=0.96; d.vy*=0.96; d.life++;
        if (d.life>=d.ml){DOTS.splice(i,1);continue;}
        const p=d.life/d.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath();
        ctx.arc(d.x,d.y,d.r*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=`rgba(100,190,255,${Math.max(0,a)*0.8})`;
        ctx.fill();
      }

      /* 7 — Slow horizontal scan line */
      const slY = ((t*0.042)%1)*H;
      const slG = ctx.createLinearGradient(0,slY-2,0,slY+2);
      slG.addColorStop(0,"transparent");
      slG.addColorStop(0.5,`rgba(80,175,255,0.04)`);
      slG.addColorStop(1,"transparent");
      ctx.fillStyle=slG; ctx.fillRect(0,slY-2,W,4);

      /* 8 — Subtle vignette to deepen edges */
      const vg = ctx.createRadialGradient(W/2,H/2,W*0.25,W/2,H/2,W*0.85);
      vg.addColorStop(0,"transparent");
      vg.addColorStop(1,"rgba(2,6,18,0.75)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      raf = requestAnimationFrame(draw);
    }

    // Start with fallback colour so canvas is never blank
    ctx.fillStyle = "hsl(220,60%,6%)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave",onLeave);
    };
  }, []);

  // NO cursor:none — canvas has no style override, OS cursor stays visible
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
