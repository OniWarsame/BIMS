import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, T = 0;
    const M = { x: -999, y: -999, px: -999, py: -999, down: false };
    const SM = { x: -999, y: -999 };
    const RINGS: any[] = [], SPARKS: any[] = [];

    const onMove  = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; };
    const onDown  = () => { M.down=true; setTimeout(()=>M.down=false,250); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    const onResize= () => { canvas.width=innerWidth; canvas.height=innerHeight; init(); };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    const EYE = new Image(); let eyeOK=false;
    EYE.onload = ()=>eyeOK=true;
    EYE.src = "/eye2.jpg";

    let nodes:any[]=[], traces:any[]=[], motes:any[]=[];
    let irisRot=0, scanA=0, eyeOffX=0, eyeOffY=0;
    // Pupil scanner state
    let pupilScanPct=0;

    function init() {
      const W=canvas.width, H=canvas.height;
      nodes = Array.from({length:48},(_,i)=>{
        const nx=30+Math.random()*(W-60), ny=30+Math.random()*(H-60);
        return {x:nx,y:ny,ox:nx,oy:ny,vx:0,vy:0,
          r:i<8?2.8+Math.random()*2:1+Math.random()*1.8,
          hue:[193,210,165,42,145][i%5],phase:Math.random()*Math.PI*2};
      });
      traces = Array.from({length:32},()=>{
        const pts:any[]=[]; let px=Math.random()*W, py=Math.random()*H;
        pts.push({x:px,y:py});
        for(let s=0;s<2+Math.floor(Math.random()*4);s++){
          Math.random()>.5?(px+=(Math.random()-.5)*180):(py+=(Math.random()-.5)*150);
          pts.push({x:Math.max(10,Math.min(W-10,px)),y:Math.max(10,Math.min(H-10,py))});
        }
        return {pts,hue:[193,42,165,210][Math.floor(Math.random()*4)],
          alpha:.04+Math.random()*.08,flow:Math.random()};
      });
      motes = Array.from({length:55},()=>({
        x:Math.random()*W,y:Math.random()*H,
        vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.13,
        r:.3+Math.random()*1.1,life:Math.random()*Math.PI*2,gold:Math.random()<.2
      }));
    }

    function drawEye(W:number,H:number) {
      if(!eyeOK) return;
      const CX=W/2, CY=H/2;

      // Eye fills most of the screen height — HUGE and dramatic
      const eh=Math.min(H*.82,720);
      const ew=eh*(EYE.width/EYE.height);
      const ex=CX-ew/2, ey=CY-eh/2;

      // Parallax — subtle, eye watches cursor
      if(M.x>0){
        eyeOffX += ((M.x-CX)/W*22-eyeOffX)*.03;
        eyeOffY += ((M.y-CY)/H*14-eyeOffY)*.03;
      }

      // ── Outer atmospheric halo (wide, very subtle) ──
      const halo=ctx.createRadialGradient(CX,CY,ew*.1,CX,CY,ew*.75);
      halo.addColorStop(0,`rgba(0,140,255,${.18+.06*Math.sin(T*.5)})`);
      halo.addColorStop(.5,"rgba(0,60,160,0.08)");
      halo.addColorStop(1,"transparent");
      ctx.fillStyle=halo; ctx.fillRect(0,0,W,H);

      // ── Draw eye image — full size, ellipse clipped ──
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(CX+eyeOffX*.3,CY+eyeOffY*.3,ew/2,eh/2,0,0,Math.PI*2);
      ctx.clip();
      ctx.globalAlpha=.88+.08*Math.sin(T*.38);
      ctx.drawImage(EYE,
        ex+eyeOffX*.55,ey+eyeOffY*.55,
        ew,eh);
      // Very light vignette at edges only
      const vig=ctx.createRadialGradient(CX,CY,ew*.3,CX,CY,ew*.52);
      vig.addColorStop(0,"transparent");
      vig.addColorStop(.75,"rgba(0,5,20,.04)");
      vig.addColorStop(1,"rgba(0,3,15,.65)");
      ctx.globalAlpha=1;
      ctx.fillStyle=vig; ctx.fillRect(ex,ey,ew,eh);
      ctx.restore();

      // ── Iris dimensions ──
      const irisR=Math.min(ew,eh)*.30;
      const pupilR=Math.min(ew,eh)*.095;

      // ── Rotating iris fiber lines (inside iris only, very subtle) ──
      irisRot+=.0016;
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,irisR*.97,0,Math.PI*2); ctx.clip();
      for(let i=0;i<56;i++){
        const ang=(i/56)*Math.PI*2+irisRot;
        const jit=Math.sin(T*.45+i*.72)*.04;
        ctx.beginPath();
        ctx.moveTo(CX+Math.cos(ang+jit)*pupilR*1.2,CY+Math.sin(ang+jit)*pupilR*1.2);
        ctx.lineTo(CX+Math.cos(ang)*irisR*.9,CY+Math.sin(ang)*irisR*.9);
        ctx.strokeStyle=`hsla(${i%5===0?42:193},100%,70%,${.03+.025*Math.sin(T*.5+i)})`;
        ctx.lineWidth=.45; ctx.stroke();
      }
      ctx.restore();

      // ── Scanning arc around iris (thin, doesn't obstruct) ──
      scanA=(scanA+.016)%(Math.PI*2);
      ctx.save();
      ctx.shadowBlur=12; ctx.shadowColor="rgba(0,255,160,.8)";
      ctx.strokeStyle="rgba(0,255,160,.65)"; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.arc(CX,CY,irisR*1.04,scanA,scanA+Math.PI*.55); ctx.stroke();
      // glowing tip
      ctx.beginPath(); ctx.arc(CX+Math.cos(scanA)*irisR*1.04,CY+Math.sin(scanA)*irisR*1.04,3.5,0,Math.PI*2);
      ctx.fillStyle="rgba(0,255,160,.9)"; ctx.fill();
      ctx.shadowBlur=0; ctx.restore();

      // Counter arc — blue, even thinner
      ctx.save();
      ctx.shadowBlur=8; ctx.shadowColor="rgba(80,180,255,.7)";
      ctx.strokeStyle="rgba(80,180,255,.45)"; ctx.lineWidth=1.1;
      ctx.beginPath(); ctx.arc(CX,CY,irisR*1.12,-scanA*.65,-scanA*.65+Math.PI*.38); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // Pulse rings
      for(let i=0;i<3;i++){
        const ph=((T*.32+i*2.09)%(Math.PI*2));
        const pr=irisR*(1.06+.25*(ph/(Math.PI*2)));
        const pa=Math.max(0,.16*(1-ph/(Math.PI*2)));
        ctx.beginPath(); ctx.arc(CX,CY,pr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,175,255,${pa})`; ctx.lineWidth=.75; ctx.stroke();
      }

      // ── Glowing eye border ──
      const bp=.5+.5*Math.sin(T*.68);
      ctx.save();
      ctx.shadowBlur=40+16*bp; ctx.shadowColor=`rgba(0,185,255,${.75+.18*bp})`;
      ctx.strokeStyle=`rgba(0,195,255,${.32+.22*bp})`; ctx.lineWidth=2.0;
      ctx.beginPath(); ctx.ellipse(CX,CY,ew/2,eh/2,0,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // ── ELEMENTS INSIDE THE EYE ──
      // These live inside the pupil / around the iris — matching the eye design

      // Inner pupil glow ring
      const pp=.5+.5*Math.sin(T*.9);
      ctx.save();
      ctx.shadowBlur=20+10*pp; ctx.shadowColor=`rgba(255,180,60,${.6+.3*pp})`;
      ctx.strokeStyle=`rgba(255,180,60,${.25+.18*pp})`; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.arc(CX,CY,pupilR*1.35,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // Pupil progress scanner (spins inside the pupil like a radar)
      pupilScanPct=(pupilScanPct+.022)%(Math.PI*2);
      ctx.save();
      ctx.shadowBlur=8; ctx.shadowColor="rgba(0,255,200,.9)";
      const gradScan=ctx.createConicalGradient
        ? null // Not standard — use arc instead
        : null;
      ctx.strokeStyle="rgba(0,255,200,.6)"; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(CX,CY);
      ctx.arc(CX,CY,pupilR*1.1,pupilScanPct,pupilScanPct+Math.PI*.35);
      ctx.closePath(); ctx.fillStyle="rgba(0,255,200,.08)"; ctx.fill(); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // ── Inside-iris HUD: text arcing around iris bottom ──
      ctx.save();
      ctx.font="bold 8.5px 'Courier New',monospace";
      const statusP=.5+.5*Math.sin(T*2.5);
      // Status text inside iris at bottom
      ctx.textAlign="center";
      ctx.fillStyle=`rgba(0,255,140,${.5+.4*statusP})`;
      ctx.fillText("● IRIS SCAN ACTIVE", CX, CY+irisR*.65);
      // Match percentage
      ctx.font="bold 11px 'Courier New',monospace";
      ctx.fillStyle=`rgba(255,200,80,${.6+.3*Math.sin(T*.7)})`;
      ctx.fillText(`${Math.floor(85+10*Math.abs(Math.sin(T*.38)))}%`, CX, CY+irisR*.82);

      // Data readout inside iris at top
      ctx.font="7px 'Courier New',monospace";
      ctx.fillStyle=`rgba(0,210,255,${.45+.2*Math.sin(T*1.5)})`;
      ctx.fillText("BIOMETRIC ID", CX, CY-irisR*.72);
      ctx.fillText("▼ MATCHING ▼", CX, CY-irisR*.58);
      ctx.restore();

      // ── Small animated data bars — inside iris left and right ──
      // Left of pupil (inside iris)
      const barData=["RET","VAS","DEP"];
      barData.forEach((lbl,i)=>{
        const bx=CX-irisR*.82, by=CY-12+(i*14);
        const blen=irisR*.28;
        const prog=(.4+.55*Math.abs(Math.sin(T*.3+i*.9)))*blen;
        ctx.font="5.5px 'Courier New',monospace";
        ctx.textAlign="right";
        ctx.fillStyle=`rgba(0,200,255,${.35+.2*Math.sin(T+i)})`;
        ctx.fillText(lbl,bx-3,by+4);
        ctx.fillStyle="rgba(0,40,80,.5)"; ctx.fillRect(bx,by,blen,2.5);
        const bg=ctx.createLinearGradient(bx,0,bx+prog,0);
        bg.addColorStop(0,"rgba(0,200,255,.7)"); bg.addColorStop(1,"rgba(0,255,160,.85)");
        ctx.fillStyle=bg; ctx.fillRect(bx,by,prog,2.5);
      });
      // Right of pupil
      const barData2=["NEU","TEM","REC"];
      barData2.forEach((lbl,i)=>{
        const bx=CX+irisR*.54, by=CY-12+(i*14);
        const blen=irisR*.28;
        const prog=(.35+.6*Math.abs(Math.sin(T*.28+i*.7+1)))*blen;
        ctx.font="5.5px 'Courier New',monospace";
        ctx.textAlign="left";
        ctx.fillStyle=`rgba(0,200,255,${.35+.2*Math.sin(T*1.1+i)})`;
        ctx.fillText(lbl,bx+blen+3,by+4);
        ctx.fillStyle="rgba(0,40,80,.5)"; ctx.fillRect(bx,by,blen,2.5);
        const bg=ctx.createLinearGradient(bx,0,bx+prog,0);
        bg.addColorStop(0,"rgba(0,200,255,.7)"); bg.addColorStop(1,"rgba(0,255,160,.85)");
        ctx.fillStyle=bg; ctx.fillRect(bx,by,prog,2.5);
      });

      // ── Thin corner marks at eye edges (just corners, minimal) ──
      const cs=24;
      [[ex,ey,1,1],[ex+ew,ey,-1,1],[ex+ew,ey+eh,-1,-1],[ex,ey+eh,1,-1]].forEach(([bx,by,sx,sy]:any)=>{
        ctx.save();
        ctx.shadowBlur=10; ctx.shadowColor="rgba(0,210,255,.8)";
        ctx.strokeStyle="rgba(0,210,255,.65)"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(bx+sx*cs,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*cs); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      });
    }

    function draw(){
      T+=.016;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      // Deep void
      ctx.fillStyle="#000810"; ctx.fillRect(0,0,W,H);

      // Gentle radial glow at centre
      const amb=ctx.createRadialGradient(CX,CY,0,CX,CY,W*.65);
      amb.addColorStop(0,"rgba(0,25,70,.38)");
      amb.addColorStop(.4,"rgba(0,12,40,.14)");
      amb.addColorStop(1,"transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      // Motes (sparse, outside the eye area)
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.006;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0; if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a=.16+.16*Math.sin(m.life);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
        ctx.fillStyle=m.gold?`rgba(255,190,30,${a*.5})`:`rgba(0,190,255,${a*.28})`; ctx.fill();
      }

      // Circuit traces
      for(const tr of traces){
        tr.flow=(tr.flow+.0018)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`; ctx.lineWidth=.55; ctx.stroke();
        const tot=tr.pts.slice(1).reduce((a,p,i)=>a+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let tgt=tr.flow*tot,wlk=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(wlk+seg>=tgt){
            const t2=(tgt-wlk)/seg;
            const px2=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py2=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=`hsla(${tr.hue},100%,85%,1)`;
            ctx.beginPath(); ctx.arc(px2,py2,2,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,90%,.92)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          } wlk+=seg;
        }
      }

      // Dot grid (very faint)
      for(let gx=0;gx<W;gx+=46)for(let gy=0;gy<H;gy+=46){
        const a=.015+.01*Math.sin(T*.4+gx*.04+gy*.03);
        ctx.beginPath(); ctx.arc(gx,gy,.6,0,Math.PI*2);
        ctx.fillStyle=`hsla(210,100%,65%,${a})`; ctx.fill();
      }

      // Magnetic nodes
      for(const n of nodes){
        n.phase+=.011; const pulse=.5+.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x,dy=M.y-n.y,d=Math.hypot(dx,dy);
          if(d<180&&d>.5){const f=.017*(1-d/180); n.vx+=dx/d*f; n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*.013; n.vy+=(n.oy-n.y)*.013;
        n.vx*=.87; n.vy*=.87; n.x+=n.vx; n.y+=n.vy;
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.2);
        g.addColorStop(0,`hsla(${n.hue},100%,65%,${pulse*.22})`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3.2,0,Math.PI*2); ctx.fill();
        ctx.save(); ctx.shadowBlur=n.r>2.5?10:4; ctx.shadowColor=`hsla(${n.hue},100%,72%,.85)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(.85+.15*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,72%,${.38+.38*pulse})`; ctx.lineWidth=n.r>2.5?1.2:.8; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
        if(d>120)continue;
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(0,185,255,${(1-d/120)*.07})`; ctx.lineWidth=.45; ctx.stroke();
      }

      // THE EYE — drawn last so it's on top of ambient, under UI
      drawEye(W,H);

      // Global scan line
      const gsY=((T*.015)%1)*H;
      const gsl=ctx.createLinearGradient(0,gsY-.8,0,gsY+.8);
      gsl.addColorStop(0,"transparent"); gsl.addColorStop(.5,"rgba(0,185,255,.009)"); gsl.addColorStop(1,"transparent");
      ctx.fillStyle=gsl; ctx.fillRect(0,gsY-.8,W,1.6);

      // Corner HUD (screen corners only, small)
      [[14,14,1,1],[W-14,14,-1,1],[W-14,H-14,-1,-1],[14,H-14,1,-1]].forEach(([cx,cy,sx,sy]:any,i)=>{
        const hue=i%2===0?193:42;
        ctx.strokeStyle=`hsla(${hue},100%,62%,.22)`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(cx+sx*18,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*18); ctx.stroke();
        const pa=.22+.22*Math.sin(T*1.5+i);
        ctx.save(); ctx.shadowBlur=5; ctx.shadowColor=`hsla(${hue},100%,72%,.7)`;
        ctx.beginPath(); ctx.arc(cx,cy,2.2,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,76%,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      // Mouse reticle — matching the eye's cyan/gold palette
      if(M.x>0){
        SM.x=SM.x<0?M.x:SM.x+(M.x-SM.x)*.09;
        SM.y=SM.y<0?M.y:SM.y+(M.y-SM.y)*.09;
        const cx=SM.x, cy=SM.y;
        const spd=Math.hypot(M.x-M.px,M.y-M.py), hot=spd>1.8;
        const eh=Math.min(H*.82,720), ew=eh*(EYE.width/EYE.height);
        const irisR=Math.min(ew,eh)*.30;
        // Check if on the eye / on iris
        const distFromCentre=Math.hypot(cx-W/2,cy-H/2);
        const onIris=eyeOK&&distFromCentre<irisR*1.1;
        const onEye=eyeOK&&Math.hypot((cx-W/2)/(ew/2),(cy-H/2)/(eh/2))<1;
        // Colour: gold on iris, green in eye, cyan elsewhere
        const col=(a:number)=>onIris?`rgba(255,210,60,${a})`:onEye?`rgba(0,255,170,${a})`:`rgba(0,195,255,${a})`;

        // Bloom
        const bl=ctx.createRadialGradient(cx,cy,0,cx,cy,48);
        bl.addColorStop(0,col(hot?.17:.08)); bl.addColorStop(1,"transparent");
        ctx.fillStyle=bl; ctx.beginPath(); ctx.arc(cx,cy,48,0,Math.PI*2); ctx.fill();

        // Outer rotating arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*2.1+spd*.05);
        ctx.beginPath(); ctx.arc(0,0,28,0,Math.PI*1.55);
        ctx.strokeStyle=col(.58+.22*Math.sin(T*2.5)); ctx.lineWidth=1.8; ctx.stroke();
        const ec=Math.PI*1.55;
        ctx.save(); ctx.shadowBlur=7; ctx.shadowColor=col(1);
        ctx.beginPath(); ctx.arc(Math.cos(ec)*28,Math.sin(ec)*28,2.3,0,Math.PI*2);
        ctx.fillStyle=col(.95); ctx.fill(); ctx.shadowBlur=0; ctx.restore();
        ctx.restore();

        // Inner counter arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*1.6);
        ctx.beginPath(); ctx.arc(0,0,18,Math.PI*.22,Math.PI*1.78);
        ctx.strokeStyle=col(.38+.18*Math.sin(T*3)); ctx.lineWidth=1.1; ctx.stroke();
        ctx.restore();

        // Iris ring
        ctx.beginPath(); ctx.arc(cx,cy,11,0,Math.PI*2);
        ctx.strokeStyle=col(.2+.12*Math.sin(T*2)); ctx.lineWidth=.7; ctx.stroke();

        // Diamond
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=col(.8);
        ctx.strokeStyle=col(.72); ctx.lineWidth=1.3;
        ctx.beginPath();
        ctx.moveTo(cx,cy-10); ctx.lineTo(cx+6,cy); ctx.lineTo(cx,cy+10); ctx.lineTo(cx-6,cy);
        ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

        // Centre dot
        ctx.save(); ctx.shadowBlur=hot?18:10; ctx.shadowColor=col(1);
        ctx.beginPath(); ctx.arc(cx,cy,hot?4:2.6,0,Math.PI*2);
        ctx.fillStyle=hot?col(1):"rgba(200,240,255,.95)"; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        // Tick marks
        ctx.strokeStyle=col(hot?.85:.52); ctx.lineWidth=hot?1.5:1;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          ctx.beginPath();
          ctx.moveTo(cx+dx*6,cy+dy*6); ctx.lineTo(cx+dx*17,cy+dy*17); ctx.stroke();
        });

        // HUD coords
        if(hot){
          ctx.font="6.5px 'Courier New',monospace"; ctx.textAlign="left";
          ctx.fillStyle=col(.7);
          ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+42,cy-3);
          ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+42,cy+9);
          ctx.fillStyle=col(.45);
          ctx.fillText(onIris?"◉ IRIS LOCK":onEye?"● EYE TRACK":"● TRACKING",cx+42,cy+23);
        }
      }

      // Click effects
      if(M.down&&M.x>0){
        for(let i=0;i<5;i++) RINGS.push({x:M.x,y:M.y,r:4,max:70+i*28,a:.9-i*.15,hue:193+i*18});
        for(let i=0;i<20;i++){
          const a=Math.random()*Math.PI*2,s=1.5+Math.random()*5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:28+Math.random()*44,hue:[193,42,165,210][i%4]});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=3.6; r.a*=.89;
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
    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mousedown",onDown);
      window.removeEventListener("mouseleave",onLeave);
      window.removeEventListener("resize",onResize);
    };
  },[]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:-1}} aria-hidden>
      <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
