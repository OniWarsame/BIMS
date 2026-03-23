import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser, getUsers, ROLE_COLORS, ROLE_LABELS } from "@/pages/Login";
import { getRecords, type BiometricRecord } from "@/lib/biometric-store";

export default function Profile() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const [rec, setRec] = useState<BiometricRecord|null>(null);

  useEffect(()=>{
    if(!me) return;
    const recs = getRecords();
    const n = me.fullName.trim().toLowerCase();
    const found = recs.find(r =>
      `${r.name} ${r.surname}`.toLowerCase()===n ||
      `${r.surname} ${r.name}`.toLowerCase()===n ||
      (n.includes(r.name.toLowerCase())&&n.includes(r.surname.toLowerCase()))
    );
    setRec(found||null);
  },[]);

  const mono:React.CSSProperties={fontFamily:"'Courier New',monospace"};
  const roleColor = me ? ROLE_COLORS[me.role] : "#e8c870";

  const F = ({label,value}:{label:string;value?:string|null}) => value?(
    <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(12,22,45,0.7)",border:"1px solid rgba(203,178,120,0.2)"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.45)",...mono}}>{label}</div>
      <div style={{fontSize:13,color:"#e8dcc8",marginTop:2,...mono}}>{value}</div>
    </div>
  ):null;

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",...mono}}>
      <CyberBackground/>
      <PageHeader
        title="MY PROFILE"
        subtitle="IDENTITY · ACCOUNT · CREDENTIALS"
        icon={<span style={{fontSize:16}}>👤</span>}
      />
      <div style={{flex:1,padding:"28px",position:"relative",zIndex:1,maxWidth:860,width:"100%",margin:"0 auto"}}>
        {/* Account card */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
          style={{padding:"24px",borderRadius:16,border:`2px solid ${roleColor}55`,background:"rgba(12,22,45,0.92)",marginBottom:20,boxShadow:`0 0 40px ${roleColor}18`}}>
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" as const}}>
            {rec?.photo
              ? <img src={rec.photo} style={{width:88,height:88,borderRadius:14,objectFit:"cover",border:`3px solid ${roleColor}66`,flexShrink:0}} alt=""/>
              : <div style={{width:88,height:88,borderRadius:14,background:`${roleColor}18`,border:`3px solid ${roleColor}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontWeight:700,color:roleColor,flexShrink:0}}>{me?.fullName?.charAt(0)||"?"}</div>}
            <div style={{flex:1}}>
              <div style={{fontSize:22,fontWeight:700,color:"#e8dcc8",marginBottom:6}}>{me?.fullName||"—"}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const}}>
                <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.14em",padding:"4px 12px",borderRadius:8,background:`${roleColor}18`,border:`1px solid ${roleColor}55`,color:roleColor}}>{me?ROLE_LABELS[me.role]:"—"}</span>
                <span style={{fontSize:12,color:"rgba(203,178,120,0.65)",...mono}}>@{me?.username||"—"}</span>
                {me?.email&&<span style={{fontSize:12,color:"rgba(203,178,120,0.55)",...mono}}>{me.email}</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* System account credentials */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          style={{padding:"20px 24px",borderRadius:14,border:"1px solid rgba(203,178,120,0.28)",background:"rgba(12,22,45,0.88)",marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)",marginBottom:14}}>SYSTEM ACCOUNT CREDENTIALS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
            <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(12,22,45,0.7)",border:"1px solid rgba(203,178,120,0.2)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.45)",...mono}}>LOGIN USERNAME</div>
              <div style={{fontSize:14,fontWeight:700,color:"#f0dc90",marginTop:2,...mono}}>@{me?.username||"—"}</div>
            </div>
            <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(12,22,45,0.7)",border:"1px solid rgba(203,178,120,0.2)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.45)",...mono}}>PASSWORD</div>
              <div style={{fontSize:14,fontWeight:700,color:"rgba(203,178,120,0.7)",marginTop:2,letterSpacing:"0.3em",...mono}}>{"•".repeat(me?.password?.length||6)}</div>
            </div>
            <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(12,22,45,0.7)",border:"1px solid rgba(203,178,120,0.2)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.45)",...mono}}>SYSTEM ROLE</div>
              <div style={{fontSize:13,fontWeight:700,color:roleColor,marginTop:2,...mono}}>{me?ROLE_LABELS[me.role]:"—"}</div>
            </div>
            <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(12,22,45,0.7)",border:"1px solid rgba(203,178,120,0.2)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.45)",...mono}}>ACCOUNT STATUS</div>
              <div style={{fontSize:13,fontWeight:700,color:"#4ade80",marginTop:2,...mono}}>● ACTIVE</div>
            </div>
          </div>
        </motion.div>

        {/* Biometric record */}
        {rec?(
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(203,178,120,0.5)",marginBottom:14}}>BIOMETRIC RECORD — {rec.id}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
              <F label="FULL NAME"       value={`${rec.name} ${rec.surname}`}/>
              <F label="BIOMETRIC ID"    value={rec.id}/>
              <F label="DATE OF BIRTH"   value={rec.dateOfBirth}/>
              <F label="PLACE OF BIRTH"  value={rec.placeOfBirth}/>
              <F label="GENDER"          value={rec.gender}/>
              <F label="NATIONALITY"     value={rec.nationality}/>
              <F label="NATIONAL ID"     value={rec.nationalId}/>
              <F label="PASSPORT NO."    value={rec.passportNo}/>
              <F label="BLOOD TYPE"      value={rec.bloodType}/>
              <F label="MARITAL STATUS"  value={rec.maritalStatus}/>
              <F label="EMAIL"           value={rec.email}/>
              <F label="PHONE"           value={rec.phoneNo}/>
              <F label="ADDRESS"         value={rec.address}/>
              <F label="OCCUPATION"      value={rec.occupation}/>
              <F label="LANGUAGES"       value={(rec.languages||[]).join(", ")||null}/>
              <F label="EDUCATION"       value={rec.educationRecord}/>
              {rec.currentWorkInfo&&<F label="CURRENT EMPLOYER" value={`${rec.currentWorkInfo.company} — ${rec.currentWorkInfo.department}`}/>}
              <F label="FATHER"          value={rec.fatherName}/>
              <F label="MOTHER"          value={rec.motherName}/>
            </div>
          </motion.div>
        ):(
          <div style={{padding:"32px",textAlign:"center",borderRadius:14,border:"1px solid rgba(203,178,120,0.2)",background:"rgba(12,22,45,0.7)"}}>
            <div style={{fontSize:24,marginBottom:8}}>🔍</div>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.14em",color:"rgba(203,178,120,0.4)",...mono}}>NO BIOMETRIC RECORD LINKED</div>
            <div style={{fontSize:10,color:"rgba(203,178,120,0.3)",marginTop:6,...mono}}>Register via New Registration to link your biometric profile</div>
            <button onClick={()=>navigate("/register")} style={{...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",padding:"8px 18px",borderRadius:9,border:"1.5px solid rgba(232,200,112,0.5)",background:"rgba(232,200,112,0.12)",color:"#f0dc90",cursor:"pointer",marginTop:16}}>GO TO REGISTRATION →</button>
          </div>
        )}
      </div>
    </div>
  );
}
