import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  ═══════════════════════════════════════════════════════════════
  THE WATCHING EYE  ·  eye.jpg
  
  Concept: The eye does NOT tile across the screen.
  It gazes from an iris-shaped aperture at screen centre —
  surrounded by deep void animated with data streams,
  golden circuits, and a living particle field.
  
  The iris BREATHES. The image FOLLOWS your cursor (parallax).
  
  Mouse cursor: a precision optical sensor reticle —
    just 3 elements: a rotating arc, a static diamond, a dot.
    Clean. Professional. Matches the technical eye aesthetic.
  
  Palette extracted from eye.jpg:
    Void:   #000610   deep space black
    Cyan:   hsl(193,100%,52%)  iris blue
    Gold:   hsl(42,100%,52%)   circuit traces
    Teal:   hsl(180,100%,45%)  inner iris
    Ice:    rgba(195,240,255)  bright specular
  ═══════════════════════════════════════════════════════════════
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* ── Mouse with smooth interpolation ── */
    const RAW = { x:-999, y:-999 };
    const M   = { x:-999, y:-999, click:false };
    const onMove  = (e:MouseEvent) => { RAW.x=e.clientX; RAW.y=e.clientY; };
    const onDown  = () => { M.click=true; setTimeout(()=>{M.click=false;},250); };
    const onLeave = () => { RAW.x=-999; RAW.y=-999; };
    window.addEventListener("mousemove",  onMove,  {passive:true});
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    /* ── Image ── */
    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK=true; };
    img.src = BG_IMAGE;

    /* ── Colour helpers ── */
    const CY  = (a:number) => `rgba(0,200,255,${a})`;
    const GO  = (a:number) => `rgba(255,188,24,${a})`;
    const TL  = (a:number) => `rgba(0,255,200,${a})`;
    const IC  = (a:number) => `rgba(195,240,255,${a})`;

    /* ── Types ── */
    type V2 = {x:number;y:number};
    interface Trace  { pts:V2[]; alpha:number; flow:number; spd:number; }
    interface Mote   { x:number;y:number;vx:number;vy:number;r:number;life:number;gold:boolean; }
    interface Ring   { x:number;y:number;r:number;max:number;a:number;gold:boolean; }
    interface Spark  { x:number;y:number;vx:number;vy:number;age:number;life:number;gold:boolean; }
    interface DataStream { x:number;y:number;chars:string[];spd:number;alpha:number; }

    let TRACES:  Trace[]      = [];
    let MOTES:   Mote[]       = [];
    let STREAMS: DataStream[] = [];
    const RINGS: Ring[]       = [];
    const SPARKS:Spark[]      = [];

    /* Iris aperture state */
    let IW=0, IH=0; // current iris size
    let ITW=0,ITH=0; // target
    let offX=0, offY=0; // image pan

    const HEX = "0123456789ABCDEF";
    const rndHex = () => Array(4).fill(0).map(()=>HEX[Math.random()*16|0]).join("");
    const BIO_CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789◆▲●■";

    function init() {
      const W=canvas.width, H=canvas.height;
      const base = Math.min(W,H);
      IW=base*0.46; IH=base*0.30;
      ITW=IW; ITH=IH;

      /* Manhattan circuit traces */
      TRACES = Array.from({length:40}, () => {
        const pts:V2[] = [];
        let cx=Math.random()*W, cy=Math.random()*H;
        pts.push({x:cx,y:cy});
        for(let s=0;s<3+Math.floor(Math.random()*5);s++){
          Math.random()>0.5 ? (cx+=(Math.random()-0.5)*220) : (cy+=(Math.random()-0.5)*170);
          pts.push({x:cx,y:cy});
        }
        return { pts, alpha:0.05+Math.random()*0.12, flow:Math.random(), spd:0.0016+Math.random()*0.003 };
      });

      /* Floating dust motes in the void */
      MOTES = Array.from({length:90}, () => ({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.16, vy:(Math.random()-0.5)*0.13,
        r:0.5+Math.random()*1.4, life:Math.random()*Math.PI*2,
        gold:Math.random()<0.35,
      }));

      /* Falling data streams */
      STREAMS = Array.from({length:22}, () => ({
        x:Math.random()*W, y:-30-Math.random()*H,
        chars:Array.from({length:8+Math.floor(Math.random()*10)},()=>BIO_CH[Math.random()*BIO_CH.length|0]),
        spd:0.6+Math.random()*1.4,
        alpha:0.04+Math.random()*0.10,
      }));
    }

    /* ── Draw helpers ── */
    function drawTrace(tr:Trace) {
      tr.flow=(tr.flow+tr.spd)%1;
      if(tr.pts.length<2) return;

      /* Trace line */
      ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
      for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
      ctx.strokeStyle=GO(tr.alpha); ctx.lineWidth=0.65; ctx.stroke();

      /* Node dots */
      for(const p of tr.pts){
        ctx.beginPath(); ctx.arc(p.x,p.y,1.4,0,Math.PI*2);
        ctx.fillStyle=GO(tr.alpha*1.8); ctx.fill();
      }

      /* Flowing photon */
      const total=tr.pts.slice(1).reduce((acc,p,i)=>acc+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
      let tgt=tr.flow*total, walked=0;
      for(let i=1;i<tr.pts.length;i++){
        const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
        if(walked+seg>=tgt){
          const t2=(tgt-walked)/seg;
          const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
          const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
          ctx.save(); ctx.shadowBlur=10; ctx.shadowColor=GO(1);
          ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2);
          ctx.fillStyle=GO(0.95); ctx.fill();
          ctx.shadowBlur=0; ctx.restore(); break;
        }
        walked+=seg;
      }
    }

    function drawIrisAperture(W:number,H:number,CX:number,CY:number) {
      /* Iris breathes */
      const breath=Math.sin(T*0.52)*0.022;
      const base=Math.min(W,H);
      ITW=base*0.46*(1+breath); ITH=base*0.30*(1+breath*0.8);
      IW+=(ITW-IW)*0.035; IH+=(ITH-IH)*0.035;

      /* Parallax — eye shifts toward cursor */
      if(RAW.x>0){
        offX+=((RAW.x-CX)/W*28-offX)*0.04;
        offY+=((RAW.y-CY)/H*20-offY)*0.04;
      }

      /* Outer glow halo */
      const halo=ctx.createRadialGradient(CX,CY,IW*0.55,CX,CY,IW*1.6);
      halo.addColorStop(0,CY(0.10+0.04*Math.sin(T*0.9)));
      halo.addColorStop(0.5,CY(0.03));
      halo.addColorStop(1,"transparent");
      ctx.fillStyle=halo;
      ctx.beginPath(); ctx.ellipse(CX,CY,IW*1.6,IH*1.6,0,0,Math.PI*2); ctx.fill();

      /* Image clipped to iris ellipse */
      if(imgOK){
        ctx.save();
        ctx.beginPath(); ctx.ellipse(CX,CY,IW,IH,0,0,Math.PI*2); ctx.clip();
        const sc=(IW*2.3)/img.width;
        const iw=img.width*sc, ih=img.height*sc;
        ctx.drawImage(img, CX-iw/2+offX, CY-ih/2+offY, iw, ih);
        /* Inner vignette — darkens edge of iris */
        const vig=ctx.createRadialGradient(CX,CY,IW*0.4,CX,CY,IW);
        vig.addColorStop(0,"transparent");
        vig.addColorStop(0.65,"rgba(0,4,16,0.10)");
        vig.addColorStop(1,"rgba(0,4,16,0.84)");
        ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
        ctx.restore();
      }

      /* Iris border — glowing cyan */
      const bp=0.5+0.5*Math.sin(T*0.72);
      ctx.save();
      ctx.shadowBlur=28+14*bp; ctx.shadowColor=CY(0.85);
      ctx.strokeStyle=CY(0.62+0.28*bp); ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.ellipse(CX,CY,IW,IH,0,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();
      /* Thin inner ring (teal) */
      ctx.beginPath(); ctx.ellipse(CX,CY,IW-6,IH-4,0,0,Math.PI*2);
      ctx.strokeStyle=TL(0.20*bp); ctx.lineWidth=0.7; ctx.stroke();
      /* Thin outer ring */
      ctx.beginPath(); ctx.ellipse(CX,CY,IW+8,IH+5,0,0,Math.PI*2);
      ctx.strokeStyle=CY(0.10*bp); ctx.lineWidth=0.8; ctx.stroke();

      /* Animated iris fibers (60 rotating lines inside aperture) */
      ctx.save();
      ctx.beginPath(); ctx.ellipse(CX,CY,IW*0.97,IH*0.97,0,0,Math.PI*2); ctx.clip();
      const frot=T*0.0012;
      for(let i=0;i<60;i++){
        const ang=(i/60)*Math.PI*2+frot;
        const jit=Math.sin(T*0.4+i*0.8)*0.04;
        const r1=Math.min(IW,IH)*0.34, r2=Math.min(IW,IH)*0.88;
        const x1=CX+Math.cos(ang+jit)*r1, y1=CY+Math.sin(ang+jit)*r1*(IH/IW);
        const x2=CX+Math.cos(ang)*r2,     y2=CY+Math.sin(ang)*r2*(IH/IW);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=`hsla(${i%3===0?42:193},100%,65%,${0.055+0.035*Math.sin(T*0.6+i)})`;
        ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();

      /* 3 expanding pulse rings from iris */
      for(let i=0;i<3;i++){
        const ph=(T*0.38+i*2.1)%(Math.PI*2);
        const pr=IW*(1.05+0.24*(ph/(Math.PI*2)));
        const pa=Math.max(0,0.18*(1-ph/(Math.PI*2)));
        ctx.beginPath(); ctx.ellipse(CX,CY,pr,pr*(IH/IW),0,0,Math.PI*2);
        ctx.strokeStyle=CY(pa); ctx.lineWidth=0.85; ctx.stroke();
      }

      /* Eyelid arcs */
      ctx.beginPath(); ctx.ellipse(CX,CY-IH*0.14,IW*1.06,IH*1.12,0,Math.PI+0.07,Math.PI*2-0.07);
      ctx.strokeStyle=CY(0.055); ctx.lineWidth=0.6; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CX,CY+IH*0.14,IW*1.06,IH*1.12,0,0.07,Math.PI-0.07);
      ctx.strokeStyle=CY(0.055); ctx.lineWidth=0.6; ctx.stroke();
    }

    /* ── Main loop ── */
    function draw() {
      T+=0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W*0.5, CY=H*0.5;

      /* Smooth mouse */
      if(RAW.x>0){
        M.x = M.x<0 ? RAW.x : M.x+(RAW.x-M.x)*0.08;
        M.y = M.y<0 ? RAW.y : M.y+(RAW.y-M.y)*0.08;
      } else { M.x=-999; M.y=-999; }

      /* 1 — Deep void */
      ctx.fillStyle="#000610"; ctx.fillRect(0,0,W,H);

      /* 2 — Ambient radial glow */
      const amb=ctx.createRadialGradient(CX,CY,0,CX,CY,W*0.72);
      amb.addColorStop(0,"rgba(0,18,44,0.60)");
      amb.addColorStop(0.4,"rgba(0,10,28,0.28)");
      amb.addColorStop(1,"transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);
      /* Warm gold corner glow */
      const g2=ctx.createRadialGradient(W*0.82,H*0.18,0,W*0.82,H*0.18,W*0.38);
      g2.addColorStop(0,"rgba(60,40,0,0.20)");
      g2.addColorStop(1,"transparent");
      ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);

      /* 3 — Falling data streams */
      ctx.font="9px 'JetBrains Mono',monospace";
      for(const s of STREAMS){
        s.y+=s.spd;
        if(s.y>H+100){ s.y=-20-Math.random()*200; s.x=Math.random()*W; s.chars=s.chars.map(()=>BIO_CH[Math.random()*BIO_CH.length|0]); }
        if(Math.random()<0.04) s.chars[Math.random()*s.chars.length|0]=BIO_CH[Math.random()*BIO_CH.length|0];
        s.chars.forEach((ch,i)=>{
          const a=s.alpha*(1-i/s.chars.length)*0.85;
          ctx.fillStyle=i===0?GO(Math.min(s.alpha*2.5,0.8)):GO(a);
          ctx.fillText(ch,s.x,s.y+i*11);
        });
      }

      /* 4 — Dust motes */
      for(const mo of MOTES){
        mo.x+=mo.vx; mo.y+=mo.vy; mo.life+=0.007;
        if(mo.x<0)mo.x=W; if(mo.x>W)mo.x=0;
        if(mo.y<0)mo.y=H; if(mo.y>H)mo.y=0;
        const a=0.32+0.32*Math.sin(mo.life);
        ctx.beginPath(); ctx.arc(mo.x,mo.y,mo.r*(0.8+0.4*Math.sin(mo.life)),0,Math.PI*2);
        ctx.fillStyle=mo.gold?GO(a*0.55):CY(a*0.32); ctx.fill();
      }

      /* 5 — Gold circuit traces */
      for(const tr of TRACES) drawTrace(tr);

      /* 6 — Dot grid (very subtle) */
      for(let gx=0;gx<W;gx+=42){
        for(let gy=0;gy<H;gy+=42){
          const hue=42+((gx*0.2+gy*0.15+T*15)%30);
          const a=0.030+0.018*Math.sin(T*0.45+gx*0.04+gy*0.03);
          ctx.beginPath(); ctx.arc(gx,gy,0.7,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,62%,${a})`; ctx.fill();
        }
      }

      /* 7 — THE EYE APERTURE */
      drawIrisAperture(W,H,CX,CY);

      /* 8 — MOUSE: Precision optical sensor reticle
             3 elements only — arc, diamond, dot.
             Arc rotates. Diamond is static. Dot glows.
      */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const inside=Math.hypot((cx-CX)/IW,(cy-CY)/IH)<0.88;
        const baseCol=inside?CY:GO;
        const spd=Math.hypot(
          (RAW.x>0?RAW.x:cx)-cx,
          (RAW.y>0?RAW.y:cy)-cy
        );

        /* ① Rotating arc — outer ring, open */
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*1.8+spd*0.05);
        ctx.beginPath();
        ctx.arc(0,0,28,0,Math.PI*1.5);
        ctx.strokeStyle=baseCol(0.55+0.25*Math.sin(T*2.5));
        ctx.lineWidth=1.4; ctx.stroke();
        /* Small end-caps */
        const capA=Math.PI*1.5+0.08;
        ctx.beginPath(); ctx.arc(Math.cos(capA)*28,Math.sin(capA)*28,2,0,Math.PI*2);
        ctx.fillStyle=baseCol(0.70); ctx.fill();
        ctx.restore();

        /* ② Counter-rotating arc — inner, gap offset */
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*1.2);
        ctx.beginPath();
        ctx.arc(0,0,18,Math.PI*0.3,Math.PI*1.8);
        ctx.strokeStyle=baseCol(0.35+0.20*Math.sin(T*3));
        ctx.lineWidth=0.9; ctx.stroke();
        ctx.restore();

        /* ③ Static diamond */
        const ds=10;
        ctx.save();
        ctx.shadowBlur=6; ctx.shadowColor=baseCol(0.7);
        ctx.strokeStyle=baseCol(0.65); ctx.lineWidth=1.1;
        ctx.beginPath();
        ctx.moveTo(cx,     cy-ds);
        ctx.lineTo(cx+ds*0.65, cy);
        ctx.lineTo(cx,     cy+ds);
        ctx.lineTo(cx-ds*0.65, cy);
        ctx.closePath(); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();

        /* ④ Centre dot */
        ctx.save();
        ctx.shadowBlur=inside?18:12;
        ctx.shadowColor=inside?IC(1):GO(1);
        ctx.beginPath(); ctx.arc(cx,cy,3.2,0,Math.PI*2);
        ctx.fillStyle=inside?IC(0.98):GO(0.96); ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        /* Trail — short fade behind cursor */
        // (no explicit trail needed — the smooth interpolation creates natural lag)
      }

      /* 9 — Click: elegant rings from centre of iris */
      if(M.click&&M.x>0){
        const gold=Math.hypot((M.x-CX)/IW,(M.y-CY)/IH)>0.75;
        for(let i=0;i<4;i++) RINGS.push({x:M.x,y:M.y,r:5,max:70+i*30,a:0.88-i*0.18,gold});
        for(let i=0;i<14;i++){
          const a=Math.random()*Math.PI*2, s=1.5+Math.random()*4;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:30+Math.random()*40,gold});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const rp=RINGS[i]; rp.r+=3.5; rp.a*=0.90;
        if(rp.r>rp.max||rp.a<0.01){RINGS.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=rp.gold?GO(rp.a):CY(rp.a); ctx.lineWidth=1.8; ctx.stroke();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.96; s.vy*=0.96; s.age++;
        if(s.age>=s.life){SPARKS.splice(i,1);continue;}
        const p=s.age/s.life, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.2*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=s.gold?GO(a*0.90):CY(a*0.90); ctx.fill();
      }

      /* 10 — Corner HUD marks */
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([x,y,sx,sy],i)=>{
        const hue=i%2===0?193:42, s=20;
        ctx.strokeStyle=`hsla(${hue},100%,62%,0.26)`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(x+sx*s,y); ctx.lineTo(x,y); ctx.lineTo(x,y+sy*s); ctx.stroke();
        const pa=0.28+0.28*Math.sin(T*1.4+i);
        ctx.save(); ctx.shadowBlur=6; ctx.shadowColor=`hsla(${hue},100%,70%,0.7)`;
        ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,74%,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      /* 11 — Subtle scan line */
      const sY=((T*0.019)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1,0,sY+1);
      sl.addColorStop(0,"transparent"); sl.addColorStop(0.5,CY(0.014)); sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sY-1,W,2);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#000610"; ctx.fillRect(0,0,canvas.width,canvas.height);
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
