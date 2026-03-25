import React, { useEffect, useRef } from "react";

/*
  BIMS Background — nn.jpg cybersecurity image
  Full-screen, high quality, no mouse interaction, no cursor changes.
  Subtle canvas layer on top adds:
  - Soft moving particles
  - Faint circuit traces matching the image's blue palette
  - A gentle scanline sweep to give it life
  Nothing blocks the image.
*/
export default function CyberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, T = 0;

    const onRz = () => { canvas.width=innerWidth; canvas.height=innerHeight; init(); };
    window.addEventListener("resize", onRz);

    let motes: any[] = [];
    let traces: any[] = [];

    function init() {
      const W = canvas.width, H = canvas.height;

      // Subtle floating particles
      motes = Array.from({length:55}, () => ({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-.5)*.18, vy: (Math.random()-.5)*.14,
        r: .3+Math.random()*1.1,
        life: Math.random()*Math.PI*2,
        gold: Math.random() < .15
      }));

      // Faint circuit traces — horizontal/vertical only, like circuit board lines
      traces = Array.from({length:18}, () => {
        const pts:any[] = [];
        let px = Math.random()*W, py = Math.random()*H;
        pts.push({x:px,y:py});
        for(let s=0; s<2+Math.floor(Math.random()*4); s++){
          Math.random()>.5
            ? (px += (Math.random()-.5)*200)
            : (py += (Math.random()-.5)*160);
          pts.push({x:Math.max(5,Math.min(W-5,px)),y:Math.max(5,Math.min(H-5,py))});
        }
        return {pts, flow: Math.random(), alpha:.04+Math.random()*.07};
      });
    }

    function draw() {
      T += .016;
      const W = canvas.width, H = canvas.height;

      // Clear — fully transparent so image CSS shows through
      ctx.clearRect(0,0,W,H);

      // Gentle blue glow in top-left to match the bright lock area in the image
      const tl = ctx.createRadialGradient(W*.12,H*.45,0,W*.12,H*.45,W*.45);
      tl.addColorStop(0,"rgba(0,100,255,0.08)");
      tl.addColorStop(.5,"rgba(0,60,160,0.04)");
      tl.addColorStop(1,"transparent");
      ctx.fillStyle=tl; ctx.fillRect(0,0,W,H);

      // Very faint global overlay to slightly deepen dark right side
      const side = ctx.createLinearGradient(0,0,W,0);
      side.addColorStop(0,"transparent");
      side.addColorStop(.55,"transparent");
      side.addColorStop(1,"rgba(0,5,20,0.22)");
      ctx.fillStyle=side; ctx.fillRect(0,0,W,H);

      // Faint circuit traces
      for(const tr of traces){
        tr.flow=(tr.flow+.0015)%1;
        ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
        for(let i=1;i<tr.pts.length;i++) ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
        ctx.strokeStyle=`rgba(0,140,255,${tr.alpha})`; ctx.lineWidth=.5; ctx.stroke();
        // Junction dots
        for(const p of tr.pts){
          ctx.beginPath(); ctx.arc(p.x,p.y,.9,0,Math.PI*2);
          ctx.fillStyle=`rgba(0,160,255,${tr.alpha*1.6})`; ctx.fill();
        }
        // Travelling photon
        const tot=tr.pts.slice(1).reduce((a,p,i)=>a+Math.hypot(p.x-tr.pts[i].x,p.y-tr.pts[i].y),0);
        let tgt=tr.flow*tot,wlk=0;
        for(let i=1;i<tr.pts.length;i++){
          const seg=Math.hypot(tr.pts[i].x-tr.pts[i-1].x,tr.pts[i].y-tr.pts[i-1].y);
          if(wlk+seg>=tgt){
            const t2=(tgt-wlk)/seg;
            const px=tr.pts[i-1].x+t2*(tr.pts[i].x-tr.pts[i-1].x);
            const py=tr.pts[i-1].y+t2*(tr.pts[i].y-tr.pts[i-1].y);
            ctx.save(); ctx.shadowBlur=7; ctx.shadowColor="rgba(0,180,255,1)";
            ctx.beginPath(); ctx.arc(px,py,1.7,0,Math.PI*2);
            ctx.fillStyle="rgba(100,200,255,.85)"; ctx.fill();
            ctx.shadowBlur=0; ctx.restore(); break;
          } wlk+=seg;
        }
      }

      // Floating motes
      for(const m of motes){
        m.x+=m.vx; m.y+=m.vy; m.life+=.005;
        if(m.x<0)m.x=W; if(m.x>W)m.x=0;
        if(m.y<0)m.y=H; if(m.y>H)m.y=0;
        const a = .14+.12*Math.sin(m.life);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
        ctx.fillStyle = m.gold
          ? `rgba(255,220,80,${a*.55})`
          : `rgba(80,180,255,${a*.45})`;
        ctx.fill();
      }

      // Single slow horizontal scan line — barely visible
      const scanY = ((T*.012)%1)*H;
      const sg = ctx.createLinearGradient(0,scanY-2,0,scanY+2);
      sg.addColorStop(0,"transparent");
      sg.addColorStop(.5,"rgba(80,180,255,0.018)");
      sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,scanY-2,W,4);

      raf = requestAnimationFrame(draw);
    }

    canvas.width=innerWidth; canvas.height=innerHeight;
    init();
    raf=requestAnimationFrame(draw);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",onRz);
    };
  },[]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:-1}} aria-hidden>
      {/* Background image — sharp, full cover, no distortion */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"url('/nn.jpg')",
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
      }}/>
      {/* Subtle canvas overlay — particles + traces only, no cursor changes */}
      <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
    </div>
  );
}
