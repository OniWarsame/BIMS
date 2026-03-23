export default function PageFooter() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:16,
      padding:"10px 32px",
      background:"rgba(2,6,16,0.88)",
      backdropFilter:"blur(22px)",
      borderTop:"1px solid hsla(200,100%,60%,0.22)",
      boxShadow:"0 -1px 0 hsla(200,100%,60%,0.08)",
    }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:500,
        color:"hsl(38,80%,72%)", letterSpacing:"0.05em" }}>
        BIMS v1.0 · © 2026{" "}
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
          style={{ color:"hsl(200,100%,76%)", textDecoration:"underline", textUnderlineOffset:3,
            textShadow:"0 0 10px hsla(200,100%,65%,0.65)" }}>KUMI</a>
      </span>
      <span style={{ width:3, height:3, borderRadius:"50%",
        background:"hsla(200,100%,60%,0.55)", display:"inline-block" }}/>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
        color:"hsl(200,80%,72%)", letterSpacing:"0.05em" }}>
        ENCRYPTED CHANNEL · AES-256
      </span>
    </div>
  );
}
