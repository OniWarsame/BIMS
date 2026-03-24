import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const x = c.getContext("2d")!;
    let raf = 0, T = 0;
    const M = { x: -999, y: -999, px: -999, py: -999, down: false };
    const SM = { x: -999, y: -999 };
    const RINGS: any[] = [], SPARKS: any[] = [];

    const mv = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; };
    const md = () => { M.down=true; setTimeout(()=>M.down=false,220); };
    const ml = () => { M.x=-999; M.y=-999; };
    const rz = () => { c.width=innerWidth; c.height=innerHeight; init(); };
    window.addEventListener("mousemove",mv,{passive:true});
    window.addEventListener("mousedown",md);
    window.addEventListener("mouseleave",ml);
    window.addEventListener("resize",rz);

    // Load the fingerprint image
    const IMG = new Image();
    let imgOK = false;
    IMG.onload = () => imgOK = true;
    IMG.src = "/fb.jpg";

    // State
    let nodes: any[] = [], traces: any[] = [], motes: any[] = [];
    let dnaT = 0, scanY = 0, scanPulse = 0;

    function init() {
      const W=c.width, H=c.height;
      // Nodes scattered everywhere
      nodes = Array.from({length:55},(_,i)=>{
        const x=30+Math.random()*(W-60), y=30+Math.random()*(H-60);
        return {x,y,ox:x,oy:y,vx:0,vy:0,
          r:i<10?3+Math.random()*2.5:1+Math.random()*2,
          hue:[193,42,165,145,270][i%5],
          phase:Math.random()*Math.PI*2};
      });
      // Circuit traces
      traces = Array.from({length:40},()=>{
        const pts:any[]=[];
        let px=Math.random()*W, py=Math.random()*H;
        pts.push({x:px,y:py});
        for(let s=0;s<2+Math.floor(Math.random()*5);s++){
          Math.random()>.5?(px+=(Math.random()-.5)*200):(py+=(Math.random()-.5)*160);
          pts.push({x:Math.max(0,Math.min(W,px)),y:Math.max(0,Math.min(H,py))});
        }
        return {pts,hue:[193,42,165,270,145][Math.floor(Math.random()*5)],
          alpha:.05+Math.random()*.1,flow:Math.random()};
      });
      // Motes
      motes = Array.from({length:65},()=>({
        x:Math.random()*W,y:Math.random()*H,
        vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.15,
        r:.4+Math.random()*1.3,life:Math.random()*Math.PI*2,
        gold:Math.random()<.25
      }));
    }

    function draw() {
      T+=.016; dnaT+=.018;
      const W=c.width, H=c.height;
      const CX=W/2, CY=H/2;

      // ── 1. Deep void background ──
      x.fillStyle="#000814"; x.fillRect(0,0,W,H);

      // ── 2. The fingerprint image — centred, dramatic ──
      if(imgOK){
        // Draw it at 65% of viewport width, centred
        const iw=Math.min(W*.65,700), ih=iw*(IMG.height/IMG.width);
        const ix=CX-iw/2, iy=CY-ih/2;

        // Outer glow halo
        const halo=x.createRadialGradient(CX,CY,iw*.15,CX,CY,iw*.82);
        halo.addColorStop(0,"rgba(0,180,255,0.22)");
        halo.addColorStop(.5,"rgba(0,100,200,0.10)");
        halo.addColorStop(1,"transparent");
        x.fillStyle=halo;
        x.fillRect(ix-80,iy-80,iw+160,ih+160);

        // Draw image with multiply blend — enhances the cyan
        x.save();
        x.globalAlpha=0.72+0.12*Math.sin(T*.4);
        // Slight vignette clip
        x.beginPath(); x.roundRect(ix,iy,iw,ih,18); x.clip();
        x.drawImage(IMG,ix,iy,iw,ih);

        // Circuit-board overlay shimmer
        const shim=x.createLinearGradient(ix,iy,ix+iw,iy+ih);
        const phase=T*.3;
        shim.addColorStop(0,"transparent");
        shim.addColorStop(.4+.15*Math.sin(phase),"rgba(0,200,255,0.06)");
        shim.addColorStop(.6+.15*Math.cos(phase),"rgba(255,180,20,0.04)");
        shim.addColorStop(1,"transparent");
        x.fillStyle=shim; x.fillRect(ix,iy,iw,ih);
        x.restore();

        // Border glow
        const bp=.5+.5*Math.sin(T*.7);
        x.save();
        x.shadowBlur=32+16*bp; x.shadowColor=`rgba(0,200,255,${.7+.2*bp})`;
        x.strokeStyle=`rgba(0,210,255,${.35+.25*bp})`;
        x.lineWidth=2;
        x.beginPath(); x.roundRect(ix,iy,iw,ih,18); x.stroke();
        x.shadowBlur=0; x.restore();

        // Scanning beam over the fingerprint
        scanY=(scanY+1.4)%(ih+20);
        const sy=iy-5+scanY;
        const sg=x.createLinearGradient(ix,sy-6,ix,sy+6);
        sg.addColorStop(0,"transparent");
        sg.addColorStop(.4,"rgba(0,255,160,0.55)");
        sg.addColorStop(.6,"rgba(0,255,160,0.55)");
        sg.addColorStop(1,"transparent");
        x.fillStyle=sg; x.fillRect(ix+2,sy-6,iw-4,12);

        // HUD brackets at corners
        const bx=ix, by=iy, bw=iw, bh=ih, bs=28;
        [[bx,by,1,1],[bx+bw,by,-1,1],[bx+bw,by+bh,-1,-1],[bx,by+bh,1,-1]].forEach(([px,py,sx,sy]:any)=>{
          x.save(); x.shadowBlur=12; x.shadowColor="rgba(0,220,255,1)";
          x.strokeStyle="rgba(0,220,255,0.95)"; x.lineWidth=2.5;
          x.beginPath(); x.moveTo(px+sx*bs,py); x.lineTo(px,py); x.lineTo(px,py+sy*bs); x.stroke();
          x.shadowBlur=0; x.restore();
        });

        // Corner dots
        [[bx,by],[bx+bw,by],[bx+bw,by+bh],[bx,by+bh]].forEach(([px,py],i)=>{
          const pa=.5+.5*Math.sin(T*2+i);
          x.save(); x.shadowBlur=10; x.shadowColor="rgba(0,220,255,.9)";
          x.beginPath(); x.arc(px,py,4,0,Math.PI*2);
          x.fillStyle=`rgba(0,220,255,${pa})`; x.fill();
          x.shadowBlur=0; x.restore();
        });

        // "SCANNING" label
        scanPulse=.5+.5*Math.sin(T*3);
        x.font="bold 11px 'Courier New',monospace";
        x.textAlign="left"; x.fillStyle=`rgba(0,255,140,${.6+.4*scanPulse})`;
        x.fillText("● BIOMETRIC SCAN ACTIVE",bx+8,by-12);
        x.textAlign="right";
        x.fillStyle="rgba(0,200,255,0.6)";
        const pct=Math.floor((scanY/(ih+20))*100);
        x.fillText(`${pct}%`,bx+bw-8,by-12);
      }

      // ── 3. Ambient radial glow ──
      const amb=x.createRadialGradient(CX,CY,0,CX,CY,W*.8);
      amb.addColorStop(0,"rgba(0,20,55,.35)");
      amb.addColorStop(.5,"rgba(0,10,35,.15)");
      amb.addColorStop(1,"transparent");
      x.fillStyle=amb; x.fillRect(0,0,W,H);

      // ── 4. Floating motes ──
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.007;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0;
        if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a=.22+.22*Math.sin(m.life);
        x.beginPath(); x.arc(m.x,m.y,m.r,0,Math.PI*2);
        x.fillStyle=m.gold?`rgba(255,190,30,${a*.6})`:`rgba(0,200,255,${a*.35})`; x.fill();
      }

      // ── 5. Circuit traces with photons ──
      for(const tr of traces){
        tr.flow=(tr.flow+.0025)%1;
        x.beginPath(); x.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) x.lineTo(tr.pts[i].x,tr.pts[i].y);
        x.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`; x.lineWidth=.6; x.stroke();
        // Junction dots
        for(const p of tr.pts){
          x.beginPath(); x.arc(p.x,p.y,1.2,0,Math.PI*2);
          x.fillStyle=`hsla(${tr.hue},100%,70%,${tr.alpha*1.6})`; x.fill();
        }
        // Photon travelling along trace
        const total=tr.pts.slice(1).reduce((a,p,i)=>a+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let tgt=tr.flow*total,walked=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(walked+seg>=tgt){
            const t2=(tgt-walked)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            x.save(); x.shadowBlur=10; x.shadowColor=`hsla(${tr.hue},100%,80%,1)`;
            x.beginPath(); x.arc(px,py,2.2,0,Math.PI*2);
            x.fillStyle=`hsla(${tr.hue},100%,90%,.95)`; x.fill();
            x.shadowBlur=0; x.restore(); break;
          }
          walked+=seg;
        }
      }

      // ── 6. Dot grid ──
      for(let gx=0;gx<W;gx+=44)for(let gy=0;gy<H;gy+=44){
        const a=.022+.016*Math.sin(T*.4+gx*.04+gy*.03);
        x.beginPath(); x.arc(gx,gy,.65,0,Math.PI*2);
        x.fillStyle=`hsla(193,100%,62%,${a})`; x.fill();
      }

      // ── 7. Magnetic nodes (pulled by cursor) ──
      for(const n of nodes){
        n.phase+=.012;
        const pulse=.5+.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x,dy=M.y-n.y,d=Math.hypot(dx,dy);
          if(d<180&&d>.5){const f=.018*(1-d/180);n.vx+=dx/d*f;n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*.014; n.vy+=(n.oy-n.y)*.014;
        n.vx*=.86; n.vy*=.86; n.x+=n.vx; n.y+=n.vy;
        // Glow
        const g=x.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.5);
        g.addColorStop(0,`hsla(${n.hue},100%,65%,${pulse*.25})`); g.addColorStop(1,"transparent");
        x.fillStyle=g; x.beginPath(); x.arc(n.x,n.y,n.r*3.5,0,Math.PI*2); x.fill();
        x.save(); x.shadowBlur=n.r>2.5?12:6; x.shadowColor=`hsla(${n.hue},100%,72%,.9)`;
        x.beginPath(); x.arc(n.x,n.y,n.r*(.85+.15*pulse),0,Math.PI*2);
        x.strokeStyle=`hsla(${n.hue},100%,72%,${.42+.4*pulse})`; x.lineWidth=n.r>2.5?1.4:.9; x.stroke();
        x.shadowBlur=0; x.restore();
      }
      // Connections
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
        if(d>130)continue;
        x.beginPath(); x.moveTo(nodes[i].x,nodes[i].y); x.lineTo(nodes[j].x,nodes[j].y);
        x.strokeStyle=`rgba(0,200,255,${(1-d/130)*.08})`; x.lineWidth=.5; x.stroke();
      }

      // ── 8. Global scan line ──
      const gsY=((T*.018)%1)*H;
      const gsl=x.createLinearGradient(0,gsY-1,0,gsY+1);
      gsl.addColorStop(0,"transparent"); gsl.addColorStop(.5,"rgba(0,200,255,0.012)"); gsl.addColorStop(1,"transparent");
      x.fillStyle=gsl; x.fillRect(0,gsY-1,W,2);

      // ── 9. Corner HUD brackets ──
      const corners:any[]=[[16,16,1,1],[W-16,16,-1,1],[W-16,H-16,-1,-1],[16,H-16,1,-1]];
      corners.forEach(([cx,cy,sx,sy],i)=>{
        const hue=i%2===0?193:42,sz=22;
        x.strokeStyle=`hsla(${hue},100%,65%,.3)`; x.lineWidth=1.4;
        x.beginPath(); x.moveTo(cx+sx*sz,cy); x.lineTo(cx,cy); x.lineTo(cx,cy+sy*sz); x.stroke();
        const pa=.3+.3*Math.sin(T*1.5+i);
        x.save(); x.shadowBlur=8; x.shadowColor=`hsla(${hue},100%,72%,.8)`;
        x.beginPath(); x.arc(cx,cy,2.8,0,Math.PI*2);
        x.fillStyle=`hsla(${hue},100%,76%,${pa})`; x.fill();
        x.shadowBlur=0; x.restore();
      });

      // ── 10. Mouse cursor — precision biometric reticle ──
      if(M.x>0){
        SM.x=SM.x<0?M.x:SM.x+(M.x-SM.x)*.09;
        SM.y=SM.y<0?M.y:SM.y+(M.y-SM.y)*.09;
        const cx=SM.x,cy=SM.y;
        const spd=Math.hypot(M.x-M.px,M.y-M.py);
        const hot=spd>1.8;

        // Check if over fingerprint image
        let imgW=0,imgH=0,imgX=0,imgY=0;
        if(imgOK){
          imgW=Math.min(W*.65,700); imgH=imgW*(IMG.height/IMG.width);
          imgX=CX-imgW/2; imgY=CY-imgH/2;
        }
        const onImg=imgOK&&cx>=imgX&&cx<=imgX+imgW&&cy>=imgY&&cy<=imgY+imgH;
        const col=(a:number)=>onImg?`rgba(0,255,140,${a})`:`rgba(0,200,255,${a})`;
        const colH=(a:number)=>onImg?`rgba(0,255,140,${a})`:`rgba(255,180,30,${a})`;

        // Soft bloom
        const bl=x.createRadialGradient(cx,cy,0,cx,cy,50);
        bl.addColorStop(0,col(hot?.16:.08)); bl.addColorStop(1,"transparent");
        x.fillStyle=bl; x.beginPath(); x.arc(cx,cy,50,0,Math.PI*2); x.fill();

        // Outer arc rotating
        x.save(); x.translate(cx,cy); x.rotate(T*2+spd*.05);
        x.beginPath(); x.arc(0,0,28,0,Math.PI*1.55);
        x.strokeStyle=col(.58+.22*Math.sin(T*2.5)); x.lineWidth=1.8; x.stroke();
        // End cap dot
        x.save(); x.shadowBlur=6; x.shadowColor=col(1);
        const ec=Math.PI*1.55;
        x.beginPath(); x.arc(Math.cos(ec)*28,Math.sin(ec)*28,2.2,0,Math.PI*2);
        x.fillStyle=col(.9); x.fill(); x.shadowBlur=0; x.restore();
        x.restore();

        // Inner counter-arc
        x.save(); x.translate(cx,cy); x.rotate(-T*1.5);
        x.beginPath(); x.arc(0,0,18,Math.PI*.25,Math.PI*1.75);
        x.strokeStyle=col(.38+.18*Math.sin(T*3.2)); x.lineWidth=1.1; x.stroke();
        x.restore();

        // Diamond
        const ds=10;
        x.save(); x.shadowBlur=8; x.shadowColor=col(.8);
        x.strokeStyle=col(.72); x.lineWidth=1.3;
        x.beginPath();
        x.moveTo(cx,cy-ds); x.lineTo(cx+ds*.6,cy);
        x.lineTo(cx,cy+ds); x.lineTo(cx-ds*.6,cy);
        x.closePath(); x.stroke(); x.shadowBlur=0; x.restore();

        // Centre dot
        x.save(); x.shadowBlur=hot?18:10; x.shadowColor=hot?"rgba(0,255,140,1)":col(.9);
        x.beginPath(); x.arc(cx,cy,hot?4:2.8,0,Math.PI*2);
        x.fillStyle=hot?"rgba(0,255,140,.98)":"rgba(200,240,255,.96)"; x.fill();
        x.shadowBlur=0; x.restore();

        // 4 tick marks
        const arm=11,gap=6;
        x.strokeStyle=col(hot?.85:.55); x.lineWidth=hot?1.5:1.1;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          x.beginPath();
          x.moveTo(cx+dx*gap,cy+dy*gap);
          x.lineTo(cx+dx*(gap+arm),cy+dy*(gap+arm));
          x.stroke();
        });

        // When fast: HUD text + scan lines
        if(hot){
          x.font="6.5px 'Courier New',monospace"; x.textAlign="left";
          x.fillStyle=colH(.7);
          x.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+42,cy-3);
          x.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+42,cy+9);
          x.fillStyle=col(.45); x.fillText(onImg?"● SCANNING FP":"● TRACKING",cx+42,cy+22);
        }
      }

      // ── 11. Click effects ──
      if(M.down&&M.x>0){
        for(let i=0;i<5;i++) RINGS.push({x:M.x,y:M.y,r:4,max:70+i*30,a:.9-i*.16,hue:193+i*16});
        for(let i=0;i<20;i++){
          const a=Math.random()*Math.PI*2,s=1.5+Math.random()*5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:28+Math.random()*45,hue:[193,42,145,270,165][i%5]});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=3.8; r.a*=.89;
        if(r.r>r.max||r.a<.01){RINGS.splice(i,1);continue;}
        x.save(); x.shadowBlur=12; x.shadowColor=`hsla(${r.hue},100%,72%,.8)`;
        x.beginPath(); x.arc(r.x,r.y,r.r,0,Math.PI*2);
        x.strokeStyle=`hsla(${r.hue},100%,72%,${r.a})`; x.lineWidth=2; x.stroke();
        x.shadowBlur=0; x.restore();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=.95; s.vy*=.95; s.age++;
        if(s.age>=s.life){SPARKS.splice(i,1);continue;}
        const p=s.age/s.life,a=p<.2?p/.2:1-(p-.2)/.8;
        x.beginPath(); x.arc(s.x,s.y,2.3*(1-p*.5),0,Math.PI*2);
        x.fillStyle=`hsla(${s.hue},100%,72%,${a*.9})`; x.fill();
      }

      raf=requestAnimationFrame(draw);
    }

    c.width=innerWidth; c.height=innerHeight;
    init();
    raf=requestAnimationFrame(draw);
    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",mv);
      window.removeEventListener("mousedown",md);
      window.removeEventListener("mouseleave",ml);
      window.removeEventListener("resize",rz);
    };
  },[]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:-1}} aria-hidden>
      <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
