import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showLogo?: boolean;
  rightContent?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, showLogo, rightContent }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div style={{
      position:"sticky",top:0,zIndex:20,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"12px 24px",
      background:"rgba(2,4,15,0.62)",
      borderBottom:"1px solid rgba(255,255,255,0.065)",
      backdropFilter:"blur(52px) saturate(180%)",
      WebkitBackdropFilter:"blur(52px) saturate(180%)",
      boxShadow:"0 1px 0 rgba(50,120,255,0.1)",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        {showLogo ? (
          <div style={{display:"flex",alignItems:"center",gap:11,flexShrink:0}}>
            <motion.div
              animate={{boxShadow:["0 4px 16px rgba(40,100,255,0.3)","0 6px 24px rgba(40,100,255,0.5)","0 4px 16px rgba(40,100,255,0.3)"]}}
              transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
              style={{width:34,height:34,borderRadius:10,flexShrink:0,background:"linear-gradient(135deg,hsl(218,100%,56%),hsl(232,100%,68%))",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Shield style={{width:16,height:16,color:"white"}}/>
            </motion.div>
            <div>
              <div style={{fontFamily:"'Syne',system-ui,sans-serif",fontSize:14,fontWeight:800,letterSpacing:"0.04em",color:"rgba(210,235,255,0.95)"}}>
                Nexus<span style={{color:"hsl(218,100%,70%)",marginLeft:4}}>BIMS</span>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(80,140,220,0.4)",letterSpacing:"0.06em",marginTop:1}}>
                BIOMETRIC PLATFORM
              </div>
            </div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
            <motion.button onClick={()=>navigate("/")}
              whileHover={{scale:1.05}} whileTap={{scale:0.96}}
              style={{width:32,height:32,borderRadius:10,flexShrink:0,background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(120,185,255,0.7)",cursor:"pointer",backdropFilter:"blur(16px)",transition:"all .18s"}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background="rgba(50,120,255,0.14)";el.style.borderColor="rgba(80,155,255,0.32)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background="rgba(255,255,255,0.055)";el.style.borderColor="rgba(255,255,255,0.1)";}}>
              <ArrowLeft style={{width:14,height:14}}/>
            </motion.button>
            {icon && (
              <div style={{width:32,height:32,borderRadius:10,flexShrink:0,background:"linear-gradient(135deg,rgba(50,120,255,0.18),rgba(30,80,200,0.12))",border:"1px solid rgba(70,140,255,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {icon}
              </div>
            )}
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Syne',system-ui,sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.02em",color:"rgba(210,235,255,0.95)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{title}</div>
              {subtitle && <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"rgba(80,140,220,0.42)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,letterSpacing:"0.05em"}}>{subtitle}</div>}
            </div>
          </div>
        )}
      </div>
      {rightContent && (
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0,marginLeft:16}}>
          {rightContent}
        </div>
      )}
    </div>
  );
}
