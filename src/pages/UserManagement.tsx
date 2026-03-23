import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, Users, Eye, EyeOff,
  CheckCircle, XCircle, User, Key, Mail
} from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import {
  getUsers, saveUsers, getCurrentUser, isAdmin,
  type BIMSUser, type UserRole
} from "@/pages/Login";
import { getRecords } from "@/lib/biometric-store";

const genId = () => "usr_" + Math.random().toString(36).slice(2, 10);
const ROLES: UserRole[] = ["owner", "admin", "operator", "analyst"];

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string; border: string; desc: string; perms: string[] }> = {
  owner:    { label:"OWNER",    color:"#c084fc", bg:"rgba(192,132,252,0.18)", border:"rgba(192,132,252,0.65)", desc:"Full ownership — unrestricted access",  perms:["Everything in Admin","Assign/revoke roles","Create owner accounts","Delete any record","System configuration","Full audit access"] },
  admin:    { label:"ADMIN",    color:"#f87171", bg:"rgba(248,113,113,0.18)",  border:"rgba(248,113,113,0.65)", desc:"Full system access",                   perms:["View all records","Create & edit records","Delete records","Run biometric scans","Manage users","Deep search","Export data","System settings"] },
  operator: { label:"OPERATOR", color:"#fb923c", bg:"rgba(251,146,60,0.18)",   border:"rgba(251,146,60,0.65)",  desc:"Operational access — no user mgmt",    perms:["View all records","Run biometric scans","Deep search","Export data","Create records"] },
  analyst:  { label:"ANALYST",  color:"#60a5fa", bg:"rgba(96,165,250,0.18)",   border:"rgba(96,165,250,0.65)",  desc:"View & analyse — no modifications",    perms:["View all records","Run biometric scans","Deep search","Export data"] },
};

const emptyForm = () => ({ loginUsername:"", fullName:"", email:"", password:"", confirmPass:"", role:"operator" as UserRole, active:true, biometricId:"" });

/* Find biometric record matching a name */
const findDbRecord = (name: string) => {
  if (!name.trim()) return null;
  const records = getRecords();
  const n = name.trim().toLowerCase();
  return records.find(r =>
    `${r.name} ${r.surname}`.toLowerCase().includes(n) ||
    `${r.surname} ${r.name}`.toLowerCase().includes(n) ||
    r.name.toLowerCase().includes(n) ||
    r.surname.toLowerCase().includes(n)
  ) || null;
};

const findDbMatches = (name: string) => {
  if (!name.trim() || name.trim().length < 2) return [];
  const records = getRecords();
  const n = name.trim().toLowerCase();
  return records.filter(r =>
    `${r.name} ${r.surname}`.toLowerCase().includes(n) ||
    `${r.surname} ${r.name}`.toLowerCase().includes(n) ||
    r.name.toLowerCase().includes(n) ||
    r.surname.toLowerCase().includes(n)
  ).slice(0, 5);
};

export default function UserManagement() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  useEffect(()=>{ if(!isAdmin()) navigate("/"); },[]);

  const [users,setUsers]     = useState<BIMSUser[]>([]);
  const [showForm,setShowForm] = useState(false);
  const [editTarget,setEdit]   = useState<BIMSUser|null>(null);
  const [form,setForm]         = useState(emptyForm());
  const [showPw,setShowPw]     = useState(false);
  const [showCpw,setShowCpw]   = useState(false);
  const [err,setErr]           = useState("");
  const [okMsg,setOkMsg]       = useState("");
  const [delTarget,setDel]     = useState<BIMSUser|null>(null);
  const [filter,setFilter]     = useState<UserRole|"all">("all");
  const [dbMatch,setDbMatch]   = useState<any>(null);
  const [dbMatches,setDbMatches] = useState<any[]>([]);

  useEffect(()=>{ setUsers(getUsers()); },[]);
  const refresh = ()=>setUsers(getUsers());

  const openCreate = ()=>{ setEdit(null); setForm(emptyForm()); setErr(""); setOkMsg(""); setDbMatch(null); setDbMatches([]); setShowForm(true); };
  const openEdit = (u:BIMSUser)=>{ setEdit(u); setForm({loginUsername:u.username,fullName:u.fullName,email:u.email||"",password:"",confirmPass:"",role:u.role,active:u.active}); setErr(""); setOkMsg(""); const m=findDbRecord(u.fullName); setDbMatch(m); setDbMatches(m?[m]:[]); setShowForm(true); };
  const closeForm = ()=>{ setShowForm(false); setEdit(null); setErr(""); setOkMsg(""); setDbMatch(null); setDbMatches([]); };
  const ic = (k:string,v:any)=>{
    setForm(p=>({...p,[k]:v}));
    if(k==="fullName"){ const m=findDbRecord(v); setDbMatch(m); setDbMatches(findDbMatches(v)); }
  };

  const selectDbRecord = (rec: any) => {
    setDbMatch(rec);
    setForm(p=>({ ...p, fullName: `${rec.name} ${rec.surname}` }));
    setDbMatches([]);
  };

  const save = ()=>{
    setErr("");
    if(!form.loginUsername.trim()){ setErr("Login username is required"); return; }
    if(!form.fullName.trim()){ setErr("Full name is required"); return; }
    const all = getUsers();
    if(editTarget){
      if(form.password && form.password!==form.confirmPass){ setErr("Passwords do not match"); return; }
      const dup = all.find(u=>u.username===form.loginUsername.trim().toLowerCase()&&u.id!==editTarget.id);
      if(dup){ setErr("Login username already taken"); return; }
      saveUsers(all.map(u=>u.id===editTarget.id?{...u,username:form.loginUsername.trim().toLowerCase(),fullName:form.fullName.trim(),email:form.email,role:form.role,active:form.active,...(form.password?{password:form.password}:{})}:u));
      setOkMsg("User updated"); setTimeout(()=>{ closeForm(); refresh(); },800);
    } else {
      // Must be registered in biometric database first
      const dbRecords = getRecords();
      const nameLower = form.fullName.trim().toLowerCase();
      const inDb = dbRecords.find(r =>
        `${r.name} ${r.surname}`.toLowerCase() === nameLower ||
        `${r.surname} ${r.name}`.toLowerCase() === nameLower ||
        `${r.name} ${r.surname}`.toLowerCase().includes(nameLower) ||
        nameLower.includes(r.name.toLowerCase()) && nameLower.includes(r.surname.toLowerCase())
      );
      if(!inDb){ setErr("Person must be registered in the biometric database first. Register them in 'New Registration' before creating a user account."); return; }
      if(!form.password){ setErr("Password is required"); return; }
      if(form.password.length<4){ setErr("Password must be at least 4 characters"); return; }
      if(form.password!==form.confirmPass){ setErr("Passwords do not match"); return; }
      if(all.find(u=>u.username===form.loginUsername.trim().toLowerCase())){ setErr("Login username already taken"); return; }
      saveUsers([...all,{id:genId(),username:form.loginUsername.trim().toLowerCase(),password:form.password,role:form.role,fullName:form.fullName.trim(),email:form.email,createdAt:new Date().toISOString(),createdBy:me?.username||"admin",active:true}]);
      setOkMsg("User created"); setTimeout(()=>{ closeForm(); refresh(); },800);
    }
  };

  const toggle = (u:BIMSUser)=>{ saveUsers(getUsers().map(x=>x.id===u.id?{...x,active:!x.active}:x)); refresh(); };
  const del = (u:BIMSUser)=>{ saveUsers(getUsers().filter(x=>x.id!==u.id)); setDel(null); refresh(); };
  const filtered = filter==="all"?users:users.filter(u=>u.role===filter);

  const mono:React.CSSProperties = {fontFamily:"'Courier New',monospace"};
  const inp:React.CSSProperties = {width:"100%",padding:"10px 14px",borderRadius:8,...mono,fontSize:13,color:"#e8dcc8",background:"rgba(8,15,30,0.85)",border:"1.5px solid rgba(203,178,120,0.25)",outline:"none"};
  const FL = ({label,children}:{label:string;children:React.ReactNode})=>(
    <div>
      <label style={{display:"block",...mono,fontSize:10,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.7)",marginBottom:6,textTransform:"uppercase" as const}}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column" as const,position:"relative",overflow:"hidden",...mono}}>
      <CyberBackground/>

      <PageHeader
        title="USER MANAGEMENT"
        subtitle="ACCESS CONTROL · ROLES · CREDENTIALS"
        icon={<Users size={16} style={{color:"hsl(192,100%,68%)"}}/>}
        rightContent={
          <>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.12em",
              padding:"5px 12px",borderRadius:8,background:"hsla(0,80%,52%,0.1)",
              border:"1px solid hsla(0,80%,52%,0.35)",color:"hsl(0,80%,70%)"}}>
              ADMIN: {me?.username?.toUpperCase()}
            </div>
            <button onClick={openCreate}
              style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Orbitron',monospace",
                fontSize:9,fontWeight:700,letterSpacing:"0.14em",padding:"8px 16px",borderRadius:9,
                background:"hsla(192,100%,52%,0.12)",border:"1.5px solid hsla(192,100%,55%,0.55)",
                color:"hsl(192,100%,72%)",cursor:"pointer",
                boxShadow:"0 0 16px hsla(192,100%,52%,0.2)",transition:"all .15s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.22)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.12)";}}>
              <Plus size={13}/> NEW USER
            </button>
          </>
        }
      />

      
    </div>
  );
}
