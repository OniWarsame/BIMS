export default function PageFooter() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:16,
      padding:"10px 32px",
      background:"rgba(3,8,22,0.72)",
      backdropFilter:"blur(40px) saturate(180%)",
      WebkitBackdropFilter:"blur(40px) saturate(180%)",
      borderTop:"0.5px solid rgba(255,255,255,0.08)",
      boxShadow:"0 -1px 0 rgba(0,200,255,0.06)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16,
        fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:400 }}>
        <span style={{ color:"hsl(38,80%,72%)" }}>
          BIMS v1.0 · © 2026{" "}
          <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
            style={{ color:"hsl(200,100%,72%)", textDecoration:"none",
              borderBottom:"1px solid rgba(0,200,255,0.35)", paddingBottom:1 }}>
            KUMI
          </a>
        </span>
        <span style={{ width:3, height:3, borderRadius:"50%",
          background:"rgba(0,200,255,0.45)", display:"inline-block" }}/>
        <span style={{ color:"rgba(0,180,255,0.45)", letterSpacing:"0.04em" }}>
          ENCRYPTED · AES-256
        </span>
      </div>
    </div>
  );
}
