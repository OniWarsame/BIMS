import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowLeft, Search, Fingerprint, Users, User,
  ChevronRight, X, Eye, Lock, CheckCircle, ClipboardList, LogOut, Paperclip, FileText, ImageIcon, Download,
  HardDrive, Trash2, DatabaseZap, Pencil, Save, RotateCcw, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import {
  getRecords, searchRecords, isDatabaseUnlocked, unlockDatabase,
  lockDatabase, getAccessLogs, clearLogs, exportDatabase,
  getStorageInfo, deleteRecord, updateRecord, type BiometricRecord
} from "@/lib/biometric-store";
import { getCurrentUser } from "@/pages/Login";

/* ── Attachment viewer ── */
const AttachModal = ({title,src,isImg,onClose}:{title:string;src:string;isImg:boolean;onClose:()=>void}) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{background:"hsla(190,80%,3%,0.92)",backdropFilter:"blur(14px)"}}
    onClick={onClose}>
    <motion.div initial={{scale:0.9,y:16}} animate={{scale:1,y:0}} exit={{scale:0.9}}
      className="card-surface rounded-xl overflow-hidden max-w-2xl w-full"
      style={{border:"1.5px solid hsla(185,100%,50%,0.4)",boxShadow:"0 0 60px hsla(185,100%,50%,0.18)"}}
      onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{borderColor:"hsla(185,55%,22%,0.4)",background:"hsla(185,100%,50%,0.06)"}}>
        <div className="flex items-center gap-2">
          {isImg?<ImageIcon className="w-4 h-4 text-primary"/>:<FileText className="w-4 h-4 text-primary"/>}
          <span className="font-mono text-xs font-bold tracking-widest" style={{color:"hsl(185,100%,65%)"}}>{title}</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10 transition-colors">
          <X className="w-4 h-4 text-primary"/>
        </button>
      </div>
      <div className="p-5 flex items-center justify-center min-h-48" style={{background:"rgba(4,18,28,0.94)"}}>
        {isImg
          ? <img src={src} alt={title} className="max-w-full max-h-96 object-contain rounded-lg" style={{border:"1px solid hsla(185,55%,28%,0.3)"}}/>
          : <div className="text-center space-y-3">
              <FileText className="w-16 h-16 mx-auto" style={{color:"hsla(185,100%,50%,0.28)"}}/>
              <p className="font-mono text-sm font-semibold" style={{color:"hsl(185,55%,88%)"}}>{src}</p>
              <p className="font-mono text-xs" style={{color:"hsla(185,80%,60%,0.45)"}}>File attached — not previewable in browser</p>
              <a href={src} download className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase px-4 py-2 rounded mt-2 transition-all" style={{border:"1px solid hsla(185,100%,50%,0.4)",background:"hsla(185,100%,50%,0.1)",color:"hsl(185,100%,65%)"}}>
                <Download className="w-3.5 h-3.5"/> DOWNLOAD
              </a>
            </div>}
      </div>
    </motion.div>
  </motion.div>
);

/* ── Password-Only Lock Screen ── */
const LockScreen = ({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) => {
  type ScanState = "idle"|"scanning"|"preview"|"granting"|"error";
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [matchUser, setMatchUser] = useState<any>(null);
  const [countdown, setCountdown] = useState(2);
  const currentUser = getCurrentUser();
  const scanRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{
    if(scanState!=="preview"){setCountdown(2);return;}
    const iv=setInterval(()=>setCountdown(p=>{if(p<=1){clearInterval(iv);return 0;}return p-1;}),1000);
    return()=>clearInterval(iv);
  },[scanState]);

  useEffect(()=>()=>{if(scanRef.current)clearTimeout(scanRef.current);},[]);

  const startScan = () => {
    if(scanState==="scanning"||scanState==="preview"||scanState==="granting") return;
    setScanState("scanning");
    scanRef.current = setTimeout(()=>{
      const users:any[] = JSON.parse(localStorage.getItem("bims_users")||"[]");
      const user = currentUser
        ? users.find((u:any)=>u.username===currentUser.username&&u.active)
        : users.find((u:any)=>u.active);
      if(!user){setScanState("error");return;}
      setMatchUser(user);
      setScanState("preview");
      // auto-grant after countdown
      scanRef.current = setTimeout(()=>{
        setScanState("granting");
        unlockDatabase(user.password||"auto", user.username);
        setTimeout(()=>onUnlock(),900);
      },2000);
    },2400);
  };

  const resetScan = ()=>{
    if(scanRef.current)clearTimeout(scanRef.current);
    setScanState("idle"); setMatchUser(null);
  };

  const fpColor  = scanState==="error"?"hsl(0,85%,62%)":scanState==="preview"||scanState==="granting"?"hsl(193,100%,58%)":scanState==="scanning"?"hsl(193,100%,65%)":"hsl(195,80%,45%)";
  const glowCol  = scanState==="error"?"rgba(220,60,60,0.6)":scanState==="scanning"||scanState==="preview"||scanState==="granting"?"rgba(50,190,218,0.55)":"rgba(0,160,220,0.3)";

  const sideLeft = [
    {icon:"🔒", label:"VAULT LOCK", val:"AES-256"},
    {icon:"⚡", label:"SESSION", val:"ACTIVE"},
    {icon:"🛡️", label:"CLEARANCE", val:"L3 RESTRICTED"},
    {icon:"🔐", label:"PROTOCOL", val:"TLS 1.3"},
    {icon:"◉", label:"STATUS", val:"STANDBY"},
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <CyberBackground />
      {/* BACK NAV */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center px-4 py-3 cyber-header">
        <button onClick={onBack}
          style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.14em",color:"hsl(193,100%,72%)",background:"none",border:"none",cursor:"pointer",padding:"6px 10px",borderRadius:8,transition:"all .18s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(50,190,218,0.08)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <ArrowLeft className="w-4 h-4"/>DATABASE ACCESS
        </button>
      </div>

      {/* LEFT SIDEBAR */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2.5 pointer-events-none">
        {sideLeft.map((item,i)=>(
          <motion.div key={i}
            initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{delay:i*0.12}}
            style={{background:"rgba(0,5,14,0.85)",border:"1px solid rgba(50,190,218,0.18)",backdropFilter:"blur(12px)",borderRadius:8,padding:"8px 12px",minWidth:150}}>
            <motion.div animate={{opacity:[0.35,0.7,0.35]}} transition={{duration:2.5+i*0.4,repeat:Infinity,delay:i*0.3}}>
              <div className="flex items-center gap-2">
                <span style={{fontSize:12}}>{item.icon}</span>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,letterSpacing:"0.22em",color:"rgba(44,178,212,0.42)"}}>{item.label}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:"hsl(193,100%,65%)"}}>{item.val}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* MAIN CARD */}
      <motion.div initial={{opacity:0,y:28,scale:0.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.35}}
        style={{position:"relative",zIndex:1,width:"100%",maxWidth:380,marginTop:56,padding:"32px 28px",textAlign:"center" as const,
          background:"linear-gradient(160deg,rgba(4,14,26,0.95),rgba(2,10,18,0.98))",
          border:"1px solid rgba(50,190,218,0.28)",borderTop:"2px solid rgba(56,196,223,0.5)",
          borderRadius:20,boxShadow:"0 0 80px rgba(50,190,218,0.12),0 24px 64px rgba(0,0,0,0.9)",
          backdropFilter:"blur(30px)"}}>

        {/* Corner brackets */}
        {["top-2 left-2 border-t border-l","top-2 right-2 border-t border-r","bottom-2 left-2 border-b border-l","bottom-2 right-2 border-b border-r"].map((cls,i)=>(
          <motion.div key={i} className={`absolute w-4 h-4 ${cls}`}
            style={{borderColor:"rgba(50,190,218,0.38)"}}
            animate={{opacity:[0.4,0.9,0.4]}} transition={{duration:2,delay:i*0.4,repeat:Infinity}}/>
        ))}

        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,letterSpacing:"0.18em",
          color:"hsl(193,100%,72%)",textShadow:"0 0 20px rgba(50,190,218,0.8)",marginBottom:4}}>
          DATABASE ACCESS
        </h1>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",
          color:"rgba(44,178,212,0.45)",marginBottom:20,textTransform:"uppercase" as const}}>
          BIOMETRIC VERIFICATION REQUIRED
        </p>

        {/* Scanner disc */}
        <div style={{position:"relative",display:"inline-block",marginBottom:20}}>
          <motion.div animate={{scale:[0.88,1.1,0.88],opacity:[0.3,0.6,0.3]}} transition={{duration:3.2,repeat:Infinity}}
            style={{position:"absolute",inset:-36,borderRadius:"50%",background:`radial-gradient(circle,${glowCol} 0%,transparent 68%)`,pointerEvents:"none"}}/>
          <svg style={{position:"absolute",inset:-20,overflow:"visible",pointerEvents:"none"}} viewBox="0 0 260 260" width="260" height="260">
            <motion.circle cx="130" cy="130" r="124" fill="none"
              stroke={fpColor} strokeWidth="1.8" strokeDasharray="38 480" strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 7px ${glowCol})`}}
              animate={{rotate:[0,360]}} transition={{duration:scanState==="scanning"?1.1:4,repeat:Infinity,ease:"linear"}}/>
            <motion.circle cx="130" cy="130" r="124" fill="none"
              stroke={`${fpColor}35`} strokeWidth="0.8" strokeDasharray="8 26"
              animate={{rotate:[360,0]}} transition={{duration:7,repeat:Infinity,ease:"linear"}}/>
          </svg>
          <div className={scanState==="scanning"?"scanner-pulse":""} style={{width:220,height:220,borderRadius:"50%",
            background:scanState==="error"?"radial-gradient(circle at 38% 38%,hsla(0,70%,8%,0.97),hsla(0,70%,3%,0.99))":"radial-gradient(circle at 38% 38%,rgba(4,18,32,0.97),rgba(0,5,14,0.99))",
            border:`2px solid ${fpColor}55`,
            boxShadow:`0 0 60px ${glowCol}20,inset 0 0 60px rgba(0,0,0,0.5)`,
            display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",gap:10,
            position:"relative",overflow:"hidden",transition:"all 0.4s"}}>
            <div style={{position:"absolute",inset:20,borderRadius:"50%",border:`1px solid ${fpColor}25`,pointerEvents:"none"}}/>
            {scanState==="scanning" && (
              <motion.div animate={{y:["-55%","155%"]}} transition={{duration:0.85,repeat:Infinity,ease:"linear"}}
                style={{position:"absolute",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${fpColor}dd,transparent)`,boxShadow:`0 0 14px ${glowCol}`}}/>
            )}
            {scanState==="granting" ? (
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300}}>
                <CheckCircle style={{width:60,height:60,color:"hsl(193,100%,65%)",filter:`drop-shadow(0 0 18px ${glowCol})`}}/>
              </motion.div>
            ) : (
              <motion.div animate={scanState==="scanning"?{scale:[1,1.09,1],opacity:[0.78,1,0.78]}:{scale:1,opacity:1}}
                transition={{duration:0.85,repeat:scanState==="scanning"?Infinity:0}}>
                <Fingerprint style={{width:72,height:72,color:fpColor,filter:`drop-shadow(0 0 20px ${glowCol})`}}/>
              </motion.div>
            )}
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,letterSpacing:"0.22em",color:`${fpColor}80`,textTransform:"uppercase" as const}}>
              {scanState==="scanning"?"SCANNING…":scanState==="preview"||scanState==="granting"?"VERIFIED":scanState==="error"?"ERROR":"PLACE FINGER"}
            </span>
          </div>
        </div>

        {/* Identity card on preview */}
        <AnimatePresence>
          {(scanState==="preview"||scanState==="granting") && matchUser && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(50,190,218,0.3)",
                background:"rgba(4,14,26,0.95)",marginBottom:16,textAlign:"left" as const}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 14px",background:"rgba(50,190,218,0.06)",borderBottom:"1px solid rgba(50,190,218,0.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1,repeat:Infinity}}
                    style={{width:7,height:7,borderRadius:"50%",background:"hsl(193,100%,58%)",boxShadow:"0 0 8px rgba(50,190,218,0.8)"}}/>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"0.16em",color:"rgba(56,196,223,0.85)"}}>
                    IDENTITY CONFIRMED — ACCESS IN {countdown}s
                  </span>
                </div>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"hsl(193,100%,65%)"}}>{countdown}</span>
              </div>
              <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:10,background:"rgba(44,178,212,0.12)",border:"1px solid rgba(50,190,218,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"hsl(193,100%,65%)",flexShrink:0}}>
                  {matchUser.fullName?.charAt(0).toUpperCase()||"?"}
                </div>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"rgba(200,245,255,0.96)"}}>{matchUser.fullName}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(0,195,240,0.55)",marginTop:2}}>
                    {matchUser.role?.toUpperCase()} · @{matchUser.username}
                  </div>
                </div>
              </div>
              <div style={{height:3,margin:"0 14px 12px",borderRadius:2,background:"rgba(44,178,212,0.12)",overflow:"hidden"}}>
                <motion.div style={{height:"100%",background:"linear-gradient(90deg,hsl(193,100%,48%),hsl(200,100%,60%))",originX:0}}
                  animate={{width:`${((2-countdown)/2)*100}%`}} transition={{duration:1,ease:"linear"}}/>
              </div>
              <div style={{textAlign:"right" as const,paddingRight:14,paddingBottom:10}}>
                <button onClick={resetScan} style={{background:"none",border:"none",cursor:"pointer",
                  fontFamily:"'Orbitron',sans-serif",fontSize:8,letterSpacing:"0.12em",color:"rgba(44,178,212,0.35)",transition:"color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(58,198,224,0.7)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(44,178,212,0.35)"}>
                  NOT ME — CANCEL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan button */}
        {(scanState==="idle"||scanState==="error") && (
          <motion.button onClick={startScan}
            whileHover={{scale:1.015,y:-2}} whileTap={{scale:0.97}}
            style={{width:"100%",height:46,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.1em",
              color:"hsl(205,55%,5%)",cursor:"pointer",border:"0",
              background:"linear-gradient(135deg,hsl(193,100%,45%),hsl(200,100%,58%))",
              boxShadow:"0 6px 28px rgba(50,190,218,0.45),inset 0 1px 0 rgba(255,255,255,0.2)",
              position:"relative" as const,overflow:"hidden"}}>
            <motion.span style={{position:"absolute" as const,inset:0,
              background:"linear-gradient(110deg,transparent 20%,rgba(255,255,255,0.15) 50%,transparent 80%)"}}
              animate={{x:["-100%","100%"]}} transition={{duration:2.4,repeat:Infinity,repeatDelay:0.6}}/>
            <Fingerprint style={{width:18,height:18}}/>
            {scanState==="error"?"RETRY SCAN":"SCAN FINGERPRINT"}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

/* ── PF field ── */
const PF = ({label,value,mono=false,warn=false}:{label:string;value?:string|null;mono?:boolean;warn?:boolean}) => (
  <div>
    <p className="font-mono text-[9px] font-semibold tracking-[0.18em] uppercase mb-1" style={{color:"hsla(185,80%,65%,0.55)"}}>{label}</p>
    <p className={`${mono?"font-mono text-xs":"font-display text-sm font-semibold"} leading-snug`} style={{color:warn?"hsl(33,100%,62%)":value?"hsl(185,55%,90%)":"hsla(185,20%,55%,0.6)"}}>{value||"—"}</p>
  </div>
);
const Section = ({title,children}:{title:string;children:React.ReactNode}) => (
  <div><p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{color:"hsl(185,100%,58%)",borderBottom:"1px solid hsla(185,55%,25%,0.3)",paddingBottom:"6px"}}>● {title}</p>{children}</div>
);
const Badge = ({text,color="blue"}:{text:string;color?:"blue"|"green"|"orange"|"red"}) => {
  const c={blue:["hsla(185,100%,50%,0.1)","hsla(185,100%,50%,0.3)","hsl(185,100%,65%)"],green:["hsla(140,80%,45%,0.1)","hsla(140,80%,45%,0.3)","hsl(140,80%,62%)"],orange:["hsla(33,100%,52%,0.1)","hsla(33,100%,52%,0.35)","hsl(33,100%,65%)"],red:["hsla(0,75%,55%,0.1)","hsla(0,75%,55%,0.3)","hsl(0,80%,68%)"]}[color];
  return <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded" style={{background:c[0],border:`1px solid ${c[1]}`,color:c[2]}}>{text}</span>;
};

/* ── Edit Record Modal ── */
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const EditModal = ({record, onSave, onClose}:{record:BiometricRecord;onSave:(updated:BiometricRecord)=>void;onClose:()=>void}) => {
  const [form, setForm] = useState({...record});
  const hc = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(p=>({...p,[e.target.name]:e.target.value}));

  const F = ({label,children}:{label:string;children:React.ReactNode}) => (
    <div><p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{color:"hsla(185,80%,65%,0.55)"}}>{label}</p>{children}</div>
  );
  const Inp = ({name,value,type="text",placeholder=""}:{name:string;value?:string;type?:string;placeholder?:string}) => (
    <input name={name} value={value||""} onChange={hc} type={type} placeholder={placeholder}
      className="w-full h-9 px-3 rounded font-mono text-sm"
      style={{background:"hsla(185,80%,6%,0.9)",border:"1px solid hsla(185,60%,28%,0.45)",color:"hsl(185,55%,90%)",outline:"none"}}/>
  );
  const Sel = ({name,value,children}:{name:string;value?:string;children:React.ReactNode}) => (
    <select name={name} value={value||""} onChange={hc}
      className="w-full h-9 px-3 rounded font-mono text-sm"
      style={{background:"hsla(185,80%,6%,0.9)",border:"1px solid hsla(185,60%,28%,0.45)",color:"hsl(185,55%,90%)",outline:"none"}}>
      {children}
    </select>
  );
  const TA = ({name,value,rows=2,placeholder=""}:{name:string;value?:string;rows?:number;placeholder?:string}) => (
    <textarea name={name} value={value||""} onChange={hc} rows={rows} placeholder={placeholder}
      className="w-full px-3 py-2 rounded font-mono text-sm resize-none"
      style={{background:"hsla(185,80%,6%,0.9)",border:"1px solid hsla(185,60%,28%,0.45)",color:"hsl(185,55%,90%)",outline:"none"}}/>
  );

  const Divider = ({title}:{title:string}) => (
    <div className="col-span-2 pt-3 pb-1 border-b" style={{borderColor:"hsla(185,55%,22%,0.3)"}}>
      <p className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{color:"hsl(185,100%,58%)"}}>{title}</p>
    </div>
  );

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:"hsla(190,80%,3%,0.94)",backdropFilter:"blur(18px)"}}
      onClick={onClose}>
      <motion.div initial={{scale:0.93,y:20}} animate={{scale:1,y:0}} exit={{scale:0.93,y:20}}
        className="card-surface rounded-2xl overflow-hidden w-full"
        style={{maxWidth:"860px",maxHeight:"92vh",border:"1.5px solid hsla(185,100%,50%,0.38)",boxShadow:"0 0 80px hsla(185,100%,50%,0.12)"}}
        onClick={e=>e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{borderColor:"hsla(185,55%,22%,0.35)",background:"hsla(185,100%,50%,0.05)"}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{background:"hsla(185,100%,50%,0.12)",border:"1px solid hsla(185,100%,50%,0.3)"}}>
              <Pencil className="w-4 h-4 text-primary"/>
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-wide text-foreground">EDIT RECORD</p>
              <p className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,65%,0.5)"}}>{record.id} — {record.surname}, {record.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setForm({...record})} className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-all"
              style={{border:"1px solid hsla(33,80%,45%,0.4)",background:"hsla(33,80%,45%,0.08)",color:"hsl(33,90%,65%)"}}>
              <RotateCcw className="w-3 h-3"/> RESET
            </button>
            <button onClick={()=>onSave(form)} className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all"
              style={{border:"1.5px solid hsla(185,100%,50%,0.55)",background:"hsla(185,100%,50%,0.18)",color:"hsl(185,100%,78%)"}}>
              <Save className="w-3.5 h-3.5"/> SAVE CHANGES
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{color:"hsla(185,80%,60%,0.5)"}}>
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Modal body — scrollable */}
        <div className="overflow-y-auto p-6" style={{maxHeight:"calc(92vh - 72px)"}}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">

            <Divider title="Personal Information"/>
            <F label="Name"><Inp name="name" value={form.name} placeholder="First name"/></F>
            <F label="Surname"><Inp name="surname" value={form.surname} placeholder="Last name"/></F>
            <F label="Gender">
              <Sel name="gender" value={form.gender}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </Sel>
            </F>
            <F label="Date of Birth"><Inp name="dateOfBirth" value={form.dateOfBirth} type="date"/></F>
            <F label="Marital Status">
              <Sel name="maritalStatus" value={form.maritalStatus}>
                <option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </Sel>
            </F>
            <F label="Blood Type">
              <Sel name="bloodType" value={form.bloodType}>
                <option value="">Select</option>{BLOOD_TYPES.map(b=><option key={b}>{b}</option>)}
              </Sel>
            </F>
            <F label="Email"><Inp name="email" value={form.email} type="email" placeholder="email@domain.com"/></F>
            <F label="Phone Number"><Inp name="phoneNo" value={form.phoneNo} placeholder="+1-000-000-0000"/></F>
            <F label="Nationality"><Inp name="nationality" value={form.nationality} placeholder="e.g. Somali"/></F>
            <F label="National ID"><Inp name="nationalId" value={form.nationalId} placeholder="ID number"/></F>
            <F label="Place of Birth"><Inp name="placeOfBirth" value={form.placeOfBirth} placeholder="City, Country"/></F>
            <F label="Occupation"><Inp name="occupation" value={form.occupation} placeholder="Job title"/></F>
            <div className="col-span-2">
              <F label="Address"><TA name="address" value={form.address} placeholder="Full residential address"/></F>
            </div>

            <Divider title="Family"/>
            <F label="Father's Name"><Inp name="fatherName" value={form.fatherName} placeholder="Full name"/></F>
            <F label="Father's Phone"><Inp name="fatherPhone" value={form.fatherPhone} placeholder="+1-000-000-0000"/></F>
            <F label="Mother's Name"><Inp name="motherName" value={form.motherName} placeholder="Full name"/></F>
            <F label="Mother's Phone"><Inp name="motherPhone" value={form.motherPhone} placeholder="+1-000-000-0000"/></F>

            <Divider title="Documents"/>
            <F label="Passport No."><Inp name="passportNo" value={form.passportNo} placeholder="X00000000"/></F>
            <F label="Passport Place of Issue"><Inp name="passportPlaceOfIssue" value={form.passportPlaceOfIssue} placeholder="City / Country"/></F>
            <F label="Passport Issue Date"><Inp name="passportIssueDate" value={form.passportIssueDate} type="date"/></F>
            <F label="Passport Expiry Date"><Inp name="passportExpiryDate" value={form.passportExpiryDate} type="date"/></F>

            <Divider title="Work Experience"/>
            <div className="col-span-2">
              <F label="Work Experience / History"><TA name="workExperience" value={form.workExperience} rows={4} placeholder="Positions held, companies, durations…"/></F>
            </div>

            <Divider title="Health & Records"/>
            <div className="col-span-2">
              <F label="Health Record"><TA name="healthRecord" value={form.healthRecord} rows={3} placeholder="Medical conditions, allergies…"/></F>
            </div>
            <div className="col-span-2">
              <F label="Crime Record"><TA name="crimeRecord" value={form.crimeRecord} rows={2} placeholder="None / details if applicable…"/></F>
            </div>

            <Divider title="Education"/>
            <div className="col-span-2">
              <F label="Education History"><TA name="educationRecord" value={form.educationRecord} rows={3} placeholder="Degrees, institutions, years…"/></F>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════ */
/* ── All Attachments Panel ── */
const AttachPanel = ({preview, onView}:{preview:any; onView:(title:string,src:string,isImg:boolean)=>void}) => {
  const isImg = (s:string) => /\.(jpg|jpeg|png|gif|webp)/i.test(s);
  const attachments = [
    preview.photo && {label:"PROFILE PHOTO", src:preview.photo, isImg:true},
    !preview.noPassport && preview.passportFile && {label:"PASSPORT SCAN", src:preview.passportFile, isImg:isImg(preview.passportFile)},
    !preview.noLicense && preview.drivingLicenseFile && {label:"DRIVING LICENSE", src:preview.drivingLicenseFile, isImg:isImg(preview.drivingLicenseFile)},
    preview.crimeRecordFile && {label:"CRIME RECORD DOC", src:preview.crimeRecordFile, isImg:isImg(preview.crimeRecordFile)},
    preview.insuranceFile && {label:"INSURANCE DOC", src:preview.insuranceFile, isImg:isImg(preview.insuranceFile)},
  ].filter(Boolean) as {label:string;src:string;isImg:boolean}[];

  return (
    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
      className="overflow-hidden border-b" style={{borderColor:"hsla(185,55%,22%,0.35)",background:"hsla(185,80%,4%,0.6)"}}>
      <div className="px-6 py-4">
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{color:"hsl(33,100%,62%)"}}>
          ALL ATTACHMENTS — {attachments.length} FILE{attachments.length!==1?"S":""} FOUND
        </p>
        {attachments.length===0
          ? <p className="font-mono text-xs" style={{color:"hsla(185,80%,60%,0.35)"}}>No attachments found for this record.</p>
          : <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {attachments.map((a,i)=>(
                <button key={i} onClick={()=>onView(a.label,a.src,a.isImg)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all"
                  style={{border:"1px solid hsla(33,100%,52%,0.28)",background:"hsla(33,50%,6%,0.7)"}}>
                  <div className="w-full h-16 rounded flex items-center justify-center overflow-hidden"
                    style={{background:"hsla(185,80%,5%,0.8)",border:"1px solid hsla(185,50%,20%,0.3)"}}>
                    {a.isImg
                      ? <img src={a.src} alt={a.label} className="w-full h-full object-cover rounded"/>
                      : <FileText className="w-7 h-7" style={{color:"hsla(33,100%,52%,0.4)"}}/>}
                  </div>
                  <span className="font-mono text-[9px] font-bold tracking-wider text-center leading-tight" style={{color:"hsl(33,100%,65%)"}}>{a.label}</span>
                  <span className="font-mono text-[8px] tracking-wider" style={{color:"hsla(185,80%,60%,0.4)"}}>CLICK TO VIEW</span>
                </button>
              ))}
            </div>}
      </div>
    </motion.div>
  );
};

const DatabasePage = () => {
  const currentUserRole = getCurrentUser()?.role;
  const canExport = currentUserRole === "admin" || currentUserRole === "analyst";
  const navigate   = useNavigate();
  // Always require PIN on every visit — lock immediately on mount
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => { lockDatabase(); setUnlocked(false); }, []);
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<BiometricRecord[]>([]);
  const [preview,  setPreview]  = useState<BiometricRecord|null>(null);
  const [modal,    setModal]    = useState<{title:string;src:string;isImg:boolean}|null>(null);
  const [editRecord, setEditRecord] = useState<BiometricRecord|null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showAllAttach, setShowAllAttach] = useState(false);
  const [showPreviewDeepSearch, setShowPreviewDeepSearch] = useState(false);
  const [logs,     setLogs]     = useState(getAccessLogs());
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [photoSearchMode, setPhotoSearchMode] = useState(false);
  const [photoSearchImg, setPhotoSearchImg] = useState<string|null>(null);
  const [photoSearching, setPhotoSearching] = useState(false);
  const [photoMatch, setPhotoMatch] = useState<BiometricRecord|null|"none">(null);
  const photoSearchRef = useRef<HTMLInputElement>(null);

  /* PIN gate for edit / delete */
  type PinGate = { mode:"edit"|"delete"; record:BiometricRecord; pin:string; error:string };
  const [pinGate, setPinGate] = useState<PinGate|null>(null);

  const openPinGate = (mode:"edit"|"delete", record:BiometricRecord) =>
    setPinGate({mode, record, pin:"", error:""});

  const confirmPinGate = () => {
    if(!pinGate) return;
    if(!unlockDatabase(pinGate.pin)) {
      setPinGate(p=>p?{...p, pin:"", error:"INCORRECT PIN — ACCESS DENIED"}:null);
      return;
    }
    if(pinGate.mode==="edit") {
      setEditRecord(pinGate.record);
    } else {
      deleteRecord(pinGate.record.id);
      if(preview?.id===pinGate.record.id) setPreview(null);
      refreshAll();
    }
    setPinGate(null);
  };

  const refreshAll = () => {
    const recs = getRecords();
    setResults(recs);
    setLogs(getAccessLogs());
    setStorageInfo(getStorageInfo());
  };

  useEffect(()=>{ if(unlocked){ refreshAll(); } },[unlocked]);

  const handleSearch = (v:string) => {
    setQuery(v);
    setResults(v.trim()?searchRecords(v):getRecords());
  };

  const handlePhotoSearch = async (imgData: string) => {
    setPhotoSearching(true);
    setPhotoMatch(null);

    const records = getRecords().filter(r => r.photo);
    if (records.length === 0) { setPhotoSearching(false); setPhotoMatch("none"); return; }

    /* detect media type from data URI */
    const getMediaType = (dataUrl: string): "image/jpeg"|"image/png"|"image/gif"|"image/webp" => {
      if (dataUrl.startsWith("data:image/png"))  return "image/png";
      if (dataUrl.startsWith("data:image/gif"))  return "image/gif";
      if (dataUrl.startsWith("data:image/webp")) return "image/webp";
      return "image/jpeg";
    };

    const strip = (d: string) => d.replace(/^data:image\/\w+;base64,/, "");
    const queryMime = getMediaType(imgData);

    try {
      /* Send query image + all db photos in one call with per-record labels */
      const content: any[] = [
        {
          type: "text",
          text: `You are an expert biometric facial recognition system. Your task is to find which database record (if any) shows the SAME PERSON as the query photo.

QUERY PHOTO: the first image below is the face to search for.
DATABASE RECORDS: the subsequent images are labelled with their index (0-based).

Compare facial features carefully: face shape, eyes, eyebrows, nose, lips, chin, ears, skin tone, and overall structure. Ignore lighting, angle, and photo quality differences.

Respond ONLY with valid JSON — no markdown:
{"match_index": <0-based index of best matching record, or -1 if no match>, "confidence": <0-100>, "reason": "<one sentence explanation>"}`
        },
        { type: "image", source: { type: "base64", media_type: queryMime, data: strip(imgData) } },
        ...records.flatMap((r, i) => [
          { type: "text" as const, text: `Database record index ${i} — ${r.name} ${r.surname} (ID: ${r.id}):` },
          { type: "image" as const, source: { type: "base64" as const, media_type: getMediaType(r.photo as string), data: strip(r.photo as string) } }
        ]),
      ];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      if (parsed.match_index >= 0 && parsed.confidence >= 40 && records[parsed.match_index]) {
        setPhotoMatch(records[parsed.match_index]);
      } else {
        setPhotoMatch("none");
      }
    } catch (e) {
      console.error("Face search error:", e);
      setPhotoMatch("none");
    }
    setPhotoSearching(false);
  };

  const handleLock = () => { lockDatabase(); setUnlocked(false); setResults([]); setPreview(null); };

  const handleDelete = (record: BiometricRecord) => {
    openPinGate("delete", record);
  };

  const handleExport = () => {
    const json = exportDatabase();
    const blob = new Blob([json], {type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `BIMS_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    clearLogs(); setLogs(getAccessLogs()); setStorageInfo(getStorageInfo());
  };

  const handleSaveEdit = (updated: BiometricRecord) => {
    updateRecord(updated.id, updated);
    setEditRecord(null);
    if(preview?.id === updated.id) setPreview(updated);
    refreshAll();
  };

  const openAttach = (title:string,src:string) => {
    const isImg=/^data:image|\.png|\.jpg|\.jpeg|\.gif|\.webp/i.test(src);
    setModal({title,src,isImg});
  };

  if(!unlocked) return <LockScreen onUnlock={()=>setUnlocked(true)} onBack={()=>navigate("/")}/>;

  return (
    <div className="min-h-screen relative flex flex-col">
      <CyberBackground/>
      <AnimatePresence>{modal&&<AttachModal {...modal} onClose={()=>setModal(null)}/>}</AnimatePresence>
      <AnimatePresence>{editRecord&&<EditModal record={editRecord} onSave={handleSaveEdit} onClose={()=>setEditRecord(null)}/>}</AnimatePresence>

      {/* ── PIN Gate Modal ── */}
      <AnimatePresence>
        {pinGate&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{background:"hsla(210,80%,4%,0.88)",backdropFilter:"blur(16px)"}}>
            <motion.div initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
              className="card-surface rounded-2xl p-8 w-full max-w-sm text-center"
              style={{border:`1.5px solid ${pinGate.mode==="delete"?"hsla(0,90%,55%,0.45)":"hsla(33,100%,52%,0.45)"}`,boxShadow:`0 0 60px ${pinGate.mode==="delete"?"hsla(0,90%,55%,0.12)":"hsla(33,100%,52%,0.12)"}`}}>
              {/* Icon */}
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{background:pinGate.mode==="delete"?"hsla(0,90%,55%,0.12)":"hsla(33,100%,52%,0.12)",border:`2px solid ${pinGate.mode==="delete"?"hsla(0,90%,55%,0.4)":"hsla(33,100%,52%,0.4)"}`}}>
                {pinGate.mode==="delete"
                  ? <Trash2 className="w-6 h-6" style={{color:"hsl(0,90%,65%)"}}/>
                  : <Pencil className="w-6 h-6" style={{color:"hsl(33,100%,65%)"}}/> }
              </div>
              {/* Title */}
              <h3 className="font-display text-lg font-bold mb-1"
                style={{color:pinGate.mode==="delete"?"hsl(0,90%,72%)":"hsl(33,100%,72%)"}}>
                {pinGate.mode==="delete"?"CONFIRM DELETION":"CONFIRM EDIT"}
              </h3>
              <p className="font-mono text-xs mb-1 tracking-wider" style={{color:"hsla(185,70%,65%,0.6)"}}>
                {pinGate.mode==="delete"
                  ? `DELETE: ${pinGate.record.surname}, ${pinGate.record.name}`
                  : `EDIT: ${pinGate.record.surname}, ${pinGate.record.name}`}
              </p>
              {pinGate.mode==="delete"&&(
                <p className="font-mono text-[11px] mb-4 tracking-wider" style={{color:"hsla(0,90%,65%,0.55)"}}>
                  This action cannot be undone.
                </p>
              )}
              <p className="font-mono text-xs mb-4 tracking-widest" style={{color:"hsla(185,80%,65%,0.5)"}}>
                ENTER PIN TO CONTINUE
              </p>
              {/* PIN input */}
              <div className="mb-2">
                <input type="password" value={pinGate.pin} autoFocus maxLength={8}
                  onChange={e=>setPinGate(p=>p?{...p,pin:e.target.value,error:""}:null)}
                  onKeyDown={e=>{if(e.key==="Enter")confirmPinGate();if(e.key==="Escape")setPinGate(null);}}
                  placeholder="• • • • • •"
                  className="input-cyber text-center font-bold w-full"
                  style={{fontSize:"1.3rem",letterSpacing:"0.45em",borderColor:pinGate.error?"hsl(0,90%,58%)":"hsla(185,80%,50%,0.38)"}}/>
              </div>
              <div className="h-6 flex items-center justify-center mb-4">
                {pinGate.error&&<p className="font-mono text-xs tracking-wider" style={{color:"hsl(0,90%,65%)"}}>{pinGate.error}</p>}
              </div>
              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={()=>setPinGate(null)}
                  className="flex-1 h-10 rounded-lg font-mono font-bold tracking-widest text-xs transition-all"
                  style={{border:"1.5px solid hsla(185,60%,35%,0.38)",color:"hsla(185,70%,65%,0.6)"}}>
                  CANCEL
                </button>
                <button onClick={confirmPinGate}
                  className="flex-1 h-10 rounded-lg font-mono font-bold tracking-widest text-xs transition-all"
                  style={{
                    background:pinGate.mode==="delete"?"hsla(0,90%,50%,0.2)":"hsla(33,100%,50%,0.2)",
                    border:`1.5px solid ${pinGate.mode==="delete"?"hsla(0,90%,55%,0.55)":"hsla(33,100%,52%,0.55)"}`,
                    color:pinGate.mode==="delete"?"hsl(0,90%,72%)":"hsl(33,100%,72%)",
                  }}>
                  {pinGate.mode==="delete"?"DELETE":"EDIT"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-3 sticky top-0 z-20" style={{background:"transparent",borderBottom:"1px solid hsla(38,60%,35%,0.2)"}}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={()=>navigate("/")}><ArrowLeft className="w-4 h-4"/></Button>
          <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center" style={{background:"hsla(185,100%,50%,0.08)"}}>
            <Shield className="w-4 h-4 text-primary"/>
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider text-foreground block leading-tight">IDENTITY DATABASE</span>
            <span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,65%,0.55)"}}>CIVIL RECORDS ARCHIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Storage info */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded"
            style={{background:"hsla(185,80%,5%,0.6)",border:"1px solid hsla(185,55%,22%,0.35)"}}>
            <HardDrive className="w-3 h-3" style={{color:"hsl(185,100%,55%)"}}/>
            <span style={{color:"hsl(185,100%,62%)"}}>{storageInfo.records} records</span>
            <span style={{color:"hsla(185,60%,55%,0.4)"}}>·</span>
            <span style={{color:"hsla(185,80%,60%,0.6)"}}>{storageInfo.sizeKB} KB</span>
          </div>
          {canExport && (
              <button onClick={handleExport}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
            style={{border:"1px solid hsla(140,80%,45%,0.35)",background:"hsla(140,80%,45%,0.07)",color:"hsl(140,80%,62%)"}}>
            <Download className="w-3.5 h-3.5"/> EXPORT
          </button>
            )}
          <button onClick={()=>{setShowLogs(!showLogs);setLogs(getAccessLogs());}}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
            style={{border:"1px solid hsla(185,80%,45%,0.35)",background:"hsla(185,100%,50%,0.07)",color:"hsl(185,100%,65%)"}}>
            <ClipboardList className="w-3.5 h-3.5"/> ACCESS LOGS
          </button>
          <button onClick={handleLock}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
            style={{border:"1px solid hsla(0,80%,55%,0.35)",background:"hsla(0,80%,55%,0.08)",color:"hsl(0,80%,68%)"}}>
            <LogOut className="w-3.5 h-3.5"/> LOCK
          </button>
          <Users className="w-4 h-4" style={{color:"hsla(185,100%,60%,0.6)"}}/>
          <span className="font-mono text-sm font-semibold" style={{color:"hsl(185,100%,65%)"}}>{results.length} RECORD{results.length!==1?"S":""}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-[1] w-full flex-1">

        {/* Access Logs Panel */}
        <AnimatePresence>
          {showLogs&&(
            <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.22}}
              className="card-surface rounded-lg p-5 mb-5" style={{borderTop:"2px solid hsl(185,100%,50%)"}}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm font-bold tracking-widest" style={{color:"hsl(185,100%,65%)"}}>🔐 ACCESS LOG HISTORY</h2>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px]" style={{color:"hsla(185,80%,60%,0.5)"}}>{logs.length} ENTRIES</span>
                  <button onClick={handleClearLogs} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded transition-all"
                    style={{border:"1px solid hsla(0,80%,55%,0.3)",background:"hsla(0,80%,55%,0.07)",color:"hsl(0,80%,65%)"}}>
                    <Trash2 className="w-3 h-3"/> CLEAR
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.length===0
                  ? <p className="font-mono text-xs text-center py-4" style={{color:"hsla(185,80%,60%,0.4)"}}>NO LOG ENTRIES YET</p>
                  : [...logs].reverse().map((log,i)=>(
                    <div key={i} className="flex items-center gap-4 font-mono text-xs py-2 px-3 rounded" style={{background:"hsla(185,80%,5%,0.6)",border:"1px solid hsla(185,55%,18%,0.4)"}}>
                      <span style={{color:"hsla(185,80%,60%,0.5)"}}>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="font-bold" style={{color:log.action.includes("FAILED")?"hsl(0,80%,65%)":"hsl(185,100%,62%)"}}>{log.action}</span>
                      <span style={{color:"hsla(185,60%,60%,0.6)"}}>OP: {log.operator}</span>
                      {log.recordsAccessed>0&&<span style={{color:"hsla(185,80%,55%,0.5)"}}>{log.recordsAccessed} records</span>}
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="mb-5 space-y-3">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button onClick={()=>{setPhotoSearchMode(false);setPhotoSearchImg(null);setPhotoMatch(null);}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[11px] font-bold tracking-wider uppercase transition-all"
              style={{background:!photoSearchMode?"hsla(185,100%,50%,0.14)":"transparent",border:!photoSearchMode?"1.5px solid hsla(185,100%,50%,0.5)":"1px solid hsla(185,55%,25%,0.35)",color:!photoSearchMode?"hsl(185,100%,68%)":"hsla(185,60%,55%,0.5)"}}>
              <Search className="w-3.5 h-3.5"/> TEXT SEARCH
            </button>
            <button onClick={()=>{setPhotoSearchMode(true);setQuery("");setResults(getRecords());}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[11px] font-bold tracking-wider uppercase transition-all"
              style={{background:photoSearchMode?"hsla(270,80%,55%,0.16)":"transparent",border:photoSearchMode?"1.5px solid hsla(270,80%,62%,0.55)":"1px solid hsla(185,55%,25%,0.35)",color:photoSearchMode?"hsl(270,80%,78%)":"hsla(185,60%,55%,0.5)"}}>
              <Camera className="w-3.5 h-3.5"/> FACE RECOGNITION
            </button>
          </div>

          {/* Text search */}
          {!photoSearchMode && (
            <div className="card-surface rounded-lg px-5 py-3 flex items-center gap-4">
              <Search className="w-5 h-5 flex-shrink-0" style={{color:"hsla(185,100%,60%,0.55)"}}/>
              <input value={query} onChange={e=>handleSearch(e.target.value)}
                placeholder="e.g. John Smith — search by name, ID, nationality…"
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                style={{letterSpacing:"0.02em"}}/>
              {query&&<button onClick={()=>handleSearch("")} className="text-muted-foreground/50 hover:text-foreground transition-colors"><X className="w-4 h-4"/></button>}
            </div>
          )}

          {/* Face recognition search */}
          {photoSearchMode && (
            <div className="card-surface rounded-xl overflow-hidden" style={{border:"1.5px solid hsla(270,70%,50%,0.35)"}}>
              <input ref={photoSearchRef} type="file" accept="image/*" className="hidden" onChange={e=>{
                const file=e.target.files?.[0]; if(!file) return;
                const reader=new FileReader();
                reader.onloadend=()=>{
                  const imgData=reader.result as string;
                  setPhotoSearchImg(imgData);
                  setPhotoMatch(null);
                  handlePhotoSearch(imgData);
                };
                reader.readAsDataURL(file);
                e.target.value="";
              }}/>

              {!photoSearchImg ? (
                // Upload prompt
                <div onClick={()=>photoSearchRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 py-7 px-6 cursor-pointer group transition-all"
                  style={{background:"hsla(270,50%,6%,0.8)"}}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                    style={{background:"hsla(270,80%,45%,0.14)",border:"1.5px solid hsla(270,80%,58%,0.4)",boxShadow:"0 0 24px hsla(270,80%,55%,0.15)"}}>
                    <Camera className="w-7 h-7" style={{color:"hsl(270,80%,75%)"}}/>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold tracking-wider mb-0.5" style={{color:"hsl(270,80%,80%)",fontSize:"0.9rem"}}>FACE RECOGNITION SEARCH</p>
                    <p className="font-mono text-[10px] tracking-wider" style={{color:"hsla(270,60%,60%,0.5)"}}>Upload a photo · AI matches face against all database records</p>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[9px] tracking-wider" style={{color:"hsla(270,50%,55%,0.4)"}}>
                    {["FACIAL ANALYSIS" ,"BIOMETRIC MATCH" ,"VERIFIED"].map((l,i)=>(
                      <span key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:"hsla(270,80%,60%,0.4)"}}/>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                // Image uploaded — show preview + result
                <div className="flex gap-0" style={{background:"hsla(270,50%,5%,0.9)"}}>
                  {/* Left: uploaded photo + controls */}
                  <div className="flex-shrink-0 p-4 flex flex-col items-center gap-3" style={{borderRight:"1px solid hsla(270,50%,20%,0.35)"}}>
                    <div className="relative">
                      <img src={photoSearchImg} alt="Query" className="w-28 h-28 object-cover rounded-xl"
                        style={{border:"2px solid hsla(270,80%,55%,0.45)",boxShadow:"0 0 20px hsla(270,80%,50%,0.2)"}}/>
                      {/* Corner scan brackets */}
                      {["top-0 left-0 border-t-2 border-l-2","top-0 right-0 border-t-2 border-r-2",
                        "bottom-0 left-0 border-b-2 border-l-2","bottom-0 right-0 border-b-2 border-r-2"].map((cls,i)=>(
                        <div key={i} className={`absolute ${cls} w-4 h-4 rounded-sm`}
                          style={{borderColor:"hsl(270,80%,75%)",filter:"drop-shadow(0 0 4px hsla(270,80%,60%,0.8))"}}/>
                      ))}
                      {photoSearching && (
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                          style={{background:"hsla(270,60%,5%,0.65)",backdropFilter:"blur(2px)"}}>
                          <div className="w-8 h-8 border-2 rounded-full animate-spin"
                            style={{borderColor:"hsla(270,80%,60%,0.3)",borderTopColor:"hsl(270,80%,72%)"}}/>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[9px] tracking-wider mb-1" style={{color:"hsla(270,70%,60%,0.5)"}}>QUERY IMAGE</p>
                      <button onClick={()=>{setPhotoSearchImg(null);setPhotoMatch(null);}} className="font-mono text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-lg transition-all"
                        style={{border:"1px solid hsla(0,70%,50%,0.4)",background:"hsla(0,70%,45%,0.1)",color:"hsl(0,80%,68%)"}}>
                        CLEAR
                      </button>
                    </div>
                  </div>

                  {/* Right: status + match result */}
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    {photoSearching && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border-2 rounded-full animate-spin flex-shrink-0"
                            style={{borderColor:"hsla(270,80%,60%,0.2)",borderTopColor:"hsl(270,80%,72%)"}}/>
                          <div>
                            <p className="font-display font-bold tracking-wider text-sm" style={{color:"hsl(270,80%,80%)"}}>FACIAL ANALYSIS IN PROGRESS</p>
                            <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{color:"hsla(270,60%,60%,0.5)"}}>AI scanning {getRecords().filter(r=>r.photo).length} database photo(s)…</p>
                          </div>
                        </div>
                        {["Extracting facial features","Comparing biometric points","Cross-referencing database","Running identity match"].map((step,i)=>(
                          <motion.div key={step} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.4}}
                            className="flex items-center gap-2">
                            <motion.div animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.2,repeat:Infinity,delay:i*0.3}}
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:"hsl(270,80%,65%)"}}/>
                            <span className="font-mono text-[10px] tracking-wider" style={{color:"hsla(270,60%,65%,0.6)"}}>{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {!photoSearching && photoMatch && photoMatch!=="none" && (
                      <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold" style={{color:"hsl(140,100%,68%)",textShadow:"0 0 12px hsla(140,100%,55%,0.6)"}}>✓ FACE MATCH FOUND</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:"hsla(140,80%,5%,0.8)",border:"1px solid hsla(140,80%,45%,0.4)"}}>
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border" style={{borderColor:"hsla(140,80%,45%,0.4)"}}>
                            {photoMatch.photo
                              ?<img src={photoMatch.photo} alt="" className="w-full h-full object-cover"/>
                              :<User className="w-6 h-6 m-auto mt-2" style={{color:"hsla(140,60%,50%,0.4)"}}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold tracking-wider truncate" style={{color:"hsl(140,90%,75%)"}}>{photoMatch.surname}, {photoMatch.name}</p>
                            <p className="font-mono text-[10px] tracking-wider" style={{color:"hsla(140,70%,60%,0.55)"}}>{photoMatch.id} · {photoMatch.nationality||"—"}</p>
                          </div>
                          <button onClick={()=>{setPreview(photoMatch as BiometricRecord);setPhotoSearchMode(false);}}
                            className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg flex-shrink-0 transition-all"
                            style={{border:"1.5px solid hsla(140,80%,45%,0.55)",background:"hsla(140,80%,45%,0.14)",color:"hsl(140,90%,72%)"}}>
                            VIEW
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {!photoSearching && photoMatch==="none" && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-2">
                        <p className="font-mono text-sm font-bold tracking-wider" style={{color:"hsl(0,90%,68%)",textShadow:"0 0 12px hsla(0,90%,55%,0.5)"}}>✗ NO FACE MATCH</p>
                        <p className="font-mono text-[10px] tracking-wider" style={{color:"hsla(0,70%,60%,0.55)"}}>Face not found in database. Try a clearer photo or different angle.</p>
                        <button onClick={()=>photoSearchRef.current?.click()}
                          className="font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all mt-2"
                          style={{border:"1px solid hsla(270,80%,58%,0.4)",background:"hsla(270,70%,45%,0.12)",color:"hsl(270,80%,75%)"}}>
                          TRY ANOTHER PHOTO
                        </button>
                      </motion.div>
                    )}

                    {!photoSearching && !photoMatch && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{background:"hsla(270,80%,60%,0.6)"}}/>
                        <p className="font-mono text-[11px] tracking-wider" style={{color:"hsla(270,60%,60%,0.5)"}}>Preparing facial analysis…</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card-surface rounded-lg overflow-hidden">
          <div className="grid border-b" style={{borderColor:"hsla(185,55%,22%,0.4)",gridTemplateColumns:"110px 1fr 100px 120px 110px 110px 130px"}}>
            {["ID","FULL NAME","GENDER","NATIONALITY","DOB","REGISTERED","ACTION"].map(h=>(
              <div key={h} className="px-4 py-3.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase" style={{color:"hsl(185,100%,62%)"}}>{h}</div>
            ))}
          </div>
          <AnimatePresence>
            {results.length===0
              ? <div className="py-20 text-center"><Fingerprint className="w-10 h-10 mx-auto mb-3" style={{color:"hsla(185,100%,50%,0.2)"}}/><p className="font-mono text-sm tracking-widest" style={{color:"hsla(185,80%,60%,0.4)"}}>NO_RECORDS_FOUND</p></div>
              : results.map((rec,idx)=>(
                <motion.div key={rec.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.03}}
                  className="grid border-b cursor-pointer transition-all duration-150"
                  style={{gridTemplateColumns:"110px 1fr 100px 120px 110px 110px 130px",borderColor:"hsla(185,50%,18%,0.25)",background:preview?.id===rec.id?"hsla(185,100%,50%,0.05)":"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background="hsla(185,100%,50%,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background=preview?.id===rec.id?"hsla(185,100%,50%,0.05)":"transparent"}
                  onClick={()=>{setPreview(preview?.id===rec.id?null:rec);setShowAllAttach(false);setShowPreviewDeepSearch(false);}}>
                  <div className="px-4 py-4 flex items-center"><span className="font-mono text-xs font-bold" style={{color:"hsl(185,100%,60%)"}}>{rec.id}</span></div>
                  <div className="px-4 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex-shrink-0 overflow-hidden border" style={{borderColor:"hsla(185,55%,30%,0.35)",background:"hsla(185,80%,8%,0.8)"}}>
                      {rec.photo?<img src={rec.photo} alt="" className="w-full h-full object-cover"/>:<User className="w-4 h-4 m-auto mt-1.5" style={{color:"hsla(185,60%,50%,0.3)"}}/>}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground tracking-wide leading-tight">{rec.surname}, {rec.name}</p>
                      <p className="font-mono text-[10px] mt-0.5" style={{color:"hsla(185,80%,60%,0.5)"}}>{rec.occupation||"—"}</p>
                    </div>
                  </div>
                  <div className="px-4 py-4 flex items-center"><span className="font-mono text-xs" style={{color:"hsl(185,40%,78%)"}}>{rec.gender||"—"}</span></div>
                  <div className="px-4 py-4 flex items-center"><span className="font-mono text-xs" style={{color:"hsl(185,40%,78%)"}}>{rec.nationality||"—"}</span></div>
                  <div className="px-4 py-4 flex items-center"><span className="font-mono text-xs" style={{color:"hsl(185,40%,72%)"}}>{rec.dateOfBirth||"—"}</span></div>
                  <div className="px-4 py-4 flex items-center"><span className="font-mono text-xs" style={{color:"hsla(185,70%,60%,0.6)"}}>{rec.registeredAt.split("T")[0]}</span></div>
                  <div className="px-4 py-4 flex items-center gap-2">
                    <button onClick={e=>{e.stopPropagation();navigate(`/result/${rec.id}`);}} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
                      style={{border:"1px solid hsla(185,100%,50%,0.35)",background:"hsla(185,100%,50%,0.07)",color:"hsl(185,100%,65%)"}}>
                      VIEW <ChevronRight className="w-3 h-3"/>
                    </button>
                    {getCurrentUser()?.role === "admin" && (
                      <button onClick={e=>{e.stopPropagation();handleDelete(rec);}} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-1.5 rounded transition-all"
                        style={{border:"1px solid hsla(0,80%,55%,0.3)",background:"hsla(0,80%,55%,0.06)",color:"hsl(0,80%,65%)"}}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            }
          </AnimatePresence>
        </div>

        {/* Preview panel */}
        <AnimatePresence>
          {preview&&(
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.25}}
              className="mt-5 card-surface rounded-xl overflow-hidden" style={{borderTop:"2px solid hsl(185,100%,50%)"}}>
              {/* Preview header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:"hsla(185,55%,22%,0.35)",background:"hsla(185,100%,50%,0.04)"}}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border" style={{borderColor:"hsla(185,55%,32%,0.4)",background:"hsla(185,80%,8%,0.9)"}}>
                      {preview.photo?<img src={preview.photo} alt="" className="w-full h-full object-cover"/>:<User className="w-7 h-7 m-auto mt-4" style={{color:"hsla(185,60%,50%,0.3)"}}/>}
                    </div>
                    {preview.photo&&<button onClick={()=>openAttach("PROFILE PHOTO",preview.photo!)}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      style={{background:"hsla(185,100%,50%,0.2)",border:"1px solid hsla(185,100%,50%,0.5)",color:"hsl(185,100%,65%)"}}>
                      <Eye className="w-3 h-3"/>
                    </button>}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-widest mb-0.5" style={{color:"hsl(185,100%,60%)"}}>{preview.id}</p>
                    <h2 className="font-display text-2xl font-bold text-foreground tracking-wide glow-text">{preview.surname}, {preview.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {preview.gender&&<Badge text={preview.gender} color="blue"/>}
                      {preview.bloodType&&<Badge text={`Blood: ${preview.bloodType}`} color="red"/>}
                      {preview.nationality&&<Badge text={preview.nationality} color="blue"/>}
                      {preview.isStudent&&<Badge text="STUDENT" color="green"/>}
                      {preview.isAlumni&&<Badge text={`ALUMNI · ${(preview.alumniRecord?.level||"").toUpperCase()}`} color="green"/>}
                      {preview.noPassport&&<Badge text="NO PASSPORT" color="orange"/>}
                      {preview.noLicense&&<Badge text="NO LICENSE" color="orange"/>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Single "VIEW ALL ATTACHMENTS" button */}
                  <button onClick={()=>setShowAllAttach(v=>!v)}
                    className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
                    style={{border:`1px solid ${showAllAttach?"hsla(33,100%,52%,0.7)":"hsla(33,100%,52%,0.35)"}`,background:showAllAttach?"hsla(33,100%,52%,0.18)":"hsla(33,100%,52%,0.07)",color:"hsl(33,100%,68%)"}}>
                    <Paperclip className="w-3 h-3"/> ATTACHMENTS
                  </button>
                  {/* Deep Search button — opens selector */}
                  <button
                    onClick={()=>setShowPreviewDeepSearch(v=>!v)}
                    className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
                    style={{border:`1px solid ${showPreviewDeepSearch?"hsla(270,80%,65%,0.7)":"hsla(270,80%,65%,0.45)"}`,background:showPreviewDeepSearch?"hsla(270,80%,55%,0.22)":"hsla(270,80%,55%,0.1)",color:"hsl(270,80%,75%)"}}>
                    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    DEEP SEARCH
                  </button>
                  <Button onClick={()=>navigate(`/result/${preview.id}`)} className="font-mono text-xs font-bold tracking-wider" style={{background:"hsla(185,100%,50%,0.15)",border:"1px solid hsla(185,100%,50%,0.4)",color:"hsl(185,100%,65%)"}}>
                    FULL PROFILE <ChevronRight className="w-3.5 h-3.5 ml-1"/>
                  </Button>
                  <button onClick={()=>{setPreview(null);setShowAllAttach(false);}} className="w-8 h-8 flex items-center justify-center rounded transition-colors" style={{color:"hsla(185,80%,60%,0.5)"}}>
                    <X className="w-4 h-4"/>
                  </button>
                  {getCurrentUser()?.role === "admin" && (
                    <button onClick={()=>openPinGate("edit", preview)}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all"
                      style={{border:"1.5px solid hsla(33,100%,52%,0.55)",background:"hsla(33,100%,52%,0.14)",color:"hsl(33,100%,70%)"}}>
                      <Pencil className="w-3.5 h-3.5"/> EDIT
                    </button>
                  )}
                </div>
              </div>

              {/* ── ALL ATTACHMENTS PANEL ── */}
              <AnimatePresence>
                {showAllAttach&&<AttachPanel preview={preview} onView={(t,s,i)=>setModal({title:t,src:s,isImg:i})}/>}
              </AnimatePresence>

              {/* ── DEEP SEARCH SELECTOR PANEL ── */}
              <AnimatePresence>
                {showPreviewDeepSearch&&(()=>{
                  const enc = encodeURIComponent;
                  const fullName = `${preview.name} ${preview.surname}`.trim();
                  const username = preview.name.toLowerCase();
                  const options = [
                    { key:"name",    label:"FULL NAME",  value:fullName,        icon:"👤", color:"38,85%,62%",
                      platforms:[
                        {n:"Google",       url:`https://www.google.com/search?q="${enc(fullName)}"`},
                        {n:"Facebook",     url:`https://www.facebook.com/search/people/?q=${enc(fullName)}`},
                        {n:"LinkedIn",     url:`https://www.linkedin.com/search/results/people/?keywords=${enc(fullName)}`},
                        {n:"X/Twitter",    url:`https://x.com/search?q=${enc(fullName)}&f=user`},
                        {n:"Instagram",    url:`https://www.google.com/search?q=site:instagram.com+"${enc(fullName)}"`},
                        {n:"TikTok",       url:`https://www.tiktok.com/search/user?q=${enc(fullName)}`},
                        {n:"Pipl",         url:`https://pipl.com/search/?q=${enc(fullName)}`},
                        {n:"Spokeo",       url:`https://www.spokeo.com/search?q=${enc(fullName)}`},
                      ]},
                    { key:"username", label:"USERNAME",  value:username,        icon:"@",  color:"270,80%,72%",
                      platforms:[
                        {n:"Instagram",    url:`https://www.instagram.com/${enc(username)}/`},
                        {n:"X/Twitter",    url:`https://x.com/${enc(username)}`},
                        {n:"TikTok",       url:`https://www.tiktok.com/@${enc(username)}`},
                        {n:"GitHub",       url:`https://github.com/${enc(username)}`},
                        {n:"Snapchat",     url:`https://www.snapchat.com/add/${enc(username)}`},
                        {n:"Reddit",       url:`https://www.reddit.com/user/${enc(username)}`},
                        {n:"Telegram",     url:`https://t.me/${enc(username)}`},
                        {n:"Threads",      url:`https://www.threads.net/@${enc(username)}`},
                      ]},
                    { key:"email",   label:"EMAIL",      value:preview.email||"", icon:"✉", color:"185,100%,62%",
                      platforms: preview.email ? [
                        {n:"HaveIBeenPwned", url:`https://haveibeenpwned.com/account/${enc(preview.email)}`},
                        {n:"Google",         url:`https://www.google.com/search?q="${enc(preview.email)}"`},
                        {n:"Facebook",       url:`https://www.facebook.com/search/people/?q=${enc(preview.email)}`},
                        {n:"LinkedIn",       url:`https://www.google.com/search?q=site:linkedin.com+"${enc(preview.email)}"`},
                        {n:"Spokeo",         url:`https://www.spokeo.com/email-search/results/${enc(preview.email)}`},
                        {n:"Hunter.io",      url:`https://hunter.io/email-verifier/${enc(preview.email)}`},
                      ] : []},
                    { key:"phone",   label:"PHONE NO.",  value:preview.phoneNo||"", icon:"📞", color:"140,80%,65%",
                      platforms: preview.phoneNo ? [
                        {n:"Google",         url:`https://www.google.com/search?q="${enc(preview.phoneNo)}"`},
                        {n:"Truecaller",     url:`https://www.truecaller.com/search/${preview.phoneNo.replace(/\D/g,"")}`},
                        {n:"WhatsApp",       url:`https://wa.me/${preview.phoneNo.replace(/\D/g,"")}`},
                        {n:"Facebook",       url:`https://www.facebook.com/search/people/?q=${enc(preview.phoneNo)}`},
                      ] : []},
                  ];
                  return(
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
                      className="overflow-hidden border-b" style={{borderColor:"hsla(270,55%,22%,0.35)",background:"hsla(270,50%,4%,0.85)"}}>
                      <div className="px-6 py-4">
                        <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{color:"hsl(270,80%,72%)"}}>
                          DEEP SEARCH — CHOOSE WHAT TO SEARCH FOR {preview.surname.toUpperCase()}, {preview.name.toUpperCase()}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {options.map(opt=>(
                            <div key={opt.key} className="rounded-xl overflow-hidden"
                              style={{border:`1px solid hsla(${opt.color},0.3)`,background:`hsla(${opt.color},0.07)`}}>
                              {/* Option header */}
                              <div className="flex items-center gap-2 px-3 py-2.5 border-b"
                                style={{borderColor:`hsla(${opt.color},0.22)`,background:`hsla(${opt.color},0.12)`}}>
                                <span className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-sm"
                                  style={{background:`hsla(${opt.color},0.2)`,border:`1px solid hsla(${opt.color},0.4)`}}>
                                  {opt.icon}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-mono text-[9px] font-bold tracking-wider" style={{color:`hsl(${opt.color})`}}>{opt.label}</p>
                                  <p className="font-mono text-[9px] truncate" style={{color:`hsla(${opt.color},0.65)`}}>{opt.value||"—"}</p>
                                </div>
                              </div>
                              {/* Platform links */}
                              <div className="p-2 space-y-1 max-h-36 overflow-y-auto">
                                {opt.platforms.length===0
                                  ?<p className="font-mono text-[9px] p-2 text-center" style={{color:`hsla(${opt.color},0.4)`}}>No data available</p>
                                  :opt.platforms.map((p,i)=>(
                                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center justify-between px-2 py-1.5 rounded-lg transition-all"
                                      style={{border:`1px solid hsla(${opt.color},0.15)`,background:`hsla(${opt.color},0.05)`,display:"flex"}}
                                      onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`hsla(${opt.color},0.2)`;(e.currentTarget as HTMLAnchorElement).style.borderColor=`hsla(${opt.color},0.45)`;}}
                                      onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`hsla(${opt.color},0.05)`;(e.currentTarget as HTMLAnchorElement).style.borderColor=`hsla(${opt.color},0.15)`;}}>
                                      <span className="font-mono text-[9px] font-bold" style={{color:`hsl(${opt.color})`}}>{p.n}</span>
                                      <svg viewBox="0 0 24 24" fill="none" width="10" height="10" stroke={`hsl(${opt.color})`} strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </a>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Preview body */}
              <div className="p-6 space-y-6">

                <Section title="PERSONAL INFORMATION">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="FULL NAME"      value={`${preview.surname}, ${preview.name}`}/>
                    <PF label="GENDER"         value={preview.gender}/>
                    <PF label="DATE OF BIRTH"  value={preview.dateOfBirth}/>
                    <PF label="PLACE OF BIRTH" value={preview.placeOfBirth}/>
                    <PF label="NATIONALITY"    value={preview.nationality}/>
                    <PF label="NATIONAL ID"    value={preview.noNationalId?"NO NATIONAL ID":preview.nationalId}/>
                    <PF label="BLOOD TYPE"     value={preview.bloodType}/>
                    <PF label="MARITAL STATUS" value={preview.maritalStatus}/>
                    <PF label="OCCUPATION"     value={preview.occupation}/>
                    <PF label="EMAIL"          value={preview.email}/>
                    <PF label="PHONE NUMBER"   value={preview.phoneNo}/>
                    <PF label="WHATSAPP"       value={(preview as any).whatsapp}/>
                    <div className="col-span-2 md:col-span-4"><PF label="ADDRESS" value={preview.address}/></div>
                  </div>
                </Section>

                <Section title="SOCIAL MEDIA ACCOUNTS">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="FACEBOOK"   value={(preview as any).facebook}/>
                    <PF label="INSTAGRAM"  value={(preview as any).instagram}/>
                    <PF label="X / TWITTER" value={(preview as any).twitter}/>
                    <PF label="LINKEDIN"   value={(preview as any).linkedin}/>
                  </div>
                </Section>

                <Section title="DOCUMENTS & CREDENTIALS">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    {preview.noPassport
                      ? <PF label="PASSPORT" value="NO PASSPORT ON RECORD" warn/>
                      : <><PF label="PASSPORT NO." value={preview.passportNo}/>
                          <PF label="PLACE OF ISSUE" value={preview.passportPlaceOfIssue}/>
                          <PF label="ISSUE DATE" value={preview.passportIssueDate}/>
                          <PF label="EXPIRY DATE" value={preview.passportExpiryDate}/></>}
                    {preview.noLicense
                      ? <PF label="DRIVING LICENSE" value="NO LICENSE ON RECORD" warn/>
                      : <PF label="DRIVING LICENSE FILE" value={preview.drivingLicenseFile||"—"}/>}
                  </div>
                </Section>

                <Section title="FAMILY INFORMATION">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="FATHER'S NAME"  value={preview.fatherName}/>
                    <PF label="FATHER'S PHONE" value={preview.fatherPhone}/>
                    <PF label="FATHER STATUS"  value={preview.fatherDeceased?"DECEASED":"—"}/>
                    <div/>
                    <PF label="MOTHER'S NAME"  value={preview.motherName}/>
                    <PF label="MOTHER'S PHONE" value={preview.motherPhone}/>
                    <PF label="MOTHER STATUS"  value={preview.motherDeceased?"DECEASED":"—"}/>
                    <div/>
                    {preview.kin1&&<>
                      <PF label="NEXT OF KIN NAME"     value={`${preview.kin1.name} ${preview.kin1.surname}`}/>
                      <PF label="NEXT OF KIN PHONE"    value={preview.kin1.phone}/>
                      <PF label="NEXT OF KIN RELATION" value={preview.kin1.relation}/>
                      <PF label="NEXT OF KIN ADDRESS"  value={preview.kin1.address}/>
                    </>}
                  </div>
                </Section>

                {(preview.emergencyContact1?.name||preview.emergencyContact2?.name)&&(
                  <Section title="EMERGENCY CONTACTS">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                      <PF label="CONTACT 1 NAME"  value={preview.emergencyContact1?.name}/>
                      <PF label="CONTACT 1 PHONE" value={preview.emergencyContact1?.phone}/>
                      <PF label="CONTACT 2 NAME"  value={preview.emergencyContact2?.name}/>
                      <PF label="CONTACT 2 PHONE" value={preview.emergencyContact2?.phone}/>
                    </div>
                  </Section>
                )}

                <Section title="EDUCATIONAL RECORD">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="STUDENT STATUS" value={preview.isStudent?"CURRENTLY ENROLLED":"NOT ENROLLED"}/>
                    {preview.isStudent&&<>
                      <PF label="INSTITUTION TYPE" value={preview.institutionType}/>
                      {preview.uniLevel&&<PF label="LEVEL" value={preview.uniLevel?.toUpperCase()}/>}
                      <PF label="INSTITUTION NAME" value={preview.institutionName}/>
                      <PF label="DEPARTMENT"       value={preview.department}/>
                      <PF label="YEAR OF STUDY"    value={preview.studyYear}/>
                    </>}
                    <PF label="ALUMNI STATUS" value={preview.isAlumni?"GRADUATED":"—"}/>
                    {preview.isAlumni&&preview.alumniRecord&&<>
                      <PF label="GRADUATION LEVEL"    value={preview.alumniRecord.level?.toUpperCase()}/>
                      <PF label="UNIVERSITY"          value={preview.alumniRecord.universityName}/>
                      <PF label="ALUMNI DEPARTMENT"   value={preview.alumniRecord.department}/>
                      <PF label="START DATE"          value={preview.alumniRecord.startDate}/>
                      <PF label="END DATE"            value={preview.alumniRecord.endDate}/>
                      <PF label="GPA / GRADE"         value={preview.alumniRecord.gpa} mono/>
                    </>}
                    {preview.educationRecord&&<div className="col-span-2 md:col-span-4"><PF label="PREVIOUS EDUCATION HISTORY" value={preview.educationRecord}/></div>}
                  </div>
                </Section>

                <Section title="WORK EXPERIENCE">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="CURRENTLY WORKING" value={preview.isCurrentlyWorking?"YES":"NO"}/>
                    {preview.isCurrentlyWorking&&preview.currentWorkInfo&&<>
                      <PF label="COMPANY"    value={preview.currentWorkInfo.company}/>
                      <PF label="EMPLOYER"   value={preview.currentWorkInfo.employer}/>
                      <PF label="DEPARTMENT" value={preview.currentWorkInfo.department}/>
                    </>}
                    {preview.workExperience&&<div className="col-span-2 md:col-span-4"><PF label="PREVIOUS WORK EXPERIENCE" value={preview.workExperience}/></div>}
                  </div>
                </Section>

                <Section title="HEALTH & RECORDS">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <PF label="HEALTH RECORD"                 value={preview.healthRecord}/>
                    <PF label="HISTORY OF PRESENT ILLNESS"    value={(preview as any).historyOfPresentIllness}/>
                    <PF label="CRIME RECORD"                  value={preview.crimeRecord}/>
                  </div>
                </Section>

                <Section title="BIOMETRIC HASHES">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    {preview.fingerHashes
                      ?[{l:"RIGHT THUMB",k:"rightThumb"},{l:"RIGHT INDEX FINGER",k:"rightIndex"},{l:"LEFT THUMB",k:"leftThumb"},{l:"LEFT INDEX FINGER",k:"leftIndex"}]
                        .map(({l,k})=><PF key={k} label={l} value={preview.fingerHashes?.[k as keyof typeof preview.fingerHashes]||"—"} mono/>)
                      :<PF label="FINGERPRINT HASH" value={preview.fingerprintHash} mono/>
                    }
                  </div>
                </Section>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ─── GLOBAL FOOTER ─── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"9px 32px",background:"rgba(0,4,16,0.88)",borderTop:"1px solid rgba(0,200,245,0.16)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,gap:12,backdropFilter:"blur(8px)"}}>
        <span style={{color:"rgba(0,208,255,0.65)"}}>BIMS v1.0</span>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"rgba(0,230,200,0.75)",textDecoration:"none",letterSpacing:"0.06em"}}>© 2026 KUMI</a>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <span style={{color:"rgba(0,208,255,0.40)"}}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</span>
      </div>
</div>
  );
};

export default DatabasePage;
