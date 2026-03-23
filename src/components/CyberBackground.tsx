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

    // fb.jpg background
    const img = new Image();
    img.src = "/fb.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    interface Ripple   { x:number; y:number; r:number; maxR:number; a:number; hue:number; }
    interface Particle { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; hue:number; }
    interface Node     { x:number; y:number; vx:number; vy:number; r:number; pulse:number; spd:number; bright:number; }
    interface Stream   { x:number; y:number; len:number; spd:number; hue:number; }

    const RIPPLES:Ripple[]    = [];
    const PARTICLES:Particle[] = [];
    const TRAIL:{x:number;y:number;t:number}[] = [];

    const NODES:Node[] = Array.from({length:55},(_,i)=>({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r: i<8 ? 4+Math.random()*2 : 1.5+Math.random()*2,
      pulse:Math.random()*Math.PI*2, spd:.018+Math.random()*.03,
      bright: i<8 ? .9 : .35+Math.random()*.5,
    }));

    const STREAMS:Stream[] = Array.from({length:8},()=>({
      x:Math.random(), y:Math.random(),
      len:.06+Math.random()*.14, spd:.0004+Math.random()*.0007,
      hue: Math.random()>.5 ? 195 : 215,
    }));

    function sparks(x:number,y:number,n=12){
      for(let i=0;i<n;i++){
        const a=(Math.PI*2*i)/n+Math.random()*.5, s=1+Math.random()*3;
        PARTICLES.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,maxLife:45+Math.random()*40,hue:200+Math.random()*20});
      }
    }

    function draw(){
      t+=.016;
      const W=canvas.width, H=canvas.height;

      // 1. Background image
      if(imgLoaded){
        const iAR=img.width/img.height, cAR=W/H;
        let iw:number,ih:number,ix:number,iy:number;
        if(cAR>iAR){iw=W;ih=W/iAR;ix=0;iy=(H-ih)/2;}else{ih=H;iw=H*iAR;ix=(W-iw)/2;iy=0;}
        ctx.drawImage(img,ix,iy,iw,ih);
      } else {
        ctx.fillStyle="rgb(2,8,22)"; ctx.fillRect(0,0,W,H);
      }

      // 2. Dark overlay — lighter than before so image shows through nicely
      ctx.fillStyle="rgba(1,5,18,0.60)"; ctx.fillRect(0,0,W,H);

      // 3. Top/bottom fade for UI readability
      const tF=ctx.createLinearGradient(0,0,0,80);
      tF.addColorStop(0,"rgba(1,5,18,0.88)"); tF.addColorStop(1,"transparent");
      ctx.fillStyle=tF; ctx.fillRect(0,0,W,80);

      // 4. Neural nodes
      NODES.forEach(n=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0)n.x=W; if(n.x>W)n.x=0; if(n.y<0)n.y=H; if(n.y>H)n.y=0;
        n.pulse+=n.spd;
        const md=Math.hypot(n.x-M.x,n.y-M.y);
        const prx=Math.max(0,1-md/200);
        if(prx>.02&&md>1){n.vx+=(n.x-M.x)/md*.025*prx; n.vy+=(n.y-M.y)/md*.025*prx;}
        const sp=Math.hypot(n.vx,n.vy);
        if(sp>1){n.vx*=1/sp;n.vy*=1/sp;} n.vx*=.992;n.vy*=.992;
      });
      for(let i=0;i<NODES.length;i++){
        for(let j=i+1;j<NODES.length;j++){
          const a=NODES[i],b=NODES[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d>155)continue;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(60,180,255,${(1-d/155)*.13})`;ctx.lineWidth=.5;ctx.stroke();
        }
      }
      NODES.forEach(n=>{
        const p=.55+.45*Math.sin(n.pulse), r=n.r*(1+.2*p);
        if(n.r>3){
          ctx.save();ctx.shadowBlur=16*p;ctx.shadowColor="rgba(40,160,255,0.8)";
          ctx.beginPath();ctx.arc(n.x,n.y,r*2.2,0,Math.PI*2);
          ctx.strokeStyle=`rgba(60,180,255,${.18*p})`;ctx.lineWidth=.8;ctx.stroke();
          ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
          ctx.fillStyle=`rgba(80,200,255,${n.bright*p})`;ctx.fill();ctx.restore();
        }else{
          ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
          ctx.fillStyle=`rgba(70,180,255,${n.bright*p*.75})`;ctx.fill();
        }
      });

      // 5. Data streams
      STREAMS.forEach(s=>{
        s.y+=s.spd; if(s.y>1+s.len){s.y=-s.len;s.x=Math.random();}
        const x=s.x*W,y1=Math.max(0,(s.y-s.len))*H,y2=Math.min(1,s.y)*H;
        if(y2<=y1)return;
        const g=ctx.createLinearGradient(x,y1,x,y2);
        g.addColorStop(0,"transparent");g.addColorStop(.7,`hsla(${s.hue},100%,65%,.38)`);g.addColorStop(1,`hsla(${s.hue},100%,72%,.65)`);
        ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.stroke();
        ctx.save();ctx.shadowBlur=8;ctx.shadowColor=`hsla(${s.hue},100%,70%,.9)`;
        ctx.beginPath();ctx.arc(x,y2,2.2,0,Math.PI*2);ctx.fillStyle=`hsla(${s.hue},100%,80%,.8)`;ctx.fill();ctx.restore();
      });

      // 6. Mouse aura
      const r1=150+16*Math.sin(t*3.5);
      const au=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,r1);
      au.addColorStop(0,`rgba(40,160,255,${.15+.05*Math.sin(t*5)})`);
      au.addColorStop(.45,"rgba(20,100,220,0.04)");au.addColorStop(1,"transparent");
      ctx.fillStyle=au;ctx.beginPath();ctx.arc(M.x,M.y,r1,0,Math.PI*2);ctx.fill();

      // 7. Trail
      TRAIL.push({x:M.x,y:M.y,t});
      while(TRAIL.length&&t-TRAIL[0].t>.45)TRAIL.shift();
      for(let i=1;i<TRAIL.length;i++){
        const age=(t-TRAIL[i].t)/.45;
        ctx.beginPath();ctx.moveTo(TRAIL[i-1].x,TRAIL[i-1].y);ctx.lineTo(TRAIL[i].x,TRAIL[i].y);
        ctx.strokeStyle=`rgba(80,190,255,${(1-age)*.42})`;ctx.lineWidth=(1-age)*2.4;ctx.stroke();
      }

      // 8. Particles
      for(let i=PARTICLES.length-1;i>=0;i--){
        const p=PARTICLES[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.966;p.vy*=.966;p.life++;
        if(p.life>=p.maxLife){PARTICLES.splice(i,1);continue;}
        const prog=p.life/p.maxLife,a=prog<.18?prog/.18:1-(prog-.18)/.82;
        ctx.beginPath();ctx.arc(p.x,p.y,2.5*(1-prog*.6),0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},100%,72%,${Math.max(0,a)*.85})`;ctx.fill();
      }

      // 9. Click ripples
      if(M.click){
        RIPPLES.push({x:M.x,y:M.y,r:4,maxR:120,a:.85,hue:210});
        RIPPLES.push({x:M.x,y:M.y,r:4,maxR:70,a:.65,hue:195});
        sparks(M.x,M.y,16);
      }
      for(let i=RIPPLES.length-1;i>=0;i--){
        const rp=RIPPLES[i];rp.r+=3;rp.a*=.91;
        ctx.save();ctx.shadowBlur=12;ctx.shadowColor=`hsla(${rp.hue},100%,65%,.7)`;
        ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${rp.hue},100%,70%,${rp.a})`;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
        if(rp.r>=rp.maxR)RIPPLES.splice(i,1);
      }

      // 10. Vignette
      const vg=ctx.createRadialGradient(W/2,H/2,W*.18,W/2,H/2,W*.88);
      vg.addColorStop(0,"transparent");vg.addColorStop(1,"rgba(0,2,12,.88)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

      raf=requestAnimationFrame(draw);
    }
    ctx.fillStyle="rgb(2,8,22)";ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);
    return()=>{
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
