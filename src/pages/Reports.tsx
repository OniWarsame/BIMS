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

      
    </div>
  );
}
