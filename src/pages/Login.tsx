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
  admin: "hsl(0,90%,68%)", operator: "hsl(185,100%,66%)",
  analyst: "hsl(195,85%,65%)", viewer: "hsl(140,80%,62%)",
};
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "ADMIN", operator: "OPERATOR", analyst: "ANALYST", viewer: "VIEWER",
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
      alignItems:"center",justifyContent:"center",padding:"24px 16px",
      background:"rgb(4,8,16)"}}>
      <CyberBackground/>

      {/* BIMS logo top-left */}
      <div style={{position:"fixed",top:25,left:18,zIndex:20,display:"flex",alignItems:"center",gap:9}}>
        <svg width="26" height="26" viewBox="0 0 26 26">
          <polygon points="13,1 24,7 24,19 13,25 2,19 2,7"
            fill="none" stroke="rgba(0,160,200,0.55)" strokeWidth="1"/>
          <polygon points="13,5 21,10 21,18 13,23 5,18 5,10"
            fill="rgba(0,160,200,0.05)" stroke="rgba(0,160,200,0.25)" strokeWidth="0.5"/>
          <text x="13" y="17" textAnchor="middle" fontFamily="monospace"
            fontSize="7" fontWeight="900" fill="rgba(0,200,255,0.85)">B</text>
        </svg>
        <div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:800,
            letterSpacing:"0.28em",color:"rgba(210,235,255,0.88)"}}>BIMS</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:7,fontWeight:400,
            letterSpacing:"0.1em",color:"rgba(0,160,200,0.35)",textTransform:"uppercase" as const}}>Biometric Identity</div>
        </div>
      </div>

      {/* Support button top-right */}
      <button className="btn-nx-ghost" onClick={()=>setShowSupport(true)}
        style={{position:"fixed",top:24,right:18,zIndex:20}}>
        <Headphones style={{width:11,height:11}}/><span className="hidden sm:inline">Support</span>
      </button>

      {/* Login card */}
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:384,marginTop:8}}>
        <motion.div initial={{opacity:0,y:24,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
          transition={{duration:0.35,ease:"easeOut"}}
          style={{
            padding:"28px 24px",textAlign:"center" as const,
            background:"rgba(4,10,20,0.92)",
            border:"1px solid rgba(0,140,180,0.18)",
            borderTop:"2px solid rgba(0,160,200,0.45)",
            borderRadius:2,
            boxShadow:"0 0 60px rgba(0,0,0,0.9),0 0 30px rgba(0,120,180,0.08),inset 0 0 30px rgba(0,80,120,0.04)",
            backdropFilter:"blur(20px)",
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
  const [fpState,     setFpState]     = useState<FpState>("idle");
  const [matchUser,   setMatchUser]   = useState<BIMSUser | null>(null);
  const [matchRecord, setMatchRecord] = useState<any>(null);
  const [showManual,  setShowManual]  = useState(false);
  const [manualUser,  setManualUser]  = useState("");
  const [manualPass,  setManualPass]  = useState("");
  const [manualErr,   setManualErr]   = useState("");
  const [manualPreview, setManualPreview] = useState<{user:BIMSUser;rec:any}|null>(null);
  const scanRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (scanRef.current) clearTimeout(scanRef.current); }, []);

  const findRecord = (user: BIMSUser) => {
    const all = getRoles();
    const n = user.fullName.trim().toLowerCase();
    return all.find((r:any) =>
      `${r.name} ${r.surname}`.toLowerCase() === n ||
      `${r.surname} ${r.name}`.toLowerCase() === n ||
      (n.includes(r.name?.toLowerCase()) && n.includes(r.surname?.toLowerCase()))
    ) || null;
  };

  /* ── Fingerprint scan ── */
  const startScan = () => {
    if (fpState === "scanning" || fpState === "preview" || fpState === "granting") return;
    setFpState("scanning");
    setMatchUser(null); setMatchRecord(null);

    /* Single 2.4s scan → immediately show profile → reset after 1 second */
    scanRef.current = setTimeout(() => {
      const users = getUsers().filter(u => u.active);
      if (users.length === 0) { setFpState("no_users"); return; }

      // Pick first active user — fingerprint verified = immediate access, no record required
      const found = users[0];
      const foundRec = findRecord(found) || {
        id: found.id,
        name: found.fullName.split(" ")[0] || found.fullName,
        surname: found.fullName.split(" ").slice(1).join(" ") || "",
        photo: null,
        nationality: "—",
        dateOfBirth: "—",
        gender: "—",
        bloodType: "—",
        phoneNo: "—",
      };

      /* Show profile card immediately — no requirements */
      setMatchUser(found); setMatchRecord(foundRec);
      setFpState("preview");

      /* Auto-login after 2 seconds */
      scanRef.current = setTimeout(() => {
        doLogin(found!);
        navigate("/", { replace: true });
      }, 2000);
    }, 2400);
  };

  /* ── Confirm and enter ── */
  const confirmEntry = () => {
    if (!matchUser) return;
    setFpState("granting");
    scanRef.current = setTimeout(() => {
      doLogin(matchUser);
      navigate("/", { replace: true });
    }, 800);
  };

  const resetScan = () => {
    if (scanRef.current) clearTimeout(scanRef.current);
    setFpState("idle"); setMatchUser(null); setMatchRecord(null);
  };

  /* ── Manual login ── */
  const handleManual = () => {
    setManualErr(""); setManualPreview(null);
    if (!manualUser.trim()) { setManualErr("Username is required"); return; }
    if (!manualPass)        { setManualErr("Password is required"); return; }
    const users = getUsers();
    const user  = users.find(u => u.username === manualUser.trim().toLowerCase() && u.password === manualPass && u.active);
    if (!user) { setManualErr("Incorrect username or password"); setManualPass(""); return; }
    if (user.role !== "admin" && user.role !== "owner") {
      const rec = findRecord(user);
      if (!rec) { setManualErr("User not found in biometric database. Contact administrator."); return; }
      /* auto-login after 1s — same as fingerprint */
      setManualPreview({ user, rec });
      setTimeout(() => { doLogin(user); navigate("/", { replace: true }); }, 1100);
    } else {
      const rec = findRecord(user);
      setManualPreview({ user, rec: rec || { name: user.fullName, surname:"", photo:null, id:"ADMIN", nationality:"—", dateOfBirth:"—", gender:"—" } });
      /* auto-login after 1s */
      setTimeout(() => { doLogin(user); navigate("/", { replace: true }); }, 1100);
    }
  };

  const confirmManual = () => {
    if (!manualPreview) return;
    doLogin(manualPreview.user);
    navigate("/", { replace: true });
  };

  /* ── State-driven colors ── */
  const isActive  = fpState === "scanning";
  const isPreview = fpState === "preview";
  const isGrant   = fpState === "granting";
  const isError   = fpState === "not_in_db" || fpState === "no_users";

  const fpColor = isGrant ? "hsl(192,100%,60%)" : isPreview ? "hsl(192,100%,60%)" : isError ? "hsl(0,90%,65%)" : isActive ? "hsl(192,100%,65%)" : "hsla(192,80%,42%,0.45)";

  const stateLabel = {
    idle:      "PLACE FINGER ON SCANNER",
    scanning:  "SCANNING BIOMETRIC DATA...",
    preview:   "✓ IDENTITY VERIFIED",
    granting:  "GRANTING ACCESS...",
    not_in_db: "✗ NOT FOUND IN BIOMETRIC DATABASE",
    no_users:  "⚠ NO USERS REGISTERED",
  }[fpState];

  /* ── Countdown state for fingerprint auto-login ── */
  const [countdown, setCountdown] = useState(2);
  useEffect(() => {
    if (fpState !== "preview") { setCountdown(2); return; }
    const iv = setInterval(() => setCountdown(p => { if(p<=1){clearInterval(iv);return 0;}return p-1; }), 1000);
    return () => clearInterval(iv);
  }, [fpState]);

  /* ── Fingerprint identity card — auto logs in, no button ── */
  const FpIdentityCard = ({ user, rec }: { user: BIMSUser; rec: any }) => (
    <motion.div initial={{ opacity:0, y:10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10 }}
      className="rounded-2xl overflow-hidden w-full"
      style={{ border:"1px solid rgba(0,200,140,0.4)", background:"rgba(4,12,22,0.96)", borderRadius:3, boxShadow:"0 0 50px rgba(0,180,120,0.18), 0 0 0 1px rgba(0,180,120,0.06)" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", background:"rgba(0,160,100,0.07)", borderBottom:"1px solid rgba(0,180,120,0.18)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1,repeat:Infinity}}
            style={{ width:7, height:7, borderRadius:"50%", background:"rgba(0,220,140,0.9)", boxShadow:"0 0 8px rgba(0,220,140,0.8)" }}/>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700, letterSpacing:"0.2em",
            color:"rgba(0,220,140,0.85)", textTransform:"uppercase" as const }}>
            IDENTITY CONFIRMED — ACCESS IN {countdown}s
          </span>
        </div>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(0,200,140,0.1)", border:"1px solid rgba(0,200,140,0.45)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span className="font-mono font-bold" style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:800, color:"rgba(0,220,140,0.9)", lineHeight:1 }}>{countdown}</span>
        </div>
      </div>
      {/* Profile body */}
      <div style={{ display:"flex", gap:16, padding:"16px" }}>
        {rec.photo
          ? <img src={rec.photo} alt="" style={{ width:72, height:72, borderRadius:6, objectFit:"cover", border:"1px solid rgba(0,200,140,0.4)", flexShrink:0 }}/>
          : <div style={{ width:72, height:72, borderRadius:6, background:"rgba(0,120,180,0.1)", border:"1px solid rgba(0,180,220,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:700, color:"rgba(0,200,255,0.85)", flexShrink:0 }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>}
        <div style={{ flex:1, minWidth:0 }}>
          <div className="font-display font-bold" style={{ fontFamily:"'Inter',sans-serif", fontSize:16, fontWeight:800, color:"rgba(210,240,255,0.95)", marginBottom:5, letterSpacing:"0.02em" }}>{user.fullName}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px", marginBottom:10 }}>
            {[
              ["BIOMETRIC ID", rec.id],
              ["ROLE",         ROLE_LABELS[user.role]],
              ["USERNAME",     `@${user.username}`],
              ["GENDER",       rec.gender||"—"],
              ["DOB",          rec.dateOfBirth||"—"],
              ["NATIONALITY",  rec.nationality||"—"],
              ["BLOOD TYPE",   rec.bloodType||"—"],
              ["PHONE",        rec.phoneNo||"—"],
            ].map(([l,v])=>(
              <div key={l}>
                <div className="font-mono" style={{ fontFamily:"'Inter',sans-serif", fontSize:7.5, fontWeight:700, letterSpacing:"0.12em", color:"rgba(0,170,210,0.38)", textTransform:"uppercase" as const }}>{l}</div>
                <div className="font-mono" style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color:"rgba(190,220,255,0.85)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ height:2, borderRadius:1, background:"rgba(0,180,120,0.1)", overflow:"hidden" }}>
            <motion.div style={{ height:"100%", background:"linear-gradient(90deg,rgba(0,200,140,0.8),rgba(0,240,180,0.9))", originX:0 }}
              animate={{ width:`${((1-countdown)/1)*100}%` }}
              transition={{ duration:1, ease:"linear" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
            <button onClick={resetScan}
              className="font-mono text-[9px] font-bold tracking-wider transition-all"
              style={{ background:"none", border:"none", cursor:"pointer", color:"hsla(192,70%,52%,0.38)", padding:0, fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"0.18em" }}
              onMouseEnter={e=>e.currentTarget.style.color="rgba(0,200,255,0.72)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(0,160,200,0.38)"}>
              NOT ME — CANCEL
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  /* ── Manual identity card — auto logs in after 1s like fingerprint ── */
  const IdentityCard = ({ user, rec, onCancel }: { user: BIMSUser; rec: any; onConfirm: ()=>void; onCancel: ()=>void }) => (
    <motion.div initial={{ opacity:0, y:10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10 }}
      className="rounded-2xl overflow-hidden w-full"
      style={{ border:"1px solid hsla(210,60%,40%,0.35)", background:"hsla(215,55%,5%,0.97)", boxShadow:"0 0 50px hsla(192,100%,52%,0.16), 0 0 0 1px hsla(192,100%,52%,0.06)" }}>
      {/* Header strip */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"hsla(38,100%,50%,0.1)", borderBottom:"1px solid hsla(38,80%,45%,0.22)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"hsl(192,100%,60%)", boxShadow:"0 0 8px hsl(192,100%,58%)" }}/>
          <span className="font-hud text-[9px] font-bold tracking-[0.2em]" style={{ color:"hsl(38,100%,70%)" }}>{`IDENTITY VERIFIED — ENTERING IN ${countdown}s`}</span>
        </div>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"hsla(192,100%,52%,0.12)", border:"1px solid rgba(0,180,220,0.45)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span className="font-hud font-bold" style={{ fontSize:15, color:"hsl(192,100%,68%)", lineHeight:1 }}>{countdown}</span>
        </div>
      </div>
      {/* Profile body */}
      <div style={{ display:"flex", gap:16, padding:"16px" }}>
        {rec.photo
          ? <img src={rec.photo} alt="" style={{ width:72, height:72, borderRadius:6, objectFit:"cover", border:"1px solid rgba(0,200,140,0.4)", flexShrink:0 }}/>
          : <div style={{ width:80, height:80, borderRadius:12, background:"hsla(192,100%,52%,0.08)", border:"1px solid hsla(192,100%,52%,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:700, color:"hsl(192,100%,65%)", flexShrink:0 }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>}
        <div style={{ flex:1, minWidth:0 }}>
          <div className="font-display font-bold" style={{ fontSize:18, color:"hsl(192,60%,92%)", marginBottom:6 }}>{user.fullName}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px", marginBottom:10 }}>
            {[
              ["BIOMETRIC ID", rec.id],
              ["ROLE",         ROLE_LABELS[user.role]],
              ["USERNAME",     `@${user.username}`],
              ["NATIONALITY",  rec.nationality||"—"],
            ].map(([l,v])=>(
              <div key={l}>
                <div className="font-hud" style={{ fontSize:7, fontWeight:700, letterSpacing:"0.18em", color:"hsla(192,100%,55%,0.4)" }}>{l}</div>
                <div className="font-mono" style={{ fontSize:10, color:"hsla(192,55%,88%,0.88)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ height:3, borderRadius:2, background:"hsla(192,100%,52%,0.12)", overflow:"hidden" }}>
            <motion.div style={{ height:"100%", background:"linear-gradient(90deg,hsl(192,100%,55%),hsl(210,100%,62%))", originX:0 }}
              animate={{ width:`${((1-countdown)/1)*100}%` }}
              transition={{ duration:1, ease:"linear" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
            <button onClick={onCancel}
              className="font-hud text-[8px] font-bold tracking-[0.16em] transition-all"
              style={{ background:"none", border:"none", cursor:"pointer", color:"hsla(192,70%,52%,0.38)", padding:0 }}
              onMouseEnter={e=>e.currentTarget.style.color="rgba(0,200,255,0.72)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(0,160,200,0.38)"}>
              NOT ME — CANCEL
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <PageShell>
      {/* NEXUS header */}
      <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:8,marginBottom:18}}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <polygon points="22,2 40,11 40,33 22,42 4,33 4,11"
            fill="none" stroke="rgba(0,180,220,0.45)" strokeWidth="1"/>
          <polygon points="22,8 36,15 36,29 22,36 8,29 8,15"
            fill="rgba(0,120,180,0.06)" stroke="rgba(0,160,200,0.2)" strokeWidth="0.5"/>
          <text x="22" y="27" textAnchor="middle" fontFamily="monospace"
            fontSize="13" fontWeight="900" fill="rgba(0,210,255,0.85)">B</text>
        </svg>
        <div>
          <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:800,
            letterSpacing:"0.22em",color:"rgba(210,235,255,0.95)",margin:0,
            textShadow:"0 0 30px rgba(0,180,220,0.35)"}}>BIMS</h1>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:8,letterSpacing:"0.14em",
            marginTop:3,color:"rgba(0,160,200,0.38)",textTransform:"uppercase" as const}}>
            Biometric Identity Management
          </p>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,justifyContent:"center"}}>
        <div style={{height:1,width:32,background:"linear-gradient(90deg,transparent,rgba(0,160,200,0.28))"}}/>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:8.5,fontWeight:500,
          letterSpacing:"0.16em",textTransform:"uppercase" as const,
          color:"rgba(0,160,200,0.4)"}}>Biometric Authentication</span>
        <div style={{height:1,width:32,background:"linear-gradient(90deg,rgba(0,160,200,0.28),transparent)"}}/>
      </div>

      {/* ── SQUARE PLATE SCANNER ── */}
      <AnimatePresence mode="wait">
        {!isPreview && !isGrant && (
          <motion.div key="scanner" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:0}}>

            {/* Status pill */}
            <motion.div key={fpState} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
              style={{marginBottom:14,display:"flex",alignItems:"center",gap:8,
                padding:"5px 14px",borderRadius:6,backdropFilter:"blur(12px)",
                background:isError?"rgba(180,20,20,0.1)":isActive?"rgba(0,120,180,0.1)":"rgba(0,80,120,0.06)",
                border:`1px solid ${isError?"rgba(200,40,40,0.35)":isActive?"rgba(0,180,220,0.45)":"rgba(0,120,160,0.2)"}`}}>
              <motion.div animate={{opacity:[1,0.15,1]}} transition={{duration:1.4,repeat:Infinity}}
                style={{width:5,height:5,borderRadius:"50%",flexShrink:0,
                  background:isError?"hsl(0,80%,62%)":isActive?"hsl(200,100%,62%)":"hsl(200,80%,55%)",
                  boxShadow:"0 0 8px currentColor"}}/>
              <span style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:9,fontWeight:500,
                letterSpacing:"0.04em",
                color:isError?"hsl(0,80%,68%)":isActive?"hsl(200,100%,75%)":"hsl(200,70%,60%)"}}>
                {stateLabel}
              </span>
            </motion.div>

            {/* The square biometric plate */}
            <div style={{position:"relative",marginBottom:12}}>
              {/* ambient glow */}
              <motion.div style={{position:"absolute",inset:-20,borderRadius:24,pointerEvents:"none",
                background:`radial-gradient(ellipse,hsla(${isError?0:192},100%,52%,0.1),transparent 70%)`}}
                animate={{opacity:[0.5,1,0.5]}} transition={{duration:3,repeat:Infinity}}/>

              {/* spinning SVG arc */}
              <svg style={{position:"absolute",inset:-4,pointerEvents:"none"}} width="100%" height="100%"
                viewBox="0 0 184 184">
                <motion.circle cx="92" cy="92" r="88"
                  fill="none"
                  stroke={isError?"hsl(0,80%,65%)":isActive?"rgba(0,210,255,0.9)":"rgba(0,180,220,0.5)"}
                  strokeWidth="1.5" strokeDasharray="45 508" strokeLinecap="round"
                  style={{filter:isActive?"drop-shadow(0 0 8px hsl(192,100%,70%))":"none"}}
                  animate={{rotate:[0,360]}}
                  transition={{duration:isActive?0.9:3.5,repeat:Infinity,ease:"linear"}}/>
                <motion.circle cx="92" cy="92" r="88"
                  fill="none" stroke={isError?"rgba(200,30,30,0.2)":"rgba(0,160,200,0.15)"}
                  strokeWidth="1" strokeDasharray="15 80" strokeLinecap="round"
                  animate={{rotate:[360,0]}} transition={{duration:6,repeat:Infinity,ease:"linear"}}/>
              </svg>

              {/* plate body */}
              <div style={{width:176,height:176,borderRadius:16,position:"relative",overflow:"hidden",
                background:isError?"linear-gradient(145deg,rgba(30,4,4,0.98),rgba(16,2,2,1))":isActive?"linear-gradient(145deg,rgba(4,14,28,0.97),rgba(2,8,18,1))":"linear-gradient(145deg,rgba(4,12,24,0.97),rgba(2,8,16,1))",
                border:`1.5px solid ${isError?"rgba(200,40,40,0.55)":isActive?"rgba(0,180,220,0.65)":"rgba(0,130,170,0.22)"}`,
                boxShadow:isError?"0 0 50px hsla(0,90%,52%,0.28),inset 0 0 40px hsla(0,90%,52%,0.05)":
                          isActive?"0 0 60px hsla(192,100%,52%,0.35),inset 0 0 50px hsla(192,100%,52%,0.07)":
                          "0 0 36px hsla(192,100%,52%,0.12),inset 0 0 32px hsla(192,100%,52%,0.04)",
                transition:"all 0.5s ease"}}>

                {/* corner brackets */}
                {[["top-0 left-0","border-t-2 border-l-2 rounded-tl-xl"],
                  ["top-0 right-0","border-t-2 border-r-2 rounded-tr-xl"],
                  ["bottom-0 left-0","border-b-2 border-l-2 rounded-bl-xl"],
                  ["bottom-0 right-0","border-b-2 border-r-2 rounded-br-xl"]].map(([pos,cls],ci)=>(
                  <motion.div key={ci} className={`absolute w-6 h-6 ${pos} ${cls}`}
                    style={{borderColor:isError?"rgba(200,40,40,0.55)":isActive?"rgba(0,180,220,0.62)":"rgba(0,130,170,0.2)",
                      margin:6,pointerEvents:"none"}}
                    animate={{opacity:[0.4,1,0.4]}} transition={{duration:2,delay:ci*0.3,repeat:Infinity}}/>
                ))}

                {/* dot grid */}
                <div style={{position:"absolute",inset:0,pointerEvents:"none",
                  backgroundImage:`radial-gradient(circle,${isActive?"rgba(0,180,220,0.12)":"rgba(0,140,180,0.05)"} 1px,transparent 1px)`,
                  backgroundSize:"18px 18px"}}/>

                {/* crosshair */}
                <div style={{position:"absolute",top:"50%",left:16,right:16,height:1,transform:"translateY(-50%)",
                  background:`linear-gradient(90deg,transparent,${isActive?"rgba(0,180,220,0.2)":"rgba(0,140,180,0.07)"},transparent)`,pointerEvents:"none"}}/>
                <div style={{position:"absolute",left:"50%",top:16,bottom:16,width:1,transform:"translateX(-50%)",
                  background:`linear-gradient(180deg,transparent,${isActive?"rgba(0,180,220,0.2)":"rgba(0,140,180,0.07)"},transparent)`,pointerEvents:"none"}}/>

                {/* scan beam */}
                {isActive && (
                  <motion.div style={{position:"absolute",left:0,right:0,height:2,
                    background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.95),white,rgba(0,200,255,0.95),transparent)",
                    boxShadow:"0 0 20px rgba(0,200,255,0.95),0 0 40px rgba(0,160,220,0.5)"}}
                    initial={{top:"5%"}} animate={{top:["5%","93%","5%"]}} transition={{duration:1.2,repeat:Infinity,ease:"easeInOut"}}/>
                )}

                {/* fingerprint */}
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",gap:6}}>
                  <motion.div animate={isActive?{scale:[1,1.08,1],rotate:[0,1.5,-1.5,0]}:{}}
                    transition={{duration:0.8,repeat:Infinity}}>
                    <Fingerprint style={{width:68,height:68,
                      color:isError?"hsl(0,80%,65%)":isActive?"hsl(200,100%,68%)":"hsl(200,80%,58%)",
                      filter:isError?"drop-shadow(0 0 18px hsla(0,90%,55%,0.9))":
                             isActive?"drop-shadow(0 0 24px rgba(0,200,255,0.99)) drop-shadow(0 0 48px rgba(0,160,220,0.45))":
                             "drop-shadow(0 0 12px rgba(0,160,200,0.5))",
                      transition:"all 0.4s ease"}}/>
                  </motion.div>
                  <div style={{textAlign:"center" as const}}>
                    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:9,fontWeight:500,
                      letterSpacing:"0.08em",textTransform:"uppercase" as const,
                      color:isError?"hsl(0,80%,62%)":isActive?"rgba(0,200,255,0.85)":"rgba(0,160,200,0.38)"}}>
                      {isActive?"Scanning…":isError?"Error":"Ready"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error detail */}
            <AnimatePresence>
              {isError && (
                <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{marginBottom:10,borderRadius:8,padding:"10px 14px",
                    display:"flex",alignItems:"flex-start",gap:8,maxWidth:320,
                    border:"1px solid hsla(0,80%,55%,0.3)",background:"hsla(0,80%,5%,0.6)",backdropFilter:"blur(12px)"}}>
                  <AlertTriangle style={{width:14,height:14,flexShrink:0,marginTop:1,color:"hsl(0,72%,65%)"}}/>
                  <p style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:10,fontWeight:500,
                    color:"hsl(0,90%,68%)",lineHeight:1.4}}>
                    {fpState==="not_in_db"?"No registered users found. Register via New Registration first.":
                     "No active user accounts. Use manual login below."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan / retry button */}
            {(fpState==="idle" || isError) && (
              <motion.button onClick={startScan}
                whileHover={{scale:1.02,y:-1}} whileTap={{scale:0.97}}
                style={{
                  width:"100%",height:42,borderRadius:8,overflow:"hidden",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:9,
                  fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:12,fontWeight:600,
                  letterSpacing:"0.04em",cursor:"pointer",
                  background:"rgba(0,80,130,0.18)",
                  border:"1.5px solid hsla(38,100%,60%,0.7)",
                  color:"hsl(22,18%,5%)",
                  boxShadow:"0 0 30px hsla(38,100%,50%,0.45),inset 0 1px 0 rgba(255,255,255,0.2)",
                  marginBottom:8,position:"relative" as const,
                }}>
                <motion.span style={{position:"absolute" as const,inset:0,
                  background:"linear-gradient(110deg,transparent 22%,hsla(192,100%,88%,0.08) 50%,transparent 78%)"}}
                  animate={{x:["-100%","100%"]}} transition={{duration:2.6,repeat:Infinity,repeatDelay:0.4}}/>
                <Fingerprint style={{width:16,height:16,flexShrink:0}}/>
                <span>{isError?"Try Again":"Scan Fingerprint"}</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* identity preview */}
        {(isPreview || isGrant) && matchUser && matchRecord && (
          <motion.div key="fp-preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{marginBottom:12,width:"100%"}}>
            {isGrant
              ? <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:8,padding:"16px 0"}}>
                  <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:0.8,repeat:Infinity}}
                    style={{width:40,height:40,borderRadius:"50%",
                      background:"hsla(192,100%,52%,0.12)",border:"1px solid rgba(0,180,220,0.45)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CheckCircle style={{width:20,height:20,color:"rgba(0,200,255,0.85)"}}/>
                  </motion.div>
                  <p style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:11,fontWeight:600,
                    letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(0,200,255,0.85)"}}>Granting Access…</p>
                </div>
              : <FpIdentityCard user={matchUser} rec={matchRecord}/>
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MANUAL LOGIN — always visible, styled as a clean card ── */}
      <div style={{marginTop:12,borderTop:"1px solid hsla(192,60%,18%,0.2)",paddingTop:14}}>
        <button onClick={()=>{setShowManual(v=>!v);setManualPreview(null);setManualErr("");}}
          style={{display:"flex",alignItems:"center",gap:6,margin:"0 auto",cursor:"pointer",
            background:"none",border:"none",padding:0,
            fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:10,fontWeight:500,
            letterSpacing:"0.06em",color:"hsla(210,40%,55%,0.35)",transition:"color .15s"}}
          onMouseEnter={e=>(e.currentTarget.style.color="hsla(192,100%,65%,0.75)")}
          onMouseLeave={e=>(e.currentTarget.style.color="hsla(192,70%,60%,0.45)")}>
          {showManual?<ChevronUp style={{width:12,height:12}}/>:<ChevronDown style={{width:12,height:12}}/>}
          Manual login (admin / owner)
        </button>

        <AnimatePresence>
          {showManual && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              style={{overflow:"hidden",marginTop:14}}>
              <AnimatePresence>
                {manualPreview && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{marginBottom:14}}>
                    <IdentityCard user={manualPreview.user} rec={manualPreview.rec} onConfirm={confirmManual} onCancel={()=>{setManualPreview(null);setManualPass("");}}/>
                  </motion.div>
                )}
              </AnimatePresence>

              {!manualPreview && (
                <div style={{display:"flex",flexDirection:"column" as const,gap:10,textAlign:"left" as const}}>
                  <div>
                    <label style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:9,fontWeight:600,
                      letterSpacing:"0.12em",textTransform:"uppercase" as const,
                      color:"hsla(210,40%,58%,0.45)",display:"block",marginBottom:5}}>Username</label>
                    <input value={manualUser} onChange={e=>{setManualUser(e.target.value);setManualErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&handleManual()}
                      placeholder="Enter username" className="input-cyber" autoComplete="username"/>
                  </div>
                  <div>
                    <label style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:9,fontWeight:600,
                      letterSpacing:"0.12em",textTransform:"uppercase" as const,
                      color:"hsla(192,80%,65%,0.5)",display:"block",marginBottom:5}}>Password</label>
                    <input type="password" value={manualPass} onChange={e=>{setManualPass(e.target.value);setManualErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&handleManual()}
                      placeholder="Enter password" className="input-cyber" autoComplete="current-password"/>
                  </div>
                  {manualErr && (
                    <p style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:10,fontWeight:500,
                      color:"hsl(0,90%,68%)",margin:0}}>{manualErr}</p>
                  )}
                  <motion.button onClick={handleManual}
                    whileHover={{scale:1.01,y:-1}} whileTap={{scale:0.98}}
                    style={{
                      width:"100%",height:40,borderRadius:8,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:12,fontWeight:600,
                      letterSpacing:"0.04em",
                      background:"linear-gradient(135deg,hsla(38,90%,42%,0.2),hsla(32,90%,40%,0.1))",
                      border:"1.5px solid hsla(38,100%,55%,0.5)",
                      color:"hsl(38,100%,82%)",transition:"all .15s",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,hsla(200,80%,42%,0.3),hsla(200,80%,42%,0.14))";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,hsla(200,80%,42%,0.18),hsla(200,80%,42%,0.08))";}}>
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
