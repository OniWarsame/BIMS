import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint, Shield, ArrowLeft, Upload, Camera, User, FileText,
  Clock, Heart, AlertTriangle, GraduationCap, Eye, X, Briefcase,
  Facebook, Instagram, Linkedin, Twitter, ChevronRight, ChevronLeft, Check,
  CreditCard, Users, Activity, Share2, IdCard, Building2, Baby, Globe
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CyberBackground from "@/components/CyberBackground";
import PageFooter from "@/components/PageFooter";
import { addRecord, generateId, generateFingerprintHash, type BiometricRecord, type AlumniRecord } from "@/lib/biometric-store";
import { getUsers, saveUsers, type UserRole, ROLE_LABELS } from "@/pages/Login";
import { useToast } from "@/hooks/use-toast";

const RELATION_OPTIONS = ["Spouse","Parent","Sibling","Child","Grandparent","Aunt/Uncle","Cousin","Guardian","Friend","Other"];
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const PASSPORT_TYPES = ["Regular/Ordinary","Diplomatic","Official/Service","Emergency","Collective/Family","Laissez-Passer"];

type FingerKey = "rightThumb"|"rightIndex"|"leftThumb"|"leftIndex";
const FINGERS: {key:FingerKey;label:string;short:string}[] = [
  {key:"rightThumb",  label:"RIGHT THUMB",        short:"R.THUMB"},
  {key:"rightIndex",  label:"RIGHT INDEX FINGER",  short:"R.INDEX"},
  {key:"leftThumb",   label:"LEFT THUMB",          short:"L.THUMB"},
  {key:"leftIndex",   label:"LEFT INDEX FINGER",   short:"L.INDEX"},
];

const STEPS = [
  {id:0, label:"Personal Info",    icon:IdCard},
  {id:1, label:"Credentials",      icon:CreditCard},
  {id:2, label:"Family",           icon:Users},
  {id:3, label:"Education",        icon:GraduationCap},
  {id:4, label:"Work",             icon:Building2},
  {id:5, label:"Health & Records", icon:Activity},
  {id:6, label:"Travel History",   icon:Globe},
  {id:7, label:"Insurance",        icon:Shield},
  {id:8, label:"Emergency",        icon:AlertTriangle},
  {id:9, label:"Social Media",     icon:Share2},
  {id:10, label:"Biometrics",       icon:Fingerprint},
];

/* ── Attachment viewer modal ── */
const AttachModal = ({title,src,isImg,onClose}:{title:string;src:string;isImg:boolean;onClose:()=>void}) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{background:"hsla(25,15%,4%,0.94)",backdropFilter:"blur(16px)"}} onClick={onClose}>
    <motion.div initial={{scale:0.92,y:16}} animate={{scale:1,y:0}} exit={{scale:0.92}}
      className="card-surface rounded-xl overflow-hidden max-w-xl w-full"
      style={{border:"1.5px solid hsla(192,100%,55%,0.4)",boxShadow:"0 0 60px hsla(192,100%,55%,0.12)"}}
      onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{borderColor:"hsla(192,70%,25%,0.35)",background:"hsla(192,100%,55%,0.06)"}}>
        <span className="font-mono text-xs font-bold tracking-widest" style={{color:"hsl(192,100%,65%)"}}>{title}</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded" style={{color:"hsl(192,100%,65%)"}}>
          <X className="w-4 h-4"/>
        </button>
      </div>
      <div className="p-5 flex items-center justify-center min-h-40" style={{background:"hsla(25,12%,5%,0.9)"}}>
        {isImg
          ? <img src={src} alt={title} className="max-w-full max-h-80 object-contain rounded-lg"/>
          : <div className="text-center space-y-3">
              <FileText className="w-14 h-14 mx-auto" style={{color:"hsla(192,100%,55%,0.28)"}}/>
              <p className="font-mono text-sm font-semibold" style={{color:"hsl(192,60%,88%)"}}>{src}</p>
              <p className="font-mono text-xs" style={{color:"hsla(192,100%,60%,0.5)"}}>File uploaded</p>
            </div>}
      </div>
    </motion.div>
  </motion.div>
);

/* ── DateInput — free typing, no auto-fill ── */
const DateInput = ({value, onChange, style}:{value:string;onChange:(v:string)=>void;style?:React.CSSProperties}) => {
  // Keep three independent local strings — only push to parent when user actually typed something
  const parse = (v:string) => { const p=v?v.split("-"):["","",""]; return [p[0]||"",p[1]||"",p[2]||""]; };
  const [yy,mo,dd] = parse(value);
  const [localDD, setLocalDD] = React.useState(dd);
  const [localMM, setLocalMM] = React.useState(mo);
  const [localYY, setLocalYY] = React.useState(yy);

  // Only sync from parent if parent clears the value entirely
  React.useEffect(()=>{
    if(!value){ setLocalDD(""); setLocalMM(""); setLocalYY(""); }
  },[value]);

  const emit = (d:string, m:string, y:string) => {
    // Only emit a real date — never pad with zeros unless user typed them
    if(d||m||y) onChange(`${y||""}-${m||""}-${d||""}`);
    else onChange("");
  };

  return (
    <div className="flex gap-1.5 items-center" style={style}>
      <input maxLength={2} placeholder="DD" value={localDD}
        onChange={e=>{
          const v=e.target.value.replace(/\D/g,"").slice(0,2);
          setLocalDD(v); emit(v,localMM,localYY);
        }}
        className="input-cyber text-center font-mono" style={{width:"3.4rem",padding:"0 0.3rem"}}/>
      <span className="font-mono text-sm font-bold" style={{color:"hsla(192,100%,55%,0.55)"}}>/</span>
      <input maxLength={2} placeholder="MM" value={localMM}
        onChange={e=>{
          const v=e.target.value.replace(/\D/g,"").slice(0,2);
          setLocalMM(v); emit(localDD,v,localYY);
        }}
        className="input-cyber text-center font-mono" style={{width:"3.4rem",padding:"0 0.3rem"}}/>
      <span className="font-mono text-sm font-bold" style={{color:"hsla(192,100%,55%,0.55)"}}>/</span>
      <input maxLength={4} placeholder="YYYY" value={localYY}
        onChange={e=>{
          const v=e.target.value.replace(/\D/g,"").slice(0,4);
          setLocalYY(v); emit(localDD,localMM,v);
        }}
        className="input-cyber text-center font-mono" style={{width:"5rem",padding:"0 0.3rem"}}/>
    </div>
  );
};

/* ── Shared field wrapper ── */
const F=({label,children,required}:{label:string;children:React.ReactNode;required?:boolean})=>(
  <div style={{display:"flex",flexDirection:"column" as const,gap:3}}>
    <label style={{fontFamily:"'Inter',sans-serif",fontSize:8,fontWeight:700,
      letterSpacing:"0.14em",textTransform:"uppercase" as const,
      color:"rgba(0,160,200,0.42)"}}>
      {label}{required&&<span style={{color:"rgba(220,60,60,0.8)",marginLeft:3}}>*</span>}
    </label>
    {children}
  </div>
);

const SectionHeader=({icon:Icon,title}:{icon:any;title:string})=>(
  <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:10,marginBottom:14,
    borderBottom:"1px solid rgba(0,160,200,0.12)"}}>
    <div style={{width:26,height:26,borderRadius:3,
      background:"rgba(0,120,180,0.1)",border:"1px solid rgba(0,160,200,0.2)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Icon style={{width:12,height:12,color:"rgba(0,200,240,0.7)"}}/>
    </div>
    <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,
      letterSpacing:"0.1em",color:"rgba(200,225,255,0.88)",margin:0,textTransform:"uppercase"}}>{title}</h2>
  </div>
);

const ToggleStyle=(active:boolean,hue=185)=>({
  fontSize:"0.8rem",fontWeight:700,
  border:      active?`2px solid hsl(${hue},100%,55%)`:`1.5px solid hsla(${hue},70%,55%,0.38)`,
  background:  active?`hsla(${hue},100%,50%,0.18)`:"hsla(25,12%,9%,0.85)",
  color:       active?`hsl(${hue},100%,82%)`:`hsl(${hue},60%,65%)`,
  boxShadow:   active?`0 0 16px hsla(${hue},100%,50%,0.22)`:"none",
});

const UploadBox=({label,file,onClear,onClick,accept="*"}:{label:string;file:string|null;onClear:()=>void;onClick:()=>void;accept?:string})=>(
  <div>
    <label className="text-label">{label}</label>
    <div className="upload-zone h-11 cursor-pointer relative" onClick={onClick}>
      {file
        ?<><span className="font-mono text-xs text-primary truncate px-3">{file}</span>
           <button type="button" className="absolute right-2 top-1.5 w-6 h-6 flex items-center justify-center rounded"
             style={{background:"hsla(0,80%,55%,0.15)"}} onClick={e=>{e.stopPropagation();onClear();}}>
             <X className="w-3 h-3" style={{color:"hsl(0,80%,65%)"}}/></button></>
        :<><Upload className="w-4 h-4 mr-2" style={{color:"hsla(192,100%,55%,0.4)"}}/><span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(192,100%,58%,0.4)"}}>CLICK TO UPLOAD {label.toUpperCase()}</span></>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   STEP COMPONENTS — each is its own pure component
═══════════════════════════════════════════════════════════ */

/* STEP 0 — Personal Info */
const StepPersonal=({form,setForm,photoPreview,setPhotoPreview,photoRef}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SectionHeader icon={IdCard} title="Personal Information"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="FIRST NAME" required><input name="name" value={form.name} onChange={hc} placeholder="First name" className="input-cyber"/></F>
        <F label="SURNAME" required><input name="surname" value={form.surname} onChange={hc} placeholder="Last name" className="input-cyber"/></F>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="GENDER" required>
          <select name="gender" value={form.gender} onChange={hc} className="input-cyber">
            <option value="">Select gender</option>
            <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
          </select>
        </F>
        <F label="BLOOD TYPE">
          <select name="bloodType" value={form.bloodType} onChange={hc} className="input-cyber">
            <option value="">Select blood type</option>
            {BLOOD_TYPES.map(bt=><option key={bt}>{bt}</option>)}
          </select>
        </F>
      </div>
      <F label="DATE OF BIRTH" required><DateInput value={form.dateOfBirth} onChange={v=>setForm((p:any)=>({...p,dateOfBirth:v}))}/></F>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="PLACE OF BIRTH"><input name="placeOfBirth" value={form.placeOfBirth} onChange={hc} placeholder="City, Country" className="input-cyber"/></F>
        <F label="NUMBER OF SIBLINGS"><input name="siblings" value={form.siblings} onChange={hc} placeholder="e.g. 2" type="number" min="0" className="input-cyber"/></F>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="NATIONALITY"><input name="nationality" value={form.nationality} onChange={hc} placeholder="e.g. Kenyan" className="input-cyber"/></F>
        <F label="MARITAL STATUS">
          <select name="maritalStatus" value={form.maritalStatus} onChange={hc} className="input-cyber">
            <option value="">Select status</option>
            <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
          </select>
        </F>
      </div>
      <F label="MULTINATIONALITY">
        <input name="multinationality" value={form.multinationality||""} onChange={hc} placeholder="Other nationalities held (if any) e.g. British, American" className="input-cyber"/>
      </F>
      <F label="NATIONAL ID">
        <input name="nationalId" value={form.nationalId} onChange={hc} placeholder="ID number" className="input-cyber" disabled={!!form.noNationalId}
          style={form.noNationalId?{opacity:0.3,pointerEvents:"none",textDecoration:"line-through"}:{}}/>
        <label style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:7,cursor:"pointer",
          userSelect:"none" as const,padding:"5px 10px",borderRadius:6,
          background:form.noNationalId?"hsla(42,100%,52%,0.08)":"hsla(215,55%,8%,0.6)",
          border:form.noNationalId?"1px solid hsla(42,100%,52%,0.35)":"1px solid hsla(215,50%,20%,0.5)",
          transition:"all .15s"}}>
          <input type="checkbox" checked={!!form.noNationalId}
            onChange={e=>setForm((p:any)=>({...p,noNationalId:e.target.checked,nationalId:e.target.checked?"":p.nationalId}))}
            style={{width:14,height:14,accentColor:"hsl(42,100%,55%)",cursor:"pointer",flexShrink:0}}/>
          <span style={{fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:11,fontWeight:500,
            color:form.noNationalId?"hsl(42,100%,70%)":"hsla(192,60%,65%,0.55)",letterSpacing:"0.02em"}}>
            No national ID
          </span>
        </label>
      </F>
      <F label="OCCUPATION"><input name="occupation" value={form.occupation} onChange={hc} placeholder="Job title" className="input-cyber"/></F>
      <F label="EMAIL" required><input name="email" value={form.email} onChange={hc} type="email" placeholder="email@domain.com" className="input-cyber"/></F>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="PHONE NUMBER"><input name="phoneNo" value={form.phoneNo} onChange={hc} placeholder="+254-700-000-000" className="input-cyber"/></F>
        <F label={<span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" style={{color:"hsl(142,70%,50%)"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WHATSAPP
        </span> as any}>
          <input name="whatsapp" value={form.whatsapp} onChange={hc} placeholder="+254-700-000-000" className="input-cyber"/></F>
      </div>
      <F label="ADDRESS"><textarea name="address" value={form.address} onChange={hc} rows={2} placeholder="Full residential address" className="textarea-cyber"/></F>
      {/* Profile photo */}
      <div>
        <label className="text-label">PROFILE PHOTO</label>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e=>{
          const f=e.target.files?.[0]; if(!f) return;
          const r=new FileReader(); r.onloadend=()=>setPhotoPreview(r.result as string); r.readAsDataURL(f);
        }}/>
        <div className="upload-zone h-36 flex-col gap-2 cursor-pointer" onClick={()=>photoRef.current?.click()}>
          {photoPreview
            ?<img src={photoPreview} alt="Subject" className="w-full h-full object-cover rounded"/>
            :<><Camera className="w-7 h-7" style={{color:"hsla(192,100%,55%,0.3)"}}/><span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(192,100%,58%,0.45)"}}>CLICK TO UPLOAD PHOTO</span></>}
        </div>
      </div>
    </div>
  );
};

/* STEP 1 — Credentials */
const StepCredentials=({form,setForm,noPassport,setNoPassport,noLicense,setNoLicense,passportFile,setPassportFile,licenseFile,setLicenseFile,passportRef,licenseRef,onView}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div className="space-y-6">
      <SectionHeader icon={CreditCard} title="Credentials"/>
      {/* ── PASSPORT ── */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <label className="text-label" style={{color:"hsla(192,100%,62%,0.7)",fontSize:"0.68rem"}}>PASSPORT</label>
        <F label="PASSPORT TYPE">
          <select name="passportType" value={form.passportType||""} onChange={hc} className="input-cyber">
            <option value="">Select passport type</option>
            {PASSPORT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <F label="PASSPORT NO."><input name="passportNo" value={form.passportNo} onChange={hc} placeholder="X00000000" className="input-cyber"/></F>
          <F label="PLACE OF ISSUE"><input name="passportPlaceOfIssue" value={form.passportPlaceOfIssue} onChange={hc} placeholder="City / Country" className="input-cyber"/></F>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <F label="ISSUE DATE"><DateInput value={form.passportIssueDate} onChange={v=>setForm((p:any)=>({...p,passportIssueDate:v}))}/></F>
          <F label="EXPIRY DATE"><DateInput value={form.passportExpiryDate} onChange={v=>setForm((p:any)=>({...p,passportExpiryDate:v}))}/></F>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-label" style={{margin:0}}>UPLOAD PASSPORT SCAN</label>
            {passportFile&&<button onClick={()=>onView("PASSPORT SCAN",passportFile)} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider px-2 py-1 rounded" style={{border:"1px solid hsla(192,100%,55%,0.35)",background:"hsla(192,100%,55%,0.08)",color:"hsl(192,100%,62%)"}}><Eye className="w-3 h-3"/> VIEW</button>}
          </div>
          <input ref={passportRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setPassportFile(f.name);e.target.value="";}}/>
          <UploadBox label="Passport Scan" file={passportFile} onClear={()=>setPassportFile(null)} onClick={()=>passportRef.current?.click()}/>
        </div>
        <div className="check-row">
          <Checkbox id="noPassport" checked={noPassport} onCheckedChange={v=>setNoPassport(v===true)}/>
          <label htmlFor="noPassport">NO PASSPORT</label>
        </div>
      </div>

      <div className="border-t" style={{borderColor:"hsla(192,60%,18%,0.35)"}}/>

      {/* ── DRIVING LICENSE ── */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <label className="text-label" style={{color:"hsla(192,100%,62%,0.7)",fontSize:"0.68rem"}}>DRIVING LICENSE</label>
        <F label="LICENSE NO."><input name="licenseNo" value={form.licenseNo||""} onChange={hc} placeholder="License number" className="input-cyber"/></F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <F label="ISSUE DATE"><DateInput value={form.licenseIssueDate||""} onChange={v=>setForm((p:any)=>({...p,licenseIssueDate:v}))}/></F>
          <F label="EXPIRY DATE"><DateInput value={form.licenseExpiryDate||""} onChange={v=>setForm((p:any)=>({...p,licenseExpiryDate:v}))}/></F>
        </div>
        <F label="COUNTRY OF ISSUE"><input name="licenseCountry" value={form.licenseCountry||""} onChange={hc} placeholder="e.g. Kenya" className="input-cyber"/></F>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-label" style={{margin:0}}>UPLOAD DRIVING LICENSE</label>
            {licenseFile&&<button onClick={()=>onView("DRIVING LICENSE",licenseFile)} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider px-2 py-1 rounded" style={{border:"1px solid hsla(192,100%,55%,0.35)",background:"hsla(192,100%,55%,0.08)",color:"hsl(192,100%,62%)"}}><Eye className="w-3 h-3"/> VIEW</button>}
          </div>
          <input ref={licenseRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setLicenseFile(f.name);e.target.value="";}}/>
          <UploadBox label="Driving License" file={licenseFile} onClear={()=>setLicenseFile(null)} onClick={()=>licenseRef.current?.click()}/>
        </div>
        <div className="check-row">
          <Checkbox id="noLicense" checked={noLicense} onCheckedChange={v=>setNoLicense(v===true)}/>
          <label htmlFor="noLicense">NO DRIVING LICENSE</label>
        </div>
      </div>
    </div>
  );
};

/* STEP 2 — Family */
const StepFamily=({form,setForm,fatherDeceased,setFatherDeceased,motherDeceased,setMotherDeceased,kin,setKin}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div className="space-y-5">
      <SectionHeader icon={Users} title="Family Information"/>
      <div className="space-y-4 pb-4 border-b" style={{borderColor:"hsla(192,60%,18%,0.3)"}}>
        <label className="text-label" style={{color:"hsla(192,100%,62%,0.6)",fontSize:"0.68rem"}}>FATHER</label>
        <F label="FATHER'S FULL NAME"><input name="fatherName" value={form.fatherName} onChange={hc} placeholder="Full name" className="input-cyber"/></F>
        <F label="FATHER'S PHONE"><input name="fatherPhone" value={form.fatherPhone} onChange={hc} placeholder="+254-700-000-000" className="input-cyber"/></F>
        <div className="check-row">
          <Checkbox id="fd" checked={fatherDeceased} onCheckedChange={v=>setFatherDeceased(v===true)}/><label htmlFor="fd">DECEASED</label>
        </div>
      </div>
      <div className="space-y-4 pb-4 border-b" style={{borderColor:"hsla(192,60%,18%,0.3)"}}>
        <label className="text-label" style={{color:"hsla(192,100%,62%,0.6)",fontSize:"0.68rem"}}>MOTHER</label>
        <F label="MOTHER'S FULL NAME"><input name="motherName" value={form.motherName} onChange={hc} placeholder="Full name" className="input-cyber"/></F>
        <F label="MOTHER'S PHONE"><input name="motherPhone" value={form.motherPhone} onChange={hc} placeholder="+254-700-000-000" className="input-cyber"/></F>
        <div className="check-row">
          <Checkbox id="md" checked={motherDeceased} onCheckedChange={v=>setMotherDeceased(v===true)}/><label htmlFor="md">DECEASED</label>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <label className="font-display text-base font-bold tracking-wide" style={{color:"hsl(192,100%,68%)"}}>NEXT OF KIN</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <F label="FIRST NAME"><input value={kin.name} onChange={e=>setKin((p:any)=>({...p,name:e.target.value}))} placeholder="First name" className="input-cyber"/></F>
          <F label="SURNAME"><input value={kin.surname} onChange={e=>setKin((p:any)=>({...p,surname:e.target.value}))} placeholder="Last name" className="input-cyber"/></F>
        </div>
        <F label="PHONE NO."><input value={kin.phone} onChange={e=>setKin((p:any)=>({...p,phone:e.target.value}))} placeholder="+254-700-000-000" className="input-cyber"/></F>
        <F label="ADDRESS"><input value={kin.address} onChange={e=>setKin((p:any)=>({...p,address:e.target.value}))} placeholder="Full address" className="input-cyber"/></F>
        <F label="RELATION">
          <select value={kin.relation} onChange={e=>setKin((p:any)=>({...p,relation:e.target.value}))} className="input-cyber">
            <option value="">Select relation</option>
            {RELATION_OPTIONS.map(r=><option key={r}>{r}</option>)}
          </select>
        </F>
      </div>
    </div>
  );
};

/* STEP 3 — Education */
const StepEducation=({form,setForm,isStudent,setIsStudent,institutionType,setInstitutionType,uniLevel,setUniLevel,institutionName,setInstitutionName,department,setDepartment,studyYear,setStudyYear,grade,setGrade,isAlumni,setIsAlumni,alumni,setAlumni}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div className="space-y-5">
      <SectionHeader icon={GraduationCap} title="Educational Record"/>
      <div className="check-row">
        <Checkbox id="isStudent" checked={isStudent} onCheckedChange={v=>setIsStudent(v===true)}/><label htmlFor="isStudent">CURRENTLY A STUDENT</label>
      </div>
      <AnimatePresence>
        {isStudent&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
            className="space-y-4 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(192,100%,55%,0.35)"}}>
            <div>
              <label className="text-label" style={{color:"hsl(192,100%,65%)",fontSize:"0.68rem"}}>INSTITUTION TYPE</label>
              <div className="flex gap-3 mt-2">
                {(["college","university"] as const).map(t=>(
                  <button key={t} type="button" onClick={()=>{setInstitutionType(t);setUniLevel("");}}
                    className="flex-1 py-2.5 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                    style={ToggleStyle(institutionType===t)}>{t}</button>
                ))}
              </div>
            </div>
            {institutionType==="university"&&(
              <div>
                <label className="text-label" style={{color:"hsl(33,100%,70%)",fontSize:"0.68rem"}}>UNIVERSITY LEVEL</label>
                <div className="flex gap-3 mt-2">
                  {(["bachelor","master","phd"] as const).map(lvl=>(
                    <button key={lvl} type="button" onClick={()=>setUniLevel(lvl)}
                      className="flex-1 py-2.5 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                      style={ToggleStyle(uniLevel===lvl,33)}>
                      {lvl==="phd"?"PhD":lvl.charAt(0).toUpperCase()+lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <F label={institutionType==="university"?"UNIVERSITY NAME":"COLLEGE NAME"}>
                <input value={institutionName} onChange={e=>setInstitutionName(e.target.value)} placeholder="Institution name" className="input-cyber"/>
              </F>
              {institutionType==="university"&&<F label="DEPARTMENT"><input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="input-cyber"/></F>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <F label="STUDENT NUMBER"><input name="studentNo" value={form.studentNo||""} onChange={e=>setForm((p:any)=>({...p,studentNo:e.target.value}))} placeholder="e.g. STU/2024/001" className="input-cyber"/></F>
              <F label="YEAR OF STUDY"><input value={studyYear} onChange={e=>setStudyYear(e.target.value)} placeholder="e.g. Year 2" className="input-cyber"/></F>
            </div>
            {institutionType==="college"&&<F label="GRADE / GPA"><input value={grade} onChange={e=>setGrade(e.target.value)} placeholder="e.g. A, 3.8" className="input-cyber"/></F>}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pt-3 border-t" style={{borderColor:"hsla(192,60%,18%,0.3)"}}>
        <div className="check-row mb-4">
          <Checkbox id="isAlumni" checked={isAlumni} onCheckedChange={v=>setIsAlumni(v===true)}/>
          <label htmlFor="isAlumni" style={{color:"hsl(140,90%,68%)"}}>ALUMNI — GRADUATED</label>
        </div>
        <AnimatePresence>
          {isAlumni&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
              className="space-y-4 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(140,90%,50%,0.35)"}}>
              <div>
                <label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>GRADUATION LEVEL</label>
                <div className="flex gap-3 mt-2">
                  {(["bachelor","master","phd"] as const).map(lvl=>(
                    <button key={lvl} type="button" onClick={()=>setAlumni((p:any)=>({...p,level:lvl}))}
                      className="flex-1 py-2.5 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                      style={ToggleStyle(alumni.level===lvl,140)}>
                      {lvl==="phd"?"PhD":lvl.charAt(0).toUpperCase()+lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <F label="UNIVERSITY NAME"><input value={alumni.universityName} onChange={e=>setAlumni((p:any)=>({...p,universityName:e.target.value}))} placeholder="University" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></F>
                <F label="DEPARTMENT"><input value={alumni.department} onChange={e=>setAlumni((p:any)=>({...p,department:e.target.value}))} placeholder="Department" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></F>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <F label="START DATE"><DateInput value={alumni.startDate} onChange={v=>setAlumni((p:any)=>({...p,startDate:v}))} style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></F>
                <F label="END DATE"><DateInput value={alumni.endDate} onChange={v=>setAlumni((p:any)=>({...p,endDate:v}))} style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></F>
              </div>
              <F label="GPA / GRADE"><input value={alumni.gpa} onChange={e=>setAlumni((p:any)=>({...p,gpa:e.target.value}))} placeholder="e.g. 3.8 / A+" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></F>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <F label="PREVIOUS EDUCATION HISTORY">
        <textarea name="educationRecord" rows={4} value={form.educationRecord} onChange={hc} placeholder="Previous degrees, diplomas, institutions…" className="textarea-cyber"/>
      </F>
    </div>
  );
};

/* STEP 4 — Work */
const StepWork=({form,setForm,isWorking,setIsWorking,workInfo,setWorkInfo,cvFile,setCvFile,cvRef}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SectionHeader icon={Building2} title="Work Experience"/>
      <div className="check-row">
        <Checkbox id="isWorking" checked={isWorking} onCheckedChange={v=>setIsWorking(v===true)}/><label htmlFor="isWorking">CURRENTLY WORKING</label>
      </div>
      <AnimatePresence>
        {isWorking&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
            className="space-y-4 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(33,100%,52%,0.35)"}}>
            <F label="COMPANY NAME"><input value={workInfo.company} onChange={e=>setWorkInfo((p:any)=>({...p,company:e.target.value}))} placeholder="Company name" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></F>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <F label="EMPLOYER / MANAGER"><input value={workInfo.employer} onChange={e=>setWorkInfo((p:any)=>({...p,employer:e.target.value}))} placeholder="Name" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></F>
              <F label="DEPARTMENT"><input value={workInfo.department} onChange={e=>setWorkInfo((p:any)=>({...p,department:e.target.value}))} placeholder="Department" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></F>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <F label="PREVIOUS WORK EXPERIENCE">
        <textarea name="workExperience" rows={5} value={form.workExperience} onChange={hc} placeholder="Previous positions, companies, responsibilities…" className="textarea-cyber"/>
      </F>
      {/* CV Upload */}
      <div>
        <label className="text-label" style={{color:"hsl(192,100%,62%)",textShadow:"0 0 8px hsla(192,100%,52%,0.5)"}}>UPLOAD CV / RÉSUMÉ</label>
        <input ref={cvRef} type="file" accept=".pdf,.doc,.docx,.rtf,.txt" className="hidden"
          onChange={e=>{const f=e.target.files?.[0];if(f)setCvFile(f.name);e.target.value="";}}/>
        {cvFile
          ? <div className="flex items-center justify-between p-3 rounded-lg"
              style={{background:"hsla(192,100%,52%,0.07)",border:"1px solid hsla(192,100%,52%,0.32)"}}>
              <div className="flex items-center gap-2">
                <span style={{fontSize:18}}>📄</span>
                <span className="font-mono text-xs" style={{color:"hsl(192,60%,88%)"}}>{cvFile}</span>
              </div>
              <button onClick={()=>setCvFile(null)} className="font-hud text-[9px] tracking-widest px-2 py-1 rounded"
                style={{color:"hsl(0,80%,68%)",border:"1px solid hsla(0,80%,52%,0.3)"}}>✕ REMOVE</button>
            </div>
          : <button onClick={()=>cvRef.current?.click()}
              className="upload-zone w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg transition-all"
              style={{minHeight:80,border:"1.5px dashed hsla(192,80%,45%,0.38)",background:"hsla(215,55%,5%,0.5)"}}>
              <span style={{fontSize:28}}>📂</span>
              <span className="font-hud text-[10px] tracking-[0.2em]" style={{color:"hsla(192,80%,58%,0.55)"}}>CLICK TO UPLOAD CV / RÉSUMÉ</span>
              <span className="font-mono text-[8px]" style={{color:"hsla(192,60%,50%,0.35)"}}>PDF · DOC · DOCX · RTF · TXT</span>
            </button>
        }
      </div>
    </div>
  );
};

/* STEP 5 — Health & Records */
const StepHealth=({form,setForm,crimeFile,setCrimeFile,crimeRef}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SectionHeader icon={Activity} title="Health & Records"/>
      <F label="HEALTH RECORD">
        <textarea name="healthRecord" rows={3} value={form.healthRecord} onChange={hc} placeholder="Medical conditions, allergies, medications…" className="textarea-cyber"/>
      </F>
      <F label="HISTORY OF PRESENT ILLNESS">
        <textarea name="historyOfPresentIllness" rows={3} value={form.historyOfPresentIllness} onChange={hc} placeholder="Current illness, symptoms, onset, duration…" className="textarea-cyber"/>
      </F>
      <F label="CRIME RECORD">
        <textarea name="crimeRecord" rows={3} value={form.crimeRecord} onChange={hc} placeholder="None / details if applicable…" className="textarea-cyber"/>
      </F>
      <div>
        <input ref={crimeRef} type="file" accept=".pdf,image/*,.doc,.docx,.txt" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setCrimeFile(f.name);e.target.value="";}}/>
        <UploadBox label="Crime Record Document" file={crimeFile} onClear={()=>setCrimeFile(null)} onClick={()=>crimeRef.current?.click()}/>
      </div>
    </div>
  );
};

/* STEP 6 — Travel History */
const StepTravelHistory=({form,setForm}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SectionHeader icon={Globe} title="Travel History"/>
      <F label="TRAVEL HISTORY">
        <textarea name="travelHistory" rows={5} value={form.travelHistory||""} onChange={hc}
          placeholder={"List countries/regions visited with approximate dates:\n• Kenya → USA (Jan 2019 – Mar 2019)\n• UAE (Dec 2021)\n• UK (Jun 2023 – Aug 2023)…"}
          className="textarea-cyber"/>
      </F>
      <F label="ADDRESSES LIVED IN — LAST 10 YEARS">
        <textarea name="addressHistory" rows={5} value={form.addressHistory||""} onChange={hc}
          placeholder={"List all addresses you have lived at in the last 10 years:\n• 2015–2019: 12 Ngong Road, Nairobi, Kenya\n• 2019–2022: 45 Oak Avenue, London, UK\n• 2022–present: 8 Riverside Drive, Mombasa, Kenya…"}
          className="textarea-cyber"/>
      </F>
    </div>
  );
};

/* STEP 7 — Insurance (was STEP 6) */
const StepInsurance=({form,setForm,noInsurance,setNoInsurance,insuranceFile,setInsuranceFile,insuranceRef}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SectionHeader icon={Shield} title="Insurance"/>
      <AnimatePresence>
        {!noInsurance&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}}
            className="space-y-4 overflow-hidden">
            <F label="INSURANCE TYPE">
              <select name="insuranceType" value={form.insuranceType||""} onChange={hc} className="input-cyber">
                <option value="">Select insurance type</option>
                <option>Health / Medical</option>
                <option>Life</option>
                <option>Vehicle</option>
                <option>Home / Property</option>
                <option>Travel</option>
                <option>Education</option>
                <option>Business</option>
                <option>Other</option>
              </select>
            </F>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <F label="INSURANCE COMPANY"><input name="insuranceCompany" value={form.insuranceCompany||""} onChange={hc} placeholder="e.g. APA Insurance" className="input-cyber"/></F>
              <F label="POLICY NUMBER"><input name="insurancePolicyNo" value={form.insurancePolicyNo||""} onChange={hc} placeholder="Policy number" className="input-cyber"/></F>
            </div>
            <F label="VALIDITY DATE (EXPIRY)">
              <DateInput value={form.insuranceValidityDate||""} onChange={v=>setForm((p:any)=>({...p,insuranceValidityDate:v}))}/>
            </F>
            <div>
              <label className="text-label">UPLOAD INSURANCE DOCUMENT</label>
              <input ref={insuranceRef} type="file" accept=".pdf,image/*,.doc,.docx" className="hidden"
                onChange={e=>{const f=e.target.files?.[0];if(f)setInsuranceFile(f.name);e.target.value="";}}/>
              <UploadBox label="Insurance Document" file={insuranceFile} onClear={()=>setInsuranceFile(null)} onClick={()=>insuranceRef.current?.click()}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="check-row">
        <Checkbox id="noIns" checked={noInsurance} onCheckedChange={v=>setNoInsurance(v===true)}/>
        <label htmlFor="noIns">NO INSURANCE</label>
      </div>
    </div>
  );
};

/* STEP 7 — Emergency */
const StepEmergency=({ec1,setEc1,ec2,setEc2}:any)=>(
  <div className="space-y-5">
    <SectionHeader icon={AlertTriangle} title="Emergency Contacts"/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <label className="text-label" style={{color:"hsla(192,100%,62%,0.6)",fontSize:"0.68rem"}}>CONTACT 1</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="FULL NAME"><input value={ec1.name} onChange={e=>setEc1((p:any)=>({...p,name:e.target.value}))} placeholder="Full name" className="input-cyber"/></F>
        <F label="PHONE NO."><input value={ec1.phone} onChange={e=>setEc1((p:any)=>({...p,phone:e.target.value}))} placeholder="+254-700-000-000" className="input-cyber"/></F>
      </div>
    </div>
    <div className="space-y-4 pt-4 border-t" style={{borderColor:"hsla(192,60%,18%,0.3)"}}>
      <label className="text-label" style={{color:"hsla(192,100%,62%,0.6)",fontSize:"0.68rem"}}>CONTACT 2 (OPTIONAL)</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <F label="FULL NAME"><input value={ec2.name} onChange={e=>setEc2((p:any)=>({...p,name:e.target.value}))} placeholder="Full name" className="input-cyber"/></F>
        <F label="PHONE NO."><input value={ec2.phone} onChange={e=>setEc2((p:any)=>({...p,phone:e.target.value}))} placeholder="+254-700-000-000" className="input-cyber"/></F>
      </div>
    </div>
  </div>
);

/* STEP 7 — Social Media */
const StepSocial=({form,setForm}:any)=>{
  const hc=(e:any)=>setForm((p:any)=>({...p,[e.target.name]:e.target.value}));
  const platforms=[
    {key:"facebook", label:"FACEBOOK", placeholder:"facebook.com/username", color:"220,85%,62%", glow:"220,100%,68%", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>},
    {key:"instagram",label:"INSTAGRAM", placeholder:"@username", color:"320,85%,62%", glow:"320,100%,68%", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>},
    {key:"twitter",  label:"X / TWITTER",placeholder:"@handle", color:"0,0%,88%", glow:"0,0%,100%", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
    {key:"linkedin", label:"LINKEDIN", placeholder:"linkedin.com/in/name", color:"210,90%,58%", glow:"210,100%,65%", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>},
  ];
  return(
    <div className="space-y-5">
      <SectionHeader icon={Share2} title="Social Media Accounts"/>
      <p className="font-mono text-xs" style={{color:"hsla(192,100%,60%,0.5)"}}>All social media fields are optional.</p>
      <div className="grid grid-cols-2 gap-5">
        {platforms.map(({key,label,placeholder,color,glow,icon})=>(
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{background:`hsla(${color},0.14)`,border:`1.5px solid hsla(${color},0.38)`,color:`hsl(${glow})`}}>
                {icon}
              </div>
              <label className="text-label" style={{margin:0,color:`hsl(${glow})`}}>{label}</label>
            </div>
            <input name={key} value={form[key]||""} onChange={hc} placeholder={placeholder} className="input-cyber" style={{borderColor:`hsla(${color},0.35)`}}/>
          </div>
        ))}
      </div>
    </div>
  );
};

/* STEP 8 — Biometrics */
const ROLES_REG: {id:UserRole;label:string;desc:string;color:string}[] = [
  {id:"operator", label:"OPERATOR", desc:"Create, view & scan records",   color:"#f97316"},
  {id:"analyst",  label:"ANALYST",  desc:"Read-only, search & export",    color:"#06b6d4"},
  {id:"admin",    label:"ADMIN",    desc:"Full system access",             color:"#f87171"},
  {id:"owner",    label:"OWNER",    desc:"Highest authority, unrestricted",color:"#a78bfa"},
];

const StepBiometrics=({fingerStates,fingerHashes,handleScanFinger,allDone,onSubmit,
  acctCreate,setAcctCreate,acctUsername,setAcctUsername,acctPassword,setAcctPassword,
  acctConfirm,setAcctConfirm,acctRole,setAcctRole,showAcctPass,setShowAcctPass}:any)=>{
  const fd=(k:FingerKey)=>fingerStates[k]==="done";
  const fs=(k:FingerKey)=>fingerStates[k]==="scanning";
  const fb=(k:FingerKey)=>fd(k)?"hsla(185,100%,50%,0.7)":fs(k)?"hsla(33,100%,52%,0.7)":"hsla(192,100%,52%,0.18)";

  const inp:React.CSSProperties = {
    width:"100%", padding:"10px 14px", borderRadius:9,
    fontFamily:"'Courier New',monospace", fontSize:13,
    color:"#e8dcc8", background:"hsla(215,55%,4%,0.88)",
    border:"1.5px solid hsla(38,55%,32%,0.4)", outline:"none",
  };

  return(
    <div className="space-y-6">
      <SectionHeader icon={Fingerprint} title="Biometric Enrollment"/>
      <p className="font-mono text-xs" style={{color:"hsla(192,100%,60%,0.5)"}}>Tap each finger pad to scan. All 4 fingers required.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {FINGERS.map(({key,label})=>(
          <div key={key} className="flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] tracking-widest text-center" style={{color:"hsla(192,100%,62%,0.6)"}}>{label}</span>
            <motion.div
              className={`w-28 h-28 rounded-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${fs(key)?"scanner-pulse":""}`}
              style={{border:`1.5px solid ${fb(key)}`,background:"hsla(25,12%,6%,0.9)",boxShadow:fd(key)?"0 0 30px hsla(192,100%,55%,0.2)":fs(key)?"0 0 30px hsla(33,100%,52%,0.2)":"none"}}
              onClick={()=>handleScanFinger(key)} whileHover={fingerStates[key]==="idle"?{scale:1.05}:{}}>
              {["top-1.5 left-1.5 border-t border-l","top-1.5 right-1.5 border-t border-r","bottom-1.5 left-1.5 border-b border-l","bottom-1.5 right-1.5 border-b border-r"].map((cls,i)=>(
                <div key={i} className={`absolute w-3 h-3 ${cls}`} style={{borderColor:fb(key)}}/>
              ))}
              <Fingerprint className={`w-12 h-12 transition-all duration-500 ${fd(key)?"text-primary":fs(key)?"text-accent/60":"text-muted-foreground/20"}`}/>
              <span className="font-mono text-[8px] tracking-wider mt-1" style={{color:fd(key)?"hsl(192,100%,62%)":fs(key)?"hsl(33,100%,60%)":"hsla(192,80%,55%,0.4)"}}>
                {fd(key)?"CAPTURED":fs(key)?"SCANNING…":"TAP TO SCAN"}
              </span>
            </motion.div>
            {fingerHashes[key]&&<div className="font-mono text-[9px] tracking-wider px-2 py-1 rounded text-center w-full" style={{background:"hsla(38,85%,50%,0.07)",border:"1px solid hsla(38,85%,50%,0.18)",color:"hsl(192,100%,62%)"}}>{fingerHashes[key]}</div>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        {FINGERS.map(({key,short})=>(
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full transition-all" style={{background:fd(key)?"hsl(38,90%,62%)":fs(key)?"hsl(33,100%,52%)":"hsla(192,80%,40%,0.3)",boxShadow:fd(key)?"0 0 6px hsl(38,90%,62%)":"none"}}/>
            <span className="font-mono text-[9px] tracking-wider" style={{color:fd(key)?"hsl(192,100%,62%)":"hsla(38,60%,50%,0.4)"}}>{short}</span>
          </div>
        ))}
        <span className="font-mono text-[10px] ml-3" style={{color:allDone?"hsl(192,100%,62%)":"hsla(38,60%,50%,0.5)"}}>
          {FINGERS.filter(f=>fingerStates[f.key]==="done").length}/4 CAPTURED
        </span>
      </div>

      {/* ── SYSTEM ACCESS ACCOUNT ── */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1.5px solid hsla(195,100%,55%,0.4)",background:"hsla(195,100%,45%,0.05)"}}>
        {/* Header toggle */}
        <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
          style={{borderBottom: acctCreate ? "1px solid hsla(195,100%,55%,0.2)" : "none", background:"hsla(195,100%,45%,0.08)"}}
          onClick={()=>setAcctCreate(!acctCreate)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:"hsla(195,100%,50%,0.15)",border:"1.5px solid hsla(195,100%,55%,0.45)"}}>
              <Shield className="w-4 h-4" style={{color:"hsl(195,100%,72%)"}}/>
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-wider" style={{color:"hsl(195,100%,80%)"}}>SYSTEM ACCESS ACCOUNT</p>
              <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{color:"hsla(195,80%,65%,0.55)"}}>
                Create login credentials for this identity to access BIMS
              </p>
            </div>
          </div>
          {/* Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-[10px] font-bold tracking-wider" style={{color:acctCreate?"hsl(195,100%,72%)":"hsla(38,60%,50%,0.5)"}}>
              {acctCreate?"ENABLED":"DISABLED"}
            </span>
            <div className="w-11 h-6 rounded-full transition-all flex items-center px-0.5"
              style={{background:acctCreate?"hsla(195,100%,45%,0.4)":"hsla(0,0%,25%,0.4)",border:`1.5px solid ${acctCreate?"hsla(195,100%,55%,0.6)":"hsla(0,0%,35%,0.4)"}`}}>
              <div className="w-4 h-4 rounded-full transition-all" style={{background:acctCreate?"hsl(195,100%,72%)":"hsl(0,0%,55%)",transform:acctCreate?"translateX(20px)":"translateX(0)"}}/>
            </div>
          </div>
        </div>

        {/* Form fields — only when enabled */}
        {acctCreate && (
          <div className="p-5 space-y-4">
            {/* Username */}
            <div>
              <label className="font-mono text-[10px] font-bold tracking-[0.18em] block mb-1.5" style={{color:"hsla(195,80%,65%,0.7)"}}>
                LOGIN USERNAME * <span style={{color:"hsla(195,60%,60%,0.45)",fontWeight:400,letterSpacing:"0.08em"}}>— used when signing in to BIMS</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm" style={{color:"hsla(195,80%,60%,0.55)"}}>@</span>
                <input style={{...inp,paddingLeft:"1.75rem"}}
                  value={acctUsername}
                  onChange={e=>setAcctUsername(e.target.value.toLowerCase().replace(/\s/g,""))}
                  placeholder="e.g. john.smith"/>
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] font-bold tracking-[0.18em] block mb-1.5" style={{color:"hsla(195,80%,65%,0.7)"}}>PASSWORD *</label>
                <div className="relative">
                  <input style={{...inp,paddingRight:"2.5rem"}}
                    type={showAcctPass?"text":"password"}
                    value={acctPassword}
                    onChange={e=>setAcctPassword(e.target.value)}
                    placeholder="Min 4 characters"/>
                  <button type="button" onClick={()=>setShowAcctPass((v:boolean)=>!v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{background:"none",border:"none",cursor:"pointer",color:"hsla(195,60%,55%,0.5)",padding:0}}>
                    <Eye className={`w-3.5 h-3.5 ${showAcctPass?"opacity-100":"opacity-50"}`}/>
                  </button>
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] font-bold tracking-[0.18em] block mb-1.5" style={{color:"hsla(195,80%,65%,0.7)"}}>CONFIRM PASSWORD *</label>
                <input style={{...inp, borderColor: acctConfirm && acctConfirm!==acctPassword?"hsl(0,80%,55%)":"hsla(38,55%,32%,0.4)"}}
                  type="password"
                  value={acctConfirm}
                  onChange={e=>setAcctConfirm(e.target.value)}
                  placeholder="Re-enter password"/>
              </div>
            </div>
            {acctConfirm && acctConfirm!==acctPassword && (
              <p className="font-mono text-[10px] font-bold tracking-wider" style={{color:"hsl(0,80%,65%)"}}>✕ Passwords do not match</p>
            )}

            {/* Role selector */}
            <div>
              <label className="font-mono text-[10px] font-bold tracking-[0.18em] block mb-2" style={{color:"hsla(195,80%,65%,0.7)"}}>SYSTEM ROLE *</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES_REG.map(r=>{
                  const active = acctRole===r.id;
                  return(
                    <div key={r.id} onClick={()=>setAcctRole(r.id)}
                      className="p-3 rounded-xl cursor-pointer transition-all"
                      style={{border:active?`2px solid ${r.color}`:`1px solid ${r.color}44`,background:active?`${r.color}18`:`${r.color}08`}}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full border-2 transition-all flex-shrink-0"
                          style={{borderColor:r.color,background:active?r.color:"transparent"}}/>
                        <span className="font-mono text-[9px] font-bold tracking-widest" style={{color:r.color}}>{r.label}</span>
                      </div>
                      <p className="font-mono text-[10px]" style={{color:`${r.color}88`}}>{r.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {acctUsername && acctPassword && acctPassword===acctConfirm && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:"hsla(140,80%,45%,0.08)",border:"1px solid hsla(140,80%,50%,0.3)"}}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
                <p className="font-mono text-[10px] font-bold tracking-wider" style={{color:"#4ade80"}}>
                  ✓ ACCOUNT READY — @{acctUsername} will be created with {acctRole.toUpperCase()} access
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={onSubmit} disabled={!allDone}
        className="w-full h-14 rounded-xl font-display font-bold tracking-widest text-base flex items-center justify-center gap-3 transition-all"
        style={{
          background:allDone?"hsla(192,100%,52%,0.22)":"hsla(38,40%,20%,0.3)",
          border:`2px solid ${allDone?"hsla(192,100%,58%,0.7)":"hsla(38,50%,35%,0.3)"}`,
          color:allDone?"hsl(40,100%,88%)":"hsla(192,80%,55%,0.4)",
          boxShadow:allDone?"0 0 30px hsla(192,100%,55%,0.28)":"none",
          cursor:allDone?"pointer":"not-allowed",
        }}>
        <Fingerprint className="w-5 h-5"/>
        {allDone?"COMMIT RECORD TO DATABASE":"SCAN ALL FINGERS TO PROCEED"}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN REGISTRATION COMPONENT
═══════════════════════════════════════════════════════════ */
const Registration = () => {
  const navigate = useNavigate();
  const {toast}  = useToast();
  const [step, setStep] = useState(0);

  const photoRef       = useRef<HTMLInputElement>(null);
  const passportRef    = useRef<HTMLInputElement>(null);
  const licenseRef     = useRef<HTMLInputElement>(null);
  const crimeRef       = useRef<HTMLInputElement>(null);
  const insuranceRef   = useRef<HTMLInputElement>(null);
  const cvRef          = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const [passportFile, setPassportFile] = useState<string|null>(null);
  const [licenseFile,  setLicenseFile]  = useState<string|null>(null);
  const [crimeFile,    setCrimeFile]    = useState<string|null>(null);
  const [insuranceFile,setInsuranceFile]= useState<string|null>(null);
  const [cvFile,       setCvFile]       = useState<string|null>(null);
  const [noInsurance,  setNoInsurance]  = useState(false);
  const [modal, setModal] = useState<{title:string;src:string;isImg:boolean}|null>(null);

  const [fingerStates, setFingerStates] = useState<Record<FingerKey,"idle"|"scanning"|"done">>({rightThumb:"idle",rightIndex:"idle",leftThumb:"idle",leftIndex:"idle"});
  const [fingerHashes, setFingerHashes] = useState<Record<FingerKey,string|null>>({rightThumb:null,rightIndex:null,leftThumb:null,leftIndex:null});
  const allFingersScanned = FINGERS.every(f=>fingerStates[f.key]==="done");

  /* ── User Account Fields ── */
  const [acctUsername, setAcctUsername] = useState("");
  const [acctPassword, setAcctPassword] = useState("");
  const [acctConfirm,  setAcctConfirm]  = useState("");
  const [acctRole,     setAcctRole]     = useState<UserRole>("analyst");
  const [acctCreate,   setAcctCreate]   = useState(true);
  const [showAcctPass, setShowAcctPass] = useState(false);

  const handleScanFinger = useCallback((key:FingerKey)=>{
    if(fingerStates[key]!=="idle") return;
    setFingerStates(p=>({...p,[key]:"scanning"}));
    setTimeout(()=>{ setFingerHashes(p=>({...p,[key]:generateFingerprintHash()})); setFingerStates(p=>({...p,[key]:"done"})); },1200);
  },[fingerStates]);

  const [form, setForm] = useState({
    name:"",surname:"",gender:"",dateOfBirth:"",maritalStatus:"",
    email:"",phoneNo:"",whatsapp:"",address:"",bloodType:"",
    nationality:"",multinationality:"",placeOfBirth:"",siblings:"",nationalId:"",noNationalId:false,occupation:"",
    passportType:"",passportNo:"",passportIssueDate:"",passportExpiryDate:"",passportPlaceOfIssue:"",
    licenseNo:"",licenseIssueDate:"",licenseExpiryDate:"",licenseCountry:"",
    facebook:"",instagram:"",twitter:"",linkedin:"",
    fatherName:"",fatherPhone:"",motherName:"",motherPhone:"",
    healthRecord:"",historyOfPresentIllness:"",workExperience:"",crimeRecord:"",educationRecord:"",
    insuranceType:"",insuranceCompany:"",insurancePolicyNo:"",insuranceValidityDate:"",
    studentNo:"",travelHistory:"",addressHistory:"",
  });

  const [noPassport,     setNoPassport]     = useState(false);
  const [noLicense,      setNoLicense]      = useState(false);
  const [fatherDeceased, setFatherDeceased] = useState(false);
  const [motherDeceased, setMotherDeceased] = useState(false);
  const [isStudent,      setIsStudent]      = useState(false);
  const [institutionType,setInstitutionType]= useState<""|"college"|"university">("");
  const [uniLevel,       setUniLevel]       = useState<""|"bachelor"|"master"|"phd">("");
  const [institutionName,setInstitutionName]= useState("");
  const [department,     setDepartment]     = useState("");
  const [studyYear,      setStudyYear]      = useState("");
  const [grade,          setGrade]          = useState("");
  const [isAlumni,       setIsAlumni]       = useState(false);
  const [alumni,         setAlumni]         = useState<AlumniRecord>({level:"",universityName:"",department:"",startDate:"",endDate:"",gpa:""});
  const [isWorking,      setIsWorking]      = useState(false);
  const [workInfo,       setWorkInfo]       = useState({company:"",employer:"",department:""});
  const [ec1, setEc1] = useState({name:"",phone:""});
  const [ec2, setEc2] = useState({name:"",phone:""});
  const [kin, setKin] = useState({name:"",surname:"",phone:"",address:"",relation:""});

  const openAttach=(title:string,src:string)=>setModal({title,src,isImg:/^data:image|\.png|\.jpg|\.jpeg|\.gif|\.webp/i.test(src)});

  const goNext=()=>{
    setStep(s=>Math.min(s+1,STEPS.length-1));
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const goPrev=()=>{setStep(s=>Math.max(s-1,0));window.scrollTo({top:0,behavior:"smooth"});};

  const handleSubmit=()=>{
    if(!form.name||!form.surname){toast({title:"ERROR",description:"Name and surname required.",variant:"destructive"});return;}
    if(!allFingersScanned){toast({title:"ERROR",description:"All 4 fingerprints must be scanned.",variant:"destructive"});return;}

    /* Validate user account fields if creating an account */
    if(acctCreate){
      if(!acctUsername.trim()){toast({title:"ERROR",description:"Login username is required to create an account.",variant:"destructive"});return;}
      if(!acctPassword){toast({title:"ERROR",description:"Password is required.",variant:"destructive"});return;}
      if(acctPassword.length<4){toast({title:"ERROR",description:"Password must be at least 4 characters.",variant:"destructive"});return;}
      if(acctPassword!==acctConfirm){toast({title:"ERROR",description:"Passwords do not match.",variant:"destructive"});return;}
      const existingUsers=getUsers();
      if(existingUsers.find(u=>u.username===acctUsername.trim().toLowerCase())){
        toast({title:"ERROR",description:"Login username already taken. Choose another.",variant:"destructive"});return;
      }
    }

    const record:BiometricRecord={
      id:generateId(),...form,
      fatherDeceased,motherDeceased,
      isStudent,
      institutionType:isStudent?institutionType:"",
      uniLevel:isStudent&&institutionType==="university"?uniLevel:"",
      institutionName:isStudent?institutionName:"",
      department:isStudent&&institutionType==="university"?department:"",
      studyYear:isStudent?studyYear:"",
      grade:isStudent&&institutionType==="college"?grade:"",
      isAlumni,alumniRecord:isAlumni?alumni:undefined,
      isCurrentlyWorking:isWorking,
      currentWorkInfo:isWorking?workInfo:undefined,
      noPassport,noLicense,noInsurance,
      photo:photoPreview,
      passportFile:noPassport?null:passportFile,
      drivingLicenseFile:noLicense?null:licenseFile,
      crimeRecordFile:crimeFile,
      insuranceFile:noInsurance?null:insuranceFile,
      fingerHashes,fingerprintHash:fingerHashes.rightThumb||"",
      emergencyContact1:ec1,emergencyContact2:ec2,kin1:kin,
      registeredAt:new Date().toISOString(),
    };
    addRecord(record);

    /* Create system user account if requested */
    if(acctCreate && acctUsername.trim()){
      const allUsers = getUsers();
      const newUser = {
        id: `usr_${Math.random().toString(36).slice(2,10)}`,
        username: acctUsername.trim().toLowerCase(),
        password: acctPassword,
        role: acctRole,
        fullName: `${form.name} ${form.surname}`,
        email: form.email||"",
        createdAt: new Date().toISOString(),
        createdBy: "registration",
        active: true,
      };
      saveUsers([...allUsers, newUser]);
      toast({title:"RECORD & ACCOUNT CREATED",description:`ID: ${record.id} — @${newUser.username} (${acctRole.toUpperCase()})`});
    } else {
      toast({title:"RECORD COMMITTED",description:`ID: ${record.id} — ${record.surname}, ${record.name}`});
    }

    setTimeout(()=>navigate(`/result/${record.id}`),1000);
  };

  const stepProps={
    0:{component:<StepPersonal form={form} setForm={setForm} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview} photoRef={photoRef}/>},
    1:{component:<StepCredentials form={form} setForm={setForm} noPassport={noPassport} setNoPassport={setNoPassport} noLicense={noLicense} setNoLicense={setNoLicense} passportFile={passportFile} setPassportFile={setPassportFile} licenseFile={licenseFile} setLicenseFile={setLicenseFile} passportRef={passportRef} licenseRef={licenseRef} onView={openAttach}/>},
    2:{component:<StepFamily form={form} setForm={setForm} fatherDeceased={fatherDeceased} setFatherDeceased={setFatherDeceased} motherDeceased={motherDeceased} setMotherDeceased={setMotherDeceased} kin={kin} setKin={setKin}/>},
    3:{component:<StepEducation form={form} setForm={setForm} isStudent={isStudent} setIsStudent={setIsStudent} institutionType={institutionType} setInstitutionType={setInstitutionType} uniLevel={uniLevel} setUniLevel={setUniLevel} institutionName={institutionName} setInstitutionName={setInstitutionName} department={department} setDepartment={setDepartment} studyYear={studyYear} setStudyYear={setStudyYear} grade={grade} setGrade={setGrade} isAlumni={isAlumni} setIsAlumni={setIsAlumni} alumni={alumni} setAlumni={setAlumni}/>},
    4:{component:<StepWork form={form} setForm={setForm} isWorking={isWorking} setIsWorking={setIsWorking} workInfo={workInfo} setWorkInfo={setWorkInfo} cvFile={cvFile} setCvFile={setCvFile} cvRef={cvRef}/>},
    5:{component:<StepHealth form={form} setForm={setForm} crimeFile={crimeFile} setCrimeFile={setCrimeFile} crimeRef={crimeRef}/>},
    6:{component:<StepTravelHistory form={form} setForm={setForm}/>},
    7:{component:<StepInsurance form={form} setForm={setForm} noInsurance={noInsurance} setNoInsurance={setNoInsurance} insuranceFile={insuranceFile} setInsuranceFile={setInsuranceFile} insuranceRef={insuranceRef}/>},
    8:{component:<StepEmergency ec1={ec1} setEc1={setEc1} ec2={ec2} setEc2={setEc2}/>},
    9:{component:<StepSocial form={form} setForm={setForm}/>},
    10:{component:<StepBiometrics fingerStates={fingerStates} fingerHashes={fingerHashes} handleScanFinger={handleScanFinger} allDone={allFingersScanned} onSubmit={handleSubmit}
      acctCreate={acctCreate} setAcctCreate={setAcctCreate}
      acctUsername={acctUsername} setAcctUsername={setAcctUsername}
      acctPassword={acctPassword} setAcctPassword={setAcctPassword}
      acctConfirm={acctConfirm} setAcctConfirm={setAcctConfirm}
      acctRole={acctRole} setAcctRole={setAcctRole}
      showAcctPass={showAcctPass} setShowAcctPass={setShowAcctPass}/>},
  } as any;

  return(
    <div className="min-h-screen relative flex flex-col">
      <CyberBackground/>
      <AnimatePresence>{modal&&<AttachModal {...modal} onClose={()=>setModal(null)}/>}</AnimatePresence>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between sticky top-0 z-10" style={{padding:"7px 16px",background:"rgba(4,8,16,0.97)",borderBottom:"1px solid rgba(0,160,200,0.12)",backdropFilter:"blur(20px)"}}>
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate("/")} className="w-9 h-9 flex items-center justify-center rounded-lg transition-all" style={{color:"hsl(192,100%,62%)"}}
            onMouseEnter={e=>e.currentTarget.style.background="hsla(192,100%,52%,0.12)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center" style={{background:"hsla(192,100%,52%,0.08)"}}>
            <Shield className="w-4 h-4 text-primary"/>
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider text-foreground block leading-tight">NEW REGISTRATION</span>
            <span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(192,100%,62%,0.55)"}}>STEP {step+1} OF {STEPS.length} — {STEPS[step].label.toUpperCase()}</span>
          </div>
        </div>
        <span className="font-mono text-[10px] hidden md:block" style={{color:"hsla(192,100%,62%,0.4)"}}>CIVIL_REGISTRATION_v3</span>
      </div>

      {/* ── STEP PROGRESS ── */}
      <div className="sticky z-10" style={{top:"44px",padding:"5px 12px",background:"rgba(4,8,16,0.96)",borderBottom:"1px solid rgba(0,140,180,0.1)",backdropFilter:"blur(16px)"}}>
        <div className="flex items-center gap-1 overflow-x-auto max-w-5xl mx-auto pb-1">
          {STEPS.map((s,i)=>{
            const done=i<step, active=i===step;
            return(
              <React.Fragment key={s.id}>
                <button onClick={()=>i<step&&setStep(i)}
                  style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:2,flexShrink:0,fontFamily:"'Inter',sans-serif",fontSize:8.5,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase" as const,transition:"all 0.15s"}}
                  style={{
                    background:active?"hsla(192,100%,55%,0.18)":done?"hsla(140,80%,45%,0.12)":"hsla(38,30%,15%,0.4)",
                    border:active?"1.5px solid hsla(192,100%,55%,0.55)":done?"1.5px solid hsla(140,80%,45%,0.4)":"1.5px solid hsla(38,40%,22%,0.35)",
                    color:active?"hsl(38,90%,75%)":done?"hsl(210,100%,65%)":"hsla(38,50%,50%,0.5)",
                    cursor:i<step?"pointer":"default",
                  }}>
                  {done?<Check className="w-3 h-3"/>:<s.icon className="w-3 h-3"/>}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i+1}</span>
                </button>
                {i<STEPS.length-1&&<div className="w-4 h-px flex-shrink-0" style={{background:i<step?"hsla(140,80%,45%,0.4)":"hsla(38,40%,22%,0.3)"}}/>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 relative z-[1]">
        <div style={{maxWidth:"680px",margin:"0 auto",padding:"16px 16px"}}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.18}}
              className="card-surface rounded-sm" style={{padding:"16px 20px", boxShadow:"0 0 40px rgba(0,0,0,0.8)"}}>
              {stepProps[step]?.component}
            </motion.div>
          </AnimatePresence>

          {/* ── NAV BUTTONS ── */}
          {step<STEPS.length-1&&(
            <div className="flex items-center justify-between mt-5">
              <button onClick={goPrev} disabled={step===0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold tracking-widest text-sm transition-all"
                style={{
                  background:"hsla(25,12%,9%,0.7)",
                  border:"1.5px solid hsla(192,75%,35%,0.45)",
                  color:step===0?"hsla(38,50%,45%,0.3)":"hsl(38,80%,72%)",
                  cursor:step===0?"not-allowed":"pointer",
                }}>
                <ChevronLeft className="w-4 h-4"/> BACK
              </button>
              <div className="font-mono text-xs" style={{color:"hsla(192,80%,55%,0.5)"}}>
                {step+1} / {STEPS.length}
              </div>
              <button onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold tracking-widest text-sm transition-all"
                style={{
                  background:"hsla(192,100%,52%,0.2)",
                  border:"2px solid hsla(38,85%,58%,0.65)",
                  color:"hsl(40,100%,88%)",
                  boxShadow:"0 0 24px hsla(192,100%,55%,0.22)",
                }}>
                NEXT <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center px-6 py-1"
        style={{ background:"hsla(25,15%,5%,0.88)", backdropFilter:"blur(20px)", borderTop:"1px solid hsla(35,65%,38%,0.25)" }}>
        <div className="flex items-center gap-4 font-mono text-[9px] font-semibold">
          <span style={{ color:"hsla(192,90%,62%,0.75)" }}>BIMS v1.0 · © 2026 <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{ color:"hsl(192,100%,68%)", textDecoration:"underline", textUnderlineOffset:"3px", textShadow:"0 0 8px hsla(38,90%,62%,0.45)" }}>KUMI</a></span>
          <span className="w-1 h-1 rounded-full" style={{ background:"hsla(192,100%,55%,0.4)" }}/>
          <span style={{ color:"hsla(38,65%,58%,0.6)" }}>ENCRYPTED CHANNEL</span>
        </div>
      </div>
    </div>
  );
};

export default Registration;
