import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, Users, Eye, EyeOff,
  CheckCircle, XCircle, User, Key, Mail
} from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getUsers, saveUsers, getCurrentUser, isAdmin, type BIMSUser, type UserRole } from "@/lib/auth";
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
  const inp:React.CSSProperties = {width:"100%",padding:"10px 14px",borderRadius:8,...mono,fontSize:13,color:"#e8dcc8",background:"rgba(8,15,30,0.72)",border:"1.5px solid rgba(203,178,120,0.25)",outline:"none"};
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
        icon={<Users size={16} style={{color:"hsl(193,100%,68%)"}}/>}
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
                color:"hsl(193,100%,72%)",cursor:"pointer",
                boxShadow:"0 0 16px hsla(192,100%,52%,0.2)",transition:"all .15s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.22)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.12)";}}>
              <Plus size={13}/> NEW USER
            </button>
          </>
        }
      />

      {/* BODY */}
      <div style={{flex:1,padding:"24px 28px 72px",position:"relative",zIndex:1,maxWidth:1000,width:"100%",margin:"0 auto"}}>

        {/* Filter tabs */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" as const}}>
          {(["all",...ROLES] as const).map(r=>{
            const isAll=r==="all";
            const col=isAll?"#e8c870":ROLE_META[r as UserRole].color;
            const count=isAll?users.length:users.filter(u=>u.role===r).length;
            const active=filter===r;
            return(
              <button key={r} onClick={()=>setFilter(r)} style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-start",padding:"12px 18px",borderRadius:12,cursor:"pointer",...mono,transition:"all .18s",minWidth:90,border:active?`2px solid ${col}`:`1.5px solid ${col}66`,background:active?`${col}28`:`${col}14`}}
                onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLButtonElement).style.background=`${col}14`;}}
                onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLButtonElement).style.background=`${col}08`;}}>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:active?col:`${col}88`,marginBottom:4}}>{r==="all"?"ALL USERS":ROLE_META[r as UserRole].label}</span>
                <span style={{fontSize:26,fontWeight:700,color:col,lineHeight:1}}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{borderRadius:16,overflow:"hidden",border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.78)",marginBottom:24}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.72)"}}>
            {["USER","ROLE","STATUS","ACTIONS"].map(h=>(
              <span key={h} style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>{h}</span>
            ))}
          </div>
          {filtered.length===0?(
            <div style={{padding:"48px",textAlign:"center"}}>
              <Users size={32} style={{color:"rgba(203,178,120,0.15)",margin:"0 auto 12px",display:"block"}}/>
              <div style={{fontSize:12,letterSpacing:"0.2em",color:"rgba(203,178,120,0.3)"}}>NO USERS FOUND</div>
            </div>
          ):filtered.map((u,idx)=>{
            const rm=ROLE_META[u.role];
            const isMe=u.id===me?.id;
            return(
              <motion.div key={u.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:idx*0.04}}
                style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(203,178,120,0.2)",transition:"background .15s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.1)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:11,background:rm.bg,border:`1.5px solid ${rm.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:rm.color,flexShrink:0}}>
                    {(u.fullName||u.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:14,fontWeight:700,color:"#e8dcc8",letterSpacing:"0.04em"}}>{u.fullName||u.username}</span>
                      {isMe&&<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",padding:"2px 7px",borderRadius:5,background:"rgba(232,200,112,0.14)",border:"1px solid rgba(232,200,112,0.38)",color:"#e8c870"}}>YOU</span>}
                    </div>
                    <div style={{fontSize:11,color:"rgba(203,178,120,0.5)",marginTop:2,letterSpacing:"0.06em"}}>@{u.username}{u.email?` · ${u.email}`:""}</div>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.14em",padding:"4px 10px",borderRadius:7,background:rm.bg,border:`1px solid ${rm.border}`,color:rm.color,display:"inline-block"}}>{rm.label}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:u.active?"#4ade80":"#6b7280",boxShadow:u.active?"0 0 8px #4ade80":"none"}}/>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",color:u.active?"#4ade80":"rgba(203,178,120,0.35)"}}>{u.active?"ACTIVE":"DISABLED"}</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>openEdit(u)} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(232,200,112,0.3)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(232,200,112,0.65)",transition:"all .15s",...mono}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(232,200,112,0.14)";(e.currentTarget as HTMLButtonElement).style.color="#e8c870";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color="rgba(232,200,112,0.65)";}}>
                    <Pencil size={13}/>
                  </button>
                  <button onClick={()=>toggle(u)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${u.active?"rgba(248,113,113,0.3)":"rgba(74,222,128,0.3)"}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:u.active?"rgba(248,113,113,0.65)":"rgba(74,222,128,0.65)",transition:"all .15s",...mono}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=u.active?"rgba(248,113,113,0.12)":"rgba(74,222,128,0.12)";(e.currentTarget as HTMLButtonElement).style.color=u.active?"#f87171":"#4ade80";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color=u.active?"rgba(248,113,113,0.65)":"rgba(74,222,128,0.65)";}}>
                    {u.active?<XCircle size={13}/>:<CheckCircle size={13}/>}
                  </button>
                  {!isMe&&(
                    <button onClick={()=>setDel(u)} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(248,113,113,0.22)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(248,113,113,0.5)",transition:"all .15s",...mono}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(248,113,113,0.12)";(e.currentTarget as HTMLButtonElement).style.color="#f87171";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color="rgba(248,113,113,0.5)";}}>
                      <Trash2 size={13}/>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Role legend */}
        <div style={{borderRadius:14,border:"1.5px solid rgba(203,178,120,0.35)",background:"rgba(12,22,45,0.78)",padding:"20px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.6)",marginBottom:16}}>ROLE PERMISSION REFERENCE</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {ROLES.map(r=>{
              const rm=ROLE_META[r];
              return(
                <div key={r} style={{padding:"14px 16px",borderRadius:10,background:rm.bg,border:`1px solid ${rm.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.16em",padding:"3px 9px",borderRadius:6,background:`${rm.color}20`,border:`1px solid ${rm.color}55`,color:rm.color}}>{rm.label}</span>
                    <span style={{fontSize:12,color:`${rm.color}cc`,letterSpacing:"0.04em"}}>{rm.desc}</span>
                  </div>
                  {rm.perms.map(p=>(
                    <div key={p} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"rgba(220,200,160,0.85)",marginBottom:5,letterSpacing:"0.03em"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:rm.color,flexShrink:0}}/>
                      {p}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {showForm&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"36px 16px",overflowY:"auto",background:"rgba(4,8,20,0.82)",backdropFilter:"blur(10px)"}}>
            <motion.div initial={{scale:0.93,y:24}} animate={{scale:1,y:0}} exit={{scale:0.93,y:24}} transition={{type:"spring",damping:24,stiffness:300}}
              style={{width:"100%",maxWidth:520,borderRadius:20,overflow:"hidden",border:"1px solid rgba(232,200,112,0.35)",background:"linear-gradient(160deg,rgba(14,22,45,0.78) 0%,rgba(8,14,30,0.78) 100%)",boxShadow:"0 0 0 1px rgba(232,200,112,0.08),0 32px 80px rgba(0,0,0,0.78),0 0 60px rgba(232,200,112,0.06)",marginBottom:32}}>

              {/* Modal Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 28px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(232,200,112,0.1)",border:"1px solid rgba(232,200,112,0.3)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(232,200,112,0.08)"}}>
                    {editTarget?<Pencil size={16} style={{color:"#e8c870"}}/>:<Plus size={16} style={{color:"#e8c870"}}/>}
                  </div>
                  <div>
                    <div style={{fontSize:17,fontWeight:700,letterSpacing:"0.03em",color:"#f5e6b8",fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif"}}>
                      {editTarget?"Edit User Account":"Create New User"}
                    </div>
                    <div style={{fontSize:12,color:"rgba(203,178,120,0.45)",marginTop:3,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",fontWeight:400}}>
                      {editTarget?`Modifying @${editTarget.username}`:"Fill in the user details below"}
                    </div>
                  </div>
                </div>
                <button onClick={closeForm}
                  style={{width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",cursor:"pointer",color:"rgba(203,178,120,0.5)",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",transition:"all .15s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.09)";(e.currentTarget as HTMLButtonElement).style.color="rgba(203,178,120,0.9)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)";(e.currentTarget as HTMLButtonElement).style.color="rgba(203,178,120,0.5)";}}>
                  ✕
                </button>
              </div>

              {/* Form */}
              <div style={{padding:"24px 28px 28px",display:"flex",flexDirection:"column" as const,gap:18}}>

                {/* PICK FROM DATABASE — shown only when creating, not editing */}
                {!editTarget && (
                  <div>
                    <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"rgba(203,178,120,0.75)",marginBottom:7,fontFamily:"'Courier New',monospace",textTransform:"uppercase" as const}}>
                      SELECT FROM BIOMETRIC DATABASE
                    </label>
                    <div style={{position:"relative"}}>
                      <User size={14} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"rgba(203,178,120,0.35)",zIndex:1,pointerEvents:"none"}}/>
                      <input
                        value={dbMatch ? `${dbMatch.name} ${dbMatch.surname}` : form.fullName}
                        onChange={e=>{
                          const v = e.target.value;
                          setDbMatch(null);
                          setForm(p=>({...p, fullName:v, email:""}));
                          setDbMatches(findDbMatches(v));
                        }}
                        placeholder="Search by name…"
                        style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:11,
                          background:dbMatch?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.04)",
                          border:`1.5px solid ${dbMatch?"rgba(74,222,128,0.55)":"rgba(255,255,255,0.1)"}`,
                          color:"#f0e8d5",fontSize:14,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",outline:"none",
                          boxSizing:"border-box" as const,transition:"all .15s"}}
                        onFocus={e=>{if(!dbMatch){e.currentTarget.style.borderColor="rgba(232,200,112,0.55)";e.currentTarget.style.background="rgba(232,200,112,0.04)";}}}
                        onBlur={e=>{if(!dbMatch){e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}}
                      />
                      {dbMatch && (
                        <button onClick={()=>{setDbMatch(null);setForm(p=>({...p,fullName:"",email:""}));setDbMatches([]);}}
                          style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(74,222,128,0.6)",fontSize:16,lineHeight:1,padding:2}}
                          title="Clear selection">✕</button>
                      )}
                    </div>

                    {/* Dropdown suggestions */}
                    {!dbMatch && dbMatches.length > 0 && (
                      <div style={{marginTop:4,borderRadius:10,overflow:"hidden",border:"1px solid rgba(203,178,120,0.28)",background:"rgba(8,15,32,0.78)",boxShadow:"0 8px 24px rgba(0,0,0,0.7)",zIndex:100,position:"relative"}}>
                        <div style={{padding:"6px 12px 5px",background:"rgba(203,178,120,0.06)",borderBottom:"1px solid rgba(203,178,120,0.14)"}}>
                          <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.5)",fontFamily:"'Courier New',monospace"}}>BIOMETRIC DATABASE — SELECT PERSON</span>
                        </div>
                        {dbMatches.map((rec,i)=>(
                          <div key={rec.id}
                            onClick={()=>{
                              setDbMatch(rec);
                              setForm(p=>({...p, fullName:`${rec.name} ${rec.surname}`, email:rec.email||p.email}));
                              setDbMatches([]);
                            }}
                            style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderBottom:i<dbMatches.length-1?"1px solid rgba(203,178,120,0.08)":"none",cursor:"pointer",transition:"background .12s"}}
                            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.07)"}
                            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                            {rec.photo
                              ? <img src={rec.photo} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover",border:"1px solid rgba(203,178,120,0.35)",flexShrink:0}}/>
                              : <div style={{width:36,height:36,borderRadius:8,background:"rgba(203,178,120,0.1)",border:"1px solid rgba(203,178,120,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"rgba(203,178,120,0.7)",flexShrink:0}}>{rec.name?.charAt(0).toUpperCase()}</div>}
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:700,color:"#e8dcc8"}}>{rec.name} {rec.surname}</div>
                              <div style={{fontSize:10,color:"rgba(203,178,120,0.5)",fontFamily:"'Courier New',monospace",display:"flex",gap:8}}>
                                <span>{rec.id}</span>
                                {rec.nationality&&<span>· {rec.nationality}</span>}
                                {rec.email&&<span>· {rec.email}</span>}
                              </div>
                            </div>
                            <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"3px 8px",borderRadius:5,background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",color:"#4ade80",fontFamily:"'Courier New',monospace"}}>SELECT</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected profile card */}
                    {dbMatch && (
                      <div style={{marginTop:8,borderRadius:12,overflow:"hidden",border:"1.5px solid rgba(74,222,128,0.42)",background:"rgba(74,222,128,0.04)"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 14px",background:"rgba(74,222,128,0.08)",borderBottom:"1px solid rgba(74,222,128,0.18)"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
                          <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"#4ade80",fontFamily:"'Courier New',monospace"}}>✓ RECORD SELECTED — FIELDS AUTO-FILLED</span>
                          <span style={{marginLeft:"auto",fontSize:9,color:"rgba(74,222,128,0.5)",fontFamily:"'Courier New',monospace"}}>{dbMatch.id}</span>
                        </div>
                        <div style={{display:"flex",gap:12,padding:"12px 14px"}}>
                          {dbMatch.photo
                            ? <img src={dbMatch.photo} alt="" style={{width:56,height:56,borderRadius:9,objectFit:"cover",border:"1.5px solid rgba(74,222,128,0.42)",flexShrink:0}}/>
                            : <div style={{width:56,height:56,borderRadius:9,background:"rgba(74,222,128,0.1)",border:"1.5px solid rgba(74,222,128,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#4ade80",flexShrink:0}}>{dbMatch.name?.charAt(0).toUpperCase()}</div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:700,color:"#e8dcc8",marginBottom:3}}>{dbMatch.name} {dbMatch.surname}</div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 10px"}}>
                              {[["EMAIL",dbMatch.email||"—"],["PHONE",dbMatch.phoneNo||"—"],["NATIONALITY",dbMatch.nationality||"—"],["DOB",dbMatch.dateOfBirth||"—"]].map(([l,v])=>(
                                <div key={l}><span style={{fontSize:7,fontWeight:700,letterSpacing:"0.16em",color:"rgba(74,222,128,0.42)",fontFamily:"'Courier New',monospace"}}>{l} </span><span style={{fontSize:9,color:"rgba(220,200,160,0.8)",fontFamily:"'Courier New',monospace"}}>{v}</span></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!dbMatch && form.fullName.trim().length > 1 && dbMatches.length === 0 && (
                      <div style={{marginTop:7,display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:10,border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.05)"}}>
                        <span style={{color:"#f87171",fontSize:12}}>⚠</span>
                        <span style={{fontSize:11,fontWeight:700,color:"#f87171",fontFamily:"'Courier New',monospace",letterSpacing:"0.05em"}}>NOT FOUND — register this person in biometric database first</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit mode: show full name & email as normal editable fields */}
                {editTarget && (
                  <>
                    <div>
                      <label style={{display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:"rgba(203,178,120,0.65)",marginBottom:7,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",textTransform:"uppercase" as const}}>Full Name</label>
                      <div style={{position:"relative"}}>
                        <User size={14} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"rgba(203,178,120,0.35)"}}/>
                        <input value={form.fullName} onChange={e=>ic("fullName",e.target.value)} placeholder="e.g. John Smith"
                          style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0e8d5",fontSize:14,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",outline:"none",boxSizing:"border-box" as const}}
                          onFocus={e=>{e.currentTarget.style.borderColor="rgba(232,200,112,0.5)";}}
                          onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}/>
                      </div>
                    </div>
                    <div>
                      <label style={{display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:"rgba(203,178,120,0.65)",marginBottom:7,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",textTransform:"uppercase" as const}}>Email <span style={{fontWeight:400,letterSpacing:0,textTransform:"none" as const,color:"rgba(203,178,120,0.35)"}}>— optional</span></label>
                      <div style={{position:"relative"}}>
                        <Mail size={14} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"rgba(203,178,120,0.35)"}}/>
                        <input type="email" value={form.email} onChange={e=>ic("email",e.target.value)} placeholder="user@domain.com"
                          style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0e8d5",fontSize:14,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",outline:"none",boxSizing:"border-box" as const}}
                          onFocus={e=>{e.currentTarget.style.borderColor="rgba(232,200,112,0.5)";}}
                          onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}/>
                      </div>
                    </div>
                  </>
                )}

                {/* Role */}
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:"rgba(203,178,120,0.65)",marginBottom:10,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",textTransform:"uppercase" as const}}>Role & Permissions</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {ROLES.map(r=>{
                      const rm=ROLE_META[r];
                      const active=form.role===r;
                      return(
                        <div key={r} onClick={()=>ic("role",r)}
                          style={{padding:"14px 16px",borderRadius:12,cursor:"pointer",border:active?`1.5px solid ${rm.color}55`:"1px solid rgba(255,255,255,0.08)",background:active?rm.bg:"rgba(255,255,255,0.02)",transition:"all .18s",boxShadow:active?`0 0 20px ${rm.color}14`:"none"}}
                          onMouseEnter={e=>{if(!active){(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.05)";(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.14)";}}}
                          onMouseLeave={e=>{if(!active){(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.02)";(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.08)";}}}
                        >
                          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
                            <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${active?rm.color:rm.color+"66"}`,background:active?rm.color:"transparent",flexShrink:0,transition:"all .18s",boxShadow:active?`0 0 8px ${rm.color}88`:"none"}}/>
                            <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.08em",color:active?rm.color:`${rm.color}aa`,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif"}}>{rm.label}</span>
                          </div>
                          <div style={{fontSize:11,color:active?`${rm.color}99`:"rgba(203,178,120,0.3)",lineHeight:1.5,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",fontWeight:400}}>{rm.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Passwords */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[
                    {label:editTarget?"New Password":"Password",key:"password",val:form.password,show:showPw,setShow:setShowPw,ph:editTarget?"Leave blank to keep":"Min. 4 characters"},
                    {label:"Confirm Password",key:"confirmPass",val:form.confirmPass,show:showCpw,setShow:setShowCpw,ph:"Re-enter password"},
                  ].map(f=>(
                    <div key={f.key}>
                      <label style={{display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:"rgba(203,178,120,0.65)",marginBottom:7,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",textTransform:"uppercase" as const}}>{f.label}</label>
                      <div style={{position:"relative"}}>
                        <Key size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"rgba(203,178,120,0.32)"}}/>
                        <input type={f.show?"text":"password"} value={f.val} onChange={e=>ic(f.key,e.target.value)} placeholder={f.ph}
                          style={{width:"100%",padding:"12px 36px 12px 38px",borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0e8d5",fontSize:14,fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",outline:"none",boxSizing:"border-box" as const,transition:"border-color .15s"}}
                          onFocus={e=>{e.currentTarget.style.borderColor="rgba(232,200,112,0.5)";e.currentTarget.style.background="rgba(232,200,112,0.04)";}}
                          onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}/>
                        <button onClick={()=>f.setShow((v:boolean)=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(203,178,120,0.4)",padding:2,display:"flex"}}>
                          {f.show?<EyeOff size={14}/>:<Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active toggle (edit mode only) */}
                {editTarget&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:11,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
                    <button onClick={()=>ic("active",!form.active)}
                      style={{width:44,height:25,borderRadius:13,border:"none",background:form.active?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",cursor:"pointer",position:"relative",transition:"all .22s",padding:0,outline:"none"}}>
                      <div style={{width:19,height:19,borderRadius:"50%",background:form.active?"#4ade80":"#64748b",position:"absolute",top:3,transition:"all .22s",left:form.active?22:3,boxShadow:form.active?"0 0 8px #4ade8088":"none"}}/>
                    </button>
                    <div>
                      <span style={{fontSize:13,fontWeight:600,color:form.active?"#4ade80":"rgba(203,178,120,0.4)",fontFamily:"system-ui,sans-serif"}}>
                        Account {form.active?"Active":"Disabled"}
                      </span>
                      <p style={{fontSize:11,color:"rgba(203,178,120,0.3)",margin:"2px 0 0",fontFamily:"system-ui,sans-serif"}}>{form.active?"User can sign in":"User cannot sign in"}</p>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                <AnimatePresence>
                  {err&&<motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{padding:"11px 16px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.3)",fontSize:13,color:"#fca5a5",fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>⚠</span> {err}
                  </motion.div>}
                  {okMsg&&<motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{padding:"11px 16px",borderRadius:10,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.3)",fontSize:13,color:"#86efac",fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>✓</span> {okMsg}
                  </motion.div>}
                </AnimatePresence>

                {/* Action buttons */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:4}}>
                  <button onClick={closeForm}
                    style={{fontSize:13,fontWeight:500,padding:"10px 22px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"rgba(203,178,120,0.6)",cursor:"pointer",fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",transition:"all .15s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.08)";(e.currentTarget as HTMLButtonElement).style.color="rgba(203,178,120,0.9)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)";(e.currentTarget as HTMLButtonElement).style.color="rgba(203,178,120,0.6)";}}>
                    Cancel
                  </button>
                  <button onClick={save}
                    style={{fontSize:13,fontWeight:600,padding:"10px 30px",borderRadius:10,border:"1.5px solid rgba(232,200,112,0.5)",background:"rgba(232,200,112,0.14)",color:"#f5e6b8",cursor:"pointer",fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",boxShadow:"0 0 24px rgba(232,200,112,0.1)",transition:"all .15s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(232,200,112,0.26)";(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(232,200,112,0.72)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 30px rgba(232,200,112,0.2)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(232,200,112,0.14)";(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(232,200,112,0.5)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 24px rgba(232,200,112,0.1)";}}>
                    {editTarget?"Save Changes":"Create User"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {delTarget&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 24px 72px",background:"rgba(4,8,20,0.82)",backdropFilter:"blur(10px)"}}>
            <motion.div initial={{scale:0.92,y:16}} animate={{scale:1,y:0}} exit={{scale:0.92,y:16}}
              style={{width:"100%",maxWidth:380,padding:32,borderRadius:18,textAlign:"center" as const,background:"rgba(8,15,30,0.78)",border:"1.5px solid rgba(248,113,113,0.45)",boxShadow:"0 0 60px rgba(248,113,113,0.08)"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(248,113,113,0.12)",border:"2px solid rgba(248,113,113,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <Trash2 size={22} style={{color:"#f87171"}}/>
              </div>
              <div style={{fontSize:17,fontWeight:700,letterSpacing:"0.12em",color:"#f87171",marginBottom:6}}>DELETE USER</div>
              <div style={{fontSize:13,color:"rgba(203,178,120,0.7)",marginBottom:4,letterSpacing:"0.06em"}}>{delTarget.fullName} (@{delTarget.username})</div>
              <div style={{fontSize:11,color:"rgba(248,113,113,0.5)",marginBottom:24,letterSpacing:"0.1em"}}>THIS ACTION CANNOT BE UNDONE</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDel(null)} style={{flex:1,...mono,fontSize:11,fontWeight:700,letterSpacing:"0.14em",padding:11,borderRadius:10,border:"1px solid rgba(203,178,120,0.25)",background:"transparent",color:"rgba(203,178,120,0.55)",cursor:"pointer"}}>CANCEL</button>
                <button onClick={()=>del(delTarget)} style={{flex:1,...mono,fontSize:11,fontWeight:700,letterSpacing:"0.14em",padding:11,borderRadius:10,border:"1.5px solid rgba(248,113,113,0.55)",background:"rgba(248,113,113,0.18)",color:"#f87171",cursor:"pointer"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(248,113,113,0.3)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(248,113,113,0.18)";}}>
                  DELETE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {/* ─── GLOBAL FOOTER ─── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"9px 32px",background:"rgba(0,4,16,0.78)",borderTop:"1px solid rgba(0,200,245,0.16)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,gap:12,backdropFilter:"blur(8px)"}}>
        <span style={{color:"rgba(0,208,255,0.65)"}}>BIMS v1.0</span>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"rgba(0,230,200,0.75)",textDecoration:"none",letterSpacing:"0.06em"}}>© 2026 KUMI</a>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <span style={{color:"rgba(0,208,255,0.40)"}}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</span>
      </div>
</div>
  );
}
