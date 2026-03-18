import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint, Shield, ArrowLeft, Upload, Camera, User, FileText,
  Clock, Heart, AlertTriangle, GraduationCap, Eye, X, Briefcase,
  Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";
import { addRecord, generateId, generateFingerprintHash, type BiometricRecord, type AlumniRecord } from "@/lib/biometric-store";
import { useToast } from "@/hooks/use-toast";

const RELATION_OPTIONS = ["Spouse","Parent","Sibling","Child","Grandparent","Aunt/Uncle","Cousin","Guardian","Friend","Other"];
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

type FingerKey = "rightThumb"|"rightIndex"|"leftThumb"|"leftIndex";
const FINGERS: {key:FingerKey;label:string;short:string}[] = [
  {key:"rightThumb",  label:"RIGHT THUMB",        short:"R.THUMB"},
  {key:"rightIndex",  label:"RIGHT INDEX FINGER",  short:"R.INDEX"},
  {key:"leftThumb",   label:"LEFT THUMB",          short:"L.THUMB"},
  {key:"leftIndex",   label:"LEFT INDEX FINGER",   short:"L.INDEX"},
];

/* ── Attachment viewer modal ── */
const AttachModal = ({title,src,isImg,onClose}:{title:string;src:string;isImg:boolean;onClose:()=>void}) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{background:"hsla(215,100%,4%,0.92)",backdropFilter:"blur(14px)"}} onClick={onClose}>
    <motion.div initial={{scale:0.92,y:16}} animate={{scale:1,y:0}} exit={{scale:0.92}}
      className="card-surface rounded-xl overflow-hidden max-w-xl w-full"
      style={{border:"1.5px solid hsla(185,100%,50%,0.35)",boxShadow:"0 0 60px hsla(185,100%,50%,0.15)"}}
      onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{borderColor:"hsla(185,60%,25%,0.35)",background:"hsla(185,100%,50%,0.06)"}}>
        <span className="font-mono text-xs font-bold tracking-widest" style={{color:"hsl(185,100%,65%)"}}>{title}</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10">
          <X className="w-4 h-4 text-primary"/>
        </button>
      </div>
      <div className="p-5 flex items-center justify-center min-h-40" style={{background:"hsla(185,80%,5%,0.9)"}}>
        {isImg
          ? <img src={src} alt={title} className="max-w-full max-h-80 object-contain rounded-lg"/>
          : <div className="text-center space-y-3">
              <FileText className="w-14 h-14 mx-auto" style={{color:"hsla(185,100%,50%,0.3)"}}/>
              <p className="font-mono text-sm font-semibold" style={{color:"hsl(185,60%,85%)"}}>{src}</p>
              <p className="font-mono text-xs" style={{color:"hsla(185,80%,60%,0.5)"}}>File uploaded — preview not available</p>
            </div>}
      </div>
    </motion.div>
  </motion.div>
);

const Registration = () => {
  const navigate = useNavigate();
  const {toast}  = useToast();
  const photoInputRef    = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef  = useRef<HTMLInputElement>(null);
  const attachInputRef   = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const [passportFile, setPassportFile] = useState<string|null>(null);
  const [licenseFile,  setLicenseFile]  = useState<string|null>(null);
  const [attachments,  setAttachments]  = useState<{name:string;src:string;isImg:boolean}[]>([]);
  const [modal, setModal] = useState<{title:string;src:string;isImg:boolean}|null>(null);

  /* Fingerprints */
  const [fingerStates, setFingerStates] = useState<Record<FingerKey,"idle"|"scanning"|"done">>({rightThumb:"idle",rightIndex:"idle",leftThumb:"idle",leftIndex:"idle"});
  const [fingerHashes, setFingerHashes] = useState<Record<FingerKey,string|null>>({rightThumb:null,rightIndex:null,leftThumb:null,leftIndex:null});
  const handleScanFinger = (key:FingerKey) => {
    if(fingerStates[key]!=="idle") return;
    setFingerStates(p=>({...p,[key]:"scanning"}));
    setTimeout(()=>{ setFingerHashes(p=>({...p,[key]:generateFingerprintHash()})); setFingerStates(p=>({...p,[key]:"done"})); },1200);
  };
  const allFingersScanned = FINGERS.every(f=>fingerStates[f.key]==="done");

  /* Form — fields in display order */
  const [form, setForm] = useState({
    // personal
    name:"", surname:"", gender:"", dateOfBirth:"", maritalStatus:"",
    email:"", phoneNo:"", whatsapp:"", address:"", bloodType:"",
    nationality:"", placeOfBirth:"", nationalId:"", occupation:"",
    // social media
    facebook:"", instagram:"", twitter:"", linkedin:"",
    // credentials
    passportNo:"", passportIssueDate:"", passportExpiryDate:"", passportPlaceOfIssue:"",
    // family
    fatherName:"", fatherPhone:"", motherName:"", motherPhone:"",
    // records
    healthRecord:"", historyOfPresentIllness:"", workExperience:"", crimeRecord:"", educationRecord:"",
  });
  const hc = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(p=>({...p,[e.target.name]:e.target.value}));

  const [fatherDeceased, setFatherDeceased] = useState(false);
  const [motherDeceased, setMotherDeceased] = useState(false);
  const [noPassport,     setNoPassport]     = useState(false);
  const [noLicense,      setNoLicense]      = useState(false);
  const [noNationalId,   setNoNationalId]   = useState(false);

  /* Education */
  const [isStudent,       setIsStudent]       = useState(false);
  const [institutionType, setInstitutionType] = useState<""|"college"|"university">("");
  const [uniLevel,        setUniLevel]        = useState<""|"bachelor"|"master"|"phd">("");
  const [institutionName, setInstitutionName] = useState("");
  const [department,      setDepartment]      = useState("");
  const [studyYear,       setStudyYear]       = useState("");
  const [grade,           setGrade]           = useState("");
  const [isAlumni,        setIsAlumni]        = useState(false);
  const [alumni,          setAlumni]          = useState<AlumniRecord>({level:"",universityName:"",department:"",startDate:"",endDate:"",gpa:""});

  /* Work */
  const [isWorking, setIsWorking] = useState(false);
  const [workInfo,  setWorkInfo]  = useState({company:"",employer:"",department:""});

  /* Emergency + Kin */
  const [ec1, setEc1] = useState({name:"",phone:""});
  const [ec2, setEc2] = useState({name:"",phone:""});
  const [kin, setKin] = useState({name:"",surname:"",phone:"",address:"",relation:""});

  const handleFileUpload = useCallback((e:React.ChangeEvent<HTMLInputElement>, type:"photo"|"passport"|"license"|"attachment") => {
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const r = reader.result as string;
      if(type==="photo") setPhotoPreview(r);
      else if(type==="passport") setPassportFile(file.name);
      else if(type==="license") setLicenseFile(file.name);
      else if(type==="attachment") {
        const isImg = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
        setAttachments(prev=>[...prev,{name:file.name,src:r,isImg}]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value="";
  },[]);

  const removeAttachment = (i:number) => setAttachments(prev=>prev.filter((_,idx)=>idx!==i));

  const openAttach = (title:string, src:string) => {
    setModal({title, src, isImg:/^data:image|\.png|\.jpg|\.jpeg|\.gif|\.webp/i.test(src)});
  };

  const handleSubmit = () => {
    if(!form.name||!form.surname){toast({title:"ERROR",description:"Name and surname are required.",variant:"destructive"});return;}
    if(!allFingersScanned){toast({title:"ERROR",description:"All 4 fingerprints must be scanned.",variant:"destructive"});return;}
    const record:BiometricRecord = {
      id: generateId(), ...form,
      fatherDeceased, motherDeceased,
      isStudent,
      institutionType: isStudent ? institutionType : "",
      uniLevel:        isStudent && institutionType==="university" ? uniLevel : "",
      institutionName: isStudent ? institutionName : "",
      department:      isStudent && institutionType==="university" ? department : "",
      studyYear:       isStudent ? studyYear : "",
      grade:           isStudent && institutionType==="college" ? grade : "",
      isAlumni, alumniRecord: isAlumni ? alumni : undefined,
      isCurrentlyWorking: isWorking,
      currentWorkInfo:    isWorking ? workInfo : undefined,
      noPassport, noLicense,
      photo:              photoPreview,
      passportFile:       noPassport ? null : passportFile,
      drivingLicenseFile: noLicense  ? null : licenseFile,
      fingerHashes, fingerprintHash: fingerHashes.rightThumb || "",
      emergencyContact1: ec1, emergencyContact2: ec2, kin1: kin,
      registeredAt: new Date().toISOString(),
    };
    addRecord(record);
    toast({title:"RECORD COMMITTED",description:`ID: ${record.id} — ${record.surname}, ${record.name}`});
    setTimeout(()=>navigate(`/result/${record.id}`), 1000);
  };

  /* ── UI helpers ── */
  const SH = ({icon:Icon,title}:{icon:any;title:string}) => (
    <div className="flex items-center gap-3 cyber-divider pb-3 mb-5">
      <div className="w-8 h-8 rounded border border-primary/25 flex items-center justify-center" style={{background:"hsla(185,100%,50%,0.08)"}}>
        <Icon className="w-4 h-4 text-primary"/>
      </div>
      <h2 className="font-display text-base font-semibold text-foreground tracking-wide">{title}</h2>
    </div>
  );

  const F = ({label,children}:{label:string;children:React.ReactNode}) => (
    <div><label className="text-label">{label}</label>{children}</div>
  );

  const Sel = ({name,value,children}:{name:string;value:string;children:React.ReactNode}) => (
    <select name={name} value={value} onChange={hc} className="input-cyber">{children}</select>
  );

  const Inp = ({name,value,placeholder,type="text"}:{name:string;value:string;placeholder?:string;type?:string}) => (
    <input name={name} value={value} onChange={hc} placeholder={placeholder} type={type} className="input-cyber"/>
  );

  const ViewBtn = ({onClick}:{onClick:()=>void}) => (
    <button onClick={onClick} className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider px-2 py-1 rounded"
      style={{border:"1px solid hsla(185,100%,50%,0.35)",background:"hsla(185,100%,50%,0.08)",color:"hsl(185,100%,65%)"}}>
      <Eye className="w-3 h-3"/> VIEW
    </button>
  );

  const ToggleBtn = (active:boolean, hue:number) => ({
    fontSize:"0.8rem",
    border:      active ? `2px solid hsl(${hue},100%,55%)` : `1.5px solid hsla(${hue},70%,55%,0.45)`,
    background:  active ? `hsla(${hue},100%,50%,0.2)` : "hsla(218,55%,11%,0.85)",
    color:       active ? `hsl(${hue},100%,82%)` : `hsl(${hue},70%,72%)`,
    boxShadow:   active ? `0 0 18px hsla(${hue},100%,50%,0.25)` : "none",
  });

  const fd   = (k:FingerKey) => fingerStates[k]==="done";
  const fs   = (k:FingerKey) => fingerStates[k]==="scanning";
  const fb   = (k:FingerKey) => fd(k)?"hsla(185,100%,50%,0.7)":fs(k)?"hsla(33,100%,52%,0.7)":"hsla(185,100%,50%,0.18)";

  const Card = ({children, delay=0}:{children:React.ReactNode;delay?:number}) => (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:delay*0.4,duration:0.2}}
      className="card-surface rounded-lg p-6 space-y-4">
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen relative flex flex-col">
      <CyberBackground/>
      <AnimatePresence>{modal && <AttachModal {...modal} onClose={()=>setModal(null)}/>}</AnimatePresence>

      {/* ── HEADER ── */}
      <div className="cyber-header flex items-center justify-between px-8 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={()=>navigate("/")}><ArrowLeft className="w-4 h-4"/></Button>
          <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center" style={{background:"hsla(185,100%,50%,0.08)"}}>
            <Shield className="w-4 h-4 text-primary"/>
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider text-foreground block leading-tight">NEW REGISTRATION</span>
            <span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,65%,0.6)"}}>CIVIL IDENTITY ENROLLMENT SYSTEM</span>
          </div>
        </div>
        <span className="font-mono text-[10px] hidden md:block" style={{color:"hsla(185,100%,65%,0.4)"}}>FORM_TYPE: CIVIL_REGISTRATION_v3</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-[1] w-full flex-1">

        {/* ══════════════════════════════════════════
            ROW 1 — PERSONAL INFO · CREDENTIALS · FAMILY
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── 01 PERSONAL INFORMATION ── */}
          <Card delay={0.08}>
            <SH icon={User} title="PERSONAL INFORMATION"/>

            {/* 1. Name */}
            <div className="grid grid-cols-2 gap-3">
              <F label="NAME"><Inp name="name" value={form.name} placeholder="First name"/></F>
              <F label="SURNAME"><Inp name="surname" value={form.surname} placeholder="Last name"/></F>
            </div>

            {/* 2. Gender */}
            <F label="GENDER">
              <Sel name="gender" value={form.gender}>
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </Sel>
            </F>

            {/* 3. Date of Birth */}
            <F label="DATE OF BIRTH"><Inp name="dateOfBirth" value={form.dateOfBirth} type="date"/></F>

            {/* 4. Marital Status */}
            <F label="MARITAL STATUS">
              <Sel name="maritalStatus" value={form.maritalStatus}>
                <option value="">Select status</option>
                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </Sel>
            </F>

            {/* 5. Email */}
            <F label="EMAIL"><Inp name="email" value={form.email} type="email" placeholder="email@domain.com"/></F>

            {/* 6. Phone Number */}
            <F label="PHONE NUMBER"><Inp name="phoneNo" value={form.phoneNo} placeholder="+1-000-000-0000"/></F>

            {/* 6b. WhatsApp */}
            <div>
              <label className="text-label" style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{color:"hsl(142,70%,50%)"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WHATSAPP NUMBER
              </label>
              <Inp name="whatsapp" value={(form as any).whatsapp||""} placeholder="+1-000-000-0000"/>
            </div>

            {/* 7. Address */}
            <F label="ADDRESS">
              <textarea name="address" value={form.address} onChange={hc} rows={2} placeholder="Full residential address" className="textarea-cyber"/>
            </F>

            {/* 8. Blood Type */}
            <F label="BLOOD TYPE">
              <Sel name="bloodType" value={form.bloodType}>
                <option value="">Select blood type</option>
                {BLOOD_TYPES.map(bt=><option key={bt}>{bt}</option>)}
              </Sel>
            </F>

            {/* 9. Nationality */}
            <F label="NATIONALITY"><Inp name="nationality" value={form.nationality} placeholder="e.g. Somali, Kenyan"/></F>

            {/* 10. Place of Birth */}
            <F label="PLACE OF BIRTH"><Inp name="placeOfBirth" value={form.placeOfBirth} placeholder="City, Country"/></F>

            {/* 11. National ID */}
            <div className="space-y-2">
              <F label="NATIONAL ID">
                <Inp name="nationalId" value={noNationalId ? "" : form.nationalId} placeholder={noNationalId ? "N/A — No National ID" : "ID number"}/>
              </F>
              <div className="check-row" onClick={()=>{ setNoNationalId(!noNationalId); if(!noNationalId) setForm(p=>({...p,nationalId:""})); }}>
                <Checkbox id="noNationalId" checked={noNationalId}
                  onCheckedChange={v=>{ setNoNationalId(v===true); if(v===true) setForm(p=>({...p,nationalId:""})); }}/>
                <label htmlFor="noNationalId">NO NATIONAL ID</label>
              </div>
            </div>

            {/* 12. Occupation */}
            <F label="OCCUPATION"><Inp name="occupation" value={form.occupation} placeholder="Job title"/></F>

            {/* 13. Profile Photo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-label" style={{margin:0}}>PROFILE PHOTO</label>
                {photoPreview && <ViewBtn onClick={()=>openAttach("PROFILE PHOTO", photoPreview)}/>}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFileUpload(e,"photo")}/>
              <div className="upload-zone h-36 flex-col gap-2 cursor-pointer" onClick={()=>photoInputRef.current?.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="Subject" className="w-full h-full object-cover rounded"/>
                  : <><Camera className="w-7 h-7 text-primary/30"/><span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,60%,0.45)"}}>CLICK TO UPLOAD PHOTO</span></>}
              </div>
            </div>
          </Card>

          {/* ── 02 CREDENTIALS ── */}
          <Card delay={0.16}>
            <SH icon={FileText} title="CREDENTIALS"/>

            {/* Passport */}
            <div className="check-row" onClick={()=>{setNoPassport(!noPassport);if(!noPassport)setPassportFile(null);}}>
              <Checkbox id="noPassport" checked={noPassport} onCheckedChange={v=>{setNoPassport(v===true);if(v===true)setPassportFile(null);}}/><label htmlFor="noPassport">NO PASSPORT</label>
            </div>
            <AnimatePresence>
              {!noPassport && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.22}} className="space-y-3 overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-label" style={{margin:0}}>PASSPORT UPLOAD</label>
                      {passportFile && <ViewBtn onClick={()=>openAttach("PASSPORT SCAN", passportFile)}/>}
                    </div>
                    <input ref={passportInputRef} type="file" className="hidden" onChange={e=>handleFileUpload(e,"passport")}/>
                    <div className="upload-zone h-12" onClick={()=>passportInputRef.current?.click()}>
                      {passportFile ? <span className="font-mono text-xs text-primary">{passportFile}</span>
                        : <><Upload className="w-4 h-4 mr-2 text-primary/40"/><span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,60%,0.45)"}}>UPLOAD PASSPORT SCAN</span></>}
                    </div>
                  </div>
                  <F label="PASSPORT NO."><Inp name="passportNo" value={form.passportNo} placeholder="X00000000"/></F>
                  <F label="PLACE OF ISSUE"><Inp name="passportPlaceOfIssue" value={form.passportPlaceOfIssue} placeholder="City / Country of issue"/></F>
                  <div className="grid grid-cols-2 gap-3">
                    <F label="ISSUE DATE"><Inp name="passportIssueDate" value={form.passportIssueDate} type="date"/></F>
                    <F label="EXPIRY DATE"><Inp name="passportExpiryDate" value={form.passportExpiryDate} type="date"/></F>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Driving License */}
            <div className="space-y-2">
              <label className="text-label">DRIVING LICENSE</label>
              <div className="check-row" onClick={()=>{setNoLicense(!noLicense);if(!noLicense)setLicenseFile(null);}}>
                <Checkbox id="noLicense" checked={noLicense} onCheckedChange={v=>{setNoLicense(v===true);if(v===true)setLicenseFile(null);}}/><label htmlFor="noLicense">NO DRIVING LICENSE</label>
              </div>
              <AnimatePresence>
                {!noLicense && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span/>
                      {licenseFile && <ViewBtn onClick={()=>openAttach("DRIVING LICENSE", licenseFile)}/>}
                    </div>
                    <input ref={licenseInputRef} type="file" className="hidden" onChange={e=>handleFileUpload(e,"license")}/>
                    <div className="upload-zone h-12" onClick={()=>licenseInputRef.current?.click()}>
                      {licenseFile ? <span className="font-mono text-xs text-primary">{licenseFile}</span>
                        : <><Upload className="w-4 h-4 mr-2 text-primary/40"/><span className="font-mono text-[10px] tracking-widest" style={{color:"hsla(185,100%,60%,0.45)"}}>UPLOAD LICENSE SCAN</span></>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* ── 03 FAMILY INFORMATION + NEXT OF KIN ── */}
          <Card delay={0.24}>
            <SH icon={Heart} title="FAMILY INFORMATION"/>

            {/* Father */}
            <div className="space-y-3 pb-4 border-b" style={{borderColor:"hsla(185,50%,20%,0.3)"}}>
              <label className="text-label" style={{color:"hsla(185,100%,65%,0.6)",fontSize:"0.68rem"}}>FATHER</label>
              <F label="FATHER'S NAME"><Inp name="fatherName" value={form.fatherName} placeholder="Full name"/></F>
              <F label="FATHER'S PHONE"><Inp name="fatherPhone" value={form.fatherPhone} placeholder="+1-000-000-0000"/></F>
              <div className="check-row" onClick={()=>setFatherDeceased(!fatherDeceased)}>
                <Checkbox id="fd" checked={fatherDeceased} onCheckedChange={v=>setFatherDeceased(v===true)}/><label htmlFor="fd">DECEASED</label>
              </div>
            </div>

            {/* Mother */}
            <div className="space-y-3 pb-4 border-b" style={{borderColor:"hsla(185,50%,20%,0.3)"}}>
              <label className="text-label" style={{color:"hsla(185,100%,65%,0.6)",fontSize:"0.68rem"}}>MOTHER</label>
              <F label="MOTHER'S NAME"><Inp name="motherName" value={form.motherName} placeholder="Full name"/></F>
              <F label="MOTHER'S PHONE"><Inp name="motherPhone" value={form.motherPhone} placeholder="+1-000-000-0000"/></F>
              <div className="check-row" onClick={()=>setMotherDeceased(!motherDeceased)}>
                <Checkbox id="md" checked={motherDeceased} onCheckedChange={v=>setMotherDeceased(v===true)}/><label htmlFor="md">DECEASED</label>
              </div>
            </div>

            {/* Next of Kin */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display text-base font-bold tracking-wide" style={{color:"hsl(185,100%,72%)"}}>NEXT OF KIN</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="NAME"><input value={kin.name} onChange={e=>setKin({...kin,name:e.target.value})} placeholder="First name" className="input-cyber"/></F>
                <F label="SURNAME"><input value={kin.surname} onChange={e=>setKin({...kin,surname:e.target.value})} placeholder="Last name" className="input-cyber"/></F>
              </div>
              <F label="PHONE NO."><input value={kin.phone} onChange={e=>setKin({...kin,phone:e.target.value})} placeholder="+1-000-000-0000" className="input-cyber"/></F>
              <F label="ADDRESS"><input value={kin.address} onChange={e=>setKin({...kin,address:e.target.value})} placeholder="Full address" className="input-cyber"/></F>
              <F label="RELATION">
                <select value={kin.relation} onChange={e=>setKin({...kin,relation:e.target.value})} className="input-cyber">
                  <option value="">Select relation</option>
                  {RELATION_OPTIONS.map(r=><option key={r}>{r}</option>)}
                </select>
              </F>
            </div>
          </Card>
        </div>

        {/* ══════════════════════════════════════════
            ROW 2 — EDUCATIONAL RECORD (full width)
        ══════════════════════════════════════════ */}
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.30}}
          className="mt-5 card-surface rounded-lg p-6 space-y-5">
          <SH icon={GraduationCap} title="EDUCATIONAL RECORD"/>

          {/* Currently a student */}
          <div className="check-row w-fit" onClick={()=>{setIsStudent(!isStudent);if(isStudent){setInstitutionType("");setUniLevel("");setInstitutionName("");setDepartment("");setStudyYear("");setGrade("")}}}>
            <Checkbox id="isStudent" checked={isStudent} onCheckedChange={v=>{setIsStudent(v===true);if(!v){setInstitutionType("");setUniLevel("");setInstitutionName("");setDepartment("");setStudyYear("");setGrade("")}}}/><label htmlFor="isStudent">CURRENTLY A STUDENT</label>
          </div>

          <AnimatePresence>
            {isStudent && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.25}}
                className="space-y-5 pt-2 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(185,100%,50%,0.35)"}}>
                <div>
                  <label className="text-label" style={{color:"hsl(185,100%,70%)",fontSize:"0.68rem"}}>INSTITUTION TYPE</label>
                  <div className="flex gap-3 mt-2">
                    {(["college","university"] as const).map(t=>(
                      <button key={t} type="button" onClick={()=>{setInstitutionType(t);setUniLevel("");}}
                        className="flex-1 py-3 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                        style={ToggleBtn(institutionType===t,185)}>{t.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <AnimatePresence>
                  {institutionType==="university" && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
                      <label className="text-label" style={{color:"hsl(33,100%,70%)",fontSize:"0.68rem"}}>UNIVERSITY LEVEL</label>
                      <div className="flex gap-3 mt-2">
                        {(["bachelor","master","phd"] as const).map(lvl=>(
                          <button key={lvl} type="button" onClick={()=>setUniLevel(lvl)}
                            className="flex-1 py-3 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                            style={ToggleBtn(uniLevel===lvl,33)}>
                            {lvl==="phd"?"PhD":lvl.charAt(0).toUpperCase()+lvl.slice(1)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className={institutionType==="university"?"grid grid-cols-2 gap-4":""}>
                  <div>
                    <label className="text-label" style={{color:"hsl(185,100%,70%)",fontSize:"0.68rem"}}>{institutionType==="university"?"UNIVERSITY NAME":"COLLEGE NAME"}</label>
                    <input value={institutionName} onChange={e=>setInstitutionName(e.target.value)} placeholder="Institution name" className="input-cyber mt-1.5"/>
                  </div>
                  {institutionType==="university" && (
                    <div>
                      <label className="text-label" style={{color:"hsl(185,100%,70%)",fontSize:"0.68rem"}}>DEPARTMENT</label>
                      <input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="input-cyber mt-1.5"/>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label" style={{color:"hsl(185,100%,70%)",fontSize:"0.68rem"}}>{institutionType==="university"?"YEAR OF STUDY":"GRADE / YEAR"}</label>
                    <input value={studyYear} onChange={e=>setStudyYear(e.target.value)} placeholder="e.g. Year 2" className="input-cyber mt-1.5"/>
                  </div>
                  {institutionType==="college" && (
                    <div>
                      <label className="text-label" style={{color:"hsl(185,100%,70%)",fontSize:"0.68rem"}}>GRADE / GPA</label>
                      <input value={grade} onChange={e=>setGrade(e.target.value)} placeholder="e.g. A, 3.8 GPA" className="input-cyber mt-1.5"/>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alumni */}
          <div className="pt-2 border-t" style={{borderColor:"hsla(185,50%,20%,0.3)"}}>
            <div className="check-row w-fit mb-4" onClick={()=>{setIsAlumni(!isAlumni);if(isAlumni)setAlumni({level:"",universityName:"",department:"",startDate:"",endDate:"",gpa:""})}}>
              <Checkbox id="isAlumni" checked={isAlumni} onCheckedChange={v=>{setIsAlumni(v===true);if(!v)setAlumni({level:"",universityName:"",department:"",startDate:"",endDate:"",gpa:""})}}/>
              <label htmlFor="isAlumni" style={{color:"hsl(140,90%,68%)"}}>ALUMNI — GRADUATED FROM UNIVERSITY</label>
            </div>
            <AnimatePresence>
              {isAlumni && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.25}}
                  className="space-y-4 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(140,90%,50%,0.35)"}}>
                  <div>
                    <label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>GRADUATION LEVEL</label>
                    <div className="flex gap-3 mt-2">
                      {(["bachelor","master","phd"] as const).map(lvl=>(
                        <button key={lvl} type="button" onClick={()=>setAlumni({...alumni,level:lvl})}
                          className="flex-1 py-3 rounded-lg font-mono font-bold tracking-widest uppercase transition-all"
                          style={ToggleBtn(alumni.level===lvl,140)}>
                          {lvl==="phd"?"PhD":lvl.charAt(0).toUpperCase()+lvl.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>UNIVERSITY NAME</label>
                      <input value={alumni.universityName} onChange={e=>setAlumni({...alumni,universityName:e.target.value})} placeholder="University name" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></div>
                    <div><label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>DEPARTMENT</label>
                      <input value={alumni.department} onChange={e=>setAlumni({...alumni,department:e.target.value})} placeholder="Department" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>START DATE</label>
                      <input type="date" value={alumni.startDate} onChange={e=>setAlumni({...alumni,startDate:e.target.value})} className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></div>
                    <div><label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>END DATE</label>
                      <input type="date" value={alumni.endDate} onChange={e=>setAlumni({...alumni,endDate:e.target.value})} className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></div>
                    <div><label className="text-label" style={{color:"hsl(140,90%,68%)",fontSize:"0.68rem"}}>GPA / GRADE</label>
                      <input value={alumni.gpa} onChange={e=>setAlumni({...alumni,gpa:e.target.value})} placeholder="e.g. 3.8" className="input-cyber" style={{borderColor:"hsla(140,80%,45%,0.45)"}}/></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Previous education history */}
          <F label="PREVIOUS EDUCATION HISTORY">
            <textarea name="educationRecord" rows={3} value={form.educationRecord} onChange={hc}
              placeholder="Previous degrees, diplomas, institutions and years attended…" className="textarea-cyber"/>
          </F>
        </motion.div>

        {/* ══════════════════════════════════════════
            ROW 3 — WORK EXPERIENCE · HEALTH & RECORDS · EMERGENCY
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

          {/* ── 04 WORK EXPERIENCE ── */}
          <Card delay={0.34}>
            <SH icon={Briefcase} title="WORK EXPERIENCE"/>

            {/* Currently working toggle */}
            <div className="check-row" onClick={()=>setIsWorking(!isWorking)}>
              <Checkbox id="isWorking" checked={isWorking} onCheckedChange={v=>setIsWorking(v===true)}/>
              <label htmlFor="isWorking">CURRENTLY WORKING</label>
            </div>

            <AnimatePresence>
              {isWorking && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.22}}
                  className="space-y-3 pl-4 overflow-hidden" style={{borderLeft:"2px solid hsla(33,100%,52%,0.35)"}}>
                  <div><label className="text-label" style={{color:"hsl(33,100%,68%)",fontSize:"0.68rem"}}>COMPANY NAME</label>
                    <input value={workInfo.company} onChange={e=>setWorkInfo({...workInfo,company:e.target.value})} placeholder="Company name" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-label" style={{color:"hsl(33,100%,68%)",fontSize:"0.68rem"}}>EMPLOYER / MANAGER</label>
                      <input value={workInfo.employer} onChange={e=>setWorkInfo({...workInfo,employer:e.target.value})} placeholder="Employer name" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></div>
                    <div><label className="text-label" style={{color:"hsl(33,100%,68%)",fontSize:"0.68rem"}}>DEPARTMENT</label>
                      <input value={workInfo.department} onChange={e=>setWorkInfo({...workInfo,department:e.target.value})} placeholder="Department" className="input-cyber" style={{borderColor:"hsla(33,80%,45%,0.45)"}}/></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <F label="PREVIOUS WORK EXPERIENCE">
              <textarea name="workExperience" rows={5} value={form.workExperience} onChange={hc}
                placeholder="Previous positions, companies, durations, responsibilities…" className="textarea-cyber"/>
            </F>
          </Card>

          {/* ── 05 HEALTH & RECORDS ── */}
          <Card delay={0.40}>
            <SH icon={Clock} title="HEALTH & RECORDS"/>
            <F label="HEALTH RECORD">
              <textarea name="healthRecord" rows={3} value={form.healthRecord} onChange={hc}
                placeholder="Medical conditions, allergies, medications, disabilities…" className="textarea-cyber"/>
            </F>
            <F label="HISTORY OF PRESENT ILLNESS">
              <textarea name="historyOfPresentIllness" rows={3} value={form.historyOfPresentIllness} onChange={hc}
                placeholder="Describe any current or recent illness, symptoms, onset, duration…" className="textarea-cyber"/>
            </F>
            <F label="CRIME RECORD">
              <textarea name="crimeRecord" rows={3} value={form.crimeRecord} onChange={hc}
                placeholder="None / details if applicable…" className="textarea-cyber"/>
            </F>
          </Card>

          {/* ── 06 EMERGENCY CONTACT ── */}
          <Card delay={0.46}>
            <SH icon={AlertTriangle} title="EMERGENCY CONTACT"/>
            <div className="space-y-3">
              <label className="text-label" style={{fontSize:"0.68rem",color:"hsla(185,100%,65%,0.6)"}}>CONTACT 1</label>
              <div className="grid grid-cols-2 gap-3">
                <F label="NAME"><input value={ec1.name} onChange={e=>setEc1({...ec1,name:e.target.value})} placeholder="Full name" className="input-cyber"/></F>
                <F label="PHONE NO."><input value={ec1.phone} onChange={e=>setEc1({...ec1,phone:e.target.value})} placeholder="+1-000-000-0000" className="input-cyber"/></F>
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t" style={{borderColor:"hsla(185,50%,20%,0.3)"}}>
              <label className="text-label" style={{fontSize:"0.68rem",color:"hsla(185,100%,65%,0.6)"}}>CONTACT 2</label>
              <div className="grid grid-cols-2 gap-3">
                <F label="NAME"><input value={ec2.name} onChange={e=>setEc2({...ec2,name:e.target.value})} placeholder="Full name" className="input-cyber"/></F>
                <F label="PHONE NO."><input value={ec2.phone} onChange={e=>setEc2({...ec2,phone:e.target.value})} placeholder="+1-000-000-0000" className="input-cyber"/></F>
              </div>
            </div>
          </Card>
        </div>

        {/* ══════════════════════════════════════════
            SOCIAL MEDIA ACCOUNTS (full width)
        ══════════════════════════════════════════ */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.2}}
          className="mt-5 card-surface rounded-lg p-6">
          <div className="flex items-center gap-3 cyber-divider pb-3 mb-6">
            <div className="w-8 h-8 rounded border border-primary/25 flex items-center justify-center" style={{background:"hsla(185,100%,50%,0.08)"}}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </div>
            <h2 className="font-display text-base font-semibold text-foreground tracking-wide">SOCIAL MEDIA ACCOUNTS</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                key:"facebook", label:"FACEBOOK", placeholder:"facebook.com/username",
                color:"220,85%,62%", glow:"220,100%,65%",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              },
              {
                key:"instagram", label:"INSTAGRAM", placeholder:"@username",
                color:"320,85%,62%", glow:"320,100%,68%",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              },
              {
                key:"twitter", label:"X / TWITTER", placeholder:"@handle",
                color:"0,0%,88%", glow:"0,0%,100%",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              },
              {
                key:"linkedin", label:"LINKEDIN", placeholder:"linkedin.com/in/name",
                color:"210,90%,58%", glow:"210,100%,65%",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              },
            ].map(({key,label,placeholder,color,glow,icon})=>(
              <div key={key}>
                {/* Big icon badge + label */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      background:`hsla(${color},0.13)`,
                      border:`1.5px solid hsla(${color},0.38)`,
                      color:`hsl(${glow})`,
                      boxShadow:`0 0 14px hsla(${color},0.15)`,
                    }}>
                    {icon}
                  </div>
                  <label className="text-label" style={{
                    margin:0, color:`hsl(${glow})`,
                    textShadow:`0 0 8px hsla(${color},0.4)`,
                  }}>{label}</label>
                </div>
                <input name={key} value={(form as any)[key]||""} onChange={hc}
                  placeholder={placeholder} className="input-cyber"
                  style={{borderColor:`hsla(${color},0.35)`}}/>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            ROW 4 — BIOMETRIC ENROLLMENT
        ══════════════════════════════════════════ */}
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.52}} className="mt-5 card-surface rounded-lg p-8">
          <SH icon={Fingerprint} title="BIOMETRIC ENROLLMENT"/>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
            {FINGERS.map(({key,label})=>(
              <div key={key} className="flex flex-col items-center gap-3">
                <span className="font-mono text-[10px] tracking-widest text-center" style={{color:"hsla(185,100%,65%,0.6)"}}>{label}</span>
                <motion.div
                  className={`w-28 h-28 rounded-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${fs(key)?"scanner-pulse":""}`}
                  style={{border:`1.5px solid ${fb(key)}`,background:"hsla(185,80%,5%,0.9)",boxShadow:fd(key)?"0 0 30px hsla(185,100%,50%,0.2)":fs(key)?"0 0 30px hsla(33,100%,52%,0.2)":"none"}}
                  onClick={()=>handleScanFinger(key)} whileHover={fingerStates[key]==="idle"?{scale:1.05}:{}}>
                  {["top-1.5 left-1.5 border-t border-l","top-1.5 right-1.5 border-t border-r","bottom-1.5 left-1.5 border-b border-l","bottom-1.5 right-1.5 border-b border-r"].map((cls,i)=>(
                    <div key={i} className={`absolute w-3 h-3 ${cls}`} style={{borderColor:fb(key)}}/>
                  ))}
                  <Fingerprint className={`w-12 h-12 transition-all duration-500 ${fd(key)?"text-primary":fs(key)?"text-accent/60":"text-muted-foreground/20"}`}/>
                  <span className="font-mono text-[8px] tracking-wider mt-1" style={{color:fd(key)?"hsl(185,100%,60%)":fs(key)?"hsl(33,100%,60%)":"hsla(185,60%,55%,0.4)"}}>
                    {fd(key)?"CAPTURED":fs(key)?"SCANNING…":"TAP TO SCAN"}
                  </span>
                </motion.div>
                {fingerHashes[key]&&<div className="font-mono text-[9px] tracking-wider px-2 py-1 rounded text-center w-full" style={{background:"hsla(185,100%,50%,0.07)",border:"1px solid hsla(185,100%,50%,0.18)",color:"hsl(185,100%,60%)"}}>{fingerHashes[key]}</div>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            {FINGERS.map(({key,short})=>(
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full transition-all" style={{background:fd(key)?"hsl(185,100%,50%)":fs(key)?"hsl(33,100%,52%)":"hsla(185,60%,40%,0.3)",boxShadow:fd(key)?"0 0 6px hsl(185,100%,50%)":"none"}}/>
                <span className="font-mono text-[9px] tracking-wider" style={{color:fd(key)?"hsl(185,100%,60%)":"hsla(185,60%,50%,0.4)"}}>{short}</span>
              </div>
            ))}
            <span className="font-mono text-[10px] ml-3" style={{color:allFingersScanned?"hsl(185,100%,60%)":"hsla(185,60%,50%,0.5)"}}>
              {FINGERS.filter(f=>fd(f.key)).length}/4 CAPTURED
            </span>
          </div>
          <Button variant="scanner" size="xl" className="w-full max-w-md mx-auto block" onClick={handleSubmit} disabled={!allFingersScanned}>
            {allFingersScanned ? "COMMIT RECORD TO DATABASE" : `SCAN ALL FINGERS TO PROCEED (${FINGERS.filter(f=>fd(f.key)).length}/4)`}
          </Button>
        </motion.div>

      </div>

      <div className="relative z-[1] py-4 text-center border-t" style={{borderColor:"hsla(185,60%,20%,0.3)"}}>
        <span className="font-mono text-[11px] tracking-widest" style={{color:"hsla(185,100%,60%,0.3)"}}>© 2026 KUMI — BIOMETRIC IDENTITY MANAGEMENT SYSTEM — ALL RIGHTS RESERVED</span>
      </div>
    </div>
  );
};

export default Registration;
