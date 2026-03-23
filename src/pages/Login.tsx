import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Headphones } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import TechSupportModal from "@/components/TechSupportModal";

/* ══════════════════════════════════════════
   USER MANAGEMENT SYSTEM
══════════════════════════════════════════ */
export type UserRole = "owner" | "admin" | "operator" | "analyst";

export interface BIMSUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email?: string;
  createdAt: string;
  createdBy: string;
  active: boolean;
}

const USERS_KEY   = "bims_users";
const SESSION_KEY = "bims_session";

const seedAdmin = (): BIMSUser[] => [{
  id: "usr_admin", username: "oni", password: "1234", role: "admin",
  fullName: "System Administrator", email: "",
  createdAt: new Date().toISOString(), createdBy: "system", active: true,
}];

export const getUsers = (): BIMSUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) { const seed = seedAdmin(); localStorage.setItem(USERS_KEY, JSON.stringify(seed)); return seed; }
    return JSON.parse(raw);
  } catch { return seedAdmin(); }
};

export const saveUsers   = (users: BIMSUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
export const isLoggedIn  = () => !!sessionStorage.getItem(SESSION_KEY);
export const getCurrentUser = (): BIMSUser | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
};
export const isAdmin  = () => { const r = getCurrentUser()?.role; return r === "admin" || r === "owner"; };
export const isOwner  = () => getCurrentUser()?.role === "owner";
export const doLogin  = (user: BIMSUser) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
export const doLogout = () => sessionStorage.removeItem(SESSION_KEY);

export const ROLE_COLORS: Record<UserRole, string> = {
  owner:    "hsl(270,80%,72%)",
  admin:    "hsl(354,88%,68%)",
  operator: "hsl(195,100%,62%)",
  analyst:  "hsl(158,80%,55%)",
};
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "OWNER", admin: "ADMIN", operator: "OPERATOR", analyst: "ANALYST",
};

/* ── helpers ── */
const getRoles = () => {
  try { return JSON.parse(localStorage.getItem("bims_records") || "[]") as any[]; } catch { return []; }
};

/* ─── PAGE SHELL ─── */
const PageShell = ({ children }: { children: React.ReactNode }) => {
  const [showSupport, setShowSupport] = React.useState(false);
  return (
    <div style={{minHeight:"100vh",position:"relative",display:"flex",flexDirection:"column" as const,
      alignItems:"center",justifyContent:"center",padding:"20px 16px",
      background:"hsl(220,62%,5%)"}}>
      <CyberBackground/>

      {/* Logo — top left */}
      <div style={{position:"fixed",top:22,left:20,zIndex:20,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,
          background:"linear-gradient(135deg,hsl(218,100%,48%),hsl(230,100%,62%))",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 20px rgba(60,160,255,0.35)"}}>
          <Shield style={{width:16,height:16,color:"white"}}/>
        </div>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,
            letterSpacing:"0.06em",color:"rgba(210,235,255,0.96)"}}>
            Nexus<span style={{color:"hsl(185,100%,55%)",marginLeft:4}}>BIMS</span>
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,
            color:"rgba(50,145,255,0.4)",letterSpacing:"0.06em"}}>BIOMETRIC PLATFORM</div>
        </div>
      </div>

      {/* Support — top right */}
      <button onClick={()=>setShowSupport(true)}
        style={{position:"fixed",top:22,right:20,zIndex:20,
          display:"flex",alignItems:"center",gap:5,padding:"6px 13px",
          borderRadius:99,cursor:"pointer",
          background:"rgba(50,140,255,0.07)",border:"1px solid rgba(50,140,255,0.2)",
          fontFamily:"'Outfit',sans-serif",fontSize:11.5,fontWeight:500,
          color:"rgba(60,165,255,0.65)",transition:"all .18s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(50,140,255,0.14)";e.currentTarget.style.color="rgba(0,240,220,0.9)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(50,140,255,0.07)";e.currentTarget.style.color="rgba(60,165,255,0.65)";}}>
        <Headphones style={{width:12,height:12}}/> Support
      </button>

      {/* Card */}
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:400,marginTop:8}}>
        <motion.div
          initial={{opacity:0,y:28,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
          transition={{duration:0.45,ease:[0.16,1,0.3,1]}}
          style={{
            padding:"32px 28px 26px",
            background:"linear-gradient(160deg,rgba(4,12,38,0.94),rgba(4,10,30,0.97))",
            border:"1px solid rgba(50,145,255,0.18)",
            borderTop:"2px solid rgba(60,165,255,0.5)",
            borderRadius:20,
            boxShadow:"0 0 80px rgba(0,0,0,0.85),0 0 40px rgba(0,180,170,0.08),inset 0 1px 0 rgba(50,140,255,0.08)",
            backdropFilter:"blur(30px)",
          }}>
          {children}
        </motion.div>
      </div>

      <TechSupportModal open={showSupport} onClose={()=>setShowSupport(false)}
        reporterUsername={undefined} allowManualReporter={true}
        showBackButton={true} onBack={()=>setShowSupport(false)}/>
    </div>
  );
}

/* ─── FINGERPRINT LOGIN SCREEN ─── */
const LoginScreen = () => {
  const navigate = useNavigate();

  type FpState = "idle" | "scanning" | "preview" | "granting" | "not_in_db" | "no_users";
  const [fpState,       setFpState]       = useState<FpState>("idle");
  const [matchUser,     setMatchUser]     = useState<BIMSUser | null>(null);
  const [matchRecord,   setMatchRecord]   = useState<any>(null);
  const [showManual,    setShowManual]    = useState(false);
  const [manualUser,    setManualUser]    = useState("");
  const [manualPass,    setManualPass]    = useState("");
  const [manualErr,     setManualErr]     = useState("");
  const [manualPreview, setManualPreview] = useState<{user:BIMSUser;rec:any}|null>(null);
  const [countdown,     setCountdown]     = useState(2);
  const scanRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (scanRef.current) clearTimeout(scanRef.current); }, []);
  useEffect(() => {
    if (fpState !== "preview") { setCountdown(2); return; }
    const iv = setInterval(() => setCountdown(p => { if(p<=1){clearInterval(iv);return 0;}return p-1; }), 1000);
    return () => clearInterval(iv);
  }, [fpState]);

  const findRecord = (user: BIMSUser) => {
    const all = getRoles();
    const n = user.fullName.trim().toLowerCase();
    return all.find((r:any) =>
      `${r.name} ${r.surname}`.toLowerCase() === n ||
      `${r.surname} ${r.name}`.toLowerCase() === n ||
      (n.includes(r.name?.toLowerCase()) && n.includes(r.surname?.toLowerCase()))
    ) || null;
  };

  const startScan = () => {
    if (fpState === "scanning" || fpState === "preview" || fpState === "granting") return;
    setFpState("scanning");
    setMatchUser(null); setMatchRecord(null);
    scanRef.current = setTimeout(() => {
      const users = getUsers().filter(u => u.active);
      if (users.length === 0) { setFpState("no_users"); return; }
      const found = users[0];
      const foundRec = findRecord(found) || {
        id: found.id, name: found.fullName.split(" ")[0] || found.fullName,
        surname: found.fullName.split(" ").slice(1).join(" ") || "",
        photo: null, nationality: "—", dateOfBirth: "—", gender: "—", bloodType: "—", phoneNo: "—",
      };
      setMatchUser(found); setMatchRecord(foundRec);
      setFpState("preview");
      scanRef.current = setTimeout(() => { doLogin(found!); navigate("/", { replace: true }); }, 2000);
    }, 2400);
  };

  const resetScan = () => {
    if (scanRef.current) clearTimeout(scanRef.current);
    setFpState("idle"); setMatchUser(null); setMatchRecord(null);
  };

  const handleManual = () => {
    setManualErr(""); setManualPreview(null);
    if (!manualUser.trim()) { setManualErr("Username is required"); return; }
    if (!manualPass)        { setManualErr("Password is required"); return; }
    const users = getUsers();
    const user  = users.find(u => u.username === manualUser.trim().toLowerCase() && u.password === manualPass && u.active);
    if (!user) { setManualErr("Incorrect username or password"); setManualPass(""); return; }
    const rec = findRecord(user);
    const recOrFallback = rec || { name:user.fullName, surname:"", photo:null, id:"—", nationality:"—", dateOfBirth:"—", gender:"—" };
    setManualPreview({ user, rec: recOrFallback });
    setTimeout(() => { doLogin(user); navigate("/", { replace: true }); }, 1100);
  };

  const isActive  = fpState === "scanning";
  const isPreview = fpState === "preview";
  const isGrant   = fpState === "granting";
  const isError   = fpState === "not_in_db" || fpState === "no_users";

  /* Teal color system matching the background */
  const fpColor  = isError ? "hsl(0,85%,62%)" : isPreview ? "hsl(175,100%,52%)" : isActive ? "hsl(218,100%,62%)" : "hsl(218,80%,52%)";
  const glowCol  = isError ? "rgba(220,60,60,0.6)" : isActive||isPreview ? "rgba(0,225,210,0.55)" : "rgba(0,180,170,0.3)";
  const borderCol= isError ? "rgba(220,60,60,0.5)"  : isActive ? "rgba(0,225,210,0.7)"  : isPreview ? "rgba(0,220,200,0.65)" : "rgba(0,180,170,0.22)";

  const stateLabel = {
    idle:      "PLACE FINGER ON SCANNER",
    scanning:  "SCANNING BIOMETRIC DATA...",
    preview:   `✓ IDENTITY VERIFIED — ENTERING IN ${countdown}s`,
    granting:  "GRANTING ACCESS...",
    not_in_db: "✗ NOT FOUND IN DATABASE",
    no_users:  "⚠ NO USERS REGISTERED",
  }[fpState];

  return (
    <PageShell>

      {/* ── HEADER ── */}
      <div style={{textAlign:"center" as const,marginBottom:22}}>
        {/* Animated icon */}
        <motion.div
          animate={{boxShadow:[
            "0 0 24px rgba(55,155,255,0.3)",
            "0 0 48px rgba(60,165,255,0.55)",
            "0 0 24px rgba(55,155,255,0.3)",
          ]}}
          transition={{duration:2.8,repeat:Infinity,ease:"easeInOut"}}
          style={{width:62,height:62,borderRadius:18,margin:"0 auto 14px",
            background:"linear-gradient(135deg,rgba(0,180,165,0.2),rgba(0,100,120,0.15))",
            border:"1.5px solid rgba(60,160,255,0.35)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Fingerprint style={{width:30,height:30,color:"hsl(218,100%,62%)",
            filter:"drop-shadow(0 0 10px rgba(70,175,255,0.85))"}}/>
        </motion.div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,
          letterSpacing:"0.1em",color:"rgba(210,235,255,0.98)",margin:"0 0 4px",
          textShadow:"0 0 30px rgba(55,155,255,0.3)"}}>
          BIMS
        </h1>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:8.5,letterSpacing:"0.18em",
          color:"rgba(0,200,185,0.45)",margin:0,textTransform:"uppercase" as const}}>
          Biometric Identity Management
        </p>
      </div>

      {/* ── SCANNER SECTION ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:16}}>
        <div style={{height:1,flex:1,background:"linear-gradient(90deg,transparent,rgba(55,155,255,0.25))"}}/>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.14em",
          color:"rgba(0,200,185,0.38)",textTransform:"uppercase" as const}}>Biometric Authentication</span>
        <div style={{height:1,flex:1,background:"linear-gradient(90deg,rgba(55,155,255,0.25),transparent)"}}/>
      </div>

      <AnimatePresence mode="wait">
        {!isPreview && !isGrant && (
          <motion.div key="scanner" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{display:"flex",flexDirection:"column" as const,alignItems:"center"}}>

            {/* Status pill */}
            <motion.div key={fpState} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
              style={{marginBottom:16,display:"flex",alignItems:"center",gap:8,
                padding:"6px 16px",borderRadius:99,backdropFilter:"blur(12px)",
                background:isError?"rgba(180,20,20,0.1)":isActive?"rgba(40,120,240,0.1)":"rgba(0,120,115,0.07)",
                border:`1px solid ${isError?"rgba(200,40,40,0.35)":isActive?"rgba(60,165,255,0.45)":"rgba(0,160,155,0.2)"}`}}>
              <motion.div animate={{opacity:[1,0.15,1]}} transition={{duration:1.4,repeat:Infinity}}
                style={{width:5,height:5,borderRadius:"50%",flexShrink:0,
                  background:isError?"hsl(0,80%,62%)":isActive?"hsl(218,100%,66%)":"hsl(185,80%,52%)",
                  boxShadow:"0 0 8px currentColor"}}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.06em",
                color:isError?"hsl(0,80%,68%)":isActive?"hsl(185,100%,72%)":"hsl(185,70%,58%)"}}>
                {stateLabel}
              </span>
            </motion.div>

            {/* Scanner disc */}
            <div style={{position:"relative",marginBottom:16}}>
              {/* Ambient glow */}
              <motion.div style={{position:"absolute",inset:-36,borderRadius:"50%",pointerEvents:"none",
                background:`radial-gradient(circle,${glowCol} 0%,transparent 68%)`}}
                animate={{scale:[0.9,1.08,0.9],opacity:[0.4,0.75,0.4]}}
                transition={{duration:3.2,repeat:Infinity,ease:"easeInOut"}}/>

              {/* Rotating arcs */}
              <svg style={{position:"absolute",inset:-20,overflow:"visible",pointerEvents:"none"}}
                viewBox="0 0 280 280" width="280" height="280">
                <motion.circle cx="140" cy="140" r="134" fill="none"
                  stroke={fpColor} strokeWidth="1.8" strokeDasharray="42 520" strokeLinecap="round"
                  style={{filter:`drop-shadow(0 0 7px ${glowCol})`}}
                  animate={{rotate:[0,360]}}
                  transition={{duration:isActive?1.1:3.8,repeat:Infinity,ease:"linear"}}/>
                <motion.circle cx="140" cy="140" r="134" fill="none"
                  stroke={`${fpColor}35`} strokeWidth="0.8" strokeDasharray="9 28"
                  animate={{rotate:[360,0]}} transition={{duration:7,repeat:Infinity,ease:"linear"}}/>
                {/* Tick marks */}
                {Array.from({length:36}).map((_,i)=>{
                  const a=(i/36)*Math.PI*2-Math.PI/2, R=134, len=i%9===0?12:i%3===0?6:3;
                  return <line key={i}
                    x1={140+(R-len)*Math.cos(a)} y1={140+(R-len)*Math.sin(a)}
                    x2={140+R*Math.cos(a)} y2={140+R*Math.sin(a)}
                    stroke={`${fpColor}${i%9===0?"bb":i%3===0?"55":"22"}`}
                    strokeWidth={i%9===0?1.4:0.6}/>;
                })}
              </svg>

              {/* Main disc */}
              <div style={{width:240,height:240,borderRadius:"50%",
                background:isError
                  ?"radial-gradient(circle at 38% 38%,hsla(0,70%,8%,0.97),hsla(0,70%,3%,0.99))"
                  :isPreview||isActive
                    ?"radial-gradient(circle at 38% 38%,hsla(185,70%,8%,0.97),hsla(190,70%,3%,0.99))"
                    :"radial-gradient(circle at 38% 38%,rgba(0,22,28,0.97),rgba(0,10,16,0.99))",
                border:`2px solid ${borderCol}`,
                boxShadow:`0 0 70px ${glowCol}20,inset 0 0 60px rgba(0,0,0,0.5)`,
                display:"flex",flexDirection:"column" as const,
                alignItems:"center",justifyContent:"center",gap:10,
                position:"relative",overflow:"hidden",transition:"all 0.45s"}}>
                {/* Inner rings */}
                <div style={{position:"absolute",inset:22,borderRadius:"50%",border:`1px solid ${fpColor}22`,pointerEvents:"none"}}/>
                <div style={{position:"absolute",inset:44,borderRadius:"50%",border:`1px dashed ${fpColor}14`,pointerEvents:"none"}}/>
                {/* Scan line */}
                {isActive && (
                  <motion.div animate={{y:["-55%","155%"]}} transition={{duration:0.85,repeat:Infinity,ease:"linear"}}
                    style={{position:"absolute",left:0,right:0,height:2,
                      background:`linear-gradient(90deg,transparent,${fpColor}ee,transparent)`,
                      boxShadow:`0 0 14px ${glowCol}`}}/>
                )}
                {/* Fingerprint icon */}
                <motion.div animate={isActive?{scale:[1,1.09,1],opacity:[0.78,1,0.78]}:{scale:1,opacity:1}}
                  transition={{duration:0.85,repeat:isActive?Infinity:0}}>
                  <Fingerprint style={{width:76,height:76,color:fpColor,
                    filter:`drop-shadow(0 0 22px ${glowCol}) drop-shadow(0 0 42px ${glowCol}55)`}}/>
                </motion.div>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:8.5,
                  letterSpacing:"0.24em",color:`${fpColor}80`,textTransform:"uppercase" as const}}>
                  {isActive?"Scanning…":isError?"Error":"Ready"}
                </span>
              </div>
            </div>

            {/* Error box */}
            <AnimatePresence>
              {isError && (
                <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{marginBottom:12,borderRadius:10,padding:"10px 14px",
                    display:"flex",alignItems:"flex-start",gap:8,width:"100%",
                    border:"1px solid rgba(220,60,60,0.28)",background:"rgba(180,20,20,0.08)",backdropFilter:"blur(12px)"}}>
                  <AlertTriangle style={{width:14,height:14,flexShrink:0,marginTop:1,color:"hsl(0,72%,65%)"}}/>
                  <p style={{fontFamily:"'Outfit',sans-serif",fontSize:10.5,fontWeight:500,
                    color:"hsl(0,85%,68%)",lineHeight:1.4,margin:0}}>
                    {fpState==="not_in_db"?"No registered users found.":"No active user accounts. Use manual login."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SCAN button */}
            {(fpState==="idle"||isError) && (
              <motion.button onClick={startScan}
                whileHover={{scale:1.018,y:-2}} whileTap={{scale:0.97}}
                style={{width:"100%",height:46,borderRadius:13,overflow:"hidden",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,
                  letterSpacing:"0.08em",cursor:"pointer",
                  background:"linear-gradient(135deg,hsl(218,100%,46%),hsl(225,100%,58%))",
                  border:"0",color:"hsl(185,80%,5%)",
                  boxShadow:"0 6px 30px rgba(60,165,255,0.45),0 0 0 1px rgba(50,140,255,0.2),inset 0 1px 0 rgba(255,255,255,0.2)",
                  marginBottom:6,position:"relative" as const}}>
                <motion.span style={{position:"absolute" as const,inset:0,
                  background:"linear-gradient(110deg,transparent 20%,rgba(255,255,255,0.14) 50%,transparent 80%)"}}
                  animate={{x:["-100%","100%"]}} transition={{duration:2.4,repeat:Infinity,repeatDelay:0.6}}/>
                <Fingerprint style={{width:18,height:18,flexShrink:0}}/>
                <span>{isError?"Try Again":"Scan Fingerprint"}</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Identity preview card */}
        {(isPreview||isGrant) && matchUser && matchRecord && (
          <motion.div key="fp-preview" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
            style={{marginBottom:12,width:"100%"}}>
            {isGrant ? (
              <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:10,padding:"16px 0"}}>
                <motion.div animate={{scale:[1,1.12,1]}} transition={{duration:0.8,repeat:Infinity}}
                  style={{width:44,height:44,borderRadius:"50%",
                    background:"rgba(50,145,255,0.12)",border:"1px solid rgba(60,165,255,0.45)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <CheckCircle style={{width:22,height:22,color:"hsl(218,100%,62%)"}}/>
                </motion.div>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",
                  textTransform:"uppercase" as const,color:"rgba(80,185,255,0.9)"}}>Granting Access…</p>
              </div>
            ) : (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                style={{borderRadius:14,overflow:"hidden",
                  border:"1px solid rgba(55,155,255,0.35)",
                  background:"rgba(4,12,32,0.96)",
                  boxShadow:"0 0 40px rgba(50,145,255,0.14)"}}>
                {/* Header strip */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"8px 14px",
                  background:"rgba(50,140,255,0.07)",
                  borderBottom:"1px solid rgba(50,145,255,0.15)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1,repeat:Infinity}}
                      style={{width:7,height:7,borderRadius:"50%",
                        background:"hsl(210,100%,62%)",boxShadow:"0 0 8px rgba(70,175,255,0.85)"}}/>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,
                      letterSpacing:"0.16em",color:"rgba(80,185,255,0.9)",textTransform:"uppercase" as const}}>
                      Identity Confirmed — Access In {countdown}s
                    </span>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,
                    color:"hsl(218,100%,66%)"}}>{countdown}</span>
                </div>
                {/* Profile */}
                <div style={{display:"flex",gap:14,padding:"14px"}}>
                  {matchRecord.photo
                    ? <img src={matchRecord.photo} alt="" style={{width:70,height:70,borderRadius:10,objectFit:"cover" as const,border:"1px solid rgba(55,155,255,0.35)",flexShrink:0}}/>
                    : <div style={{width:70,height:70,borderRadius:10,
                        background:"rgba(40,120,240,0.1)",border:"1px solid rgba(0,200,185,0.3)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:26,fontWeight:800,color:"hsl(218,100%,66%)",flexShrink:0}}>
                        {matchUser.fullName.charAt(0).toUpperCase()}
                      </div>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
                      color:"rgba(210,238,255,0.98)",marginBottom:6}}>{matchUser.fullName}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 14px",marginBottom:10}}>
                      {[["ID",matchRecord.id],["ROLE",ROLE_LABELS[matchUser.role]],
                        ["USERNAME",`@${matchUser.username}`],["NATIONALITY",matchRecord.nationality||"—"]].map(([l,v])=>(
                        <div key={l}>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,fontWeight:700,
                            letterSpacing:"0.14em",color:"rgba(50,140,255,0.38)",textTransform:"uppercase" as const}}>{l}</div>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,
                            color:"rgba(185,225,255,0.88)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div style={{height:3,borderRadius:2,background:"rgba(50,140,255,0.12)",overflow:"hidden"}}>
                      <motion.div style={{height:"100%",
                        background:"linear-gradient(90deg,hsl(218,100%,55%),hsl(225,100%,65%))",originX:0}}
                        animate={{width:`${((2-countdown)/2)*100}%`}}
                        transition={{duration:1,ease:"linear"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
                      <button onClick={resetScan}
                        style={{background:"none",border:"none",cursor:"pointer",
                          fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.14em",
                          color:"rgba(50,140,255,0.35)",transition:"color .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.color="rgba(0,220,200,0.72)"}
                        onMouseLeave={e=>e.currentTarget.style.color="rgba(50,140,255,0.35)"}>
                        NOT ME — CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MANUAL LOGIN ── */}
      <div style={{marginTop:14,borderTop:"1px solid rgba(0,180,170,0.14)",paddingTop:14}}>
        <button onClick={()=>{setShowManual(v=>!v);setManualPreview(null);setManualErr("");}}
          style={{display:"flex",alignItems:"center",gap:6,margin:"0 auto",cursor:"pointer",
            background:"none",border:"none",padding:0,
            fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:500,
            letterSpacing:"0.04em",color:"rgba(50,140,255,0.38)",transition:"color .15s"}}
          onMouseEnter={e=>(e.currentTarget.style.color="rgba(0,220,200,0.7)")}
          onMouseLeave={e=>(e.currentTarget.style.color="rgba(50,140,255,0.38)")}>
          {showManual?<ChevronUp style={{width:12,height:12}}/>:<ChevronDown style={{width:12,height:12}}/>}
          Manual login (admin / owner)
        </button>

        <AnimatePresence>
          {showManual && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              style={{overflow:"hidden",marginTop:14}}>

              {/* Manual identity preview */}
              <AnimatePresence>
                {manualPreview && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    style={{marginBottom:14,padding:"12px 14px",borderRadius:12,
                      background:"rgba(0,180,170,0.08)",border:"1px solid rgba(55,155,255,0.25)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {manualPreview.rec.photo
                        ? <img src={manualPreview.rec.photo} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover" as const,border:"1px solid rgba(0,200,185,0.3)",flexShrink:0}}/>
                        : <div style={{width:44,height:44,borderRadius:8,
                            background:"rgba(50,140,255,0.12)",border:"1px solid rgba(55,155,255,0.28)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:18,fontWeight:800,color:"hsl(218,100%,66%)",flexShrink:0}}>
                            {manualPreview.user.fullName.charAt(0).toUpperCase()}
                          </div>}
                      <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,
                          color:"rgba(200,235,255,0.95)"}}>{manualPreview.user.fullName}</div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,
                          color:"rgba(55,155,255,0.55)"}}>{ROLE_LABELS[manualPreview.user.role]} · @{manualPreview.user.username}</div>
                      </div>
                    </div>
                    <div style={{marginTop:8,height:2,borderRadius:2,background:"rgba(50,140,255,0.12)",overflow:"hidden"}}>
                      <motion.div style={{height:"100%",
                        background:"linear-gradient(90deg,hsl(218,100%,55%),hsl(225,100%,65%))",originX:0}}
                        animate={{width:"100%"}} transition={{duration:1.1,ease:"linear"}}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!manualPreview && (
                <div style={{display:"flex",flexDirection:"column" as const,gap:12,textAlign:"left" as const}}>
                  <div>
                    <label style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:600,
                      letterSpacing:"0.12em",textTransform:"uppercase" as const,
                      color:"rgba(0,190,175,0.45)",display:"block",marginBottom:6}}>Username</label>
                    <input value={manualUser} onChange={e=>{setManualUser(e.target.value);setManualErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&handleManual()}
                      placeholder="Enter username" className="input-cyber" autoComplete="username"/>
                  </div>
                  <div>
                    <label style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:600,
                      letterSpacing:"0.12em",textTransform:"uppercase" as const,
                      color:"rgba(0,190,175,0.45)",display:"block",marginBottom:6}}>Password</label>
                    <input type="password" value={manualPass} onChange={e=>{setManualPass(e.target.value);setManualErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&handleManual()}
                      placeholder="Enter password" className="input-cyber" autoComplete="current-password"/>
                  </div>
                  {manualErr && (
                    <p style={{fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:500,
                      color:"hsl(0,85%,65%)",margin:0}}>{manualErr}</p>
                  )}
                  <motion.button onClick={handleManual}
                    whileHover={{scale:1.015,y:-1}} whileTap={{scale:0.98}}
                    style={{width:"100%",height:43,borderRadius:12,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,
                      letterSpacing:"0.06em",
                      background:"linear-gradient(135deg,rgba(0,180,170,0.18),rgba(0,120,115,0.12))",
                      border:"1.5px solid rgba(50,145,255,0.4)",
                      color:"hsl(218,100%,72%)",transition:"all .18s"}}>
                    <Shield style={{width:14,height:14,flexShrink:0}}/>
                    Verify Identity
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

/* ─── ROOT EXPORT ─── */
const Login = () => <LoginScreen />;
export default Login;
