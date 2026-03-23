export default function PageFooter() {
  return (
    <div style={{
      position:"relative", zIndex:1,
      display:"flex", alignItems:"center", justifyContent:"center", gap:16,
      padding:"10px 32px",
      background:"rgba(3,8,28,0.88)",
      backdropFilter:"blur(20px) saturate(1.5)",
      WebkitBackdropFilter:"blur(20px) saturate(1.5)",
      borderTop:"1px solid rgba(0,150,220,0.14)",
      boxShadow:"0 -1px 0 rgba(0,200,255,0.06)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500, color:"rgba(255,175,80,0.7)", letterSpacing:"0.06em" }}>
          BIMS v1.0 · © 2026{" "}
          <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
            style={{ color:"rgba(0,220,255,0.65)", textDecoration:"underline", textUnderlineOffset:3, textShadow:"0 0 10px rgba(0,200,255,0.5)" }}>
            KUMI
          </a>
        </span>
        <span style={{ width:1, height:12, background:"rgba(0,160,220,0.2)", display:"inline-block" }}/>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500, color:"rgba(0,180,255,0.38)", letterSpacing:"0.06em" }}>
          ENCRYPTED · AES-256
        </span>
      </div>
    </div>
  );
}
