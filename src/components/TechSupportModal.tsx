import React, { useState } from "react";
import { useLang, t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { X, Headphones, Send, CheckCircle, AlertTriangle, Loader2, ArrowLeft, ChevronDown, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export interface TechSupportModalProps {
  open: boolean;
  onClose: () => void;
  reporterUsername?: string;
  allowManualReporter?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ISSUES = [
  { value:"cant_login",     label:"Can't Login",                 icon:"🔒", color:"hsl(0,85%,62%)" },
  { value:"biometric_fail", label:"Biometric Scan Failure",      icon:"🖐️", color:"hsl(193,100%,60%)" },
  { value:"access_denied",  label:"Access Denied / Permission",  icon:"⛔", color:"hsl(20,100%,62%)" },
  { value:"data_missing",   label:"Missing / Incorrect Data",    icon:"📂", color:"hsl(42,100%,65%)" },
  { value:"system_slow",    label:"System Slow / Unresponsive",  icon:"🐢", color:"hsl(42,100%,60%)" },
  { value:"scan_error",     label:"Scanner Hardware Error",      icon:"⚠️", color:"hsl(38,100%,58%)" },
  { value:"export_issue",   label:"Export / Report Issue",       icon:"📄", color:"hsl(260,80%,68%)" },
  { value:"account_locked", label:"Account Locked / Suspended",  icon:"🔐", color:"hsl(340,80%,62%)" },
  { value:"other",          label:"Other Issue",                 icon:"💬", color:"hsl(165,80%,55%)" },
];

const PRIORITY = [
  { value:"low",      label:"LOW",      sublabel:"Non-urgent",    color:"hsl(142,80%,55%)",  bg:"hsla(142,80%,52%,0.1)"  },
  { value:"medium",   label:"MEDIUM",   sublabel:"Needs attention",color:"hsl(42,100%,60%)", bg:"hsla(42,100%,58%,0.1)"  },
  { value:"high",     label:"HIGH",     sublabel:"Blocking work",  color:"hsl(20,100%,60%)",  bg:"hsla(20,100%,58%,0.1)"  },
  { value:"critical", label:"CRITICAL", sublabel:"System down",    color:"hsl(0,90%,60%)",    bg:"hsla(0,90%,58%,0.1)"    },
];

export default function TechSupportModal({
  open, onClose, reporterUsername, allowManualReporter, showBackButton, onBack
}: TechSupportModalProps) {
  const [issue,          setIssue]          = useState("");
  const [priority,       setPriority]       = useState("medium");
  const [description,    setDescription]    = useState("");
  const [issueOpen,      setIssueOpen]      = useState(false);
  const [manualReporter, setManualReporter] = useState("");
  const [sending,        setSending]        = useState(false);
  const [sent,           setSent]           = useState(false);
  const [error,          setError]          = useState("");

  // Always read the live session — this overrides any stale prop
  const liveUser = getCurrentUser();
  const liveUsername = liveUser?.username || reporterUsername || "";

  const effectiveReporter = allowManualReporter
    ? manualReporter.trim()
    : liveUsername;
  const selectedIssue    = ISSUES.find(i => i.value === issue);
  const selectedPriority = PRIORITY.find(p => p.value === priority)!;
  const lang = useLang();
  const ticketId = `TKT-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const handleSubmit = () => {
    if (allowManualReporter && !manualReporter.trim()) { setError("Please enter your name or username"); return; }
    if (!issue)             { setError("Please select an issue type"); return; }
    if (!description.trim()){ setError("Please describe your issue"); return; }
    setError(""); setSending(true);
    try {
      const tickets = JSON.parse(localStorage.getItem("bims_tickets") || "[]");
      tickets.unshift({
        id: ticketId, issue: selectedIssue?.label, issueCode: issue,
        priority, description: description.trim(),
        reporter: effectiveReporter || "anonymous",
        createdAt: new Date().toISOString(), status: "open",
      });
      localStorage.setItem("bims_tickets", JSON.stringify(tickets));
    } catch {}
    setTimeout(() => { setSending(false); setSent(true); }, 1100);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIssue(""); setPriority("medium"); setDescription("");
      setSent(false); setSending(false); setError(""); setIssueOpen(false);
      if (allowManualReporter) setManualReporter("");
    }, 300);
  };

  /* ─── field style helpers ─── */
  const fieldLabel = {
    fontFamily:"'Orbitron','Courier New',monospace",
    fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
    color: "hsla(192,100%,68%,0.65)", textTransform: "uppercase" as const,
    marginBottom: 6, display: "block",
  };
  const inputBase: React.CSSProperties = {
    width: "100%", boxSizing: "border-box" as const,
    background: "hsla(215,55%,4%,0.85)",
    border: "1px solid hsla(192,100%,52%,0.3)",
    borderRadius: 6, outline: "none",
    color: "hsl(192,60%,92%)",
    fontFamily: "'Rajdhani','Segoe UI',sans-serif",
    fontSize: 14, fontWeight: 600,
    padding: "10px 14px",
    transition: "all 0.18s",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background:"hsla(215,60%,3%,0.75)", backdropFilter:"blur(10px)" }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={handleClose}>

          <motion.div
            className="w-full max-w-[480px] relative"
            style={{
              background: "linear-gradient(160deg, hsla(215,55%,7%,0.99) 0%, hsla(215,55%,4%,0.99) 100%)",
              border: "1px solid hsla(192,100%,52%,0.32)",
              borderTop: "2px solid hsla(192,100%,60%,0.55)",
              borderRadius: 12,
              boxShadow: "0 0 0 1px hsla(192,100%,52%,0.06), 0 0 60px hsla(192,100%,52%,0.14), 0 40px 80px rgba(0,0,0,0.78)",
              overflow: "hidden",
            }}
            initial={{ scale:0.94, y:24, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.94, y:24, opacity:0 }}
            transition={{ duration:0.24, ease:"easeOut" }}
            onClick={e => e.stopPropagation()}>

            {/* Top glow bar */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:"linear-gradient(90deg,transparent,hsla(192,100%,65%,0.8),transparent)" }}/>

            {/* Corner brackets */}
            {[["top-2 left-2","border-t border-l"],["top-2 right-2","border-t border-r"],
              ["bottom-2 left-2","border-b border-l"],["bottom-2 right-2","border-b border-r"]].map(([pos,cls],i)=>(
              <motion.div key={i} className={`absolute w-3.5 h-3.5 ${pos} ${cls} pointer-events-none`}
                style={{ borderColor:"hsla(192,100%,55%,0.4)" }}
                animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:2.2, delay:i*0.35, repeat:Infinity }}/>
            ))}

            {/* ─── HEADER ─── */}
            <div className="flex items-center gap-4 px-6 pt-5 pb-4"
              style={{ borderBottom:"1px solid hsla(192,60%,25%,0.2)" }}>
              {showBackButton && (
                <button onClick={()=>{ handleClose(); onBack?.(); }}
                  className="flex items-center gap-1.5 transition-all flex-shrink-0"
                  style={{ fontFamily:"'Orbitron',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.16em",
                    color:"hsla(192,80%,60%,0.55)", border:"none", background:"none", cursor:"pointer", padding:0 }}
                  onMouseEnter={e=>e.currentTarget.style.color="hsl(193,100%,72%)"}
                  onMouseLeave={e=>e.currentTarget.style.color="hsla(192,80%,60%,0.55)"}>
                  <ArrowLeft size={12}/> BACK
                </button>
              )}

              {/* Icon */}
              <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:"hsla(192,100%,52%,0.1)", border:"1.5px solid hsla(192,100%,55%,0.42)",
                  boxShadow:"0 0 20px hsla(192,100%,52%,0.2)" }}
                animate={{ boxShadow:["0 0 20px hsla(192,100%,52%,0.2)","0 0 36px hsla(192,100%,52%,0.38)","0 0 20px hsla(192,100%,52%,0.2)"] }}
                transition={{ duration:3, repeat:Infinity }}>
                <Headphones size={20} style={{ color:"hsl(193,100%,68%)", filter:"drop-shadow(0 0 8px hsla(192,100%,55%,0.9))" }}/>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h2 style={{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:900,
                  letterSpacing:"0.18em", color:"hsl(193,100%,72%)",
                  textShadow:"0 0 20px hsla(192,100%,58%,0.8)", margin:0 }}>
                  {t("tec_title",lang)}
                </h2>
                <p style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:"0.24em",
                  color:"hsla(192,80%,55%,0.4)", margin:"3px 0 0" }}>
                  SUBMIT A SUPPORT TICKET
                </p>
              </div>

              <button onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
                style={{ color:"hsla(192,70%,55%,0.4)", border:"1px solid hsla(192,50%,28%,0.22)" }}
                onMouseEnter={e=>{e.currentTarget.style.background="hsla(192,70%,42%,0.14)";e.currentTarget.style.color="hsl(193,100%,72%)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="hsla(192,70%,55%,0.4)";}}>
                <X size={14}/>
              </button>
            </div>

            {/* ─── BODY ─── */}
            <div className="px-6 pb-6 pt-4" style={{ overflowY:"auto", maxHeight:"70vh" }}>
              <AnimatePresence mode="wait">

                {/* ── SUCCESS ── */}
                {sent ? (
                  <motion.div key="success"
                    initial={{ opacity:0, scale:0.94, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0 }}
                    className="text-center py-6">
                    <motion.div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background:"hsla(192,100%,52%,0.1)", border:"1.5px solid hsla(192,100%,55%,0.5)",
                        boxShadow:"0 0 40px hsla(192,100%,52%,0.22)" }}
                      initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:280, delay:0.1 }}>
                      <CheckCircle size={30} style={{ color:"hsl(193,100%,68%)", filter:"drop-shadow(0 0 10px hsla(192,100%,55%,0.9))" }}/>
                    </motion.div>
                    <h3 style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:800,
                      letterSpacing:"0.2em", color:"hsl(193,100%,72%)", marginBottom:6 }}>
                      TICKET SUBMITTED
                    </h3>
                    <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:"hsla(192,80%,65%,0.6)", marginBottom:16 }}>
                      Your issue has been logged. Admin will respond shortly.
                    </p>
                    {/* Summary card */}
                    <div className="text-left rounded-lg p-4 mb-5 space-y-2"
                      style={{ background:"hsla(215,55%,4%,0.9)", border:"1px solid hsla(192,60%,25%,0.25)" }}>
                      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:"0.2em", color:"hsla(192,80%,55%,0.4)", marginBottom:8 }}>
                        TICKET SUMMARY
                      </div>
                      {[
                        ["TICKET ID", ticketId],
                        ["ISSUE", selectedIssue?.label || ""],
                        ["PRIORITY", selectedPriority.label],
                        ["REPORTER", effectiveReporter || "anonymous"],
                      ].map(([l,v])=>(
                        <div key={l} className="flex justify-between items-center">
                          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:"0.16em", color:"hsla(192,80%,55%,0.4)" }}>{l}</span>
                          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, color:"hsl(192,60%,90%)" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleClose}
                      className="w-full h-10 rounded-lg transition-all"
                      style={{ fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.18em",
                        background:"hsla(192,100%,52%,0.12)", border:"1.5px solid hsla(192,100%,55%,0.55)", color:"hsl(193,100%,72%)" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="hsla(192,100%,52%,0.24)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="hsla(192,100%,52%,0.12)";}}>
                      CLOSE
                    </button>
                  </motion.div>
                ) : (

                  /* ── FORM ── */
                  <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">

                    {/* REPORTED BY */}
                    <div>
                      <label style={fieldLabel}>{t("tec_reported_by",lang)}</label>
                      {allowManualReporter ? (
                        <div style={{ position:"relative" }}>
                          <User size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"hsla(192,80%,55%,0.4)", pointerEvents:"none" }}/>
                          <input
                            type="text"
                            value={manualReporter}
                            onChange={e=>{ setManualReporter(e.target.value); setError(""); }}
                            placeholder="Enter your name or username…"
                            style={{ ...inputBase, paddingLeft:36 }}
                            onFocus={e=>{ e.currentTarget.style.borderColor="hsla(192,100%,55%,0.62)"; e.currentTarget.style.boxShadow="0 0 0 3px hsla(192,100%,52%,0.1)"; }}
                            onBlur={e=>{ e.currentTarget.style.borderColor="hsla(192,100%,52%,0.3)"; e.currentTarget.style.boxShadow="none"; }}
                          />
                        </div>
                      ) : (
                        <div style={{ ...inputBase, display:"flex", alignItems:"center", gap:10,
                          borderColor:"hsla(192,100%,52%,0.22)", opacity:0.8, pointerEvents:"none" }}>
                          <span style={{ width:7, height:7, borderRadius:"50%", background:"hsl(193,100%,58%)",
                            boxShadow:"0 0 8px hsla(192,100%,55%,0.8)", flexShrink:0, display:"inline-block" }}/>
                          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700,
                            letterSpacing:"0.1em", color:"hsl(193,100%,72%)" }}>
                            {liveUsername ? `@${liveUsername.toUpperCase()}` : "NOT LOGGED IN"}
                          </span>
                          <span style={{ marginLeft:"auto", fontFamily:"'Orbitron',monospace", fontSize:7,
                            letterSpacing:"0.18em", color:"hsla(192,80%,55%,0.38)" }}>{t("activelang",lang)}</span>
                        </div>
                      )}
                    </div>

                    {/* ISSUE TYPE */}
                    <div style={{ position:"relative" }}>
                      <label style={fieldLabel}>{t("tec_issue",lang)}</label>
                      <button
                        className="w-full flex items-center gap-3 text-left transition-all"
                        style={{ ...inputBase, padding:"10px 12px",
                          borderColor: issue ? (selectedIssue?.color.replace("hsl","hsla").replace(")","0.7)") || "hsla(192,100%,55%,0.5)") : "hsla(192,100%,52%,0.3)",
                          boxShadow: issue ? `0 0 0 2px ${selectedIssue?.color.replace("hsl","hsla").replace(")","0.12)")}` : "none",
                        }}
                        onClick={()=>setIssueOpen(v=>!v)}>
                        {selectedIssue ? (
                          <>
                            <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{selectedIssue.icon}</span>
                            <span style={{ fontFamily:"'Rajdhani','Segoe UI',sans-serif", fontSize:14, fontWeight:700,
                              letterSpacing:"0.04em", color:selectedIssue.color, flex:1 }}>
                              {selectedIssue.label}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:"hsla(192,60%,55%,0.4)", flex:1 }}>
                            Select issue type…
                          </span>
                        )}
                        <motion.span animate={{ rotate:issueOpen ? 180 : 0 }} transition={{ duration:0.2 }}>
                          <ChevronDown size={15} style={{ color:"hsla(192,80%,55%,0.5)" }}/>
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {issueOpen && (
                          <motion.div
                            style={{ position:"absolute", left:0, right:0, top:"calc(100% + 4px)", zIndex:200,
                              background:"hsla(215,55%,5%,0.99)", border:"1px solid hsla(192,100%,52%,0.3)",
                              borderRadius:8, boxShadow:"0 16px 40px rgba(0,0,0,0.78)", backdropFilter:"blur(14px)",
                              overflow:"hidden" }}
                            initial={{ opacity:0, y:-6, scale:0.97 }}
                            animate={{ opacity:1, y:0, scale:1 }}
                            exit={{ opacity:0, y:-6, scale:0.97 }}
                            transition={{ duration:0.16 }}>
                            {ISSUES.map((opt,i)=>(
                              <button key={opt.value}
                                className="w-full flex items-center gap-3 transition-all"
                                style={{ padding:"10px 14px", textAlign:"left" as const,
                                  borderTop: i > 0 ? "1px solid hsla(192,50%,18%,0.2)" : "none",
                                  background: issue===opt.value ? `${opt.color.replace("hsl","hsla").replace(")",",0.1)")}` : "transparent",
                                  border:"none", cursor:"pointer",
                                }}
                                onMouseEnter={e=>{if(issue!==opt.value)e.currentTarget.style.background="hsla(192,100%,52%,0.07)";}}
                                onMouseLeave={e=>{if(issue!==opt.value)e.currentTarget.style.background="transparent";}}
                                onClick={()=>{ setIssue(opt.value); setIssueOpen(false); setError(""); }}>
                                <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{opt.icon}</span>
                                <span style={{ fontFamily:"'Rajdhani','Segoe UI',sans-serif", fontSize:14, fontWeight:700,
                                  letterSpacing:"0.03em", color: issue===opt.value ? opt.color : "hsl(192,55%,85%)", flex:1 }}>
                                  {opt.label}
                                </span>
                                {issue===opt.value && (
                                  <span style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:opt.color,
                                    letterSpacing:"0.1em", marginLeft:"auto" }}>✓ SELECTED</span>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* PRIORITY */}
                    <div>
                      <label style={fieldLabel}>{t("tec_priority",lang)}</label>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                        {PRIORITY.map(p=>(
                          <button key={p.value} onClick={()=>setPriority(p.value)}
                            className="transition-all"
                            style={{ padding:"10px 4px", borderRadius:7, textAlign:"center" as const, cursor:"pointer",
                              border:`1.5px solid ${priority===p.value ? p.color : "hsla(192,40%,20%,0.28)"}`,
                              background: priority===p.value ? p.bg : "hsla(215,55%,5%,0.7)",
                              boxShadow: priority===p.value ? `0 0 14px ${p.color.replace("hsl","hsla").replace(")",",0.25)")}` : "none",
                            }}
                            onMouseEnter={e=>{ if(priority!==p.value){ e.currentTarget.style.border=`1.5px solid ${p.color}88`; e.currentTarget.style.background=p.bg; } }}
                            onMouseLeave={e=>{ if(priority!==p.value){ e.currentTarget.style.border="1.5px solid hsla(192,40%,20%,0.28)"; e.currentTarget.style.background="hsla(215,55%,5%,0.7)"; } }}>
                            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, fontWeight:800,
                              letterSpacing:"0.14em", color: priority===p.value ? p.color : "hsla(192,60%,55%,0.35)", lineHeight:1.2, marginBottom:2 }}>
                              {p.label}
                            </div>
                            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9,
                              color: priority===p.value ? p.color.replace("hsl","hsla").replace(")","0.65)") : "hsla(192,50%,50%,0.25)", letterSpacing:"0.02em" }}>
                              {p.sublabel}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label style={fieldLabel}>{t("tec_describe",lang)}</label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={e=>{ setDescription(e.target.value.slice(0,500)); setError(""); }}
                        placeholder={"Describe your issue in detail…\ne.g. I can't login — it says 'access denied' when I enter my credentials."}
                        style={{ ...inputBase, resize:"none", lineHeight:1.6, paddingTop:10, paddingBottom:10,
                          fontFamily:"'Rajdhani','Segoe UI',sans-serif", fontSize:13 }}
                        onFocus={e=>{ e.currentTarget.style.borderColor="hsla(192,100%,55%,0.62)"; e.currentTarget.style.boxShadow="0 0 0 3px hsla(192,100%,52%,0.1)"; }}
                        onBlur={e=>{ e.currentTarget.style.borderColor="hsla(192,100%,52%,0.3)"; e.currentTarget.style.boxShadow="none"; }}
                      />
                      <div className="flex justify-end mt-1">
                        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:"0.1em",
                          color:`hsla(192,60%,52%,${description.length>20?0.45:0.22})` }}>
                          {description.length}/500
                        </span>
                      </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                      <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                        style={{ background:"hsla(0,80%,7%,0.7)", border:"1px solid hsla(0,80%,52%,0.32)" }}>
                        <AlertTriangle size={13} style={{ color:"hsl(0,90%,65%)", flexShrink:0 }}/>
                        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:"0.12em", color:"hsl(0,90%,65%)" }}>
                          {error}
                        </span>
                      </motion.div>
                    )}

                    {/* SUBMIT */}
                    <button onClick={handleSubmit} disabled={sending}
                      className="w-full h-11 rounded-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
                      style={{ fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:800, letterSpacing:"0.2em",
                        background:"hsla(192,100%,52%,0.12)", border:"1.5px solid hsla(192,100%,55%,0.58)",
                        color:"hsl(193,100%,72%)", boxShadow:"0 0 20px hsla(192,100%,52%,0.18)",
                        cursor: sending ? "not-allowed" : "pointer" }}
                      onMouseEnter={e=>{ if(!sending){ e.currentTarget.style.background="hsla(192,100%,52%,0.24)"; e.currentTarget.style.boxShadow="0 0 32px hsla(192,100%,52%,0.35)"; } }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="hsla(192,100%,52%,0.12)"; e.currentTarget.style.boxShadow="0 0 20px hsla(192,100%,52%,0.18)"; }}>
                      {sending
                        ? <><Loader2 size={15} className="animate-spin"/>SUBMITTING...</>
                        : <><Send size={15}/>SUBMIT TICKET</>
                      }
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
