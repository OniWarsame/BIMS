import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showLogo?: boolean;        // home page shows BIMS logo instead of back arrow
  rightContent?: React.ReactNode;
}

const CY = "hsl(192,100%,68%)";
const CYD = "hsla(192,100%,52%,";

export default function PageHeader({ title, subtitle, icon, showLogo, rightContent }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        background: "linear-gradient(180deg,hsla(215,55%,5%,0.96) 0%,hsla(215,55%,4%,0.92) 100%)",
        borderBottom: `1px solid ${CYD}0.22)`,
        boxShadow: `0 1px 0 ${CYD}0.08), 0 4px 20px rgba(0,0,0,0.4)`,
        backdropFilter: "blur(20px)",
      }}>

      {/* Left: logo or back + title */}
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          /* ─ Home page logo ─ */
          <>
            <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
              background:`${CYD}0.12)`, border:`1.5px solid ${CYD}0.45)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 0 16px ${CYD}0.25)` }}>
              <Shield style={{ width:18, height:18, color:CY, filter:`drop-shadow(0 0 6px ${CYD}0.9))` }}/>
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:900,
                letterSpacing:"0.2em", color:CY,
                textShadow:`0 0 18px ${CYD}0.8)` }}>BIMS</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:"0.18em",
                color:`${CYD}0.38)`, marginTop:1 }}>
                BIOMETRIC IDENTITY MANAGEMENT SYSTEM
              </div>
            </div>
          </>
        ) : (
          /* ─ Other pages: back arrow + page title ─ */
          <>
            <motion.button onClick={()=>navigate("/")}
              whileHover={{ scale:1.08, x:-2 }} whileTap={{ scale:0.94 }}
              style={{ width:34, height:34, borderRadius:8, flexShrink:0,
                background:"transparent", border:`1px solid ${CYD}0.32)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:`${CYD}0.6)`, cursor:"pointer",
                boxShadow:`0 0 12px ${CYD}0.1)`, transition:"all .15s" }}
              onMouseEnter={e=>{
                (e.currentTarget as HTMLButtonElement).style.background=`${CYD}0.12)`;
                (e.currentTarget as HTMLButtonElement).style.color=CY;
                (e.currentTarget as HTMLButtonElement).style.borderColor=`${CYD}0.6)`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow=`0 0 20px ${CYD}0.3)`;
              }}
              onMouseLeave={e=>{
                (e.currentTarget as HTMLButtonElement).style.background="transparent";
                (e.currentTarget as HTMLButtonElement).style.color=`${CYD}0.6)`;
                (e.currentTarget as HTMLButtonElement).style.borderColor=`${CYD}0.32)`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow=`0 0 12px ${CYD}0.1)`;
              }}>
              <ArrowLeft style={{ width:15, height:15 }}/>
            </motion.button>

            {icon && (
              <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                background:`${CYD}0.1)`, border:`1.5px solid ${CYD}0.4)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 14px ${CYD}0.2)` }}>
                {icon}
              </div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900,
                letterSpacing:"0.18em", color:CY,
                textShadow:`0 0 16px ${CYD}0.8)`,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:"0.18em",
                  color:`${CYD}0.4)`, marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                  {subtitle}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right content slot */}
      {rightContent && (
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:16 }}>
          {rightContent}
        </div>
      )}
    </div>
  );
}
