export default function PageFooter() {
  return (
    <div style={{
      display:"flex",alignItems:"center",justifyContent:"center",gap:20,
      padding:"12px 32px",
      background:"rgba(2,4,15,0.65)",
      backdropFilter:"blur(40px) saturate(160%)",
      WebkitBackdropFilter:"blur(40px) saturate(160%)",
      borderTop:"1px solid rgba(255,255,255,0.06)",
      boxShadow:"0 -1px 0 rgba(50,120,255,0.08)",
    }}>
      <span style={{fontFamily:"'Exo 2',-apple-system,sans-serif",fontSize:12,fontWeight:400,color:"rgba(100,155,225,0.45)",letterSpacing:"0.02em"}}>
        © 2026{" "}
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
          style={{color:"rgba(100,175,255,0.65)",textDecoration:"none",borderBottom:"1px solid rgba(80,150,255,0.28)",paddingBottom:1}}>
          Kumi Technologies
        </a>
      </span>
      <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(70,130,255,0.3)",display:"inline-block"}}/>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(70,130,215,0.35)",letterSpacing:"0.04em"}}>
        Nexus BIMS v1.0
      </span>
      <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(70,130,255,0.3)",display:"inline-block"}}/>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(70,130,215,0.35)",letterSpacing:"0.04em"}}>
        AES-256 Encrypted
      </span>
    </div>
  );
}
