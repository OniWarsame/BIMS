export default function PageFooter() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:20,
      padding:"12px 32px",
      background:"rgba(2,6,18,0.6)",
      backdropFilter:"blur(40px) saturate(160%)",
      WebkitBackdropFilter:"blur(40px) saturate(160%)",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:400,
        color:"rgba(120,160,220,0.5)", letterSpacing:"0.02em" }}>
        © 2026{" "}
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
          style={{ color:"rgba(100,170,255,0.7)", textDecoration:"none",
            borderBottom:"1px solid rgba(80,150,255,0.3)", paddingBottom:1 }}>
          Kumi Technologies
        </a>
      </span>
      <span style={{ width:3, height:3, borderRadius:"50%",
        background:"rgba(80,140,255,0.35)", display:"inline-block" }}/>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11,
        color:"rgba(80,140,220,0.38)", letterSpacing:"0.04em" }}>
        Nexus BIMS v1.0
      </span>
      <span style={{ width:3, height:3, borderRadius:"50%",
        background:"rgba(80,140,255,0.35)", display:"inline-block" }}/>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11,
        color:"rgba(80,140,220,0.38)", letterSpacing:"0.04em" }}>
        AES-256 Encrypted
      </span>
    </div>
  );
}
