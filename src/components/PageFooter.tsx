/* Footer extracted from Index.tsx footer style */
export default function PageFooter() {
  return (
    <div className="flex items-center justify-center gap-4"
      style={{
        padding: "10px 32px",
        background: "hsla(215,55%,5%,0.96)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid hsla(192,80%,40%,0.28)",
      }}>
      <div className="flex items-center gap-4" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600 }}>
        <span style={{ color:"hsl(38,80%,72%)" }}>
          BIMS v1.0 · © 2026&nbsp;
          <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
            style={{ color:"hsl(185,100%,76%)", textDecoration:"underline", textUnderlineOffset:"3px",
              textShadow:"0 0 10px hsla(185,100%,62%,0.6)" }}>
            KUMI
          </a>
        </span>
        <span style={{ width:4, height:4, borderRadius:"50%", background:"hsla(192,100%,60%,0.5)", display:"inline-block" }}/>
        <span style={{ color:"hsl(195,80%,72%)" }}>ENCRYPTED CHANNEL</span>
      </div>
    </div>
  );
}
