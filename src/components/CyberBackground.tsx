import React, { useEffect, useRef } from "react";

/*
  best.jpg — Mystical Eye Background
  Palette: deep teal #0a2535, cyan iris #4dd9e8, amber/gold accents #c8851a,
           dark bark/slate #0d1a20, electric blue highlight #1a8fa8
  Effects: organic vein-like particle streams, iris pulse rings,
           amber spark particles, deep forest node network
  Mouse:   organic ripple from iris, amber spark trail, veining lines
*/
export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    // ── Mouse ──
    const M = { x: -999, y: -999, px: -999, py: -999, vx: 0, vy: 0, down: false, click: false };
    const onMove = (e: MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown = () => { M.down=true; M.click=true; setTimeout(()=>{ M.click=false; },200); };
    const onUp   = () => { M.down=false; };
    const onOut  = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove", onMove, {passive:true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseleave",onOut);

    // ── Resize ──
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; initNodes(); };
    window.addEventListener("resize", resize);

    // ── Image ──
    const img = new Image();
    img.src = "/best.jpg";
    let imgOK = false;
    img.onload  = () => { imgOK = true; };
    img.onerror = () => { imgOK = false; };

    // ── Types ──
    interface Node  { x:number; y:number; vx:number; vy:number; r:number; baseR:number; hue:number; sat:number; }
    interface Ring  { x:number; y:number; r:number; maxR:number; a:number; w:number; amber:boolean; }
    interface Spark { x:number; y:number; vx:number; vy:number; life:number; ml:number; amber:boolean; }
    interface Vein  { pts:{x:number;y:number}[]; a:number; amber:boolean; }
    interface Trail { x:number; y:number; t:number; }

    let NODES: Node[] = [];
    const RINGS:  Ring[]  = [];
    const SPARKS: Spark[] = [];
    const VEINS:  Vein[]  = [];
    const TRAIL:  Trail[] = [];

    function initNodes() {
      const W=canvas.width, H=canvas.height;
      NODES = Array.from({length:48},(_,i)=>({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22,
        r: i<6 ? 3+Math.random()*2 : 1+Math.random()*1.8,
        baseR: i<6 ? 3+Math.random()*2 : 1+Math.random()*1.8,
        // Mix cyan nodes with amber accent nodes
        hue: i%7===0 ? 38 : i%5===0 ? 185 : 195,
        sat: i%7===0 ? 80 : 100,
      }));
    }

    function spawnVein() {
      if (M.x<0) return;
      const spd = Math.hypot(M.vx, M.vy);
      if (spd < 1.5) return;
      const angle = Math.atan2(M.vy, M.vx);
      const pts: {x:number;y:number}[] = [];
      let cx=M.x, cy=M.y;
      for (let i=0;i<22;i++){
        pts.push({x:cx,y:cy});
        // Organic branching vein-like curves
        const curl = (Math.random()-0.5)*0.6;
        cx += Math.cos(angle+curl)*10 + (Math.random()-0.5)*4;
        cy += Math.sin(angle+curl)*10 + (Math.random()-0.5)*4;
      }
      const amber = Math.random() > 0.6;
      VEINS.push({pts, a:0.65+Math.random()*0.35, amber});
    }

    function spawnSparks(x:number, y:number, n=18) {
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2, s=1.5+Math.random()*4.5;
        const amber = Math.random() > 0.5;
        SPARKS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,ml:38+Math.random()*42,amber});
      }
    }

    function draw() {
      T += 0.016;
      const W=canvas.width, H=canvas.height;
      // Centre of the eye in the image (roughly 50% x, 42% y)
      const EX=W*0.5, EY=H*0.42;

      /* ── 1. Draw background image — NO heavy overlay, original colours ── */
      if (imgOK) {
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
      } else {
        const g=ctx.createLinearGradient(0,0,W,H);
        g.addColorStop(0,"hsl(205,60%,6%)"); g.addColorStop(1,"hsl(195,55%,4%)");
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      }

      /* ── 2. Minimal atmospheric tint — VERY light, preserves image ── */
      // Only a faint dark vignette at outer edges, not a full-screen overlay
      const vg=ctx.createRadialGradient(EX,EY,W*0.18,EX,EY,W*0.85);
      vg.addColorStop(0,"transparent");
      vg.addColorStop(0.7,"rgba(0,8,16,0.10)");
      vg.addColorStop(1,"rgba(0,4,12,0.45)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      /* ── 3. Nodes — deep teal + amber accents ── */
      for(const n of NODES){
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0)n.x=W; if(n.x>W)n.x=0;
        if(n.y<0)n.y=H; if(n.y>H)n.y=0;
        // Attracted toward cursor
        if(M.x>0){
          const dx=M.x-n.x, dy=M.y-n.y, d=Math.hypot(dx,dy);
          if(d<220&&d>1){ const f=0.016*(1-d/220); n.vx+=dx/d*f; n.vy+=dy/d*f; n.r=n.baseR*(1+0.7*(1-d/220)); }
          else n.r+=(n.baseR-n.r)*0.08;
        }
        const spd=Math.hypot(n.vx,n.vy);
        if(spd>0.9){n.vx*=0.9/spd;n.vy*=0.9/spd;}
        n.vx*=0.994; n.vy*=0.994;
      }
      // Edges — organic vein-like connections
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const dx=NODES[i].x-NODES[j].x, dy=NODES[i].y-NODES[j].y, d=Math.hypot(dx,dy);
          if(d>140)continue;
          const a=(1-d/140)*0.12;
          const isAmber=NODES[i].hue===38||NODES[j].hue===38;
          ctx.beginPath();ctx.moveTo(NODES[i].x,NODES[i].y);ctx.lineTo(NODES[j].x,NODES[j].y);
          ctx.strokeStyle=isAmber?`rgba(200,130,20,${a*0.8})`:`rgba(60,200,220,${a})`;
          ctx.lineWidth=0.5; ctx.stroke();
        }
      }
      const pulse=0.5+0.5*Math.sin(T*1.3);
      for(const n of NODES){
        const isAmber=n.hue===38;
        const col=isAmber?`hsla(38,80%,58%,${n.baseR>2?0.7*pulse:0.45*pulse})`:`hsla(${n.hue},${n.sat}%,68%,${n.baseR>2?0.75*pulse:0.4*pulse})`;
        if(n.baseR>2){
          ctx.save();
          ctx.shadowBlur=isAmber?12:14;
          ctx.shadowColor=isAmber?"rgba(200,130,20,0.7)":"rgba(40,190,220,0.7)";
          ctx.beginPath();ctx.arc(n.x,n.y,n.r*(0.9+0.15*pulse),0,Math.PI*2);
          ctx.fillStyle=col;ctx.fill();ctx.restore();
          ctx.beginPath();ctx.arc(n.x,n.y,n.r*2.4,0,Math.PI*2);
          ctx.strokeStyle=isAmber?`rgba(200,130,20,${0.14*pulse})`:`rgba(60,200,220,${0.14*pulse})`;
          ctx.lineWidth=0.7;ctx.stroke();
        } else {
          ctx.beginPath();ctx.arc(n.x,n.y,n.r*(0.85+0.2*pulse),0,Math.PI*2);
          ctx.fillStyle=col;ctx.fill();
        }
      }

      /* ── 4. Iris pulse rings from eye centre — organic slow breath ── */
      const irisR1 = W*0.08 + W*0.012*Math.sin(T*0.8);
      const irisR2 = W*0.13 + W*0.008*Math.sin(T*0.6+1);
      const irisR3 = W*0.19 + W*0.005*Math.sin(T*0.5+2);
      [[irisR1,0.12],[irisR2,0.07],[irisR3,0.04]].forEach(([r,a])=>{
        ctx.save();
        ctx.shadowBlur=12; ctx.shadowColor="rgba(40,190,230,0.4)";
        ctx.beginPath();ctx.arc(EX,EY,r as number,0,Math.PI*2);
        ctx.strokeStyle=`rgba(60,195,225,${(a as number)*(0.8+0.2*Math.sin(T*0.9))})`;
        ctx.lineWidth=0.8;ctx.setLineDash([8,22]);ctx.stroke();ctx.setLineDash([]);
        ctx.restore();
      });

      /* ── 5. Mouse — organic iris aura matching eye colours ── */
      if(M.x>0){
        // Outer iris-like glow — teal
        const R1=180+16*Math.sin(T*2.2);
        const g1=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R1);
        g1.addColorStop(0,`rgba(40,190,220,${0.12+0.04*Math.sin(T*3.5)})`);
        g1.addColorStop(0.4,"rgba(20,140,180,0.04)");
        g1.addColorStop(1,"transparent");
        ctx.fillStyle=g1;ctx.beginPath();ctx.arc(M.x,M.y,R1,0,Math.PI*2);ctx.fill();

        // Inner amber glow — matches the gold in the iris
        const R2=38+5*Math.sin(T*6);
        const g2=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R2);
        g2.addColorStop(0,`rgba(200,140,30,${0.22+0.08*Math.sin(T*5)})`);
        g2.addColorStop(0.6,"rgba(160,100,20,0.06)");
        g2.addColorStop(1,"transparent");
        ctx.fillStyle=g2;ctx.beginPath();ctx.arc(M.x,M.y,R2,0,Math.PI*2);ctx.fill();

        // Rotating iris ring — teal dashed
        ctx.save();ctx.translate(M.x,M.y);ctx.rotate(T*1.6);
        ctx.beginPath();ctx.arc(0,0,28+3*Math.sin(T*4),0,Math.PI*2);
        ctx.strokeStyle=`rgba(50,200,225,${0.5+0.2*Math.sin(T*2.8)})`;
        ctx.lineWidth=1;ctx.setLineDash([5,12]);ctx.stroke();ctx.setLineDash([]);ctx.restore();

        // Reverse amber ring
        ctx.save();ctx.translate(M.x,M.y);ctx.rotate(-T*2.2);
        ctx.beginPath();ctx.arc(0,0,18+2*Math.sin(T*7),0,Math.PI*2);
        ctx.strokeStyle=`rgba(200,140,30,${0.4+0.15*Math.sin(T*4)})`;
        ctx.lineWidth=0.8;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);ctx.restore();

        // Crosshair
        const ch=20, ca=0.22+0.1*Math.sin(T*2.5);
        ctx.strokeStyle=`rgba(60,200,220,${ca})`;ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(M.x-ch,M.y);ctx.lineTo(M.x+ch,M.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(M.x,M.y-ch);ctx.lineTo(M.x,M.y+ch);ctx.stroke();
      }

      /* ── 6. Vein trail ── */
      if(M.x>0) TRAIL.push({x:M.x,y:M.y,t:T});
      while(TRAIL.length>0&&T-TRAIL[0].t>0.45) TRAIL.shift();
      for(let i=1;i<TRAIL.length;i++){
        const age=(T-TRAIL[i].t)/0.45;
        ctx.beginPath();ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y);ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
        ctx.strokeStyle=`rgba(50,195,220,${(1-age)*0.42})`;
        ctx.lineWidth=(1-age)*2;ctx.stroke();
      }

      /* ── 7. Organic vein lines from fast movement ── */
      spawnVein();
      for(let i=VEINS.length-1;i>=0;i--){
        const v=VEINS[i]; v.a*=0.87;
        if(v.a<0.02){VEINS.splice(i,1);continue;}
        ctx.beginPath();ctx.moveTo(v.pts[0].x,v.pts[0].y);
        for(let j=1;j<v.pts.length;j++)ctx.lineTo(v.pts[j].x,v.pts[j].y);
        ctx.strokeStyle=v.amber?`rgba(200,140,30,${v.a*0.55})`:`rgba(50,195,220,${v.a*0.5})`;
        ctx.lineWidth=0.9;ctx.stroke();
      }

      /* ── 8. Click — iris burst rings + amber + teal sparks ── */
      if(M.click&&M.x>0){
        RINGS.push({x:M.x,y:M.y,r:5,maxR:130,a:0.9,w:1.8,amber:false});
        RINGS.push({x:M.x,y:M.y,r:5,maxR:80, a:0.7,w:1.3,amber:true});
        RINGS.push({x:M.x,y:M.y,r:5,maxR:44, a:0.5,w:1,  amber:false});
        spawnSparks(M.x,M.y);
      }
      for(let i=RINGS.length-1;i>=0;i--){
        const rp=RINGS[i]; rp.r+=3.2; rp.a*=0.91;
        ctx.save();
        ctx.shadowBlur=12;
        ctx.shadowColor=rp.amber?"rgba(200,140,30,0.7)":"rgba(40,190,220,0.7)";
        ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=rp.amber?`rgba(200,140,30,${rp.a})`:`rgba(50,200,225,${rp.a})`;
        ctx.lineWidth=rp.w;ctx.stroke();ctx.restore();
        if(rp.r>=rp.maxR)RINGS.splice(i,1);
      }
      for(let i=SPARKS.length-1;i>=0;i--){
        const s=SPARKS[i]; s.x+=s.vx;s.y+=s.vy;s.vx*=0.965;s.vy*=0.965;s.life++;
        if(s.life>=s.ml){SPARKS.splice(i,1);continue;}
        const p=s.life/s.ml, a=p<0.2?p/0.2:1-(p-0.2)/0.8;
        ctx.beginPath();ctx.arc(s.x,s.y,2.5*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=s.amber?`rgba(210,150,40,${Math.max(0,a)*0.88})`:`rgba(50,200,225,${Math.max(0,a)*0.88})`;
        ctx.fill();
      }

      /* ── 9. Slow vertical scan — very subtle, like an iris sweep ── */
      const sY=((T*0.028)%1)*H;
      const sg=ctx.createLinearGradient(0,sY-2,0,sY+2);
      sg.addColorStop(0,"transparent");sg.addColorStop(0.5,"rgba(50,195,220,0.025)");sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg;ctx.fillRect(0,sY-2,W,4);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    initNodes();
    ctx.fillStyle="hsl(205,55%,5%)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave",onOut);
    };
  },[]);

  return(
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>
    </div>
  );
}
