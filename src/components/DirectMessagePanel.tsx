import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Send, Inbox, User, Check, Users, Search } from "lucide-react";

/* ─── localStorage helpers ─── */
export interface DMessage {
  id: string;
  from: string;
  to: string;        // "ALL" = broadcast
  body: string;
  sentAt: string;
  read: boolean;
}

const STORE = "bims_dms";
export const getDMs = (): DMessage[] => { try { return JSON.parse(localStorage.getItem(STORE)||"[]"); } catch { return []; } };
export const saveDMs = (msgs: DMessage[]) => localStorage.setItem(STORE, JSON.stringify(msgs));

export const sendDM = (from: string, to: string, body: string) => {
  const msgs = getDMs();
  msgs.unshift({ id:`DM-${Date.now().toString(36).toUpperCase().slice(-6)}`, from, to, body: body.trim(), sentAt: new Date().toISOString(), read: false });
  saveDMs(msgs);
};

// broadcast: creates one DMessage per recipient
export const broadcastDM = (from: string, recipients: string[], body: string) => {
  const msgs = getDMs();
  const now = new Date().toISOString();
  recipients.forEach((to, i) => {
    msgs.unshift({ id:`DM-${(Date.now()+i).toString(36).toUpperCase().slice(-6)}`, from, to, body: body.trim(), sentAt: now, read: false });
  });
  saveDMs(msgs);
};

export const unreadCount = (username: string) =>
  getDMs().filter(m => m.to === username && !m.read).length;

/* ─── helpers ─── */
const fmt = (s: string) => {
  try { return new Date(s).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
  catch { return s; }
};

const CY  = "hsl(192,100%,72%)";
const CYD = (a = 1) => `hsla(192,100%,55%,${a})`;
const label: React.CSSProperties = {
  fontFamily:"'Orbitron',monospace", fontSize:8, fontWeight:700,
  letterSpacing:"0.18em", color:CYD(0.5), marginBottom:6, display:"block",
};
const fieldBase: React.CSSProperties = {
  width:"100%", boxSizing:"border-box" as const,
  background:"hsla(215,55%,4%,0.9)",
  border:`1px solid ${CYD(0.3)}`,
  borderRadius:6, outline:"none",
  color:"hsl(192,60%,94%)",
  fontFamily:"'Rajdhani','Segoe UI',sans-serif",
  fontSize:13, fontWeight:600,
  padding:"9px 12px",
  transition:"border-color .15s, box-shadow .15s",
};

interface Props {
  open: boolean;
  onClose: () => void;
  currentUsername: string;
  currentUserRole?: string;  // "admin"|"operator"|"analyst"|"viewer"
  isAdmin: boolean;
  allUsers: string[];
  allUsersInfo?: { username: string; fullName: string; role: string }[];
}

type SendMode = "individual" | "all";

export default function DirectMessagePanel({ open, onClose, currentUsername, currentUserRole, isAdmin, allUsers, allUsersInfo = [] }: Props) {
  const [tab,         setTab]         = useState<"inbox"|"send">("inbox");
  const [sendMode,    setSendMode]     = useState<SendMode>("individual");
  const [search,      setSearch]       = useState("");
  const [recipient,   setRecipient]    = useState("");
  const [searchOpen,  setSearchOpen]   = useState(false);
  const [body,        setBody]         = useState("");
  const [sent,        setSent]         = useState(false);
  const [msgs,        setMsgs]         = useState<DMessage[]>([]);
  const [selectedMsg, setSelectedMsg]  = useState<DMessage|null>(null);
  const [replyBody,   setReplyBody]    = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const reload = () => setMsgs(getDMs());

  useEffect(() => {
    if (open) { reload(); setSent(false); setBody(""); setRecipient(""); setSearch(""); setSelectedMsg(null); }
  }, [open]);

  const inbox     = msgs.filter(m => m.to === currentUsername);
  const sentMsgs  = msgs.filter(m => m.from === currentUsername);
  const unread    = inbox.filter(m => !m.read).length;
  const otherUsers = allUsers.filter(u => u !== currentUsername);

  // Auto-target for non-admin: find the first admin-role user in the store
  const autoTarget = (() => {
    if (isAdmin) return null;
    // Find an admin user from allUsersInfo
    const adminUser = allUsersInfo.find(u => u.role === "admin" && u.username !== currentUsername);
    if (adminUser) return adminUser.username;
    // Fallback: first user that's not current
    return otherUsers[0] || "admin";
  })();

  // Filtered search results
  const searchLower = search.trim().toLowerCase();
  const filtered = searchLower
    ? otherUsers.filter(u => {
        const info = allUsersInfo.find(i => i.username === u);
        return u.toLowerCase().includes(searchLower) ||
               (info?.fullName || "").toLowerCase().includes(searchLower);
      })
    : otherUsers;

  const markRead = (msg: DMessage) => {
    saveDMs(getDMs().map(m => m.id===msg.id ? {...m,read:true} : m));
    setSelectedMsg({...msg,read:true}); reload();
  };

  const handleSend = () => {
    if (!body.trim()) return;
    if (isAdmin) {
      if (sendMode === "all") {
        broadcastDM(currentUsername, otherUsers, body);
      } else {
        if (!recipient) return;
        sendDM(currentUsername, recipient, body);
      }
    } else {
      // Non-admin always sends to the auto-detected admin
      const target = autoTarget || "admin";
      sendDM(currentUsername, target, body);
    }
    setSent(true); setBody(""); setRecipient(""); setSearch(""); reload();
    setTimeout(() => setSent(false), 2500);
  };

  const canSend = body.trim() && (
    isAdmin
      ? sendMode === "all" ? otherUsers.length > 0 : !!recipient
      : !!autoTarget
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-start justify-end"
          style={{background:"hsla(215,58%,2%,0.7)",backdropFilter:"blur(10px)",padding:"58px 14px 14px"}}
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={onClose}>
          <motion.div
            style={{ width:"100%", maxWidth:430,
              background:"linear-gradient(170deg,hsla(215,58%,8%,0.99),hsla(215,58%,4%,0.99))",
              border:`1px solid ${CYD(0.4)}`, borderTop:`2px solid ${CYD(0.7)}`,
              borderRadius:10,
              boxShadow:`0 0 0 1px ${CYD(0.06)},0 0 50px ${CYD(0.2)},0 32px 70px rgba(0,0,0,.95)`,
              maxHeight:"85vh", display:"flex", flexDirection:"column" as const, overflow:"hidden" }}
            initial={{opacity:0,y:-12,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-12,scale:0.97}}
            transition={{duration:0.2,ease:"easeOut"}}
            onClick={e=>e.stopPropagation()}>

            {/* Shimmer line */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,pointerEvents:"none",
              background:`linear-gradient(90deg,transparent 5%,${CY} 40%,hsl(192,100%,92%) 50%,${CY} 60%,transparent 95%)`}}/>

            {/* ── Header ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"12px 16px 10px",borderBottom:`1px solid ${CYD(0.14)}`,background:CYD(0.04)}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <motion.div style={{width:32,height:32,borderRadius:8,
                  background:CYD(0.14),border:`1.5px solid ${CYD(0.55)}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 16px ${CYD(0.3)},inset 0 1px 0 ${CYD(0.2)}`}}
                  animate={{boxShadow:[`0 0 16px ${CYD(0.3)}`,`0 0 28px ${CYD(0.5)}`,`0 0 16px ${CYD(0.3)}`]}}
                  transition={{duration:2.5,repeat:Infinity}}>
                  <MessageSquare style={{width:14,height:14,color:"hsl(192,100%,80%)",filter:`drop-shadow(0 0 6px ${CYD(1)})`}}/>
                </motion.div>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:900,
                    letterSpacing:"0.2em",color:"hsl(192,100%,82%)",
                    textShadow:`0 0 16px ${CYD(0.9)},0 0 32px ${CYD(0.4)}`}}>
                    DIRECT MESSAGES
                  </div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.2em",
                    color:CYD(0.5),marginTop:2}}>
                    {unread > 0 ? `${unread} UNREAD` : "ALL CAUGHT UP"}
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",
                  borderRadius:7,border:`1px solid ${CYD(0.3)}`,background:"transparent",
                  color:CYD(0.45),cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=CYD(0.14);e.currentTarget.style.color=CY;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=CYD(0.45);}}>
                <X style={{width:12,height:12}}/>
              </button>
            </div>

            {/* ── Tabs ── */}
            <div style={{display:"flex",borderBottom:`1px solid ${CYD(0.14)}`,background:CYD(0.03)}}>
              {(["inbox","send"] as const).map(t => (
                <button key={t} onClick={()=>{setTab(t);setSelectedMsg(null);}}
                  style={{flex:1,padding:"9px 0",border:"none",cursor:"pointer",
                    fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:800,letterSpacing:"0.18em",
                    background:tab===t?CYD(0.1):"transparent",
                    color:tab===t?"hsl(192,100%,80%)":CYD(0.35),
                    borderBottom:tab===t?`2px solid ${CY}`:"2px solid transparent",
                    transition:"all .15s",position:"relative" as const}}>
                  {t==="inbox" ? "INBOX" : "COMPOSE"}
                  {t==="inbox" && unread>0 && (
                    <span style={{position:"absolute",top:5,right:"20%",
                      background:"hsl(0,90%,60%)",color:"white",borderRadius:"50%",
                      width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",
                      fontSize:7,fontWeight:700,boxShadow:"0 0 8px hsla(0,90%,55%,0.8)"}}>
                      {unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Body ── */}
            <div style={{flex:1,overflowY:"auto"}}>

              {/* ── INBOX LIST ── */}
              {tab==="inbox" && !selectedMsg && (
                <div>
                  {inbox.length===0 ? (
                    <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",
                      justifyContent:"center",padding:"40px 24px",gap:10}}>
                      <Inbox style={{width:32,height:32,color:CYD(0.15)}}/>
                      <p style={{fontFamily:"'Orbitron',monospace",fontSize:9,letterSpacing:"0.22em",
                        color:CYD(0.25),margin:0}}>INBOX EMPTY</p>
                    </div>
                  ) : inbox.map(msg => (
                    <div key={msg.id} onClick={()=>{markRead(msg);setSelectedMsg(msg);}}
                      style={{borderBottom:`1px solid ${CYD(0.14)}`,padding:"10px 16px",cursor:"pointer",
                        background:!msg.read?`linear-gradient(180deg,${CYD(0.06)},transparent)`:"transparent",
                        transition:"background .15s"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=CYD(0.08)}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=!msg.read?`linear-gradient(180deg,${CYD(0.06)},transparent)`:"transparent"}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        {!msg.read && (
                          <motion.div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,
                            background:"hsl(192,100%,68%)",boxShadow:`0 0 10px ${CYD(1)}`}}
                            animate={{opacity:[1,0.4,1]}} transition={{duration:1.2,repeat:Infinity}}/>
                        )}
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:800,
                          letterSpacing:"0.1em",color:"hsl(192,100%,82%)",
                          textShadow:`0 0 10px ${CYD(0.7)}`}}>
                          @{msg.from}
                        </span>
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,
                          color:CYD(0.35),marginLeft:"auto",letterSpacing:"0.06em"}}>
                          {fmt(msg.sentAt)}
                        </span>
                      </div>
                      <p style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:12,fontWeight:500,
                        color:msg.read?"hsl(192,40%,80%)":"hsl(192,20%,96%)",
                        margin:0,overflow:"hidden",textOverflow:"ellipsis",
                        whiteSpace:"nowrap" as const,lineHeight:1.4}}>
                        {msg.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── MESSAGE DETAIL ── */}
              {tab==="inbox" && selectedMsg && (
                <div style={{padding:"14px 16px"}}>
                  <button onClick={()=>setSelectedMsg(null)}
                    style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:700,
                      letterSpacing:"0.14em",color:CYD(0.55),border:"none",background:"none",
                      cursor:"pointer",marginBottom:12,padding:0}}
                    onMouseEnter={e=>e.currentTarget.style.color=CY}
                    onMouseLeave={e=>e.currentTarget.style.color=CYD(0.55)}>
                    ← BACK TO INBOX
                  </button>
                  <div style={{padding:"10px 12px",borderRadius:8,marginBottom:12,
                    background:CYD(0.06),border:`1px solid ${CYD(0.25)}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,letterSpacing:"0.14em",color:CYD(0.5)}}>FROM</span>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:800,
                        letterSpacing:"0.1em",color:"hsl(192,100%,82%)",textShadow:`0 0 10px ${CYD(0.7)}`}}>
                        @{selectedMsg.from}
                      </span>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:CYD(0.35),marginLeft:"auto"}}>
                        {fmt(selectedMsg.sentAt)}
                      </span>
                    </div>
                    <p style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:14,fontWeight:500,
                      color:"hsl(192,20%,96%)",lineHeight:1.6,margin:0}}>
                      {selectedMsg.body}
                    </p>
                  </div>
                  <span style={label}>QUICK REPLY</span>
                  <textarea value={replyBody} onChange={e=>setReplyBody(e.target.value)} rows={3}
                    placeholder={`Reply to @${selectedMsg.from}…`}
                    style={{...fieldBase,resize:"none",lineHeight:1.5}}
                    onFocus={e=>{e.currentTarget.style.borderColor=CYD(0.62);e.currentTarget.style.boxShadow=`0 0 0 3px ${CYD(0.1)}`;}}
                    onBlur={e=>{e.currentTarget.style.borderColor=CYD(0.3);e.currentTarget.style.boxShadow="none";}}/>
                  <button onClick={()=>{
                    if(!replyBody.trim())return;
                    sendDM(currentUsername,selectedMsg.from,replyBody);
                    setReplyBody(""); reload(); setSent(true); setTimeout(()=>setSent(false),2000);
                  }} disabled={!replyBody.trim()}
                    style={{marginTop:8,width:"100%",padding:"8px 0",borderRadius:6,cursor:"pointer",
                      fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:800,letterSpacing:"0.18em",
                      background:sent?"hsla(142,80%,6%,0.8)":CYD(0.12),
                      border:sent?"1px solid hsla(142,90%,55%,0.45)":`1.5px solid ${CYD(0.55)}`,
                      color:sent?"hsl(142,90%,70%)":"hsl(192,100%,72%)",
                      boxShadow:`0 0 16px ${CYD(0.2)}`,
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}
                    onMouseEnter={e=>{if(!sent){e.currentTarget.style.background=CYD(0.24);e.currentTarget.style.boxShadow=`0 0 28px ${CYD(0.38)}`;} }}
                    onMouseLeave={e=>{if(!sent){e.currentTarget.style.background=CYD(0.12);e.currentTarget.style.boxShadow=`0 0 16px ${CYD(0.2)}`;} }}>
                    {sent ? <><Check style={{width:12,height:12}}/>SENT!</> : <><Send style={{width:12,height:12}}/>SEND REPLY</>}
                  </button>
                </div>
              )}

              {/* ── COMPOSE ── */}
              {tab==="send" && (
                <div style={{padding:"14px 16px",display:"flex",flexDirection:"column" as const,gap:14}}>

                  {/* ── RECIPIENT MODE (admin only) ── */}
                  {isAdmin && (
                    <div>
                      <span style={label}>SEND TO</span>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>

                        {/* Individual */}
                        <button onClick={()=>setSendMode("individual")}
                          style={{padding:"10px 8px",borderRadius:8,cursor:"pointer",
                            fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:800,letterSpacing:"0.14em",
                            border:`1.5px solid ${sendMode==="individual"?CYD(0.65):CYD(0.2)}`,
                            background:sendMode==="individual"?CYD(0.12):"transparent",
                            color:sendMode==="individual"?"hsl(192,100%,80%)":CYD(0.35),
                            boxShadow:sendMode==="individual"?`0 0 16px ${CYD(0.25)}`:"none",
                            transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          <User style={{width:12,height:12}}/>
                          INDIVIDUAL
                          {sendMode==="individual" && <Check style={{width:10,height:10,marginLeft:2}}/>}
                        </button>

                        {/* All users */}
                        <button onClick={()=>setSendMode("all")}
                          style={{padding:"10px 8px",borderRadius:8,cursor:"pointer",
                            fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:800,letterSpacing:"0.14em",
                            border:`1.5px solid ${sendMode==="all"?"hsl(192,100%,65%)":"hsla(270,60%,50%,0.2)"}`,
                            background:sendMode==="all"?"hsla(270,90%,62%,0.12)":"transparent",
                            color:sendMode==="all"?"hsl(192,100%,78%)":"hsla(270,60%,55%,0.35)",
                            boxShadow:sendMode==="all"?"0 0 16px hsla(270,90%,60%,0.25)":"none",
                            transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          <Users style={{width:12,height:12}}/>
                          ALL USERS
                          {sendMode==="all" && <Check style={{width:10,height:10,marginLeft:2}}/>}
                        </button>
                      </div>

                      {/* All-users preview badge */}
                      {sendMode==="all" && (
                        <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
                          style={{marginTop:8,padding:"8px 12px",borderRadius:7,
                            background:"hsla(270,90%,5%,0.7)",border:"1px solid hsla(270,90%,55%,0.35)",
                            display:"flex",alignItems:"center",gap:8}}>
                          <Users style={{width:13,height:13,color:"hsl(192,100%,70%)",flexShrink:0}}/>
                          <span style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:13,fontWeight:700,
                            color:"hsl(270,80%,82%)"}}>
                            Sending to all {otherUsers.length} user{otherUsers.length!==1?"s":""}
                          </span>
                          <div style={{marginLeft:"auto",display:"flex",gap:4,flexWrap:"wrap" as const,maxWidth:140,justifyContent:"flex-end"}}>
                            {otherUsers.slice(0,4).map(u=>(
                              <span key={u} style={{fontFamily:"'Orbitron',monospace",fontSize:7,fontWeight:700,
                                padding:"2px 6px",borderRadius:4,
                                background:"hsla(270,80%,55%,0.15)",border:"1px solid hsla(270,80%,55%,0.3)",
                                color:"hsl(270,80%,75%)"}}>
                                @{u}
                              </span>
                            ))}
                            {otherUsers.length>4 && (
                              <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:"hsla(270,60%,60%,0.6)"}}>
                                +{otherUsers.length-4} more
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── RECIPIENT SEARCH (individual mode) ── */}
                  {(sendMode==="individual" || !isAdmin) && (
                    <div>
                      <span style={label}>
                        {isAdmin ? "SEARCH USER" : "TO"}
                      </span>

                      {isAdmin ? (
                        /* Search box for admin */
                        <div style={{position:"relative"}}>
                          <div style={{position:"relative"}}>
                            <Search style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
                              width:13,height:13,color:CYD(0.4),pointerEvents:"none"}}/>
                            <input
                              value={recipient ? `@${recipient}` : search}
                              onChange={e=>{
                                if(recipient){ setRecipient(""); }
                                setSearch(e.target.value.replace(/^@/,""));
                                setSearchOpen(true);
                              }}
                              onFocus={()=>setSearchOpen(true)}
                              onBlur={()=>setTimeout(()=>setSearchOpen(false),150)}
                              placeholder="Type username or full name…"
                              style={{...fieldBase,paddingLeft:32,
                                borderColor:recipient?CYD(0.6):CYD(0.3),
                                background:recipient?"hsla(192,100%,52%,0.07)":"hsla(215,55%,4%,0.9)",
                                boxShadow:recipient?`0 0 0 2px ${CYD(0.1)}`:"none"}}
                            />
                            {recipient && (
                              <button onClick={()=>{setRecipient("");setSearch("");}}
                                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                                  background:"none",border:"none",cursor:"pointer",
                                  color:CYD(0.5),fontSize:14,lineHeight:1,padding:2}}
                                title="Clear">×</button>
                            )}
                          </div>

                          {/* Selected recipient pill */}
                          {recipient && (
                            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                              style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6,
                                padding:"4px 10px",borderRadius:6,
                                background:CYD(0.1),border:`1px solid ${CYD(0.45)}`,
                                boxShadow:`0 0 10px ${CYD(0.2)}`}}>
                              <div style={{width:20,height:20,borderRadius:5,
                                background:CYD(0.18),border:`1px solid ${CYD(0.4)}`,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:800,color:CY}}>
                                {recipient.charAt(0).toUpperCase()}
                              </div>
                              <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,
                                letterSpacing:"0.1em",color:"hsl(192,100%,80%)"}}>
                                @{recipient}
                              </span>
                              <Check style={{width:10,height:10,color:"hsl(142,80%,60%)"}}/>
                            </motion.div>
                          )}

                          {/* Dropdown results */}
                          <AnimatePresence>
                            {searchOpen && !recipient && filtered.length > 0 && (
                              <motion.div
                                style={{position:"absolute",left:0,right:0,top:"calc(100% + 4px)",zIndex:200,
                                  background:"hsla(215,55%,5%,0.99)",border:`1px solid ${CYD(0.3)}`,
                                  borderRadius:8,boxShadow:"0 16px 40px rgba(0,0,0,0.92)",
                                  overflow:"hidden",maxHeight:220,overflowY:"auto"}}
                                initial={{opacity:0,y:-5,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
                                exit={{opacity:0,y:-5}} transition={{duration:0.14}}>
                                {/* header */}
                                <div style={{padding:"6px 12px",
                                  background:CYD(0.06),borderBottom:`1px solid ${CYD(0.14)}`}}>
                                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,
                                    letterSpacing:"0.18em",color:CYD(0.45)}}>
                                    {filtered.length} USER{filtered.length!==1?"S":""} FOUND
                                  </span>
                                </div>
                                {filtered.map((u,i) => {
                                  const info = allUsersInfo.find(x=>x.username===u);
                                  return (
                                    <button key={u}
                                      onMouseDown={()=>{setRecipient(u);setSearch("");setSearchOpen(false);}}
                                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                                        padding:"9px 12px",border:"none",
                                        borderTop:i>0?`1px solid ${CYD(0.1)}`:"none",
                                        background:"transparent",cursor:"pointer",transition:"background .1s"}}
                                      onMouseEnter={e=>e.currentTarget.style.background=CYD(0.08)}
                                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                      <div style={{width:28,height:28,borderRadius:7,flexShrink:0,
                                        background:CYD(0.12),border:`1px solid ${CYD(0.32)}`,
                                        display:"flex",alignItems:"center",justifyContent:"center",
                                        fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:800,color:CY}}>
                                        {u.charAt(0).toUpperCase()}
                                      </div>
                                      <div style={{flex:1,minWidth:0,textAlign:"left" as const}}>
                                        <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:700,
                                          letterSpacing:"0.08em",color:"hsl(192,100%,82%)"}}>
                                          @{u}
                                        </div>
                                        {info?.fullName && (
                                          <div style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:11,
                                            color:CYD(0.5),marginTop:1,overflow:"hidden",
                                            textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>
                                            {info.fullName}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                            {searchOpen && !recipient && search.trim() && filtered.length===0 && (
                              <motion.div
                                style={{position:"absolute",left:0,right:0,top:"calc(100% + 4px)",zIndex:200,
                                  background:"hsla(215,55%,5%,0.99)",border:`1px solid ${CYD(0.2)}`,
                                  borderRadius:7,padding:"12px",textAlign:"center" as const}}
                                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:CYD(0.3)}}>
                                  NO USERS FOUND
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        /* Non-admin: auto-filled to the admin user */
                        <div style={{...fieldBase,display:"flex",alignItems:"center",gap:10,
                          opacity:0.85,pointerEvents:"none" as const}}>
                          <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,display:"inline-block",
                            background:CY,boxShadow:`0 0 8px ${CYD(0.9)}`}}/>
                          <div style={{flex:1}}>
                            <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:700,
                              letterSpacing:"0.1em",color:"hsl(192,100%,78%)"}}>
                              {autoTarget ? `@${autoTarget.toUpperCase()}` : "ADMIN"}
                            </span>
                            {allUsersInfo.find(u=>u.username===autoTarget)?.fullName && (
                              <span style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:11,
                                color:CYD(0.45),marginLeft:8}}>
                                {allUsersInfo.find(u=>u.username===autoTarget)?.fullName}
                              </span>
                            )}
                          </div>
                          <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.16em",
                            padding:"2px 7px",borderRadius:4,
                            background:"hsla(0,80%,52%,0.12)",border:"1px solid hsla(0,80%,52%,0.3)",
                            color:"hsl(0,80%,70%)"}}>ADMIN</span>
                          <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.16em",
                            color:CYD(0.35)}}>AUTO-ASSIGNED</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── MESSAGE BODY ── */}
                  <div>
                    <span style={label}>MESSAGE</span>
                    <textarea ref={bodyRef} value={body} rows={5}
                      onChange={e=>setBody(e.target.value.slice(0,800))}
                      placeholder={
                        sendMode==="all"
                          ? `Broadcast to all ${otherUsers.length} users…`
                          : recipient
                            ? `Message to @${recipient}…`
                            : "Type your message…"
                      }
                      style={{...fieldBase,resize:"none",lineHeight:1.55}}
                      onFocus={e=>{e.currentTarget.style.borderColor=CYD(0.62);e.currentTarget.style.boxShadow=`0 0 0 3px ${CYD(0.1)}`;}}
                      onBlur={e=>{e.currentTarget.style.borderColor=CYD(0.3);e.currentTarget.style.boxShadow="none";}}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4,alignItems:"center"}}>
                      {sendMode==="all" && isAdmin && (
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.12em",
                          color:"hsla(270,80%,65%,0.55)"}}>
                          📢 BROADCAST TO {otherUsers.length} USER{otherUsers.length!==1?"S":""}
                        </span>
                      )}
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.1em",
                        color:CYD(body.length>20?0.4:0.2),marginLeft:"auto"}}>
                        {body.length}/800
                      </span>
                    </div>
                  </div>

                  {/* ── SEND BUTTON ── */}
                  <AnimatePresence mode="wait">
                    {sent ? (
                      <motion.div key="sent" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                        style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                          padding:"11px",borderRadius:8,
                          background:"hsla(142,80%,6%,0.8)",border:"1px solid hsla(142,90%,55%,0.45)",
                          fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:800,
                          letterSpacing:"0.18em",color:"hsl(142,90%,70%)",
                          boxShadow:"0 0 20px hsla(142,90%,52%,0.2)"}}>
                        <Check style={{width:14,height:14}}/>
                        {sendMode==="all" ? `SENT TO ALL ${otherUsers.length} USERS!` : "MESSAGE SENT!"}
                      </motion.div>
                    ) : (
                      <motion.button key="btn" onClick={handleSend} disabled={!canSend}
                        style={{padding:"11px 0",borderRadius:8,cursor:canSend?"pointer":"not-allowed",
                          fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:800,letterSpacing:"0.2em",
                          background:sendMode==="all"?"hsla(270,90%,62%,0.12)":CYD(0.12),
                          border:sendMode==="all"?`1.5px solid hsla(270,90%,65%,0.58)`:`1.5px solid ${CYD(0.58)}`,
                          color:sendMode==="all"?"hsl(192,100%,78%)":"hsl(192,100%,72%)",
                          boxShadow:sendMode==="all"?"0 0 18px hsla(270,90%,60%,0.22)":`0 0 18px ${CYD(0.2)}`,
                          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                          width:"100%",transition:"all .15s",opacity:canSend?1:0.45}}
                        onMouseEnter={e=>{if(canSend){
                          e.currentTarget.style.background=sendMode==="all"?"hsla(270,90%,62%,0.24)":CYD(0.24);
                          e.currentTarget.style.boxShadow=sendMode==="all"?"0 0 30px hsla(270,90%,60%,0.4)":`0 0 30px ${CYD(0.4)}`;
                        }}}
                        onMouseLeave={e=>{
                          e.currentTarget.style.background=sendMode==="all"?"hsla(270,90%,62%,0.12)":CYD(0.12);
                          e.currentTarget.style.boxShadow=sendMode==="all"?"0 0 18px hsla(270,90%,60%,0.22)":`0 0 18px ${CYD(0.2)}`;
                        }}>
                        {sendMode==="all"
                          ? <><Users style={{width:14,height:14}}/> BROADCAST TO ALL</>
                          : <><Send style={{width:14,height:14}}/> SEND MESSAGE</>
                        }
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* ── SENT HISTORY ── */}
                  {sentMsgs.length > 0 && (
                    <div style={{marginTop:4}}>
                      <span style={label}>SENT MESSAGES</span>
                      {sentMsgs.map(msg=>(
                        <div key={msg.id} style={{borderRadius:6,padding:"8px 10px",marginBottom:6,
                          background:"hsla(215,58%,5%,0.7)",border:`1px solid ${CYD(0.18)}`}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.12em",color:CYD(0.45)}}>TO</span>
                            <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,color:"hsl(192,100%,80%)"}}>
                              {msg.to==="ALL"?"📢 ALL USERS":`@${msg.to}`}
                            </span>
                            <span style={{fontFamily:"'Orbitron',monospace",fontSize:7,color:CYD(0.3),marginLeft:"auto"}}>
                              {fmt(msg.sentAt)}
                            </span>
                            {msg.read && <Check style={{width:10,height:10,color:"hsl(142,80%,60%)"}} title="Read"/>}
                          </div>
                          <p style={{fontFamily:"'Rajdhani','Segoe UI',sans-serif",fontSize:12,
                            color:"hsl(192,40%,82%)",margin:0,lineHeight:1.4,
                            overflow:"hidden",textOverflow:"ellipsis",
                            display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const}}>
                            {msg.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
