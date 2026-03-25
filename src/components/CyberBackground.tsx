import React, { useEffect, useRef } from "react";

/*
  BIMS — Biometric Background
  
  Design: The eye image is cropped to a perfect circle (the iris/pupil area only),
  sitting at screen centre like a glowing portal.
  Everything else — circuit lines, nodes, scanners — live in the void AROUND it.
  The eye is NEVER obscured.
*/
export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let T = 0, raf = 0;
    const M = { x:-999, y:-999, px:-999, py:-999, down:false };
    const SM = { x:-999, y:-999 };
    const RINGS: any[] = [], SPARKS: any[] = [];
    let nodes: any[] = [], motes: any[] = [];
    // Circuit lines as segments stored globally
    let circuits: any[] = [];

    const onMove  = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; };
    const onDown  = () => { M.down=true; setTimeout(()=>M.down=false,250); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    const onRz    = () => { canvas.width=innerWidth; canvas.height=innerHeight; init(); };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onRz);

    const EYE = new Image(); let eyeOK = false;
    EYE.onload = () => eyeOK = true;
    EYE.src = "/eye2.jpg";

    // Eye portal radius — clean circle showing only the iris
    let ER = 0; // set in init based on screen size

    function init() {
      const W = canvas.width, H = canvas.height;
      const CX = W/2, CY = H/2;
      ER = Math.min(W, H) * 0.23; // portal radius — not too big, gives room for art

      // Scattered nodes — AVOID the eye circle
      nodes = [];
      let attempts = 0;
      while (nodes.length < 52 && attempts < 2000) {
        attempts++;
        const nx = 20 + Math.random()*(W-40);
        const ny = 20 + Math.random()*(H-40);
        const d = Math.hypot(nx-CX, ny-CY);
        if (d < ER*1.6) continue; // keep nodes outside eye+buffer
        const i = nodes.length;
        nodes.push({ x:nx, y:ny, ox:nx, oy:ny, vx:0, vy:0,
          r: i<8 ? 2.5+Math.random()*2 : 0.8+Math.random()*1.6,
          hue: [193,42,165,145,270][i%5], phase:Math.random()*Math.PI*2 });
      }

      // Circuit traces radiating FROM the eye outward — like veins
      circuits = [];
      const numTraces = 22;
      for (let t=0; t<numTraces; t++) {
        const startAngle = (t/numTraces)*Math.PI*2 + (Math.random()-.5)*.3;
        const startR = ER * 1.05; // start just outside eye
        const pts: any[] = [];
        let cx = CX + Math.cos(startAngle)*startR;
        let cy = CY + Math.sin(startAngle)*startR;
        pts.push({x:cx, y:cy});
        const segCount = 3 + Math.floor(Math.random()*4);
        for (let s=0; s<segCount; s++) {
          const maxStep = 80 + Math.random()*120;
          // Drift outward mostly
          const drift = startAngle + (Math.random()-.5)*.8;
          Math.random() > 0.5
            ? (cx += Math.cos(drift)*maxStep)
            : (cy += Math.sin(drift)*maxStep);
          cx = Math.max(10, Math.min(W-10, cx));
          cy = Math.max(10, Math.min(H-10, cy));
          pts.push({x:cx, y:cy});
        }
        circuits.push({
          pts,
          hue: [193,42,165,270,145][t%5],
          alpha: .06+Math.random()*.10,
          flow: Math.random()
        });
      }

      // Motes — also kept outside eye zone
      motes = [];
      while (motes.length < 55) {
        const mx = Math.random()*W, my = Math.random()*H;
        if (Math.hypot(mx-CX, my-CY) < ER*1.3) continue;
        motes.push({x:mx, y:my, vx:(Math.random()-.5)*.16, vy:(Math.random()-.5)*.14,
          r:.3+Math.random()*1.2, life:Math.random()*Math.PI*2, gold:Math.random()<.22});
      }
    }

    function drawEyePortal(W:number, H:number) {
      const CX=W/2, CY=H/2;

      // === DEEP OUTER GLOW — atmospheric cyan corona ===
      for (let layer=3; layer>=0; layer--) {
        const lr = ER*(1.0 + layer*0.45);
        const la = [0.25, 0.14, 0.07, 0.03][layer];
        const grad = ctx.createRadialGradient(CX,CY,ER*.85,CX,CY,lr);
        grad.addColorStop(0, `rgba(0,150,255,${la})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle=grad;
        ctx.fillRect(0,0,W,H);
      }

      if (!eyeOK) return;

      // === DRAW EYE — cropped to perfect circle (the iris only) ===
      // The eye image: iris is centred in the image.
      // We crop from the centre of the image to show only the iris/pupil.
      const imgW = EYE.width, imgH = EYE.height;
      // Sample from centre of image — the iris takes about 70% of image height
      const cropR = imgH * 0.5; // use the full height as crop radius
      const sx = imgW/2 - cropR, sy = imgH/2 - cropR;
      const sSize = cropR*2;

      ctx.save();
      // Perfect circle clip
      ctx.beginPath(); ctx.arc(CX, CY, ER, 0, Math.PI*2); ctx.clip();
      // Draw image — zoom in so only iris fills the circle
      const scale = (ER*2) / sSize;
      ctx.globalAlpha = 0.94;
      ctx.drawImage(EYE, sx, sy, sSize, sSize,
        CX-ER, CY-ER, ER*2, ER*2);
      ctx.globalAlpha = 1;
      // NO vignette inside — we want the eye crystal clear
      ctx.restore();

      // === BRIGHT CYAN RIM — like the eye is lit from within ===
      const rimPulse = 0.5 + 0.5*Math.sin(T*0.7);
      ctx.save();
      ctx.shadowBlur = 32 + 14*rimPulse;
      ctx.shadowColor = `rgba(0,200,255,${0.90+0.08*rimPulse})`;
      ctx.strokeStyle = `rgba(0,215,255,${0.55+0.28*rimPulse})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.arc(CX,CY,ER,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // Thin outer ring
      ctx.beginPath(); ctx.arc(CX,CY,ER+5,0,Math.PI*2);
      ctx.strokeStyle=`rgba(0,180,255,${0.12+0.08*rimPulse})`;
      ctx.lineWidth=1; ctx.stroke();
    }

    function drawScanners(W:number, H:number) {
      const CX=W/2, CY=H/2;
      const T1=T;
      const sa1 = (T1*0.55)%(Math.PI*2); // scanner 1 angle
      const sa2 = -(T1*0.38)%(Math.PI*2); // scanner 2 counter

      // === SCANNER 1 — cyan, orbits just outside eye ===
      const orb1 = ER*1.22;
      ctx.save();
      ctx.shadowBlur=18; ctx.shadowColor="rgba(0,255,160,1)";
      ctx.strokeStyle="rgba(0,255,160,.75)"; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.arc(CX,CY,orb1, sa1, sa1+Math.PI*.55);
      ctx.stroke();
      // Bright cap at leading edge
      ctx.shadowBlur=24; ctx.shadowColor="rgba(0,255,160,1)";
      ctx.beginPath(); ctx.arc(
        CX+Math.cos(sa1)*orb1, CY+Math.sin(sa1)*orb1, 5.5, 0, Math.PI*2);
      ctx.fillStyle="rgba(0,255,160,1)"; ctx.fill();
      ctx.shadowBlur=0; ctx.restore();

      // === SCANNER 2 — blue, slightly wider orbit ===
      const orb2 = ER*1.42;
      ctx.save();
      ctx.shadowBlur=14; ctx.shadowColor="rgba(60,160,255,.9)";
      ctx.strokeStyle="rgba(60,160,255,.55)"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(CX,CY,orb2, sa2, sa2+Math.PI*.38);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(
        CX+Math.cos(sa2)*orb2, CY+Math.sin(sa2)*orb2, 3.5, 0, Math.PI*2);
      ctx.fillStyle="rgba(80,180,255,.9)"; ctx.fill();
      ctx.shadowBlur=0; ctx.restore();

      // === DASHED ORBIT RING — shows the orbit path ===
      ctx.save();
      ctx.setLineDash([4,8]);
      ctx.strokeStyle="rgba(0,180,255,0.10)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(CX,CY,orb1,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle="rgba(60,140,255,0.07)"; ctx.lineWidth=.8;
      ctx.beginPath(); ctx.arc(CX,CY,orb2,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // === PULSE RINGS — expand from iris outward ===
      for(let i=0;i<4;i++){
        const ph=((T*.28+i*1.6)%(Math.PI*2));
        const pr=ER*(1.0+.5*(ph/(Math.PI*2)));
        const pa=Math.max(0,.22*(1-ph/(Math.PI*2)));
        ctx.beginPath(); ctx.arc(CX,CY,pr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,175,255,${pa})`; ctx.lineWidth=.8; ctx.stroke();
      }

      // === HUD TICK MARKS around the outer orbit — like a clock ===
      const tickR = orb2*1.08;
      for(let i=0;i<24;i++){
        const ang=(i/24)*Math.PI*2;
        const isMain=i%6===0, isSub=i%3===0;
        const inner=tickR*(isMain?.88:isSub?.92:.95);
        const outer=tickR;
        const bright=isMain?.55:isSub?.30:.15;
        ctx.beginPath();
        ctx.moveTo(CX+Math.cos(ang)*inner, CY+Math.sin(ang)*inner);
        ctx.lineTo(CX+Math.cos(ang)*outer, CY+Math.sin(ang)*outer);
        ctx.strokeStyle=`rgba(0,180,255,${bright})`; ctx.lineWidth=isMain?1.5:.8; ctx.stroke();
      }

      // === 4 FLOATING HUD PANELS — at corners of eye, wired to it ===
      const panels=[
        { ang:-Math.PI*.22, r:ER*2.1, label:"RETINA SCAN", val:`${Math.floor(94+4*Math.abs(Math.sin(T*.4)))}%` },
        { ang: Math.PI*.22, r:ER*2.1, label:"IRIS DEPTH",  val:`${Math.floor(99-3*Math.abs(Math.sin(T*.55)))}%` },
        { ang:-Math.PI*.78, r:ER*2.1, label:"NEURAL MAP",  val:`${Math.floor(88+7*Math.abs(Math.sin(T*.32)))}%` },
        { ang: Math.PI*.78, r:ER*2.1, label:"VASCULAR",    val:`${Math.floor(92+5*Math.abs(Math.sin(T*.48)))}%` },
      ];

      panels.forEach(({ang, r, label, val})=>{
        const px=CX+Math.cos(ang)*r, py=CY+Math.sin(ang)*r;
        const pa=0.30+0.20*Math.sin(T*1.4+ang);

        // Wire from eye rim to panel
        ctx.beginPath();
        ctx.moveTo(CX+Math.cos(ang)*ER*1.02, CY+Math.sin(ang)*ER*1.02);
        ctx.lineTo(px, py);
        ctx.strokeStyle=`rgba(0,190,255,${pa*.6})`; ctx.lineWidth=.7;
        ctx.setLineDash([3,6]); ctx.stroke(); ctx.setLineDash([]);

        // Panel box
        const bw=88, bh=22;
        ctx.save();
        ctx.shadowBlur=10; ctx.shadowColor=`rgba(0,200,255,${pa*.8})`;
        ctx.strokeStyle=`rgba(0,200,255,${pa})`;
        ctx.lineWidth=1;
        ctx.strokeRect(px-bw/2, py-bh/2, bw, bh);
        ctx.shadowBlur=0; ctx.restore();
        ctx.fillStyle=`rgba(0,8,20,${.75})`;
        ctx.fillRect(px-bw/2+.5, py-bh/2+.5, bw-1, bh-1);

        // Panel text
        ctx.font=`bold 7px 'Orbitron','Courier New',monospace`;
        ctx.textAlign="center"; ctx.fillStyle=`rgba(0,220,255,${pa+.2})`;
        ctx.fillText(label, px, py-3);
        ctx.font=`bold 8px 'Orbitron','Courier New',monospace`;
        ctx.fillStyle=`rgba(0,255,160,${pa+.3})`;
        ctx.fillText(val, px, py+9);
      });

      // === TOP LABEL — floating above the eye ===
      const lp=0.5+0.5*Math.sin(T*2.5);
      ctx.font="bold 12px 'Orbitron','Courier New',monospace";
      ctx.textAlign="center";
      ctx.save(); ctx.shadowBlur=12; ctx.shadowColor="rgba(0,255,160,.8)";
      ctx.fillStyle=`rgba(0,255,160,${.7+.25*lp})`;
      ctx.fillText("● IRIS BIOMETRIC ACTIVE", CX, CY-ER*1.62);
      ctx.shadowBlur=0; ctx.restore();
      ctx.font="7.5px 'Courier New',monospace";
      ctx.fillStyle=`rgba(0,200,255,${.5+.2*lp})`;
      ctx.fillText(`IDENTITY CONFIRMED  ·  MATCH ${Math.floor(89+8*Math.abs(Math.sin(T*.4)))}%  ·  SECURE`, CX, CY-ER*1.44);
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      // 1. Absolute void
      ctx.fillStyle="#000913"; ctx.fillRect(0,0,W,H);

      // 2. Very subtle deep blue ambient behind eye area
      const deep=ctx.createRadialGradient(CX,CY,0,CX,CY,W*.65);
      deep.addColorStop(0,"rgba(0,15,45,.55)");
      deep.addColorStop(.4,"rgba(0,8,25,.20)");
      deep.addColorStop(1,"transparent");
      ctx.fillStyle=deep; ctx.fillRect(0,0,W,H);

      // 3. Motes
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.006;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0;
        if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a=.18+.16*Math.sin(m.life);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
        ctx.fillStyle=m.gold?`rgba(255,190,30,${a*.55})`:`rgba(0,195,255,${a*.32})`; ctx.fill();
      }

      // 4. Circuit traces (radiating from eye, NO cursor interaction)
      for(const tr of circuits){
        tr.flow=(tr.flow+.0018)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`; ctx.lineWidth=.6; ctx.stroke();
        for(const p of tr.pts){
          ctx.beginPath(); ctx.arc(p.x,p.y,1.1,0,Math.PI*2);
          ctx.fillStyle=`hsla(${tr.hue},100%,68%,${tr.alpha*1.8})`; ctx.fill();
        }
        // Photon
        const tot=tr.pts.slice(1).reduce((a,p,i)=>a+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let tgt=tr.flow*tot,wlk=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(wlk+seg>=tgt){
            const t2=(tgt-wlk)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=`hsla(${tr.hue},100%,82%,1)`;
            ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,88%,.92)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          } wlk+=seg;
        }
      }

      // 5. Fine dot grid — very subtle
      for(let gx=0;gx<W;gx+=46)for(let gy=0;gy<H;gy+=46){
        const d=Math.hypot(gx-CX,gy-CY);
        if(d<ER*1.5)continue; // skip near eye
        const a=.016+.012*Math.sin(T*.4+gx*.04+gy*.03);
        ctx.beginPath(); ctx.arc(gx,gy,.6,0,Math.PI*2);
        ctx.fillStyle=`hsla(210,100%,65%,${a})`; ctx.fill();
      }

      // 6. Nodes — pulled by cursor, scattered in void
      for(const n of nodes){
        n.phase+=.012;
        const pulse=.5+.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x,dy=M.y-n.y,d=Math.hypot(dx,dy);
          // Don't let nodes drift INTO the eye area
          const ndCX=Math.hypot(n.x-CX,n.y-CY);
          if(d<170&&d>.5&&ndCX>ER*1.55){const f=.016*(1-d/170);n.vx+=dx/d*f;n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*.014; n.vy+=(n.oy-n.y)*.014;
        n.vx*=.87; n.vy*=.87; n.x+=n.vx; n.y+=n.vy;
        // Keep outside eye buffer
        const dC=Math.hypot(n.x-CX,n.y-CY);
        if(dC<ER*1.45){const ang=Math.atan2(n.y-CY,n.x-CX);n.x=CX+Math.cos(ang)*ER*1.46;n.y=CY+Math.sin(ang)*ER*1.46;n.vx*=-.3;n.vy*=-.3;}
        ctx.save(); ctx.shadowBlur=n.r>2?9:4; ctx.shadowColor=`hsla(${n.hue},100%,70%,.75)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(.85+.15*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,72%,${.32+.32*pulse})`; ctx.lineWidth=n.r>2?1.2:.85; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      // Node connections
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
        if(d>115)continue;
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(0,185,255,${(1-d/115)*.07})`; ctx.lineWidth=.45; ctx.stroke();
      }

      // 7. THE EYE PORTAL — drawn here so it's above the background but below HUD
      drawEyePortal(W,H);

      // 8. SCANNERS + HUD — orbiting the eye
      drawScanners(W,H);

      // 9. Global scan line
      const gsY=((T*.015)%1)*H;
      const gsl=ctx.createLinearGradient(0,gsY-1,0,gsY+1);
      gsl.addColorStop(0,"transparent"); gsl.addColorStop(.5,"rgba(0,185,255,.009)"); gsl.addColorStop(1,"transparent");
      ctx.fillStyle=gsl; ctx.fillRect(0,gsY-1,W,2);

      // 10. Corner brackets
      [[18,18,1,1],[W-18,18,-1,1],[W-18,H-18,-1,-1],[18,H-18,1,-1]].forEach(([cx,cy,sx,sy]:any,i)=>{
        const hue=i%2===0?193:42, sz=18;
        ctx.strokeStyle=`hsla(${hue},100%,62%,.20)`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(cx+sx*sz,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*sz); ctx.stroke();
        const pa=.20+.18*Math.sin(T*1.4+i);
        ctx.save(); ctx.shadowBlur=5; ctx.shadowColor=`hsla(${hue},100%,72%,.8)`;
        ctx.beginPath(); ctx.arc(cx,cy,2.2,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,76%,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      // 11. MOUSE — precision reticle
      if(M.x>0){
        SM.x=SM.x<0?M.x:SM.x+(M.x-SM.x)*.09;
        SM.y=SM.y<0?M.y:SM.y+(M.y-SM.y)*.09;
        const cx=SM.x, cy=SM.y;
        const spd=Math.hypot(M.x-M.px,M.y-M.py), hot=spd>1.8;
        const onEye=Math.hypot(cx-CX,cy-CY)<ER;
        const col=(a:number)=>onEye?`rgba(0,255,180,${a})`:`rgba(0,195,255,${a})`;

        // Bloom
        const bl=ctx.createRadialGradient(cx,cy,0,cx,cy,46);
        bl.addColorStop(0,col(hot?.20:.10)); bl.addColorStop(1,"transparent");
        ctx.fillStyle=bl; ctx.beginPath(); ctx.arc(cx,cy,46,0,Math.PI*2); ctx.fill();

        // Outer rotating arc (3/4 open)
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*2.1+spd*.05);
        ctx.beginPath(); ctx.arc(0,0,27,0,Math.PI*1.6);
        ctx.strokeStyle=col(.62+.20*Math.sin(T*2.5)); ctx.lineWidth=1.9; ctx.stroke();
        const ec=Math.PI*1.6;
        ctx.save(); ctx.shadowBlur=7; ctx.shadowColor=col(1);
        ctx.beginPath(); ctx.arc(Math.cos(ec)*27,Math.sin(ec)*27,2.4,0,Math.PI*2);
        ctx.fillStyle=col(.95); ctx.fill(); ctx.shadowBlur=0; ctx.restore();
        ctx.restore();

        // Inner counter-arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*1.5);
        ctx.beginPath(); ctx.arc(0,0,17,Math.PI*.2,Math.PI*1.8);
        ctx.strokeStyle=col(.38+.18*Math.sin(T*3.1)); ctx.lineWidth=1; ctx.stroke();
        ctx.restore();

        // Diamond
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=col(.85);
        ctx.strokeStyle=col(.74); ctx.lineWidth=1.3;
        ctx.beginPath();
        ctx.moveTo(cx,cy-10); ctx.lineTo(cx+6,cy); ctx.lineTo(cx,cy+10); ctx.lineTo(cx-6,cy);
        ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

        // Centre dot
        ctx.save(); ctx.shadowBlur=hot?20:10; ctx.shadowColor=hot?"rgba(0,255,180,1)":col(.9);
        ctx.beginPath(); ctx.arc(cx,cy,hot?4:2.6,0,Math.PI*2);
        ctx.fillStyle=hot?"rgba(0,255,180,1)":"rgba(195,240,255,.97)"; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        // 4 tick marks
        ctx.strokeStyle=col(hot?.88:.54); ctx.lineWidth=hot?1.6:1.05;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          ctx.beginPath();
          ctx.moveTo(cx+dx*6,cy+dy*6); ctx.lineTo(cx+dx*17,cy+dy*17); ctx.stroke();
        });

        // HUD text
        if(hot){
          ctx.font="6.5px 'Courier New',monospace"; ctx.textAlign="left";
          ctx.fillStyle=col(.72);
          ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+40,cy-2);
          ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+40,cy+10);
          ctx.fillStyle=col(.45);
          ctx.fillText(onEye?"● IRIS LOCK":"● TRACKING",cx+40,cy+24);
        }
      }

      // 12. Click effects
      if(M.down&&M.x>0){
        for(let i=0;i<5;i++) RINGS.push({x:M.x,y:M.y,r:4,max:72+i*28,a:.92-i*.16,hue:193+i*18});
        for(let i=0;i<20;i++){
          const a=Math.random()*Math.PI*2,s=1.5+Math.random()*5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:28+Math.random()*44,hue:[193,42,145,210,165][i%5]});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=3.6; r.a*=.90;
        if(r.r>r.max||r.a<.01){RINGS.splice(i,1);continue;}
        ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=`hsla(${r.hue},100%,72%,.8)`;
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${r.hue},100%,72%,${r.a})`; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=.95; s.vy*=.95; s.age++;
        if(s.age>=s.life){SPARKS.splice(i,1);continue;}
        const p=s.age/s.life,a=p<.2?p/.2:1-(p-.2)/.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.2*(1-p*.5),0,Math.PI*2);
        ctx.fillStyle=`hsla(${s.hue},100%,72%,${a*.9})`; ctx.fill();
      }

      raf=requestAnimationFrame(draw);
    }

    canvas.width=innerWidth; canvas.height=innerHeight;
    init();
    raf=requestAnimationFrame(draw);
    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mousedown",onDown);
      window.removeEventListener("mouseleave",onLeave);
      window.removeEventListener("resize",onRz);
    };
  },[]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:-1}} aria-hidden>
      <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
