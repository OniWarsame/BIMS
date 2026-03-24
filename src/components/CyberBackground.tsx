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
    const onMove  = (e:MouseEvent)=>{ M.px=M.x;M.py=M.y;M.x=e.clientX;M.y=e.clientY;M.vx=M.x-M.px;M.vy=M.y-M.py; };
    const onDown  = ()=>{ M.click=true; setTimeout(()=>{M.click=false;},220); };
    const onLeave = ()=>{ M.x=-999;M.y=-999; };
    window.addEventListener("mousemove",onMove,{passive:true});
    window.addEventListener("mousedown",onDown);
    window.addEventListener("mouseleave",onLeave);
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize",resize);

    /* ── Image ── */
    const img = new Image();
    let imgOK = false;
    img.onload=()=>{ imgOK=true; };
    img.src = BG_IMAGE;

    /* ── Types ── */
    interface Panel { x:number;y:number;vx:number;vy:number;w:number;h:number;kind:number;t0:number; }
    interface Spark { x:number;y:number;vx:number;vy:number;life:number;ml:number;hue:number; }
    interface Ring  { x:number;y:number;r:number;max:number;a:number;hue:number; }
    interface Beam  { x:number;angle:number;speed:number;alpha:number;len:number; }

    let   PANELS: Panel[] = [];
    const SPARKS: Spark[] = [];
    const RINGS:  Ring[]  = [];
    let   BEAMS:  Beam[]  = [];

    function init(){
      const W=canvas.width, H=canvas.height;
      // 14 drifting panels, 7 kinds
      PANELS = Array.from({length:14},(_,i)=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.24, vy:(Math.random()-0.5)*0.20,
        w:70+Math.random()*60, h:55+Math.random()*55,
        kind:i%7, t0:Math.random()*100,
      }));
      // Horizontal light beams sweeping
      BEAMS = Array.from({length:6},(_,i)=>({
        x:-0.1, angle:0, speed:0.0004+i*0.00015,
        alpha:0.12+i*0.04, len:0.12+Math.random()*0.18,
      }));
    }

    /* ─── Colour palette (rich, vibrant) ─── */
    // Cyan    hsl(192,100%)  – primary
    // Magenta hsl(320,100%)  – accent
    // Green   hsl(145,90%)   – verified
    // Gold    hsl(45,100%)   – warning/lock
    // Purple  hsl(270,90%)   – secondary
    const CY = (a:number)=>`rgba(0,225,255,${a})`;
    const MG = (a:number)=>`rgba(255,0,180,${a})`;
    const GN = (a:number)=>`rgba(0,255,120,${a})`;
    const GO = (a:number)=>`rgba(255,195,0,${a})`;
    const PU = (a:number)=>`rgba(160,80,255,${a})`;

    /* ─── Panel drawers ─── */
    function bracket(x:number,y:number,w:number,h:number,col:string,s=12){
      ctx.strokeStyle=col; ctx.lineWidth=1.6;
      [[x,y,1,1],[x+w,y,-1,1],[x+w,y+h,-1,-1],[x,y+h,1,-1]].forEach(([bx,by,sx,sy])=>{
        ctx.beginPath();
        ctx.moveTo(bx+sx*s,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*s);
        ctx.stroke();
      });
    }

    function drawIris(p:Panel,t:number){
      const {x,y,w,h}=p;
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)*0.40;
      // Outer glow
      ctx.save();
      ctx.shadowBlur=20; ctx.shadowColor=CY(0.9);
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle=CY(0.85); ctx.lineWidth=2; ctx.stroke();
      ctx.shadowBlur=0;
      // 5 iris rings, each a different hue step
      for(let i=1;i<=5;i++){
        const rr=r*(0.18+i*0.16);
        const hue=192+i*18;
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${hue},100%,62%,${0.14+i*0.06})`;
        ctx.lineWidth=0.7; ctx.setLineDash([3+i,7+i]); ctx.stroke(); ctx.setLineDash([]);
      }
      // Rotating scan sector (bright cyan)
      const ang=t*1.6;
      ctx.save(); ctx.translate(cx,cy);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r*0.92,ang,ang+0.55);
      ctx.closePath();
      const g=ctx.createRadialGradient(0,0,0,0,0,r*0.92);
      g.addColorStop(0,CY(0.45)); g.addColorStop(1,CY(0));
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
      // Pupil — deep blue
      const pu=ctx.createRadialGradient(cx,cy,0,cx,cy,r*0.24);
      pu.addColorStop(0,"rgba(0,20,60,1)"); pu.addColorStop(1,"rgba(0,40,100,0.6)");
      ctx.fillStyle=pu; ctx.beginPath(); ctx.arc(cx,cy,r*0.24,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=CY(0.9); ctx.lineWidth=1.2; ctx.stroke();
      // Specular highlight
      ctx.beginPath(); ctx.arc(cx-r*0.08,cy-r*0.09,r*0.055,0,Math.PI*2);
      ctx.fillStyle="rgba(200,240,255,0.75)"; ctx.fill();
      // Magenta corner brackets
      bracket(x,y,w,h,MG(0.8));
      // Label
      ctx.font="bold 7px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=CY(0.8); ctx.fillText("EYE SCAN",cx,y+h+10);
      ctx.restore();
    }

    function drawFingerprint(p:Panel,t:number){
      const {x,y,w,h}=p;
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)*0.40;
      ctx.save();
      // Ridge arcs with gradient colouring
      for(let i=1;i<=8;i++){
        const rr=r*i/8;
        const hue=145+i*8; // green→cyan range
        ctx.beginPath(); ctx.arc(cx,cy+r*0.06,rr, Math.PI*0.08+i*0.03, Math.PI*0.92-i*0.03);
        ctx.strokeStyle=`hsla(${hue},90%,60%,${0.15+i*0.06})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx,cy-r*0.06,rr, Math.PI*1.08+i*0.03, Math.PI*1.92-i*0.03);
        ctx.strokeStyle=`hsla(${hue},90%,50%,${0.10+i*0.04})`; ctx.lineWidth=0.6; ctx.stroke();
      }
      // Animated scan beam (bright green)
      const scanY = cy - r + ((t*55)%(r*2));
      ctx.save();
      ctx.shadowBlur=10; ctx.shadowColor=GN(1);
      ctx.beginPath(); ctx.moveTo(cx-r*0.88,scanY); ctx.lineTo(cx+r*0.88,scanY);
      ctx.strokeStyle=GN(0.95); ctx.lineWidth=1.5; ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();
      // Clip oval
      ctx.beginPath(); ctx.ellipse(cx,cy,r,r*1.1,0,0,Math.PI*2);
      ctx.strokeStyle=GN(0.7); ctx.lineWidth=1.5; ctx.stroke();
      // Progress bar
      const pct=0.4+0.6*Math.abs(Math.sin(t*0.45));
      ctx.fillStyle="rgba(0,30,10,0.7)"; ctx.fillRect(x+3,y+h-9,w-6,6);
      const barGrad=ctx.createLinearGradient(x+3,0,x+3+(w-6)*pct,0);
      barGrad.addColorStop(0,"hsl(145,100%,50%)");
      barGrad.addColorStop(1,"hsl(192,100%,60%)");
      ctx.fillStyle=barGrad; ctx.fillRect(x+3,y+h-9,(w-6)*pct,6);
      // Label
      ctx.font="bold 7px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=GN(0.85); ctx.fillText(`${Math.floor(pct*100)}% MATCH`,cx,y+h+10);
      bracket(x,y,w,h,GN(0.7));
      ctx.restore();
    }

    function drawFace(p:Panel,t:number){
      const {x,y,w,h}=p;
      const cx=x+w/2, cy=y+h*0.44;
      ctx.save();
      // Face ellipse glow
      ctx.shadowBlur=12; ctx.shadowColor=CY(0.6);
      ctx.beginPath(); ctx.ellipse(cx,cy,w*0.28,h*0.36,0,0,Math.PI*2);
      ctx.strokeStyle=CY(0.55); ctx.lineWidth=1.2; ctx.stroke(); ctx.shadowBlur=0;
      // Scan lines across face (moving)
      const offset=(t*18)%h;
      for(let i=-2;i<8;i++){
        const ly=y+((i*(h/6)+offset)%h);
        const a=0.05+0.04*Math.sin(t*0.5+i);
        ctx.beginPath(); ctx.moveTo(x+6,ly); ctx.lineTo(x+w-6,ly);
        ctx.strokeStyle=CY(a); ctx.lineWidth=0.5; ctx.stroke();
      }
      // Eyes
      [-1,1].forEach(side=>{
        const ex=cx+side*w*0.1, ey=cy-h*0.1;
        ctx.shadowBlur=8; ctx.shadowColor=MG(0.9);
        ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2);
        ctx.strokeStyle=MG(0.85); ctx.lineWidth=1.2; ctx.stroke(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(ex,ey,1.5,0,Math.PI*2);
        ctx.fillStyle=MG(0.7); ctx.fill();
      });
      // Nose & mouth guides
      ctx.beginPath(); ctx.moveTo(cx,cy-h*0.05); ctx.lineTo(cx-5,cy+h*0.06); ctx.lineTo(cx+5,cy+h*0.06);
      ctx.strokeStyle=CY(0.25); ctx.lineWidth=0.6; ctx.stroke();
      // Corner brackets
      bracket(x,y,w,h,CY(0.75),10);
      // Detection bars
      ctx.font="bold 7px 'Orbitron',monospace"; ctx.textAlign="center";
      const verified=Math.sin(t*0.6)>0;
      ctx.fillStyle=verified?GN(0.9):MG(0.9);
      ctx.fillText(verified?"IDENTIFIED":"SCANNING",cx,y+h+10);
      ctx.restore();
    }

    function drawVoice(p:Panel,t:number){
      const {x,y,w,h}=p;
      const cx=x+w/2;
      ctx.save();
      // Background tint
      ctx.fillStyle="rgba(0,20,40,0.35)"; ctx.fillRect(x,y,w,h);
      // Bars with purple→cyan gradient
      const bars=20, bw=(w-6)/bars;
      for(let i=0;i<bars;i++){
        const bh=(h*0.62)*(0.15+0.85*Math.abs(Math.sin(t*2.2+i*0.7+Math.sin(t+i)*0.5)));
        const bx=x+3+i*bw, by2=y+h/2-bh/2;
        const hue=270+i*6; // purple→cyan sweep
        const barG=ctx.createLinearGradient(0,by2,0,by2+bh);
        barG.addColorStop(0,`hsla(${hue},100%,70%,0.9)`);
        barG.addColorStop(1,`hsla(${hue+30},100%,50%,0.4)`);
        ctx.fillStyle=barG; ctx.fillRect(bx,by2,bw-1.5,bh);
        // Top glow cap
        if(bh>h*0.28){
          ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=`hsla(${hue},100%,70%,1)`;
          ctx.fillStyle=`hsla(${hue},100%,85%,0.95)`;
          ctx.fillRect(bx,by2,bw-1.5,2); ctx.shadowBlur=0; ctx.restore();
        }
      }
      // Outer border glow
      ctx.shadowBlur=10; ctx.shadowColor=PU(0.8);
      ctx.strokeStyle=PU(0.65); ctx.lineWidth=1.2; ctx.strokeRect(x,y,w,h); ctx.shadowBlur=0;
      ctx.font="bold 7px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=PU(0.9); ctx.fillText("VOICE SCAN",cx,y+h+10);
      ctx.restore();
    }

    function drawLock(p:Panel,t:number){
      const {x,y,w,h}=p;
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)*0.38;
      ctx.save();
      // Outer ring — gold, rotating
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*0.5);
      ctx.shadowBlur=14; ctx.shadowColor=GO(0.85);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
      ctx.strokeStyle=GO(0.7); ctx.lineWidth=1.5; ctx.setLineDash([10,5]); ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur=0; ctx.restore();
      // Inner ring — magenta, counter
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(-t*0.8);
      ctx.beginPath(); ctx.arc(0,0,r*0.72,0,Math.PI*2);
      ctx.strokeStyle=MG(0.6); ctx.lineWidth=1; ctx.setLineDash([5,10]); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      // Lock icon
      ctx.shadowBlur=10; ctx.shadowColor=GO(1);
      ctx.strokeStyle=GO(0.9); ctx.lineWidth=1.6;
      ctx.strokeRect(cx-9,cy,18,14); // body
      ctx.beginPath(); ctx.arc(cx,cy,6.5,Math.PI,0); ctx.stroke(); // shackle
      ctx.shadowBlur=0;
      ctx.beginPath(); ctx.arc(cx,cy+7,2.2,0,Math.PI*2);
      ctx.fillStyle=GO(0.9); ctx.fill();
      // LOCKED label
      ctx.font="bold 8px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=GO(1); ctx.fillText("LOCKED",cx,y+h+10);
      bracket(x,y,w,h,GO(0.65));
      ctx.restore();
    }

    function drawHexGrid(p:Panel,t:number){
      const {x,y,w,h}=p;
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
      const r=11, cols=Math.ceil(w/(r*1.72))+2, rows=Math.ceil(h/(r*1.5))+2;
      for(let row=0;row<rows;row++){
        for(let col=0;col<cols;col++){
          const hx=x+col*r*1.72+(row%2?r*0.86:0)-r;
          const hy=y+row*r*1.5-r;
          const d=Math.hypot(hx+r-x-w/2,hy+r-y-h/2);
          const pulse=0.5+0.5*Math.sin(t*1.4-d*0.06);
          const hue=192+pulse*80; // cyan→purple pulse
          ctx.beginPath();
          for(let k=0;k<6;k++){
            const a=Math.PI/3*k-Math.PI/6;
            k===0?ctx.moveTo(hx+r*Math.cos(a),hy+r*Math.sin(a)):ctx.lineTo(hx+r*Math.cos(a),hy+r*Math.sin(a));
          }
          ctx.closePath();
          ctx.fillStyle=`hsla(${hue},90%,50%,${0.06*pulse})`;
          ctx.fill();
          ctx.strokeStyle=`hsla(${hue},100%,65%,${0.25+0.15*pulse})`; ctx.lineWidth=0.7; ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawDataBlock(p:Panel,t:number){
      const {x,y,w,h}=p;
      ctx.save();
      // Background
      ctx.fillStyle="rgba(0,10,30,0.60)"; ctx.fillRect(x,y,w,h);
      // Scrolling rows — colour-coded
      const lh=9, lines=Math.floor((h-14)/lh);
      const rowCols=[CY,GN,MG,PU,GO];
      for(let i=0;i<lines;i++){
        const col=rowCols[i%rowCols.length];
        const active=i===Math.floor((t*2)%lines);
        ctx.font=`${active?"bold ":""}7px 'JetBrains Mono',monospace`;
        ctx.fillStyle=active?col(0.95):col(0.3+0.1*Math.sin(t+i));
        const hex=()=>Math.floor(Math.random()*65536).toString(16).toUpperCase().padStart(4,"0");
        ctx.fillText(`${hex()} ${hex()} ${hex()}`,x+4,y+12+i*lh);
        if(active){
          ctx.fillStyle=col(0.15); ctx.fillRect(x,y+4+i*lh,w,lh);
        }
      }
      // Header
      ctx.font="bold 7px 'Orbitron',monospace";
      ctx.fillStyle=CY(0.9); ctx.fillText("BIOMETRIC DATA",x+4,y+8);
      ctx.strokeStyle=CY(0.35); ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
      ctx.restore();
    }

    /* ─── Draw loop ─── */
    function draw(){
      T+=0.016;
      const W=canvas.width, H=canvas.height;

      /* 1 — Base image (show it clearly, only moderate overlay) */
      if(imgOK){
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
        // Semi-dark overlay — not too heavy, image must show
        ctx.fillStyle="rgba(0,8,22,0.58)";
        ctx.fillRect(0,0,W,H);
      } else {
        // Rich gradient fallback
        const bg=ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,"#000d1a");
        bg.addColorStop(0.5,"#001428");
        bg.addColorStop(1,"#00080f");
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      }

      /* 2 — Vivid dot grid (replaces bland line grid) */
      ctx.save();
      for(let gx=0;gx<W;gx+=38){
        for(let gy=0;gy<H;gy+=38){
          const hue=192+((gx+gy)/8+T*20)%80;
          const a=0.04+0.025*Math.sin(T*0.8+gx*0.02+gy*0.02);
          ctx.beginPath(); ctx.arc(gx,gy,0.8,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,70%,${a})`; ctx.fill();
        }
      }
      ctx.restore();

      /* 3 — Animated horizontal sweep beams */
      for(const b of BEAMS){
        b.x+=b.speed;
        if(b.x>1.1) b.x=-b.len;
        const x1=Math.max(0,b.x-b.len)*W, x2=Math.min(1,b.x)*W;
        if(x2>x1){
          const hue=192+BEAMS.indexOf(b)*20;
          const bg=ctx.createLinearGradient(x1,0,x2,0);
          bg.addColorStop(0,"transparent");
          bg.addColorStop(0.7,`hsla(${hue},100%,65%,${b.alpha*0.5})`);
          bg.addColorStop(1,`hsla(${hue},100%,80%,${b.alpha})`);
          // Draw on a random y based on index
          const by=H*(0.15+BEAMS.indexOf(b)*0.14);
          ctx.beginPath(); ctx.moveTo(x1,by); ctx.lineTo(x2,by);
          ctx.strokeStyle=bg; ctx.lineWidth=1.2; ctx.stroke();
          // Bright head dot
          ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=`hsla(${hue},100%,80%,1)`;
          ctx.beginPath(); ctx.arc(x2,by,2,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,90%,${b.alpha*1.5})`; ctx.fill();
          ctx.shadowBlur=0; ctx.restore();
        }
      }

      /* 4 — HUD panels (drift, loop at edges) */
      for(const p of PANELS){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-130)p.x=W+20; if(p.x>W+130)p.x=-20;
        if(p.y<-130)p.y=H+20; if(p.y>H+130)p.y=-20;
        const t=T+p.t0;
        ctx.save(); ctx.globalAlpha=0.72;
        switch(p.kind){
          case 0: drawIris(p,t);       break;
          case 1: drawFingerprint(p,t); break;
          case 2: drawFace(p,t);        break;
          case 3: drawVoice(p,t);       break;
          case 4: drawLock(p,t);        break;
          case 5: drawHexGrid(p,t);     break;
          case 6: drawDataBlock(p,t);   break;
        }
        ctx.restore();
      }

      /* 5 — Neon connection lines between panels */
      for(let i=0;i<PANELS.length;i++){
        for(let j=i+1;j<PANELS.length;j++){
          const a=PANELS[i], b=PANELS[j];
          const ax=a.x+a.w/2, ay=a.y+a.h/2;
          const bx=b.x+b.w/2, by=b.y+b.h/2;
          const d=Math.hypot(ax-bx,ay-by);
          if(d>230) continue;
          const alpha=(1-d/230)*0.18;
          const hue=192+((i+j)*18)%80;
          ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
          ctx.strokeStyle=`hsla(${hue},100%,65%,${alpha})`;
          ctx.lineWidth=0.6; ctx.stroke();
          // Midpoint node
          ctx.beginPath(); ctx.arc((ax+bx)/2,(ay+by)/2,1.8,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,75%,${alpha*2})`; ctx.fill();
        }
      }

      /* 6 — MOUSE: Precision HUD targeting reticle */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const spd=Math.hypot(M.vx,M.vy);
        const active=spd>0.8;
        const hue=active?145:192; // green when moving, cyan at rest

        // Outer glow pulse
        ctx.save();
        ctx.shadowBlur=active?22:10;
        ctx.shadowColor=`hsla(${hue},100%,65%,0.8)`;

        // Outer arc — sweeps with velocity
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*1.1+spd*0.08);
        ctx.beginPath(); ctx.arc(0,0,42,0,Math.PI*(0.45+spd*0.05));
        ctx.strokeStyle=`hsla(${hue},100%,65%,0.8)`; ctx.lineWidth=1.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,42,Math.PI,Math.PI*(1.45+spd*0.05));
        ctx.strokeStyle=MG(0.7); ctx.lineWidth=1.8; ctx.stroke();
        ctx.restore();

        // Mid dashed ring — counter-rotate
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*2.4);
        ctx.beginPath(); ctx.arc(0,0,27,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${hue},100%,65%,0.35)`;
        ctx.lineWidth=0.9; ctx.setLineDash([4,7]); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();

        // Inner circle
        ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${hue},100%,72%,0.65)`; ctx.lineWidth=1.2; ctx.stroke();

        // Centre dot
        ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,80%,0.95)`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        // 4-way tick marks
        const tLen=active?13:8;
        [0,90,180,270].forEach(deg=>{
          const rad=deg*Math.PI/180;
          const x1=cx+Math.cos(rad)*16, y1=cy+Math.sin(rad)*16;
          const x2=cx+Math.cos(rad)*(16+tLen), y2=cy+Math.sin(rad)*(16+tLen);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
          ctx.strokeStyle=`hsla(${hue},100%,72%,0.9)`; ctx.lineWidth=1.8; ctx.stroke();
        });

        // HUD data readout
        ctx.font="7px 'JetBrains Mono',monospace";
        ctx.fillStyle=GN(0.8);
        ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+48,cy-4);
        ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+48,cy+7);
        ctx.fillStyle=active?GN(0.75):CY(0.55);
        ctx.fillText(active?"● SCANNING":"○ STANDBY",cx+48,cy+20);
      }

      /* 7 — Click: shockwaves + sparks */
      if(M.click&&M.x>0){
        for(let i=0;i<4;i++) RINGS.push({x:M.x,y:M.y,r:5,max:130+i*35,a:0.95-i*0.18,hue:i%2===0?192:320});
        for(let i=0;i<18;i++){
          const a=Math.random()*Math.PI*2, s=2+Math.random()*5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:40+Math.random()*45,hue:145+Math.random()*180});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=4; r.a*=0.89;
        if(r.r>r.max||r.a<0.01){RINGS.splice(i,1);continue;}
        ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=`hsla(${r.hue},100%,65%,0.8)`;
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${r.hue},100%,72%,${r.a})`; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.96; s.vy*=0.96; s.life++;
        if(s.life>=s.ml){SPARKS.splice(i,1);continue;}
        const p=s.life/s.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.5*(1-p*0.4),0,Math.PI*2);
        ctx.fillStyle=`hsla(${s.hue},100%,72%,${a*0.9})`; ctx.fill();
      }

      /* 8 — Ambient corner HUD decorations */
      const corners=[[12,12,1,1],[W-12,12,-1,1],[W-12,H-12,-1,-1],[12,H-12,1,-1]];
      corners.forEach(([cx,cy,sx,sy],i)=>{
        const s2=20, hue=192+i*30;
        ctx.strokeStyle=`hsla(${hue},100%,60%,0.35)`; ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(cx+sx*s2,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*s2);
        ctx.stroke();
        // Pulsing corner dot
        const pa=0.4+0.4*Math.sin(T*1.5+i);
        ctx.beginPath(); ctx.arc(cx,cy,2.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,72%,${pa})`; ctx.fill();
      });

      /* 9 — Bottom status strip */
      const stripGrad=ctx.createLinearGradient(0,H-20,0,H);
      stripGrad.addColorStop(0,"rgba(0,20,40,0)");
      stripGrad.addColorStop(1,"rgba(0,20,40,0.6)");
      ctx.fillStyle=stripGrad; ctx.fillRect(0,H-20,W,20);
      ctx.font="7px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=CY(0.3);
      ctx.fillText(`BIOMETRIC IDENTITY MANAGEMENT SYSTEM  •  ${new Date().toLocaleTimeString()}  •  ${PANELS.length} MODULES ACTIVE`,W/2,H-5);

      /* 10 — Subtle scan line */
      const sY=((T*0.026)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1.5,0,sY+1.5);
      sl.addColorStop(0,"transparent"); sl.addColorStop(0.5,CY(0.022)); sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sY-1.5,W,3);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#000d1a"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
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
