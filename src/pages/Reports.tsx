import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Users, Database, Activity, Clock, Shield, AlertTriangle, Download, Trash2 } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getAccessLogs, getRecords, clearLogs, getStorageInfo, type AccessLog } from "@/lib/biometric-store";
import { getUsers, getCurrentUser } from "@/pages/Login";

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  DATABASE_UNLOCKED:      { label:"Database Unlocked",       color:"#4ade80", icon:"🔓" },
  FAILED_ACCESS_ATTEMPT:  { label:"Failed Access Attempt",   color:"#f87171", icon:"🚫" },
  RECORD_ADDED:           { label:"Record Created",          color:"#60a5fa", icon:"➕" },
  RECORD_UPDATED:         { label:"Record Updated",          color:"#fb923c", icon:"✏️" },
  RECORD_DELETED:         { label:"Record Deleted",          color:"#f87171", icon:"🗑️" },
  RECORDS_FETCHED:        { label:"Records Viewed",          color:"#a78bfa", icon:"👁️" },
  DATABASE_WIPED:         { label:"Database Wiped",          color:"#f87171", icon:"⚠️" },
  LOGS_CLEARED:           { label:"Logs Cleared",            color:"#fbbf24", icon:"🧹" },
  PIN_RESET:              { label:"PIN Reset",               color:"#fbbf24", icon:"🔑" },
  USER_LOGIN:             { label:"User Login",              color:"#4ade80", icon:"👤" },
  USER_LOGOUT:            { label:"User Logout",             color:"#94a3b8", icon:"🚪" },
};

const fmt = (ts: string) => {
  try {
    const d = new Date(ts);
    return { date: d.toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"numeric"}), time: d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"}) };
  } catch { return { date:"—", time:"—" }; }
};

export default function Reports() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const [logs,    setLogs]    = useState<AccessLog[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [users,   setUsers]   = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [filter,  setFilter]  = useState<string>("all");
  const [tab,     setTab]     = useState<"activity"|"records"|"users"|"summary">("summary");

  useEffect(() => {
    setLogs([...getAccessLogs()].reverse());
    setRecords(getRecords());
    setUsers(getUsers());
    setStorage(getStorageInfo());
  }, []);

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.action === filter);
  const actionTypes  = [...new Set(logs.map(l => l.action))];

  const stats = {
    total:    logs.length,
    unlocks:  logs.filter(l => l.action === "DATABASE_UNLOCKED").length,
    failed:   logs.filter(l => l.action === "FAILED_ACCESS_ATTEMPT").length,
    created:  logs.filter(l => l.action === "RECORD_ADDED").length,
    deleted:  logs.filter(l => l.action === "RECORD_DELETED").length,
    updated:  logs.filter(l => l.action === "RECORD_UPDATED").length,
  };

  const exportLogs = () => {
    const csv = ["Timestamp,Action,Operator,Records\n", ...logs.map(l=>`${l.timestamp},${l.action},${l.operator},${l.recordsAccessed}\n`)].join("");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `BIMS_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const mono: React.CSSProperties = { fontFamily:"'Courier New',monospace" };

  const StatCard = ({label,value,color,icon}:{label:string;value:number;color:string;icon:React.ReactNode}) => (
    <div style={{padding:"16px 20px",borderRadius:12,background:`${color}22`,border:`1.5px solid ${color}66`,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:40,height:40,borderRadius:10,background:`${color}28`,border:`1.5px solid ${color}66`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color}}>
        {icon}
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",color:`${color}aa`,...mono}}>{label}</div>
        <div style={{fontSize:28,fontWeight:700,color,lineHeight:1,marginTop:2,...mono}}>{value}</div>
      </div>
    </div>
  );

  const TabBtn = ({id,label}:{id:typeof tab;label:string}) => (
    <button onClick={()=>setTab(id)} style={{padding:"8px 18px",borderRadius:9,...mono,fontSize:11,fontWeight:700,letterSpacing:"0.12em",cursor:"pointer",transition:"all .15s",border: tab===id?"1.5px solid rgba(232,200,112,0.65)":"1px solid rgba(203,178,120,0.2)",background:tab===id?"rgba(232,200,112,0.15)":"transparent",color:tab===id?"#f0dc90":"rgba(203,178,120,0.5)"}}>
      {label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",...mono}}>
      <CyberBackground/>

      <PageHeader
        title="SYSTEM REPORTS"
        subtitle="ACTIVITY LOGS · USER SESSIONS · RECORDS AUDIT"
        icon={<FileText size={16} style={{color:"hsl(192,100%,68%)"}}/>}
        rightContent={
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {me?.role==="admin"&&<button onClick={()=>{clearLogs();setLogs([]);}} style={{display:"flex",alignItems:"center",gap:6,fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.12em",padding:"7px 14px",borderRadius:9,border:"1px solid hsla(0,80%,52%,0.35)",background:"hsla(0,80%,52%,0.08)",color:"hsl(0,80%,70%)",cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(0,80%,52%,0.18)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(0,80%,52%,0.08)";}}>
              <Trash2 size={12}/> CLEAR LOGS
            </button>}
            <button onClick={exportLogs} style={{display:"flex",alignItems:"center",gap:6,fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.12em",padding:"7px 14px",borderRadius:9,border:"1.5px solid hsla(192,100%,55%,0.5)",background:"hsla(192,100%,52%,0.1)",color:"hsl(192,100%,72%)",cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.22)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="hsla(192,100%,52%,0.1)";}}>
              <Download size={12}/> EXPORT
            </button>
          </div>
        }
      />

      {/* BODY */}
      <div style={{flex:1,padding:"24px 28px 72px",position:"relative",zIndex:1,maxWidth:1100,width:"100%",margin:"0 auto"}}>

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap" as const}}>
          <TabBtn id="summary"  label="SUMMARY"/>
          <TabBtn id="activity" label="ACTIVITY LOG"/>
          <TabBtn id="records"  label="RECORDS"/>
          <TabBtn id="users"    label="USER SESSIONS"/>
        </div>

        {/* ── SUMMARY TAB ── */}
        {tab==="summary"&&(
          <div style={{display:"flex",flexDirection:"column" as const,gap:20}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
              <StatCard label="TOTAL EVENTS"      value={stats.total}   color="#e8c870" icon={<Activity size={18}/>}/>
              <StatCard label="DB UNLOCKS"         value={stats.unlocks} color="#4ade80" icon={<Shield size={18}/>}/>
              <StatCard label="FAILED ATTEMPTS"    value={stats.failed}  color="#f87171" icon={<AlertTriangle size={18}/>}/>
              <StatCard label="RECORDS CREATED"    value={stats.created} color="#60a5fa" icon={<Database size={18}/>}/>
              <StatCard label="RECORDS UPDATED"    value={stats.updated} color="#fb923c" icon={<FileText size={18}/>}/>
              <StatCard label="RECORDS DELETED"    value={stats.deleted} color="#f87171" icon={<Trash2 size={18}/>}/>
              <StatCard label="TOTAL RECORDS"      value={records.length}color="#a78bfa" icon={<Database size={18}/>}/>
              <StatCard label="TOTAL USERS"        value={users.length}  color="#34d399" icon={<Users size={18}/>}/>
            </div>

            {/* Storage */}
            {storage&&(
              <div style={{padding:"18px 22px",borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)"}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)",marginBottom:14}}>STORAGE INFORMATION</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
                  {[["TOTAL RECORDS",storage.totalRecords],["TOTAL LOGS",storage.totalLogs],["DB SIZE",storage.dbSize],["LOG SIZE",storage.logSize]].map(([l,v])=>(
                    <div key={l as string} style={{padding:"10px 14px",borderRadius:9,background:"rgba(232,200,112,0.12)",border:"1px solid rgba(232,200,112,0.35)"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.5)",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#e8c870"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent events */}
            <div style={{borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)",overflow:"hidden"}}>
              <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.85)"}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>RECENT ACTIVITY (LAST 10 EVENTS)</span>
              </div>
              {logs.slice(0,10).map((log,i)=>{
                const meta = ACTION_META[log.action]||{label:log.action,color:"#94a3b8",icon:"●"};
                const {date,time} = fmt(log.timestamp);
                return (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",alignItems:"center",padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.18)",background:"transparent"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.08)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12}}>{meta.icon}</span>
                      <span style={{fontSize:12,fontWeight:700,color:meta.color}}>{meta.label}</span>
                    </div>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.65)"}}>{log.operator}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.45)"}}>{date}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.45)"}}>{time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOG TAB ── */}
        {tab==="activity"&&(
          <div>
            {/* Filter */}
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" as const}}>
              <button onClick={()=>setFilter("all")} style={{...mono,fontSize:10,fontWeight:700,letterSpacing:"0.14em",padding:"5px 12px",borderRadius:7,cursor:"pointer",border:filter==="all"?"1.5px solid rgba(232,200,112,0.65)":"1px solid rgba(203,178,120,0.25)",background:filter==="all"?"rgba(232,200,112,0.15)":"transparent",color:filter==="all"?"#f0dc90":"rgba(203,178,120,0.5)"}}>ALL</button>
              {actionTypes.map(a=>{
                const meta=ACTION_META[a]||{label:a,color:"#94a3b8",icon:"●"};
                return <button key={a} onClick={()=>setFilter(a)} style={{...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",padding:"5px 12px",borderRadius:7,cursor:"pointer",border:filter===a?`1.5px solid ${meta.color}88`:`1px solid ${meta.color}33`,background:filter===a?`${meta.color}18`:`${meta.color}08`,color:filter===a?meta.color:`${meta.color}88`}}>{meta.label}</button>;
              })}
            </div>

            <div style={{borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"3fr 2fr 2fr 2fr 1fr",padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.85)"}}>
                {["ACTION","OPERATOR","DATE","TIME","RECORDS"].map(h=>(
                  <span key={h} style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>{h}</span>
                ))}
              </div>
              {filteredLogs.length===0?(
                <div style={{padding:"40px",textAlign:"center",color:"rgba(203,178,120,0.3)",fontSize:12,letterSpacing:"0.2em"}}>NO EVENTS FOUND</div>
              ):filteredLogs.map((log,i)=>{
                const meta=ACTION_META[log.action]||{label:log.action,color:"#94a3b8",icon:"●"};
                const {date,time}=fmt(log.timestamp);
                return(
                  <motion.div key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:Math.min(i*0.02,0.3)}}
                    style={{display:"grid",gridTemplateColumns:"3fr 2fr 2fr 2fr 1fr",alignItems:"center",padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.16)",transition:"background .12s"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.1)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,flexShrink:0}}>{meta.icon}</span>
                      <span style={{fontSize:12,fontWeight:700,color:meta.color}}>{meta.label}</span>
                    </div>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.7)"}}>{log.operator}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.5)"}}>{date}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Clock size={10} style={{color:"rgba(203,178,120,0.35)",flexShrink:0}}/>
                      <span style={{fontSize:11,color:"rgba(203,178,120,0.5)"}}>{time}</span>
                    </div>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.4)"}}>{log.recordsAccessed>0?log.recordsAccessed:"—"}</span>
                  </motion.div>
                );
              })}
            </div>
            <div style={{marginTop:10,fontSize:10,color:"rgba(203,178,120,0.35)",letterSpacing:"0.1em",...mono}}>
              SHOWING {filteredLogs.length} OF {logs.length} TOTAL EVENTS
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab==="records"&&(
          <div style={{borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 2fr 2fr 2fr",padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.85)"}}>
              {["#","NAME","ID","NATIONALITY","REGISTERED"].map(h=>(
                <span key={h} style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>{h}</span>
              ))}
            </div>
            {records.length===0?(
              <div style={{padding:"40px",textAlign:"center",color:"rgba(203,178,120,0.3)",fontSize:12,letterSpacing:"0.2em"}}>NO RECORDS IN DATABASE</div>
            ):records.map((r,i)=>(
              <motion.div key={r.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                style={{display:"grid",gridTemplateColumns:"1fr 2fr 2fr 2fr 2fr",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid rgba(203,178,120,0.18)",cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.1)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}
                onClick={()=>navigate(`/result/${r.id}`)}>
                <span style={{fontSize:12,fontWeight:700,color:"rgba(203,178,120,0.4)"}}>{i+1}</span>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {r.photo&&<img src={r.photo} style={{width:28,height:28,borderRadius:7,objectFit:"cover",border:"1px solid rgba(203,178,120,0.3)"}} alt=""/>}
                  <span style={{fontSize:13,fontWeight:700,color:"#e8dcc8"}}>{r.surname}, {r.name}</span>
                </div>
                <span style={{fontSize:11,color:"rgba(203,178,120,0.6)"}}>{r.id}</span>
                <span style={{fontSize:11,color:"rgba(203,178,120,0.55)"}}>{r.nationality||"—"}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Clock size={10} style={{color:"rgba(203,178,120,0.35)"}}/>
                  <span style={{fontSize:11,color:"rgba(203,178,120,0.5)"}}>{fmt(r.registeredAt).date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab==="users"&&(
          <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            <div style={{borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)",overflow:"hidden"}}>
              <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.85)"}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>REGISTERED USERS — {users.length} TOTAL</span>
              </div>
              {users.map((u,i)=>{
                const loginEvents = logs.filter(l=>l.operator===u.username&&l.action==="DATABASE_UNLOCKED");
                const lastLogin   = loginEvents[0];
                return(
                  <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr 1fr",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid rgba(203,178,120,0.18)",transition:"background .12s"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.1)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:9,background:`${u.role==="admin"?"rgba(248,113,113,0.15)":u.role==="analyst"?"rgba(96,165,250,0.15)":u.role==="operator"?"rgba(251,146,60,0.15)":"rgba(74,222,128,0.15)"}`,border:`1.5px solid ${u.role==="admin"?"rgba(248,113,113,0.4)":u.role==="analyst"?"rgba(96,165,250,0.4)":u.role==="operator"?"rgba(251,146,60,0.4)":"rgba(74,222,128,0.4)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:u.role==="admin"?"#f87171":u.role==="analyst"?"#60a5fa":u.role==="operator"?"#fb923c":"#4ade80",flexShrink:0}}>
                        {(u.fullName||u.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#e8dcc8"}}>{u.fullName}</div>
                        <div style={{fontSize:10,color:"rgba(203,178,120,0.5)",marginTop:1}}>@{u.username}</div>
                      </div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",padding:"3px 9px",borderRadius:6,background:u.role==="admin"?"rgba(248,113,113,0.12)":u.role==="analyst"?"rgba(96,165,250,0.12)":u.role==="operator"?"rgba(251,146,60,0.12)":"rgba(74,222,128,0.12)",border:`1px solid ${u.role==="admin"?"rgba(248,113,113,0.35)":u.role==="analyst"?"rgba(96,165,250,0.35)":u.role==="operator"?"rgba(251,146,60,0.35)":"rgba(74,222,128,0.35)"}`,color:u.role==="admin"?"#f87171":u.role==="analyst"?"#60a5fa":u.role==="operator"?"#fb923c":"#4ade80",display:"inline-block"}}>
                      {u.role.toUpperCase()}
                    </span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:u.active?"#4ade80":"#6b7280",boxShadow:u.active?"0 0 6px #4ade80":"none"}}/>
                      <span style={{fontSize:11,color:u.active?"#4ade80":"rgba(203,178,120,0.35)"}}>{u.active?"ACTIVE":"DISABLED"}</span>
                    </div>
                    <div>
                      {lastLogin?(
                        <div>
                          <div style={{fontSize:11,color:"rgba(203,178,120,0.7)"}}>{fmt(lastLogin.timestamp).date}</div>
                          <div style={{fontSize:10,color:"rgba(203,178,120,0.4)"}}>{fmt(lastLogin.timestamp).time}</div>
                        </div>
                      ):<span style={{fontSize:11,color:"rgba(203,178,120,0.3)"}}>No logins recorded</span>}
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:"rgba(203,178,120,0.5)"}}>{loginEvents.length} logins</span>
                  </div>
                );
              })}
            </div>

            {/* Login history */}
            <div style={{borderRadius:12,border:"1.5px solid rgba(203,178,120,0.38)",background:"rgba(12,22,45,0.92)",overflow:"hidden"}}>
              <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(203,178,120,0.15)",background:"rgba(6,14,32,0.85)"}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)"}}>DATABASE ACCESS HISTORY</span>
              </div>
              {logs.filter(l=>l.action==="DATABASE_UNLOCKED"||l.action==="FAILED_ACCESS_ATTEMPT").slice(0,30).map((log,i)=>{
                const ok=log.action==="DATABASE_UNLOCKED";
                const {date,time}=fmt(log.timestamp);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 20px",borderBottom:"1px solid rgba(203,178,120,0.16)",transition:"background .12s"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(203,178,120,0.08)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:ok?"#4ade80":"#f87171",boxShadow:`0 0 6px ${ok?"#4ade80":"#f87171"}`,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:700,color:ok?"#4ade80":"#f87171",minWidth:180}}>{ok?"✓ ACCESS GRANTED":"✗ ACCESS DENIED"}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.65)",flex:1}}>@{log.operator}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.45)"}}>{date}</span>
                    <span style={{fontSize:11,color:"rgba(203,178,120,0.45)"}}>{time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}</div>
  );
}
