import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  BIOMETRIC HUD WORLD
  Inspired by mmm.jpg: cyan/teal biometric scan UI on dark teal
  
  Concept: The screen is a living biometric terminal.
  Floating HUD panels, iris scanners, fingerprint readers and face-scan
  brackets drift in the void — reacting to the mouse like a real scanner UI.
  
  Mouse: A precision targeting reticle with scan arcs that sweep when you move.
  Everything responds as if you ARE the biometric sensor.
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    const M = { x:-999, y:-999, px:-999, py:-999, vx:0, vy:0, click:false };
    const onMove  = (e:MouseEvent)=>{ M.px=M.x;M.py=M.y;M.x=e.clientX;M.y=e.clientY;M.vx=M.x-M.px;M.vy=M.y-M.py; };
    const onDown  = ()=>{ M.click=true; setTimeout(()=>{M.click=false;},220); };
    const onLeave = ()=>{ M.x=-999;M.y=-999; };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave",onLeave);
    const resize = ()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; initScene(); };
    window.addEventListener("resize", resize);

    /* Image */
    const img = new Image();
    let imgOK = false;
    img.onload = ()=>{ imgOK=true; };
    img.src = BG_IMAGE;

    /* ─── Types ─── */
    interface HudPanel {
      x:number; y:number; vx:number; vy:number;
      w:number; h:number; type:string; life:number; opacity:number; targetOp:number;
    }
    interface ScanLine { y:number; speed:number; alpha:number; panelIdx:number; }
    interface Particle { x:number; y:number; vx:number; vy:number; life:number; ml:number; }
    interface Shock    { x:number; y:number; r:number; maxR:number; a:number; }
    interface DataStream { x:number; y:number; chars:string[]; speed:number; alpha:number; }

    let PANELS:      HudPanel[]    = [];
    let STREAMS:     DataStream[]  = [];
    const PARTICLES: Particle[]   = [];
    const SHOCKS:    Shock[]       = [];
    const SCAN_LINES:ScanLine[]   = [];

    const HEX_CHARS = "0123456789ABCDEF";
    const BIO_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789♦◆▲●■";

    function rndChar(){ return BIO_CHARS[Math.floor(Math.random()*BIO_CHARS.length)]; }
    function hex4(){ return Array(4).fill(0).map(()=>HEX_CHARS[Math.floor(Math.random()*16)]).join(""); }

    function initScene(){
      const W=canvas.width, H=canvas.height;

      /* Floating HUD panels — different biometric types */
      const types = ["iris","fingerprint","face","voicewave","hexgrid","datablock","circlelock","idcard"];
      PANELS = Array.from({length:14},(_,i)=>({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.18,
        w:60+Math.random()*80, h:50+Math.random()*70,
        type: types[i%types.length],
        life: Math.random()*100, opacity:0, targetOp:0.28+Math.random()*0.45,
      }));

      /* Matrix-style data streams */
      STREAMS = Array.from({length:18},()=>({
        x: Math.random()*W,
        y: -20-Math.random()*H,
        chars: Array(8+Math.floor(Math.random()*12)).fill("").map(rndChar),
        speed: 0.8+Math.random()*1.4,
        alpha: 0.08+Math.random()*0.18,
      }));
    }

    /* ─── Draw Helpers ─── */
    const C = "#00d4ff"; // primary cyan
    const A = "#ff006e"; // accent magenta/pink (matches the pink in mmm.jpg)
    const G = "#00ff88"; // verified green
    const DIM = (alpha:number) => `rgba(0,212,255,${alpha})`;
    const ACC = (alpha:number) => `rgba(255,0,110,${alpha})`;
    const GRN = (alpha:number) => `rgba(0,255,136,${alpha})`;

    function drawIrisPanel(x:number,y:number,w:number,h:number,t:number,op:number){
      const r = Math.min(w,h)*0.42;
      const cx=x+w/2, cy=y+h/2;
      ctx.save(); ctx.globalAlpha=op;
      /* Outer glow ring */
      ctx.shadowBlur=12; ctx.shadowColor=C;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle=DIM(0.7); ctx.lineWidth=1.5; ctx.stroke();
      /* Concentric iris rings */
      for(let i=1;i<=4;i++){
        ctx.beginPath(); ctx.arc(cx,cy,r*(0.2+i*0.18),0,Math.PI*2);
        ctx.strokeStyle=DIM(0.15+i*0.06); ctx.lineWidth=0.6;
        ctx.setLineDash([3+i,8+i]); ctx.stroke(); ctx.setLineDash([]);
      }
      /* Pupil */
      ctx.beginPath(); ctx.arc(cx,cy,r*0.22,0,Math.PI*2);
      ctx.fillStyle=DIM(0.15); ctx.fill();
      ctx.strokeStyle=DIM(0.8); ctx.lineWidth=1; ctx.stroke();
      /* Scan line sweeping */
      const angle = t*1.4;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r*0.95,angle,angle+0.6);
      ctx.closePath();
      const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,r*0.95);
      grad.addColorStop(0,DIM(0.3)); grad.addColorStop(1,DIM(0));
      ctx.fillStyle=grad; ctx.fill();
      /* Corner brackets */
      const s=Math.min(w,h)*0.12;
      [[x,y],[x+w,y],[x+w,y+h],[x,y+h]].forEach(([bx,by],i)=>{
        const sx=i<2?1:-1, sy=i===0||i===3?1:-1;
        ctx.strokeStyle=ACC(0.7); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(bx+sx*s,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*s); ctx.stroke();
      });
      ctx.restore();
    }

    function drawFingerprintPanel(x:number,y:number,w:number,h:number,t:number,op:number){
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)*0.4;
      ctx.save(); ctx.globalAlpha=op;
      /* Concentric arcs — fingerprint ridges */
      for(let i=1;i<=7;i++){
        const rr=r*i/7;
        const gap=0.15+i*0.04;
        ctx.beginPath();
        ctx.arc(cx,cy+r*0.1,rr,Math.PI*0.1+gap,Math.PI*0.9-gap);
        ctx.strokeStyle=DIM(0.12+i*0.06); ctx.lineWidth=0.7; ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx,cy,rr,Math.PI*1.1+gap,Math.PI*1.9-gap);
        ctx.strokeStyle=DIM(0.08+i*0.04); ctx.lineWidth=0.5; ctx.stroke();
      }
      /* Scan beam */
      const scanY=cy-r+((t*0.8)%(r*2));
      ctx.beginPath(); ctx.moveTo(cx-r,scanY); ctx.lineTo(cx+r,scanY);
      ctx.strokeStyle=GRN(0.5); ctx.lineWidth=1.2; ctx.stroke();
      ctx.shadowBlur=8; ctx.shadowColor=G;
      ctx.beginPath(); ctx.moveTo(cx-r,scanY); ctx.lineTo(cx+r,scanY);
      ctx.strokeStyle=GRN(0.9); ctx.lineWidth=0.5; ctx.stroke();
      ctx.shadowBlur=0;
      /* Percentage bar */
      const pct=0.5+0.5*Math.sin(t*0.4);
      ctx.fillStyle=`rgba(0,20,40,0.5)`; ctx.fillRect(x+2,y+h-10,w-4,6);
      ctx.fillStyle=GRN(0.8); ctx.fillRect(x+2,y+h-10,(w-4)*pct,6);
      ctx.restore();
    }

    function drawFacePanel(x:number,y:number,w:number,h:number,t:number,op:number){
      ctx.save(); ctx.globalAlpha=op;
      const cx=x+w/2, cy=y+h/2;
      /* Face outline */
      ctx.beginPath();
      ctx.ellipse(cx,cy-h*0.04,w*0.3,h*0.38,0,0,Math.PI*2);
      ctx.strokeStyle=DIM(0.4); ctx.lineWidth=1; ctx.stroke();
      /* Eye brackets */
      [[-1,1]].forEach(([ex])=>{
        const ex2=cx+ex*w*0.1, ey=cy-h*0.1;
        ctx.beginPath(); ctx.arc(ex2,ey,5,0,Math.PI*2);
        ctx.strokeStyle=ACC(0.7); ctx.lineWidth=1; ctx.stroke();
      });
      /* Scan lines across face */
      for(let i=0;i<5;i++){
        const ly=y+h*0.2+i*(h*0.12);
        ctx.beginPath(); ctx.moveTo(x+8,ly); ctx.lineTo(x+w-8,ly);
        ctx.strokeStyle=DIM(0.06+0.04*Math.sin(t+i)); ctx.lineWidth=0.5; ctx.stroke();
      }
      /* Corner brackets */
      const s=w*0.14;
      [[x,y],[x+w,y],[x+w,y+h],[x,y+h]].forEach(([bx,by],i)=>{
        const sx=i<2?1:-1, sy=i===0||i===3?1:-1;
        ctx.strokeStyle=DIM(0.6); ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(bx+sx*s,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*s); ctx.stroke();
      });
      /* Status */
      ctx.font=`bold 7px 'Orbitron',monospace`;
      ctx.fillStyle=GRN(0.8); ctx.textAlign="center";
      ctx.fillText("SCANNING", cx, y+h-4);
      ctx.restore();
    }

    function drawVoiceWave(x:number,y:number,w:number,h:number,t:number,op:number){
      ctx.save(); ctx.globalAlpha=op;
      const bars=18, bw=(w-8)/bars;
      for(let i=0;i<bars;i++){
        const bh=(h*0.55)*(0.2+0.8*Math.abs(Math.sin(t*2+i*0.6)));
        const bx=x+4+i*bw, by=y+h/2-bh/2;
        ctx.fillStyle=DIM(0.25+0.35*Math.abs(Math.sin(t+i)));
        ctx.fillRect(bx,by,bw-2,bh);
        if(bh>h*0.3){
          ctx.shadowBlur=6; ctx.shadowColor=C;
          ctx.fillStyle=DIM(0.8); ctx.fillRect(bx,by,bw-2,2); ctx.shadowBlur=0;
        }
      }
      ctx.strokeStyle=ACC(0.4); ctx.lineWidth=0.8;
      ctx.strokeRect(x,y,w,h);
      ctx.font=`6px 'Orbitron',monospace`; ctx.fillStyle=ACC(0.7); ctx.textAlign="center";
      ctx.fillText("VOICE SCAN", x+w/2, y+h+8);
      ctx.restore();
    }

    function drawHexGrid(x:number,y:number,w:number,h:number,t:number,op:number){
      ctx.save(); ctx.globalAlpha=op*0.7;
      const hex=(hx:number,hy:number,r:number,fill:boolean)=>{
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const a=Math.PI/3*i-Math.PI/6;
          i===0?ctx.moveTo(hx+r*Math.cos(a),hy+r*Math.sin(a)):ctx.lineTo(hx+r*Math.cos(a),hy+r*Math.sin(a));
        }
        ctx.closePath();
        if(fill){ctx.fillStyle=DIM(0.08);ctx.fill();}
        ctx.strokeStyle=DIM(0.3+0.15*Math.sin(t+hx*0.1)); ctx.lineWidth=0.7; ctx.stroke();
      };
      const r=12, rows=Math.ceil(h/(r*1.7))+1, cols=Math.ceil(w/(r*1.5))+1;
      for(let row=0;row<rows;row++){
        for(let col=0;col<cols;col++){
          const hx=x+col*r*1.72+(row%2?r*0.86:0), hy=y+row*r*1.5;
          hex(hx,hy,r-1,Math.random()<0.1);
        }
      }
      ctx.restore();
    }

    function drawDataBlock(x:number,y:number,w:number,h:number,t:number,op:number){
      ctx.save(); ctx.globalAlpha=op;
      ctx.strokeStyle=DIM(0.35); ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
      /* Scrolling hex data */
      ctx.font=`7px 'JetBrains Mono',monospace`; ctx.fillStyle=DIM(0.55);
      const lineH=9, lines=Math.floor(h/lineH);
      for(let i=0;i<lines;i++){
        const row=Math.floor((t*3+i*7))%20;
        ctx.fillStyle=i===2?GRN(0.85):DIM(0.3+Math.sin(t+i)*0.1);
        ctx.fillText(`${hex4()} ${hex4()} ${hex4()}`, x+4, y+10+i*lineH);
      }
      /* Header */
      ctx.fillStyle=ACC(0.8); ctx.font=`bold 7px 'Orbitron',monospace`;
      ctx.fillText("BIOMETRIC DATA", x+4, y+8);
      ctx.restore();
    }

    function drawCircleLock(x:number,y:number,w:number,h:number,t:number,op:number){
      ctx.save(); ctx.globalAlpha=op;
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)*0.38;
      /* Outer ring with dashes rotating */
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*0.4);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
      ctx.strokeStyle=DIM(0.5); ctx.lineWidth=1.2; ctx.setLineDash([8,4]); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      /* Inner solid ring */
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(-t*0.6);
      ctx.beginPath(); ctx.arc(0,0,r*0.7,0,Math.PI*2);
      ctx.strokeStyle=ACC(0.6); ctx.lineWidth=0.8; ctx.setLineDash([4,8]); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      /* Lock icon in centre */
      ctx.strokeStyle=DIM(0.8); ctx.lineWidth=1.2;
      ctx.strokeRect(cx-8,cy-2,16,12);
      ctx.beginPath(); ctx.arc(cx,cy-2,5,Math.PI,0); ctx.stroke();
      /* Status text */
      ctx.font=`bold 7px 'Orbitron',monospace`; ctx.textAlign="center";
      ctx.fillStyle=ACC(0.9); ctx.fillText("LOCKED", cx, y+h-4);
      ctx.restore();
    }

    function drawIdCard(x:number,y:number,w:number,h:number,_t:number,op:number){
      ctx.save(); ctx.globalAlpha=op;
      ctx.strokeStyle=DIM(0.4); ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
      ctx.fillStyle=`rgba(0,60,80,0.18)`; ctx.fillRect(x,y,w,h);
      /* Photo box */
      const pw=w*0.32, ph=h*0.6;
      ctx.strokeStyle=DIM(0.5); ctx.lineWidth=0.8; ctx.strokeRect(x+6,y+6,pw,ph);
      /* Silhouette */
      ctx.fillStyle=DIM(0.15); ctx.beginPath(); ctx.arc(x+6+pw/2,y+10,pw*0.25,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+6+pw/2,y+22,pw*0.38,0,Math.PI,true); ctx.fill();
      /* Data lines */
      const lx=x+pw+14;
      for(let i=0;i<4;i++){
        const lw=(w-pw-20)*(0.5+Math.random()*0.5);
        ctx.fillStyle=DIM(0.25+i*0.05);
        ctx.fillRect(lx,y+8+i*10,lw,3);
      }
      /* ID number */
      ctx.font=`6px 'JetBrains Mono',monospace`; ctx.fillStyle=GRN(0.7);
      ctx.textAlign="left"; ctx.fillText(`ID:${hex4()}`, x+6, y+h-6);
      ctx.restore();
    }

    /* ─── Main draw loop ─── */
    function draw(){
      T+=0.016;
      const W=canvas.width, H=canvas.height;

      /* 1 — Background image scaled and tinted */
      if(imgOK){
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
        /* Dark overlay to make HUD elements pop */
        ctx.fillStyle="rgba(0,12,24,0.72)";
        ctx.fillRect(0,0,W,H);
      } else {
        ctx.fillStyle="#010c1a"; ctx.fillRect(0,0,W,H);
      }

      /* 2 — Grid overlay (subtle) */
      ctx.save(); ctx.globalAlpha=0.04;
      for(let x=0;x<W;x+=40){
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);
        ctx.strokeStyle=C;ctx.lineWidth=0.5;ctx.stroke();
      }
      for(let y=0;y<H;y+=40){
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);
        ctx.strokeStyle=C;ctx.lineWidth=0.5;ctx.stroke();
      }
      ctx.restore();

      /* 3 — Data streams */
      ctx.font=`9px 'JetBrains Mono',monospace`;
      for(const s of STREAMS){
        s.y+=s.speed;
        if(s.y>H+100){ s.y=-20-Math.random()*200; s.x=Math.random()*W; s.chars=s.chars.map(rndChar); }
        if(Math.random()<0.04) s.chars[Math.floor(Math.random()*s.chars.length)]=rndChar();
        s.chars.forEach((ch,i)=>{
          const alpha=s.alpha*(1-i/s.chars.length)*0.8;
          ctx.fillStyle=i===0?DIM(s.alpha*2):DIM(alpha);
          ctx.fillText(ch,s.x,s.y+i*11);
        });
      }

      /* 4 — HUD panels */
      for(const p of PANELS){
        p.x+=p.vx; p.y+=p.vy; p.life+=0.016;
        if(p.x<-120)p.x=W+20; if(p.x>W+120)p.x=-20;
        if(p.y<-120)p.y=H+20; if(p.y>H+120)p.y=-20;
        p.opacity+=(p.targetOp-p.opacity)*0.02;
        switch(p.type){
          case"iris":         drawIrisPanel(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"fingerprint":  drawFingerprintPanel(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"face":         drawFacePanel(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"voicewave":    drawVoiceWave(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"hexgrid":      drawHexGrid(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"datablock":    drawDataBlock(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"circlelock":   drawCircleLock(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
          case"idcard":       drawIdCard(p.x,p.y,p.w,p.h,T+p.life,p.opacity); break;
        }
      }

      /* 5 — Connection lines between nearby panels */
      for(let i=0;i<PANELS.length;i++){
        for(let j=i+1;j<PANELS.length;j++){
          const pa=PANELS[i], pb=PANELS[j];
          const ax=pa.x+pa.w/2, ay=pa.y+pa.h/2;
          const bx=pb.x+pb.w/2, by=pb.y+pb.h/2;
          const d=Math.hypot(ax-bx,ay-by);
          if(d<220){
            ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
            ctx.strokeStyle=DIM((1-d/220)*0.12); ctx.lineWidth=0.5; ctx.stroke();
            /* Node dot */
            ctx.beginPath(); ctx.arc(ax+(bx-ax)*0.5,ay+(by-ay)*0.5,1.5,0,Math.PI*2);
            ctx.fillStyle=DIM(0.3); ctx.fill();
          }
        }
      }

      /* 6 — Mouse: Precision biometric targeting reticle */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const scanSpeed=Math.hypot(M.vx,M.vy);
        const active=scanSpeed>0.5;

        /* Outer scan arc — sweeps when moving */
        ctx.save();
        ctx.translate(cx,cy); ctx.rotate(T*1.2+scanSpeed*0.1);
        ctx.beginPath(); ctx.arc(0,0,38,0,Math.PI*(0.5+scanSpeed*0.08));
        ctx.strokeStyle=DIM(0.65); ctx.lineWidth=1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,38,Math.PI,Math.PI*(1.5+scanSpeed*0.08));
        ctx.strokeStyle=ACC(0.55); ctx.lineWidth=1.2; ctx.stroke();
        ctx.restore();

        /* Middle rotating dashes */
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*2.2);
        ctx.beginPath(); ctx.arc(0,0,24,0,Math.PI*2);
        ctx.strokeStyle=DIM(0.3); ctx.lineWidth=0.7; ctx.setLineDash([4,8]); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();

        /* Inner static ring */
        ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2);
        ctx.strokeStyle=active?GRN(0.8):DIM(0.45); ctx.lineWidth=1; ctx.stroke();

        /* Centre dot */
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=active?G:C;
        ctx.beginPath(); ctx.arc(cx,cy,2.5,0,Math.PI*2);
        ctx.fillStyle=active?GRN(0.95):DIM(0.7); ctx.fill(); ctx.restore();

        /* Four tick marks at 90° */
        [0,90,180,270].forEach(deg=>{
          const r=Math.PI*deg/180, len=active?10:6;
          const x1=cx+Math.cos(r)*14, y1=cy+Math.sin(r)*14;
          const x2=cx+Math.cos(r)*(14+len), y2=cy+Math.sin(r)*(14+len);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
          ctx.strokeStyle=active?GRN(0.9):DIM(0.6); ctx.lineWidth=1.5; ctx.stroke();
        });

        /* Scan feedback: nearest panel gets highlighted */
        let nearest=PANELS[0], nearDist=9999;
        for(const p of PANELS){
          const d=Math.hypot(cx-(p.x+p.w/2),cy-(p.y+p.h/2));
          if(d<nearDist){nearDist=d;nearest=p;}
        }
        if(nearDist<200){
          const nx=nearest.x+nearest.w/2, ny=nearest.y+nearest.h/2;
          ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
          ctx.strokeStyle=DIM((1-nearDist/200)*0.25); ctx.lineWidth=0.6; ctx.stroke();
        }

        /* HUD readout next to cursor */
        ctx.font=`7px 'JetBrains Mono',monospace`;
        ctx.fillStyle=GRN(0.75);
        ctx.fillText(`X:${Math.floor(cx).toString().padStart(4,'0')}`, cx+44, cy-4);
        ctx.fillText(`Y:${Math.floor(cy).toString().padStart(4,'0')}`, cx+44, cy+7);
        ctx.fillStyle=DIM(0.5);
        ctx.fillText(active?"SCANNING":"STANDBY", cx+44, cy+20);
      }

      /* 7 — Click shockwave from cursor */
      if(M.click && M.x>0){
        for(let i=0;i<3;i++) SHOCKS.push({x:M.x,y:M.y,r:4,maxR:120+i*40,a:0.9-i*0.2});
        /* Spawn particles */
        for(let i=0;i<16;i++){
          const a=Math.random()*Math.PI*2, s=2+Math.random()*5;
          PARTICLES.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:35+Math.random()*40});
        }
      }
      for(let i=SHOCKS.length-1;i>=0;i--){
        const s=SHOCKS[i]; s.r+=4; s.a*=0.90;
        if(s.r>s.maxR||s.a<0.01){SHOCKS.splice(i,1);continue;}
        ctx.save(); ctx.shadowBlur=10; ctx.shadowColor=s.r<80?A:C;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.strokeStyle=s.r<80?ACC(s.a):DIM(s.a); ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
      }
      for(let i=PARTICLES.length-1;i>=0;i--){
        const p=PARTICLES[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=0.96; p.vy*=0.96; p.life++;
        if(p.life>=p.ml){PARTICLES.splice(i,1);continue;}
        const alpha=(1-p.life/p.ml)*0.8;
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
        ctx.fillStyle=DIM(alpha); ctx.fill();
      }

      /* 8 — Scan line */
      const sY=((T*0.028)%1)*H;
      const sg=ctx.createLinearGradient(0,sY-1,0,sY+1);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,DIM(0.025)); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,sY-1,W,2);

      /* 9 — Corner HUD elements */
      const cHUD=(x:number,y:number,flip:boolean)=>{
        const s=24;
        ctx.strokeStyle=DIM(0.35); ctx.lineWidth=1;
        ctx.beginPath();
        if(!flip){ ctx.moveTo(x+s,y); ctx.lineTo(x,y); ctx.lineTo(x,y+s); }
        else      { ctx.moveTo(x-s,y); ctx.lineTo(x,y); ctx.lineTo(x,y+s); }
        ctx.stroke();
        ctx.font=`7px 'JetBrains Mono',monospace`;
        ctx.fillStyle=DIM(0.3);
        ctx.fillText(hex4(), flip?x-40:x+4, y+14);
      };
      cHUD(8,8,false); cHUD(W-8,8,true); cHUD(8,H-8,false); cHUD(W-8,H-8,true);

      /* Bottom status bar */
      ctx.font=`7px 'Orbitron',monospace`;
      ctx.fillStyle=DIM(0.25);
      ctx.textAlign="center";
      ctx.fillText(`BIOMETRIC IDENTIFICATION SYSTEM  •  ${new Date().toLocaleTimeString()}  •  ${PANELS.length} MODULES ACTIVE`, W/2, H-6);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    initScene();
    ctx.fillStyle="#010c1a"; ctx.fillRect(0,0,canvas.width,canvas.height);
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
