import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, T = 0;

    // ── Mouse state ──────────────────────────────────────────
    const M = { x:-999, y:-999, px:-999, py:-999, vx:0, vy:0, down:false, click:false };
    const onMove  = (e:MouseEvent) => { M.px=M.x; M.py=M.y; M.x=e.clientX; M.y=e.clientY; M.vx=M.x-M.px; M.vy=M.y-M.py; };
    const onDown  = () => { M.down=true; M.click=true; setTimeout(()=>{M.click=false;},200); };
    const onUp    = () => { M.down=false; };
    const onLeave = () => { M.x=-999; M.y=-999; };
    window.addEventListener("mousemove",  onMove,  {passive:true});
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; buildParticles(); };
    window.addEventListener("resize", resize);

    // ── Load image ───────────────────────────────────────────
    const img = new Image();
    img.src = "/best.jpg";
    let imgReady = false;
    img.onload  = () => { imgReady = true; };
    img.onerror = () => { imgReady = false; };

    // ── Types ─────────────────────────────────────────────────
    type Vec = {x:number;y:number};
    interface Orb    { x:number;y:number;vx:number;vy:number;r:number;base:number;teal:boolean; }
    interface Ripple { x:number;y:number;r:number;max:number;a:number;w:number;teal:boolean; }
    interface Ember  { x:number;y:number;vx:number;vy:number;age:number;life:number;teal:boolean; }
    interface Vein   { pts:Vec[];a:number;teal:boolean; }
    interface Crumb  { x:number;y:number;t:number; }

    let   ORBS:   Orb[]    = [];
    const RIPPLES:Ripple[] = [];
    const EMBERS: Ember[]  = [];
    const VEINS:  Vein[]   = [];
    const CRUMBS: Crumb[]  = [];

    function buildParticles() {
      const W=canvas.width, H=canvas.height;
      ORBS = Array.from({length:60},(_,i)=>({
        x: Math.random()*W,  y: Math.random()*H,
        vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22,
        r:0, base: i<9 ? 2.6+Math.random()*2 : 0.8+Math.random()*1.6,
        teal: i%7!==0,          // most are teal; every 7th is amber
      }));
      ORBS.forEach(o=>{ o.r=o.base; });
    }

    function growVein() {
      if(M.x<0) return;
      if(Math.hypot(M.vx,M.vy)<1.8) return;
      const ang=Math.atan2(M.vy,M.vx);
      const pts:Vec[]=[];
      let cx=M.x, cy=M.y;
      for(let i=0;i<26;i++){
        pts.push({x:cx,y:cy});
        const c=(Math.random()-0.5)*0.65;
        cx+=Math.cos(ang+c)*10+(Math.random()-0.5)*4;
        cy+=Math.sin(ang+c)*10+(Math.random()-0.5)*4;
      }
      VEINS.push({pts, a:0.65+Math.random()*0.35, teal:Math.random()>0.4});
    }

    function burst(x:number,y:number) {
      for(let i=0;i<22;i++){
        const a=Math.random()*Math.PI*2, s=1.6+Math.random()*4.8;
        EMBERS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:40+Math.random()*48,teal:Math.random()>0.42});
      }
    }

    // Teal colour:  hsl(192,68%) — matches the iris cyan
    // Amber colour: hsl(36,82%)  — matches the gold veins
    const TEAL  = (a:number) => `rgba(48,190,220,${a})`;
    const AMBER = (a:number) => `rgba(204,144,32,${a})`;
    const C     = (teal:boolean,a:number) => teal ? TEAL(a) : AMBER(a);

    // ── Main draw loop ────────────────────────────────────────
    function draw() {
      T+=0.016;
      const W=canvas.width, H=canvas.height;

      // 1 ── Draw image — PIXEL PERFECT, covers full canvas
      if(imgReady){
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){ iw=W; ih=W/iAR; ix=0; iy=(H-ih)/2; }
        else        { ih=H; iw=H*iAR; ix=(W-iw)/2; iy=0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle="#020e18"; ctx.fillRect(0,0,W,H);
      }

      // 2 ── Micro vignette — outer edge only, eye stays 100% visible
      const vig=ctx.createRadialGradient(W*.5,H*.44,W*.18,W*.5,H*.44,W*.84);
      vig.addColorStop(0,"transparent");
      vig.addColorStop(0.72,"rgba(1,6,12,0.06)");
      vig.addColorStop(1,"rgba(0,4,10,0.38)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

      // 3 ── Orbs (floating particles)
      for(const o of ORBS){
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<0)o.x=W; if(o.x>W)o.x=0;
        if(o.y<0)o.y=H; if(o.y>H)o.y=0;
        if(M.x>0){
          const dx=M.x-o.x,dy=M.y-o.y,d=Math.hypot(dx,dy);
          if(d<240&&d>0.5){
            const f=0.019*(1-d/240); o.vx+=dx/d*f; o.vy+=dy/d*f;
            o.r=o.base*(1+0.9*(1-d/240));
          } else { o.r+=(o.base-o.r)*0.08; }
        } else { o.r+=(o.base-o.r)*0.04; }
        const spd=Math.hypot(o.vx,o.vy);
        if(spd>0.98){o.vx*=0.98/spd;o.vy*=0.98/spd;}
        o.vx*=0.993; o.vy*=0.993;
      }

      // Orb connections
      for(let i=0;i<ORBS.length;i++){
        for(let j=i+1;j<ORBS.length;j++){
          const dx=ORBS[i].x-ORBS[j].x, dy=ORBS[i].y-ORBS[j].y, d=Math.hypot(dx,dy);
          if(d>148) continue;
          const a=(1-d/148)*0.10;
          const both=ORBS[i].teal&&ORBS[j].teal;
          ctx.beginPath(); ctx.moveTo(ORBS[i].x,ORBS[i].y); ctx.lineTo(ORBS[j].x,ORBS[j].y);
          ctx.strokeStyle=both?TEAL(a):AMBER(a*0.9); ctx.lineWidth=0.5; ctx.stroke();
        }
      }

      // Orb dots
      const pulse=0.48+0.52*Math.sin(T*1.35);
      for(const o of ORBS){
        const a=o.base>2?0.78*pulse:0.42*pulse;
        if(o.base>2){
          ctx.save(); ctx.shadowBlur=15; ctx.shadowColor=C(o.teal,0.75);
          ctx.beginPath(); ctx.arc(o.x,o.y,o.r*(0.9+0.15*pulse),0,Math.PI*2);
          ctx.fillStyle=C(o.teal,a); ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.arc(o.x,o.y,o.r*2.6,0,Math.PI*2);
          ctx.strokeStyle=C(o.teal,0.10*pulse); ctx.lineWidth=0.65; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(o.x,o.y,o.r*(0.85+0.2*pulse),0,Math.PI*2);
          ctx.fillStyle=C(o.teal,a); ctx.fill();
        }
      }

      // 4 ── Iris rings from eye centre (breathing slowly)
      const EX=W*0.5, EY=H*0.44;
      const irisRings:Array<[number,number]> = [
        [W*0.068, 0.11],[W*0.112, 0.070],[W*0.172, 0.042],[W*0.245, 0.023],
      ];
      irisRings.forEach(([r,alpha],i)=>{
        const br=r+W*0.006*Math.sin(T*0.62+i);
        ctx.save(); ctx.shadowBlur=9; ctx.shadowColor=TEAL(0.30);
        ctx.beginPath(); ctx.arc(EX,EY,br,0,Math.PI*2);
        ctx.strokeStyle=TEAL(alpha*(0.72+0.28*Math.sin(T*0.75+i)));
        ctx.lineWidth=0.75; ctx.setLineDash([7,22]); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      });
      // Amber inner rings (gold veins)
      [[W*0.052,0.09],[W*0.088,0.055]].forEach(([r,alpha],i)=>{
        const br=(r as number)+W*0.004*Math.sin(T*0.88+i+1.5);
        ctx.beginPath(); ctx.arc(EX,EY,br,0,Math.PI*2);
        ctx.strokeStyle=AMBER((alpha as number)*(0.68+0.32*Math.sin(T*1.05+i)));
        ctx.lineWidth=0.6; ctx.setLineDash([4,18]); ctx.stroke(); ctx.setLineDash([]);
      });

      // 5 ── MOUSE interactive layer
      if(M.x>0){
        // ── Outer teal iris bloom (large soft glow)
        const R1=195+20*Math.sin(T*2.1);
        const g1=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R1);
        g1.addColorStop(0,TEAL(0.12+0.045*Math.sin(T*3.4)));
        g1.addColorStop(0.42,"rgba(20,130,168,0.03)");
        g1.addColorStop(1,"transparent");
        ctx.fillStyle=g1; ctx.beginPath(); ctx.arc(M.x,M.y,R1,0,Math.PI*2); ctx.fill();

        // ── Inner amber ember glow (warm gold core)
        const R2=38+5.5*Math.sin(T*6.2);
        const g2=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,R2);
        g2.addColorStop(0,AMBER(0.26+0.10*Math.sin(T*5.2)));
        g2.addColorStop(0.55,"rgba(160,100,16,0.05)");
        g2.addColorStop(1,"transparent");
        ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(M.x,M.y,R2,0,Math.PI*2); ctx.fill();

        // ── Rotating teal dashed iris ring
        ctx.save(); ctx.translate(M.x,M.y); ctx.rotate(T*1.75);
        ctx.beginPath(); ctx.arc(0,0,31+3.8*Math.sin(T*4.0),0,Math.PI*2);
        ctx.strokeStyle=TEAL(0.54+0.22*Math.sin(T*2.7));
        ctx.lineWidth=1.1; ctx.setLineDash([6,14]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

        // ── Counter-rotating amber ring
        ctx.save(); ctx.translate(M.x,M.y); ctx.rotate(-T*2.6);
        ctx.beginPath(); ctx.arc(0,0,20+2.2*Math.sin(T*7.2),0,Math.PI*2);
        ctx.strokeStyle=AMBER(0.44+0.18*Math.sin(T*3.8));
        ctx.lineWidth=0.85; ctx.setLineDash([3,9]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

        // ── Slow outer amber ring
        ctx.save(); ctx.translate(M.x,M.y); ctx.rotate(T*0.55);
        ctx.beginPath(); ctx.arc(0,0,52+4*Math.sin(T*1.8),0,Math.PI*2);
        ctx.strokeStyle=AMBER(0.18+0.08*Math.sin(T*2.0));
        ctx.lineWidth=0.65; ctx.setLineDash([2,28]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

        // ── Crosshairs
        const ch=24, ca=0.25+0.11*Math.sin(T*2.5);
        ctx.strokeStyle=TEAL(ca); ctx.lineWidth=0.72;
        ctx.beginPath(); ctx.moveTo(M.x-ch,M.y); ctx.lineTo(M.x+ch,M.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x,M.y-ch); ctx.lineTo(M.x,M.y+ch); ctx.stroke();

        // ── Amber corner targeting brackets
        const bl=9, bd=20;
        ctx.strokeStyle=AMBER(ca*1.15); ctx.lineWidth=0.95;
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{
          const bx=M.x+sx*bd, by=M.y+sy*bd;
          ctx.beginPath();
          ctx.moveTo(bx, by-sy*bl); ctx.lineTo(bx,by); ctx.lineTo(bx-sx*bl,by);
          ctx.stroke();
        });
      }

      // 6 ── Crumb trail (fading path)
      if(M.x>0) CRUMBS.push({x:M.x,y:M.y,t:T});
      while(CRUMBS.length>0&&T-CRUMBS[0].t>0.50) CRUMBS.shift();
      for(let i=1;i<CRUMBS.length;i++){
        const age=(T-CRUMBS[i].t)/0.50;
        ctx.beginPath(); ctx.moveTo(CRUMBS[i-1].x,CRUMBS[i-1].y); ctx.lineTo(CRUMBS[i].x,CRUMBS[i].y);
        ctx.strokeStyle=TEAL((1-age)*0.44); ctx.lineWidth=(1-age)*2.3; ctx.stroke();
      }

      // 7 ── Organic vein tendrils from fast movement
      growVein();
      for(let i=VEINS.length-1;i>=0;i--){
        const v=VEINS[i]; v.a*=0.855;
        if(v.a<0.018){VEINS.splice(i,1);continue;}
        ctx.beginPath(); ctx.moveTo(v.pts[0].x,v.pts[0].y);
        for(let j=1;j<v.pts.length;j++) ctx.lineTo(v.pts[j].x,v.pts[j].y);
        ctx.strokeStyle=v.teal?TEAL(v.a*0.48):AMBER(v.a*0.50);
        ctx.lineWidth=0.9; ctx.stroke();
      }

      // 8 ── Click ripples + ember sparks
      if(M.click&&M.x>0){
        RIPPLES.push({x:M.x,y:M.y,r:5,max:140,a:0.92,w:2.0,teal:true });
        RIPPLES.push({x:M.x,y:M.y,r:5,max:88, a:0.72,w:1.4,teal:false});
        RIPPLES.push({x:M.x,y:M.y,r:5,max:48, a:0.52,w:1.0,teal:true });
        burst(M.x,M.y);
      }
      for(let i=RIPPLES.length-1;i>=0;i--){
        const rp=RIPPLES[i]; rp.r+=3.5; rp.a*=0.905;
        ctx.save(); ctx.shadowBlur=14; ctx.shadowColor=C(rp.teal,0.72);
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=C(rp.teal,rp.a); ctx.lineWidth=rp.w; ctx.stroke(); ctx.restore();
        if(rp.r>=rp.max) RIPPLES.splice(i,1);
      }
      for(let i=EMBERS.length-1;i>=0;i--){
        const e=EMBERS[i]; e.x+=e.vx; e.y+=e.vy; e.vx*=0.962; e.vy*=0.962; e.age++;
        if(e.age>=e.life){EMBERS.splice(i,1);continue;}
        const p=e.age/e.life, a=p<0.18?p/0.18:1-(p-0.18)/0.82;
        ctx.beginPath(); ctx.arc(e.x,e.y,2.7*(1-p*0.5),0,Math.PI*2);
        ctx.fillStyle=C(e.teal,Math.max(0,a)*0.92); ctx.fill();
      }

      // 9 ── Whisper scan line (eye sweep effect, barely visible)
      const sY=((T*0.025)%1)*H;
      const sg=ctx.createLinearGradient(0,sY-2,0,sY+2);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,TEAL(0.020)); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,sY-2,W,4);

      raf=requestAnimationFrame(draw);
    }

    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    buildParticles();
    ctx.fillStyle="#020e18"; ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:0}} aria-hidden>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
