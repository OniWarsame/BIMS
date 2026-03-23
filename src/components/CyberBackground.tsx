import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* ── Mouse ── */
    const M = { x:-999, y:-999, px:-999, py:-999, vx:0, vy:0, click:false };
    const onMove  = (e:MouseEvent)=>{ M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = ()=>{ M.click=true; setTimeout(()=>{M.click=false;},200); };
    const onLeave = ()=>{ M.x=-999; M.y=-999; };
    window.addEventListener("mousemove",  onMove,  {passive:true});
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseleave", onLeave);
    const resize = ()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; initOrbs(); };
    window.addEventListener("resize", resize);

    /* ── Load embedded image (base64 — works on ALL platforms) ── */
    const img = new Image();
    let imgOK = false;
    img.onload  = ()=>{ imgOK=true; };
    img.onerror = ()=>{ imgOK=false; };
    img.src = BG_IMAGE;   // ← base64 data URL, no server required

    /* ── Types ── */
    interface Orb    { x:number;y:number;vx:number;vy:number;r:number;base:number;teal:boolean; }
    interface Ripple { x:number;y:number;r:number;max:number;a:number;w:number;teal:boolean; }
    interface Ember  { x:number;y:number;vx:number;vy:number;age:number;life:number;teal:boolean; }
    interface Vein   { pts:{x:number;y:number}[];a:number;teal:boolean; }
    interface Crumb  { x:number;y:number;t:number; }

    let   ORBS:   Orb[]    = [];
    const RIPPLES:Ripple[] = [];
    const EMBERS: Ember[]  = [];
    const VEINS:  Vein[]   = [];
    const CRUMBS: Crumb[]  = [];

    function initOrbs(){
      const W=canvas.width,H=canvas.height;
      ORBS=Array.from({length:60},(_,i)=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22,
        r:0, base:i<9?2.6+Math.random()*2:0.8+Math.random()*1.6,
        teal:i%7!==0,
      }));
      ORBS.forEach(o=>{o.r=o.base;});
    }

    function growVein(){
      if(M.x<0||Math.hypot(M.vx,M.vy)<1.8) return;
      const ang=Math.atan2(M.vy,M.vx);
      const pts:{x:number;y:number}[]=[];
      let cx=M.x,cy=M.y;
      for(let i=0;i<26;i++){
        pts.push({x:cx,y:cy});
        const c=(Math.random()-0.5)*0.65;
        cx+=Math.cos(ang+c)*10+(Math.random()-0.5)*4;
        cy+=Math.sin(ang+c)*10+(Math.random()-0.5)*4;
      }
      VEINS.push({pts,a:0.65+Math.random()*0.35,teal:Math.random()>0.4});
    }

    function burst(x:number,y:number){
      for(let i=0;i<22;i++){
        const a=Math.random()*Math.PI*2,s=1.6+Math.random()*4.8;
        EMBERS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:40+Math.random()*48,teal:Math.random()>0.42});
      }
    }

    /* Palette — matches the blue electric iris image */
    const TEAL  = (a:number)=>`rgba(40,185,255,${a})`;   // vivid electric blue
    const AMBER = (a:number)=>`rgba(255,140,40,${a})`;   // warm orange core glow
    const C     = (t:boolean,a:number)=>t?TEAL(a):AMBER(a);

    function draw(){
      T+=0.016;
      const W=canvas.width,H=canvas.height;

      /* 1 — Draw image FULL QUALITY, no overlay */
      if(imgOK){
        const iAR=img.width/img.height,cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
      } else {
        ctx.fillStyle="#000818";ctx.fillRect(0,0,W,H);
      }

      /* 2 — Barely-there edge vignette only — centre is pure image */
      const vg=ctx.createRadialGradient(W*.5,H*.5,W*.15,W*.5,H*.5,W*.85);
      vg.addColorStop(0,"transparent");
      vg.addColorStop(0.7,"rgba(0,4,18,0.05)");
      vg.addColorStop(1,"rgba(0,2,12,0.35)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

      /* 3 — Orbs */
      for(const o of ORBS){
        o.x+=o.vx;o.y+=o.vy;
        if(o.x<0)o.x=W;if(o.x>W)o.x=0;
        if(o.y<0)o.y=H;if(o.y>H)o.y=0;
        if(M.x>0){
          const dx=M.x-o.x,dy=M.y-o.y,d=Math.hypot(dx,dy);
          if(d<240&&d>0.5){
            const f=0.02*(1-d/240);o.vx+=dx/d*f;o.vy+=dy/d*f;
            o.r=o.base*(1+0.9*(1-d/240));
          } else {o.r+=(o.base-o.r)*0.08;}
        } else {o.r+=(o.base-o.r)*0.04;}
        const s=Math.hypot(o.vx,o.vy);
        if(s>0.95){o.vx*=0.95/s;o.vy*=0.95/s;}
        o.vx*=0.993;o.vy*=0.993;
      }
      for(let i=0;i<ORBS.length;i++){
        for(let j=i+1;j<ORBS.length;j++){
          const dx=ORBS[i].x-ORBS[j].x,dy=ORBS[i].y-ORBS[j].y,d=Math.hypot(dx,dy);
          if(d>145)continue;
          ctx.beginPath();ctx.moveTo(ORBS[i].x,ORBS[i].y);ctx.lineTo(ORBS[j].x,ORBS[j].y);
          ctx.strokeStyle=C(ORBS[i].teal&&ORBS[j].teal,(1-d/145)*0.10);
          ctx.lineWidth=0.5;ctx.stroke();
        }
      }
      const pulse=0.48+0.52*Math.sin(T*1.35);
      for(const o of ORBS){
        const a=o.base>2?0.78*pulse:0.42*pulse;
        if(o.base>2){
          ctx.save();ctx.shadowBlur=15;ctx.shadowColor=C(o.teal,0.75);
          ctx.beginPath();ctx.arc(o.x,o.y,o.r*(0.9+0.15*pulse),0,Math.PI*2);
          ctx.fillStyle=C(o.teal,a);ctx.fill();ctx.restore();
          ctx.beginPath();ctx.arc(o.x,o.y,o.r*2.6,0,Math.PI*2);
          ctx.strokeStyle=C(o.teal,0.10*pulse);ctx.lineWidth=0.65;ctx.stroke();
        } else {
          ctx.beginPath();ctx.arc(o.x,o.y,o.r*(0.85+0.2*pulse),0,Math.PI*2);
          ctx.fillStyle=C(o.teal,a);ctx.fill();
        }
      }

      /* 4 — Iris rings from eye centre */
      const EX=W*0.5,EY=H*0.5;
      [[W*0.065,0.12],[W*0.11,0.075],[W*0.165,0.045],[W*0.23,0.025]].forEach(([r,alpha],i)=>{
        const br=(r as number)+W*0.006*Math.sin(T*0.62+i);
        ctx.save();ctx.shadowBlur=10;ctx.shadowColor=TEAL(0.35);
        ctx.beginPath();ctx.arc(EX,EY,br,0,Math.PI*2);
        ctx.strokeStyle=TEAL((alpha as number)*(0.72+0.28*Math.sin(T*0.75+i)));
        ctx.lineWidth=0.8;ctx.setLineDash([7,22]);ctx.stroke();
        ctx.setLineDash([]);ctx.restore();
      });
      /* Orange/amber inner rings matching the iris core */
      [[W*0.048,0.10],[W*0.082,0.06]].forEach(([r,alpha],i)=>{
        const br=(r as number)+W*0.004*Math.sin(T*0.9+i+1.5);
        ctx.beginPath();ctx.arc(EX,EY,br,0,Math.PI*2);
        ctx.strokeStyle=AMBER((alpha as number)*(0.7+0.3*Math.sin(T*1.1+i)));
        ctx.lineWidth=0.65;ctx.setLineDash([4,16]);ctx.stroke();ctx.setLineDash([]);
      });

      /* 5 — Mouse interactive layer */
      if(M.x>0){
        /* Outer blue bloom */
        const R1=200+22*Math.sin(T*2.1);
        const g1=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R1);
        g1.addColorStop(0,TEAL(0.13+0.05*Math.sin(T*3.4)));
        g1.addColorStop(0.4,"rgba(0,100,200,0.03)");
        g1.addColorStop(1,"transparent");
        ctx.fillStyle=g1;ctx.beginPath();ctx.arc(M.x,M.y,R1,0,Math.PI*2);ctx.fill();

        /* Inner orange ember core */
        const R2=40+6*Math.sin(T*6.2);
        const g2=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R2);
        g2.addColorStop(0,AMBER(0.28+0.11*Math.sin(T*5.2)));
        g2.addColorStop(0.55,"rgba(200,80,0,0.04)");
        g2.addColorStop(1,"transparent");
        ctx.fillStyle=g2;ctx.beginPath();ctx.arc(M.x,M.y,R2,0,Math.PI*2);ctx.fill();

        /* Rotating blue iris ring */
        ctx.save();ctx.translate(M.x,M.y);ctx.rotate(T*1.75);
        ctx.beginPath();ctx.arc(0,0,32+4*Math.sin(T*4),0,Math.PI*2);
        ctx.strokeStyle=TEAL(0.55+0.22*Math.sin(T*2.7));
        ctx.lineWidth=1.15;ctx.setLineDash([6,14]);ctx.stroke();ctx.setLineDash([]);ctx.restore();

        /* Counter-rotating orange ring */
        ctx.save();ctx.translate(M.x,M.y);ctx.rotate(-T*2.6);
        ctx.beginPath();ctx.arc(0,0,21+2.5*Math.sin(T*7),0,Math.PI*2);
        ctx.strokeStyle=AMBER(0.46+0.18*Math.sin(T*3.8));
        ctx.lineWidth=0.9;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);ctx.restore();

        /* Slow outer blue ring */
        ctx.save();ctx.translate(M.x,M.y);ctx.rotate(T*0.5);
        ctx.beginPath();ctx.arc(0,0,55+5*Math.sin(T*1.8),0,Math.PI*2);
        ctx.strokeStyle=TEAL(0.18+0.08*Math.sin(T*2));
        ctx.lineWidth=0.65;ctx.setLineDash([2,30]);ctx.stroke();ctx.setLineDash([]);ctx.restore();

        /* Crosshairs */
        const ch=24,ca=0.26+0.11*Math.sin(T*2.5);
        ctx.strokeStyle=TEAL(ca);ctx.lineWidth=0.75;
        ctx.beginPath();ctx.moveTo(M.x-ch,M.y);ctx.lineTo(M.x+ch,M.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(M.x,M.y-ch);ctx.lineTo(M.x,M.y+ch);ctx.stroke();

        /* Corner brackets — orange targeting reticle */
        const bl=9,bd=20;
        ctx.strokeStyle=AMBER(ca*1.2);ctx.lineWidth=1.0;
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{
          const bx=M.x+sx*bd,by=M.y+sy*bd;
          ctx.beginPath();ctx.moveTo(bx,by-sy*bl);ctx.lineTo(bx,by);ctx.lineTo(bx-sx*bl,by);ctx.stroke();
        });
      }

      /* 6 — Crumb trail */
      if(M.x>0)CRUMBS.push({x:M.x,y:M.y,t:T});
      while(CRUMBS.length>0&&T-CRUMBS[0].t>0.48)CRUMBS.shift();
      for(let i=1;i<CRUMBS.length;i++){
        const age=(T-CRUMBS[i].t)/0.48;
        ctx.beginPath();ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y);ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
        ctx.strokeStyle=TEAL((1-age)*0.44);ctx.lineWidth=(1-age)*2.2;ctx.stroke();
      }

      /* 7 — Vein tendrils */
      growVein();
      for(let i=VEINS.length-1;i>=0;i--){
        const v=VEINS[i];v.a*=0.855;
        if(v.a<0.018){VEINS.splice(i,1);continue;}
        ctx.beginPath();ctx.moveTo(v.pts[0].x,v.pts[0].y);
        for(let j=1;j<v.pts.length;j++)ctx.lineTo(v.pts[j].x,v.pts[j].y);
        ctx.strokeStyle=v.teal?TEAL(v.a*0.48):AMBER(v.a*0.50);
        ctx.lineWidth=0.9;ctx.stroke();
      }

      /* 8 — Click ripples + embers */
      if(M.click&&M.x>0){
        RIPPLES.push({x:M.x,y:M.y,r:5,max:140,a:0.92,w:2.0,teal:true});
        RIPPLES.push({x:M.x,y:M.y,r:5,max:88, a:0.72,w:1.4,teal:false});
        RIPPLES.push({x:M.x,y:M.y,r:5,max:48, a:0.52,w:1.0,teal:true});
        burst(M.x,M.y);
      }
      for(let i=RIPPLES.length-1;i>=0;i--){
        const rp=RIPPLES[i];rp.r+=3.5;rp.a*=0.905;
        ctx.save();ctx.shadowBlur=14;ctx.shadowColor=C(rp.teal,0.72);
        ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=C(rp.teal,rp.a);ctx.lineWidth=rp.w;ctx.stroke();ctx.restore();
        if(rp.r>=rp.max)RIPPLES.splice(i,1);
      }
      for(let i=EMBERS.length-1;i>=0;i--){
        const e=EMBERS[i];e.x+=e.vx;e.y+=e.vy;e.vx*=0.962;e.vy*=0.962;e.age++;
        if(e.age>=e.life){EMBERS.splice(i,1);continue;}
        const p=e.age/e.life,a=p<0.18?p/0.18:1-(p-0.18)/0.82;
        ctx.beginPath();ctx.arc(e.x,e.y,2.7*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=C(e.teal,Math.max(0,a)*0.92);ctx.fill();
      }

      /* 9 — Whisper scan line */
      const sY=((T*0.025)%1)*H;
      const sg=ctx.createLinearGradient(0,sY-2,0,sY+2);
      sg.addColorStop(0,"transparent");sg.addColorStop(0.5,TEAL(0.018));sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg;ctx.fillRect(0,sY-2,W,4);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    initOrbs();
    ctx.fillStyle="#000818";ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:0}} aria-hidden>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
