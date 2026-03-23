import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconShieldBio, IconBack } from "./BioIcons";

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
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 24px",
      background: "rgba(3,8,22,0.65)",
      borderBottom: "0.5px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(50px) saturate(200%)",
      WebkitBackdropFilter: "blur(50px) saturate(200%)",
      boxShadow: "0 1px 0 rgba(0,200,255,0.08)",
    }}>
      {/* Left */}
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <motion.div
              animate={{ boxShadow: ["0 0 12px hsla(200,100%,65%,0.25)", "0 0 24px hsla(200,100%,65%,0.45)", "0 0 12px hsla(200,100%,65%,0.25)"] }}
              transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
              style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"linear-gradient(145deg,rgba(0,180,255,0.18),rgba(0,120,200,0.1))",
                border:"1px solid rgba(0,210,255,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                backdropFilter:"blur(20px)",
              }}>
              <IconShieldBio size={18} color="hsl(200,100%,68%)"/>
            </motion.div>
            <div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900,
                letterSpacing:"0.22em", color:"hsl(200,100%,72%)",
                textShadow:"0 0 14px hsla(200,100%,65%,0.6)" }}>BIMS</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:6.5, letterSpacing:"0.14em",
                color:"rgba(0,180,255,0.38)", marginTop:1 }}>
                BIOMETRIC IDENTITY MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
              style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.13)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer",
                boxShadow:"0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                backdropFilter:"blur(20px)",
                transition:"all 0.18s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement;
                el.style.background="rgba(0,180,255,0.15)";
                el.style.borderColor="rgba(0,210,255,0.38)"; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement;
                el.style.background="rgba(255,255,255,0.07)";
                el.style.borderColor="rgba(255,255,255,0.13)"; }}>
              <IconBack size={15} color="rgba(0,210,255,0.75)"/>
            </motion.button>

            {icon && (
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"linear-gradient(145deg,rgba(0,180,255,0.14),rgba(0,120,200,0.08))",
                border:"1px solid rgba(0,200,255,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center",
                backdropFilter:"blur(20px)",
              }}>{icon}</div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:800,
                letterSpacing:"0.2em", color:"hsl(200,100%,68%)",
                textShadow:"0 0 14px hsla(200,100%,65%,0.6)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7.5, letterSpacing:"0.1em",
                  color:"rgba(0,180,255,0.38)", marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                  {subtitle}
                </div>
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
