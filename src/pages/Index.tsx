import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Database, UserPlus, Wifi, Server, Shield, Lock } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import { generateFingerprintHash, getRecords } from "@/lib/biometric-store";

/* ── Gold/Bronze colour helpers ────────────────── */
const GOLD   = (a=1) => `hsla(38,90%,62%,${a})`;
const GOLDL  = (a=1) => `hsla(42,100%,75%,${a})`;   // light gold
const GOLDD  = (a=1) => `hsla(30,80%,45%,${a})`;    // dark bronze
const COPPER = (a=1) => `hsla(20,75%,55%,${a})`;    // copper tone
const CREAM  = (a=1) => `hsla(40,60%,92%,${a})`;    // warm near-white
const DARK   = (a=1) => `hsla(25,12%,7%,${a})`;     // very dark bg

const Index = () => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"idle"|"scanning"|"match"|"no-match">("idle");
  const [statusText, setStatusText] = useState("SYSTEM READY — AWAITING BIOMETRIC INPUT");

  const handleScan = () => {
    if (scanState !== "idle") return;
    setScanState("scanning");
    setStatusText("PROCESSING BIOMETRIC DATA...");
    setTimeout(() => {
      const records = getRecords();
      const shouldMatch = Math.random() > 0.5 && records.length > 0;
      if (shouldMatch) {
        const record = records[Math.floor(Math.random() * records.length)];
        setScanState("match");
        setStatusText(`IDENTITY VERIFIED — ${record.surname}, ${record.name}`);
        setTimeout(() => navigate(`/result/${record.id}`), 1500);
      } else {
        generateFingerprintHash();
        setScanState("no-match");
        setStatusText("NO RECORD FOUND");
        setTimeout(() => { setScanState("idle"); setStatusText("SYSTEM READY — AWAITING BIOMETRIC INPUT"); }, 5000);
      }
    }, 2500);
  };

  const isMatch    = scanState === "match";
  const isNoMatch  = scanState === "no-match";
  const isScanning = scanState === "scanning";
  const isIdle     = scanState === "idle";

  /* State-aware colours — gold idle, green match, red no-match */
  const stateCol = isMatch   ? { h:140, label:"hsl(140,100%,68%)", glow:"hsla(140,100%,50%,0.65)" }
                 : isNoMatch ? { h:0,   label:"hsl(0,100%,68%)",   glow:"hsla(0,100%,55%,0.65)" }
                 :             { h:38,  label:"hsl(38,100%,72%)",   glow:"hsla(38,90%,62%,0.65)" };

  const borderCol = isMatch   ? "hsla(140,100%,50%,0.75)"
                  : isNoMatch ? "hsla(0,100%,60%,0.75)"
                  : isScanning? `hsla(38,90%,62%,0.7)`
                  :             `hsla(38,80%,55%,0.45)`;

  const boxGlow   = isMatch   ? "0 0 70px hsla(140,100%,50%,0.35), inset 0 0 50px hsla(140,100%,50%,0.06)"
                  : isNoMatch ? "0 0 70px hsla(0,100%,60%,0.3),   inset 0 0 40px hsla(0,100%,55%,0.05)"
                  : isScanning? "0 0 60px hsla(38,90%,62%,0.35),  inset 0 0 40px hsla(38,90%,62%,0.06)"
                  :             "0 0 40px hsla(38,80%,50%,0.18),  inset 0 0 25px hsla(38,80%,50%,0.04)";

  const boxBg     = isMatch   ? "hsla(140,70%,5%,0.85)"
                  : isNoMatch ? "hsla(0,70%,5%,0.85)"
                  :             "hsla(28,20%,6%,0.82)";

  const fpCol     = isMatch   ? "#4fffb0"
                  : isNoMatch ? "#ff5555"
                  : isScanning? "hsla(38,100%,70%,0.75)"
                  :             "hsla(38,85%,62%,0.55)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <CyberBackground />

      {/* ── HEADER ── */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3"
        style={{
          background: "hsla(25,15%,5%,0.82)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid hsla(35,70%,42%,0.28)`,
          boxShadow: "0 1px 0 hsla(38,80%,50%,0.1), 0 4px 20px rgba(0,0,0,.6)",
        }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background:"hsla(38,80%,50%,0.12)", border:`1.5px solid hsla(38,80%,52%,0.4)` }}>
            <Shield className="w-5 h-5" style={{ color:"hsl(38,90%,65%)" }} />
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider block leading-tight"
              style={{ color:"hsl(38,90%,78%)", textShadow:`0 0 14px hsla(38,90%,62%,0.55)` }}>
              BIMS
            </span>
            <span className="font-mono text-[10px] tracking-widest"
              style={{ color:"hsla(35,65%,60%,0.65)" }}>
              BIOMETRIC IDENTITY MGMT
            </span>
          </div>
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5">
            {[["AES-256", Lock], ["SECURE", Wifi], ["ONLINE", Server]].map(([lbl, Icon]: any) => (
              <span key={lbl} className="flex items-center gap-1.5 font-mono text-[11px] font-semibold"
                style={{ color:`hsla(35,65%,68%,0.75)` }}>
                <Icon className="w-3.5 h-3.5" style={{ color:"hsl(38,90%,62%)" }} /> {lbl}
              </span>
            ))}
          </div>
          {/* Status dot */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{
              background: isMatch?"hsl(140,100%,55%)":isNoMatch?"hsl(0,100%,60%)":isScanning?"hsl(45,100%,60%)":"hsl(38,90%,62%)",
              boxShadow: `0 0 8px ${isMatch?"hsl(140,100%,55%)":isNoMatch?"hsl(0,100%,60%)":isScanning?"hsl(45,100%,60%)":"hsl(38,90%,62%)"}`,
            }}/>
            <span className="font-mono text-xs font-bold"
              style={{ color: isMatch?"hsl(140,100%,70%)":isNoMatch?"hsl(0,100%,70%)":isScanning?"hsl(45,100%,70%)":"hsl(38,90%,75%)" }}>
              {isIdle?"STANDBY":isScanning?"SCANNING":isMatch?"VERIFIED":"ALERT"}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col items-center gap-7 mt-16 relative z-[1] px-4 w-full max-w-sm">

        {/* ── TITLE ── */}
        <div className="text-center w-full">
          <h1 className="font-display font-bold whitespace-nowrap"
            style={{
              fontSize: "clamp(1.6rem,3.8vw,2.8rem)",
              letterSpacing: "0.02em",
              color: "hsl(40,80%,88%)",
              textShadow: "0 0 18px hsla(38,90%,62%,0.7), 0 0 40px hsla(38,90%,55%,0.3), 0 2px 6px rgba(0,0,0,.9)",
            }}>
            Biometric Scanner
          </h1>
          <p className="font-mono font-bold whitespace-nowrap mt-2"
            style={{
              fontSize: "clamp(0.55rem,1.1vw,0.72rem)",
              letterSpacing: "0.2em",
              color: "hsl(38,85%,68%)",
              textShadow: "0 0 10px hssa(38,80%,55%,0.55), 0 1px 4px rgba(0,0,0,.8)",
            }}>
            ADVANCED FINGERPRINT RECOGNITION SYSTEM
          </p>
        </div>

        {/* ── STATUS PILL ── */}
        <motion.div key={statusText} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="font-mono text-xs font-bold tracking-wider px-5 py-2.5 rounded-full text-center w-full"
          style={{
            background: isMatch?"hsla(140,80%,8%,0.75)":isNoMatch?"hsla(0,80%,8%,0.75)":"hsla(30,25%,8%,0.8)",
            border: `1.5px solid ${isMatch?"hsla(140,100%,50%,0.5)":isNoMatch?"hsla(0,100%,55%,0.5)":"hsla(38,80%,50%,0.45)"}`,
            color: isMatch?"hsl(140,100%,72%)":isNoMatch?"hsl(0,100%,72%)":"hsl(38,95%,78%)",
            textShadow: `0 0 10px ${stateCol.glow}, 0 1px 4px rgba(0,0,0,.8)`,
            boxShadow: `0 0 20px ${isMatch?"hsla(140,100%,50%,0.12)":isNoMatch?"hsla(0,100%,55%,0.12)":"hsla(38,80%,50%,0.12)"}`,
          }}>
          ▶&nbsp; {statusText}
        </motion.div>

        {/* ── SCANNER BOX ── */}
        <motion.div
          className={`relative rounded-2xl flex items-center justify-center overflow-hidden ${isScanning?"scanner-pulse":""}`}
          style={{
            width: "clamp(230px,30vw,280px)",
            height: "clamp(230px,30vw,280px)",
            border: `2px solid ${borderCol}`,
            boxShadow: boxGlow,
            background: boxBg,
            backdropFilter: "blur(14px)",
            cursor: "default",
          }}>

          {/* Corner brackets — gold */}
          {[["top-3 left-3","border-t-2 border-l-2"],["top-3 right-3","border-t-2 border-r-2"],
            ["bottom-3 left-3","border-b-2 border-l-2"],["bottom-3 right-3","border-b-2 border-r-2"]].map(([pos,brd],i)=>(
            <div key={i} className={`absolute ${pos} w-7 h-7 ${brd}`}
              style={{ borderColor: borderCol, filter:`drop-shadow(0 0 4px ${borderCol})` }}/>
          ))}

          {/* Scan line */}
          <AnimatePresence>
            {isScanning && (
              <motion.div className="absolute left-4 right-4 h-[2px] rounded-full"
                style={{ background:`linear-gradient(90deg,transparent,hsl(38,90%,72%),transparent)`, boxShadow:`0 0 16px hsla(38,90%,68%,0.9)` }}
                initial={{ top:"8%" }} animate={{ top:["8%","90%","8%"] }}
                transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}/>
            )}
          </AnimatePresence>

          {/* Inner content */}
          <div className="flex flex-col items-center gap-3">
            <Fingerprint style={{
              width:"clamp(80px,10vw,110px)", height:"clamp(80px,10vw,110px)",
              color: fpCol,
              filter: (isMatch||isScanning||isIdle) ? `drop-shadow(0 0 18px ${fpCol})` : "none",
              transition: "all 0.6s ease",
            }}/>

            {isIdle && (
              <motion.div animate={{ opacity:[1,0.45,1] }} transition={{ duration:2, repeat:Infinity }}
                className="font-mono font-bold tracking-[0.25em] text-xs px-4 py-1.5 rounded-full"
                style={{
                  color: "hsl(38,95%,78%)",
                  background: "hsla(38,80%,45%,0.14)",
                  border: "1px solid hsla(38,80%,52%,0.38)",
                  textShadow: "0 0 10px hsla(38,90%,62%,0.8), 0 1px 3px rgba(0,0,0,.8)",
                }}>
                TAP BUTTON TO SCAN
              </motion.div>
            )}
            {isScanning && (
              <span className="font-mono text-sm font-bold tracking-widest animate-pulse"
                style={{ color:"hsl(38,100%,75%)", textShadow:"0 0 12px hsla(38,90%,62%,0.9)" }}>
                SCANNING...
              </span>
            )}
            {isMatch && (
              <span className="font-mono text-sm font-bold tracking-widest"
                style={{ color:"hsl(140,100%,68%)", textShadow:"0 0 14px hsla(140,100%,55%,0.9)" }}>
                ✓ VERIFIED
              </span>
            )}
            {isNoMatch && (
              <span className="font-mono text-sm font-bold tracking-widest"
                style={{ color:"hsl(0,100%,68%)", textShadow:"0 0 14px hsla(0,100%,55%,0.9)" }}>
                ✗ NOT FOUND
              </span>
            )}
          </div>
        </motion.div>

        {/* ── BUTTONS ── */}
        <div className="flex flex-col gap-3 w-full">
          {/* INITIATE SCAN */}
          <button onClick={handleScan} disabled={!isIdle}
            className="w-full rounded-xl font-display font-bold tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-200"
            style={{
              height: "52px",
              background: !isIdle
                ? "hsla(38,40%,20%,0.35)"
                : "hsla(38,80%,45%,0.22)",
              border: `2px solid ${!isIdle ? "hsla(38,50%,35%,0.3)" : "hsla(38,85%,58%,0.7)"}`,
              color: !isIdle ? "hsla(38,60%,55%,0.45)" : "hsl(40,100%,88%)",
              boxShadow: !isIdle ? "none" : "0 0 28px hsla(38,85%,55%,0.28), inset 0 1px 0 hsla(42,100%,75%,0.15)",
              textShadow: !isIdle ? "none" : "0 0 12px hsla(38,90%,65%,0.7), 0 1px 4px rgba(0,0,0,.8)",
              cursor: !isIdle ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e=>{ if(isIdle){ e.currentTarget.style.background="hsla(38,80%,50%,0.32)"; e.currentTarget.style.boxShadow="0 0 42px hsla(38,85%,58%,0.42), inset 0 1px 0 hsla(42,100%,75%,0.2)"; }}}
            onMouseLeave={e=>{ e.currentTarget.style.background=!isIdle?"hsla(38,40%,20%,0.35)":"hsla(38,80%,45%,0.22)"; e.currentTarget.style.boxShadow=!isIdle?"none":"0 0 28px hsla(38,85%,55%,0.28), inset 0 1px 0 hsla(42,100%,75%,0.15)"; }}>
            <Fingerprint className="w-5 h-5"/>
            {isScanning?"SCANNING...":isMatch?"VERIFIED":isNoMatch?"NOT FOUND":"INITIATE SCAN"}
          </button>

          {/* REGISTER + DATABASE */}
          <div className="grid grid-cols-2 gap-3">
            {[{label:"REGISTER",icon:UserPlus,path:"/register"},{label:"DATABASE",icon:Database,path:"/database"}].map(({label,icon:Icon,path})=>(
              <button key={label} onClick={()=>navigate(path)}
                className="h-11 rounded-xl font-display font-bold tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: "hsla(28,20%,9%,0.72)",
                  border: "1.5px solid hsla(35,65%,42%,0.42)",
                  color: "hsl(38,80%,78%)",
                  textShadow: "0 1px 4px rgba(0,0,0,.8)",
                  boxShadow: "0 0 12px hsla(38,70%,45%,0.08)",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background="hsla(38,70%,40%,0.2)"; e.currentTarget.style.borderColor="hsla(38,80%,55%,0.65)"; e.currentTarget.style.color="hsl(40,100%,88%)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="hsla(28,20%,9%,0.72)"; e.currentTarget.style.borderColor="hsla(35,65%,42%,0.42)"; e.currentTarget.style.color="hsl(38,80%,78%)"; }}>
                <Icon className="w-4 h-4"/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* No-match card */}
        <AnimatePresence>
          {isNoMatch && (
            <motion.div initial={{opacity:0,y:16,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:16,scale:0.95}}
              className="rounded-xl p-5 text-center w-full"
              style={{ background:"hsla(0,70%,6%,0.88)", border:"1.5px solid hsla(0,100%,52%,0.4)", backdropFilter:"blur(12px)" }}>
              <p className="font-mono text-sm font-bold mb-3 tracking-wider"
                style={{ color:"hsl(0,100%,72%)", textShadow:"0 0 12px hsla(0,100%,55%,0.6)" }}>
                ✗ NO RECORD FOUND
              </p>
              <button onClick={()=>navigate("/register")}
                className="font-mono text-xs font-bold tracking-wider px-5 py-2 rounded-lg transition-all"
                style={{ background:"hsla(38,80%,45%,0.2)", border:"1px solid hsla(38,80%,55%,0.5)", color:"hsl(38,95%,80%)" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="hsla(38,80%,45%,0.35)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="hsla(38,80%,45%,0.2)"; }}>
                Initialize New Registration
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center px-8 py-2"
        style={{
          background: "hsla(25,15%,5%,0.82)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid hsla(35,65%,38%,0.25)",
        }}>
        <div className="flex items-center gap-4 font-mono text-[11px] font-semibold">
          <span style={{ color:"hsla(38,70%,62%,0.75)" }}>BIMS v3.0 · © 2026 KUMI</span>
          <span className="w-1 h-1 rounded-full" style={{ background:"hsla(38,80%,55%,0.4)" }}/>
          <span style={{ color:"hsla(38,65%,58%,0.6)" }}>ENCRYPTED CHANNEL</span>
          <span className="w-1 h-1 rounded-full" style={{ background:"hsla(38,80%,55%,0.4)" }}/>
          <span style={{ color:"hsla(38,65%,58%,0.6)" }}>{new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
