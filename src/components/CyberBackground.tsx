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

    const M = { x:-999, y:-999, px:-999, py:-999, vx:0, vy:0, click:false };
    const onMove  = (e:MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.click=true; setTimeout(()=>{ M.click=false; },220); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK = true; };
    img.src = BG_IMAGE;

    /* Palette — extracted from fb.jpg */
    const CY  = (a:number) => `rgba(0,200,255,${a})`;
    const BL  = (a:number) => `rgba(30,120,255,${a})`;
    const ICE = (a:number) => `rgba(180,235,255,${a})`;
    const GN  = (a:number) => `rgba(0,255,160,${a})`;

    interface Node  { x:number; y:number; ox:number; oy:number; vx:number; vy:number; r:number; hue:number; phase:number; }
    interface Trace { pts:{x:number;y:number}[]; hue:number; alpha:number; flow:number; }
    interface Burst { x:number; y:number; r:number; max:number; a:number; hue:number; }
    interface Mote  { x:number; y:number; vx:number; vy:number; life:number; ml:number; hue:number; }
    interface Crumb { x:number; y:number; t:number; }

    let NODES:  Node[]  = [];
    let TRACES: Trace[] = [];
    const BURSTS: Burst[] = [];
    const MOTES:  Mote[]  = [];
    const CRUMBS: Crumb[] = [];

    function init() {
      const W = canvas.width, H = canvas.height;

      NODES = Array.from({length:55}, (_,i) => {
        const x = 30 + Math.random()*(W-60);
        const y = 30 + Math.random()*(H-60);
        return {
          x, y, ox:x, oy:y, vx:0, vy:0,
          r: i<10 ? 3+Math.random()*3 : 1+Math.random()*2,
          hue: [192,205,215,185,200][Math.floor(Math.random()*5)],
          phase: Math.random()*Math.PI*2,
        };
      });

      TRACES = Array.from({length:50}, () => {
        const i = Math.floor(Math.random()*NODES.length);
        const j = (i + 1 + Math.floor(Math.random()*4)) % NODES.length;
        const a = NODES[i], b = NODES[j];
        const corner = Math.random()>0.5
          ? [{x:a.ox,y:a.oy},{x:b.ox,y:a.oy},{x:b.ox,y:b.oy}]
          : [{x:a.ox,y:a.oy},{x:a.ox,y:b.oy},{x:b.ox,y:b.oy}];
        return { pts:corner, hue:190+Math.floor(Math.random()*25), alpha:0.06+Math.random()*0.10, flow:Math.random() };
      });
    }

    /* ── Draw the fingerprint image as a large left-side panel ── */
    function drawFingerprintPanel(W:number, H:number) {
      if (!imgOK) return;

      const PW = Math.min(320, W*0.26);
      const PH = PW * (img.height/img.width);
      const PX = 38;
      const PY = (H - PH) / 2;

      ctx.save();

      /* Outer glow behind panel */
      const glow = ctx.createRadialGradient(PX+PW/2, PY+PH/2, 0, PX+PW/2, PY+PH/2, PW*0.85);
      glow.addColorStop(0, CY(0.12));
      glow.addColorStop(0.6, CY(0.04));
      glow.addColorStop(1, "transparent");
      ctx.fillStyle=glow;
      ctx.beginPath(); ctx.ellipse(PX+PW/2, PY+PH/2, PW*0.85, PH*0.85, 0, 0, Math.PI*2); ctx.fill();

      /* Clip and draw image */
      const radius = 16;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(PX+radius, PY);
      ctx.lineTo(PX+PW-radius, PY); ctx.arcTo(PX+PW,PY,PX+PW,PY+radius,radius);
      ctx.lineTo(PX+PW, PY+PH-radius); ctx.arcTo(PX+PW,PY+PH,PX+PW-radius,PY+PH,radius);
      ctx.lineTo(PX+radius, PY+PH); ctx.arcTo(PX,PY+PH,PX,PY+PH-radius,radius);
      ctx.lineTo(PX, PY+radius); ctx.arcTo(PX,PY,PX+radius,PY,radius);
      ctx.closePath(); ctx.clip();

      ctx.globalAlpha = 0.92;
      ctx.drawImage(img, PX, PY, PW, PH);
      ctx.globalAlpha = 1;

      /* Scan line animation over image */
      const scanY = PY + ((T*40)%(PH));
      const sg = ctx.createLinearGradient(0, scanY-4, 0, scanY+4);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,CY(0.40)); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(PX, scanY-4, PW, 8);

      /* Inner edge vignette */
      const vgn = ctx.createLinearGradient(PX, 0, PX+PW, 0);
      vgn.addColorStop(0, "rgba(0,8,20,0.0)");
      vgn.addColorStop(0.88,"rgba(0,8,20,0.0)");
      vgn.addColorStop(1, "rgba(0,8,20,0.55)");
      ctx.fillStyle=vgn; ctx.fillRect(PX, PY, PW, PH);

      ctx.restore();

      /* Glowing border */
      ctx.save();
      ctx.shadowBlur=18; ctx.shadowColor=CY(0.8);
      ctx.strokeStyle=CY(0.70); ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(PX+radius,PY); ctx.lineTo(PX+PW-radius,PY); ctx.arcTo(PX+PW,PY,PX+PW,PY+radius,radius);
      ctx.lineTo(PX+PW,PY+PH-radius); ctx.arcTo(PX+PW,PY+PH,PX+PW-radius,PY+PH,radius);
      ctx.lineTo(PX+radius,PY+PH); ctx.arcTo(PX,PY+PH,PX,PY+PH-radius,radius);
      ctx.lineTo(PX,PY+radius); ctx.arcTo(PX,PY,PX+radius,PY,radius);
      ctx.closePath(); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      /* Corner brackets — bright */
      const bs = 20;
      const corners = [[PX,PY,1,1],[PX+PW,PY,-1,1],[PX+PW,PY+PH,-1,-1],[PX,PY+PH,1,-1]];
      corners.forEach(([bx,by,sx,sy]) => {
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=CY(1);
        ctx.strokeStyle=CY(0.95); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(bx+sx*bs,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*bs); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      });

      /* Label below */
      const pulse = 0.5+0.5*Math.sin(T*2.5);
      ctx.save();
      ctx.shadowBlur=10; ctx.shadowColor=CY(0.8);
      ctx.font="bold 9px 'Orbitron',monospace"; ctx.textAlign="center";
      ctx.fillStyle=CY(0.6+0.3*pulse);
      ctx.fillText("◉  BIOMETRIC SCAN", PX+PW/2, PY+PH+18);
      ctx.shadowBlur=0; ctx.restore();

      /* Side connector line to the main content area */
      ctx.beginPath(); ctx.moveTo(PX+PW+2, PY+PH/2);
      ctx.lineTo(PX+PW+60, PY+PH/2);
      ctx.strokeStyle=CY(0.18); ctx.lineWidth=0.8; ctx.setLineDash([4,8]); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;

      /* 1 — Full background image — COVERS ENTIRE SCREEN */
      if (imgOK) {
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
        /* Dark overlay — keeps image visible but makes HUD readable */
        ctx.fillStyle="rgba(0,8,20,0.70)";
        ctx.fillRect(0,0,W,H);
      } else {
        ctx.fillStyle="#020d1a"; ctx.fillRect(0,0,W,H);
      }

      /* 2 — Ambient glow matching fb.jpg's blues */
      const a1=ctx.createRadialGradient(W*0.65,H*0.4,0,W*0.65,H*0.4,W*0.50);
      a1.addColorStop(0,"rgba(0,80,180,0.18)"); a1.addColorStop(1,"transparent");
      ctx.fillStyle=a1; ctx.fillRect(0,0,W,H);

      const a2=ctx.createRadialGradient(W*0.20,H*0.55,0,W*0.20,H*0.55,W*0.35);
      a2.addColorStop(0,"rgba(0,160,240,0.10)"); a2.addColorStop(1,"transparent");
      ctx.fillStyle=a2; ctx.fillRect(0,0,W,H);

      /* 3 — Dot grid */
      for(let gx=0;gx<W;gx+=36){
        for(let gy=0;gy<H;gy+=36){
          const hue=190+((gx*0.2+gy*0.15+T*12)%25);
          const a=0.038+0.022*Math.sin(T*0.5+gx*0.04+gy*0.035);
          ctx.beginPath(); ctx.arc(gx,gy,0.75,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,65%,${a})`; ctx.fill();
        }
      }

      /* 4 — Circuit traces */
      for(const tr of TRACES){
        tr.flow=(tr.flow+0.0028)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`; ctx.lineWidth=0.7; ctx.stroke();

        /* Photon */
        const total=tr.pts.slice(1).reduce((acc,p,i)=>acc+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let target=tr.flow*total,walked=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(walked+seg>=target){
            const t2=(target-walked)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=`hsla(${tr.hue},100%,80%,1)`;
            ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,88%,0.92)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          }
          walked+=seg;
        }
      }

      /* 5 — Nodes */
      for(const n of NODES){
        n.phase+=0.010;
        const pulse=0.5+0.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x,dy=M.y-n.y,d=Math.hypot(dx,dy);
          if(d<200&&d>0.5){const f=0.020*(1-d/200);n.vx+=dx/d*f;n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*0.013; n.vy+=(n.oy-n.y)*0.013;
        n.vx*=0.87; n.vy*=0.87;
        n.x+=n.vx; n.y+=n.vy;

        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.5);
        g.addColorStop(0,`hsla(${n.hue},100%,65%,${pulse*0.28})`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3.5,0,Math.PI*2); ctx.fill();

        ctx.save(); ctx.shadowBlur=n.r>3?14:7; ctx.shadowColor=`hsla(${n.hue},100%,70%,0.9)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(0.88+0.14*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,70%,${0.45+0.42*pulse})`;
        ctx.lineWidth=n.r>3?1.4:0.9; ctx.stroke(); ctx.shadowBlur=0; ctx.restore();
        if(n.r>3){
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*0.38,0,Math.PI*2);
          ctx.fillStyle=`hsla(${n.hue},100%,82%,${pulse*0.65})`; ctx.fill();
        }
      }

      /* 6 — Node connections */
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const d=Math.hypot(NODES[i].x-NODES[j].x,NODES[i].y-NODES[j].y);
          if(d>140)continue;
          ctx.beginPath(); ctx.moveTo(NODES[i].x,NODES[i].y); ctx.lineTo(NODES[j].x,NODES[j].y);
          ctx.strokeStyle=CY((1-d/140)*0.10); ctx.lineWidth=0.5; ctx.stroke();
        }
      }

      /* 7 — Fingerprint panel — LEFT SIDE, vertically centred */
      drawFingerprintPanel(W, H);

      /* 8 — Mouse: clean hairline crosshair */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const spd=Math.hypot(M.vx,M.vy);
        const hot=spd>1.5;

        /* Soft bloom */
        const bloom=ctx.createRadialGradient(cx,cy,0,cx,cy,50);
        bloom.addColorStop(0,CY(hot?0.09:0.05)); bloom.addColorStop(1,"transparent");
        ctx.fillStyle=bloom; ctx.beginPath(); ctx.arc(cx,cy,50,0,Math.PI*2); ctx.fill();

        /* Outer thin ring */
        ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2);
        ctx.strokeStyle=CY(hot?0.30:0.16); ctx.lineWidth=0.8; ctx.stroke();

        /* Hairline cross */
        const arm=16, gap=5;
        ctx.strokeStyle=CY(hot?0.88:0.55); ctx.lineWidth=hot?1.2:0.9;
        ctx.beginPath(); ctx.moveTo(cx,cy-gap); ctx.lineTo(cx,cy-arm); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx,cy+gap); ctx.lineTo(cx,cy+arm); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-gap,cy); ctx.lineTo(cx-arm,cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+gap,cy); ctx.lineTo(cx+arm,cy); ctx.stroke();

        /* Centre dot */
        ctx.save(); ctx.shadowBlur=hot?12:7; ctx.shadowColor=hot?GN(1):CY(0.9);
        ctx.beginPath(); ctx.arc(cx,cy,hot?3:2.2,0,Math.PI*2);
        ctx.fillStyle=hot?GN(0.95):CY(0.82); ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        /* Highlight nearest node */
        for(const n of NODES){
          const d=Math.hypot(cx-n.x,cy-n.y);
          if(d<75){
            const ha=(1-d/75)*0.55;
            ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=`hsla(${n.hue},100%,80%,${ha})`;
            ctx.beginPath(); ctx.arc(n.x,n.y,n.r*1.9,0,Math.PI*2);
            ctx.strokeStyle=`hsla(${n.hue},100%,78%,${ha})`; ctx.lineWidth=1.2; ctx.stroke();
            ctx.shadowBlur=0; ctx.restore();
          }
        }

        /* Crumb trail */
        CRUMBS.push({x:cx,y:cy,t:T});
        while(CRUMBS.length&&T-CRUMBS[0].t>0.35)CRUMBS.shift();
        for(let i=1;i<CRUMBS.length;i++){
          const age=(T-CRUMBS[i].t)/0.35;
          ctx.beginPath(); ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y); ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
          ctx.strokeStyle=CY((1-age)*0.28); ctx.lineWidth=(1-age)*1.5; ctx.stroke();
        }
      }

      /* 9 — Click */
      if(M.click&&M.x>0){
        for(let i=0;i<3;i++) BURSTS.push({x:M.x,y:M.y,r:5,max:75+i*30,a:0.85-i*0.22,hue:192+i*12});
        for(let i=0;i<14;i++){
          const a=Math.random()*Math.PI*2,s=1.5+Math.random()*4;
          MOTES.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:35+Math.random()*45,hue:188+Math.random()*30});
        }
      }
      for(let i=BURSTS.length-1;i>=0;i--){
        const b=BURSTS[i]; b.r+=3.5; b.a*=0.905;
        if(b.r>b.max||b.a<0.01){BURSTS.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${b.hue},100%,70%,${b.a})`; ctx.lineWidth=1.5; ctx.stroke();
      }
      for(let i=MOTES.length-1;i>=0;i--){
        const m=MOTES[i]; m.x+=m.vx; m.y+=m.vy; m.vx*=0.962; m.vy*=0.962; m.life++;
        if(m.life>=m.ml){MOTES.splice(i,1);continue;}
        const p=m.life/m.ml,a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(m.x,m.y,2.2*(1-p*0.4),0,Math.PI*2);
        ctx.fillStyle=`hsla(${m.hue},100%,72%,${a*0.85})`; ctx.fill();
      }

      /* 10 — Corner marks */
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([x,y,sx,sy])=>{
        const s=16;
        ctx.strokeStyle=CY(0.25); ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x+sx*s,y); ctx.lineTo(x,y); ctx.lineTo(x,y+sy*s); ctx.stroke();
      });

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#020d1a"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",   onResize);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mousedown",onDown);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:0}} aria-hidden>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
