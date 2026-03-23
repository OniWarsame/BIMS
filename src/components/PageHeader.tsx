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
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 22px",
      background: "rgba(0,4,15,0.92)",
      borderBottom: "1px solid rgba(0,160,220,0.12)",
      borderLeft: "3px solid rgba(0,229,255,0.55)",
      backdropFilter: "blur(30px) saturate(1.8)",
      boxShadow: "0 1px 0 rgba(0,229,255,0.06), 4px 0 0 rgba(0,229,255,0.0)",
    }}>
      {/* Left */}
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, flexShrink:0, background:"rgba(0,200,255,0.08)",
              border:"1px solid rgba(0,229,255,0.38)", borderLeft:"3px solid rgba(0,229,255,0.7)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Shield style={{ width:16, height:16, color:"rgba(0,229,255,0.85)" }}/>
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900,
                letterSpacing:"0.25em", color:"rgba(0,229,255,0.9)",
                textShadow:"0 0 16px rgba(0,229,255,0.7)" }}>BIMS</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:6.5, letterSpacing:"0.16em",
                color:"rgba(0,180,255,0.38)", marginTop:1 }}>
                BIOMETRIC IDENTITY MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
              style={{ width:32, height:32, flexShrink:0, background:"transparent",
                border:"1px solid rgba(0,180,255,0.22)", borderLeft:"2px solid rgba(0,229,255,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"rgba(0,200,255,0.55)", cursor:"pointer", transition:"all .14s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement;
                el.style.background="rgba(0,180,255,0.1)"; el.style.color="rgba(0,235,255,0.88)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement;
                el.style.background="transparent"; el.style.color="rgba(0,200,255,0.55)"; }}>
              <ArrowLeft style={{ width:14, height:14 }}/>
            </motion.button>
            {icon && (
              <div style={{ width:32, height:32, flexShrink:0, background:"rgba(0,180,255,0.08)",
                border:"1px solid rgba(0,200,255,0.25)", borderLeft:"2px solid rgba(0,229,255,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {icon}
              </div>
            )}
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:800,
                letterSpacing:"0.2em", color:"rgba(0,229,255,0.88)",
                textShadow:"0 0 14px rgba(0,229,255,0.6)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, letterSpacing:"0.12em",
                  color:"rgba(0,170,220,0.38)", marginTop:2,
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
