import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowLeft, Search, Fingerprint, Users, User,
  ChevronRight, X, Eye, Lock, ClipboardList, LogOut, Paperclip, FileText, ImageIcon, Download,
  HardDrive, Trash2, DatabaseZap, Pencil, Save, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";
import {
  getRecords, searchRecords, isDatabaseUnlocked, unlockDatabase,
  lockDatabase, getAccessLogs, clearLogs, exportDatabase,
  getStorageInfo, deleteRecord, updateRecord, type BiometricRecord
} from "@/lib/biometric-store";

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
      <div className="p-5 flex items-center justify-center min-h-48" style={{background:"hsla(185,80%,4%,0.95)"}}>
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

/* ── PIN Lock Screen ── */
const LockScreen = ({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) => {
  const [mode,  setMode]  = useState<"pin"|"forgot"|"forgot-sent">("pin");
  const [pin,   setPin]   = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const tryPin = () => {
    if (unlockDatabase(pin)) { onUnlock(); }
    else {
      setError("INCORRECT PIN — ACCESS DENIED");
      setPin("");
      // Flash the error text — no box movement at all
    }
  };

  const sendResetEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("ENTER A VALID EMAIL ADDRESS"); return;
    }
    setError(""); setMode("forgot-sent");
  };

  /* Shared page shell — fully static, zero motion, zero layout shift */
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative flex flex-col items-center justify-center">
      <CyberBackground />
      <div className="cyber-header fixed top-0 left-0 right-0 z-10 flex items-center px-4 py-3">
        <button onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150"
          style={{ color: "hsl(38,90%,68%)" }}
          onMouseEnter={e => e.currentTarget.style.background = "hsla(38,80%,50%,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display text-sm font-bold tracking-wider">DATABASE ACCESS</span>
        </button>
      </div>
      <div
        className="card-surface rounded-2xl p-10 relative z-[1] w-full max-w-md text-center mt-14"
        style={{ border: "1.5px solid hsla(38,80%,50%,0.35)", boxShadow: "0 0 60px hsla(38,80%,50%,0.12)" }}>
        {children}
      </div>
    </div>
  );

  /* ── PIN entry — stable, no animation on the input ── */
  if (mode === "pin") return (
    <Shell>
      <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
        style={{ background: "hsla(185,100%,50%,0.1)", border: "2px solid hsla(185,100%,50%,0.35)" }}>
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <h1 className="font-display text-2xl font-bold mb-1 glow-text">DATABASE ACCESS</h1>
      <p className="font-mono text-xs mb-6 tracking-widest" style={{ color: "hsla(185,80%,65%,0.5)" }}>
        RESTRICTED — AUTHORISED PERSONNEL ONLY
      </p>

      {/* PIN input — plain div, zero motion, zero layout shift */}
      <div className="mb-3">
        <input
          type="password"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") tryPin(); }}
          placeholder="• • • • • •"
          maxLength={8}
          autoFocus
          className="input-cyber text-center font-bold w-full"
          style={{
            fontSize: "1.4rem",
            letterSpacing: "0.5em",
            borderColor: error ? "hsl(0,90%,58%)" : undefined,
          }}
        />
      </div>

      {/* Fixed-height error slot — always present, never shifts layout */}
      <div className="h-7 flex items-center justify-center mb-3">
        {error && (
          <p className="font-mono text-xs tracking-wider" style={{ color: "hsl(0,90%,65%)" }}>
            {error}
          </p>
        )}
      </div>

      <button onClick={tryPin}
        className="w-full h-11 rounded-lg font-mono font-bold tracking-widest text-sm mb-4 transition-all"
        style={{ background: "hsla(185,100%,50%,0.18)", border: "1.5px solid hsla(185,100%,50%,0.5)", color: "hsl(185,100%,78%)" }}
        onMouseEnter={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.18)"}>
        UNLOCK DATABASE
      </button>

      <button onClick={() => { setMode("forgot"); setError(""); setEmail(""); }}
        className="font-mono text-xs tracking-wider underline underline-offset-4"
        style={{ color: "hsla(185,100%,62%,0.6)" }}>
        Forgot PIN?
      </button>
    </Shell>
  );

  /* ── Forgot PIN — email entry ── */
  if (mode === "forgot") return (
    <Shell>
      <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
        style={{ background: "hsla(185,100%,50%,0.1)", border: "2px solid hsla(185,100%,50%,0.35)" }}>
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <h1 className="font-display text-xl font-bold mb-1 glow-text">FORGOT PIN</h1>
      <p className="font-mono text-xs mb-2 tracking-widest" style={{ color: "hsla(185,80%,65%,0.5)" }}>
        ENTER YOUR REGISTERED EMAIL ADDRESS
      </p>
      <p className="font-mono text-xs mb-5" style={{ color: "hsla(185,70%,60%,0.4)" }}>
        A reset link will be sent to your inbox.
      </p>
      <div className="mb-2">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") sendResetEmail(); }}
          placeholder="your@email.com" autoFocus
          className="input-cyber text-center w-full" style={{ letterSpacing: "0.05em" }}/>
      </div>
      <div className="h-7 flex items-center justify-center mb-3">
        {error && <p className="font-mono text-xs tracking-wider" style={{ color: "hsl(0,90%,65%)" }}>{error}</p>}
      </div>
      <button onClick={sendResetEmail}
        className="w-full h-11 rounded-lg font-mono font-bold tracking-widest text-sm mb-4 transition-all"
        style={{ background: "hsla(185,100%,50%,0.18)", border: "1.5px solid hsla(185,100%,50%,0.5)", color: "hsl(185,100%,78%)" }}
        onMouseEnter={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.18)"}>
        SEND RESET LINK
      </button>
      <button onClick={() => { setMode("pin"); setError(""); }}
        className="font-mono text-xs tracking-wider" style={{ color: "hsla(185,80%,60%,0.5)" }}>
        ← Back to PIN
      </button>
    </Shell>
  );

  /* ── Reset email sent ── */
  return (
    <Shell>
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
        style={{ background: "hsla(140,80%,45%,0.12)", border: "2px solid hsla(140,80%,45%,0.4)" }}>
        <span className="text-2xl">✉️</span>
      </div>
      <h1 className="font-display text-xl font-bold mb-2" style={{ color: "hsl(140,90%,68%)", textShadow: "0 0 14px hsla(140,80%,50%,0.4)" }}>
        RESET LINK SENT
      </h1>
      <p className="font-mono text-sm mb-1 font-semibold" style={{ color: "hsl(185,60%,82%)" }}>Check your inbox at:</p>
      <p className="font-mono text-sm font-bold mb-5" style={{ color: "hsl(185,100%,70%)" }}>{email}</p>
      <p className="font-mono text-xs mb-6" style={{ color: "hsla(185,70%,60%,0.5)" }}>
        The reset link expires in 30 minutes.
      </p>
      <button onClick={() => { setMode("pin"); setEmail(""); }}
        className="w-full h-11 rounded-lg font-mono font-bold tracking-widest text-sm transition-all"
        style={{ background: "hsla(185,100%,50%,0.14)", border: "1.5px solid hsla(185,100%,50%,0.4)", color: "hsl(185,100%,75%)" }}
        onMouseEnter={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.24)"}
        onMouseLeave={e => e.currentTarget.style.background = "hsla(185,100%,50%,0.14)"}>
        BACK TO LOGIN
      </button>
    </Shell>
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
const DatabasePage = () => {
  const navigate   = useNavigate();
  const [unlocked, setUnlocked] = useState(isDatabaseUnlocked());
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<BiometricRecord[]>([]);
  const [preview,  setPreview]  = useState<BiometricRecord|null>(null);
  const [modal,    setModal]    = useState<{title:string;src:string;isImg:boolean}|null>(null);
  const [editRecord, setEditRecord] = useState<BiometricRecord|null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [logs,     setLogs]     = useState(getAccessLogs());
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());

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

  const handleLock = () => { lockDatabase(); setUnlocked(false); setResults([]); setPreview(null); };

  const handleDelete = (id: string) => {
    if(!confirm(`Delete record ${id}? This cannot be undone.`)) return;
    deleteRecord(id);
    if(preview?.id === id) setPreview(null);
    refreshAll();
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
    if(!confirm("Clear all access logs? This cannot be undone.")) return;
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

      {/* Header */}
      <div className="cyber-header flex items-center justify-between px-8 py-3 sticky top-0 z-20">
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
          <button onClick={handleExport}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all"
            style={{border:"1px solid hsla(140,80%,45%,0.35)",background:"hsla(140,80%,45%,0.07)",color:"hsl(140,80%,62%)"}}>
            <Download className="w-3.5 h-3.5"/> EXPORT
          </button>
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
        <div className="card-surface rounded-lg px-5 py-3 mb-5 flex items-center gap-4">
          <Search className="w-5 h-5 flex-shrink-0" style={{color:"hsla(185,100%,60%,0.55)"}}/>
          <input value={query} onChange={e=>handleSearch(e.target.value)}
            placeholder="Search by name, ID, nationality, passport or national ID…"
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            style={{letterSpacing:"0.02em"}}/>
          {query&&<button onClick={()=>handleSearch("")} className="text-muted-foreground/50 hover:text-foreground transition-colors"><X className="w-4 h-4"/></button>}
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
                  onClick={()=>setPreview(preview?.id===rec.id?null:rec)}>
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
                    <button onClick={e=>{e.stopPropagation();handleDelete(rec.id);}} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-1.5 rounded transition-all"
                      style={{border:"1px solid hsla(0,80%,55%,0.3)",background:"hsla(0,80%,55%,0.06)",color:"hsl(0,80%,65%)"}}>
                      <Trash2 className="w-3 h-3"/>
                    </button>
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
                  {/* Attachment buttons */}
                  <div className="flex flex-col gap-1.5">
                    {preview.photo&&<button onClick={()=>openAttach("PROFILE PHOTO",preview.photo!)} className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded transition-all" style={{border:"1px solid hsla(33,100%,52%,0.4)",background:"hsla(33,100%,52%,0.09)",color:"hsl(33,100%,65%)"}}>
                      <Paperclip className="w-3 h-3"/> PHOTO
                    </button>}
                    {!preview.noPassport&&preview.passportFile&&<button onClick={()=>openAttach("PASSPORT",preview.passportFile!)} className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded transition-all" style={{border:"1px solid hsla(33,100%,52%,0.4)",background:"hsla(33,100%,52%,0.09)",color:"hsl(33,100%,65%)"}}>
                      <Paperclip className="w-3 h-3"/> PASSPORT
                    </button>}
                    {!preview.noLicense&&preview.drivingLicenseFile&&<button onClick={()=>openAttach("DRIVING LICENSE",preview.drivingLicenseFile!)} className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded transition-all" style={{border:"1px solid hsla(33,100%,52%,0.4)",background:"hsla(33,100%,52%,0.09)",color:"hsl(33,100%,65%)"}}>
                      <Paperclip className="w-3 h-3"/> LICENSE
                    </button>}
                  </div>
                  <Button onClick={()=>navigate(`/result/${preview.id}`)} className="font-mono text-xs font-bold tracking-wider" style={{background:"hsla(185,100%,50%,0.15)",border:"1px solid hsla(185,100%,50%,0.4)",color:"hsl(185,100%,65%)"}}>
                    FULL PROFILE <ChevronRight className="w-3.5 h-3.5 ml-1"/>
                  </Button>
                  <button onClick={()=>setEditRecord(preview)}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all"
                    style={{border:"1.5px solid hsla(33,100%,52%,0.55)",background:"hsla(33,100%,52%,0.14)",color:"hsl(33,100%,70%)"}}>
                    <Pencil className="w-3.5 h-3.5"/> EDIT
                  </button>
                  <button onClick={()=>setPreview(null)} className="w-8 h-8 flex items-center justify-center rounded transition-colors" style={{color:"hsla(185,80%,60%,0.5)"}}>
                    <X className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              {/* Preview body */}
              <div className="p-6 space-y-6">
                <Section title="PERSONAL INFORMATION">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <PF label="DATE OF BIRTH"  value={preview.dateOfBirth}/>
                    <PF label="PLACE OF BIRTH" value={preview.placeOfBirth}/>
                    <PF label="NATIONALITY"    value={preview.nationality}/>
                    <PF label="NATIONAL ID"    value={preview.nationalId}/>
                    <PF label="BLOOD TYPE"     value={preview.bloodType}/>
                    <PF label="MARITAL STATUS" value={preview.maritalStatus}/>
                    <PF label="OCCUPATION"     value={preview.occupation}/>
                    <PF label="EMAIL"          value={preview.email}/>
                    <PF label="PHONE"          value={preview.phoneNo}/>
                    {preview.address&&<div className="col-span-2"><PF label="ADDRESS" value={preview.address}/></div>}
                    {preview.languages&&preview.languages.length>0&&
                      <div className="col-span-2"><PF label="LANGUAGES SPOKEN" value={preview.languages.join(", ")}/></div>}
                  </div>
                </Section>

                {(preview.isStudent||preview.isAlumni)&&(
                  <Section title="EDUCATION">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                      {preview.isStudent&&<><PF label="STATUS" value="CURRENTLY ENROLLED"/><PF label="INSTITUTION TYPE" value={preview.institutionType}/>{preview.uniLevel&&<PF label="LEVEL" value={preview.uniLevel.toUpperCase()}/>}{preview.institutionName&&<PF label="INSTITUTION" value={preview.institutionName}/>}{preview.department&&<PF label="DEPARTMENT" value={preview.department}/>}{preview.studyYear&&<PF label="YEAR" value={preview.studyYear}/>}</>}
                      {preview.isAlumni&&preview.alumniRecord&&<><PF label="ALUMNI LEVEL" value={preview.alumniRecord.level.toUpperCase()}/><PF label="UNIVERSITY" value={preview.alumniRecord.universityName}/><PF label="DEPARTMENT" value={preview.alumniRecord.department}/><PF label="START DATE" value={preview.alumniRecord.startDate}/><PF label="END DATE" value={preview.alumniRecord.endDate}/><PF label="GPA / GRADE" value={preview.alumniRecord.gpa} mono/></>}
                    </div>
                  </Section>
                )}

                <Section title="DOCUMENTS">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    {preview.noPassport?<PF label="PASSPORT" value="NO PASSPORT ON RECORD" warn/>
                      :<><PF label="PASSPORT NO." value={preview.passportNo}/><PF label="PLACE OF ISSUE" value={preview.passportPlaceOfIssue}/><PF label="ISSUE DATE" value={preview.passportIssueDate}/><PF label="EXPIRY DATE" value={preview.passportExpiryDate}/></>}
                    {preview.noLicense?<PF label="DRIVING LICENSE" value="NO LICENSE ON RECORD" warn/>:<PF label="DRIVING LICENSE FILE" value={preview.drivingLicenseFile||"—"}/>}
                  </div>
                </Section>

                <Section title="FAMILY">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <div><PF label="FATHER'S NAME" value={preview.fatherName}/>{preview.fatherPhone&&<PF label="FATHER'S PHONE" value={preview.fatherPhone}/>}{preview.fatherDeceased&&<span className="font-mono text-[9px] font-bold tracking-wider" style={{color:"hsl(0,80%,65%)"}}>DECEASED</span>}</div>
                    <div><PF label="MOTHER'S NAME" value={preview.motherName}/>{preview.motherPhone&&<PF label="MOTHER'S PHONE" value={preview.motherPhone}/>}{preview.motherDeceased&&<span className="font-mono text-[9px] font-bold tracking-wider" style={{color:"hsl(0,80%,65%)"}}>DECEASED</span>}</div>
                  </div>
                </Section>

                {(preview.emergencyContact1?.name||preview.emergencyContact2?.name)&&(
                  <Section title="EMERGENCY CONTACTS">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                      {preview.emergencyContact1?.name&&<><PF label="EMERGENCY CONTACT NAME" value={preview.emergencyContact1.name}/><PF label="EMERGENCY CONTACT PHONE" value={preview.emergencyContact1.phone}/></>}
                      {preview.emergencyContact2?.name&&<><PF label="SECONDARY CONTACT NAME" value={preview.emergencyContact2.name}/><PF label="SECONDARY CONTACT PHONE" value={preview.emergencyContact2.phone}/></>}
                    </div>
                  </Section>
                )}

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

      <div className="relative z-[1] py-4 text-center border-t" style={{borderColor:"hsla(185,60%,20%,0.3)"}}>
        <span className="font-mono text-[11px] tracking-widest" style={{color:"hsla(185,100%,60%,0.3)"}}>© 2026 KUMI — BIOMETRIC IDENTITY MANAGEMENT SYSTEM — ALL RIGHTS RESERVED</span>
      </div>
    </div>
  );
};

export default DatabasePage;
