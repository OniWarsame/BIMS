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

/* Exact from Index.tsx: hsl(185,100%,62%) teal, hsl(192,100%,52%) cyan */
const CY  = "hsl(192,100%,68%)";
const CYd = "hsla(192,100%,52%,";
const TE  = "hsl(185,100%,76%)";

export default function PageHeader({ title, subtitle, icon, showLogo, rightContent }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 24px",
      background: "transparent",
      borderBottom: "1px solid hsla(178,60%,40%,0.22)",
      boxShadow: "0 1px 0 hsla(185,100%,52%,0.08)",
      backdropFilter: "blur(24px) saturate(1.5)",
    }}>

      {/* Left */}
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <div style={{
              width:36, height:36, borderRadius:9, flexShrink:0,
              background:`${CYd}0.12)`, border:`1.5px solid ${CYd}0.45)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 0 16px ${CYd}0.25)`,
            }}>
              <Shield style={{ width:18, height:18, color:CY, filter:`drop-shadow(0 0 6px ${CYd}0.9))` }}/>
            </div>
            <div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:900,
                letterSpacing:"0.2em", color:TE,
                textShadow:`0 0 14px hsla(185,100%,55%,0.55)`,
              }}>BIMS</div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:"0.18em",
                color:"hsla(35,65%,60%,0.65)", marginTop:1,
              }}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ scale:1.08, x:-2 }} whileTap={{ scale:0.94 }}
              style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background:`${CYd}0.08)`, border:`1px solid ${CYd}0.38)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:CY, cursor:"pointer",
                boxShadow:`0 0 18px ${CYd}0.2)`,
                transition:"all .15s",
              }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement;
                el.style.background=`${CYd}0.18)`; el.style.boxShadow=`0 0 28px ${CYd}0.38)`; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement;
                el.style.background=`${CYd}0.08)`; el.style.boxShadow=`0 0 18px ${CYd}0.2)`; }}>
              <ArrowLeft style={{ width:15, height:15 }}/>
            </motion.button>

            {icon && (
              <div style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background:`${CYd}0.1)`, border:`1.5px solid ${CYd}0.4)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 14px ${CYd}0.2)`,
              }}>
                {icon}
              </div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900,
                letterSpacing:"0.18em", color:CY,
                textShadow:`0 0 16px ${CYd}0.8)`,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const,
              }}>{title}</div>
              {subtitle && (
                <div style={{
                  fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:"0.18em",
                  color:`${CYd}0.4)`, marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const,
                }}>{subtitle}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      {rightContent && (
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:16 }}>
          {rightContent}
        </div>
      )}
    </div>
  );
}
