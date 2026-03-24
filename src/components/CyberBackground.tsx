import React, { useEffect, useRef } from "react";
import BG_IMAGE from "@/assets/bgImage";

/*
  NEURAL CIRCUIT — nnn.jpg
  Art concept: Image is NOT shown as flat wallpaper.
  It's revealed through a living circuit board that grows across the void.
  The fingerprint at the centre breathes. Circuit traces snake outward.
  
  Mouse: A magnetic probe — traces REACT to it, nodes get pulled toward it,
  a scanning halo pulses. Completely different from any ring-based reticle.
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    const M = { x:-999, y:-999, vx:0, vy:0, px:-999, py:-999, click:false };
    const onMove  = (e:MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.click=true; setTimeout(()=>{ M.click=false; }, 240); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove", onMove, { passive:true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    const onResize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; init(); };
    window.addEventListener("resize", onResize);

    const img = new Image();
    let imgOK = false;
    img.onload = () => { imgOK = true; };
    img.src = BG_IMAGE;

    /* Palette */
    const H_VI=270, H_MG=300, H_CY=190, H_IN=245;
    const vi=(a:number)=>`rgba(150,50,255,${a})`;
    const mg=(a:number)=>`rgba(255,0,200,${a})`;
    const cy=(a:number)=>`rgba(0,220,255,${a})`;
    const wh=(a:number)=>`rgba(240,220,255,${a})`;

    interface Node  { x:number; y:number; ox:number; oy:number; vx:number; vy:number; r:number; hue:number; glow:number; }
    interface Trace { ax:number; ay:number; bx:number; by:number; flow:number; hue:number; alpha:number; }
    interface Burst { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface Mote  { x:number; y:number; vx:number; vy:number; life:number; ml:number; hue:number; }
    interface Trail { x:number; y:number; t:number; }

    let NODES:  Node[]  = [];
    let TRACES: Trace[] = [];
    const BURSTS: Burst[] = [];
    const MOTES:  Mote[]  = [];
    const TRAIL:  Trail[] = [];

    function init() {
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      // Nodes scattered with more density near image's circuit positions
      NODES = Array.from({length:60}, (_,i) => {
        const angle = Math.random() * Math.PI*2;
        const dist  = 80 + Math.random() * Math.max(W,H) * 0.52;
        const x = CX + Math.cos(angle)*dist * (0.6+Math.random()*0.8);
        const y = CY + Math.sin(angle)*dist * (0.5+Math.random()*0.9);
        return {
          x, y, ox:x, oy:y,
          vx:0, vy:0,
          r: i<10 ? 4+Math.random()*3.5 : 1.5+Math.random()*2.5,
          hue: [H_VI,H_MG,H_CY,H_IN][Math.floor(Math.random()*4)],
          glow: Math.random() * Math.PI * 2,
        };
      });

      // Traces — connect random node pairs
      TRACES = [];
      for(let i=0;i<NODES.length;i++){
        const j=(i+1+Math.floor(Math.random()*4))%NODES.length;
        TRACES.push({
          ax:NODES[i].ox, ay:NODES[i].oy,
          bx:NODES[j].ox, by:NODES[j].oy,
          flow: Math.random(),
          hue: NODES[i].hue,
          alpha: 0.08+Math.random()*0.14,
        });
      }
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      /* ─── 1. Black void base ─── */
      ctx.fillStyle = "#06001a";
      ctx.fillRect(0, 0, W, H);

      /* ─── 2. Image — masked inside a soft vignette circle ─── */
      if (imgOK) {
        ctx.save();
        // Clip to soft oval revealing the image in the background
        const rx=W*0.68, ry=H*0.78;
        ctx.beginPath(); ctx.ellipse(CX, CY, rx, ry, 0, 0, Math.PI*2);
        ctx.clip();
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.globalAlpha = 0.55; // show the purple richness
        ctx.drawImage(img,ix,iy,iw,ih);
        ctx.globalAlpha = 1;
        // Dark gradient fade from edges inward — creates depth
        const fade = ctx.createRadialGradient(CX,CY,rx*0.35,CX,CY,rx);
        fade.addColorStop(0,"transparent");
        fade.addColorStop(0.6,"rgba(6,0,26,0.35)");
        fade.addColorStop(1,"rgba(6,0,26,0.92)");
        ctx.fillStyle=fade; ctx.beginPath(); ctx.ellipse(CX,CY,rx,ry,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      /* ─── 3. Deep radial ambient — rich purple/violet core ─── */
      const amb=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.min(W,H)*0.55);
      amb.addColorStop(0,   "rgba(100,0,200,0.28)");
      amb.addColorStop(0.3, "rgba(160,0,255,0.12)");
      amb.addColorStop(0.7, "rgba(80,0,180,0.05)");
      amb.addColorStop(1,   "transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      /* ─── 4. Hue-cycling dot grid — tight, vivid ─── */
      for(let gx=0;gx<W;gx+=34){
        for(let gy=0;gy<H;gy+=34){
          const hue=270+((gx*0.25+gy*0.18+T*22)%60);
          const a=0.055+0.038*Math.sin(T*0.65+gx*0.045+gy*0.038);
          ctx.beginPath();ctx.arc(gx,gy,0.85,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,68%,${a})`;ctx.fill();
        }
      }

      /* ─── 5. Fingerprint rings breathing from centre ─── */
      const maxFP = Math.min(W,H)*0.30;
      for(let i=1;i<=11;i++){
        const r=maxFP*(i/11);
        const breath=r*(1+0.018*Math.sin(T*0.55+i*0.4));
        const hue=270+i*6;
        const a=(0.18-i*0.012)*(0.65+0.35*Math.sin(T*0.7+i));
        ctx.beginPath();ctx.arc(CX,CY,breath,0.05+i*0.02,Math.PI*2-0.05-i*0.02);
        ctx.strokeStyle=`hsla(${hue},100%,65%,${a})`;
        ctx.lineWidth=0.85;ctx.stroke();
      }
      // Centre violet glow
      ctx.save();
      ctx.shadowBlur=28;ctx.shadowColor=vi(0.9);
      ctx.beginPath();ctx.arc(CX,CY,maxFP*0.085,0,Math.PI*2);
      ctx.fillStyle=vi(0.55);ctx.fill();
      ctx.shadowBlur=0;ctx.restore();

      /* ─── 6. Circuit traces with flowing photons ─── */
      for(const tr of TRACES){
        tr.flow=(tr.flow+0.0025)%1;
        ctx.beginPath();ctx.moveTo(tr.ax,tr.ay);ctx.lineTo(tr.bx,tr.by);
        ctx.strokeStyle=`hsla(${tr.hue},100%,60%,${tr.alpha})`;
        ctx.lineWidth=0.7;ctx.stroke();
        // Photon
        const px=tr.ax+(tr.bx-tr.ax)*tr.flow;
        const py=tr.ay+(tr.by-tr.ay)*tr.flow;
        ctx.save();
        ctx.shadowBlur=10;ctx.shadowColor=`hsla(${tr.hue},100%,80%,1)`;
        ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);
        ctx.fillStyle=`hsla(${tr.hue},100%,88%,0.90)`;ctx.fill();
        ctx.shadowBlur=0;ctx.restore();
      }

      /* ─── 7. Nodes — magnetic, react to cursor ─── */
      for(const n of NODES){
        n.glow += 0.012 * (0.8+Math.random()*0.4);
        const pulse=0.5+0.5*Math.sin(n.glow);

        // Magnetic pull toward cursor
        if(M.x>0){
          const dx=M.x-n.x, dy=M.y-n.y, d=Math.hypot(dx,dy);
          if(d<260&&d>0.5){
            const f=0.025*(1-d/260);
            n.vx+=dx/d*f; n.vy+=dy/d*f;
          }
        }
        // Return to origin
        n.vx+=(n.ox-n.x)*0.012; n.vy+=(n.oy-n.y)*0.012;
        n.vx*=0.88; n.vy*=0.88;
        n.x+=n.vx; n.y+=n.vy;

        // Halo
        const haloG=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.8);
        haloG.addColorStop(0,`hsla(${n.hue},100%,65%,${pulse*0.32})`);
        haloG.addColorStop(1,"transparent");
        ctx.fillStyle=haloG;ctx.beginPath();ctx.arc(n.x,n.y,n.r*3.8,0,Math.PI*2);ctx.fill();

        // Node ring
        ctx.save();
        ctx.shadowBlur=n.r>3?16:8;ctx.shadowColor=`hsla(${n.hue},100%,72%,0.9)`;
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*(0.88+0.15*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,72%,${0.5+0.4*pulse})`;
        ctx.lineWidth=n.r>3?1.6:1;ctx.stroke();ctx.shadowBlur=0;ctx.restore();

        if(n.r>3){
          ctx.beginPath();ctx.arc(n.x,n.y,n.r*0.42,0,Math.PI*2);
          ctx.fillStyle=`hsla(${n.hue},100%,85%,${pulse*0.65})`;ctx.fill();
        }
      }

      /* ─── 8. Node connections ─── */
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const d=Math.hypot(NODES[i].x-NODES[j].x,NODES[i].y-NODES[j].y);
          if(d>160)continue;
          const a=(1-d/160)*0.13;
          ctx.beginPath();ctx.moveTo(NODES[i].x,NODES[i].y);ctx.lineTo(NODES[j].x,NODES[j].y);
          ctx.strokeStyle=`hsla(${(NODES[i].hue+NODES[j].hue)/2},100%,65%,${a})`;
          ctx.lineWidth=0.6;ctx.stroke();
        }
      }

      /* ─── 9. MOUSE: Magnetic probe — completely new design ─── */
      if(M.x>0){
        const cx=M.x, cy=M.y;
        const spd=Math.hypot(M.vx,M.vy);
        const hot=spd>1.5;

        // Stacked expanding halos — magnetic field lines
        [120,75,42].forEach((r,i)=>{
          const phase=T*(1.2+i*0.5)+i;
          const a=(0.08-i*0.022)*(0.6+0.4*Math.sin(phase));
          ctx.beginPath();ctx.arc(cx,cy,r*(1+0.04*Math.sin(phase)),0,Math.PI*2);
          ctx.strokeStyle=`hsla(${270+i*20},100%,68%,${a})`;
          ctx.lineWidth=0.8;ctx.stroke();
        });

        // Violet soft bloom
        const bloom=ctx.createRadialGradient(cx,cy,0,cx,cy,80);
        bloom.addColorStop(0,vi(0.16+0.06*Math.sin(T*3.5)));
        bloom.addColorStop(0.5,vi(0.04));
        bloom.addColorStop(1,"transparent");
        ctx.fillStyle=bloom;ctx.beginPath();ctx.arc(cx,cy,80,0,Math.PI*2);ctx.fill();

        // Hot centre — magenta when moving
        const coreCol=hot?mg(0.9):vi(0.7);
        ctx.save();
        ctx.shadowBlur=hot?20:12;
        ctx.shadowColor=hot?mg(1):vi(0.9);
        ctx.beginPath();ctx.arc(cx,cy,hot?5:3.5,0,Math.PI*2);
        ctx.fillStyle=coreCol;ctx.fill();
        ctx.shadowBlur=0;ctx.restore();

        // 6 radiating probe arms — extend with speed
        const armCount=6;
        for(let i=0;i<armCount;i++){
          const angle=(i/armCount)*Math.PI*2 + T*0.8;
          const len=18+spd*2.5+8*Math.sin(T*2+i);
          const x1=cx+Math.cos(angle)*8;
          const y1=cy+Math.sin(angle)*8;
          const x2=cx+Math.cos(angle)*(8+len);
          const y2=cy+Math.sin(angle)*(8+len);
          const hue=270+i*12;
          ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
          ctx.strokeStyle=`hsla(${hue},100%,70%,${hot?0.85:0.50})`;
          ctx.lineWidth=hot?1.5:1;ctx.stroke();
          // Tip dot
          ctx.beginPath();ctx.arc(x2,y2,hot?2.2:1.4,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},100%,80%,${hot?0.9:0.55})`;ctx.fill();
        }

        // Magnetic field lines pulled toward nearest nodes
        let count=0;
        for(const n of NODES){
          const d=Math.hypot(cx-n.x,cy-n.y);
          if(d<200&&count<4){
            const a=(1-d/200)*0.45;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(n.x,n.y);
            ctx.strokeStyle=`hsla(${n.hue},100%,65%,${a*0.35})`;
            ctx.lineWidth=0.5;ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);
            count++;
          }
        }

        // Trail
        TRAIL.push({x:cx,y:cy,t:T});
        while(TRAIL.length&&T-TRAIL[0].t>0.45)TRAIL.shift();
        for(let i=1;i<TRAIL.length;i++){
          const age=(T-TRAIL[i].t)/0.45;
          ctx.beginPath();ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y);ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
          ctx.strokeStyle=mg((1-age)*0.38);ctx.lineWidth=(1-age)*1.8;ctx.stroke();
        }

        // HUD readout
        ctx.font="7px 'JetBrains Mono',monospace";
        ctx.fillStyle=hot?mg(0.75):vi(0.60);
        ctx.fillText(`${String(Math.floor(cx)).padStart(4,"0")} : ${String(Math.floor(cy)).padStart(4,"0")}`,cx+55,cy+2);
        ctx.fillStyle=hot?mg(0.60):vi(0.42);
        ctx.fillText(hot?"◉ SCANNING":"◎ STANDBY",cx+55,cy+14);
      }

      /* ─── 10. Click burst from cursor ─── */
      if(M.click&&M.x>0){
        for(let i=0;i<5;i++)
          BURSTS.push({x:M.x,y:M.y,r:4,maxR:100+i*32,a:0.95-i*0.15,hue:270+i*12});
        for(let i=0;i<20;i++){
          const a=Math.random()*Math.PI*2, s=2.5+Math.random()*6;
          MOTES.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:40+Math.random()*50,hue:265+Math.random()*65});
        }
      }
      for(let i=BURSTS.length-1;i>=0;i--){
        const b=BURSTS[i];b.r+=4;b.a*=0.888;
        if(b.r>b.maxR||b.a<0.01){BURSTS.splice(i,1);continue;}
        ctx.save();ctx.shadowBlur=14;ctx.shadowColor=`hsla(${b.hue},100%,72%,0.85)`;
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${b.hue},100%,75%,${b.a})`;ctx.lineWidth=2.2;ctx.stroke();ctx.restore();
      }
      for(let i=MOTES.length-1;i>=0;i--){
        const m=MOTES[i];m.x+=m.vx;m.y+=m.vy;m.vx*=0.958;m.vy*=0.958;m.life++;
        if(m.life>=m.ml){MOTES.splice(i,1);continue;}
        const p=m.life/m.ml,a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath();ctx.arc(m.x,m.y,2.8*(1-p*0.45),0,Math.PI*2);
        ctx.fillStyle=`hsla(${m.hue},100%,75%,${a*0.9})`;ctx.fill();
      }

      /* ─── 11. Corner brackets with hue offset ─── */
      [[12,12,1,1],[W-12,12,-1,1],[W-12,H-12,-1,-1],[12,H-12,1,-1]].forEach(([x,y,sx,sy],i)=>{
        const hue=270+i*18,s=22;
        ctx.strokeStyle=`hsla(${hue},100%,62%,0.42)`;ctx.lineWidth=1.4;
        ctx.beginPath();ctx.moveTo(x+sx*s,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*s);ctx.stroke();
        const pa=0.42+0.42*Math.sin(T*1.5+i);
        ctx.save();ctx.shadowBlur=7;ctx.shadowColor=`hsla(${hue},100%,70%,0.8)`;
        ctx.beginPath();ctx.arc(x,y,2.8,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,76%,${pa})`;ctx.fill();
        ctx.shadowBlur=0;ctx.restore();
      });

      /* ─── 12. Bottom strip ─── */
      const strip=ctx.createLinearGradient(0,H-20,0,H);
      strip.addColorStop(0,"rgba(16,0,40,0)");strip.addColorStop(1,"rgba(16,0,40,0.65)");
      ctx.fillStyle=strip;ctx.fillRect(0,H-20,W,20);
      ctx.font="7px 'Orbitron',monospace";ctx.textAlign="center";
      ctx.fillStyle=vi(0.32);
      ctx.fillText(`NEURAL BIOMETRIC INTERFACE  •  ${new Date().toLocaleTimeString()}  •  ${NODES.length} NODES`,W/2,H-5);

      /* ─── 13. Scan line ─── */
      const sY=((T*0.023)%1)*H;
      const sl=ctx.createLinearGradient(0,sY-1.5,0,sY+1.5);
      sl.addColorStop(0,"transparent");sl.addColorStop(0.5,vi(0.022));sl.addColorStop(1,"transparent");
      ctx.fillStyle=sl;ctx.fillRect(0,sY-1.5,W,3);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    init();
    ctx.fillStyle="#06001a";ctx.fillRect(0,0,canvas.width,canvas.height);
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
