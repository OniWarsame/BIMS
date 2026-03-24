import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  THE WATCHING EYE — v3 — Rich Animated Art
  
  Palette: deep void #000408, cyan iris hsl(193,100%), gold circuits hsl(42,100%)
  
  Animations added:
  1. Breathing iris aperture (reveals eye.jpg)
  2. Eye follows mouse cursor with parallax
  3. Golden circuit traces with flowing photons
  4. Animated iris fiber lines rotating slowly
  5. Pulsing concentric glow rings around iris
  6. Floating dust motes in the void
  7. Diagonal light streaks (like the image's light rays)
  8. Mouse: single glowing point, colour shifts inside/outside iris
  9. Click: concentric shockwaves
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
    const SM = { x:-999, y:-999 };
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

    const CY  = (a:number) => `rgba(0,210,255,${a})`;
    const GO  = (a:number) => `rgba(255,190,30,${a})`;
    const IC  = (a:number) => `rgba(200,240,255,${a})`;
    const TL  = (a:number) => `rgba(0,255,200,${a})`;

    interface GoldTrace { pts:{x:number;y:number}[]; alpha:number; flow:number; speed:number; }
    interface DustMote  { x:number; y:number; vx:number; vy:number; r:number; life:number; }
    interface LightRay  { x:number; y:number; angle:number; length:number; speed:number; alpha:number; hue:number; }
    interface ClickRing { x:number; y:number; r:number; max:number; a:number; gold:boolean; }
    interface ClickSpark{ x:number;y:number;vx:number;vy:number;life:number;ml:number;gold:boolean; }
    interface Crumb     { x:number; y:number; t:number; }

    let TRACES:    GoldTrace[]  = [];
    let DUST:      DustMote[]   = [];
    let RAYS:      LightRay[]   = [];
    const RINGS:   ClickRing[]  = [];
    const SPARKS:  ClickSpark[] = [];
    const CRUMBS:  Crumb[]      = [];

    let irisW=0, irisH=0, irisTargW=0, irisTargH=0;
    let eyeOffX=0, eyeOffY=0;
    let irisRot=0;

    function init() {
      const W=canvas.width, H=canvas.height;
      irisW=W*0.46; irisH=H*0.30;
      irisTargW=irisW; irisTargH=irisH;

      // Golden circuit traces — Manhattan paths
      TRACES = Array.from({length:36}, () => {
        const pts:{x:number;y:number}[]=[];
        let cx=Math.random()*W, cy=Math.random()*H;
        pts.push({x:cx,y:cy});
        for(let s=0;s<4+Math.floor(Math.random()*5);s++){
          if(Math.random()>0.5) cx+=(Math.random()-0.5)*200;
          else cy+=(Math.random()-0.5)*160;
          pts.push({x:cx,y:cy});
        }
        return { pts, alpha:0.05+Math.random()*0.13, flow:Math.random(), speed:0.0018+Math.random()*0.0028 };
      });

      // Floating dust motes
      DUST = Array.from({length:80}, () => ({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.18, vy:(Math.random()-0.5)*0.14,
        r:0.4+Math.random()*1.2, life:Math.random()*Math.PI*2,
      }));

      // Diagonal light rays
      RAYS = Array.from({length:6}, (_,i) => ({
        x:Math.random(), y:0,
        angle:0.3+Math.random()*0.5,
        length:0.25+Math.random()*0.35,
        speed:0.00022+i*0.00008,
        alpha:0.06+Math.random()*0.10,
        hue:42+i*8,
      }));
    }

    function draw() {
      T+=0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W*0.50, CY=H*0.50;

      // Smooth mouse
      if(M.tx>0){
        SM.x=SM.x<0?M.tx:SM.x+(M.tx-SM.x)*0.06;
        SM.y=SM.y<0?M.ty:SM.y+(M.ty-SM.y)*0.06;
        M.x=SM.x; M.y=SM.y;
      } else { M.x=-999; M.y=-999; }

      /* ─── 1. Deep void ─── */
      ctx.fillStyle="#000408"; ctx.fillRect(0,0,W,H);

      /* ─── 2. Layered ambient glow (deep, rich) ─── */
      const a1=ctx.createRadialGradient(CX,CY,0,CX,CY,W*0.7);
      a1.addColorStop(0,"rgba(0,22,50,0.60)");
      a1.addColorStop(0.45,"rgba(0,12,30,0.30)");
      a1.addColorStop(1,"transparent");
      ctx.fillStyle=a1; ctx.fillRect(0,0,W,H);
      // Secondary warm gold glow offset
      const a2=ctx.createRadialGradient(CX*1.3,CY*0.7,0,CX*1.3,CY*0.7,W*0.35);
      a2.addColorStop(0,"rgba(60,40,0,0.18)");
      a2.addColorStop(1,"transparent");
      ctx.fillStyle=a2; ctx.fillRect(0,0,W,H);

      /* ─── 3. Floating dust motes ─── */
      for(const d of DUST){
        d.x+=d.vx; d.y+=d.vy; d.life+=0.008;
        if(d.x<0)d.x=W; if(d.x>W)d.x=0;
        if(d.y<0)d.y=H; if(d.y>H)d.y=0;
        const a=(0.35+0.35*Math.sin(d.life));
        // Mix gold and cyan motes
        const gold=Math.floor(d.life*3)%5===0;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r*(0.8+0.4*Math.sin(d.life)),0,Math.PI*2);
        ctx.fillStyle=gold?GO(a*0.55):CY(a*0.35); ctx.fill();
      }

      /* ─── 4. Diagonal light rays ─── */
      for(const ray of RAYS){
        ray.x=(ray.x+ray.speed)%1.4-0.2;
        const x1=ray.x*W, y1=0;
        const x2=x1+Math.cos(ray.angle)*ray.length*W;
        const y2=y1+Math.sin(ray.angle)*ray.length*H*2;
        const grad=ctx.createLinearGradient(x1,y1,x2,y2);
        grad.addColorStop(0,"transparent");
        grad.addColorStop(0.3,`hsla(${ray.hue},100%,65%,${ray.alpha*0.6})`);
        grad.addColorStop(0.6,`hsla(${ray.hue},100%,75%,${ray.alpha})`);
        grad.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=grad; ctx.lineWidth=1.8; ctx.stroke();
        // Bright head dot
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=`hsla(${ray.hue},100%,80%,1)`;
        ctx.beginPath(); ctx.arc(x2*0.65+x1*0.35,y2*0.65+y1*0.35,1.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${ray.hue},100%,90%,${ray.alpha*1.5})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      }

      /* ─── 5. Golden circuit traces with photons ─── */
      for(const tr of TRACES){
        tr.flow=(tr.flow+tr.speed)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=GO(tr.alpha); ctx.lineWidth=0.65; ctx.stroke();
        // Gold node dots
        for(const pt of tr.pts){
          ctx.beginPath(); ctx.arc(pt.x,pt.y,1.4,0,Math.PI*2);
          ctx.fillStyle=GO(tr.alpha*1.8); ctx.fill();
        }
        // Flowing photon
        const total=tr.pts.slice(1).reduce((acc,p,i)=>acc+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let target=tr.flow*total,walked=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(walked+seg>=target){
            const t2=(target-walked)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=10; ctx.shadowColor=GO(1);
            ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2);
            ctx.fillStyle=GO(0.96); ctx.fill(); ctx.shadowBlur=0; ctx.restore(); break;
          }
          walked+=seg;
        }
      }

      /* ─── 6. Iris aperture — image revealed inside ─── */
      const breath=Math.sin(T*0.52)*0.022;
      irisTargW=W*0.46*(1+breath); irisTargH=H*0.30*(1+breath*0.8);
      irisW+=(irisTargW-irisW)*0.035; irisH+=(irisTargH-irisH)*0.035;
      irisRot+=0.0014;
      if(M.tx>0){
        eyeOffX+=(((M.tx-CX)/(W*0.5))*W*0.028-eyeOffX)*0.04;
        eyeOffY+=(((M.ty-CY)/(H*0.5))*H*0.020-eyeOffY)*0.04;
      }

      if(imgOK){
        ctx.save();
        ctx.beginPath(); ctx.ellipse(CX,CY,irisW,irisH,0,0,Math.PI*2); ctx.clip();
        const scale=(irisW*2.25)/img.width;
        const iw=img.width*scale, ih=img.height*scale;
        ctx.drawImage(img, CX-iw/2+eyeOffX, CY-ih/2+eyeOffY, iw, ih);
        // Inner vignette
        const vig=ctx.createRadialGradient(CX,CY,irisW*0.42,CX,CY,irisW);
        vig.addColorStop(0,"transparent"); vig.addColorStop(0.6,"rgba(0,4,12,0.10)"); vig.addColorStop(1,"rgba(0,4,12,0.82)");
        ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
        ctx.restore();
      }

      /* ─── 7. Animated iris fiber lines ─── */
      ctx.save();
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW*0.97,irisH*0.97,0,0,Math.PI*2); ctx.clip();
      const fibers=60;
      for(let i=0;i<fibers;i++){
        const ang=(i/fibers)*Math.PI*2+irisRot;
        const jit=Math.sin(T*0.4+i*0.7)*0.04;
        const r1=Math.min(irisW,irisH)*0.35, r2=Math.min(irisW,irisH)*0.88;
        const x1=CX+Math.cos(ang+jit)*r1, y1=CY+Math.sin(ang+jit)*r1*(irisH/irisW);
        const x2=CX+Math.cos(ang)*r2,      y2=CY+Math.sin(ang)*r2*(irisH/irisW);
        const hue=i%3===0?42:193;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=`hsla(${hue},100%,65%,${0.06+0.04*Math.sin(T*0.6+i)})`; ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();

      /* ─── 8. Iris border — pulsing glow ─── */
      const bp=0.5+0.5*Math.sin(T*0.75);
      ctx.save();
      ctx.shadowBlur=30+12*bp; ctx.shadowColor=CY(0.8);
      ctx.strokeStyle=CY(0.60+0.28*bp); ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW,irisH,0,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();
      // Thin outer
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW+7,irisH+5,0,0,Math.PI*2);
      ctx.strokeStyle=CY(0.10*bp); ctx.lineWidth=0.8; ctx.stroke();
      // Thin inner teal
      ctx.beginPath(); ctx.ellipse(CX,CY,irisW-6,irisH-4,0,0,Math.PI*2);
      ctx.strokeStyle=TL(0.18*bp); ctx.lineWidth=0.7; ctx.stroke();

      /* ─── 9. Concentric pulse rings expanding from iris ─── */
      for(let i=0;i<3;i++){
        const phase=(T*0.4+i*2.1)%(Math.PI*2);
        const r=irisW*(1.08+0.22*((phase%(Math.PI*2))/(Math.PI*2)));
        const a=Math.max(0, 0.18*(1-((phase%(Math.PI*2))/(Math.PI*2))));
        ctx.beginPath(); ctx.ellipse(CX,CY,r,r*(irisH/irisW),0,0,Math.PI*2);
        ctx.strokeStyle=CY(a); ctx.lineWidth=0.9; ctx.stroke();
      }

      /* ─── 10. Eyelid geometry ─── */
      ctx.beginPath(); ctx.ellipse(CX,CY-irisH*0.14,irisW*1.06,irisH*1.12,0,Math.PI+0.06,Math.PI*2-0.06);
      ctx.strokeStyle=CY(0.055); ctx.lineWidth=0.6; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CX,CY+irisH*0.14,irisW*1.06,irisH*1.12,0,0.06,Math.PI-0.06);
      ctx.strokeStyle=CY(0.055); ctx.lineWidth=0.6; ctx.stroke();

      /* ─── 11. MOUSE: Single point of light, context-aware ─── */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const inside=Math.hypot((cx-CX)/irisW,(cy-CY)/irisH)<0.85;
        const col=inside?CY:GO;
        // Bloom
        const R=58;
        const bloom=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
        bloom.addColorStop(0,inside?CY(0.16):GO(0.13));
        bloom.addColorStop(0.4,inside?CY(0.04):GO(0.03));
        bloom.addColorStop(1,"transparent");
        ctx.fillStyle=bloom; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
        // Outer thin ring
        ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2);
        ctx.strokeStyle=col(0.18); ctx.lineWidth=0.8; ctx.stroke();
        // Point
        ctx.save(); ctx.shadowBlur=16; ctx.shadowColor=col(1);
        ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2);
        ctx.fillStyle=inside?IC(0.98):GO(0.96); ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
        // Minimal tick marks
        const arm=11, gap=6;
        ctx.strokeStyle=col(0.42); ctx.lineWidth=0.9;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          ctx.beginPath();
          ctx.moveTo(cx+dx*gap,cy+dy*gap); ctx.lineTo(cx+dx*(gap+arm),cy+dy*(gap+arm));
          ctx.stroke();
        });
        // Trail
        CRUMBS.push({x:cx,y:cy,t:T});
        while(CRUMBS.length&&T-CRUMBS[0].t>0.38)CRUMBS.shift();
        for(let i=1;i<CRUMBS.length;i++){
          const age=(T-CRUMBS[i].t)/0.38;
          ctx.beginPath(); ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y); ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
          ctx.strokeStyle=inside?CY((1-age)*0.28):GO((1-age)*0.30);
          ctx.lineWidth=(1-age)*1.6; ctx.stroke();
        }
      }

      /* ─── 12. Click rings + sparks ─── */
      if(M.click&&M.x>0){
        const gold=Math.hypot((M.x-CX)/irisW,(M.y-CY)/irisH)>0.65;
        for(let i=0;i<4;i++) RINGS.push({x:M.x,y:M.y,r:4,max:60+i*32,a:0.9-i*0.18,gold});
        for(let i=0;i<14;i++){
          const a=Math.random()*Math.PI*2, s=1.5+Math.random()*4;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:30+Math.random()*40,gold});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const rp=RINGS[i]; rp.r+=3.2; rp.a*=0.91;
        if(rp.r>rp.max||rp.a<0.01){RINGS.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=rp.gold?GO(rp.a):CY(rp.a); ctx.lineWidth=1.6; ctx.stroke();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.96; s.vy*=0.96; s.life++;
        if(s.life>=s.ml){SPARKS.splice(i,1);continue;}
        const p=s.life/s.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2*(1-p*0.4),0,Math.PI*2);
        ctx.fillStyle=s.gold?GO(a*0.88):CY(a*0.88); ctx.fill();
      }

      /* ─── 13. Corner HUD marks ─── */
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([x,y,sx,sy],i)=>{
        const hue=i%2===0?193:42;
        ctx.strokeStyle=`hsla(${hue},100%,65%,0.24)`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(x+sx*18,y); ctx.lineTo(x,y); ctx.lineTo(x,y+sy*18); ctx.stroke();
        const pa=0.30+0.30*Math.sin(T*1.4+i);
        ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,70%,${pa})`; ctx.fill();
      });

      /* ─── 14. Scan line ─── */
      const sY=((T*0.018)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1,0,sY+1);
      sl.addColorStop(0,"transparent"); sl.addColorStop(0.5,CY(0.014)); sl.addColorStop(1,"transparent");
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
