import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d"); if (!ctx) return;
    let   raf    = 0;

    const M = { x: -999, y: -999, px: -999, py: -999, click: false, down: false };
    const onMove  = (e: MouseEvent) => { M.px = M.x; M.py = M.y; M.x = e.clientX; M.y = e.clientY; };
    const onDown  = () => { M.click = true; M.down = true; setTimeout(() => { M.click = false; }, 200); };
    const onUp    = () => { M.down = false; };
    const onLeave = () => { M.x = -999; M.y = -999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseleave", onLeave);

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const img = new Image();
    img.src = "/bio_theme.jpg";
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };

    // ── Particles (orange + cyan, matching image palette) ──
    const PARTICLES = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.6 + Math.random() * 1.4,
      hue: Math.random() > 0.7 ? 30 : 200,
      alpha: 0.25 + Math.random() * 0.45,
    }));

    const RIPPLES: { x:number; y:number; r:number; maxR:number; alpha:number; hue:number }[] = [];

    // ── 4-panel scan system (matches image: hand, face, DNA, fingerprint) ──
    const SCANLINES = [
      { x:0.02, y:0.05, w:0.45, h:0.44, scanY:0, spd:0.0035, hue:200, label:"BIOMETRIC SCAN" },
      { x:0.53, y:0.05, w:0.45, h:0.44, scanY:0, spd:0.004,  hue:200, label:"FACIAL ANALYSIS" },
      { x:0.02, y:0.52, w:0.45, h:0.45, scanY:0, spd:0.003,  hue:30,  label:"DNA SEQUENCE"    },
      { x:0.53, y:0.52, w:0.45, h:0.45, scanY:0, spd:0.0045, hue:200, label:"SIGNAL TRACE"    },
    ];

    const TICKERS = Array.from({ length: 6 }, (_, i) => ({
      panel: i % 4, y: 0.08 + Math.random() * 0.35, x: 0,
      spd: 0.0012 + Math.random() * 0.001,
      text: ["MATCH: 100%","PATTERN LOCKED","SCAN COMPLETE","VERIFIED","AUTH: OK","BIO-ID: CONFIRMED"][i],
      hue: i % 2 === 0 ? 200 : 30, alpha: 0.4 + Math.random() * 0.3,
    }));

    // ── DNA helix particles ──
    const DNA_PARTICLES: { angle:number; y:number; spd:number; side:number }[] = Array.from({ length: 40 }, (_, i) => ({
      angle: (i / 40) * Math.PI * 4, y: i / 40, spd: 0.003 + Math.random() * 0.002, side: i % 2,
    }));

    // ── Neural network nodes ──
    const NEURAL_NODES = Array.from({ length: 25 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003, vy: (Math.random() - 0.5) * 0.0003,
      r: 2 + Math.random() * 3, pulse: Math.random() * Math.PI * 2, pulseSpd: 0.02 + Math.random() * 0.03,
      hue: Math.random() > 0.6 ? 200 : 30,
    }));

    // ── Waveform for voice/signal panel ──
    const WAVE_POINTS = Array.from({ length: 80 }, (_, i) => ({
      phase: (i / 80) * Math.PI * 2, amp: 0.3 + Math.random() * 0.7, freq: 1 + Math.random() * 3,
    }));

    // ── Fingerprint ring system ──
    const FP_RINGS = Array.from({ length: 8 }, (_, i) => ({
      r: 0.03 + i * 0.025, phase: i * 0.3, spd: 0.001 + i * 0.0005,
      gaps: Array.from({ length: 2 + i }, (_, j) => j / (2 + i)),
    }));

    let glitchTimer = 0, glitching = false;
    const TRACE: {x:number;y:number;t:number}[] = [];
    let t = 0;

    // ── Face mesh points (wireframe face like the image) ──
    const FACE_MESH = Array.from({ length: 120 }, (_, i) => {
      const lat = ((i % 12) / 11) * Math.PI - Math.PI / 2;
      const lon = (Math.floor(i / 12) / 9) * Math.PI * 2;
      return { lat, lon, pulse: Math.random() * Math.PI * 2 };
    });

    // ── Ear/geometry dots ──
    const GEO_DOTS = Array.from({ length: 60 }, (_, i) => ({
      angle: (i / 60) * Math.PI * 2, r: 0.02 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2, hue: Math.random() > 0.5 ? 200 : 30,
    }));

    const draw = () => {
      t += 0.016;
      glitchTimer += 0.016;
      const W = canvas.width, H = canvas.height;

      // ── 1. IMAGE ──
      if (imgLoaded) {
        const iAR = img.width / img.height, cAR = W / H;
        let iw: number, ih: number, ix: number, iy: number;
        if (cAR > iAR) { iw = W; ih = W / iAR; ix = 0; iy = (H - ih) / 2; }
        else            { ih = H; iw = H * iAR; ix = (W - iw) / 2; iy = 0; }
        ctx.drawImage(img, ix, iy, iw, ih);
      } else {
        ctx.fillStyle = "rgb(3,8,22)"; ctx.fillRect(0, 0, W, H);
      }

      // ── 2. OVERLAY ──
      ctx.fillStyle = "rgba(2,6,18,0.45)"; ctx.fillRect(0, 0, W, H);

      // ── 3. PANEL SCAN SYSTEM ──
      SCANLINES.forEach((panel, pi) => {
        const px = panel.x * W, py = panel.y * H, pw = panel.w * W, ph = panel.h * H;
        panel.scanY += panel.spd;
        if (panel.scanY > 1) panel.scanY = 0;
        const sy = py + panel.scanY * ph;
        const md = M.x > 0 ? Math.min(Math.hypot(M.x-(px+pw/2), M.y-(py+ph/2))/(pw*0.7), 1) : 1;
        const prox = Math.max(0, 1 - md);

        // Scan beam
        const sg = ctx.createLinearGradient(px, sy-14, px, sy+14);
        sg.addColorStop(0, "transparent");
        sg.addColorStop(0.5, `hsla(${panel.hue},100%,65%,${0.28+prox*0.38})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.fillRect(px, sy-14, pw, 28);
        ctx.beginPath(); ctx.moveTo(px, sy); ctx.lineTo(px+pw, sy);
        ctx.strokeStyle = `hsla(${panel.hue},100%,72%,${0.65+prox*0.3})`;
        ctx.lineWidth = 1.5; ctx.stroke();

        // Corner brackets (enhanced)
        const bL = 22, bW = 2;
        [[px,py,1,1],[px+pw,py,-1,1],[px,py+ph,1,-1],[px+pw,py+ph,-1,-1]].forEach(([bx,by,dx,dy]) => {
          ctx.save();
          ctx.shadowBlur = prox > 0.2 ? 14 : 2;
          ctx.shadowColor = `hsla(${panel.hue},100%,65%,0.95)`;
          ctx.strokeStyle = `hsla(${panel.hue},100%,70%,${0.5+prox*0.45})`;
          ctx.lineWidth = bW;
          ctx.beginPath(); ctx.moveTo(bx+dx*bL, by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+dy*bL); ctx.stroke();
          // Small corner dot
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${panel.hue},100%,80%,${0.6+prox*0.35})`; ctx.fill();
          ctx.restore();
        });

        // Panel label
        ctx.font = `700 ${8+prox*2.5}px 'Orbitron',monospace`;
        ctx.fillStyle = `hsla(${panel.hue},100%,72%,${0.4+prox*0.5})`;
        ctx.fillText(panel.label, px+6, py-8);

        // Serial number
        ctx.font = `500 7px 'IBM Plex Mono',monospace`;
        ctx.fillStyle = `hsla(${panel.hue},100%,65%,${0.22+prox*0.25})`;
        ctx.fillText(`SERIAL: ${Math.floor(12345678+pi*999999).toString().slice(0,8)}`, px+6, py+12);

        // Animated data bars
        for (let b = 0; b < 4; b++) {
          const barY = py + ph - 28 + b * 6;
          const fill = (0.2 + 0.7 * Math.abs(Math.sin(t*0.6+pi*0.9+b*1.3)));
          const barW = fill * pw * 0.75;
          // BG bar
          ctx.fillStyle = `hsla(${panel.hue},100%,55%,${0.07+prox*0.05})`;
          ctx.fillRect(px+8, barY, pw*0.75, 3);
          // Fill bar with gradient
          const barGrad = ctx.createLinearGradient(px+8, 0, px+8+barW, 0);
          barGrad.addColorStop(0, `hsla(${panel.hue},100%,60%,${0.4+prox*0.3})`);
          barGrad.addColorStop(1, `hsla(${panel.hue},100%,80%,${0.6+prox*0.35})`);
          ctx.fillStyle = barGrad; ctx.fillRect(px+8, barY, barW, 3);
          // Percentage text
          ctx.font = "600 6px 'IBM Plex Mono',monospace";
          ctx.fillStyle = `hsla(${panel.hue},100%,72%,${0.35+prox*0.4})`;
          ctx.fillText(`${Math.round(fill*100)}%`, px+pw*0.75+12, barY+3);
        }

        // Status badge
        const statuses = ["IN PROGRESS","SCANNING","COMPLETE","SEARCHING"];
        ctx.font = "700 7px 'Orbitron',monospace";
        ctx.fillStyle = `hsla(${panel.hue===30?30:200},100%,72%,${0.35+prox*0.45})`;
        ctx.fillText(`STATUS: ${statuses[pi]}`, px+8, py+ph-32);
      });

      // ── 4. PARTICLES ──
      PARTICLES.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0;
        const px=p.x*W, py=p.y*H;
        const md=M.x>0?Math.hypot(px-M.x,py-M.y):9999;
        const prx=Math.max(0,1-md/180);
        if(prx>0&&md>1){p.vx+=(px-M.x)/md*0.00009;p.vy+=(py-M.y)/md*0.00009;}
        const spd=Math.hypot(p.vx,p.vy);
        if(spd>0.0016){p.vx*=0.0016/spd;p.vy*=0.0016/spd;}
        p.vx*=0.998; p.vy*=0.998;
        const a=p.alpha+prx*0.55;
        if(prx>0.05){
          ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(M.x,M.y);
          ctx.strokeStyle=`hsla(${p.hue},100%,65%,${prx*0.22})`;
          ctx.lineWidth=prx*0.9;ctx.stroke();
        }
        ctx.save();
        if(prx>0.1){ctx.shadowBlur=10;ctx.shadowColor=`hsla(${p.hue},100%,65%,0.85)`;}
        ctx.beginPath();ctx.arc(px,py,p.r+prx*3.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},100%,72%,${a})`;ctx.fill();
        ctx.restore();
      });

      // ── 5. NEURAL NETWORK (overlaid) ──
      NEURAL_NODES.forEach(n => {
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0)n.x=1;if(n.x>1)n.x=0;if(n.y<0)n.y=1;if(n.y>1)n.y=0;
        n.pulse+=n.pulseSpd;
      });
      for(let i=0;i<NEURAL_NODES.length;i++){
        for(let j=i+1;j<NEURAL_NODES.length;j++){
          const a=NEURAL_NODES[i],b=NEURAL_NODES[j];
          const dx=(a.x-b.x)*W,dy=(a.y-b.y)*H;
          const d=Math.hypot(dx,dy);
          if(d<W*0.14){
            ctx.beginPath();
            ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);
            ctx.strokeStyle=`hsla(${(a.hue+b.hue)/2},100%,65%,${(1-d/(W*0.14))*0.12})`;
            ctx.lineWidth=0.5;ctx.stroke();
          }
        }
      }
      NEURAL_NODES.forEach(n=>{
        const pulse=0.5+0.5*Math.sin(n.pulse);
        ctx.save();
        ctx.shadowBlur=8*pulse;ctx.shadowColor=`hsla(${n.hue},100%,65%,0.7)`;
        ctx.beginPath();ctx.arc(n.x*W,n.y*H,n.r*(0.8+0.4*pulse),0,Math.PI*2);
        ctx.fillStyle=`hsla(${n.hue},100%,70%,${0.3+0.3*pulse})`;ctx.fill();
        ctx.restore();
      });

      // ── 6. TRACE ──
      if(M.x>0&&M.px>0)TRACE.push({x:M.x,y:M.y,t});
      while(TRACE.length>0&&t-TRACE[0].t>0.65)TRACE.shift();
      if(TRACE.length>1){
        for(let i=1;i<TRACE.length;i++){
          const age=(t-TRACE[i].t)/0.65;
          ctx.beginPath();ctx.moveTo(TRACE[i-1].x,TRACE[i-1].y);ctx.lineTo(TRACE[i].x,TRACE[i].y);
          ctx.strokeStyle=`rgba(0,220,255,${(1-age)*0.6})`;
          ctx.lineWidth=(1-age)*2.5;ctx.stroke();
        }
      }

      // ── 7. MOUSE AURA ──
      if(M.x>0){
        const r=115+13*Math.sin(t*4);
        const g=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,r);
        g.addColorStop(0,`rgba(0,200,255,${0.14+0.06*Math.sin(t*3)})`);
        g.addColorStop(0.4,"rgba(0,140,220,0.05)");
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(M.x,M.y,r,0,Math.PI*2);ctx.fill();
        if(M.click)RIPPLES.push({x:M.x,y:M.y,r:4,maxR:85+Math.random()*40,alpha:0.85,hue:Math.random()>0.5?200:30});
      }

      // ── 8. RIPPLES ──
      for(let i=RIPPLES.length-1;i>=0;i--){
        const rp=RIPPLES[i];rp.r+=2.8;rp.alpha*=0.92;
        ctx.save();ctx.shadowBlur=10;ctx.shadowColor=`hsla(${rp.hue},100%,65%,0.7)`;
        ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${rp.hue},100%,70%,${rp.alpha})`;ctx.lineWidth=1.6;ctx.stroke();
        ctx.restore();
        if(rp.r>=rp.maxR)RIPPLES.splice(i,1);
      }

      // ── 9. GLITCH ──
      if(!glitching&&glitchTimer>4+Math.random()*6){glitching=true;glitchTimer=0;setTimeout(()=>{glitching=false;},90+Math.random()*130);}
      if(glitching&&imgLoaded){
        for(let s=0;s<4;s++){
          const gy=Math.random()*H,gh=2+Math.random()*9,gx=(Math.random()-0.5)*20;
          ctx.save();ctx.drawImage(canvas,0,gy,W,gh,gx,gy,W,gh);ctx.restore();
        }
        ctx.save();ctx.globalAlpha=0.18;ctx.globalCompositeOperation="screen";
        const cy2=Math.random()*H;
        ctx.fillStyle="rgba(255,0,80,0.65)";ctx.fillRect(-5,cy2,W,4+Math.random()*7);
        ctx.fillStyle="rgba(0,255,255,0.65)";ctx.fillRect(5,cy2+2,W,4+Math.random()*7);
        ctx.restore();
      }

      // ── 10. VIGNETTE ──
      const vg=ctx.createRadialGradient(W/2,H/2,W*0.15,W/2,H/2,W*0.88);
      vg.addColorStop(0,"transparent");vg.addColorStop(1,"rgba(1,3,12,0.78)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

      // ── 11. CROSSHAIR ──
      if(M.x>0){
        const MX=M.x,MY=M.y;
        const cl=M.click?8:13,gap=M.click?4:7,rr=M.click?7:11;
        ctx.save();
        ctx.shadowBlur=14;ctx.shadowColor="rgba(0,230,255,0.95)";
        ctx.strokeStyle="rgba(0,235,255,0.92)";ctx.lineWidth=1.3;
        [[MX-gap-cl,MY,MX-gap,MY],[MX+gap,MY,MX+gap+cl,MY],
         [MX,MY-gap-cl,MX,MY-gap],[MX,MY+gap,MX,MY+gap+cl]].forEach(([x1,y1,x2,y2])=>{
          ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
        });
        ctx.beginPath();ctx.arc(MX,MY,rr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,235,255,${M.click?0.88:0.48})`;ctx.lineWidth=0.9;ctx.stroke();
        ctx.setLineDash([3,8]);ctx.lineDashOffset=-(t*28%100);
        ctx.beginPath();ctx.arc(MX,MY,rr+10,0,Math.PI*2);
        ctx.strokeStyle="rgba(0,200,255,0.2)";ctx.lineWidth=0.65;ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur=20;
        ctx.beginPath();ctx.arc(MX,MY,M.click?1.6:2.3,0,Math.PI*2);
        ctx.fillStyle="rgba(0,248,255,0.98)";ctx.fill();
        [0,90,180,270].forEach(deg=>{
          const rad=deg*Math.PI/180;
          ctx.beginPath();ctx.arc(MX+Math.cos(rad)*rr,MY+Math.sin(rad)*rr,1.3,0,Math.PI*2);
          ctx.fillStyle="rgba(0,255,210,0.88)";ctx.fill();
        });
        ctx.restore();
      }

      raf=requestAnimationFrame(draw);
    };

    ctx.fillStyle="rgb(3,8,22)";ctx.fillRect(0,0,canvas.width,canvas.height);
    raf=requestAnimationFrame(draw);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",resize);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mousedown",onDown);
      window.removeEventListener("mouseup",onUp);
      window.removeEventListener("mouseleave",onLeave);
    };
  },[]);

  return(
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{cursor:"none"}}/>
    </div>
  );
}
