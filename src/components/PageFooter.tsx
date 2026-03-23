export default function PageFooter() {
  return (
    <div className="relative z-[1] py-3 text-center border-t flex items-center justify-center gap-4"
      style={{ borderColor:"hsla(38,50%,20%,0.3)", background:"hsla(25,12%,6%,0.6)", backdropFilter:"blur(10px)" }}>
      <div className="flex items-center gap-4 font-mono text-[11px] font-semibold">
        <span style={{ color:"hsla(38,70%,62%,0.75)" }}>
          BIMS v1.0 · © 2026&nbsp;
          <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer"
            style={{ color:"hsl(38,90%,72%)", textDecoration:"underline", textUnderlineOffset:"3px", textShadow:"0 0 8px hsla(38,90%,62%,0.45)" }}>
            KUMI
          </a>
        </span>
        <span className="w-1 h-1 rounded-full" style={{ background:"hsla(38,80%,55%,0.4)" }}/>
        <span style={{ color:"hsla(38,65%,58%,0.6)" }}>ENCRYPTED CHANNEL</span>
      </div>
    </div>
  );
}
