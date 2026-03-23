import React from "react";

/*
 ╔══════════════════════════════════════════════════════════════╗
 ║  BIMS  —  Unique Biometric Icon Set                          ║
 ║  Inspired by bio_theme.jpg visual language:                  ║
 ║   • Hand/fingerprint recognition system                      ║
 ║   • Face mesh wireframe                                      ║
 ║   • DNA double helix                                         ║
 ║   • Voice/signal waveform                                    ║
 ║   • Ear identification                                       ║
 ║   • Progress bar HUD indicators                             ║
 ║  All icons are pure SVG, animated via CSS, iOS-inspired.    ║
 ╚══════════════════════════════════════════════════════════════╝
*/

interface IconProps { size?: number; color?: string; className?: string; animated?: boolean; }

const D = (a: number) => `hsla(${a})`;

/* ── Fingerprint Scanner — concentric arcs with scan line ── */
export const IconFingerprint = ({ size=24, color="hsl(200,100%,65%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes fpScan { 0%{opacity:0;transform:translateY(-6px)} 50%{opacity:1} 100%{opacity:0;transform:translateY(6px)} }
        .fp-scan { animation: fpScan 1.8s ease-in-out infinite; transform-origin: center; }
      `}</style>
    )}
    {/* Outer ring */}
    <path d="M12 2C6.48 2 2 6.48 2 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    <path d="M22 12c0 5.52-4.48 10-10 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    {/* Concentric arcs */}
    <path d="M12 5C7.58 5 4 8.58 4 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M20 13c0 4.42-3.58 8-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M12 8C9.24 8 7 10.24 7 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    <path d="M17 13c0 2.76-2.24 5-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    <path d="M12 11c-.55 0-1 .45-1 1v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    {/* Scan line */}
    {animated && (
      <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1" strokeLinecap="round"
        opacity="0.7" className="fp-scan"/>
    )}
    {/* Center dot */}
    <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.9"/>
  </svg>
);

/* ── Face Mesh — wireframe like the image's 3D face ── */
export const IconFaceMesh = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Head outline */}
    <ellipse cx="12" cy="10" rx="6" ry="7.5" stroke={color} strokeWidth="1" opacity="0.5"/>
    {/* Mesh lines horizontal */}
    <path d="M7 7h10M7 10h10M7 13h10" stroke={color} strokeWidth="0.6" opacity="0.35"/>
    {/* Mesh lines vertical */}
    <path d="M9 3v13M12 2.5v14M15 3v13" stroke={color} strokeWidth="0.6" opacity="0.35"/>
    {/* Eyes */}
    <circle cx="9.5" cy="9.5" r="1.2" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="14.5" cy="9.5" r="1.2" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="9.5" cy="9.5" r="0.4" fill={color} opacity="0.8"/>
    <circle cx="14.5" cy="9.5" r="0.4" fill={color} opacity="0.8"/>
    {/* Nose bridge */}
    <path d="M11 11.5 L10.5 13 L11.5 13.5 L12.5 13 L12 11.5" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7"/>
    {/* Chin */}
    <path d="M9 15.5 Q12 18 15 15.5" stroke={color} strokeWidth="1" fill="none" opacity="0.6"/>
    {/* Neck */}
    <path d="M10.5 17.5 L10.5 20M13.5 17.5 L13.5 20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    {/* Scan dots at nodes */}
    {[[7,7],[12,7],[17,7],[7,10],[17,10],[7,13],[12,13],[17,13]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.8" fill={color} opacity="0.45"/>
    ))}
  </svg>
);

/* ── DNA Helix — double strand like image DNA panel ── */
export const IconDNA = ({ size=24, color="hsl(30,100%,60%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes dnaR { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
        .dna-wrap { transform-origin: 50% 50%; }
      `}</style>
    )}
    {/* Left strand */}
    <path d="M7 2 Q10 6 7 10 Q4 14 7 18 Q10 22 7 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Right strand */}
    <path d="M17 2 Q14 6 17 10 Q20 14 17 18 Q14 22 17 22" stroke="hsl(200,100%,65%)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Rungs */}
    {[4,7,10,13,16,19].map((y,i) => (
      <line key={i} x1={i%2===0?"7.5":"8"} y1={y} x2={i%2===0?"16.5":"16"} y2={y}
        stroke={i%2===0?color:"hsl(200,100%,65%)"} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    ))}
    {/* Rung dots */}
    {[4,7,10,13,16,19].map((y,i) => (
      <React.Fragment key={i}>
        <circle cx={i%2===0?7.5:8} cy={y} r="1.2" fill={color} opacity="0.9"/>
        <circle cx={i%2===0?16.5:16} cy={y} r="1.2" fill="hsl(200,100%,65%)" opacity="0.9"/>
      </React.Fragment>
    ))}
  </svg>
);

/* ── Voice Waveform — signal wave like image voice panel ── */
export const IconVoiceWave = ({ size=24, color="hsl(30,100%,60%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes waveAnim { 0%,100%{d:path("M1 12 Q4 8 7 12 Q10 16 13 12 Q16 8 19 12 Q22 16 23 12")} 50%{d:path("M1 12 Q4 15 7 12 Q10 9 13 12 Q16 15 19 12 Q22 9 23 12")} }
      `}</style>
    )}
    {/* Primary wave */}
    <path d="M1 12 Q4 7 7 12 Q10 17 13 12 Q16 7 19 12 Q22 17 23 12"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Echo wave */}
    <path d="M1 12 Q4 9.5 7 12 Q10 14.5 13 12 Q16 9.5 19 12 Q22 14.5 23 12"
      stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4"/>
    {/* Vertical bars (equalizer style) */}
    {[3,6,9,12,15,18,21].map((x,i) => {
      const h = [3,5,8,4,6,3,5][i];
      return <line key={i} x1={x} y1={12-h} x2={x} y2={12+h} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>;
    })}
  </svg>
);

/* ── Ear Identification — outline like image's ear panel ── */
export const IconEar = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Outer ear */}
    <path d="M12 2C7.58 2 4 5.58 4 10c0 3.31 1.9 6.18 4.65 7.6L9.5 22h5l0.85-4.4C18.1 16.18 20 13.31 20 10 20 5.58 16.42 2 12 2z"
      stroke={color} strokeWidth="1.2" fill="none" opacity="0.7"/>
    {/* Inner canal */}
    <path d="M12 6c-2.21 0-4 1.79-4 4 0 1.48.82 2.77 2 3.46"
      stroke={color} strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M12 8c-1.1 0-2 .9-2 2 0 .74.41 1.38 1 1.73"
      stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
    {/* Center */}
    <circle cx="12" cy="10" r="1.5" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="12" cy="10" r="0.5" fill={color} opacity="0.8"/>
    {/* Measurement marks */}
    {[45,90,135,225,270,315].map((deg,i) => {
      const rad = deg * Math.PI / 180;
      const r1=8, r2=9;
      return <line key={i} x1={12+r1*Math.cos(rad)} y1={10+r1*Math.sin(rad)} x2={12+r2*Math.cos(rad)} y2={10+r2*Math.sin(rad)} stroke={color} strokeWidth="0.8" opacity="0.45"/>;
    })}
  </svg>
);

/* ── Eye / Iris Scanner ── */
export const IconEyeScan = ({ size=24, color="hsl(200,100%,65%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes irisRot { from{transform:rotate(0deg);transform-origin:12px 12px} to{transform:rotate(360deg);transform-origin:12px 12px} }
        .iris-ring { animation: irisRot 4s linear infinite; }
      `}</style>
    )}
    {/* Eye outline */}
    <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" stroke={color} strokeWidth="1.4" fill="none" opacity="0.7"/>
    {/* Iris */}
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.2" fill="none"/>
    {/* Iris texture ring */}
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="0.6" strokeDasharray="1.5 1" fill="none" opacity="0.6"
      className={animated ? "iris-ring" : ""}/>
    {/* Pupil */}
    <circle cx="12" cy="12" r="1.8" fill={color} opacity="0.85"/>
    {/* Highlight */}
    <circle cx="13" cy="11" r="0.6" fill="white" opacity="0.6"/>
    {/* Corner scan brackets */}
    {[[3,5],[21,5],[3,19],[21,19]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="0.8" fill={color} opacity="0.5"/>
    ))}
  </svg>
);

/* ── Shield / Security — iOS-style ── */
export const IconShieldBio = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Shield */}
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6L12 2z"
      stroke={color} strokeWidth="1.4" fill="none"/>
    <path d="M12 4L6 7.2V12c0 3.94 2.62 7.64 6 8.55 3.38-.91 6-4.61 6-8.55V7.2L12 4z"
      fill={color} opacity="0.08"/>
    {/* Inner circuit */}
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Tech dots */}
    {[[8,8],[16,8],[12,17]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.8" fill={color} opacity="0.5"/>
    ))}
  </svg>
);

/* ── Database / Vault ── */
export const IconVault = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Cylinder stacks */}
    <ellipse cx="12" cy="6" rx="8" ry="2.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <ellipse cx="12" cy="12" rx="8" ry="2.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <ellipse cx="12" cy="18" rx="8" ry="2.5" stroke={color} strokeWidth="1.3" fill="none"/>
    {/* Sides */}
    <line x1="4" y1="6" x2="4" y2="18" stroke={color} strokeWidth="1.3" opacity="0.7"/>
    <line x1="20" y1="6" x2="20" y2="18" stroke={color} strokeWidth="1.3" opacity="0.7"/>
    {/* Bolt indicators */}
    {[8,14].map(x => (
      <React.Fragment key={x}>
        <circle cx={x} cy="6" r="0.8" fill={color} opacity="0.7"/>
        <circle cx={x} cy="12" r="0.8" fill={color} opacity="0.7"/>
        <circle cx={x} cy="18" r="0.8" fill={color} opacity="0.7"/>
      </React.Fragment>
    ))}
  </svg>
);

/* ── Search / OSINT ── */
export const IconOSINT = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Target circle */}
    <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.3" fill="none"/>
    <circle cx="10" cy="10" r="4" stroke={color} strokeWidth="0.8" fill="none" opacity="0.6"/>
    <circle cx="10" cy="10" r="1.5" fill={color} opacity="0.85"/>
    {/* Crosshairs */}
    <line x1="10" y1="3" x2="10" y2="6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <line x1="10" y1="14" x2="10" y2="17" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <line x1="3" y1="10" x2="6" y2="10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <line x1="14" y1="10" x2="17" y2="10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    {/* Handle */}
    <line x1="15.5" y1="15.5" x2="22" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Network dots */}
    {[[19,6],[22,10],[19,14]].map(([x,y],i)=>(
      <React.Fragment key={i}>
        <circle cx={x} cy={y} r="1.2" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4"/>
        <line x1="17" y1="10" x2={x} y2={y} stroke={color} strokeWidth="0.6" opacity="0.2"/>
      </React.Fragment>
    ))}
  </svg>
);

/* ── User / Identity ── */
export const IconIdentity = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Head */}
    <circle cx="12" cy="7.5" r="4" stroke={color} strokeWidth="1.4" fill="none"/>
    {/* Body arc */}
    <path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Scan lines on face */}
    <line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="0.7" opacity="0.45"/>
    <line x1="9.5" y1="8.5" x2="14.5" y2="8.5" stroke={color} strokeWidth="0.7" opacity="0.35"/>
    {/* Biometric corners on face */}
    {[[8,3.5,1,1],[16,3.5,-1,1],[8,11.5,1,-1],[16,11.5,-1,-1]].map(([x,y,dx,dy],i)=>(
      <path key={i} d={`M${x+dx*2} ${y} L${x} ${y} L${x} ${y+dy*2}`} stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
    ))}
  </svg>
);

/* ── Users / Team ── */
export const IconUsers = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <circle cx="17" cy="8" r="2.8" stroke={color} strokeWidth="1.1" fill="none" opacity="0.7"/>
    <path d="M2 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <path d="M17 14c2.21 0 4 1.79 4 4v2" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7"/>
    {/* Connection dots */}
    <circle cx="9" cy="7" r="1" fill={color} opacity="0.7"/>
    <circle cx="17" cy="8" r="0.8" fill={color} opacity="0.6"/>
  </svg>
);

/* ── Report / File Analytics ── */
export const IconReport = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Page */}
    <path d="M4 4h10l4 4v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M14 4v4h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
    {/* Data bars (like image's progress bars) */}
    <line x1="7" y1="11" x2="14" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
    <line x1="7" y1="14" x2="12" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    <line x1="7" y1="17" x2="16" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    {/* Bar accent fills */}
    <line x1="7" y1="11" x2="10" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── Document Generator ── */
export const IconGenerate = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Base doc */}
    <path d="M4 3h10l4 4v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3z" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M14 3v4h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
    {/* Spark / generate icon */}
    <path d="M11 10L9 14h3l-2 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Stars */}
    {[[16,9],[18,13],[15,16]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.7" fill={color} opacity={0.7-i*0.15}/>
    ))}
  </svg>
);

/* ── Bell / Notification ── */
export const IconBell = ({ size=24, color="hsl(200,100%,65%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes bellRing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(12deg)} 40%{transform:rotate(-10deg)} 60%{transform:rotate(8deg)} 80%{transform:rotate(-6deg)} }
        .bell-body { animation: bellRing 0.6s ease-in-out; transform-origin: top center; }
      `}</style>
    )}
    <g className={animated?"bell-body":""}>
      <path d="M12 2a7 7 0 00-7 7v5l-2 2v1h18v-1l-2-2V9a7 7 0 00-7-7z" stroke={color} strokeWidth="1.3" fill="none"/>
    </g>
    <path d="M10 19a2 2 0 004 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    {/* Signal rings */}
    <path d="M5 6a8 8 0 0114 0" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35"/>
  </svg>
);

/* ── Message / DM ── */
export const IconMessage = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 5h18a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 3V6a1 1 0 011-1z" stroke={color} strokeWidth="1.3" fill="none"/>
    {/* Message dots */}
    <circle cx="9" cy="11" r="1" fill={color} opacity="0.7"/>
    <circle cx="12" cy="11" r="1" fill={color} opacity="0.7"/>
    <circle cx="15" cy="11" r="1" fill={color} opacity="0.7"/>
    {/* Encrypt indicator */}
    <path d="M17 6l1 1-1 1" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

/* ── Settings / Gear ── */
export const IconSettings = ({ size=24, color="hsl(200,100%,65%)", className="", animated=false }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {animated && (
      <style>{`
        @keyframes gearSpin { from{transform:rotate(0deg);transform-origin:12px 12px} to{transform:rotate(360deg);transform-origin:12px 12px} }
        .gear-anim { animation: gearSpin 3s linear infinite; }
      `}</style>
    )}
    <g className={animated?"gear-anim":""}>
      {/* Gear teeth */}
      {[0,45,90,135,180,225,270,315].map((deg,i)=>{
        const rad=deg*Math.PI/180;
        const ix=12+9*Math.cos(rad), iy=12+9*Math.sin(rad);
        const ox=12+7*Math.cos(rad), oy=12+7*Math.sin(rad);
        return <line key={i} x1={ix} y1={iy} x2={ox} y2={oy} stroke={color} strokeWidth="2.2" strokeLinecap="round"/>;
      })}
      <circle cx="12" cy="12" r="6.5" stroke={color} strokeWidth="1.3" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1" fill="none" opacity="0.7"/>
      <circle cx="12" cy="12" r="1.2" fill={color} opacity="0.8"/>
    </g>
  </svg>
);

/* ── Profile / Person ── */
export const IconProfile = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* ID card */}
    <rect x="2" y="4" width="20" height="16" rx="2.5" stroke={color} strokeWidth="1.3" fill="none"/>
    {/* Photo area */}
    <rect x="4" y="7" width="7" height="8" rx="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.6"/>
    <circle cx="7.5" cy="10" r="2" stroke={color} strokeWidth="0.9" fill="none"/>
    <path d="M5 15c0-1.38 1.12-2.5 2.5-2.5S10 13.62 10 15" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.8"/>
    {/* Data lines */}
    <line x1="13" y1="9" x2="19" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <line x1="13" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    <line x1="13" y1="15" x2="18" y2="15" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    {/* Chip */}
    <rect x="14" y="11" width="4" height="3" rx="0.5" stroke={color} strokeWidth="0.8" fill="none" opacity="0.35"/>
  </svg>
);

/* ── Logout / Exit ── */
export const IconLogout = ({ size=24, color="hsl(0,85%,62%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Door */}
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Arrow */}
    <path d="M16 17l5-5-5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    {/* Alert dots */}
    <circle cx="6" cy="12" r="0.8" fill={color} opacity="0.6"/>
  </svg>
);

/* ── Headphones / Support ── */
export const IconSupport = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 12a9 9 0 0118 0" stroke={color} strokeWidth="1.4" fill="none"/>
    <rect x="2" y="13" width="3" height="5" rx="1.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <rect x="19" y="13" width="3" height="5" rx="1.5" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M5 18v1a3 3 0 003 3h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    {/* Sound waves */}
    <path d="M11 20h2" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    <circle cx="12" cy="9" r="1" fill={color} opacity="0.4"/>
  </svg>
);

/* ── Camera / Face capture ── */
export const IconCamera = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth="1.3" fill="none"/>
    {/* Lens rings */}
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="13" r="2.5" stroke={color} strokeWidth="0.8" fill="none" opacity="0.6"/>
    <circle cx="12" cy="13" r="1.2" fill={color} opacity="0.7"/>
    {/* Highlight */}
    <circle cx="14" cy="11" r="0.7" fill="white" opacity="0.5"/>
    {/* Corner marks */}
    {[[4,9],[6,9],[4,11]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="0.5" fill={color} opacity="0.4"/>)}
  </svg>
);

/* ── Arrow Left / Back ── */
export const IconBack = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M11 6l-6 6 6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Trailing dot */}
    <circle cx="19" cy="12" r="1" fill={color} opacity="0.5"/>
  </svg>
);

/* ── WiFi / Network Status ── */
export const IconNetwork = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12.55a11 11 0 0114.08 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <path d="M1.42 9a16 16 0 0121.16 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M8.53 16.11a6 6 0 016.95 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.8"/>
    <circle cx="12" cy="20" r="1.5" fill={color}/>
    {/* Signal pulses */}
    <circle cx="12" cy="20" r="3" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3"/>
  </svg>
);

/* ── Lock / Secure ── */
export const IconLock = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="11" width="16" height="11" rx="3" stroke={color} strokeWidth="1.4" fill="none"/>
    <path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Keyhole */}
    <circle cx="12" cy="16" r="2" stroke={color} strokeWidth="1.1" fill="none"/>
    <line x1="12" y1="18" x2="12" y2="20" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
    {/* Glow dots on shackle */}
    <circle cx="8" cy="11" r="0.8" fill={color} opacity="0.5"/>
    <circle cx="16" cy="11" r="0.8" fill={color} opacity="0.5"/>
  </svg>
);

/* ── Plus / Add ── */
export const IconAdd = ({ size=24, color="hsl(200,100%,65%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.3" fill="none" opacity="0.5"/>
    <line x1="12" y1="7" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── Check / Verified ── */
export const IconVerified = ({ size=24, color="hsl(140,100%,50%)", className="" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.3" fill="none" opacity="0.5"/>
    <path d="M7 12.5l3.5 3.5 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Shimmer dot */}
    <circle cx="18" cy="6" r="1.5" fill={color} opacity="0.6"/>
  </svg>
);

export default {
  IconFingerprint, IconFaceMesh, IconDNA, IconVoiceWave, IconEar,
  IconEyeScan, IconShieldBio, IconVault, IconOSINT, IconIdentity,
  IconUsers, IconReport, IconGenerate, IconBell, IconMessage,
  IconSettings, IconProfile, IconLogout, IconSupport, IconCamera,
  IconBack, IconNetwork, IconLock, IconAdd, IconVerified,
};
