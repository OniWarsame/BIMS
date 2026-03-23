import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showLogo?: boolean;
  rightContent?: React.ReactNode;
}

const CY  = "hsl(200,100%,65%)";
const CYD = (a: number) => `hsla(200,100%,60%,${a})`;
const TE  = "hsl(200,100%,76%)";

export default function PageHeader({ title, subtitle, icon, showLogo, rightContent }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div style={{
      position:"sticky", top:0, zIndex:20,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"11px 24px",
      background:"rgba(2,6,16,0.72)",
      borderBottom:`1px solid ${CYD(0.18)}`,
      boxShadow:`0 1px 0 ${CYD(0.08)}`,
      backdropFilter:"blur(26px) saturate(1.5)",
    }}>

      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            {/* Bio-ID logo hexagon */}
            <div style={{
              width:36, height:36, borderRadius:3, flexShrink:0,
              background:CYD(0.12), border:`1.5px solid ${CYD(0.45)}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 0 18px ${CYD(0.28)}`,
            }}>
              <Shield style={{ width:18, height:18, color:CY, filter:`drop-shadow(0 0 6px ${CYD(0.9)})` }}/>
            </div>
            <div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:900,
                letterSpacing:"0.22em", color:TE,
                textShadow:`0 0 16px hsla(200,100%,65%,0.65)`,
              }}>BIMS</div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:6.5, letterSpacing:"0.16em",
                color:CYD(0.38), marginTop:1,
              }}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ scale:1.06, x:-2 }} whileTap={{ scale:0.95 }}
              style={{
                width:34, height:34, borderRadius:3, flexShrink:0,
                background:CYD(0.08), border:`1px solid ${CYD(0.38)}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:CY, cursor:"pointer",
                boxShadow:`0 0 18px ${CYD(0.2)}`,
                transition:"all .15s",
              }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement;
                el.style.background=CYD(0.18); el.style.boxShadow=`0 0 28px ${CYD(0.4)}`; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement;
                el.style.background=CYD(0.08); el.style.boxShadow=`0 0 18px ${CYD(0.2)}`; }}>
              <ArrowLeft style={{ width:14, height:14 }}/>
            </motion.button>

            {icon && (
              <div style={{
                width:34, height:34, borderRadius:3, flexShrink:0,
                background:CYD(0.1), border:`1.5px solid ${CYD(0.42)}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 14px ${CYD(0.22)}`,
              }}>{icon}</div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:900,
                letterSpacing:"0.2em", color:CY,
                textShadow:`0 0 16px ${CYD(0.8)}`,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const,
              }}>{title}</div>
              {subtitle && (
                <div style={{
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:"0.12em",
                  color:CYD(0.38), marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const,
                }}>{subtitle}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {rightContent && (
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:16 }}>
          {rightContent}
        </div>
      )}
    </div>
  );
}
