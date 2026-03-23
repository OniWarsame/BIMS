import React, { useEffect, useRef } from "react";

/*
  Eye-BG Interactive Canvas
  Palette: deep cyan #00d4ff, electric blue #0088ff, void black
  Advanced mouse: magnetic field lines, iris ripple rings,
  particle trails, depth-aware node distortion
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    /* ── Mouse state ── */
    const M = {
      x: -999, y: -999,
      px: -999, py: -999,
      vx: 0, vy: 0,
      down: false, click: false,
    };
    const onMove = (e: MouseEvent) => {
      M.px = M.x; M.py = M.y;
      M.x = e.clientX; M.y = e.clientY;
      M.vx = M.x - M.px; M.vy = M.y - M.py;
    };
    const onDown = () => { M.down = true; M.click = true; setTimeout(()=>{ M.click=false; },200); };
    const onUp   = () => { M.down = false; };
    const onLeave= () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove",  onMove,  {passive:true});
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; initNodes(); };
    window.addEventListener("resize", resize);

    /* ── Image ── */
    const img = new Image();
    img.src = "/eye_bg.jpg";
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.onerror = () => { imgOK = false; };

    /* ── Types ── */
    interface Node  { x:number; y:number; vx:number; vy:number; r:number; baseR:number; bright:number; hue:number; }
    interface Ring  { x:number; y:number; r:number; maxR:number; a:number; w:number; hue:number; }
    interface Spark { x:number; y:number; vx:number; vy:number; life:number; ml:number; hue:number; }
    interface MagLine { pts:{x:number;y:number}[]; a:number; hue:number; }
    interface Trail { x:number; y:number; t:number; }

    let NODES: Node[] = [];
    const RINGS:    Ring[]    = [];
    const SPARKS:   Spark[]   = [];
    const MAGLINES: MagLine[] = [];
    const TRAIL:    Trail[]   = [];

    /* ── Init nodes ── */
    function initNodes() {
      const W=canvas.width, H=canvas.height;
      NODES = Array.from({length:55},(_,i)=>({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-0.5)*0.28, vy:(Math.random()-0.5)*0.28,
        r: i<8 ? 3.5+Math.random()*2 : 1.2+Math.random()*2,
        baseR: i<8 ? 3.5+Math.random()*2 : 1.2+Math.random()*2,
        bright: i<8 ? 0.85 : 0.3+Math.random()*0.5,
        hue: [195,210,185,200][i%4],
      }));
    }

    /* ── Spawn magnetic field lines from cursor ── */
    function spawnMagLine() {
      if (M.x<0) return;
      const spd = Math.hypot(M.vx,M.vy);
      if (spd < 2) return;
      const angle = Math.atan2(M.vy, M.vx);
      const pts: {x:number;y:number}[] = [];
      let cx=M.x, cy=M.y;
      for (let i=0;i<18;i++){
        pts.push({x:cx,y:cy});
        const noise = (Math.random()-0.5)*18;
        cx += Math.cos(angle+noise*0.1)*12;
        cy += Math.sin(angle+noise*0.1)*12;
      }
      MAGLINES.push({pts, a:0.7+Math.random()*0.3, hue:190+Math.random()*20});
    }

    function spawnSparks(x:number,y:number,n=16) {
      for (let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2, s=1.5+Math.random()*4;
        SPARKS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:40+Math.random()*45,hue:190+Math.random()*20});
      }
    }

    /* ── Draw one frame ── */
    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;

      /* 1 — BG image */
      if (imgOK) {
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
      } else {
        ctx.fillStyle="hsl(205,80%,3%)"; ctx.fillRect(0,0,W,H);
      }

      /* 2 — Dark atmospheric overlay with iris tint */
      const iris = ctx.createRadialGradient(W*.5,H*.48,0,W*.5,H*.48,W*.52);
      iris.addColorStop(0,`rgba(0,180,255,${0.06+0.03*Math.sin(T*0.7)})`);
      iris.addColorStop(0.4,"rgba(0,80,160,0.04)");
      iris.addColorStop(1,"transparent");
      ctx.fillStyle="rgba(0,5,18,0.62)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle=iris; ctx.fillRect(0,0,W,H);

      /* 3 — Neural nodes */
      for (const n of NODES) {
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0){n.x=W;}  if(n.x>W){n.x=0;}
        if(n.y<0){n.y=H;}  if(n.y>H){n.y=0;}
        /* Magnetic attraction toward cursor */
        if (M.x>0){
          const dx=M.x-n.x, dy=M.y-n.y;
          const d=Math.hypot(dx,dy);
          if(d<240&&d>1){
            const force=0.018*(1-d/240);
            n.vx+=dx/d*force; n.vy+=dy/d*force;
            /* nodes near cursor pulse larger */
            n.r=n.baseR*(1+0.8*(1-d/240));
          } else { n.r+=(n.baseR-n.r)*0.1; }
        }
        const spd=Math.hypot(n.vx,n.vy);
        if(spd>1.1){n.vx*=1.1/spd;n.vy*=1.1/spd;}
        n.vx*=0.992; n.vy*=0.992;
      }
      /* Edges */
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const dx=NODES[i].x-NODES[j].x, dy=NODES[i].y-NODES[j].y;
          const d=Math.hypot(dx,dy);
          if(d>155)continue;
          const a=(1-d/155)*0.14;
          ctx.beginPath();ctx.moveTo(NODES[i].x,NODES[i].y);ctx.lineTo(NODES[j].x,NODES[j].y);
          ctx.strokeStyle=`rgba(0,200,255,${a})`; ctx.lineWidth=0.55; ctx.stroke();
        }
      }
      /* Node dots */
      const pulse=0.55+0.45*Math.sin(T*1.4);
      for(const n of NODES){
        if(n.baseR>3){
          ctx.save(); ctx.shadowBlur=16*pulse; ctx.shadowColor=`hsla(${n.hue},100%,65%,0.8)`;
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(0.9+0.2*pulse),0,Math.PI*2);
          ctx.fillStyle=`hsla(${n.hue},100%,70%,${n.bright*pulse})`; ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*2.2,0,Math.PI*2);
          ctx.strokeStyle=`hsla(${n.hue},100%,70%,${0.15*pulse})`; ctx.lineWidth=0.8; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(0.85+0.2*pulse),0,Math.PI*2);
          ctx.fillStyle=`hsla(${n.hue},100%,68%,${n.bright*0.65*pulse})`; ctx.fill();
        }
      }

      /* 4 — Mouse magnetic aura — dual layered iris glow */
      if(M.x>0){
        /* Outer warm glow */
        const R1=200+20*Math.sin(T*2.8);
        const mg1=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R1);
        mg1.addColorStop(0,`rgba(0,200,255,${0.13+0.05*Math.sin(T*4)})`);
        mg1.addColorStop(0.35,"rgba(0,100,200,0.05)");
        mg1.addColorStop(1,"transparent");
        ctx.fillStyle=mg1; ctx.beginPath(); ctx.arc(M.x,M.y,R1,0,Math.PI*2); ctx.fill();

        /* Inner tight electric core */
        const R2=40+8*Math.sin(T*7);
        const mg2=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R2);
        mg2.addColorStop(0,`rgba(120,220,255,${0.28+0.1*Math.sin(T*6)})`);
        mg2.addColorStop(0.5,`rgba(0,180,255,${0.1})`);
        mg2.addColorStop(1,"transparent");
        ctx.fillStyle=mg2; ctx.beginPath(); ctx.arc(M.x,M.y,R2,0,Math.PI*2); ctx.fill();

        /* Rotating iris ring around cursor */
        ctx.save();
        ctx.translate(M.x,M.y);
        ctx.rotate(T*1.8);
        ctx.beginPath();
        ctx.arc(0,0,28+4*Math.sin(T*5),0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,210,255,${0.45+0.2*Math.sin(T*3)})`;
        ctx.lineWidth=1.2; ctx.setLineDash([6,14]); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        /* Counter-rotating inner iris ring */
        ctx.save();
        ctx.translate(M.x,M.y);
        ctx.rotate(-T*2.6);
        ctx.beginPath();
        ctx.arc(0,0,16+2*Math.sin(T*8),0,Math.PI*2);
        ctx.strokeStyle=`rgba(100,240,255,${0.35+0.15*Math.sin(T*4)})`;
        ctx.lineWidth=0.8; ctx.setLineDash([3,8]); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        /* Scan cross-hairs */
        const ch=22; const ca=0.25+0.12*Math.sin(T*3);
        ctx.strokeStyle=`rgba(0,220,255,${ca})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(M.x-ch,M.y); ctx.lineTo(M.x+ch,M.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x,M.y-ch); ctx.lineTo(M.x,M.y+ch); ctx.stroke();
      }

      /* 5 — Mouse trail */
      if(M.x>0) TRAIL.push({x:M.x,y:M.y,t:T});
      while(TRAIL.length>0&&T-TRAIL[0].t>0.5) TRAIL.shift();
      for(let i=1;i<TRAIL.length;i++){
        const age=(T-TRAIL[i].t)/0.5;
        ctx.beginPath(); ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y); ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
        ctx.strokeStyle=`rgba(0,210,255,${(1-age)*0.5})`; ctx.lineWidth=(1-age)*2.4; ctx.stroke();
      }

      /* 6 — Magnetic field lines from fast mouse movement */
      spawnMagLine();
      for(let i=MAGLINES.length-1;i>=0;i--){
        const ml=MAGLINES[i]; ml.a*=0.88;
        if(ml.a<0.03){MAGLINES.splice(i,1);continue;}
        ctx.beginPath();
        ctx.moveTo(ml.pts[0].x,ml.pts[0].y);
        for(let j=1;j<ml.pts.length;j++) ctx.lineTo(ml.pts[j].x,ml.pts[j].y);
        ctx.strokeStyle=`hsla(${ml.hue},100%,72%,${ml.a*0.6})`; ctx.lineWidth=1; ctx.stroke();
      }

      /* 7 — Click rings + sparks */
      if(M.click&&M.x>0){
        RINGS.push({x:M.x,y:M.y,r:6,maxR:120,a:0.9,w:2,hue:195});
        RINGS.push({x:M.x,y:M.y,r:6,maxR:72,a:0.7,w:1.4,hue:210});
        RINGS.push({x:M.x,y:M.y,r:6,maxR:40,a:0.5,w:1,hue:185});
        spawnSparks(M.x,M.y);
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const rp=RINGS[i]; rp.r+=3.5; rp.a*=0.90;
        ctx.save(); ctx.shadowBlur=14; ctx.shadowColor=`hsla(${rp.hue},100%,65%,0.7)`;
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${rp.hue},100%,72%,${rp.a})`; ctx.lineWidth=rp.w; ctx.stroke(); ctx.restore();
        if(rp.r>=rp.maxR) RINGS.splice(i,1);
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.96; s.vy*=0.96; s.life++;
        if(s.life>=s.ml){SPARKS.splice(i,1);continue;}
        const p=s.life/s.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.8*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=`hsla(${s.hue},100%,78%,${Math.max(0,a)*0.9})`; ctx.fill();
      }

      /* 8 — Slow iris-scan horizontal line */
      const sY=((T*0.034)%1)*H;
      const sg=ctx.createLinearGradient(0,sY-1.5,0,sY+1.5);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,"rgba(0,210,255,0.04)"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,sY-1.5,W,3);

      /* 9 — Edge vignette */
      const vg=ctx.createRadialGradient(W/2,H/2,W*0.2,W/2,H/2,W*0.9);
      vg.addColorStop(0,"transparent"); vg.addColorStop(1,"rgba(0,3,14,0.82)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    initNodes();
    ctx.fillStyle="hsl(205,80%,3%)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
