import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  ═══════════════════════════════════════════════════════
  THE WATCHING EYE — eye.jpg
  
  Concept: The digital eye watches from the background.
  It is NOT shown as a flat image. Instead:
  
  1. A large oval aperture at screen centre reveals the eye
     through a MASK — the iris of the UI IS the eye's iris.
     
  2. Outside the aperture: pure deep-void with golden data
     circuits — matching the golden circuit lines in the image.
     
  3. The aperture BREATHES — it pulses slowly like a living eye.
  
  4. When you move the mouse NEAR the aperture, the eye seems
     to look AT you — the image subtly shifts toward the cursor.
  
  5. Mouse: a single glowing POINT of light — like a spotlight
     the eye follows. Clean, minimal, professional.
     No crosshairs. No rings. Just light.
  ═══════════════════════════════════════════════════════
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    const M  = { x:-999, y:-999, tx:-999, ty:-999, click:false };
    const SM = { x:-999, y:-999 }; // smoothed mouse
    const onMove  = (e:MouseEvent) => { M.tx=e.clientX; M.ty=e.clientY; };
    const onDown  = () => { M.click=true; setTimeout(()=>{ M.click=false; },240); };
    const onLeave = () => { M.tx=-999; M.ty=-999; };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK=true; };
    img.src = BG_IMAGE;

    /* ── Palette from eye.jpg ──
       Void black:  #000408
       Deep blue:   hsl(215,90%,8%)
       Iris cyan:   hsl(193,100%,55%)
       Iris teal:   hsl(180,100%,45%)
       Gold:        hsl(42,100%,55%)   — the golden circuits
       Ice:         rgba(190,235,255)
    */
    const CY = (a:number) => `rgba(0,210,255,${a})`;
    const GO = (a:number) => `rgba(255,190,30,${a})`;
    const IC = (a:number) => `rgba(190,235,255,${a})`;
    const TL = (a:number) => `rgba(0,255,200,${a})`;

    /* ── Types ── */
    interface GoldTrace { pts:{x:number;y:number}[]; alpha:number; flow:number; speed:number; }
    interface Spark     { x:number;y:number;vx:number;vy:number;life:number;ml:number;gold:boolean; }
    interface Ring      { x:number;y:number;r:number;max:number;a:number;gold:boolean; }
    interface Crumb     { x:number;y:number;t:number; }

    let TRACES: GoldTrace[] = [];
    const SPARKS: Spark[] = [];
    const RINGS:  Ring[]  = [];
    const CRUMBS: Crumb[] = [];

    /* Iris aperture state */
    let irisW = 0, irisH = 0;          // current aperture size
    let irisTargW = 0, irisTargH = 0;  // target aperture size
    let eyeOffX = 0, eyeOffY = 0;      // image pan offset (follows mouse)

    function init() {
      const W=canvas.width, H=canvas.height;
      irisW = W*0.48; irisH = H*0.30;
      irisTargW = irisW; irisTargH = irisH;

      /* Golden circuit traces — horizontal + vertical like image */
      TRACES = [];
      for (let i=0; i<32; i++) {
        const pts: {x:number;y:number}[] = [];
        let cx = Math.random()*W, cy = Math.random()*H;
        pts.push({x:cx,y:cy});
        const steps = 3+Math.floor(Math.random()*5);
        for (let s=0; s<steps; s++) {
          if (Math.random()>0.5) cx += (Math.random()-0.5)*180;
          else cy += (Math.random()-0.5)*140;
          pts.push({x:cx,y:cy});
        }
        TRACES.push({
          pts,
          alpha: 0.06 + Math.random()*0.14,
          flow: Math.random(),
          speed: 0.002+Math.random()*0.003,
        });
      }
    }

    function drawEyeAperture(W:number, H:number, CX:number, CY:number) {
      if (!imgOK) return;

      /* Smooth iris breathing */
      const breath = Math.sin(T*0.55)*0.02;
      irisTargW = W*0.48*(1+breath);
      irisTargH = H*0.32*(1+breath*0.8);
      irisW += (irisTargW-irisW)*0.04;
      irisH += (irisTargH-irisH)*0.04;

      /* Eye parallax — image pans slightly toward cursor */
      if (M.tx>0) {
        const dx=(M.tx-CX)/(W*0.5), dy=(M.ty-CY)/(H*0.5);
        eyeOffX += (dx*W*0.025-eyeOffX)*0.04;
        eyeOffY += (dy*H*0.018-eyeOffY)*0.04;
      }

      /* ── 1. Outer glow halo around aperture ── */
      const haloGrad = ctx.createRadialGradient(CX,CY,irisW*0.6,CX,CY,irisW*1.4);
      haloGrad.addColorStop(0, CY(0.08+0.04*Math.sin(T*0.8)));
      haloGrad.addColorStop(0.5, CY(0.03));
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle=haloGrad;
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW*1.4,irisH*1.4,0,0,Math.PI*2); ctx.fill();

      /* ── 2. Draw image inside aperture ── */
      ctx.save();
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW,irisH,0,0,Math.PI*2); ctx.clip();

      const scale = (irisW*2.2)/img.width;
      const iw = img.width*scale, ih = img.height*scale;
      const ix = CX-iw/2+eyeOffX, iy = CY-ih/2+eyeOffY;
      ctx.drawImage(img, ix, iy, iw, ih);

      /* Subtle inner vignette — darkens aperture edges */
      const vig = ctx.createRadialGradient(CX,CY,irisW*0.45,CX,CY,irisW);
      vig.addColorStop(0,"transparent");
      vig.addColorStop(0.65,"rgba(0,4,12,0.12)");
      vig.addColorStop(1,"rgba(0,4,12,0.78)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

      ctx.restore();

      /* ── 3. Aperture border — glowing iris edge ── */
      const borderPulse = 0.55+0.45*Math.sin(T*0.7);
      ctx.save();
      ctx.shadowBlur = 28; ctx.shadowColor = CY(0.85);
      ctx.strokeStyle = CY(0.65+0.25*borderPulse);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW,irisH,0,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      /* Thin outer iris ring */
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW+6,irisH+4,0,0,Math.PI*2);
      ctx.strokeStyle=CY(0.12*borderPulse); ctx.lineWidth=0.8; ctx.stroke();

      /* Thin inner teal ring */
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW-5,irisH-3,0,0,Math.PI*2);
      ctx.strokeStyle=TL(0.18*borderPulse); ctx.lineWidth=0.7; ctx.stroke();

      /* ── 4. Four eyelid geometry lines ── */
      // Top eyelid arc
      ctx.beginPath(); ctx.ellipse(CX,CY-irisH*0.15,irisW*1.05,irisH*1.1,0,Math.PI+0.08,Math.PI*2-0.08);
      ctx.strokeStyle=CY(0.06); ctx.lineWidth=0.6; ctx.stroke();
      // Bottom eyelid arc
      ctx.beginPath(); ctx.ellipse(CX,CY+irisH*0.15,irisW*1.05,irisH*1.1,0,0.08,Math.PI-0.08);
      ctx.strokeStyle=CY(0.06); ctx.lineWidth=0.6; ctx.stroke();
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W*0.50, CY=H*0.50;

      /* Smooth mouse */
      if (M.tx>0) {
        SM.x = SM.x<0 ? M.tx : SM.x+(M.tx-SM.x)*0.08;
        SM.y = SM.y<0 ? M.ty : SM.y+(M.ty-SM.y)*0.08;
        M.x=SM.x; M.y=SM.y;
      } else { M.x=-999; M.y=-999; }

      /* ── 1. Deep void ── */
      ctx.fillStyle="#000408"; ctx.fillRect(0,0,W,H);

      /* ── 2. Subtle deep-blue ambient ── */
      const amb=ctx.createRadialGradient(CX,CY,0,CX,CY,W*0.65);
      amb.addColorStop(0,"rgba(0,18,40,0.55)");
      amb.addColorStop(0.5,"rgba(0,10,25,0.25)");
      amb.addColorStop(1,"transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      /* ── 3. Golden circuit traces ── */
      for (const tr of TRACES) {
        tr.flow=(tr.flow+tr.speed)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=GO(tr.alpha); ctx.lineWidth=0.65; ctx.stroke();

        // Small gold node at each corner
        for(const pt of tr.pts){
          ctx.beginPath(); ctx.arc(pt.x,pt.y,1.5,0,Math.PI*2);
          ctx.fillStyle=GO(tr.alpha*1.8); ctx.fill();
        }

        // Flowing photon — gold
        const total=tr.pts.slice(1).reduce((acc,p,i)=>acc+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let target=tr.flow*total,walked=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(walked+seg>=target){
            const t2=(target-walked)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save();
            ctx.shadowBlur=8; ctx.shadowColor=GO(1);
            ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
            ctx.fillStyle=GO(0.95); ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          }
          walked+=seg;
        }
      }

      /* ── 4. Tiny gold dot grid — very sparse, void texture ── */
      for(let gx=0;gx<W;gx+=44){
        for(let gy=0;gy<H;gy+=44){
          const a=0.025+0.015*Math.sin(T*0.4+gx*0.03+gy*0.025);
          ctx.beginPath(); ctx.arc(gx,gy,0.65,0,Math.PI*2);
          ctx.fillStyle=`hsla(42,100%,60%,${a})`; ctx.fill();
        }
      }

      /* ── 5. The Eye Aperture ── */
      drawEyeAperture(W,H,CX,CY);

      /* ── 6. MOUSE: A single glowing point of light ── */
      if (M.x>0) {
        const cx=M.x, cy=M.y;
        const distToEye = Math.hypot(cx-CX,cy-CY);
        const insideEye = distToEye < Math.max(irisW,irisH)*0.85;

        // ── Outer soft glow — shifts colour inside/outside eye ──
        const lightCol = insideEye ? CY : GO;
        const R=60;
        const lightGrad=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
        lightGrad.addColorStop(0, insideEye ? CY(0.18) : GO(0.14));
        lightGrad.addColorStop(0.4, insideEye ? CY(0.05) : GO(0.04));
        lightGrad.addColorStop(1,"transparent");
        ctx.fillStyle=lightGrad; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();

        // ── The point itself — very bright, very small ──
        ctx.save();
        ctx.shadowBlur = insideEye ? 18 : 14;
        ctx.shadowColor = insideEye ? CY(1) : GO(1);
        ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2);
        ctx.fillStyle = insideEye ? IC(0.98) : GO(0.95);
        ctx.fill(); ctx.shadowBlur=0; ctx.restore();

        // ── Tiny cross-hair tick marks (very minimal) ──
        const tick=10, gap=6;
        ctx.strokeStyle = insideEye ? IC(0.45) : GO(0.50);
        ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(cx,cy-gap);ctx.lineTo(cx,cy-gap-tick);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx,cy+gap);ctx.lineTo(cx,cy+gap+tick);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-gap,cy);ctx.lineTo(cx-gap-tick,cy);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+gap,cy);ctx.lineTo(cx+gap+tick,cy);ctx.stroke();

        // ── Trail — warm gold outside, cool ice inside ──
        CRUMBS.push({x:cx,y:cy,t:T});
        while(CRUMBS.length&&T-CRUMBS[0].t>0.4)CRUMBS.shift();
        for(let i=1;i<CRUMBS.length;i++){
          const age=(T-CRUMBS[i].t)/0.4;
          ctx.beginPath();ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y);ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
          ctx.strokeStyle = insideEye ? IC((1-age)*0.30) : GO((1-age)*0.32);
          ctx.lineWidth=(1-age)*1.6; ctx.stroke();
        }
      }

      /* ── 7. Click: concentric rings from click point ── */
      if (M.click && M.x>0) {
        const gold = Math.hypot(M.x-CX,M.y-CY) > irisW*0.6;
        for(let i=0;i<3;i++)
          RINGS.push({x:M.x,y:M.y,r:4,max:65+i*28,a:0.9-i*0.2,gold});
        for(let i=0;i<12;i++){
          const a=Math.random()*Math.PI*2, s=1.5+Math.random()*3.5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:30+Math.random()*40,gold});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=3.2; r.a*=0.91;
        if(r.r>r.max||r.a<0.01){RINGS.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.strokeStyle = r.gold ? GO(r.a) : CY(r.a);
        ctx.lineWidth=1.6; ctx.stroke();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.96; s.vy*=0.96; s.life++;
        if(s.life>=s.ml){SPARKS.splice(i,1);continue;}
        const p=s.life/s.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2*(1-p*0.4),0,Math.PI*2);
        ctx.fillStyle = s.gold ? GO(a*0.88) : CY(a*0.88); ctx.fill();
      }

      /* ── 8. Corner frame marks — minimal gold ── */
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([x,y,sx,sy])=>{
        ctx.strokeStyle=GO(0.22); ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(x+sx*18,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*18);ctx.stroke();
      });

      /* ── 9. Single scan line ── */
      const sY=((T*0.020)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1,0,sY+1);
      sl.addColorStop(0,"transparent"); sl.addColorStop(0.5,CY(0.015)); sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sY-1,W,2);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#000408"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:0}} aria-hidden>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
