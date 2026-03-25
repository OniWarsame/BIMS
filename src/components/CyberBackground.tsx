import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, T = 0;
    const M = { x:-999, y:-999, px:-999, py:-999, down:false };
    const SM = { x:-999, y:-999 };
    const RINGS: any[] = [], SPARKS: any[] = [];

    const onMove  = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; };
    const onDown  = () => { M.down=true; setTimeout(()=>M.down=false,250); };
    const onLeave = () => { M.x=-999; M.y=-999; };
    const onResize = () => { canvas.width=innerWidth; canvas.height=innerHeight; init(); };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    // Load eye image
    const EYE = new Image();
    let eyeOK = false;
    EYE.onload = () => eyeOK = true;
    EYE.src = "/eye2.jpg";

    // State
    let nodes: any[]=[], traces: any[]=[], motes: any[]=[];
    let irisRot = 0;
    let eyeOffX = 0, eyeOffY = 0;
    let scanAngle = 0;

    function init() {
      const W=canvas.width, H=canvas.height;
      nodes = Array.from({length:55}, (_,i) => {
        const nx=30+Math.random()*(W-60), ny=30+Math.random()*(H-60);
        return { x:nx, y:ny, ox:nx, oy:ny, vx:0, vy:0,
          r: i<8 ? 3+Math.random()*2.5 : 1+Math.random()*2,
          hue:[193,42,165,145,210][i%5], phase:Math.random()*Math.PI*2 };
      });
      traces = Array.from({length:36}, () => {
        const pts:any[]=[];
        let px=Math.random()*W, py=Math.random()*H;
        pts.push({x:px,y:py});
        for(let s=0;s<2+Math.floor(Math.random()*4);s++){
          Math.random()>.5 ? (px+=(Math.random()-.5)*200) : (py+=(Math.random()-.5)*160);
          pts.push({x:Math.max(10,Math.min(W-10,px)),y:Math.max(10,Math.min(H-10,py))});
        }
        return {pts, hue:[193,42,165,210,145][Math.floor(Math.random()*5)],
          alpha:.05+Math.random()*.09, flow:Math.random()};
      });
      motes = Array.from({length:60}, () => ({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.14,
        r:.4+Math.random()*1.2, life:Math.random()*Math.PI*2,
        gold:Math.random()<.22
      }));
    }

    function drawEye(W:number, H:number) {
      if (!eyeOK) return;
      const CX=W/2, CY=H/2;

      // Eye size — 58% of viewport width, preserving aspect ratio
      const ew = Math.min(W*.58, 720);
      const eh = ew * (EYE.height/EYE.width);
      const ex = CX - ew/2, ey = CY - eh/2;

      // Smooth parallax — eye follows cursor gently
      if (M.x > 0) {
        eyeOffX += ((M.x-CX)/W*28 - eyeOffX) * .035;
        eyeOffY += ((M.y-CY)/H*18 - eyeOffY) * .035;
      }

      // === OUTER ATMOSPHERIC HALO ===
      const pulse = Math.sin(T*.55);
      const halo = ctx.createRadialGradient(CX,CY,ew*.08,CX,CY,ew*.95);
      halo.addColorStop(0, `rgba(0,160,255,${.22+.08*pulse})`);
      halo.addColorStop(.35, `rgba(0,100,200,${.12+.05*pulse})`);
      halo.addColorStop(.7, `rgba(0,50,120,${.06})`);
      halo.addColorStop(1, "transparent");
      ctx.fillStyle=halo;
      ctx.fillRect(ex-120, ey-80, ew+240, eh+160);

      // === DRAW THE EYE IMAGE ===
      ctx.save();
      // Clip to rounded ellipse
      ctx.beginPath();
      ctx.ellipse(CX+eyeOffX*.3, CY+eyeOffY*.3, ew/2, eh/2, 0, 0, Math.PI*2);
      ctx.clip();
      ctx.globalAlpha = .82 + .10*Math.sin(T*.4);
      ctx.drawImage(EYE,
        ex + eyeOffX*.6, ey + eyeOffY*.6,
        ew, eh
      );
      // Radial vignette inside the eye
      const vig = ctx.createRadialGradient(CX,CY,ew*.25,CX,CY,ew*.52);
      vig.addColorStop(0,"transparent");
      vig.addColorStop(.7,"rgba(0,4,20,.06)");
      vig.addColorStop(1,"rgba(0,2,12,.72)");
      ctx.globalAlpha=1;
      ctx.fillStyle=vig; ctx.fillRect(ex,ey,ew,eh);
      ctx.restore();

      // === IRIS ROTATING FIBER LINES ===
      irisRot += .0018;
      const irisR = Math.min(ew,eh)*.36;
      const pupilR = Math.min(ew,eh)*.12;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(CX,CY,ew*.48,eh*.48,0,0,Math.PI*2);
      ctx.clip();
      for (let i=0;i<64;i++) {
        const ang = (i/64)*Math.PI*2 + irisRot;
        const jit = Math.sin(T*.5+i*.7)*.045;
        const x1 = CX+Math.cos(ang+jit)*pupilR*1.15;
        const y1 = CY+Math.sin(ang+jit)*pupilR*1.15*(eh/ew);
        const x2 = CX+Math.cos(ang)*irisR*.95;
        const y2 = CY+Math.sin(ang)*irisR*.95*(eh/ew);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        const hue = i%4===0?42:193;
        ctx.strokeStyle=`hsla(${hue},100%,68%,${.04+.03*Math.sin(T*.6+i)})`;
        ctx.lineWidth=.5; ctx.stroke();
      }
      ctx.restore();

      // === SCANNING RING around the iris ===
      scanAngle = (scanAngle+.018) % (Math.PI*2);
      const scanR = irisR*1.05;
      // Rotating arc — 120° sweep
      ctx.save();
      ctx.shadowBlur=16; ctx.shadowColor="rgba(0,255,160,.9)";
      ctx.strokeStyle="rgba(0,255,160,.75)"; ctx.lineWidth=2.2;
      ctx.beginPath();
      ctx.arc(CX,CY,scanR, scanAngle, scanAngle+Math.PI*.67);
      ctx.stroke();
      // End cap glow
      ctx.beginPath(); ctx.arc(
        CX+Math.cos(scanAngle)*scanR,
        CY+Math.sin(scanAngle)*scanR, 4, 0, Math.PI*2);
      ctx.fillStyle="rgba(0,255,160,1)"; ctx.fill();
      ctx.shadowBlur=0; ctx.restore();

      // Counter-rotating ring — thinner, blue
      ctx.save();
      ctx.shadowBlur=12; ctx.shadowColor="rgba(80,180,255,.9)";
      ctx.strokeStyle="rgba(80,180,255,.55)"; ctx.lineWidth=1.3;
      ctx.beginPath();
      ctx.arc(CX,CY, scanR*1.18, -scanAngle*.7, -scanAngle*.7+Math.PI*.45);
      ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // === PULSE RINGS emanating from iris ===
      for(let i=0;i<3;i++){
        const ph=((T*.35+i*2.09) % (Math.PI*2));
        const pr=scanR*(1.05+.3*(ph/(Math.PI*2)));
        const pa=Math.max(0,.22*(1-ph/(Math.PI*2)));
        ctx.beginPath(); ctx.arc(CX,CY,pr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,180,255,${pa})`; ctx.lineWidth=.9; ctx.stroke();
      }

      // === EYE BORDER ===
      const bp=.5+.5*Math.sin(T*.72);
      ctx.save();
      ctx.shadowBlur=36+14*bp; ctx.shadowColor=`rgba(0,190,255,${.8+.15*bp})`;
      ctx.strokeStyle=`rgba(0,200,255,${.4+.28*bp})`; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.ellipse(CX,CY,ew/2,eh/2,0,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();

      // === HUD CORNER BRACKETS ===
      const bs=32;
      [[ex,ey,1,1],[ex+ew,ey,-1,1],[ex+ew,ey+eh,-1,-1],[ex,ey+eh,1,-1]].forEach(([bx,by,sx,sy]:any)=>{
        ctx.save();
        ctx.shadowBlur=14; ctx.shadowColor="rgba(0,220,255,1)";
        ctx.strokeStyle="rgba(0,220,255,.88)"; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(bx+sx*bs,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+sy*bs); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      });

      // Glowing corner dots
      [[ex,ey],[ex+ew,ey],[ex+ew,ey+eh],[ex,ey+eh]].forEach(([bx,by],i)=>{
        const pa=.5+.5*Math.sin(T*2.2+i);
        ctx.save(); ctx.shadowBlur=12; ctx.shadowColor="rgba(0,220,255,.9)";
        ctx.beginPath(); ctx.arc(bx,by,4.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,220,255,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      // === HUD LABELS ===
      const lp=.5+.5*Math.sin(T*2.8);
      ctx.font="bold 10px 'Courier New',monospace"; ctx.textAlign="left";
      ctx.fillStyle=`rgba(0,255,140,${.55+.4*lp})`;
      ctx.fillText("● IRIS SCAN ACTIVE", ex+10, ey-14);
      ctx.textAlign="right"; ctx.fillStyle="rgba(0,190,255,.65)";
      ctx.fillText(`MATCH ${Math.floor(85+10*Math.abs(Math.sin(T*.4)))}%`, ex+ew-10, ey-14);

      // Side data labels
      ctx.font="7px 'Courier New',monospace"; ctx.textAlign="left";
      const labels=["RETINA PATTERN","VASCULAR MAP","DEPTH ANALYSIS","NEURAL SCAN"];
      labels.forEach((lbl,i)=>{
        const ly=ey+eh*.2+i*(eh*.18);
        const la=.3+.25*Math.sin(T*1.8+i*.7);
        ctx.fillStyle=`rgba(0,190,255,${la})`;
        ctx.fillText(`> ${lbl}`, ex-130, ly);
        // Progress bar
        const barW=90, barH=3;
        ctx.fillStyle=`rgba(0,50,100,${.6})`;
        ctx.fillRect(ex-130,ly+5,barW,barH);
        const prog=((.4+.6*Math.abs(Math.sin(T*.3+i*.9)))*barW);
        const bgrad=ctx.createLinearGradient(ex-130,0,ex-130+prog,0);
        bgrad.addColorStop(0,"rgba(0,200,255,.7)"); bgrad.addColorStop(1,"rgba(0,255,140,.8)");
        ctx.fillStyle=bgrad; ctx.fillRect(ex-130,ly+5,prog,barH);
      });
    }

    function draw() {
      T+=.016;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;

      // 1. Deep void
      ctx.fillStyle="#000a18"; ctx.fillRect(0,0,W,H);

      // 2. Ambient blue glow at centre
      const amb=ctx.createRadialGradient(CX,CY,0,CX,CY,W*.75);
      amb.addColorStop(0,"rgba(0,30,80,.45)");
      amb.addColorStop(.35,"rgba(0,15,50,.18)");
      amb.addColorStop(1,"transparent");
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      // 3. Floating motes
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.006;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0;
        if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a=.2+.2*Math.sin(m.life);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
        ctx.fillStyle=m.gold?`rgba(255,190,30,${a*.5})`:`rgba(0,190,255,${a*.3})`; ctx.fill();
      }

      // 4. Circuit traces + photons
      for(const tr of traces){
        tr.flow=(tr.flow+.002)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`hsla(${tr.hue},100%,58%,${tr.alpha})`; ctx.lineWidth=.6; ctx.stroke();
        for(const p of tr.pts){
          ctx.beginPath(); ctx.arc(p.x,p.y,1.1,0,Math.PI*2);
          ctx.fillStyle=`hsla(${tr.hue},100%,70%,${tr.alpha*1.6})`; ctx.fill();
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
            ctx.save(); ctx.shadowBlur=10; ctx.shadowColor=`hsla(${tr.hue},100%,85%,1)`;
            ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2);
            ctx.fillStyle=`hsla(${tr.hue},100%,90%,.94)`; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          } wlk+=seg;
        }
      }

      // 5. Dot grid
      for(let gx=0;gx<W;gx+=44)for(let gy=0;gy<H;gy+=44){
        const a=.018+.013*Math.sin(T*.4+gx*.04+gy*.03);
        ctx.beginPath(); ctx.arc(gx,gy,.65,0,Math.PI*2);
        ctx.fillStyle=`hsla(210,100%,65%,${a})`; ctx.fill();
      }

      // 6. Magnetic circuit nodes
      for(const n of nodes){
        n.phase+=.012;
        const pulse=.5+.5*Math.sin(n.phase);
        if(M.x>0){
          const dx=M.x-n.x, dy=M.y-n.y, d=Math.hypot(dx,dy);
          if(d<185&&d>.5){const f=.018*(1-d/185); n.vx+=dx/d*f; n.vy+=dy/d*f;}
        }
        n.vx+=(n.ox-n.x)*.013; n.vy+=(n.oy-n.y)*.013;
        n.vx*=.87; n.vy*=.87; n.x+=n.vx; n.y+=n.vy;
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.5);
        g.addColorStop(0,`hsla(${n.hue},100%,65%,${pulse*.24})`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3.5,0,Math.PI*2); ctx.fill();
        ctx.save(); ctx.shadowBlur=n.r>2.5?12:5; ctx.shadowColor=`hsla(${n.hue},100%,72%,.9)`;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(.85+.15*pulse),0,Math.PI*2);
        ctx.strokeStyle=`hsla(${n.hue},100%,72%,${.4+.4*pulse})`; ctx.lineWidth=n.r>2.5?1.3:.9; ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      // Node connections
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
        if(d>125)continue;
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(0,190,255,${(1-d/125)*.08})`; ctx.lineWidth=.5; ctx.stroke();
      }

      // 7. THE EYE — main centrepiece
      drawEye(W,H);

      // 8. Global scan line
      const gsY=((T*.016)%1)*H;
      const gsl=ctx.createLinearGradient(0,gsY-1,0,gsY+1);
      gsl.addColorStop(0,"transparent"); gsl.addColorStop(.5,"rgba(0,190,255,.011)"); gsl.addColorStop(1,"transparent");
      ctx.fillStyle=gsl; ctx.fillRect(0,gsY-1,W,2);

      // 9. Corner HUD brackets (global)
      [[16,16,1,1],[W-16,16,-1,1],[W-16,H-16,-1,-1],[16,H-16,1,-1]].forEach(([cx,cy,sx,sy]:any,i)=>{
        const hue=i%2===0?193:42, sz=20;
        ctx.strokeStyle=`hsla(${hue},100%,62%,.26)`; ctx.lineWidth=1.3;
        ctx.beginPath(); ctx.moveTo(cx+sx*sz,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*sz); ctx.stroke();
        const pa=.25+.25*Math.sin(T*1.5+i);
        ctx.save(); ctx.shadowBlur=7; ctx.shadowColor=`hsla(${hue},100%,72%,.8)`;
        ctx.beginPath(); ctx.arc(cx,cy,2.6,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},100%,76%,${pa})`; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();
      });

      // 10. Mouse — precision iris reticle
      if(M.x>0){
        SM.x=SM.x<0?M.x:SM.x+(M.x-SM.x)*.09;
        SM.y=SM.y<0?M.y:SM.y+(M.y-SM.y)*.09;
        const cx=SM.x, cy=SM.y;
        const spd=Math.hypot(M.x-M.px,M.y-M.py), hot=spd>1.8;

        // Is cursor over the eye?
        const ew=Math.min(W*.58,720), eh=ew*(EYE.height/EYE.width);
        const onEye=eyeOK&&Math.hypot((cx-W/2)/(ew/2),(cy-H/2)/(eh/2))<1;
        const colA=(a:number)=>onEye?`rgba(0,255,140,${a})`:`rgba(0,190,255,${a})`;
        const colB=(a:number)=>onEye?`rgba(0,255,200,${a})`:`rgba(80,210,255,${a})`;

        // Bloom glow
        const bl=ctx.createRadialGradient(cx,cy,0,cx,cy,52);
        bl.addColorStop(0,colA(hot?.18:.09)); bl.addColorStop(1,"transparent");
        ctx.fillStyle=bl; ctx.beginPath(); ctx.arc(cx,cy,52,0,Math.PI*2); ctx.fill();

        // ① Outer arc (3/4 open) rotating
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(T*2.1+spd*.05);
        ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*1.58);
        ctx.strokeStyle=colA(.60+.22*Math.sin(T*2.5)); ctx.lineWidth=1.9; ctx.stroke();
        // cap
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=colA(1);
        const ec=Math.PI*1.58;
        ctx.beginPath(); ctx.arc(Math.cos(ec)*30,Math.sin(ec)*30,2.5,0,Math.PI*2);
        ctx.fillStyle=colA(.95); ctx.fill(); ctx.shadowBlur=0; ctx.restore();
        ctx.restore();

        // ② Counter-rotating inner arc
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(-T*1.6);
        ctx.beginPath(); ctx.arc(0,0,19,Math.PI*.22,Math.PI*1.78);
        ctx.strokeStyle=colB(.40+.18*Math.sin(T*3.2)); ctx.lineWidth=1.1; ctx.stroke();
        ctx.restore();

        // ③ Iris ring static
        ctx.save(); ctx.translate(cx,cy);
        ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2);
        ctx.strokeStyle=colA(.22+.12*Math.sin(T*2)); ctx.lineWidth=.8; ctx.stroke();
        ctx.restore();

        // ④ Diamond
        ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=colA(.85);
        ctx.strokeStyle=colA(.75); ctx.lineWidth=1.4;
        ctx.beginPath();
        ctx.moveTo(cx,cy-11); ctx.lineTo(cx+6.5,cy); ctx.lineTo(cx,cy+11); ctx.lineTo(cx-6.5,cy);
        ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0; ctx.restore();

        // ⑤ Centre dot
        ctx.save(); ctx.shadowBlur=hot?20:11; ctx.shadowColor=hot?"rgba(0,255,140,1)":colA(.9);
        ctx.beginPath(); ctx.arc(cx,cy,hot?4.2:2.8,0,Math.PI*2);
        ctx.fillStyle=hot?"rgba(0,255,140,1)":"rgba(190,235,255,.97)"; ctx.fill();
        ctx.shadowBlur=0; ctx.restore();

        // ⑥ 4 tick marks
        const arm=12, gap=7;
        ctx.strokeStyle=colA(hot?.88:.56); ctx.lineWidth=hot?1.6:1.1;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{
          ctx.beginPath();
          ctx.moveTo(cx+dx*gap,cy+dy*gap); ctx.lineTo(cx+dx*(gap+arm),cy+dy*(gap+arm));
          ctx.stroke();
        });

        // ⑦ HUD text
        if(hot){
          ctx.font="6.5px 'Courier New',monospace"; ctx.textAlign="left";
          ctx.fillStyle=colA(.72);
          ctx.fillText(`X:${String(Math.floor(cx)).padStart(4,"0")}`,cx+44,cy-3);
          ctx.fillText(`Y:${String(Math.floor(cy)).padStart(4,"0")}`,cx+44,cy+9);
          ctx.fillStyle=colA(.48);
          ctx.fillText(onEye?"● IRIS LOCK":"● TRACKING",cx+44,cy+23);
        }
      }

      // 11. Click effects
      if(M.down&&M.x>0){
        for(let i=0;i<5;i++) RINGS.push({x:M.x,y:M.y,r:5,max:75+i*30,a:.92-i*.16,hue:193+i*18});
        for(let i=0;i<22;i++){
          const a=Math.random()*Math.PI*2, s=1.5+Math.random()*5.5;
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
        const p=s.age/s.life, a=p<.2?p/.2:1-(p-.2)/.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.3*(1-p*.5),0,Math.PI*2);
        ctx.fillStyle=`hsla(${s.hue},100%,72%,${a*.9})`; ctx.fill();
      }

      raf=requestAnimationFrame(draw);
    }

    canvas.width=innerWidth; canvas.height=innerHeight;
    init();
    raf=requestAnimationFrame(draw);

    return () => {
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
