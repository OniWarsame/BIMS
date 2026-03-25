import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let T = 0, raf = 0;
    let scanAng = 0, irisRot = 0;
    let eox = 0, eoy = 0;
    const M = { x:-999, y:-999, px:-999, py:-999, down:false };
    const SM = { x:-999, y:-999 };
    const RINGS: any[]=[], SPARKS: any[]=[];
    let nodes: any[]=[], traces: any[]=[], motes: any[]=[];

    const onMove  = (e:MouseEvent)=>{ M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; };
    const onDown  = ()=>{ M.down=true; setTimeout(()=>M.down=false,250); };
    const onLeave = ()=>{ M.x=-999; M.y=-999; };
    const onRz    = ()=>{ canvas.width=innerWidth; canvas.height=innerHeight; init(); };
    window.addEventListener("mousemove",onMove,{passive:true});
    window.addEventListener("mousedown",onDown);
    window.addEventListener("mouseleave",onLeave);
    window.addEventListener("resize",onRz);

    const EYE = new Image(); let eyeOK = false;
    EYE.onload = ()=>eyeOK=true;
    EYE.src = "/eye3.jpg";

    function init(){
      const W=canvas.width, H=canvas.height;
      nodes = Array.from({length:38},(_,i)=>{
        const nx=20+Math.random()*(W-40), ny=20+Math.random()*(H-40);
        return{x:nx,y:ny,ox:nx,oy:ny,vx:0,vy:0,
          r:i<6?2.5+Math.random()*2:0.7+Math.random()*1.5,
          hue:[193,42,165,145,210][i%5], phase:Math.random()*Math.PI*2};
      });
      traces = Array.from({length:24},()=>{
        const pts:any[]=[];
        let px=Math.random()*W, py=Math.random()*H;
        pts.push({x:px,y:py});
        for(let s=0;s<2+Math.floor(Math.random()*4);s++){
          Math.random()>.5?(px+=(Math.random()-.5)*160):(py+=(Math.random()-.5)*130);
          pts.push({x:Math.max(5,Math.min(W-5,px)),y:Math.max(5,Math.min(H-5,py))});
        }
        return{pts,hue:[193,42,165,210][Math.floor(Math.random()*4)],
          alpha:.04+Math.random()*.08, flow:Math.random()};
      });
      motes = Array.from({length:50},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.12,
        r:.3+Math.random()*1.1, life:Math.random()*Math.PI*2, gold:Math.random()<.25
      }));
    }

    function draw(){
      T+=.016; scanAng=(scanAng+.012)%(Math.PI*2); irisRot+=.0014;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      // Eye fills full width, centred vertically
      // Image is 960×549 (ratio 1.749)
      const IMG_RATIO = 960/549;
      const ew = W;                    // full width
      const eh = ew / IMG_RATIO;       // height from ratio
      const ex = 0;
      const ey = CY - eh/2;

      // Pupil centre in this image is roughly at 47% x, 52% y of image
      const pupCX = ex + ew * 0.47;
      const pupCY = ey + eh * 0.52;
      // Iris radius in the image is about 22% of image width
      const irisR = ew * 0.19;
      const pupilR = irisR * 0.30;

      // Parallax
      if(M.x>0){
        eox += ((M.x-CX)/W*18 - eox)*.025;
        eoy += ((M.y-CY)/H*12 - eoy)*.025;
      }

      // ── 1. Black void ──
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);

      // ── 2. THE EYE — full width, dramatic ──
      if(eyeOK){
        ctx.save();
        // No clip — let it bleed to edges, use fades instead
        ctx.globalAlpha = .90 + .06*Math.sin(T*.32);
        ctx.drawImage(EYE, ex+eox*.4, ey+eoy*.4, ew, eh);
        ctx.globalAlpha = 1;

        // Top & bottom fades into black
        const topFade = ctx.createLinearGradient(0,ey,0,ey+eh*.22);
        topFade.addColorStop(0,"rgba(0,0,0,1)"); topFade.addColorStop(1,"transparent");
        ctx.fillStyle=topFade; ctx.fillRect(0,0,W,ey+eh*.22);

        const botFade = ctx.createLinearGradient(0,ey+eh*.78,0,ey+eh);
        botFade.addColorStop(0,"transparent"); botFade.addColorStop(1,"rgba(0,0,0,1)");
        ctx.fillStyle=botFade; ctx.fillRect(0,ey+eh*.78,W,H);

        // If eye doesn't fill full height, fill gaps
        if(ey>0){
          ctx.fillStyle="#000"; ctx.fillRect(0,0,W,ey);
          ctx.fillStyle="#000"; ctx.fillRect(0,ey+eh,W,H-ey-eh);
        }

        ctx.restore();
      }

      // ── 3. Subtle dark overlay to deepen the scene ──
      const ovl=ctx.createRadialGradient(CX,CY,irisR*1.2,CX,CY,W*.7);
      ovl.addColorStop(0,"transparent");
      ovl.addColorStop(.5,"rgba(0,2,8,.18)");
      ovl.addColorStop(1,"rgba(0,0,4,.55)");
      ctx.fillStyle=ovl; ctx.fillRect(0,0,W,H);

      // ── 4. Iris rotating fiber lines (inside iris only) ──
      ctx.save();
      ctx.beginPath(); ctx.arc(pupCX,pupCY,irisR*.94,0,Math.PI*2); ctx.clip();
      for(let i=0;i<80;i++){
        const ang=(i/80)*Math.PI*2+irisRot, jit=Math.sin(T*.4+i*.6)*.04;
        const r1=pupilR*1.08, r2=irisR*.90;
        ctx.beginPath();
        ctx.moveTo(pupCX+Math.cos(ang+jit)*r1, pupCY+Math.sin(ang+jit)*r1);
        ctx.lineTo(pupCX+Math.cos(ang)*r2,     pupCY+Math.sin(ang)*r2);
        const hue = i%5===0 ? 42 : i%3===0 ? 165 : 193;
        ctx.strokeStyle=`hsla(${hue},100%,72%,${.055+.035*Math.sin(T*.5+i)})`;
        ctx.lineWidth=.5; ctx.stroke();
      }
      ctx.restore();

      // ── 5. SCANNING ARC — around iris outer edge ──
      ctx.save();
      ctx.shadowBlur=22; ctx.shadowColor="rgba(0,255,160,.95)";
      ctx.strokeStyle="rgba(0,255,160,.80)"; ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.arc(pupCX,pupCY, irisR*1.06, scanAng, scanAng+Math.PI*.55);
      ctx.stroke();
      // Bright endpoint cap
      ctx.beginPath();
      ctx.arc(
        pupCX+Math.cos(scanAng)*irisR*1.06,
        pupCY+Math.sin(scanAng)*irisR*1.06,
        4.5, 0, Math.PI*2
      );
      ctx.fillStyle="rgba(0,255,160,1)"; ctx.fill();
      ctx.shadowBlur=0; ctx.restore();

      // Counter blue arc — slightly further out
      ctx.save();
      ctx.shadowBlur=14; ctx.shadowColor="rgba(60,190,255,.9)";
      ctx.strokeStyle="rgba(60,190,255,.55)"; ctx.lineWidth=1.6;
      ctx.beginPath();
      ctx.arc(pupCX,pupCY, irisR*1.22, -scanAng*.65, -scanAng*.65+Math.PI*.38);
      ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

      // Gold accent arc (matches the gold lines in the image)
      ctx.save();
      ctx.shadowBlur=10; ctx.shadowColor="rgba(255,195,30,.8)";
      ctx.strokeStyle="rgba(255,195,30,.40)"; ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.arc(pupCX,pupCY, irisR*1.38, scanAng*.4+1, scanAng*.4+1+Math.PI*.28);
      ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

      // ── 6. Pulse rings from iris ──
      for(let i=0;i<4;i++){
        const ph=((T*.30+i*1.85)%(Math.PI*2));
        const pr=irisR*(1.08+.40*(ph/(Math.PI*2)));
        const pa=Math.max(0,.20*(1-ph/(Math.PI*2)));
        ctx.beginPath(); ctx.arc(pupCX,pupCY,pr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,165,255,${pa})`; ctx.lineWidth=.9; ctx.stroke();
      }

      // ── 7. Iris border glow ──
      const bp=.5+.5*Math.sin(T*.65);
      ctx.save();
      ctx.shadowBlur=44+18*bp; ctx.shadowColor=`rgba(0,190,255,${.80+.14*bp})`;
      ctx.strokeStyle=`rgba(0,205,255,${.28+.22*bp})`; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.arc(pupCX,pupCY,irisR*1.06,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // ── 8. Pupil dot highlight ──
      const pg=ctx.createRadialGradient(pupCX-pupilR*.25,pupCY-pupilR*.25,0,pupCX,pupCY,pupilR*1.1);
      pg.addColorStop(0,"rgba(180,240,255,.10)");
      pg.addColorStop(.6,"rgba(0,120,200,.04)");
      pg.addColorStop(1,"transparent");
      ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(pupCX,pupCY,pupilR*1.1,0,Math.PI*2); ctx.fill();

      // ── 9. Ambient motes (very faint) ──
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.006;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0;
        if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a=.12+.12*Math.sin(m.life);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
        ctx.fillStyle=m.gold?`rgba(255,185,25,${a*.55})`:`rgba(0,185,255,${a*.32})`; ctx.fill();
      }

      // ── 10. Circuit traces (very subtle) ──
      for(const tr of traces){
        tr.flow=(tr.flow+.0018)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha*.65})`; ctx.lineWidth=.55; ctx.stroke();
        // Photon
        const tot=tr.pts.slice(1).reduce((a,p,i)=>a+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let tgt=tr.flow*tot,wlk=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(wlk+seg>=tgt){
            const t2=(tgt-wlk)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=`hsla(${tr.hue},100%,80%,1)`;
            ctx.beginPath(); ctx.arc(px,py,1.9,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,88%,.9)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          } wlk+=seg;
        }
      }

      // ── 11. Magnetic nodes ──
      for(const n of nodes){
        n.phase+=.011;
        const pulse=.5+.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x,dy=M.y-n.y,d=Math.hypot(dx,dy);
          if(d<155&&d>.5){const f=.015*(1-d/155);n.vx+=dx/d*f;n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*.014; n.vy+=(n.oy-n.y)*.014;
        n.vx*=.87; n.vy*=.87; n.x+=n.vx; n.y+=n.vy;
        ctx.save(); ctx.shadowBlur=n.r>2?8:4; ctx.shadowColor=`hsla(${n.hue},100%,70%,.7)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(.85+.15*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,70%,${.25+.25*pulse})`; ctx.lineWidth=n.r>2?1.1:.75; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
        if(d>115)continue;
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(0,180,255,${(1-d/115)*.042})`; ctx.lineWidth=.4; ctx.stroke();
      }

      // ── 12. HUD — floats ABOVE iris, INSIDE eye area ──
      const lp=.5+.5*Math.sin(T*2.0);
      // Top label — above iris, below eyelid
      ctx.font="bold 11px 'Orbitron','Courier New',monospace"; ctx.textAlign="center";
      ctx.fillStyle=`rgba(0,255,160,${.68+.28*lp})`;
      ctx.fillText("● IRIS BIOMETRIC SCAN", pupCX, pupCY-irisR*1.42);
      ctx.font="7.5px 'Courier New',monospace";
      ctx.fillStyle=`rgba(0,205,255,${.52+.24*lp})`;
      ctx.fillText(`MATCH ${Math.floor(88+8*Math.abs(Math.sin(T*.35)))}%  ·  LOCK  ·  DEPTH`, pupCX, pupCY-irisR*1.25);

      // Side orbit labels — in the dark corners of the eye image
      ctx.font="7px 'Courier New',monospace";
      const orbitData=[
        {label:"RETINA",   ang:-.52, dist:1.68},
        {label:"VASCULAR", ang:.52,  dist:1.68},
        {label:"NEURAL",   ang:Math.PI+.45, dist:1.62},
        {label:"DEPTH",    ang:Math.PI-.45, dist:1.62},
      ];
      orbitData.forEach(({label,ang,dist},i)=>{
        const lx=pupCX+Math.cos(ang)*irisR*dist;
        const ly=pupCY+Math.sin(ang)*irisR*dist;
        const a=.35+.25*Math.sin(T*1.5+i*.9);
        ctx.textAlign="center";
        ctx.fillStyle=`rgba(0,200,255,${a})`;
        ctx.fillText(`◆ ${label}`,lx,ly);
        ctx.fillStyle=`rgba(255,185,25,${a*.7})`;
        ctx.fillText(`${"█".repeat(Math.floor(3+2*Math.abs(Math.sin(T*.4+i))))+"░"}`,lx,ly+10);
      });

      // ── 13. Global corner brackets ──
      [[18,18,1,1],[W-18,18,-1,1],[W-18,H-18,-1,-1],[18,H-18,1,-1]].forEach(([cx,cy,sx,sy]:any,i)=>{
        const hue=i%2===0?193:42, sz=18;
        ctx.strokeStyle=`hsla(${hue},100%,62%,.22)`; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(cx+sx*sz,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*sz); ctx.stroke();
        const pa=.22+.20*Math.sin(T*1.4+i);
        ctx.save(); ctx.shadowBlur=6; ctx.shadowColor=`hsla(${hue},100%,72%,.8)`;
        ctx.beginPath(); ctx.arc(cx,cy,2.4,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,76%,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      // ── 14. MOUSE — precision iris targeting reticle ──
      if(M.x>0){
        SM.x=SM.x<0?M.x:SM.x+(M.x-SM.x)*.09;
        SM.y=SM.y<0?M.y:SM.y+(M.y-SM.y)*.09;
        const cx=SM.x, cy=SM.y;
        const spd=Math.hypot(M.x-M.px,M.y-M.py), hot=spd>1.8;
        const dist=Math.hypot(cx-pupCX,cy-pupCY);
        const onPupil=dist<pupilR;
        const onIris=dist<irisR;
        const col=(a:number)=>onPupil?`rgba(255,220,80,${a})`:onIris?`rgba(0,255,160,${a})`:`rgba(0,200,255,${a})`;

        // Bloom
        const bl=ctx.createRadialGradient(cx,cy,0,cx,cy,50);
        bl.addColorStop(0,col(hot?.18:.09)); bl.addColorStop(1,"transparent");
        ctx.fillStyle=bl; ctx.beginPath(); ctx.arc(cx,cy,50,0,Math.PI*2); ctx.fill();

        // Outer rotating arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*2.0+spd*.05);
        ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*1.58);
        ctx.strokeStyle=col(.62+.20*Math.sin(T*2.5)); ctx.lineWidth=1.9; ctx.stroke();
        const ec=Math.PI*1.58;
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=col(1);
        ctx.beginPath(); ctx.arc(Math.cos(ec)*30,Math.sin(ec)*30,2.5,0,Math.PI*2);
        ctx.fillStyle=col(.95); ctx.fill(); ctx.shadowBlur=0; ctx.restore();
        ctx.restore();

        // Inner counter-arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*1.5);
        ctx.beginPath(); ctx.arc(0,0,19,Math.PI*.22,Math.PI*1.78);
        ctx.strokeStyle=col(.40+.18*Math.sin(T*3)); ctx.lineWidth=1.1; ctx.stroke();
        ctx.restore();

        // Micro iris ring
        ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2);
        ctx.strokeStyle=col(.22+.12*Math.sin(T*2.2)); ctx.lineWidth=.8; ctx.stroke();

        // Diamond
        ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=col(.88);
        ctx.strokeStyle=col(.78); ctx.lineWidth=1.4;
        ctx.beginPath();
        ctx.moveTo(cx,cy-11); ctx.lineTo(cx+6.5,cy); ctx.lineTo(cx,cy+11); ctx.lineTo(cx-6.5,cy);
        ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

        // Centre dot
        ctx.save(); ctx.shadowBlur=hot?20:11;
        ctx.shadowColor=hot?"rgba(255,220,80,1)":col(.9);
        ctx.beginPath(); ctx.arc(cx,cy,hot?4:2.8,0,Math.PI*2);
        ctx.fillStyle=hot?(onPupil?"rgba(255,220,80,1)":"rgba(0,255,160,1)"):"rgba(195,238,255,.97)";
        ctx.fill(); ctx.shadowBlur=0; ctx.restore();

        // 4 ticks
        ctx.strokeStyle=col(hot?.88:.54); ctx.lineWidth=hot?1.6:1.1;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          ctx.beginPath();
          ctx.moveTo(cx+dx*7,cy+dy*7); ctx.lineTo(cx+dx*18,cy+dy*18);
          ctx.stroke();
        });

        // HUD text
        if(hot){
          ctx.font="6.5px 'Courier New',monospace"; ctx.textAlign="left";
          ctx.fillStyle=col(.74);
          ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+44,cy-2);
          ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+44,cy+10);
          ctx.fillStyle=col(.50);
          ctx.fillText(onPupil?"● PUPIL LOCK":onIris?"● IRIS LOCK":"● TRACKING",cx+44,cy+24);
        }
      }

      // ── 15. Click effects ──
      if(M.down&&M.x>0){
        for(let i=0;i<5;i++) RINGS.push({x:M.x,y:M.y,r:5,max:78+i*30,a:.92-i*.16,hue:193+i*18});
        for(let i=0;i<22;i++){
          const a=Math.random()*Math.PI*2,s=1.5+Math.random()*5.5;
          SPARKS.push({x:M.x,y:M.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:30+Math.random()*48,hue:[193,42,145,210,165][i%5]});
        }
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const r=RINGS[i]; r.r+=3.8; r.a*=.89;
        if(r.r>r.max||r.a<.01){RINGS.splice(i,1);continue;}
        ctx.save(); ctx.shadowBlur=13; ctx.shadowColor=`hsla(${r.hue},100%,72%,.8)`;
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${r.hue},100%,72%,${r.a})`; ctx.lineWidth=2.1; ctx.stroke();
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
