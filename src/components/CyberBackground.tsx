import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, t = 0;

    const M = { x: window.innerWidth/2, y: window.innerHeight/2, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => (M.click = false), 200); };
    const onUp    = () => { M.down = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Background image
    const img = new Image();
    img.src = "/hex_bg.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    interface Ripple { x:number; y:number; r:number; maxR:number; a:number; }
    interface Particle { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; }
    interface Node { x:number; y:number; vx:number; vy:number; r:number; pulse:number; pulseSpd:number; bright:number; }

    const RIPPLES: Ripple[] = [];
    const PARTICLES: Particle[] = [];
    const TRAIL: {x:number;y:number;t:number}[] = [];

    // Floating nodes network
    const NODES: Node[] = Array.from({length:55}, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random()-0.5)*0.28,
      vy: (Math.random()-0.5)*0.28,
      r: i < 8 ? 3.5 + Math.random()*2 : 1.2 + Math.random()*2,
      pulse: Math.random()*Math.PI*2,
      pulseSpd: 0.018 + Math.random()*0.032,
      bright: i < 8 ? 0.85 : 0.35 + Math.random()*0.45,
    }));

    // Vertical data streams
    const STREAMS = Array.from({length:7}, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 0.06 + Math.random()*0.14,
      spd: 0.0005 + Math.random()*0.0008,
    }));

    function spawnParticles(x: number, y: number, n = 12) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI*2*i)/n + Math.random()*0.5;
        const s = 1.2 + Math.random()*3;
        PARTICLES.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0, maxLife:45+Math.random()*40 });
      }
    }

    function draw() {
      t += 0.016;
      const W = canvas.width, H = canvas.height;

      // 1. Background image
      if (imgLoaded) {
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}
        else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle="rgb(3,8,22)"; ctx.fillRect(0,0,W,H);
      }

      // 2. Dark tinted overlay
      ctx.fillStyle="rgba(2,5,18,0.68)"; ctx.fillRect(0,0,W,H);

      // 3. Top & bottom gradient fades for UI readability
      const topFade = ctx.createLinearGradient(0,0,0,90);
      topFade.addColorStop(0,"rgba(2,5,18,0.92)"); topFade.addColorStop(1,"transparent");
      ctx.fillStyle=topFade; ctx.fillRect(0,0,W,90);
      const botFade = ctx.createLinearGradient(0,H-60,0,H);
      botFade.addColorStop(0,"transparent"); botFade.addColorStop(1,"rgba(2,5,18,0.88)");
      ctx.fillStyle=botFade; ctx.fillRect(0,H-60,W,60);

      // 4. Neural network nodes
      NODES.forEach(n => {
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0)n.x=W; if(n.x>W)n.x=0;
        if(n.y<0)n.y=H; if(n.y>H)n.y=0;
        n.pulse+=n.pulseSpd;
        const md=Math.hypot(n.x-M.x,n.y-M.y);
        const prx=Math.max(0,1-md/220);
        if(prx>0.02&&md>1){n.vx+=(n.x-M.x)/md*0.025*prx;n.vy+=(n.y-M.y)/md*0.025*prx;}
        const spd=Math.hypot(n.vx,n.vy);
        if(spd>1.0){n.vx*=1/spd;n.vy*=1/spd;}
        n.vx*=0.992;n.vy*=0.992;
      });
      // Edges
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const a=NODES[i],b=NODES[j];
          const d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d>160)continue;
          const ea=(1-d/160)*0.15;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(50,160,255,${ea})`;ctx.lineWidth=0.55;ctx.stroke();
        }
      }
      // Node dots
      NODES.forEach(n=>{
        const pulse=0.55+0.45*Math.sin(n.pulse);
        const r=n.r*(1+0.2*pulse);
        if(n.r>3){
          ctx.save();ctx.shadowBlur=18*pulse;ctx.shadowColor="rgba(30,150,255,0.8)";
          ctx.beginPath();ctx.arc(n.x,n.y,r*2.2,0,Math.PI*2);
          ctx.strokeStyle=`rgba(50,160,255,${0.18*pulse})`;ctx.lineWidth=0.8;ctx.stroke();
          ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
          ctx.fillStyle=`rgba(80,190,255,${n.bright*pulse})`;ctx.fill();ctx.restore();
        } else {
          ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
          ctx.fillStyle=`rgba(60,170,255,${n.bright*pulse*0.75})`;ctx.fill();
        }
      });

      // 5. Data streams
      STREAMS.forEach(s=>{
        s.y+=s.spd; if(s.y>1+s.len){s.y=-s.len;s.x=Math.random();}
        const x=s.x*W;
        const y1=Math.max(0,(s.y-s.len))*H;
        const y2=Math.min(1,s.y)*H;
        if(y2<=y1)return;
        const g=ctx.createLinearGradient(x,y1,x,y2);
        g.addColorStop(0,"transparent");
        g.addColorStop(0.7,`rgba(40,150,255,0.35)`);
        g.addColorStop(1,`rgba(80,200,255,0.6)`);
        ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);
        ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.stroke();
        ctx.save();ctx.shadowBlur=8;ctx.shadowColor="rgba(60,180,255,0.9)";
        ctx.beginPath();ctx.arc(x,y2,2.2,0,Math.PI*2);
        ctx.fillStyle="rgba(120,220,255,0.8)";ctx.fill();ctx.restore();
      });

      // 6. Mouse aura
      const r1=140+14*Math.sin(t*3.8);
      const aura=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,r1);
      aura.addColorStop(0,`rgba(30,140,255,${0.14+0.05*Math.sin(t*5)})`);
      aura.addColorStop(0.45,"rgba(20,100,220,0.04)");
      aura.addColorStop(1,"transparent");
      ctx.fillStyle=aura;ctx.beginPath();ctx.arc(M.x,M.y,r1,0,Math.PI*2);ctx.fill();

      // 7. Mouse trail
      TRAIL.push({x:M.x,y:M.y,t});
      while(TRAIL.length>0&&t-TRAIL[0].t>0.45)TRAIL.shift();
      for(let i=1;i<TRAIL.length;i++){
        const age=(t-TRAIL[i].t)/0.45;
        ctx.beginPath();ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y);ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
        ctx.strokeStyle=`rgba(60,180,255,${(1-age)*0.4})`;ctx.lineWidth=(1-age)*2.2;ctx.stroke();
      }

      // 8. Particles
      for(let i=PARTICLES.length-1;i>=0;i--){
        const p=PARTICLES[i];p.x+=p.vx;p.y+=p.vy;p.vx*=0.966;p.vy*=0.966;p.life++;
        if(p.life>=p.maxLife){PARTICLES.splice(i,1);continue;}
        const prog=p.life/p.maxLife;
        const a=prog<0.18?prog/0.18:1-(prog-0.18)/0.82;
        ctx.beginPath();ctx.arc(p.x,p.y,2.5*(1-prog*0.6),0,Math.PI*2);
        ctx.fillStyle=`rgba(80,190,255,${Math.max(0,a)*0.85})`;ctx.fill();
      }

      // 9. Click ripples
      if(M.click){
        RIPPLES.push({x:M.x,y:M.y,r:4,maxR:110,a:0.85});
        RIPPLES.push({x:M.x,y:M.y,r:4,maxR:65,a:0.65});
        spawnParticles(M.x,M.y,16);
      }
      for(let i=RIPPLES.length-1;i>=0;i--){
        const rp=RIPPLES[i];rp.r+=3;rp.a*=0.91;
        ctx.save();ctx.shadowBlur=12;ctx.shadowColor="rgba(40,160,255,0.7)";
        ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(60,180,255,${rp.a})`;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
        if(rp.r>=rp.maxR)RIPPLES.splice(i,1);
      }

      // 10. Vignette
      const vg=ctx.createRadialGradient(W/2,H/2,W*0.18,W/2,H/2,W*0.85);
      vg.addColorStop(0,"transparent");vg.addColorStop(1,"rgba(1,3,14,0.82)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

      raf=requestAnimationFrame(draw);
    }

    ctx.fillStyle="rgb(3,8,22)";ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);
    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",resize);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mousedown",onDown);
      window.removeEventListener("mouseup",onUp);
    };
  },[]);

  return(
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>
    </div>
  );
}
