export default function PageFooter() {
  return (
    <div style={{
      position:"relative", zIndex:1,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"10px 24px", gap:16,
      background:"rgba(0,4,14,0.88)",
      borderTop:"1px solid rgba(0,160,220,0.1)",
      borderLeft:"3px solid rgba(0,229,255,0.25)",
      backdropFilter:"blur(20px)",
    }}>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:500,
        color:"rgba(0,180,255,0.42)", letterSpacing:"0.06em" }}>
        BIMS v1.0 · © 2026{" "}
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
          style={{ color:"rgba(0,229,255,0.6)", textDecoration:"underline", textUnderlineOffset:3 }}>
          KUMI
        </a>
      </span>
      <span style={{ width:1, height:12, background:"rgba(0,180,255,0.2)", display:"inline-block" }}/>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10,
        color:"rgba(0,150,200,0.32)", letterSpacing:"0.06em" }}>
        ENCRYPTED · AES-256
      </span>
    </div>
  );
}
