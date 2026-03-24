import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  LIVING IRIS — Art direction for best.jpg
  
  The image is NOT shown as a full background.
  Instead it lives INSIDE a breathing iris/pupil mask at the screen centre.
  Outside the iris: deep void with drifting particles and light veins.
  
  Mouse: a different kind of interaction —
    - Your cursor creates a "retinal scan" ripple that reveals more of the image
    - Moving fast leaves glowing eyelash-like streaks
    - Hover near the iris = it dilates toward you (curiosity)
    - Click = a shockwave of light explodes from the pupil
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* ── Mouse ── */
    const M = { x: -999, y: -999, px: -999, py: -999, vx: 0, vy: 0, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.down=true; M.click=true; setTimeout(()=>{M.click=false;},250); };
    const onUp    = () => { M.down=false; };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove",  onMove,  {passive:true});
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", resize);

    /* ── Image ── */
    const img = new Image();
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.src = BG_IMAGE;

    /* ── Types ── */
    interface Dust   { x:number; y:number; vx:number; vy:number; life:number; ml:number; r:number; }
    interface Shock  { x:number; y:number; r:number; maxR:number; a:number; }
    interface Lash   { pts:{x:number;y:number}[]; a:number; hue:number; }
    interface Reveal { x:number; y:number; r:number; maxR:number; a:number; }

    let   DUST:    Dust[]   = [];
    const SHOCKS:  Shock[]  = [];
    const LASHES:  Lash[]   = [];
    const REVEALS: Reveal[] = [];

    /* Iris state */
    let irisR     = 0;     // current iris radius
    let irisTarget= 0;     // target iris radius
    let pupilR    = 0;     // inner pupil (shows image)
    let irisAngle = 0;     // rotation of iris texture

    function init() {
      const W=canvas.width, H=canvas.height;
      const base = Math.min(W,H) * 0.30;
      irisR     = base;
      irisTarget= base;
      pupilR    = base * 0.42;
      DUST = Array.from({length:120}, () => ({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-0.5)*0.18, vy:(Math.random()-0.5)*0.18,
        life: Math.random(), ml: 0.6+Math.random()*0.4, r:0.4+Math.random()*1.2,
      }));
    }

    function spawnLash() {
      if (Math.hypot(M.vx,M.vy) < 3) return;
      const ang = Math.atan2(M.vy, M.vx);
      const pts: {x:number;y:number}[] = [];
      let cx=M.x, cy=M.y;
      for (let i=0;i<20;i++) {
        pts.push({x:cx,y:cy});
        cx += Math.cos(ang+(Math.random()-0.5)*0.5)*9+(Math.random()-0.5)*3;
        cy += Math.sin(ang+(Math.random()-0.5)*0.5)*9+(Math.random()-0.5)*3;
      }
      LASHES.push({pts, a:0.7+Math.random()*0.3, hue:185+Math.random()*30});
    }

    function drawIrisTexture(cx:number, cy:number, r:number) {
      /* Concentric iris rings */
      const rings = 8;
      for (let i=0;i<rings;i++) {
        const rr = r * (0.35 + (i/rings)*0.65);
        const a  = 0.04 + (1-i/rings)*0.06;
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(48,180,215,${a*(0.7+0.3*Math.sin(T*0.8+i))})`; 
        ctx.lineWidth=0.6; ctx.setLineDash([4+i,12+i*2]); ctx.stroke();
      }
      ctx.setLineDash([]);

      /* Radial fibers — like real iris fibers */
      const fibers = 72;
      for (let i=0;i<fibers;i++) {
        const ang = (i/fibers)*Math.PI*2 + irisAngle;
        const len = r*(0.25+Math.random()*0.0); // stable length per fiber
        const jitter = Math.sin(T*0.5+i*0.4)*0.02;
        const x1 = cx + Math.cos(ang+jitter)*r*0.38;
        const y1 = cy + Math.sin(ang+jitter)*r*0.38;
        const x2 = cx + Math.cos(ang)*r*(0.82+Math.sin(T*0.3+i)*0.04);
        const y2 = cy + Math.sin(ang)*r*(0.82+Math.sin(T*0.3+i)*0.04);
        const brightness = 0.5+0.5*Math.sin(i*2.7);
        // Alternate teal and amber fibers
        const col = i%9===0 ? `rgba(200,140,30,${0.12*brightness})` : `rgba(48,190,215,${0.08*brightness})`;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=col; ctx.lineWidth=0.5; ctx.stroke();
      }
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W*0.5, CY=H*0.5;

      /* ── Iris dilation logic ── */
      irisAngle += 0.0018;
      const base = Math.min(W,H)*0.30;
      if (M.x > 0) {
        const d = Math.hypot(M.x-CX, M.y-CY);
        const proximity = Math.max(0, 1 - d/(base*2.2));
        irisTarget = base * (1.0 + proximity*0.25);  // iris dilates as you approach
      } else {
        irisTarget = base;
      }
      // Breathing
      irisTarget += Math.sin(T*0.55)*base*0.022;
      irisR += (irisTarget - irisR) * 0.04;
      pupilR = irisR * 0.42;

      /* ── 1. Deep void background ── */
      ctx.fillStyle = "#020812";
      ctx.fillRect(0,0,W,H);

      /* ── 2. Ambient deep glow from eye centre ── */
      const amb = ctx.createRadialGradient(CX,CY,0,CX,CY,irisR*2.8);
      amb.addColorStop(0, `rgba(20,60,90,${0.45+0.08*Math.sin(T*0.6)})`);
      amb.addColorStop(0.4,`rgba(8,28,48,0.25)`);
      amb.addColorStop(1, "transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      /* ── 3. Scattered dust particles in the void ── */
      for (const d of DUST) {
        d.x+=d.vx; d.y+=d.vy; d.life+=0.003;
        if(d.x<0)d.x=W; if(d.x>W)d.x=0;
        if(d.y<0)d.y=H; if(d.y>H)d.y=0;
        if(d.life>d.ml) d.life=0;
        const a=(d.life<0.1?d.life/0.1:d.life>0.9?(d.ml-d.life)/0.1:1)*0.35;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(48,160,200,${a})`; ctx.fill();
      }

      /* ── 4. Draw image inside iris mask (pupil = window into the eye world) ── */
      if (imgOK) {
        ctx.save();
        // Clip to iris circle
        ctx.beginPath(); ctx.arc(CX,CY,irisR*0.96,0,Math.PI*2); ctx.clip();

        // Scale image to fill the iris
        const scale = (irisR*2.2) / Math.min(img.width, img.height);
        const iw = img.width*scale, ih = img.height*scale;
        const ix = CX - iw/2 + Math.sin(T*0.2)*irisR*0.04; // subtle drift
        const iy = CY - ih/2 + Math.cos(T*0.15)*irisR*0.03;
        ctx.drawImage(img, ix, iy, iw, ih);

        // Dark ring inside iris edge (limbal ring effect)
        const lim = ctx.createRadialGradient(CX,CY,irisR*0.72,CX,CY,irisR*0.97);
        lim.addColorStop(0,"transparent");
        lim.addColorStop(1,"rgba(0,4,14,0.82)");
        ctx.fillStyle=lim; ctx.beginPath(); ctx.arc(CX,CY,irisR,0,Math.PI*2); ctx.fill();

        ctx.restore();
      }

      /* ── 5. Iris texture overlay ── */
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,irisR*0.96,0,Math.PI*2); ctx.clip();
      drawIrisTexture(CX,CY,irisR);
      ctx.restore();

      /* ── 6. Iris border — glowing limbal ring ── */
      const pulse = 0.5+0.5*Math.sin(T*1.1);
      ctx.save();
      ctx.shadowBlur=28+12*pulse; ctx.shadowColor=`rgba(48,185,220,0.7)`;
      ctx.beginPath(); ctx.arc(CX,CY,irisR,0,Math.PI*2);
      ctx.strokeStyle=`rgba(48,190,218,${0.55+0.25*pulse})`; ctx.lineWidth=1.8; ctx.stroke();
      ctx.restore();
      // Outer rim
      ctx.beginPath(); ctx.arc(CX,CY,irisR*1.04,0,Math.PI*2);
      ctx.strokeStyle=`rgba(48,190,218,${0.12+0.06*pulse})`; ctx.lineWidth=3; ctx.stroke();
      // Amber inner ring
      ctx.beginPath(); ctx.arc(CX,CY,irisR*0.44,0,Math.PI*2);
      ctx.strokeStyle=`rgba(200,138,28,${0.45+0.2*pulse})`; ctx.lineWidth=1.2; ctx.stroke();

      /* ── 7. Pupil — pure black void ── */
      const pupil = ctx.createRadialGradient(CX,CY,0,CX,CY,pupilR);
      pupil.addColorStop(0,"rgba(0,0,0,1)");
      pupil.addColorStop(0.7,"rgba(0,2,8,0.95)");
      pupil.addColorStop(1,"transparent");
      ctx.fillStyle=pupil; ctx.beginPath(); ctx.arc(CX,CY,pupilR,0,Math.PI*2); ctx.fill();
      // Pupil specular highlight
      ctx.save();
      ctx.shadowBlur=18; ctx.shadowColor="rgba(200,220,255,0.6)";
      ctx.beginPath(); ctx.arc(CX-pupilR*0.28,CY-pupilR*0.28,pupilR*0.14,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,230,255,${0.4+0.2*Math.sin(T*2)})`; ctx.fill();
      ctx.restore();

      /* ── 8. Rotating scan rings around iris ── */
      [0.88,1.18,1.42].forEach((mult,i) => {
        const r = irisR*mult;
        const a = 0.07-i*0.018;
        ctx.save();ctx.translate(CX,CY);ctx.rotate(T*(i%2===0?0.12:-0.09)*(1+i*0.3));
        ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(48,185,215,${a*(0.6+0.4*Math.sin(T*0.7+i))})`;
        ctx.lineWidth=0.7;ctx.setLineDash([i%2===0?12:6,24+i*8]);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      });

      /* ── 9. Mouse: retinal scan reveal (shows more image under cursor) ── */
      if (M.x > 0) {
        // Soft reveal spotlight where cursor is — like a retinal scanner
        const d2iris = Math.hypot(M.x-CX, M.y-CY);
        if (d2iris < irisR*1.5) {
          ctx.save();
          const sr = 80+30*Math.sin(T*3);
          const sg = ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,sr);
          sg.addColorStop(0,`rgba(120,210,240,${0.12+0.05*Math.sin(T*4)})`);
          sg.addColorStop(0.5,`rgba(60,160,200,0.04)`);
          sg.addColorStop(1,"transparent");
          ctx.fillStyle=sg;ctx.beginPath();ctx.arc(M.x,M.y,sr,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }

        // Cursor crosshair — minimal, technical
        const ca = 0.35+0.15*Math.sin(T*2.5);
        ctx.strokeStyle=`rgba(48,195,220,${ca})`; ctx.lineWidth=0.6;
        const gap=8, len=18;
        ctx.beginPath();ctx.moveTo(M.x-len-gap,M.y);ctx.lineTo(M.x-gap,M.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(M.x+gap,M.y);ctx.lineTo(M.x+len+gap,M.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(M.x,M.y-len-gap);ctx.lineTo(M.x,M.y-gap);ctx.stroke();
        ctx.beginPath();ctx.moveTo(M.x,M.y+gap);ctx.lineTo(M.x,M.y+len+gap);ctx.stroke();

        // Dot at cursor centre
        ctx.save();ctx.shadowBlur=10;ctx.shadowColor="rgba(200,140,30,0.9)";
        ctx.beginPath();ctx.arc(M.x,M.y,2.2,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,158,40,${0.75+0.25*Math.sin(T*5)})`;ctx.fill();ctx.restore();
      }

      /* ── 10. Eyelash-like streaks from fast movement ── */
      spawnLash();
      for(let i=LASHES.length-1;i>=0;i--) {
        const l=LASHES[i]; l.a*=0.84;
        if(l.a<0.015){LASHES.splice(i,1);continue;}
        ctx.beginPath();ctx.moveTo(l.pts[0].x,l.pts[0].y);
        for(let j=1;j<l.pts.length;j++)ctx.lineTo(l.pts[j].x,l.pts[j].y);
        ctx.strokeStyle=`hsla(${l.hue},80%,62%,${l.a*0.45})`;ctx.lineWidth=0.85;ctx.stroke();
      }

      /* ── 11. Reveal ripples from cursor proximity ── */
      if(M.x>0) {
        const d=Math.hypot(M.x-CX,M.y-CY);
        if(d<irisR*1.8 && Math.random()<0.04) {
          REVEALS.push({x:CX,y:CY,r:irisR*0.3,maxR:irisR*1.1,a:0.25});
        }
      }
      for(let i=REVEALS.length-1;i>=0;i--) {
        const rv=REVEALS[i]; rv.r+=2.5; rv.a*=0.94;
        if(rv.r>rv.maxR||rv.a<0.02){REVEALS.splice(i,1);continue;}
        ctx.beginPath();ctx.arc(rv.x,rv.y,rv.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(48,195,220,${rv.a})`; ctx.lineWidth=0.7; ctx.stroke();
      }

      /* ── 12. Click: shockwave from pupil ── */
      if(M.click) {
        for(let i=0;i<4;i++) {
          SHOCKS.push({x:CX,y:CY,r:pupilR,maxR:irisR*(1.8+i*0.5),a:0.9-i*0.15});
        }
      }
      for(let i=SHOCKS.length-1;i>=0;i--) {
        const sh=SHOCKS[i]; sh.r+=6+i; sh.a*=0.88;
        if(sh.r>sh.maxR||sh.a<0.01){SHOCKS.splice(i,1);continue;}
        const gradient=sh.r<irisR*0.9;
        ctx.save();ctx.shadowBlur=12;ctx.shadowColor=`rgba(200,140,30,0.8)`;
        ctx.beginPath();ctx.arc(sh.x,sh.y,sh.r,0,Math.PI*2);
        ctx.strokeStyle=gradient?`rgba(200,158,40,${sh.a})`:`rgba(48,195,220,${sh.a})`;
        ctx.lineWidth=2-sh.a;ctx.stroke();ctx.restore();
      }

      /* ── 13. Vignette — deep darkness at screen edges ── */
      const vg=ctx.createRadialGradient(CX,CY,irisR*0.8,CX,CY,Math.max(W,H)*0.9);
      vg.addColorStop(0,"transparent");
      vg.addColorStop(0.5,"rgba(0,2,8,0.3)");
      vg.addColorStop(1,"rgba(0,1,6,0.88)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      /* ── 14. Scan line (very subtle) ── */
      const sY=((T*0.022)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1.5,0,sY+1.5);
      sl.addColorStop(0,"transparent");sl.addColorStop(0.5,`rgba(48,190,215,0.015)`);sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sY-1.5,W,3);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#020812"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave",onLeave);
    };
  }, []);

  return (
    <div style={{position:"fixed",inset:0,zIndex:0}} aria-hidden>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
