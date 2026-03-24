import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  CIRCUIT SCAN — fb.jpg
  
  fb.jpg: deep navy-blue circuit board with a fingerprint scanner
  top-centre, neon cyan/teal glowing traces, colourful light streaks
  
  Art concept:
  — Image is NOT shown full screen. We extract its soul:
      deep navy void, glowing circuit traces, neon spark nodes.
  — The image is revealed in a CORNER PANEL (bottom-right) —
    a scanner screen showing the actual photo, like a camera feed.
  — Across the void: a living circuit board grows with the image's
    colour palette: deep blue, cyan, teal, warm accent streaks.
    
  Mouse: A clean "scanner dot" — just a sharp glowing dot with
  a minimal hairline cross. Simple, elegant, professional.
  Nearby nodes get highlighted. A soft glow traces the cursor.
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
    const onMove  = (e:MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.click=true; setTimeout(()=>{ M.click=false; },220); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    /* Image */
    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK=true; };
    img.src = BG_IMAGE;

    /* ── Palette from fb.jpg ──
       Deep navy:  #020d1a
       Cyan teal:  hsl(192,100%,55%)
       Electric:   hsl(210,100%,62%)
       Warm streak:hsl(45,100%,65%)  — the colourful light in the image
       Ice white:  rgba(200,240,255)
    */
    const CY = (a:number) => `rgba(0,220,255,${a})`;    // cyan
    const BL = (a:number) => `rgba(40,140,255,${a})`;   // electric blue
    const WM = (a:number) => `rgba(160,255,220,${a})`;  // warm mint (image highlight)
    const WH = (a:number) => `rgba(200,240,255,${a})`;  // ice white

    interface Node  { x:number;y:number;ox:number;oy:number;vx:number;vy:number;r:number;hue:number;phase:number; }
    interface Trace { pts:{x:number;y:number}[];hue:number;alpha:number;flow:number; }
    interface Burst { x:number;y:number;r:number;max:number;a:number;hue:number; }
    interface Mote  { x:number;y:number;vx:number;vy:number;life:number;ml:number;hue:number; }
    interface Crumb { x:number;y:number;t:number; }

    let NODES:  Node[]  = [];
    let TRACES: Trace[] = [];
    const BURSTS: Burst[] = [];
    const MOTES:  Mote[]  = [];
    const CRUMBS: Crumb[] = [];

    function init() {
      const W=canvas.width, H=canvas.height;

      /* Nodes — scattered, excluding centre + bottom-right (reserved for scanner panel) */
      NODES = Array.from({length:52}, (_,i) => {
        let x:number, y:number;
        do {
          x = 30 + Math.random()*(W-60);
          y = 30 + Math.random()*(H-60);
        } while (
          // avoid bottom-right panel area
          (x > W-240 && y > H-200) ||
          // avoid dead centre 
          (Math.hypot(x-W/2, y-H/2) < 80)
        );
        return {
          x, y, ox:x, oy:y, vx:0, vy:0,
          r: i<8 ? 3.5+Math.random()*3 : 1.2+Math.random()*2.2,
          hue: [192,210,195,220,180][Math.floor(Math.random()*5)],
          phase: Math.random()*Math.PI*2,
        };
      });

      /* Traces — Manhattan paths connecting nodes */
      TRACES = [];
      for (let i=0; i<NODES.length; i++) {
        const j = (i + 1 + Math.floor(Math.random()*3)) % NODES.length;
        const a = NODES[i], b = NODES[j];
        // Manhattan: go horizontal then vertical
        const mid = { x: b.x, y: a.y };
        TRACES.push({
          pts: [{x:a.ox,y:a.oy}, mid, {x:b.ox,y:b.oy}],
          hue: 190 + Math.floor(Math.random()*30),
          alpha: 0.07 + Math.random()*0.11,
          flow: Math.random(),
        });
      }
    }

    /* ── Draw ── */
    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;

      /* 1 — Deep navy void */
      ctx.fillStyle = "#020d1a";
      ctx.fillRect(0,0,W,H);

      /* 2 — Ambient radial glow — cyan/blue like the image */
      const amb1 = ctx.createRadialGradient(W*0.3, H*0.35, 0, W*0.3, H*0.35, W*0.60);
      amb1.addColorStop(0, "rgba(0,80,160,0.20)");
      amb1.addColorStop(0.5,"rgba(0,40,100,0.08)");
      amb1.addColorStop(1, "transparent");
      ctx.fillStyle=amb1; ctx.fillRect(0,0,W,H);

      const amb2 = ctx.createRadialGradient(W*0.72, H*0.25, 0, W*0.72, H*0.25, W*0.40);
      amb2.addColorStop(0, "rgba(0,180,255,0.12)");
      amb2.addColorStop(1, "transparent");
      ctx.fillStyle=amb2; ctx.fillRect(0,0,W,H);

      /* 3 — Fine dot grid — deep cyan, very subtle */
      for(let gx=0; gx<W; gx+=38){
        for(let gy=0; gy<H; gy+=38){
          const hue = 192 + ((gx*0.22+gy*0.15+T*14)%28);
          const a = 0.045 + 0.028*Math.sin(T*0.55+gx*0.04+gy*0.035);
          ctx.beginPath(); ctx.arc(gx,gy,0.75,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,65%,${a})`; ctx.fill();
        }
      }

      /* 4 — Circuit traces with flowing photons */
      for (const tr of TRACES) {
        tr.flow = (tr.flow+0.003)%1;
        // Draw Manhattan path
        ctx.beginPath();
        ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`;
        ctx.lineWidth=0.75; ctx.stroke();

        // Photon flowing along path
        const totalLen = tr.pts.slice(1).reduce((acc,p,i) =>
          acc+Math.hypot(p.x-tr.pts[i].x, p.y-tr.pts[i].y), 0);
        let target=tr.flow*totalLen, walked=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x, tr.pts[i].y-tr.pts[i-1].y);
          if(walked+seg>=target){
            const t2=(target-walked)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save();
            ctx.shadowBlur=10; ctx.shadowColor=`hsla(${tr.hue},100%,80%,1)`;
            ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,88%,0.92)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore();
            break;
          }
          walked+=seg;
        }
        // Node dots at trace corners
        for(const pt of tr.pts){
          ctx.beginPath(); ctx.arc(pt.x,pt.y,1.5,0,Math.PI*2);
          ctx.fillStyle=`hsla(${tr.hue},100%,65%,${tr.alpha*1.6})`; ctx.fill();
        }
      }

      /* 5 — Nodes — react to cursor magnetically */
      for(const n of NODES){
        n.phase += 0.011*(0.8+Math.random()*0.4);
        const pulse = 0.5+0.5*Math.sin(n.phase);

        if(M.x>0){
          const dx=M.x-n.x, dy=M.y-n.y, d=Math.hypot(dx,dy);
          if(d<220&&d>0.5){ const f=0.022*(1-d/220); n.vx+=dx/d*f; n.vy+=dy/d*f; }
        }
        n.vx+=(n.ox-n.x)*0.014; n.vy+=(n.oy-n.y)*0.014;
        n.vx*=0.86; n.vy*=0.86;
        n.x+=n.vx; n.y+=n.vy;

        // Glow halo
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.5);
        g.addColorStop(0,`hsla(${n.hue},100%,60%,${pulse*0.28})`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3.5,0,Math.PI*2); ctx.fill();

        ctx.save();
        ctx.shadowBlur=n.r>3?14:7; ctx.shadowColor=`hsla(${n.hue},100%,70%,0.9)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(0.88+0.14*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,70%,${0.45+0.42*pulse})`;
        ctx.lineWidth=n.r>3?1.4:0.9; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();

        if(n.r>3){
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*0.38,0,Math.PI*2);
          ctx.fillStyle=`hsla(${n.hue},100%,82%,${pulse*0.65})`; ctx.fill();
        }
      }

      /* 6 — Node connection lines */
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const d=Math.hypot(NODES[i].x-NODES[j].x, NODES[i].y-NODES[j].y);
          if(d>145)continue;
          ctx.beginPath(); ctx.moveTo(NODES[i].x,NODES[i].y); ctx.lineTo(NODES[j].x,NODES[j].y);
          ctx.strokeStyle=CY((1-d/145)*0.11); ctx.lineWidth=0.55; ctx.stroke();
        }
      }

      /* 7 — IMAGE as corner scanner panel — bottom-right */
      if(imgOK){
        const PW=210, PH=155; // panel size
        const PX=W-PW-20, PY=H-PH-20; // bottom-right position
        ctx.save();

        // Panel glass background
        ctx.fillStyle="rgba(0,12,28,0.75)";
        ctx.beginPath(); ctx.roundRect(PX,PY,PW,PH,10); ctx.fill();

        // Draw image clipped inside panel
        ctx.save();
        ctx.beginPath(); ctx.roundRect(PX+1,PY+1,PW-2,PH-26,9); ctx.clip();
        // Fit image inside panel
        const iAR=img.width/img.height, pAR=PW/(PH-26);
        let iw:number,ih:number,ix:number,iy:number;
        if(pAR>iAR){iw=PW;ih=PW/iAR;ix=PX;iy=PY+(PH-26-ih)/2;}
        else{ih=PH-26;iw=ih*iAR;ix=PX+(PW-iw)/2;iy=PY;}
        ctx.globalAlpha=0.88;
        ctx.drawImage(img,ix,iy,iw,ih);
        ctx.globalAlpha=1;
        // Subtle scan line animation over image
        const scanY=PY+(((T*35)%(PH-26)));
        const sg=ctx.createLinearGradient(0,scanY-3,0,scanY+3);
        sg.addColorStop(0,"transparent");
        sg.addColorStop(0.5,CY(0.35));
        sg.addColorStop(1,"transparent");
        ctx.fillStyle=sg; ctx.fillRect(PX,scanY-3,PW,6);
        ctx.restore();

        // Panel border — glowing cyan
        ctx.save();
        ctx.shadowBlur=12; ctx.shadowColor=CY(0.9);
        ctx.strokeStyle=CY(0.65); ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.roundRect(PX,PY,PW,PH,10); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();

        // Corner brackets on panel
        const bs=12;
        [[PX,PY,1,1],[PX+PW,PY,-1,1],[PX+PW,PY+PH,-1,-1],[PX,PY+PH,1,-1]].forEach(([bx,by,sx,sy])=>{
          ctx.strokeStyle=CY(0.9); ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(bx+sx*bs,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*bs); ctx.stroke();
        });

        // Panel footer — label bar
        ctx.fillStyle="rgba(0,30,60,0.85)";
        ctx.beginPath(); ctx.roundRect(PX+1,PY+PH-24,PW-2,23,{bottomLeft:9,bottomRight:9}); ctx.fill();
        ctx.font="bold 8px 'Orbitron',monospace"; ctx.textAlign="left";
        ctx.fillStyle=CY(0.85); ctx.fillText("◉ LIVE SCAN", PX+10, PY+PH-10);
        ctx.textAlign="right";
        ctx.fillStyle=CY(0.5);
        const now=new Date(); ctx.fillText(now.toLocaleTimeString(), PX+PW-10, PY+PH-10);
        // Pulsing status dot
        ctx.save();
        ctx.shadowBlur=8; ctx.shadowColor=`hsl(145,100%,55%)`;
        ctx.beginPath(); ctx.arc(PX+PW-22, PY+PH-14, 3.5, 0, Math.PI*2);
        const dotA=0.5+0.5*Math.sin(T*3);
        ctx.fillStyle=`rgba(0,255,100,${dotA})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        ctx.restore();
      }

      /* 8 — Diagonal light streaks (matches the colourful streaks in fb.jpg) */
      [
        {x:W*0.12,y:0,    dx:0.5,  alpha:0.08, hue:192, t:0   },
        {x:W*0.65,y:0,    dx:-0.3, alpha:0.06, hue:210, t:0.3 },
        {x:W*0.85,y:H*0.2,dx:0.4,  alpha:0.05, hue:220, t:0.6 },
      ].forEach(s=>{
        const progress=((T*0.022+s.t)%1);
        const x1=(s.x+s.dx*progress*W*0.8);
        const y1=progress*H*1.2-H*0.1;
        const x2=x1+80*s.dx, y2=y1+120;
        const grad=ctx.createLinearGradient(x1,y1,x2,y2);
        grad.addColorStop(0,"transparent");
        grad.addColorStop(0.4,`hsla(${s.hue},100%,72%,${s.alpha*0.5})`);
        grad.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=grad; ctx.lineWidth=1.5; ctx.stroke();
      });

      /* 9 — MOUSE: Clean scanner dot — simple & professional */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const spd=Math.hypot(M.vx,M.vy);
        const hot=spd>1.5;

        // Soft ambient bloom — barely visible
        const bloom=ctx.createRadialGradient(cx,cy,0,cx,cy,55);
        bloom.addColorStop(0, CY(hot?0.10:0.06));
        bloom.addColorStop(0.6,CY(0.02));
        bloom.addColorStop(1,"transparent");
        ctx.fillStyle=bloom; ctx.beginPath(); ctx.arc(cx,cy,55,0,Math.PI*2); ctx.fill();

        // Outer thin circle — very faint
        ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2);
        ctx.strokeStyle=CY(hot?0.28:0.16); ctx.lineWidth=0.8; ctx.stroke();

        // Hairline cross — the key design element
        const arm=18, gap=5;
        ctx.strokeStyle=CY(hot?0.85:0.55); ctx.lineWidth=hot?1.2:0.9;
        // Top
        ctx.beginPath(); ctx.moveTo(cx,cy-gap); ctx.lineTo(cx,cy-arm); ctx.stroke();
        // Bottom
        ctx.beginPath(); ctx.moveTo(cx,cy+gap); ctx.lineTo(cx,cy+arm); ctx.stroke();
        // Left
        ctx.beginPath(); ctx.moveTo(cx-gap,cy); ctx.lineTo(cx-arm,cy); ctx.stroke();
        // Right
        ctx.beginPath(); ctx.moveTo(cx+gap,cy); ctx.lineTo(cx+arm,cy); ctx.stroke();

        // Centre dot — the sharpest element
        ctx.save();
        ctx.shadowBlur=hot?12:7;
        ctx.shadowColor=hot?WM(1):CY(0.9);
        ctx.beginPath(); ctx.arc(cx,cy,hot?3.2:2.2,0,Math.PI*2);
        ctx.fillStyle=hot?WM(0.95):CY(0.82); ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        // Nearest node highlight — node brightens when cursor is close
        for(const n of NODES){
          const d=Math.hypot(cx-n.x,cy-n.y);
          if(d<80){
            const a=(1-d/80)*0.55;
            ctx.save();
            ctx.shadowBlur=14; ctx.shadowColor=`hsla(${n.hue},100%,80%,${a})`;
            ctx.beginPath(); ctx.arc(n.x,n.y,n.r*1.8,0,Math.PI*2);
            ctx.strokeStyle=`hsla(${n.hue},100%,78%,${a})`; ctx.lineWidth=1.2; ctx.stroke();
            ctx.shadowBlur=0; ctx.restore();
          }
        }

        // Crumb trail
        CRUMBS.push({x:cx,y:cy,t:T});
        while(CRUMBS.length&&T-CRUMBS[0].t>0.38)CRUMBS.shift();
        for(let i=1;i<CRUMBS.length;i++){
          const age=(T-CRUMBS[i].t)/0.38;
          ctx.beginPath(); ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y); ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
          ctx.strokeStyle=CY((1-age)*0.30); ctx.lineWidth=(1-age)*1.6; ctx.stroke();
        }
      }

      /* 10 — Click: clean concentric rings */
      if(M.click&&M.x>0){
        for(let i=0;i<3;i++)
          BURSTS.push({x:M.x,y:M.y,r:5,max:80+i*35,a:0.85-i*0.22,hue:192+i*12});
        for(let i=0;i<14;i++){
          const a=Math.random()*Math.PI*2, s=1.5+Math.random()*4;
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
        const p=m.life/m.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(m.x,m.y,2.2*(1-p*0.4),0,Math.PI*2);
        ctx.fillStyle=`hsla(${m.hue},100%,72%,${a*0.85})`; ctx.fill();
      }

      /* 11 — Corner HUD marks */
      [[12,12,1,1],[W-12,12,-1,1],[W-12,H-12,-1,-1],[12,H-12,1,-1]].forEach(([x,y,sx,sy],i)=>{
        if(i===3)return; // skip bottom-left so scanner panel is uncluttered
        const s=18;
        ctx.strokeStyle=CY(0.28); ctx.lineWidth=1.1;
        ctx.beginPath(); ctx.moveTo(x+sx*s,y); ctx.lineTo(x,y); ctx.lineTo(x,y+sy*s); ctx.stroke();
        const pa=0.35+0.35*Math.sin(T*1.4+i);
        ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2);
        ctx.fillStyle=CY(pa); ctx.fill();
      });

      /* 12 — Scan line */
      const sY=((T*0.022)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1,0,sY+1);
      sl.addColorStop(0,"transparent"); sl.addColorStop(0.5,CY(0.018)); sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl; ctx.fillRect(0,sY-1,W,2);

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
