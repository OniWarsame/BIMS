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
      padding: "12px 24px",
      background: "rgba(4,10,30,0.82)",
      borderBottom: "1px solid rgba(0,160,255,0.12)",
      backdropFilter: "blur(32px) saturate(2) brightness(1.08)",
      WebkitBackdropFilter: "blur(32px) saturate(2) brightness(1.08)",
      boxShadow: "0 1px 0 rgba(0,200,255,0.08), 0 8px 32px rgba(0,0,0,0.3)",
    }}>

      {/* Left */}
      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
        {showLogo ? (
          <div style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
            {/* iOS-style icon */}
            <div style={{
              width:38, height:38, borderRadius:14, flexShrink:0,
              background: "linear-gradient(145deg, hsl(195,100%,28%), hsl(210,100%,20%))",
              border: "1px solid rgba(0,200,255,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow: "0 4px 18px rgba(0,160,220,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}>
              {/* Custom DNA/fingerprint icon */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3" stroke="rgba(0,230,255,0.9)" strokeWidth="1.5"/>
                <path d="M10 4 Q14 7 14 10 Q14 13 10 16" stroke="rgba(0,200,255,0.7)" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M10 4 Q6 7 6 10 Q6 13 10 16"  stroke="rgba(0,200,255,0.7)" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <circle cx="10" cy="2" r="1" fill="rgba(0,230,255,0.8)"/>
                <circle cx="10" cy="18" r="1" fill="rgba(0,230,255,0.8)"/>
                <circle cx="2" cy="10" r="1" fill="rgba(0,200,255,0.6)"/>
                <circle cx="18" cy="10" r="1" fill="rgba(0,200,255,0.6)"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:900,
                letterSpacing:"0.22em", color:"hsl(185,100%,76%)",
                textShadow:"0 0 14px hsla(185,100%,55%,0.55)",
              }}>BIMS</div>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:6.5, letterSpacing:"0.16em",
                color:"hsla(35,65%,60%,0.6)", marginTop:1,
              }}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <motion.button onClick={() => navigate("/")}
              whileHover={{ scale:1.06, x:-2 }} whileTap={{ scale:0.92 }}
              style={{
                width:34, height:34, borderRadius:12, flexShrink:0,
                background: "linear-gradient(145deg, rgba(0,100,180,0.22), rgba(0,60,140,0.14))",
                border: "1px solid rgba(0,180,255,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"rgba(0,210,255,0.8)", cursor:"pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                transition:"all .18s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "linear-gradient(145deg, rgba(0,140,220,0.32), rgba(0,90,180,0.22))";
                el.style.boxShadow = "0 4px 18px rgba(0,0,0,0.35), 0 0 18px rgba(0,160,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "linear-gradient(145deg, rgba(0,100,180,0.22), rgba(0,60,140,0.14))";
                el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)";
              }}>
              <ArrowLeft style={{ width:14, height:14 }}/>
            </motion.button>

            {icon && (
              <div style={{
                width:34, height:34, borderRadius:12, flexShrink:0,
                background: "linear-gradient(145deg, rgba(0,100,180,0.2), rgba(0,60,140,0.12))",
                border: "1px solid rgba(0,160,255,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
                {icon}
              </div>
            )}

            <div style={{ minWidth:0 }}>
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:800,
                letterSpacing:"0.18em", color:"hsl(192,100%,68%)",
                textShadow:"0 0 16px hsla(192,100%,52%,0.8)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const,
              }}>{title}</div>
              {subtitle && (
                <div style={{
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:7.5, letterSpacing:"0.12em",
                  color:"hsla(192,100%,52%,0.38)", marginTop:2,
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
