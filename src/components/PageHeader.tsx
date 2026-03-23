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
      position:"sticky", top:0, zIndex:20,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 24px",
      background:"rgba(2,6,18,0.6)",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      backdropFilter:"blur(48px) saturate(180%)",
      WebkitBackdropFilter:"blur(48px) saturate(180%)",
      boxShadow:"0 1px 0 rgba(60,120,255,0.1)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
            <motion.div
              animate={{ boxShadow:["0 4px 18px rgba(50,120,255,0.22)","0 6px 28px rgba(50,120,255,0.42)","0 4px 18px rgba(50,120,255,0.22)"] }}
              transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }}
              style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg,rgba(50,120,255,0.2),rgba(30,80,200,0.12))",
                border:"1px solid rgba(80,150,255,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
              <Shield style={{ width:17, height:17, color:"hsl(215,100%,70%)" }}/>
            </motion.div>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:15, fontWeight:700,
                letterSpacing:"0.04em", color:"rgba(200,225,255,0.95)" }}>
                Nexus <span style={{ color:"hsl(215,100%,68%)" }}>BIMS</span>
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9.5, fontWeight:500, letterSpacing:"0.03em",
                color:"rgba(100,155,230,0.45)", marginTop:1 }}>
                Biometric Identity Management
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
              style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"rgba(120,180,255,0.75)", cursor:"pointer",
                backdropFilter:"blur(16px)", transition:"all .18s",
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement;
                el.style.background="rgba(50,120,255,0.14)"; el.style.borderColor="rgba(80,150,255,0.35)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement;
                el.style.background="rgba(255,255,255,0.05)"; el.style.borderColor="rgba(255,255,255,0.1)"; }}>
              <ArrowLeft style={{ width:14, height:14 }}/>
            </motion.button>

            {icon && (
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg,rgba(50,120,255,0.16),rgba(30,80,200,0.1))",
                border:"1px solid rgba(70,140,255,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{icon}</div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Space Grotesk',system-ui,sans-serif", fontSize:14, fontWeight:700,
                letterSpacing:"0.02em", color:"rgba(200,225,255,0.95)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:400,
                  color:"rgba(100,155,220,0.45)", marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                  {subtitle}
                </div>
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
