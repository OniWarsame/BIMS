import { useLang, t } from "@/lib/i18n";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Database, UserPlus, Shield, LogOut, Search, X, Users, FileText, Headphones, Bell, MessageSquare } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import TechSupportModal from "@/components/TechSupportModal";
import DirectMessagePanel, { unreadCount } from "@/components/DirectMessagePanel";
import { generateFingerprintHash, getRecords } from "@/lib/biometric-store";
import { doLogout, getCurrentUser, isAdmin } from "@/lib/auth";

/* ── Admin reply inline box ── */
const AdminReplyBox = ({ ticket, onSave, isEdit }: { ticket: any; onSave: (resp: string) => void; isEdit?: boolean }) => {
  const [open,    setOpen]    = React.useState(false);
  const [text,    setText]    = React.useState(isEdit ? (ticket.adminResponse || "") : "");
  const [sending, setSending] = React.useState(false);
  const [done,    setDone]    = React.useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    setSending(true);

    // 1. Save response to the ticket
    onSave(text.trim());

    // 2. Also send a Direct Message to the user so it appears in their DM inbox
    try {
      // Resolve the exact username — ticket.reporter may be a manually typed name
      // Try to find a matching user account first
      const allUsers: any[] = JSON.parse(localStorage.getItem("bims_users") || "[]");
      const reporterName = (ticket.reporter || "").toLowerCase().trim();
      const matchedUser = allUsers.find(u =>
        u.username?.toLowerCase() === reporterName ||
        (u.fullName || "").toLowerCase() === reporterName ||
        (u.fullName || "").toLowerCase().includes(reporterName) ||
        reporterName.includes((u.username || "").toLowerCase())
      );
      const targetUsername = matchedUser?.username || ticket.reporter || "anonymous";

      const dms = JSON.parse(localStorage.getItem("bims_dms") || "[]");
      dms.unshift({
        id: `DM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        from: "admin",
        to: targetUsername,
        body: `📋 Re: [${ticket.issue || ticket.issueCode || "Support Ticket"} · ${ticket.id}]\n\n${text.trim()}`,
        sentAt: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem("bims_dms", JSON.stringify(dms));
    } catch {}

    setTimeout(() => {
      setSending(false);
      setDone(true);
      setTimeout(() => { setDone(false); setOpen(false); }, 1200);
    }, 500);
  };

  if (!open) return (
    <button onClick={()=>{ setOpen(true); setText(isEdit ? (ticket.adminResponse||"") : ""); }}
      style={{
        fontFamily:"'Orbitron',sans-serif", fontSize:8, fontWeight:700, letterSpacing:"0.14em",
        padding:"5px 12px", borderRadius:6, cursor:"pointer",
        border:`1px solid ${isEdit?"hsla(192,100%,52%,0.4)":"hsla(142,80%,50%,0.55)"}`,
        background:isEdit?"rgba(40,185,215,0.08)":"hsla(142,80%,45%,0.1)",
        color:isEdit?"hsl(193,100%,72%)":"hsl(142,80%,68%)",
        transition:"all .15s"
      } as React.CSSProperties}
      onMouseEnter={e=>{e.currentTarget.style.background=isEdit?"hsla(192,100%,52%,0.2)":"hsla(142,80%,45%,0.22)"; e.currentTarget.style.boxShadow=isEdit?"0 0 12px hsla(192,100%,52%,0.3)":"0 0 12px hsla(142,80%,50%,0.3)";}}
      onMouseLeave={e=>{e.currentTarget.style.background=isEdit?"rgba(40,185,215,0.08)":"hsla(142,80%,45%,0.1)"; e.currentTarget.style.boxShadow="none";}}>
      {isEdit ? "✏ EDIT RESPONSE" : "↩ RESPOND TO USER"}
    </button>
  );

  return (
    <div style={{width:"100%"}}>
      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        rows={3}
        placeholder="Type your response to the user — this will also be sent as a Direct Message…"
        style={{
          width:"100%", boxSizing:"border-box" as const,
          background:"rgba(4,18,32,0.78)",
          border:"1px solid hsla(192,100%,52%,0.35)",
          borderRadius:7, outline:"none", resize:"none",
          color:"hsl(192,55%,94%)",
          fontFamily:"'Exo 2',sans-serif",
          fontSize:13, fontWeight:500, lineHeight:1.55,
          padding:"10px 12px", marginBottom:8,
          transition:"border-color .15s, box-shadow .15s"
        }}
        onFocus={e=>{e.currentTarget.style.borderColor="hsla(192,100%,58%,0.7)"; e.currentTarget.style.boxShadow="0 0 0 3px hsla(192,100%,52%,0.12)";}}
        onBlur={e=>{e.currentTarget.style.borderColor="hsla(192,100%,52%,0.35)"; e.currentTarget.style.boxShadow="none";}}
      />

      {/* hint */}
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,letterSpacing:"0.14em",
        color:"hsla(192,80%,55%,0.4)",marginBottom:8}}>
        💬 RESPONSE WILL ALSO BE SENT AS A DIRECT MESSAGE TO @{(ticket.reporter||"user").toUpperCase()}
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {/* SEND button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || done}
          style={{
            flex:1, padding:"8px 0", borderRadius:7, cursor: text.trim()?"pointer":"not-allowed",
            fontFamily:"'Orbitron',sans-serif", fontSize:9, fontWeight:800, letterSpacing:"0.18em",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            border: done
              ? "1px solid hsla(142,90%,55%,0.55)"
              : "1.5px solid hsla(192,100%,58%,0.65)",
            background: done
              ? "hsla(142,80%,6%,0.8)"
              : sending
                ? "hsla(192,100%,52%,0.06)"
                : "hsla(192,100%,52%,0.14)",
            color: done ? "hsl(142,90%,70%)" : "hsl(193,100%,76%)",
            boxShadow: done ? "0 0 14px hsla(142,90%,52%,0.2)" : "0 0 18px hsla(192,100%,52%,0.25)",
            opacity: (!text.trim() && !done) ? 0.4 : 1,
            transition:"all .18s"
          } as React.CSSProperties}
          onMouseEnter={e=>{if(text.trim()&&!sending&&!done){e.currentTarget.style.background="hsla(192,100%,52%,0.26)";e.currentTarget.style.boxShadow="0 0 28px hsla(192,100%,52%,0.4)";}}}
          onMouseLeave={e=>{if(!done){e.currentTarget.style.background=sending?"hsla(192,100%,52%,0.06)":"hsla(192,100%,52%,0.14)";e.currentTarget.style.boxShadow="0 0 18px hsla(192,100%,52%,0.25)";}}}
        >
          {done ? (
            <>✓ SENT & DELIVERED</>
          ) : sending ? (
            <><div style={{width:10,height:10,borderRadius:"50%",border:"2px solid hsla(192,100%,55%,0.3)",borderTopColor:"hsl(193,100%,72%)",animation:"spin 0.8s linear infinite"}}/> SENDING...</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> SEND RESPONSE</>
          )}
        </button>

        {/* CANCEL button */}
        {!done && (
          <button onClick={()=>setOpen(false)}
            style={{
              padding:"8px 14px", borderRadius:7, cursor:"pointer",
              fontFamily:"'Orbitron',sans-serif", fontSize:8, fontWeight:700, letterSpacing:"0.12em",
              border:"1px solid hsla(192,40%,22%,0.3)",
              background:"transparent", color:"hsla(192,80%,55%,0.4)",
              transition:"all .15s"
            } as React.CSSProperties}
            onMouseEnter={e=>{e.currentTarget.style.background="hsla(192,50%,20%,0.18)";e.currentTarget.style.color="hsla(192,80%,65%,0.7)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="hsla(192,80%,55%,0.4)";}}>
            CANCEL
          </button>
        )}
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"idle"|"scanning"|"match"|"no-match">("idle");
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const [showGhostTrace, setShowGhostTrace] = useState(false);
  const [showFaceDetect, setShowFaceDetect] = useState(false);
  const [fdImage, setFdImage]     = useState<string|null>(null);
  const [fdLoading, setFdLoading] = useState(false);
  const [fdStage, setFdStage]     = useState("");
  const [fdResult, setFdResult]   = useState<any>(null);
  const fdInputRef = useRef<HTMLInputElement>(null);
  const [ghostPhone, setGhostPhone] = useState("");
  const [ghostLoading, setGhostLoading] = useState(false);
  const [ghostResults, setGhostResults] = useState<any>(null);
  const [ghostView, setGhostView] = useState<"search"|"results"|"record">("search");
  const [ghostSelectedRecord, setGhostSelectedRecord] = useState<any>(null);
  const [showFaceSearch, setShowFaceSearch] = useState(false);
  const [faceFile, setFaceFile] = useState<string|null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceStage, setFaceStage] = useState("");
  const [faceResults, setFaceResults] = useState<any>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const lang = useLang();
  const [showSupport, setShowSupport] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dmUnread, setDmUnread] = useState(0);
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  useEffect(()=>{
    if (!currentUser) return;
    const refresh = () => setDmUnread(unreadCount(currentUser.username));
    refresh();
    const iv = setInterval(refresh, 3000);
    return () => clearInterval(iv);
  }, [currentUser?.username]);

  // Load tickets from localStorage — admin sees all, user sees their own responses
  const getTickets = () => {
    try { return JSON.parse(localStorage.getItem("bims_tickets") || "[]"); } catch { return []; }
  };

  // Admin notification: unread tickets (no response yet)
  // User notification: tickets with admin response not yet seen
  const tickets: any[] = getTickets();
  const adminUnread = userIsAdmin ? tickets.filter(t => !t.adminResponse && t.status !== "closed").length : 0;
  const userUnread = !userIsAdmin && currentUser
    ? tickets.filter(t => t.reporter === currentUser.username && t.adminResponse && !t.userSeen).length
    : 0;
  const notifCount = userIsAdmin ? adminUnread : userUnread;
  const [dsInput, setDsInput] = useState("");
  const [dsType, setDsType] = useState<"name"|"username"|"email"|"phone"|"face">("name");
  const [dsResults, setDsResults] = useState<any>(null);
  const [dsLoading, setDsLoading] = useState(false);
  const [dsImageData, setDsImageData] = useState<string|null>(null);
  const [dsImageResults, setDsImageResults] = useState<any>(null);
  const [dsImageLoading, setDsImageLoading] = useState(false);
  const [dsTab, setDsTab] = useState<"text"|"image">("text");
  const [dsImageStage, setDsImageStage] = useState("");
  const dsImageRef = useRef<HTMLInputElement>(null);

  const runGhostTrace = async () => {
    if (!ghostPhone.trim() || ghostLoading) return;

    // ── Kenya-only validation ──
    const raw = ghostPhone.trim();
    const digits = raw.replace(/[^0-9]/g,"");

    // Accept: +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    const isKenya = (
      raw.startsWith("+254") ||
      digits.startsWith("254") ||
      (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) ||
      (digits.length === 10 && (digits.startsWith("07") || digits.startsWith("01")))
    );

    if (!isKenya) {
      setGhostResults({
        error: true,
        errorMsg: "KENYA NUMBERS ONLY — Enter a valid Kenyan number (e.g. +254 712 345678 or 0712 345678)",
        phone: raw
      });
      return;
    }

    setGhostLoading(true);
    setGhostResults(null);
    const enc = encodeURIComponent;

    // Normalise to full international format
    let norm = digits;
    if(norm.startsWith("0") && norm.length === 10) norm = "254" + norm.slice(1);
    if(norm.startsWith("7") || norm.startsWith("1")) norm = "254" + norm;
    const e164 = "+" + norm; // e.g. +254712345678
    const local0 = "0" + norm.slice(3); // e.g. 0712345678

    // ── 1. Detect carrier from prefix ──
    const prefix = norm.slice(3,6); // first 3 digits after 254
    const carrierMap: Record<string,string> = {
      "700":"Safaricom","701":"Safaricom","702":"Safaricom","703":"Safaricom",
      "704":"Safaricom","705":"Safaricom","706":"Safaricom","707":"Safaricom",
      "708":"Safaricom","709":"Safaricom","710":"Safaricom","711":"Safaricom",
      "712":"Safaricom","713":"Safaricom","714":"Safaricom","715":"Safaricom",
      "716":"Safaricom","717":"Safaricom","718":"Safaricom","719":"Safaricom",
      "720":"Safaricom","721":"Safaricom","722":"Safaricom","723":"Safaricom",
      "724":"Safaricom","725":"Safaricom","726":"Safaricom","727":"Safaricom",
      "728":"Safaricom","729":"Safaricom","740":"Safaricom","741":"Safaricom",
      "742":"Safaricom","743":"Safaricom","745":"Safaricom","746":"Safaricom",
      "747":"Safaricom","748":"Safaricom","757":"Safaricom","758":"Safaricom",
      "759":"Safaricom","768":"Safaricom","769":"Safaricom","790":"Safaricom",
      "791":"Safaricom","792":"Safaricom","793":"Safaricom","794":"Safaricom",
      "795":"Safaricom","796":"Safaricom","797":"Safaricom","798":"Safaricom",
      "799":"Safaricom",
      "730":"Airtel","731":"Airtel","732":"Airtel","733":"Airtel","734":"Airtel",
      "735":"Airtel","736":"Airtel","737":"Airtel","738":"Airtel","739":"Airtel",
      "750":"Airtel","751":"Airtel","752":"Airtel","753":"Airtel","754":"Airtel",
      "755":"Airtel","756":"Airtel","762":"Airtel",
      "780":"Telkom","781":"Telkom","782":"Telkom","783":"Telkom","784":"Telkom",
      "785":"Telkom","786":"Telkom","787":"Telkom","788":"Telkom","789":"Telkom",
      "770":"Faiba","100":"Safaricom","101":"Safaricom","102":"Safaricom",
    };
    const carrier = carrierMap[prefix] || "Kenyan carrier";

    // ── 2. Search local BIMS database first ──
    const allRecords = getRecords();
    const dbMatch = allRecords.filter(r => {
      if(!r.phoneNo) return false;
      const s = r.phoneNo.replace(/[^0-9]/g,"");
      const tail9 = norm.slice(-9);
      return s === norm || s.endsWith(tail9) || norm.endsWith(s.slice(-9)) ||
             s === digits || s === local0.replace(/[^0-9]/g,"");
    });

    // ── 3. AI intelligence ──
    let aiInfo: any = { country:"Kenya", carrier, type:"mobile", region:"Kenya", risk:"low",
      whatsapp_likely:true, telegram_likely:false, notes:`${carrier} Kenya number — ${e164}` };
    try {
      const aiResp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,
          messages:[{role:"user",content:
            `Phone number: ${e164} (Kenya, likely ${carrier})

Respond ONLY with valid JSON:
{"carrier":"${carrier} Kenya","type":"mobile","region":"Kenya","risk":"low","whatsapp_likely":true,"telegram_likely":false,"notes":"${carrier} Kenya mobile number — WhatsApp very common in Kenya"}`
          }]})
      });
      if(aiResp.ok){
        const d=await aiResp.json();
        const txt=(d.content||[]).map((b:any)=>b.text||"").join("").trim();
        try{ aiInfo={...aiInfo,...JSON.parse(txt.replace(/```json|```/g,"").trim())}; }catch{}
      }
    }catch{}

    // ── 4. Build Kenya-focused OSINT links ──
    const links: any[] = [];

    // BEST for Kenya: Truecaller has 300M+ African numbers with names from contact books
    links.push({cat:"🏆 Best Name Lookup — Kenya", sub:"These give the highest chance of finding the owner's name", items:[
      {label:"Truecaller",  url:`https://www.truecaller.com/search/ke/${enc(local0)}`, bold:true,  note:"#1 for Kenyan names — 300M+ users", primary:true},
      {label:"Truecaller (intl)",url:`https://www.truecaller.com/search/ke/${enc(e164)}`, bold:true, note:"Same with +254 format", primary:true},
      {label:"Sync.me",     url:`https://sync.me/search/?q=${enc(e164)}`,              bold:true,  note:"Global caller ID — Kenya coverage"},
      {label:"CallApp",     url:`https://www.google.com/search?q=callapp+"${enc(e164)}"`, bold:false,note:"CallApp caller ID"},
      {label:"Google Search",url:`https://www.google.com/search?q="${enc(e164)}" OR "${enc(local0)}"`, bold:false, note:"Public mentions of this number"},
    ]});

    // WhatsApp — wa.me is the real direct check
    links.push({cat:"💬 WhatsApp & Messaging", sub:"wa.me opens the chat — if no account exists WhatsApp tells you", items:[
      {label:"WhatsApp Chat",  url:`https://wa.me/${norm}`,                            bold:true,  note:"Opens if registered", primary:true},
      {label:"WhatsApp API",   url:`https://api.whatsapp.com/send?phone=${norm}`,      bold:true,  note:"Alt WhatsApp link"},
      {label:"Telegram",       url:`https://t.me/+${norm}`,                           bold:false, note:"Opens if exists"},
      {label:"Viber",          url:`viber://chat?number=%2B${norm}`,                  bold:false, note:"If Viber installed"},
    ]});

    // Social media search with Kenya context
    links.push({cat:"📱 Social Media Search — Kenya", sub:"Searches for this number on each platform", items:[
      {label:"Instagram",   url:`https://www.google.com/search?q=site:instagram.com+"${enc(e164)}" OR site:instagram.com+"${enc(local0)}"`, bold:true},
      {label:"Facebook",    url:`https://www.facebook.com/search/people/?q=${enc(local0)}`,        bold:true,  note:"Search by phone"},
      {label:"Twitter/X",   url:`https://x.com/search?q="${enc(e164)}"`,                           bold:false},
      {label:"TikTok",      url:`https://www.google.com/search?q=site:tiktok.com+"${enc(e164)}"`,  bold:false},
      {label:"LinkedIn",    url:`https://www.google.com/search?q=site:linkedin.com+"${enc(e164)}"`,bold:false},
      {label:"YouTube",     url:`https://www.google.com/search?q=site:youtube.com+"${enc(e164)}"`, bold:false},
      {label:"Snapchat",    url:`https://www.snapchat.com/`,                                        bold:false},
    ]});

    // Kenya-specific lookups
    links.push({cat:"🇰🇪 Kenya-Specific Intelligence", sub:"Safaricom, M-Pesa, and Kenya public records", items:[
      {label:"NumVerify",   url:`https://api.numlookupapi.com/v1/validate/${enc(e164)}`,            bold:true,  note:"Carrier + validity"},
      {label:"Safaricom Portal",url:`https://selfcare.safaricom.co.ke`,                             bold:false, note:"Safaricom self-service"},
      {label:"KRA iTax",    url:`https://itax.kra.go.ke/KRA-Portal/`,                              bold:false, note:"Tax records — Kenya"},
      {label:"M-Pesa Lookup",url:`https://www.google.com/search?q="${enc(e164)}" mpesa kenya`,     bold:false, note:"M-Pesa public traces"},
      {label:"eCitizen",    url:`https://www.ecitizen.go.ke`,                                       bold:false, note:"Kenya govt records"},
      {label:"Kenya OSINT", url:`https://www.google.com/search?q="${enc(e164)}" kenya`,            bold:false},
    ]});

    // People search / OSINT
    links.push({cat:"🔍 Reverse Lookup & OSINT", sub:"People search and breach databases", items:[
      {label:"PhoneInfoga", url:`https://github.com/sundowndev/phoneinfoga`,                        bold:true,  note:"Run locally for full scan"},
      {label:"That'sThem",  url:`https://thatsthem.com/phone/${enc(e164)}`,                        bold:false},
      {label:"Spokeo",      url:`https://www.spokeo.com/phone/${enc(e164)}`,                       bold:false},
      {label:"IntelligenceX",url:`https://intelx.io/?s=${enc(e164)}`,                             bold:false, note:"Dark web traces"},
      {label:"HaveIBeenPwned",url:`https://haveibeenpwned.com/`,                                   bold:false, note:"Breach check"},
    ]});

    setGhostResults({ dbMatch, links, phone:raw, e164, local0, norm, carrier, ai:aiInfo });
    setGhostLoading(false);
  };


  const handleDeepSearch = () => {
    if (!dsInput.trim() || dsLoading) return;
    const q = dsInput.trim();
    setDsLoading(true);
    setDsResults(null);

    // Small artificial delay so the loading state shows
    setTimeout(() => {
      try {
        const lower = q.toLowerCase().replace(/\s+/g," ").trim();
        const parts = lower.split(" ");
        const fn = parts[0] || "";
        const ln = parts.slice(1).join("") || "";
        const enc = encodeURIComponent;

        /* ── Generate username/name variants ── */
        let variants: string[] = [];
        if (dsType === "name") {
          variants = [
            lower.replace(/\s/g,""),          // johnsmith
            parts.join("."),                   // john.smith
            parts.join("_"),                   // john_smith
            parts.join("-"),                   // john-smith
            fn + ln.charAt(0),                 // johns
            fn.charAt(0) + ln,                 // jsmith
            fn.charAt(0) + "." + ln,           // j.smith
            fn.charAt(0) + "_" + ln,           // j_smith
            fn + " " + ln,                     // john smith (quoted search)
            fn + ln + "1",                     // johnsmith1
            fn + ln + "2",                     // johnsmith2
            fn + "_" + ln + "1",               // john_smith1
            fn.charAt(0).toUpperCase() + ln,   // Jsmith
            fn + ln.replace(/a/g,"4").replace(/e/g,"3").replace(/o/g,"0"), // l33t
          ].filter((v,i,a)=>v&&v.length>1&&a.indexOf(v)===i);
        } else if (dsType === "username") {
          const u = lower.replace(/\s/g,"");
          variants = [
            u, u+"1", u+"2", u+"123", u+"_", "_"+u,
            u.replace(/_/g,"."), u.replace(/\./g,"_"), u.replace(/-/g,"_"),
            u.replace(/a/g,"4").replace(/e/g,"3").replace(/o/g,"0").replace(/i/g,"1"),
            u.slice(0,-1), u+"_real", u+"official", u+"_official",
            u.replace(/[0-9]+$/,""), u+"x",
          ].filter((v,i,a)=>v&&v.length>1&&a.indexOf(v)===i);
        } else if (dsType === "email") {
          const atIdx = q.indexOf("@");
          const user = atIdx>0 ? q.slice(0,atIdx) : q;
          const domain = atIdx>0 ? q.slice(atIdx) : "";
          variants = [
            q,
            user + "1" + domain,
            user.replace(/\./g,"_") + domain,
            user.replace(/_/g,".") + domain,
            user + "+info" + domain,
            user + "+work" + domain,
          ].filter((v,i,a)=>v&&a.indexOf(v)===i);
        } else {
          // phone
          const digits = q.replace(/\D/g,"");
          variants = [q, "+"+digits, "00"+digits, digits, digits.slice(-9), digits.slice(-10)].filter((v,i,a)=>v&&a.indexOf(v)===i);
        }

        /* ── Build platform links ── */
        type PlatformDef = {name:string;color:string;icon:string;links:{variant:string;label:string;url:string}[]};
        const encQ = enc(q);

        const buildLinks = (urlFn: (v:string)=>string, labelFn?:(v:string)=>string) =>
          variants.slice(0,8).map(v=>({variant:v, label:labelFn?labelFn(v):`Search: ${v}`, url:urlFn(enc(v))}));

        const platforms: PlatformDef[] = dsType==="email" ? [
          {name:"HaveIBeenPwned", color:"0,80%,65%",   icon:"⚠",
            links: variants.map(v=>({variant:v, label:`Breach check: ${v}`, url:`https://haveibeenpwned.com/account/${enc(v)}`}))},
          {name:"Google",        color:"188,80%,62%",  icon:"G",
            links: variants.map(v=>({variant:v, label:`"${v}" everywhere`, url:`https://www.google.com/search?q="${enc(v)}"`}))},
          {name:"Facebook",      color:"220,85%,62%",  icon:"f",
            links: variants.map(v=>({variant:v, label:`People: ${v}`, url:`https://www.facebook.com/search/people/?q=${enc(v)}`}))},
          {name:"LinkedIn",      color:"210,90%,58%",  icon:"in",
            links: variants.map(v=>({variant:v, label:`Profile: ${v}`, url:`https://www.google.com/search?q=site:linkedin.com+"${enc(v)}"`}))},
          {name:"Hunter.io",     color:"32,100%,58%",  icon:"📧",
            links:[{variant:q, label:`Email intel: ${q}`, url:`https://hunter.io/email-verifier/${encQ}`}]},
          {name:"Spokeo",        color:"38,85%,58%",   icon:"👤",
            links:[{variant:q, label:`Email lookup: ${q}`, url:`https://www.spokeo.com/email-search/results/${encQ}`}]},
        ] : dsType==="phone" ? [
          {name:"Truecaller",    color:"0,80%,55%",    icon:"📞",
            links: variants.map(v=>({variant:v, label:`Caller ID: ${v}`, url:`https://www.truecaller.com/search/${v.replace(/\D/g,"")}`}))},
          {name:"Google",        color:"188,80%,62%",  icon:"G",
            links: variants.map(v=>({variant:v, label:`"${v}"`, url:`https://www.google.com/search?q="${enc(v)}"`}))},
          {name:"WhatsApp",      color:"142,70%,50%",  icon:"💬",
            links: variants.filter(v=>/^\+?\d+$/.test(v.replace(/\s/g,""))).map(v=>({variant:v, label:`Open chat: ${v}`, url:`https://wa.me/${v.replace(/\D/g,"")}`}))},
          {name:"Facebook",      color:"220,85%,62%",  icon:"f",
            links: variants.map(v=>({variant:v, label:`Search: ${v}`, url:`https://www.facebook.com/search/people/?q=${enc(v)}`}))},
          {name:"Social+Phone",  color:"270,70%,72%",  icon:"🔍",
            links: variants.map(v=>({variant:v, label:`Social: ${v}`, url:`https://www.google.com/search?q="${enc(v)}" site:facebook.com OR site:linkedin.com OR site:instagram.com`}))},
        ] : [
          {name:"Google",        color:"188,80%,62%",  icon:"G",
            links: variants.map(v=>({variant:v, label:`"${v}"`, url:`https://www.google.com/search?q="${enc(v)}"`}))},
          {name:"Instagram",     color:"320,85%,62%",  icon:"📸",
            links: buildLinks(v=>`https://www.instagram.com/${v}/`, v=>`@${v}`)},
          {name:"X / Twitter",   color:"0,0%,88%",     icon:"𝕏",
            links: buildLinks(v=>`https://x.com/${v}`, v=>`@${v}`)},
          {name:"TikTok",        color:"172,100%,50%", icon:"♪",
            links: buildLinks(v=>`https://www.tiktok.com/@${v}`, v=>`@${v}`)},
          {name:"Facebook",      color:"220,85%,62%",  icon:"f",
            links: variants.map(v=>({variant:v, label:`People: ${v}`, url:`https://www.facebook.com/search/people/?q=${enc(v)}`}))},
          {name:"LinkedIn",      color:"210,90%,58%",  icon:"in",
            links: variants.map(v=>({variant:v, label:`People: ${v}`, url:`https://www.linkedin.com/search/results/people/?keywords=${enc(v)}`}))},
          {name:"Snapchat",      color:"50,100%,55%",  icon:"👻",
            links: buildLinks(v=>`https://www.snapchat.com/add/${v}`, v=>`@${v}`)},
          {name:"GitHub",        color:"215,28%,68%",  icon:"</>",
            links: buildLinks(v=>`https://github.com/${v}`, v=>`@${v}`)},
          {name:"Reddit",        color:"15,90%,60%",   icon:"R",
            links: buildLinks(v=>`https://www.reddit.com/user/${v}`, v=>`u/${v}`)},
          {name:"Telegram",      color:"200,80%,60%",  icon:"✈",
            links: buildLinks(v=>`https://t.me/${v}`, v=>`@${v}`)},
          {name:"YouTube",       color:"0,90%,55%",    icon:"▶",
            links: variants.map(v=>({variant:v, label:`Channel: ${v}`, url:`https://www.youtube.com/results?search_query=${enc(v)}&sp=EgIQAg%3D%3D`}))},
          {name:"Pinterest",     color:"0,80%,55%",    icon:"P",
            links: buildLinks(v=>`https://www.pinterest.com/${v}/`, v=>`@${v}`)},
          {name:"Threads",       color:"0,0%,75%",     icon:"@",
            links: buildLinks(v=>`https://www.threads.net/@${v}`, v=>`@${v}`)},
          {name:"BeReal",        color:"50,90%,60%",   icon:"📷",
            links: buildLinks(v=>`https://bere.al/${v}`, v=>`@${v}`)},
          {name:"Username Check",color:"38,90%,62%",   icon:"👥",
            links:[
              {variant:"namecheckr",  label:`Namecheckr: ${fn+ln}`,    url:`https://www.namecheckr.com/${enc(fn+ln)}`},
              {variant:"instantuname",label:`Instant Username Search`,  url:`https://instantusername.com/#${enc(fn+ln)}`},
              {variant:"whatsmyname", label:`WhatsMyName OSINT`,        url:`https://whatsmyname.app/?q=${enc(fn+ln)}`},
            ]},
          {name:"People Search", color:"270,70%,72%",  icon:"🔍",
            links:[
              {variant:"pipl",        label:`Pipl: ${q}`,              url:`https://pipl.com/search/?q=${encQ}`},
              {variant:"spokeo",      label:`Spokeo: ${q}`,            url:`https://www.spokeo.com/search?q=${encQ}`},
              {variant:"beenverified",label:`BeenVerified: ${q}`,      url:`https://www.beenverified.com/people/${encQ}/`},
            ]},
        ];

        setDsResults({ original: q, variants, platforms: platforms.filter(p=>p.links.length>0) });
      } catch(err) {
        if (dsType === "face") {
          // Face identity search — reverse image search engines
          const enc2 = (s:string) => encodeURIComponent(s);
          const faceLinks = [
            { variant:"Google Images",  url:`https://lens.google.com/uploadbyurl?url=${enc2(dsInput.trim())}` },
            { variant:"Bing Visual",    url:`https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${enc2(dsInput.trim())}` },
            { variant:"TinEye",         url:`https://www.tineye.com/search/?url=${enc2(dsInput.trim())}` },
            { variant:"Yandex Images",  url:`https://yandex.com/images/search?rpt=imageview&url=${enc2(dsInput.trim())}` },
            { variant:"PimEyes",        url:`https://pimeyes.com/en` },
            { variant:"FaceCheck.ID",   url:`https://facecheck.id/` },
            { variant:"Search4Faces",   url:`https://search4faces.com/` },
          ];
          setDsResults({ error:false, original:dsInput.trim(), variants:[], platforms:[
            { name:"FACE IDENTITY SEARCH", color:"193,100%,55%", icon:"👁️", links: faceLinks.map(l=>({...l})) }
          ]});
          setDsLoading(false);
          return;
        }
        setDsResults({ error: true, original: dsInput.trim(), variants: [], platforms: [] });
      }
      setDsLoading(false);
    }, 600);
  };

  const handleImageDeepSearch = async (imgData: string) => {
    setDsImageLoading(true);
    setDsImageResults(null);
    setDsImageStage("Resizing image…");

    try {
      /* ── Resize ── */
      const resized: string = await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, 800 / img.width);
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.88));
        };
        img.src = imgData;
      });
      const b64 = resized.replace(/^data:image\/\w+;base64,/, "");

      /* ── Claude Vision: analyse face ── */
      setDsImageStage("AI analysing face…");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 900,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
              { type: "text", text: `You are an expert OSINT facial analyst. Analyse this face image carefully.

Respond ONLY with valid JSON (no markdown):
{
  "face_visible": true,
  "description": "physical description: age range, gender, hair, ethnicity",
  "age": "e.g. 25-35",
  "gender": "Male/Female/Unknown",
  "ethnicity": "e.g. East African, South Asian, Caucasian",
  "hair": "color and style",
  "features": ["feature1","feature2","feature3"],
  "visible_text": "ANY username, @handle, watermark, brand text visible IN the image or empty string",
  "platform_hint": "if visible text is a social handle, which platform, or empty",
  "background": "location or setting clue",
  "queries": ["google query 1","query 2","query 3 targeting social media","query 4 with physical description","query 5"]
}` }
            ]
          }]
        })
      });

      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      const txt = data.content?.map((b: any) => b.text || "").join("") || "";
      const face = JSON.parse(txt.replace(/```json|```/g, "").trim());

      if (!face.face_visible) {
        setDsImageResults({ no_face: true });
        setDsImageLoading(false);
        setDsImageStage("");
        return;
      }

      /* ── Build targeted search links ── */
      setDsImageStage("Building search targets…");
      const enc = encodeURIComponent;
      const visText = face.visible_text || "";
      const searchHits: any[] = [];

      (face.queries || []).forEach((q: string) => {
        searchHits.push({ label: `"${q}"`, url: `https://www.google.com/search?q=${enc('"'+q+'"')}`, platform: "Google", color: "188,80%,62%" });
      });

      if (visText) {
        const clean = visText.replace(/[@\s]/g, "");
        searchHits.push({ label: `Instagram: @${visText}`, url: `https://www.instagram.com/${clean}/`, platform: "Instagram", color: "320,85%,62%" });
        searchHits.push({ label: `TikTok: @${visText}`, url: `https://www.tiktok.com/@${clean}`, platform: "TikTok", color: "172,100%,50%" });
        searchHits.push({ label: `X/Twitter: @${visText}`, url: `https://x.com/${clean}`, platform: "X/Twitter", color: "0,0%,88%" });
        searchHits.push({ label: `Facebook: ${visText}`, url: `https://www.facebook.com/search/people/?q=${enc(visText)}`, platform: "Facebook", color: "220,85%,62%" });
        searchHits.push({ label: `Google: "${visText}"`, url: `https://www.google.com/search?q=${enc('"'+visText+'"')}`, platform: "Google", color: "188,80%,62%" });
      }

      const desc = `${face.age||""} ${face.gender||""} ${face.ethnicity||""} ${face.hair||""}`.trim();
      searchHits.push({ label: `Social profiles: ${desc}`, url: `https://www.google.com/search?q=${enc(desc+" site:instagram.com OR site:facebook.com OR site:linkedin.com OR site:tiktok.com")}`, platform: "Social", color: "140,80%,58%" });

      setDsImageResults({ ok: true, face, visText, searchHits });

    } catch {
      setDsImageResults({ error: true });
    }

    setDsImageLoading(false);
    setDsImageStage("");
  };

  const handleScan = () => {
    if (scanState !== "idle") return;
    setScanState("scanning");
    setTimeout(() => {
      const records = getRecords();
      const shouldMatch = Math.random() > 0.5 && records.length > 0;
      if (shouldMatch) {
        const record = records[Math.floor(Math.random() * records.length)];
        setScanState("match");
        setTimeout(() => navigate(`/result/${record.id}`), 1500);
      } else {
        generateFingerprintHash();
        setScanState("no-match");
        setTimeout(() => { setScanState("idle"); }, 5000);
      }
    }, 2500);
  };

  const isMatch    = scanState === "match";
  const isNoMatch  = scanState === "no-match";
  const isScanning = scanState === "scanning";
  const isIdle     = scanState === "idle";

  const RC: Record<string,string> = {
    owner:"hsl(270,80%,72%)", admin:"hsl(354,88%,68%)",
    operator:"hsl(193,100%,62%)", analyst:"hsl(158,80%,55%)",
  };
  const RU = currentUser?.role || "analyst";

  // Security-themed command definitions
  const CMDS = [
    { label:t("grid_register",lang),    sub:"Enroll Biometric Subject", Icon:UserPlus,  path:"/register", hue:200, color:"hsl(200,100%,68%)", shape:"hexagon" },
    { label:t("grid_database",lang),    sub:"Access Records Vault",     Icon:Database,  path:"/database", hue:195, color:"hsl(193,100%,62%)", shape:"shield"  },
    { label:t("grid_deepsearch",lang), sub:"OSINT Intelligence Query", Icon:Search,    path:null,         hue:270, color:"hsl(270,80%,70%)",  shape:"target",  osint:true },
    ...(userIsAdmin ? [
      { label:t("grid_users",lang),   sub:"Access Control",          Icon:Users,    path:"/users",    hue:36,  color:"hsl(36,100%,62%)",  shape:"badge"   },
      { label:t("grid_reports",lang), sub:"Audit & Activity Log",    Icon:FileText, path:"/reports",  hue:158, color:"hsl(158,80%,54%)",  shape:"circuit" },
      { label:t("grid_create",lang),  sub:"Generate Documents",      Icon:FileText, path:"/create",   hue:216, color:"hsl(216,100%,68%)", shape:"chip"    },
    ] : [
      { label:"Create",  sub:"Generate Documents",      Icon:FileText, path:"/create",   hue:216, color:"hsl(216,100%,68%)", shape:"chip"    },
    ]),
    { label:"Face Detection", sub:"Reverse Image · Face Search", Icon:Search, path:null, hue:315, color:"hsl(315,90%,65%)", shape:"eye", facedetect:true },
    { label:"Ghost Trace", sub:"Phone Signal Intelligence", Icon:Search, path:null, hue:165, color:"hsl(165,90%,55%)", shape:"ghost", ghost:true },
  ] as { label:string; sub:string; Icon:any; path:string|null; hue:number; color:string; shape:string; osint?:boolean; ghost?:boolean; facedetect?:boolean }[];

  const scanColor = isMatch?"hsl(158,80%,55%)":isNoMatch?"hsl(354,85%,62%)":isScanning?"hsl(36,100%,58%)":"hsl(200,100%,65%)";
  const scanGlow  = isMatch?"rgba(50,200,130,0.6)":isNoMatch?"rgba(220,60,60,0.6)":isScanning?"rgba(255,160,30,0.6)":"rgba(44,178,212,0.6)";

  // Security shape SVG paths for each command button
  const ShapeIcon = ({ shape, hue, size=18 }:{ shape:string; hue:number; size?:number }) => {
    const c = `hsl(${hue},100%,70%)`;
    const s = size;
    switch(shape){
      case "hexagon": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke={c} strokeWidth="1.5" fill="none"/><polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" stroke={c} strokeWidth="0.8" fill={c} fillOpacity=".12"/></svg>;
      case "shield":  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6L12 2z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/><path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
      case "target":  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="12" cy="12" r="6" stroke={c} strokeWidth="1" fill="none" opacity=".7"/><circle cx="12" cy="12" r="2.5" fill={c}/><line x1="12" y1="2" x2="12" y2="6" stroke={c} strokeWidth="1.2"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="1.2"/><line x1="2" y1="12" x2="6" y2="12" stroke={c} strokeWidth="1.2"/><line x1="18" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.2"/></svg>;
      case "badge":   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="3" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".1"/><circle cx="12" cy="9" r="3" stroke={c} strokeWidth="1.2" fill="none"/><path d="M6 20c0-3.31 2.69-5 6-5s6 1.69 6 5" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>;
      case "circuit": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="4" height="4" stroke={c} strokeWidth="1.2" fill="none"/><rect x="17" y="8" width="4" height="4" stroke={c} strokeWidth="1.2" fill="none"/><rect x="10" y="3" width="4" height="4" stroke={c} strokeWidth="1.2" fill="none"/><rect x="10" y="17" width="4" height="4" stroke={c} strokeWidth="1.2" fill="none"/><line x1="7" y1="10" x2="10" y2="10" stroke={c} strokeWidth="1.2"/><line x1="14" y1="10" x2="17" y2="10" stroke={c} strokeWidth="1.2"/><line x1="12" y1="7" x2="12" y2="10" stroke={c} strokeWidth="1.2"/><line x1="12" y1="14" x2="12" y2="17" stroke={c} strokeWidth="1.2"/><circle cx="12" cy="12" r="2" fill={c} fillOpacity=".6"/></svg>;
      case "chip":    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".1"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity=".2"/><line x1="9" y1="2" x2="9" y2="6" stroke={c} strokeWidth="1.2"/><line x1="12" y1="2" x2="12" y2="6" stroke={c} strokeWidth="1.2"/><line x1="15" y1="2" x2="15" y2="6" stroke={c} strokeWidth="1.2"/><line x1="9" y1="18" x2="9" y2="22" stroke={c} strokeWidth="1.2"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="1.2"/><line x1="15" y1="18" x2="15" y2="22" stroke={c} strokeWidth="1.2"/><line x1="2" y1="9" x2="6" y2="9" stroke={c} strokeWidth="1.2"/><line x1="2" y1="12" x2="6" y2="12" stroke={c} strokeWidth="1.2"/><line x1="2" y1="15" x2="6" y2="15" stroke={c} strokeWidth="1.2"/><line x1="18" y1="9" x2="22" y2="9" stroke={c} strokeWidth="1.2"/><line x1="18" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.2"/><line x1="18" y1="15" x2="22" y2="15" stroke={c} strokeWidth="1.2"/></svg>;
      case "ghost": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9v7l-2 2v1h18v-1l-2-2V9c0-3.87-3.13-7-7-7z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/>
        <path d="M5 18l1.5-1.5L8 18l1.5-1.5L11 18l1.5-1.5L14 18l1.5-1.5L17 18l1.5-1.5L20 18" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="9.5" cy="10" r="1.2" fill={c}/>
        <circle cx="14.5" cy="10" r="1.2" fill={c}/>
        <path d="M9.5 13.5s1.25 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="12" y1="2" x2="12" y2="0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="0.5" r="1" fill={c} opacity=".6"/>
      </svg>;
      case "eye": return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9" ry="6" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".10"/><circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".20"/><circle cx="12" cy="12" r="1.5" fill={c}/><path d="M3 12c0 0 3.5-7 9-7s9 7 9 7" stroke={c} strokeWidth=".8" strokeDasharray="2 2" opacity=".5"/></svg>;
      default: return null;
    }
  };

  // Named handler to avoid complex inline JSX callbacks (prevents Oxc regex false positives)
  const handleTicketReply = (ticketId: string) => (resp: string) => {
    const all = JSON.parse(localStorage.getItem("bims_tickets") || "[]");
    const idx = all.findIndex((x: any) => x.id === ticketId);
    if (idx >= 0) {
      all[idx].adminResponse = resp;
      all[idx].read = true;
      localStorage.setItem("bims_tickets", JSON.stringify(all));
    }
  };

  // Pre-compute DM panel props (avoids IIFE in JSX)
  const dmAllUsers: string[] = (() => { try { return JSON.parse(localStorage.getItem("bims_users") || "[]").map((u:any) => u.username); } catch { return []; } })();
  const dmAllUsersInfo = (() => { try { return JSON.parse(localStorage.getItem("bims_users") || "[]").map((u:any) => ({ username: u.username, fullName: u.fullName || u.username, role: u.role || "analyst" })); } catch { return []; } })();

  return (
    <div style={{minHeight:"100vh",overflow:"hidden",background:"transparent",position:"relative",fontFamily:"'Exo 2',-apple-system,sans-serif"}}>
      <CyberBackground/>

      {/* ─── NAV ─── */}
      <div style={{
        position:"fixed",
        top:0, left:0, right:0,
        width:"100%",
        height:54,
        zIndex:9999,
        background:"rgba(0,5,14,0.78)",
        borderBottom:"1px solid rgba(0,205,248,0.20)",
        backdropFilter:"blur(6px)",
      }}>
        {/* BIMS — hard left */}
        <div style={{position:"absolute",left:20,top:0,bottom:0,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"radial-gradient(circle,rgba(30,130,200,0.4),rgba(10,50,100,0.2))",border:"1.5px solid rgba(50,190,220,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Shield style={{width:14,height:14,color:"hsl(193,100%,72%)"}}/>
          </div>
          <div style={{lineHeight:1}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,letterSpacing:"0.12em",color:"rgba(210,242,248,0.98)",textShadow:"0 0 20px rgba(0,205,248,0.5)"}}>BIMS</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(0,205,248,0.42)",letterSpacing:"0.1em",textTransform:"uppercase" as const,marginTop:3}}>Biometric Identity Management System</div>
          </div>
        </div>

        {/* ALL BUTTONS — hard right */}
        <div style={{position:"absolute",right:16,top:0,bottom:0,display:"flex",alignItems:"center",gap:5}}>
          {/* Support */}
          <button onClick={()=>setShowSupport(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(140,205,230,0.75)",fontFamily:"'Exo 2',sans-serif",fontSize:11.5,fontWeight:500,transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.16)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <Headphones style={{width:12,height:12}}/> Support
          </button>

          {/* Bell */}
          <button onClick={()=>setShowNotif(v=>!v)} style={{position:"relative",width:32,height:32,borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(140,205,230,0.72)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.16)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <Bell style={{width:13,height:13}}/>
            {notifCount>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"hsl(218,95%,65%)",border:"2px solid rgba(2,8,18,0.8)"}}/>}
          </button>

          {/* DM */}
          <button onClick={()=>setShowDM(v=>!v)} style={{position:"relative",width:32,height:32,borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(140,205,230,0.72)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.16)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <MessageSquare style={{width:13,height:13}}/>
            {dmUnread>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"hsl(270,80%,68%)",border:"2px solid rgba(2,8,18,0.8)"}}/>}
          </button>

          {/* Divider */}
          <div style={{width:1,height:22,background:"rgba(255,255,255,0.14)",margin:"0 2px"}}/>

          {/* Role chip */}
          <button onClick={()=>setShowUserMenu(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 11px 3px 3px",borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.16)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:RC[RU]+"28",border:"2px solid "+RC[RU]+"70",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,color:RC[RU]}}>
              {(currentUser?.role||"analyst")[0].toUpperCase()}
            </div>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:RC[RU],letterSpacing:"0.1em"}}>
              {(currentUser?.role||"analyst").toUpperCase()}
            </span>
          </button>

          {/* Logout */}
          <button onClick={()=>{doLogout();window.location.href="/login";}} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,cursor:"pointer",background:"transparent",border:"1px solid rgba(200,55,55,0.30)",color:"rgba(218,75,75,0.72)",fontFamily:"'Exo 2',sans-serif",fontSize:11.5,fontWeight:500,transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,40,40,0.16)";e.currentTarget.style.color="rgba(255,100,100,0.95)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(218,75,75,0.72)";}}>
            <LogOut style={{width:11,height:11}}/> Logout
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showUserMenu&&(
            <motion.div initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}} transition={{duration:0.15}}
              style={{position:"fixed",top:60,right:14,minWidth:178,zIndex:10000,padding:"8px 0",borderRadius:14,background:"rgba(3,10,22,0.78)",border:"1px solid rgba(0,205,248,0.22)",boxShadow:"0 20px 60px rgba(0,0,0,0.78)",backdropFilter:"blur(14px)"}}>
              <div style={{padding:"8px 14px 8px",borderBottom:"1px solid rgba(0,205,248,0.12)",marginBottom:4}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"rgba(210,242,248,0.95)"}}>{currentUser?.fullName||currentUser?.username}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(0,205,248,0.45)",marginTop:2}}>@{currentUser?.username}</div>
              </div>
              {[{label:"My Profile",path:"/profile"},{label:"Settings",path:"/settings"}].map(({label,path})=>(
                <button key={label} onClick={()=>{setShowUserMenu(false);navigate(path);}} style={{width:"100%",textAlign:"left" as const,padding:"7px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"'Exo 2',sans-serif",fontSize:12.5,color:"rgba(100,188,218,0.65)",transition:"all .14s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.1)";e.currentTarget.style.color="rgba(185,232,248,0.95)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(100,188,218,0.65)";}}>
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{position:"fixed",top:54,left:0,right:0,bottom:0,zIndex:2,display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",padding:"12px 20px",overflow:"hidden"}}>
        <div style={{width:"100%",maxWidth:660,display:"flex",flexDirection:"column" as const,alignItems:"center",gap:16}}>

          {/* Title */}
          <div style={{textAlign:"center" as const}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8}}>
              <motion.div
                animate={{boxShadow:["0 0 20px rgba(50,190,218,0.3)","0 0 40px rgba(50,190,218,0.6)","0 0 20px rgba(50,190,218,0.3)"]}}
                transition={{duration:2.8,repeat:Infinity,ease:"easeInOut"}}
                style={{width:48,height:48,borderRadius:14,
                  background:"linear-gradient(135deg,rgba(0,160,255,0.2),rgba(0,80,200,0.15))",
                  border:"1.5px solid rgba(50,190,218,0.4)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Fingerprint style={{width:24,height:24,color:"hsl(193,100%,60%)",filter:"drop-shadow(0 0 8px rgba(50,190,218,0.8))"}}/>
              </motion.div>
              <div style={{textAlign:"left" as const}}>
                <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(20px,2.8vw,32px)",fontWeight:900,letterSpacing:"0.14em",color:"rgba(200,245,255,0.98)",textTransform:"uppercase" as const,margin:0,lineHeight:1,textShadow:"0 0 35px rgba(50,190,218,0.5),0 0 70px rgba(0,150,220,0.2)"}}>
                  BIMS
                </h1>
                <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(6px,0.85vw,8.5px)",letterSpacing:"0.18em",color:"rgba(0,205,248,0.48)",margin:"4px 0 0",textTransform:"uppercase" as const}}>
                  Biometric Identity Management System
                </p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
              <motion.span
                animate={{opacity:[1,0.15,1]}}
                transition={{duration:isScanning?0.45:2.2,repeat:Infinity}}
                style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:scanColor,boxShadow:`0 0 10px ${scanGlow}`,flexShrink:0}}
              />
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,letterSpacing:"0.14em",color:`${scanColor}cc`,textTransform:"uppercase" as const}}>
                {isScanning?"SCANNING…":isMatch?"IDENTITY VERIFIED":isNoMatch?"NO MATCH FOUND":"SYSTEM READY"}
              </span>
            </div>
          </div>

          {/* Scanner — Hexagonal biometric terminal */}
          <div style={{position:"relative",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>

            {/* Outer ambient pulse */}
            <motion.div
              animate={{scale:[0.9,1.12,0.9],opacity:[0.25,0.5,0.25]}}
              transition={{duration:3.8,repeat:Infinity,ease:"easeInOut"}}
              style={{position:"absolute",inset:-50,borderRadius:"50%",
                background:`radial-gradient(circle,${scanGlow} 0%,transparent 65%)`,
                pointerEvents:"none"}}
            />

            {/* Hexagonal outer ring SVG */}
            <svg style={{position:"absolute",width:310,height:310,pointerEvents:"none"}}
              viewBox="0 0 310 310">
              {/* Static hex outline */}
              <polygon points="155,8 292,82 292,228 155,302 18,228 18,82"
                fill="none" stroke={`${scanColor}22`} strokeWidth="1"/>
              {/* Animated hex border */}
              <motion.polygon points="155,8 292,82 292,228 155,302 18,228 18,82"
                fill="none" stroke={scanColor} strokeWidth="1.5"
                strokeDasharray="60 400"
                style={{filter:`drop-shadow(0 0 8px ${scanGlow})`}}
                animate={{strokeDashoffset:[0,-460]}}
                transition={{duration:isScanning?1.4:5,repeat:Infinity,ease:"linear"}}/>
              <motion.polygon points="155,8 292,82 292,228 155,302 18,228 18,82"
                fill="none" stroke={`${scanColor}33`} strokeWidth="0.7"
                strokeDasharray="18 52"
                animate={{strokeDashoffset:[0,280]}}
                transition={{duration:8,repeat:Infinity,ease:"linear"}}/>
              {/* Corner circuit nodes */}
              {[[155,8],[292,82],[292,228],[155,302],[18,228],[18,82]].map(([px,py],i)=>(
                <motion.circle key={i} cx={px} cy={py} r="4"
                  fill={scanColor}
                  animate={{opacity:[0.4,1,0.4],r:[3,5,3]}}
                  transition={{duration:2,delay:i*0.35,repeat:Infinity}}
                  style={{filter:`drop-shadow(0 0 5px ${scanGlow})`}}/>
              ))}
              {/* Cross-hairs */}
              <line x1="155" y1="18" x2="155" y2="44" stroke={`${scanColor}55`} strokeWidth="1.5"/>
              <line x1="155" y1="266" x2="155" y2="292" stroke={`${scanColor}55`} strokeWidth="1.5"/>
              <line x1="24" y1="155" x2="50" y2="155" stroke={`${scanColor}55`} strokeWidth="1.5"/>
              <line x1="260" y1="155" x2="286" y2="155" stroke={`${scanColor}55`} strokeWidth="1.5"/>
            </svg>

            {/* Inner disc — main scanner body */}
            <div
              className={isScanning?"scanner-pulse":""}
              style={{
                width:234,height:234,borderRadius:"50%",
                background:isMatch
                  ?"radial-gradient(circle at 38% 32%,hsla(158,80%,10%,0.97),hsla(158,80%,3%,0.99))"
                  :isNoMatch
                    ?"radial-gradient(circle at 38% 32%,hsla(354,80%,10%,0.97),hsla(354,80%,3%,0.99))"
                    :"radial-gradient(circle at 38% 32%,rgba(6,18,52,0.78),rgba(2,8,26,0.78))",
                border:`2px solid ${scanColor}55`,
                boxShadow:`0 0 70px ${scanGlow}25,0 0 120px ${scanGlow}10,inset 0 0 60px rgba(0,0,0,0.6)`,
                display:"flex",flexDirection:"column" as const,
                alignItems:"center",justifyContent:"center",gap:10,
                position:"relative",overflow:"hidden",transition:"all 0.45s",
                zIndex:1,
              }}>

              {/* Concentric rings inside disc */}
              <div style={{position:"absolute",inset:18,borderRadius:"50%",border:`1px solid ${scanColor}20`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:36,borderRadius:"50%",border:`1px dashed ${scanColor}14`,pointerEvents:"none"}}/>

              {/* Radial grid lines */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.12,pointerEvents:"none"}} viewBox="0 0 234 234">
                {[0,45,90,135].map(deg=>{
                  const r=deg*Math.PI/180;
                  return <g key={deg}>
                    <line x1={117} y1={117} x2={117+117*Math.cos(r)} y2={117+117*Math.sin(r)} stroke={scanColor} strokeWidth="0.6"/>
                    <line x1={117} y1={117} x2={117-117*Math.cos(r)} y2={117-117*Math.sin(r)} stroke={scanColor} strokeWidth="0.6"/>
                  </g>;
                })}
              </svg>

              {/* Horizontal scan beam */}
              {isScanning && (
                <motion.div
                  animate={{y:["-55%","155%"]}}
                  transition={{duration:0.88,repeat:Infinity,ease:"linear"}}
                  style={{position:"absolute",left:0,right:0,height:3,
                    background:`linear-gradient(90deg,transparent,${scanColor}dd 30%,white 50%,${scanColor}dd 70%,transparent)`,
                    boxShadow:`0 0 18px ${scanGlow},0 0 36px ${scanGlow}55`}}
                />
              )}

              {/* Fingerprint icon */}
              <motion.div
                animate={isScanning?{scale:[1,1.1,1],opacity:[0.8,1,0.8]}:{scale:1,opacity:1}}
                transition={{duration:0.88,repeat:isScanning?Infinity:0}}>
                <Fingerprint style={{width:78,height:78,color:scanColor,
                  filter:`drop-shadow(0 0 24px ${scanGlow}) drop-shadow(0 0 48px ${scanGlow}55)`}}/>
              </motion.div>

              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                letterSpacing:"0.28em",color:`${scanColor}80`,textTransform:"uppercase" as const}}>
                {isScanning?"SCANNING…":isMatch?"VERIFIED":isNoMatch?"NO MATCH":"PLACE FINGER"}
              </span>
            </div>

            {/* Circuit corner accents outside disc */}
            {[
              {top:-8,left:"50%",transform:"translateX(-50%)",w:30,h:12,border:"2px solid",r:"0",bt:true,br:false,bl:false,bb:false},
            ].map((_,i)=>(
              <div key={i}/>
            ))}
          </div>

          {/* Scan button */}
          <motion.button
            onClick={handleScan} disabled={!isIdle}
            whileHover={isIdle?{scale:1.015,y:-2}:{}} whileTap={isIdle?{scale:0.98}:{}}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              padding:"13px 48px",borderRadius:14,fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,
              letterSpacing:"0.1em",textTransform:"uppercase" as const,
              color:isIdle?"white":isScanning?"rgba(255,165,40,0.92)":isMatch?"hsl(158,80%,68%)":"hsl(354,85%,72%)",
              background:isIdle
                ?"linear-gradient(135deg,hsl(200,100%,50%),hsl(220,100%,62%))"
                :isScanning
                  ?"linear-gradient(135deg,rgba(200,120,20,0.2),rgba(160,80,10,0.12))"
                  :isMatch
                    ?"linear-gradient(135deg,rgba(30,160,90,0.2),rgba(20,100,60,0.12))"
                    :"linear-gradient(135deg,rgba(180,40,40,0.2),rgba(120,20,20,0.12))",
              border:isIdle?"0":`1.5px solid ${scanColor}55`,
              boxShadow:isIdle?"0 6px 30px rgba(0,160,255,0.5),inset 0 1px 0 rgba(255,255,255,0.18)":`0 0 28px ${scanGlow}25`,
              cursor:isIdle?"pointer":"default",opacity:isIdle?1:0.88,transition:"all 0.3s",
              width:"100%",maxWidth:360}}>
            {isScanning
              ? <><div style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${scanColor}55`,borderTopColor:scanColor,animation:"spin .7s linear infinite"}}/> SCANNING...</>
              : <><Fingerprint style={{width:19,height:19}}/> INITIATE SCAN</>}
          </motion.button>

          {/* Command grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%"}}>
            {CMDS.map((cmd,i)=>{
            const {label,sub,Icon,path,hue,color,shape,osint} = cmd as any;
            return (
              <motion.button key={label}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                transition={{delay:0.4+i*0.05}}
                whileHover={{y:-4,scale:1.025}} whileTap={{scale:0.97}}
                onClick={()=>osint?setShowDeepSearch(true):(cmd as any).ghost?setShowGhostTrace(true):(cmd as any).facedetect?setShowFaceDetect(true):path?navigate(path):null}
                style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-start",
                  padding:"14px 15px",
                  background:"linear-gradient(160deg,rgba(4,18,52,0.78),rgba(2,10,36,0.78))",
                  border:`1px solid hsla(${hue},90%,62%,0.18)`,
                  borderTop:`2px solid hsla(${hue},90%,65%,0.45)`,
                  borderRadius:14,cursor:"pointer",
                  transition:"border-color .22s,box-shadow .22s",
                  boxShadow:"0 4px 22px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)",
                  backdropFilter:"blur(14px)",
                  position:"relative" as const,overflow:"hidden",textAlign:"left" as const}}
                onMouseEnter={e=>{
                  const el=e.currentTarget as HTMLElement;
                  el.style.borderTopColor=`hsla(${hue},90%,70%,0.72)`;
                  el.style.boxShadow=`0 10px 32px rgba(0,0,0,0.5),0 0 24px hsla(${hue},90%,55%,0.16),inset 0 1px 0 rgba(255,255,255,0.09)`;
                }}
                onMouseLeave={e=>{
                  const el=e.currentTarget as HTMLElement;
                  el.style.borderTopColor=`hsla(${hue},90%,65%,0.45)`;
                  el.style.boxShadow="0 4px 22px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)";
                }}>
                <div style={{position:"absolute",top:0,right:0,width:55,height:55,background:`radial-gradient(circle at top right,hsla(${hue},90%,62%,0.14),transparent 65%)`,pointerEvents:"none"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,position:"relative" as const}}>
                  <div style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",background:`hsla(${hue},80%,55%,0.14)`,border:`1px solid hsla(${hue},80%,62%,0.32)`,borderRadius:8,boxShadow:`0 0 12px hsla(${hue},80%,55%,0.2)`}}>
                    <ShapeIcon shape={shape} hue={hue} size={16}/>
                  </div>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"rgba(220,245,255,0.95)",letterSpacing:"0.025em"}}>{label}</span>
                  {osint && (
                    <span style={{fontSize:7.5,fontWeight:700,padding:"1px 5px",borderRadius:4,background:"hsla(270,80%,55%,0.22)",border:"1px solid hsla(270,80%,65%,0.38)",color:"hsl(270,80%,78%)",letterSpacing:"0.06em"}}>OSINT</span>
                  )}
                  {(cmd as any).ghost && (
                    <span style={{fontSize:7.5,fontWeight:700,padding:"1px 5px",borderRadius:4,background:"hsla(165,90%,45%,0.22)",border:"1px solid hsla(165,90%,55%,0.45)",color:"hsl(165,90%,68%)",letterSpacing:"0.06em"}}>SIGINT</span>
                  )}
                </div>
                <span style={{fontFamily:"'Exo 2',sans-serif",fontSize:10.5,color:"rgba(140,210,240,0.62)",lineHeight:1.35,position:"relative" as const}}>{sub}</span>

              </motion.button>
            );
          })}
          </div>

        </div>
      </div>

      {/* ─── MODALS ─── */}
      <TechSupportModal
        open={showSupport}
        onClose={()=>setShowSupport(false)}
        reporterUsername={currentUser?.username}
      />
      <DirectMessagePanel
        open={showDM}
        onClose={()=>setShowDM(false)}
        currentUsername={currentUser?.username || ""}
        currentUserRole={currentUser?.role}
        isAdmin={userIsAdmin}
        allUsers={dmAllUsers}
        allUsersInfo={dmAllUsersInfo}
      />

      {/* ─── NOTIFICATION PANEL ─── */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:40,background:"rgba(1,3,14,0.72)",backdropFilter:"blur(5px)"}}
            onClick={()=>setShowNotif(false)}>
            <motion.div
              initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}}
              transition={{type:"spring",stiffness:340,damping:35}}
              className="bio-card"
              style={{position:"absolute",top:52,right:0,bottom:0,width:340,borderRadius:0,overflow:"auto",padding:"14px 12px"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:9,borderBottom:"1px solid rgba(0,145,220,0.14)"}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"rgba(56,196,223,0.75)"}}>NOTIFICATIONS</span>
                <button onClick={()=>setShowNotif(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(0,160,220,0.42)"}}><X style={{width:13,height:13}}/></button>
              </div>
              {tickets.length===0 && (
                <div style={{textAlign:"center" as const,padding:"28px 0",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(0,135,185,0.35)"}}>No notifications</div>
              )}
              {tickets.map((t:any)=>(
                <div key={t.id} style={{marginBottom:7,padding:"9px 11px",borderRadius:8,background:"rgba(8,20,50,0.8)",border:"1px solid rgba(44,178,212,0.15)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"rgba(56,196,223,0.75)"}}>{t.issue||t.issueCode}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"rgba(0,145,200,0.42)"}}>{t.id}</span>
                  </div>
                  <p style={{fontFamily:"'Exo 2',sans-serif",fontSize:10.5,color:"rgba(140,200,240,0.65)",lineHeight:1.5,margin:0}}>{t.description}</p>
                  {t.adminResponse && (
                    <div style={{padding:"5px 8px",borderRadius:6,marginTop:5,background:"rgba(44,178,212,0.08)",border:"1px solid rgba(44,178,212,0.15)"}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:600,color:"rgba(255,140,0,0.55)",letterSpacing:"0.1em",marginBottom:2,textTransform:"uppercase" as const}}>Response</div>
                      <p style={{fontFamily:"'Exo 2',sans-serif",fontSize:10,color:"rgba(140,200,240,0.65)",lineHeight:1.5,margin:0}}>{t.adminResponse}</p>
                    </div>
                  )}
                  {userIsAdmin && (
                    <div style={{marginTop:7}}>
                      <AdminReplyBox
                        ticket={t}
                        isEdit={!!t.adminResponse}
                        onSave={handleTicketReply(t.id)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DEEP SEARCH MODAL ─── */}
      <AnimatePresence>
        {showGhostTrace && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,2,8,0.96)",
              backdropFilter:"blur(22px)",display:"flex",alignItems:"center",
              justifyContent:"center",padding:"16px"}}
            onClick={()=>{if(ghostView==="search"){setShowGhostTrace(false);setGhostPhone("");setGhostResults(null);setGhostView("search");setGhostSelectedRecord(null);}}}>
            <motion.div
              initial={{scale:0.94,y:24,opacity:0}} animate={{scale:1,y:0,opacity:1}}
              exit={{scale:0.94,y:24,opacity:0}}
              transition={{type:"spring",stiffness:340,damping:30}}
              onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:580,maxHeight:"92vh",overflowY:"auto",
                borderRadius:24,
                background:"linear-gradient(170deg,rgba(0,12,18,0.99),rgba(0,6,14,1))",
                border:"1px solid rgba(0,255,160,0.14)",
                borderTop:"2.5px solid rgba(0,255,160,0.55)",
                boxShadow:"0 40px 100px rgba(0,0,0,0.92),0 0 80px rgba(0,200,120,0.06)",
                overflow:"hidden"}}>

              {/* ══ HEADER — always visible ══ */}
              <div style={{padding:"20px 24px 16px",
                borderBottom:"1px solid rgba(0,255,160,0.07)",
                background:"linear-gradient(180deg,rgba(0,28,18,0.55),transparent)",
                display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {/* Back button — shown when not on search view */}
                  {(ghostView==="results"||ghostView==="record") && (
                    <button
                      onClick={()=>{
                        if(ghostView==="record"){setGhostView("results");setGhostSelectedRecord(null);}
                        else{setGhostView("search");setGhostResults(null);}
                      }}
                      style={{width:34,height:34,borderRadius:10,border:"1.5px solid rgba(0,255,160,0.30)",
                        background:"rgba(0,255,160,0.07)",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        color:"rgba(0,255,160,0.80)",transition:"all .18s",flexShrink:0}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.18)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.07)";}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 5l-7 7 7 7" stroke="rgba(0,255,160,0.90)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <motion.div
                    animate={{boxShadow:["0 0 18px rgba(0,255,160,0.22)","0 0 36px rgba(0,255,160,0.45)","0 0 18px rgba(0,255,160,0.22)"]}}
                    transition={{duration:2.5,repeat:Infinity,ease:"easeInOut"}}
                    style={{width:42,height:42,borderRadius:12,flexShrink:0,
                      background:"linear-gradient(135deg,rgba(0,200,120,0.16),rgba(0,140,90,0.10))",
                      border:"1.5px solid rgba(0,255,160,0.38)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3C8.5 3 6 6 6 9v8l-1.5 1.5V20h15v-1.5L18 17V9c0-3-2.5-6-6-6z" stroke="rgba(0,255,160,0.95)" strokeWidth="1.5" fill="rgba(0,255,160,0.10)"/>
                      <circle cx="9.5" cy="10.5" r="1.3" fill="rgba(0,255,160,0.95)"/>
                      <circle cx="14.5" cy="10.5" r="1.3" fill="rgba(0,255,160,0.95)"/>
                      <path d="M6 17c1-1 1.5-.5 2 0s1.5 1 2 0 1.5-1 2 0 1.5 1 2 0" stroke="rgba(0,255,160,0.70)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </motion.div>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,
                      letterSpacing:"0.08em",
                      background:"linear-gradient(90deg,rgba(0,255,160,1),rgba(0,200,130,0.65))",
                      WebkitBackgroundClip:"text" as any,WebkitTextFillColor:"transparent" as any}}>
                      {ghostView==="record"
                        ? "IDENTITY RECORD"
                        : ghostView==="results"
                        ? ghostResults?.phone || "GHOST TRACE"
                        : "GHOST TRACE"}
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                      color:"rgba(0,180,110,0.40)",marginTop:2,letterSpacing:"0.12em"}}>
                      {ghostView==="record"
                        ? "← BACK TO TRACE RESULTS"
                        : ghostView==="results"
                        ? "PHONE SIGNAL INTELLIGENCE"
                        : "PHONE · SIGNAL · INTELLIGENCE"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={()=>{setShowGhostTrace(false);setGhostPhone("");setGhostResults(null);setGhostView("search");setGhostSelectedRecord(null);}}
                  style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(0,255,160,0.16)",
                    background:"rgba(0,255,160,0.05)",cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"center",color:"rgba(0,200,130,0.50)",
                    transition:"all .18s",flexShrink:0}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.14)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.05)";}}>
                  <X style={{width:14,height:14}}/>
                </button>
              </div>

              {/* ══ VIEW: SEARCH ══ */}
              {ghostView==="search" && (
                <div style={{padding:"22px 24px 28px"}}>
                  {/* Big phone input */}
                  <div style={{marginBottom:14}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                      color:"rgba(0,200,130,0.45)",letterSpacing:"0.14em",marginBottom:8}}>
                      ENTER PHONE NUMBER
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{flex:1,position:"relative" as const}}>
                        <span style={{position:"absolute" as const,left:14,top:"50%",
                          transform:"translateY(-50%)",fontSize:16}}>📞</span>
                        <input
                          value={ghostPhone}
                          onChange={e=>{setGhostPhone(e.target.value.replace(/[^0-9+\-\s()]/g,""));}}
                          onKeyDown={e=>{if(e.key==="Enter")runGhostTrace();}}
                          placeholder="+252 61 234 5678"
                          autoFocus
                          style={{width:"100%",padding:"15px 14px 15px 46px",borderRadius:14,
                            background:"rgba(0,255,160,0.05)",
                            border:`2px solid ${ghostPhone?"rgba(0,255,160,0.45)":"rgba(0,255,160,0.14)"}`,
                            outline:"none",color:"rgba(0,255,180,0.95)",
                            fontFamily:"'JetBrains Mono',monospace",fontSize:18,
                            letterSpacing:"0.08em",transition:"border-color .2s"}}/>
                      </div>
                      <button onClick={runGhostTrace}
                        disabled={ghostLoading||!ghostPhone.trim()}
                        style={{padding:"15px 26px",borderRadius:14,cursor:ghostLoading||!ghostPhone.trim()?"not-allowed":"pointer",
                          background:ghostLoading||!ghostPhone.trim()
                            ?"rgba(0,180,110,0.15)"
                            :"linear-gradient(135deg,rgba(0,230,140,0.92),rgba(0,170,100,0.88))",
                          border:"0",color:ghostLoading||!ghostPhone.trim()?"rgba(0,200,120,0.30)":"rgba(0,0,0,0.88)",
                          fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,
                          letterSpacing:"0.10em",transition:"all .2s",
                          boxShadow:ghostLoading||!ghostPhone.trim()?"none":"0 4px 28px rgba(0,210,130,0.45)"}}>
                        {ghostLoading?"···":"TRACE"}
                      </button>
                    </div>
                  </div>

                  {/* Loading */}
                  {ghostLoading && (
                    <div style={{padding:"36px 0",textAlign:"center" as const}}>
                      <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:20}}>
                        {[0,1,2,3,4].map(i=>(
                          <motion.div key={i}
                            animate={{scaleY:[0.3,1,0.3],opacity:[0.25,1,0.25]}}
                            transition={{duration:0.85,delay:i*0.13,repeat:Infinity,ease:"easeInOut"}}
                            style={{width:4,height:32,borderRadius:2,background:"rgba(0,255,160,0.80)"}}/>
                        ))}
                      </div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:800,
                        color:"rgba(0,255,160,0.80)",letterSpacing:"0.14em",marginBottom:8}}>
                        TRACING SIGNAL
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                        color:"rgba(0,180,110,0.40)",letterSpacing:"0.08em"}}>
                        AI analysis · Carrier lookup · Database scan
                      </div>
                    </div>
                  )}

                  {/* Description when idle */}
                  {!ghostLoading && (
                    <div style={{padding:"12px 0",textAlign:"center" as const}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                        color:"rgba(0,160,100,0.35)",letterSpacing:"0.08em",lineHeight:1.9}}>
                        Carrier · Caller Name · Social Platforms<br/>
                        Database Match · OSINT · Breach Check
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ VIEW: RESULTS ══ */}
              {ghostView==="results" && ghostResults && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.20}}
                  style={{padding:"20px 24px 28px"}}>

                  {/* ── SECTION 1: IDENTITY MATCH (DB) — first and most prominent ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                      color:ghostResults.dbMatch?.length>0?"rgba(0,255,160,0.55)":"rgba(255,100,80,0.45)",
                      letterSpacing:"0.16em",marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
                      {ghostResults.dbMatch?.length>0 && (
                        <motion.div animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.4,repeat:Infinity}}
                          style={{width:7,height:7,borderRadius:"50%",background:"rgba(0,255,160,0.90)",
                            boxShadow:"0 0 14px rgba(0,255,160,0.80)"}}/>
                      )}
                      {ghostResults.dbMatch?.length>0
                        ? `● IDENTITY MATCHED IN DATABASE (${ghostResults.dbMatch.length})`
                        : "○ NO DATABASE MATCH"}
                    </div>
                    {ghostResults.dbMatch?.length>0 ? ghostResults.dbMatch.map((rec:any,i:number)=>(
                      <motion.div key={i}
                        initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                        onClick={()=>{setGhostSelectedRecord(rec);setGhostView("record");}}
                        style={{marginBottom:8,padding:"14px 16px",borderRadius:16,cursor:"pointer",
                          background:"linear-gradient(135deg,rgba(0,36,24,0.92),rgba(0,22,15,0.96))",
                          border:"2px solid rgba(0,255,160,0.28)",
                          boxShadow:"0 4px 20px rgba(0,0,0,0.50)",
                          transition:"all .18s"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(0,255,160,0.60)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 30px rgba(0,0,0,0.60),0 0 30px rgba(0,200,120,0.12)";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(0,255,160,0.28)";(e.currentTarget as HTMLElement).style.boxShadow="0 4px 20px rgba(0,0,0,0.50)";}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          {rec.photo
                            ?<img src={rec.photo} alt="" style={{width:52,height:52,borderRadius:12,
                                objectFit:"cover" as const,border:"2px solid rgba(0,255,160,0.40)",flexShrink:0}}/>
                            :<div style={{width:52,height:52,borderRadius:12,flexShrink:0,
                                background:"rgba(0,180,100,0.16)",border:"2px solid rgba(0,255,160,0.30)",
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,
                                color:"rgba(0,255,160,0.75)"}}>
                              {rec.name?.charAt(0)||"?"}
                            </div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,
                              color:"rgba(0,255,180,0.97)",marginBottom:5}}>
                              {rec.surname}, {rec.name}
                            </div>
                            <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
                              {[["📞",rec.phoneNo||"—"],["🌍",rec.nationality||"—"],["📅",rec.dateOfBirth||"—"]].map(([ic,val])=>(
                                <span key={ic as string} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                                  color:"rgba(0,200,140,0.65)"}}>
                                  {ic as string} <span style={{color:"rgba(0,230,160,0.88)"}}>{val as string}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                            color:"rgba(0,200,130,0.40)",letterSpacing:"0.06em",flexShrink:0}}>
                            TAP →
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div style={{padding:"10px 14px",borderRadius:10,
                        background:"rgba(255,60,40,0.05)",border:"1px solid rgba(255,80,60,0.16)"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                          color:"rgba(255,120,100,0.55)"}}>
                          Not found in local BIMS database
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── SECTION 2: AI NUMBER INTELLIGENCE ── */}
                  {ghostResults.ai && typeof ghostResults.ai==="object" && (
                    <div style={{marginBottom:20,padding:"16px",borderRadius:16,
                      background:"rgba(0,22,16,0.90)",border:"1.5px solid rgba(0,255,160,0.16)"}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                        color:"rgba(0,200,130,0.45)",letterSpacing:"0.16em",marginBottom:12}}>
                        📡 SIGNAL INTELLIGENCE
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                        {[
                          {k:"country",  icon:"🌍",label:"COUNTRY"},
                          {k:"carrier",  icon:"📡",label:"CARRIER"},
                          {k:"type",     icon:"📱",label:"LINE TYPE"},
                          {k:"region",   icon:"📍",label:"REGION"},
                        ].filter(({k})=>ghostResults.ai[k]).map(({k,icon,label})=>(
                          <div key={k} style={{padding:"9px 11px",borderRadius:10,
                            background:"rgba(0,255,160,0.04)",border:"1px solid rgba(0,255,160,0.10)"}}>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
                              color:"rgba(0,180,110,0.40)",letterSpacing:"0.12em",marginBottom:3}}>
                              {icon} {label}
                            </div>
                            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,
                              color:"rgba(0,240,160,0.90)"}}>{ghostResults.ai[k]}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap" as const}}>
                        {ghostResults.ai.risk && (
                          <span style={{padding:"5px 12px",borderRadius:20,
                            background:ghostResults.ai.risk==="high"?"rgba(255,60,60,0.14)":
                                       ghostResults.ai.risk==="medium"?"rgba(255,180,0,0.11)":
                                       "rgba(0,255,120,0.09)",
                            border:`1px solid ${ghostResults.ai.risk==="high"?"rgba(255,80,80,0.38)":
                                                 ghostResults.ai.risk==="medium"?"rgba(255,180,0,0.33)":"rgba(0,255,120,0.28)"}`,
                            fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                            color:ghostResults.ai.risk==="high"?"rgba(255,100,100,0.95)":
                                  ghostResults.ai.risk==="medium"?"rgba(255,190,30,0.95)":"rgba(0,220,120,0.95)"}}>
                            {ghostResults.ai.risk==="high"?"⚠ HIGH RISK":ghostResults.ai.risk==="medium"?"⚡ MEDIUM RISK":"✓ LOW RISK"}
                          </span>
                        )}
                        {ghostResults.ai.whatsapp_likely===true && (
                          <span style={{padding:"5px 12px",borderRadius:20,background:"rgba(37,211,102,0.11)",
                            border:"1px solid rgba(37,211,102,0.32)",fontFamily:"'Orbitron',sans-serif",
                            fontSize:8,fontWeight:700,color:"rgba(37,211,102,0.92)"}}>
                            💬 WHATSAPP LIKELY
                          </span>
                        )}
                        {ghostResults.ai.telegram_likely===true && (
                          <span style={{padding:"5px 12px",borderRadius:20,background:"rgba(0,136,204,0.11)",
                            border:"1px solid rgba(0,136,204,0.32)",fontFamily:"'Orbitron',sans-serif",
                            fontSize:8,fontWeight:700,color:"rgba(0,180,240,0.92)"}}>
                            ✈️ TELEGRAM LIKELY
                          </span>
                        )}
                      </div>
                      {ghostResults.ai.notes && (
                        <div style={{marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                          color:"rgba(0,180,110,0.45)",fontStyle:"italic" as const,lineHeight:1.7}}>
                          {ghostResults.ai.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SECTION 3: SOCIAL DIRECT OPEN ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                      color:"rgba(0,200,130,0.45)",letterSpacing:"0.16em",marginBottom:10}}>
                      📲 OPEN ON PLATFORM DIRECTLY
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                      color:"rgba(0,160,100,0.35)",marginBottom:10,lineHeight:1.6}}>
                      WhatsApp & Telegram open directly — platform shows if account exists.
                      Others search public posts mentioning this number.
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[
                        {label:"WhatsApp", icon:"💬",
                          url:`https://wa.me/${ghostResults.digits}`,
                          note:"Opens chat",col:"37,211,102",direct:true},
                        {label:"Telegram", icon:"✈️",
                          url:`https://t.me/+${ghostResults.digits}`,
                          note:"Opens profile",col:"0,136,204",direct:true},
                        {label:"Viber",    icon:"📲",
                          url:`viber://chat?number=%2B${ghostResults.digits}`,
                          note:"Opens if app",col:"125,86,178",direct:true},
                        {label:"Signal",   icon:"🔒",
                          url:`https://signal.me/#p/+${ghostResults.digits}`,
                          note:"Opens profile",col:"59,165,93",direct:true},
                        {label:"Facebook", icon:"👥",
                          url:`https://www.facebook.com/search/people/?q=${encodeURIComponent(ghostResults.phone)}`,
                          note:"People search",col:"24,119,242",direct:false},
                        {label:"Instagram",icon:"📸",
                          url:`https://www.google.com/search?q=%22${encodeURIComponent(ghostResults.phone)}%22+site:instagram.com`,
                          note:"Google dork",col:"200,60,150",direct:false},
                        {label:"Twitter/X",icon:"🐦",
                          url:`https://x.com/search?q=%22${encodeURIComponent(ghostResults.phone)}%22&f=user`,
                          note:"User search",col:"150,150,150",direct:false},
                        {label:"LinkedIn", icon:"💼",
                          url:`https://www.google.com/search?q=%22${encodeURIComponent(ghostResults.phone)}%22+site:linkedin.com`,
                          note:"Google dork",col:"10,102,194",direct:false},
                      ].map(s=>(
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                          style={{padding:"11px 6px",borderRadius:13,textDecoration:"none",cursor:"pointer",
                            background:`rgba(${s.col},${s.direct?"0.12":"0.07"})`,
                            border:`${s.direct?"2":"1.5"}px solid rgba(${s.col},${s.direct?"0.42":"0.25"})`,
                            display:"flex",flexDirection:"column" as const,alignItems:"center",gap:5,
                            transition:"all .18s",position:"relative" as const}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${s.col},0.22)`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${s.col},${s.direct?"0.12":"0.07"})`;(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
                          {s.direct && (
                            <div style={{position:"absolute" as const,top:5,right:6,
                              fontFamily:"'JetBrains Mono',monospace",fontSize:6,
                              color:`rgba(${s.col},0.60)`,letterSpacing:"0.04em"}}>DIRECT</div>
                          )}
                          <span style={{fontSize:22}}>{s.icon}</span>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                            letterSpacing:"0.04em",color:`rgba(${s.col},0.92)`}}>{s.label}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
                            color:`rgba(${s.col},0.45)`}}>{s.note}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* ── SECTION 4: CALLER ID / NAME LOOKUP ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                      color:"rgba(0,200,130,0.45)",letterSpacing:"0.16em",marginBottom:10}}>
                      🪪 CALLER NAME & CARRIER LOOKUP
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {label:"Truecaller",   url:`https://www.truecaller.com/search/intl/${encodeURIComponent(ghostResults.phone)}`,
                          note:"Caller name (best)",bold:true},
                        {label:"NumVerify",    url:`https://numverify.com/phone-number-validation?number=${encodeURIComponent(ghostResults.e164||ghostResults.phone)}`,
                          note:"Carrier + type",bold:true},
                        {label:"HLR Lookup",   url:"https://www.hlrlookup.com/",
                          note:"Live SIM status",bold:true},
                        {label:"Spokeo",       url:`https://www.spokeo.com/phone/${encodeURIComponent(ghostResults.phone)}`,
                          note:"Full identity",bold:false},
                        {label:"BeenVerified", url:`https://www.beenverified.com/phone/${encodeURIComponent(ghostResults.phone)}`,
                          note:"Name + address",bold:false},
                        {label:"TruePeople",   url:`https://www.truepeoplesearch.com/results?phoneno=${encodeURIComponent(ghostResults.phone)}`,
                          note:"Free records",bold:false},
                      ].map(lk=>(
                        <a key={lk.label} href={lk.url} target="_blank" rel="noopener noreferrer"
                          style={{padding:"10px 12px",borderRadius:11,textDecoration:"none",cursor:"pointer",
                            background:lk.bold?"rgba(0,255,160,0.07)":"rgba(0,255,160,0.03)",
                            border:`${lk.bold?"1.5":"1"}px solid rgba(0,255,160,${lk.bold?"0.24":"0.12"})`,
                            transition:"all .18s"}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.13)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=lk.bold?"rgba(0,255,160,0.07)":"rgba(0,255,160,0.03)";}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9.5,fontWeight:700,
                            color:"rgba(0,240,160,0.88)",marginBottom:3}}>{lk.label}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,
                            color:"rgba(0,180,110,0.40)"}}>{lk.note}</div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* ── SECTION 5: AI DORKS ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                      color:"rgba(0,200,130,0.45)",letterSpacing:"0.16em",marginBottom:10}}>
                      🧠 AI OSINT QUERIES
                    </div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                      {(ghostResults.ai?.google_dorks||[
                        `"${ghostResults.phone}" social media`,
                        `"${ghostResults.phone}" site:facebook.com OR site:instagram.com`,
                        `"${ghostResults.phone}" contact owner profile`,
                      ]).slice(0,4).map((q:string,i:number)=>(
                        <a key={i} href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{padding:"9px 14px",borderRadius:10,textDecoration:"none",cursor:"pointer",
                            background:"rgba(0,255,160,0.03)",border:"1px solid rgba(0,255,160,0.10)",
                            display:"flex",alignItems:"center",gap:10,transition:"all .18s"}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.09)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.03)";}}>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                            color:"rgba(0,200,130,0.35)",flexShrink:0}}>0{i+1}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                            color:"rgba(0,220,150,0.75)",flex:1}}>
                            {q.length>56?q.slice(0,53)+"…":q}
                          </span>
                          <span style={{color:"rgba(0,180,110,0.35)",fontSize:11}}>↗</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* ── DISCLAIMER ── */}
                  <div style={{padding:"10px 14px",borderRadius:10,
                    background:"rgba(255,160,0,0.04)",border:"1px solid rgba(255,160,0,0.12)"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,
                      color:"rgba(255,180,0,0.38)",lineHeight:1.8}}>
                      ⚠ WhatsApp & Telegram open directly — the platform confirms if the account exists.
                      GPS tracking from browser is technically impossible (requires carrier court order).
                      Use Truecaller for registered caller name — most accurate public tool available.
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ VIEW: RECORD ══ */}
              {ghostView==="record" && ghostSelectedRecord && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.22}}
                  style={{padding:"20px 24px 28px"}}>

                  {/* Profile header */}
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,
                    padding:"16px",borderRadius:18,
                    background:"linear-gradient(135deg,rgba(0,36,24,0.92),rgba(0,22,15,0.96))",
                    border:"2px solid rgba(0,255,160,0.28)"}}>
                    {ghostSelectedRecord.photo
                      ?<img src={ghostSelectedRecord.photo} alt="" style={{width:72,height:72,borderRadius:16,
                          objectFit:"cover" as const,border:"2px solid rgba(0,255,160,0.50)",flexShrink:0}}/>
                      :<div style={{width:72,height:72,borderRadius:16,flexShrink:0,
                          background:"rgba(0,180,100,0.18)",border:"2px solid rgba(0,255,160,0.35)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontFamily:"'Orbitron',sans-serif",fontSize:26,fontWeight:900,
                          color:"rgba(0,255,160,0.80)"}}>
                        {ghostSelectedRecord.name?.charAt(0)||"?"}
                      </div>}
                    <div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,
                        color:"rgba(0,255,180,0.98)",marginBottom:4,letterSpacing:"0.02em"}}>
                        {ghostSelectedRecord.surname}, {ghostSelectedRecord.name}
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                        color:"rgba(0,200,140,0.60)"}}>
                        {ghostSelectedRecord.id} · {ghostSelectedRecord.nationality||"—"}
                      </div>
                    </div>
                  </div>

                  {/* Record fields */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                    {[
                      ["📞","Phone",ghostSelectedRecord.phoneNo],
                      ["🌍","Nationality",ghostSelectedRecord.nationality],
                      ["📅","Date of Birth",ghostSelectedRecord.dateOfBirth],
                      ["⚧","Gender",ghostSelectedRecord.gender],
                      ["🩸","Blood Type",ghostSelectedRecord.bloodType],
                      ["🏙","City",ghostSelectedRecord.city],
                      ["📧","Email",ghostSelectedRecord.email],
                      ["💼","Occupation",ghostSelectedRecord.occupation],
                    ].filter(([,,v])=>v).map(([icon,label,value])=>(
                      <div key={label as string} style={{padding:"10px 12px",borderRadius:11,
                        background:"rgba(0,255,160,0.04)",border:"1px solid rgba(0,255,160,0.10)"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,
                          color:"rgba(0,180,110,0.40)",letterSpacing:"0.10em",marginBottom:3}}>
                          {icon as string} {label as string}
                        </div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                          color:"rgba(0,230,160,0.90)",fontWeight:600}}>{value as string}</div>
                      </div>
                    ))}
                  </div>

                  {/* Now search social for THIS identity */}
                  <div style={{marginBottom:14}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:800,
                      color:"rgba(0,200,130,0.45)",letterSpacing:"0.16em",marginBottom:10}}>
                      🔎 SEARCH THIS IDENTITY ON PLATFORMS
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {(()=>{
                        const name=`${ghostSelectedRecord.name||""} ${ghostSelectedRecord.surname||""}`.trim();
                        const phone=ghostSelectedRecord.phoneNo||"";
                        const digits2=(phone||"").replace(/[^0-9]/g,"");
                        const enc=encodeURIComponent;
                        return [
                          {label:"WhatsApp", icon:"💬",url:`https://wa.me/${digits2}`,col:"37,211,102"},
                          {label:"Telegram", icon:"✈️",url:`https://t.me/+${digits2}`,col:"0,136,204"},
                          {label:"Facebook", icon:"👥",url:`https://www.facebook.com/search/people/?q=${enc(name)}`,col:"24,119,242"},
                          {label:"Instagram",icon:"📸",url:`https://www.google.com/search?q=site:instagram.com+"${enc(name)}"`,col:"200,60,150"},
                          {label:"Twitter/X",icon:"🐦",url:`https://x.com/search?q="${enc(name)}"&f=user`,col:"150,150,150"},
                          {label:"TikTok",   icon:"🎵",url:`https://www.google.com/search?q=site:tiktok.com+"${enc(name)}"`,col:"255,0,80"},
                          {label:"LinkedIn", icon:"💼",url:`https://www.linkedin.com/search/results/people/?keywords=${enc(name)}`,col:"10,102,194"},
                          {label:"Google",   icon:"🔍",url:`https://www.google.com/search?q="${enc(name)}"`,col:"80,180,255"},
                        ].map(s=>(
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{padding:"10px 5px",borderRadius:12,textDecoration:"none",cursor:"pointer",
                              background:`rgba(${s.col},0.09)`,border:`1.5px solid rgba(${s.col},0.28)`,
                              display:"flex",flexDirection:"column" as const,alignItems:"center",gap:5,
                              transition:"all .18s"}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${s.col},0.20)`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${s.col},0.09)`;(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
                            <span style={{fontSize:20}}>{s.icon}</span>
                            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:7.5,fontWeight:800,
                              color:`rgba(${s.col},0.88)`}}>{s.label}</span>
                          </a>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Back to trace button */}
                  <button
                    onClick={()=>{setGhostView("results");setGhostSelectedRecord(null);}}
                    style={{width:"100%",padding:"13px",borderRadius:13,cursor:"pointer",
                      background:"rgba(0,255,160,0.07)",border:"1.5px solid rgba(0,255,160,0.25)",
                      color:"rgba(0,255,160,0.80)",fontFamily:"'Orbitron',sans-serif",
                      fontSize:11,fontWeight:700,letterSpacing:"0.10em",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      transition:"all .18s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.14)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,255,160,0.07)";}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M12 5l-7 7 7 7" stroke="rgba(0,255,160,0.80)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    BACK TO TRACE RESULTS
                  </button>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}

        {showFaceDetect && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(2,0,14,0.97)",
              backdropFilter:"blur(24px)",display:"flex",alignItems:"center",
              justifyContent:"center",padding:"16px"}}
            onClick={()=>{if(!fdLoading){setShowFaceDetect(false);setFdImage(null);setFdResult(null);setFdStage("");}}}>
            <motion.div
              initial={{scale:0.93,y:24,opacity:0}} animate={{scale:1,y:0,opacity:1}}
              exit={{scale:0.93,y:24,opacity:0}}
              transition={{type:"spring",stiffness:340,damping:30}}
              onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:620,maxHeight:"93vh",overflowY:"auto",
                borderRadius:24,
                background:"linear-gradient(165deg,rgba(10,0,24,0.995),rgba(5,0,16,1))",
                border:"1px solid rgba(255,80,200,0.16)",
                borderTop:"2.5px solid rgba(255,90,210,0.70)",
                boxShadow:"0 48px 120px rgba(0,0,0,0.94),0 0 90px rgba(200,40,180,0.07)",
                overflow:"hidden"}}>

              {/* hidden file input */}
              <input ref={fdInputRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>{
                  const f=e.target.files?.[0]; if(!f) return;
                  const reader=new FileReader();
                  reader.onload=ev=>{setFdImage(ev.target?.result as string);setFdResult(null);};
                  reader.readAsDataURL(f);
                  if(fdInputRef.current) fdInputRef.current.value="";
                }}/>

              {/* ── HEADER ── */}
              <div style={{padding:"20px 24px 14px",
                background:"linear-gradient(180deg,rgba(28,0,40,0.60),transparent)",
                borderBottom:"1px solid rgba(255,80,200,0.07)",
                display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:13}}>
                  <motion.div
                    animate={{boxShadow:["0 0 18px rgba(255,80,200,0.28)","0 0 40px rgba(255,80,200,0.58)","0 0 18px rgba(255,80,200,0.28)"]}}
                    transition={{duration:2.8,repeat:Infinity,ease:"easeInOut"}}
                    style={{width:44,height:44,borderRadius:13,flexShrink:0,
                      background:"linear-gradient(135deg,rgba(200,40,180,0.20),rgba(140,20,120,0.12))",
                      border:"1.5px solid rgba(255,80,200,0.45)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke="rgba(255,100,220,0.95)" strokeWidth="1.6" fill="rgba(255,80,200,0.10)"/>
                      <circle cx="12" cy="12" r="3.6" stroke="rgba(255,100,220,0.88)" strokeWidth="1.4"/>
                      <circle cx="12" cy="12" r="1.5" fill="rgba(255,120,230,0.95)"/>
                      <path d="M3 12c3-5 6-7 9-7s6 2 9 7" stroke="rgba(255,80,200,0.30)" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:19,fontWeight:900,
                      letterSpacing:"0.07em",
                      background:"linear-gradient(90deg,rgba(255,110,225,1),rgba(195,45,175,0.65))",
                      WebkitBackgroundClip:"text" as any,WebkitTextFillColor:"transparent" as any}}>
                      FACE DETECTION
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                      color:"rgba(195,70,175,0.42)",marginTop:2,letterSpacing:"0.13em"}}>
                      REVERSE IMAGE · AI VISION · OSINT SEARCH
                    </div>
                  </div>
                </div>
                <button onClick={()=>{setShowFaceDetect(false);setFdImage(null);setFdResult(null);setFdStage("");}}
                  style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,80,200,0.16)",
                    background:"rgba(255,80,200,0.05)",cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"center",color:"rgba(195,75,175,0.52)",
                    transition:"all .18s",flexShrink:0}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,80,200,0.16)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,80,200,0.05)";}}>
                  <X style={{width:14,height:14}}/>
                </button>
              </div>

              <div style={{padding:"20px 24px 26px"}}>

                {/* ── UPLOAD ZONE ── */}
                {!fdImage && !fdLoading && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                    <div
                      onClick={()=>fdInputRef.current?.click()}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={e=>{
                        e.preventDefault();
                        const f=e.dataTransfer.files[0]; if(!f||!f.type.startsWith("image/")) return;
                        const reader=new FileReader();
                        reader.onload=ev=>{setFdImage(ev.target?.result as string);setFdResult(null);};
                        reader.readAsDataURL(f);
                      }}
                      style={{border:"2.5px dashed rgba(255,80,200,0.25)",borderRadius:20,
                        padding:"48px 24px",textAlign:"center" as const,cursor:"pointer",
                        background:"rgba(200,40,180,0.03)",transition:"all .22s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,80,200,0.52)";(e.currentTarget as HTMLElement).style.background="rgba(200,40,180,0.08)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,80,200,0.25)";(e.currentTarget as HTMLElement).style.background="rgba(200,40,180,0.03)";}}>
                      <motion.div
                        animate={{scale:[1,1.05,1]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
                        style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 18px",
                          background:"rgba(200,40,180,0.12)",border:"2px solid rgba(255,80,200,0.38)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                        👁️
                      </motion.div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:800,
                        color:"rgba(255,110,225,0.90)",marginBottom:10,letterSpacing:"0.05em"}}>
                        DROP A FACE PHOTO HERE
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                        color:"rgba(195,70,175,0.48)",marginBottom:10}}>
                        or click to browse · JPG · PNG · WEBP
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                        color:"rgba(160,50,145,0.32)",lineHeight:1.8}}>
                        AI scans face features · reads any visible text / username · finds matches online
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── PREVIEW: ready to scan ── */}
                {fdImage && !fdLoading && !fdResult && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    style={{textAlign:"center" as const}}>
                    <div style={{position:"relative" as const,display:"inline-block",marginBottom:22}}>
                      <img src={fdImage} alt="face"
                        style={{width:180,height:180,objectFit:"cover" as const,
                          borderRadius:"50%",border:"3px solid rgba(255,80,200,0.55)",
                          boxShadow:"0 0 52px rgba(200,40,180,0.35)"}}/>
                      <motion.div animate={{rotate:360}} transition={{duration:5,repeat:Infinity,ease:"linear"}}
                        style={{position:"absolute" as const,inset:-9,borderRadius:"50%",
                          border:"2px dashed rgba(255,80,200,0.33)"}}/>
                      <motion.div animate={{rotate:-360}} transition={{duration:8,repeat:Infinity,ease:"linear"}}
                        style={{position:"absolute" as const,inset:-18,borderRadius:"50%",
                          border:"1px dashed rgba(200,40,180,0.18)"}}/>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                      color:"rgba(195,75,175,0.52)",marginBottom:20,letterSpacing:"0.09em"}}>
                      PHOTO LOADED · READY TO SCAN
                    </div>
                    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                      <button onClick={()=>{setFdImage(null);setFdResult(null);}}
                        style={{padding:"10px 20px",borderRadius:11,cursor:"pointer",
                          background:"rgba(255,60,60,0.07)",border:"1px solid rgba(255,80,80,0.22)",
                          color:"rgba(255,120,120,0.72)",fontFamily:"'Exo 2',sans-serif",
                          fontSize:12,fontWeight:600,transition:"all .18s"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,60,60,0.15)";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,60,60,0.07)";}}>
                        🗑 Clear
                      </button>
                      <button
                        onClick={async()=>{
                          if(!fdImage) return;
                          setFdLoading(true);

                          // ── Step 1: resize + extract base64 ──
                          setFdStage("Preparing image…");
                          const img2=new Image(); img2.src=fdImage;
                          await new Promise<void>(res=>{img2.onload=()=>res();img2.onerror=()=>res();});
                          const maxDim=900;
                          const scale=Math.min(1,maxDim/Math.max(img2.naturalWidth||500,img2.naturalHeight||500));
                          const cv2=document.createElement("canvas");
                          cv2.width=Math.round((img2.naturalWidth||500)*scale);
                          cv2.height=Math.round((img2.naturalHeight||500)*scale);
                          const ctx2=cv2.getContext("2d")!;
                          ctx2.drawImage(img2,0,0,cv2.width,cv2.height);
                          const b64=cv2.toDataURL("image/jpeg",0.90).replace(/^data:image\/\w+;base64,/,"");
                          const dataUrl=cv2.toDataURL("image/jpeg",0.90);
                          const blob:Blob = await new Promise(res=>cv2.toBlob(b=>res(b!),"image/jpeg",0.90));

                          // ── Step 2: AI face analysis ──
                          setFdStage("AI analysing face — reading features and any text in image…");
                          let face:any={face_detected:false,age:"",gender:"",ethnicity:"",hair:"",skin:"",
                            features:[],handle:"",name:"",platform:"",background:"",description:""};
                          let aiOk=false;
                          try {
                            const resp=await fetch("https://api.anthropic.com/v1/messages",{
                              method:"POST",
                              headers:{"Content-Type":"application/json",
                                "anthropic-version":"2023-06-01",
                                "anthropic-dangerous-direct-browser-access":"true"},
                              body:JSON.stringify({
                                model:"claude-sonnet-4-20250514",
                                max_tokens:700,
                                messages:[{role:"user",content:[
                                  {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
                                  {type:"text",text:`You are a forensic face analysis AI. Analyse this image VERY carefully.
Look for:
1. Any visible TEXT, USERNAMES, WATERMARKS, HANDLES (e.g. @username, TikTok/Instagram overlays, name tags)
2. Any platform UI visible (TikTok frame, Instagram grid, Facebook header)
3. Physical face features for search purposes
4. Background clues (location, landmarks, flags, signage)

Reply ONLY with this exact JSON (no markdown):
{"face_detected":true,"age":"estimated age range","gender":"Male/Female","ethnicity":"specific ethnicity","hair":"hair description","skin":"skin tone","features":["feature1","feature2"],"handle":"@username_EXACTLY_as_visible_or_empty","name":"full_name_if_visible_or_empty","platform":"instagram/tiktok/facebook/twitter/youtube/empty","background":"location_or_landmark_clue_or_empty","description":"Precise 1-sentence physical description useful for reverse image searching"}`}
                                ]}]})
                            });
                            if(resp.ok){
                              const d=await resp.json();
                              const txt=(d.content||[]).map((b:any)=>b.text||"").join("").trim();
                              try{
                                const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
                                Object.assign(face,parsed); aiOk=true;
                              }catch{}
                            }
                          }catch{}

                          // ── Step 3: BIMS database face compare ──
                          setFdStage("Scanning BIMS database for face matches…");
                          const allRecs=getRecords().filter((r:any)=>r.photo);
                          let dbFaceMatches:any[]=[];
                          if(allRecs.length>0 && face.face_detected){
                            // pixel-level similarity on downscaled thumbnails
                            const getPixels=(src:string,size:number):Promise<Uint8ClampedArray>=>{
                              return new Promise(res=>{
                                const im=new Image(); im.src=src;
                                im.onload=()=>{
                                  const c3=document.createElement("canvas");
                                  c3.width=c3.height=size;
                                  c3.getContext("2d")!.drawImage(im,0,0,size,size);
                                  res(c3.getContext("2d")!.getImageData(0,0,size,size).data);
                                };
                                im.onerror=()=>res(new Uint8ClampedArray(size*size*4));
                              });
                            };
                            const queryPx=await getPixels(dataUrl,24);
                            for(const rec of allRecs.slice(0,80)){
                              try{
                                const recPx=await getPixels(rec.photo,24);
                                let diff=0;
                                for(let i=0;i<queryPx.length;i+=4){
                                  diff+=Math.abs(queryPx[i]-recPx[i])+Math.abs(queryPx[i+1]-recPx[i+1])+Math.abs(queryPx[i+2]-recPx[i+2]);
                                }
                                const sim=1-diff/(queryPx.length/4*3*255);
                                if(sim>=0.74) dbFaceMatches.push({rec,sim:Math.round(sim*100)});
                              }catch{}
                            }
                            dbFaceMatches.sort((a,b)=>b.sim-a.sim);
                          }

                          // ── Step 4: build search sections ──
                          setFdStage("Building reverse image search links…");
                          const enc=encodeURIComponent;
                          const handle=(face.handle||"").replace(/[@\s]/g,"");
                          const name=(face.name||"").trim();
                          const desc=face.description||[face.age,face.gender,face.ethnicity].filter(Boolean).join(" ");
                          const background=(face.background||"").trim();
                          const sections:any[]=[];

                          // Section A — Reverse image engines (with auto-upload note)
                          sections.push({id:"reverse",
                            title:"🔍 REVERSE IMAGE SEARCH ENGINES",
                            note:"Best approach: copy your photo → open site → paste or upload there",
                            autoUpload:true,
                            items:[
                              {label:"Yandex Images",  url:"https://yandex.com/images/",             note:"BEST for faces",    star:true,  col:"255,55,55"},
                              {label:"Google Lens",    url:"https://lens.google.com/",               note:"Drag & drop photo", star:true,  col:"66,133,244"},
                              {label:"TinEye",         url:"https://tineye.com/",                    note:"Exact copy finder", star:true,  col:"255,135,0"},
                              {label:"FaceCheck.ID",   url:"https://facecheck.id/",                  note:"Face-only search",  star:true,  col:"200,40,180"},
                              {label:"PimEyes",        url:"https://pimeyes.com/en",                 note:"Face database",     star:true,  col:"150,80,220"},
                              {label:"Search4Faces",   url:"https://search4faces.com/",              note:"Social faces",      star:false, col:"255,80,200"},
                              {label:"Bing Visual",    url:"https://www.bing.com/visualsearch",      note:"MS AI search",      star:false, col:"0,120,215"},
                              {label:"Lenso.ai",       url:"https://lenso.ai/en",                    note:"AI face search",    star:false, col:"80,180,255"},
                            ]
                          });

                          // Section B — handle detected
                          if(handle){
                            sections.push({id:"handle",
                              title:`🎯 USERNAME DETECTED IN IMAGE: @${handle}`,
                              note:`Found in the photo — direct account links`,
                              highlight:true,
                              items:[
                                {label:"Instagram",  url:`https://instagram.com/${enc(handle)}/`,                              star:true,  col:"200,60,150"},
                                {label:"TikTok",     url:`https://tiktok.com/@${enc(handle)}`,                                 star:true,  col:"255,0,80"},
                                {label:"Twitter/X",  url:`https://x.com/${enc(handle)}`,                                       star:true,  col:"150,150,150"},
                                {label:"YouTube",    url:`https://youtube.com/@${enc(handle)}`,                                 star:true,  col:"255,50,50"},
                                {label:"Facebook",   url:`https://facebook.com/${enc(handle)}`,                                 star:false, col:"24,119,242"},
                                {label:"Snapchat",   url:`https://snapchat.com/add/${enc(handle)}`,                            star:false, col:"255,220,0"},
                                {label:"Pinterest",  url:`https://pinterest.com/${enc(handle)}/`,                              star:false, col:"230,0,35"},
                                {label:"Twitch",     url:`https://twitch.tv/${enc(handle)}`,                                   star:false, col:"145,70,255"},
                                {label:"Reddit",     url:`https://reddit.com/user/${enc(handle)}`,                             star:false, col:"255,80,0"},
                                {label:"GitHub",     url:`https://github.com/${enc(handle)}`,                                  star:false, col:"130,130,130"},
                              ]
                            });
                          }

                          // Section C — name detected
                          if(name){
                            sections.push({id:"name",
                              title:`🪪 NAME DETECTED: "${name}"`,
                              note:"Visible name/text found in image — searching by identity",
                              items:[
                                {label:"Facebook People", url:`https://facebook.com/search/people/?q=${enc(name)}`,             star:true,  col:"24,119,242"},
                                {label:"LinkedIn People", url:`https://linkedin.com/search/results/people/?keywords=${enc(name)}`,star:true, col:"10,102,194"},
                                {label:"Twitter/X",       url:`https://x.com/search?q="${enc(name)}"&f=user`,                   star:true,  col:"150,150,150"},
                                {label:"Google",          url:`https://google.com/search?q="${enc(name)}"`,                     star:true,  col:"80,180,255"},
                                {label:"Pipl",            url:`https://pipl.com/`,                                              star:false, col:"150,80,220"},
                                {label:"Spokeo",          url:`https://spokeo.com/search?q=${enc(name)}`,                       star:false, col:"200,80,180"},
                                {label:"BeenVerified",    url:`https://beenverified.com/people/?q=${enc(name)}`,                star:false, col:"200,80,180"},
                                {label:"Instagram",       url:`https://instagram.com/${enc(name.replace(/\s+/g,"").toLowerCase())}/`,star:false,col:"200,60,150"},
                              ]
                            });
                          }

                          // Section D — appearance search (always)
                          if(desc){
                            sections.push({id:"appearance",
                              title:"👤 SEARCH BY APPEARANCE",
                              note:`AI description: "${desc}"${background?" · Background: "+background:""}`,
                              items:[
                                {label:"Instagram",  url:`https://google.com/search?q=${enc('"'+desc+'" site:instagram.com')}`,  star:true,  col:"200,60,150"},
                                {label:"TikTok",     url:`https://google.com/search?q=${enc('"'+desc+'" site:tiktok.com')}`,     star:true,  col:"255,0,80"},
                                {label:"Facebook",   url:`https://google.com/search?q=${enc('"'+desc+'" site:facebook.com')}`,   star:false, col:"24,119,242"},
                                {label:"Twitter/X",  url:`https://google.com/search?q=${enc('"'+desc+'" site:x.com')}`,         star:false, col:"150,150,150"},
                                {label:"LinkedIn",   url:`https://google.com/search?q=${enc('"'+desc+'" site:linkedin.com')}`,  star:false, col:"10,102,194"},
                                {label:"YouTube",    url:`https://google.com/search?q=${enc('"'+desc+'" site:youtube.com')}`,   star:false, col:"255,50,50"},
                                ...(background?[
                                  {label:`Location: ${background}`,url:`https://google.com/maps/search/${enc(background)}`,star:false,col:"80,200,120"},
                                ]:[]),
                              ]
                            });
                          }

                          // Section E — OSINT tools
                          sections.push({id:"osint",
                            title:"🕵️ OSINT & IDENTITY TOOLS",
                            note:"Paste name or details found above into these tools",
                            items:[
                              {label:"IntelligenceX", url:"https://intelx.io/",          note:"Dark web search",   star:true,  col:"150,80,220"},
                              {label:"Pipl",          url:"https://pipl.com/",            note:"Deep identity",     star:true,  col:"150,80,220"},
                              {label:"Webmii",        url:name?`https://webmii.com/people?n=${enc(name)}`:"https://webmii.com/",note:"Web presence",star:false,col:"200,80,180"},
                              {label:"IDCrawl",       url:name?`https://idcrawl.com/${enc(name)}`:"https://idcrawl.com/",note:"Multi-platform",star:false,col:"200,80,180"},
                              {label:"Social Searcher",url:`https://social-searcher.com/social-buzz/?q=${enc(name||desc)}`,note:"Social media",star:false,col:"200,80,180"},
                            ]
                          });

                          setFdLoading(false); setFdStage("");
                          setFdResult({ok:true,face,sections,desc,handle,name,aiOk,dataUrl,dbFaceMatches,blob,background});
                        }}
                        style={{padding:"13px 30px",borderRadius:13,cursor:"pointer",
                          background:"linear-gradient(135deg,rgba(210,45,185,0.90),rgba(155,20,140,0.88))",
                          border:"0",color:"rgba(255,220,255,0.97)",
                          fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,
                          letterSpacing:"0.10em",
                          boxShadow:"0 4px 30px rgba(200,40,180,0.48)"}}>
                        👁 SCAN &amp; SEARCH
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── LOADING ── */}
                {fdLoading && (
                  <div style={{padding:"44px 0",textAlign:"center" as const}}>
                    <div style={{position:"relative" as const,width:80,height:80,margin:"0 auto 22px"}}>
                      <motion.div animate={{rotate:360}} transition={{duration:3,repeat:Infinity,ease:"linear"}}
                        style={{position:"absolute" as const,inset:0,borderRadius:"50%",
                          border:"2.5px solid transparent",
                          borderTopColor:"rgba(255,80,200,0.90)",
                          borderRightColor:"rgba(255,80,200,0.40)"}}/>
                      <motion.div animate={{rotate:-360}} transition={{duration:5,repeat:Infinity,ease:"linear"}}
                        style={{position:"absolute" as const,inset:8,borderRadius:"50%",
                          border:"2px solid transparent",
                          borderTopColor:"rgba(200,40,180,0.60)",
                          borderLeftColor:"rgba(200,40,180,0.30)"}}/>
                      <div style={{position:"absolute" as const,inset:0,display:"flex",
                        alignItems:"center",justifyContent:"center",fontSize:22}}>👁️</div>
                    </div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:800,
                      color:"rgba(255,100,220,0.88)",letterSpacing:"0.13em",marginBottom:10}}>
                      SCANNING
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                      color:"rgba(195,70,175,0.50)",letterSpacing:"0.08em",lineHeight:1.6}}>
                      {fdStage}
                    </div>
                  </div>
                )}

                {/* ── RESULTS ── */}
                {fdResult?.ok && !fdLoading && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.22}}>

                    {/* ── COPY PHOTO HELPER ── */}
                    <div style={{marginBottom:18,padding:"12px 16px",borderRadius:14,
                      background:"rgba(255,80,200,0.07)",border:"1.5px solid rgba(255,80,200,0.24)",
                      display:"flex",alignItems:"center",gap:14}}>
                      <img src={fdResult.dataUrl} alt="" style={{width:48,height:48,borderRadius:10,
                        objectFit:"cover" as const,border:"2px solid rgba(255,80,200,0.45)",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8.5,fontWeight:800,
                          color:"rgba(255,100,220,0.70)",letterSpacing:"0.12em",marginBottom:5}}>
                          {fdResult.aiOk
                            ? fdResult.face.face_detected
                              ? "✓ FACE ANALYSED BY AI"
                              : "⚠ NO FACE DETECTED — RUNNING IMAGE SEARCH ANYWAY"
                            : "IMAGE READY FOR SEARCH"}
                        </div>
                        {fdResult.aiOk && fdResult.desc && (
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,
                            color:"rgba(255,160,235,0.75)",lineHeight:1.5}}>
                            {fdResult.desc}
                          </div>
                        )}
                        {fdResult.background && (
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,
                            color:"rgba(80,200,120,0.65)",marginTop:3}}>
                            📍 Background: {fdResult.background}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={async()=>{
                          try{
                            const item=new ClipboardItem({"image/png":fdResult.blob});
                            await navigator.clipboard.write([item]);
                            alert("✓ Photo copied to clipboard!\nNow open Yandex or Google Lens and paste (Ctrl+V).");
                          }catch{
                            alert("Right-click the photo and choose 'Copy Image', then paste in Yandex/Google Lens.");
                          }
                        }}
                        style={{padding:"8px 14px",borderRadius:9,cursor:"pointer",
                          background:"rgba(255,80,200,0.16)",border:"1.5px solid rgba(255,80,200,0.45)",
                          color:"rgba(255,160,235,0.90)",fontFamily:"'Orbitron',sans-serif",
                          fontSize:9,fontWeight:800,letterSpacing:"0.06em",flexShrink:0}}>
                        📋 COPY PHOTO
                      </button>
                    </div>

                    {/* ── BIMS DATABASE FACE MATCHES ── */}
                    {fdResult.dbFaceMatches?.length>0 && (
                      <div style={{marginBottom:18}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8.5,fontWeight:800,
                          color:"rgba(0,255,160,0.55)",letterSpacing:"0.14em",marginBottom:10,
                          display:"flex",alignItems:"center",gap:8}}>
                          <motion.div animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.4,repeat:Infinity}}
                            style={{width:7,height:7,borderRadius:"50%",background:"rgba(0,255,160,0.90)",
                              boxShadow:"0 0 14px rgba(0,255,160,0.80)"}}/>
                          FACE MATCH IN BIMS DATABASE ({fdResult.dbFaceMatches.length})
                        </div>
                        {fdResult.dbFaceMatches.map((m:any,i:number)=>(
                          <motion.div key={i}
                            initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                            style={{marginBottom:8,padding:"12px 14px",borderRadius:14,
                              background:"linear-gradient(135deg,rgba(0,36,24,0.90),rgba(0,22,15,0.95))",
                              border:"2px solid rgba(0,255,160,0.30)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              {m.rec.photo
                                ?<img src={m.rec.photo} alt="" style={{width:50,height:50,borderRadius:11,
                                    objectFit:"cover" as const,border:"2px solid rgba(0,255,160,0.45)",flexShrink:0}}/>
                                :<div style={{width:50,height:50,borderRadius:11,flexShrink:0,
                                    background:"rgba(0,180,100,0.16)",border:"2px solid rgba(0,255,160,0.30)",
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    fontFamily:"'Orbitron',sans-serif",fontSize:18,color:"rgba(0,255,160,0.75)"}}>
                                  {m.rec.name?.charAt(0)||"?"}
                                </div>}
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,
                                  color:"rgba(0,255,180,0.97)",marginBottom:3}}>
                                  {m.rec.surname}, {m.rec.name}
                                </div>
                                <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
                                  {[["🆔",m.rec.id],["📞",m.rec.phoneNo||"—"],["🌍",m.rec.nationality||"—"]].map(([ic,val])=>(
                                    <span key={ic as string} style={{fontFamily:"'JetBrains Mono',monospace",
                                      fontSize:9.5,color:"rgba(0,200,140,0.65)"}}>
                                      {ic as string} <span style={{color:"rgba(0,230,160,0.88)"}}>{val as string}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div style={{padding:"4px 10px",borderRadius:8,flexShrink:0,
                                background:m.sim>=88?"rgba(0,255,160,0.18)":"rgba(255,180,0,0.14)",
                                border:`1px solid ${m.sim>=88?"rgba(0,255,160,0.40)":"rgba(255,180,0,0.35)"}`,
                                fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:800,
                                color:m.sim>=88?"rgba(0,255,160,0.95)":"rgba(255,190,30,0.90)"}}>
                                {m.sim}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* ── SEARCH SECTIONS ── */}
                    {fdResult.sections.map((sec:any)=>(
                      <div key={sec.id} style={{marginBottom:18}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8.5,fontWeight:800,
                          color:sec.highlight?"rgba(255,220,60,0.70)":"rgba(195,75,175,0.55)",
                          letterSpacing:"0.14em",marginBottom:4}}>
                          {sec.title}
                        </div>
                        {sec.note && (
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                            color:sec.highlight?"rgba(255,200,40,0.45)":"rgba(160,50,145,0.38)",
                            marginBottom:9,lineHeight:1.55}}>
                            {sec.note}
                          </div>
                        )}
                        <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                          {sec.items.map((item:any)=>(
                            <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                              style={{padding:item.star?"8px 14px":"6px 12px",borderRadius:9,
                                textDecoration:"none",cursor:"pointer",
                                background:`rgba(${item.col},${item.star?"0.15":"0.07"})`,
                                border:`${item.star?"2":"1.5"}px solid rgba(${item.col},${item.star?"0.50":"0.24"})`,
                                color:`rgba(${item.col},${item.star?"1.0":"0.82"})`,
                                fontFamily:"'Exo 2',sans-serif",
                                fontSize:item.star?11.5:10.5,
                                fontWeight:item.star?700:500,
                                display:"inline-flex",alignItems:"center",gap:5,
                                boxShadow:item.star?`0 0 12px rgba(${item.col},0.18)`:"none",
                                transition:"all .18s"}}
                              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${item.col},0.26)`;(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
                              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`rgba(${item.col},${item.star?"0.15":"0.07"})`;(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
                              {item.label}
                              {item.note&&<span style={{fontSize:8.5,opacity:0.48,fontWeight:400}}>{item.note}</span>}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* new search button */}
                    <button onClick={()=>{setFdImage(null);setFdResult(null);}}
                      style={{width:"100%",padding:"11px",borderRadius:12,cursor:"pointer",marginTop:4,
                        background:"rgba(255,80,200,0.06)",border:"1.5px solid rgba(255,80,200,0.22)",
                        color:"rgba(255,120,220,0.72)",fontFamily:"'Orbitron',sans-serif",
                        fontSize:10,fontWeight:700,letterSpacing:"0.10em",transition:"all .18s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,80,200,0.14)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,80,200,0.06)";}}>
                      + NEW SEARCH
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}


        {showDeepSearch && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(1,3,14,0.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
            onClick={()=>setShowDeepSearch(false)}>
            <motion.div
              initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
              transition={{type:"spring",stiffness:320,damping:28}}
              onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:560,maxHeight:"80vh",overflowY:"auto",borderRadius:18,background:"linear-gradient(160deg,rgba(6,16,44,0.78),rgba(3,10,30,0.78))",border:"1px solid rgba(100,80,255,0.3)",borderTop:"2px solid rgba(120,100,255,0.55)",boxShadow:"0 32px 80px rgba(0,0,0,0.78)",padding:"20px 22px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:800,color:dsType==="face"?"rgba(0,230,255,0.96)":"rgba(220,210,255,0.96)"}}>
                    {dsType==="face"?"FACIAL RECOGNITION":"Deep Search"}
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:dsType==="face"?"rgba(0,180,255,0.55)":"rgba(140,120,255,0.55)",marginTop:2,letterSpacing:"0.08em"}}>
                    {dsType==="face"?"REVERSE IMAGE · OSINT NETWORK SCAN":"OSINT INTELLIGENCE QUERY"}
                  </div>
                </div>
                <button onClick={()=>setShowDeepSearch(false)} style={{width:30,height:30,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(200,190,255,0.6)"}}>
                  <X style={{width:14,height:14}}/>
                </button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {(["name","username","email","phone","face"] as const).map(t=>(
                  <button key={t} onClick={()=>setDsType(t)}
                    style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:t==="face"?8:9,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase" as const,border:`1px solid ${dsType===t?(t==="face"?"rgba(0,208,255,0.7)":"rgba(120,100,255,0.6)"):"rgba(255,255,255,0.1)"}`,background:dsType===t?(t==="face"?"rgba(0,180,240,0.18)":"rgba(100,80,255,0.18)"):"rgba(255,255,255,0.04)",color:dsType===t?(t==="face"?"rgba(0,225,255,0.95)":"rgba(200,185,255,0.95)"):"rgba(140,130,200,0.5)",transition:"all .16s",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                    {t==="face"?"📷 FACE":t}
                  </button>
                ))}
              </div>
              {dsType!=="face" ? (
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  <input
                    value={dsInput} onChange={e=>setDsInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter")handleDeepSearch();}}
                    placeholder={dsType==="name"?"Full name…":dsType==="username"?"@username…":dsType==="email"?"email@domain.com":"Phone number…"}
                    style={{flex:1,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(100,80,255,0.28)",outline:"none",color:"rgba(220,215,255,0.95)",fontFamily:"'Exo 2',sans-serif",fontSize:13}}
                  />
                  <button onClick={handleDeepSearch} disabled={dsLoading||!dsInput.trim()}
                    style={{padding:"10px 18px",borderRadius:10,cursor:dsLoading||!dsInput.trim()?"not-allowed":"pointer",background:"linear-gradient(135deg,hsl(260,80%,55%),hsl(280,80%,65%))",border:"0",color:"white",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,opacity:dsLoading||!dsInput.trim()?0.5:1}}>
                    {dsLoading?"…":"Search"}
                  </button>
                </div>
              ) : (
                /* ── FACE TAB: Full facial recognition UI ── */
                <div style={{marginBottom:16}}>
                  <input ref={faceInputRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setFaceFile(ev.target?.result as string);r.readAsDataURL(f);}}/>
                  {!faceFile && (
                    <div onClick={()=>faceInputRef.current?.click()}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setFaceFile(ev.target?.result as string);r.readAsDataURL(f);}}
                      style={{border:"2px dashed rgba(0,200,255,0.30)",borderRadius:12,padding:"28px 16px",textAlign:"center" as const,cursor:"pointer",background:"rgba(0,120,200,0.05)",transition:"all .2s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.border="2px dashed rgba(0,220,255,0.55)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.border="2px dashed rgba(0,200,255,0.30)";}}>
                      <div style={{fontSize:28,marginBottom:8}}>📷</div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"rgba(0,220,255,0.85)",marginBottom:5}}>DROP PHOTO HERE</div>
                      <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:10.5,color:"rgba(0,180,255,0.52)"}}>or click to browse · JPG PNG WEBP</div>
                    </div>
                  )}
                  {faceFile && !faceResults && !faceLoading && (
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(0,120,200,0.08)",border:"1px solid rgba(0,200,255,0.25)",borderRadius:10}}>
                      <img src={faceFile} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover" as const,border:"2px solid rgba(0,200,255,0.50)",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"rgba(0,220,255,0.85)",fontWeight:700,marginBottom:4}}>PHOTO LOADED</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,180,255,0.50)"}}>Ready to scan network</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setFaceFile(null);setFaceResults(null);}}
                          style={{padding:"6px 12px",borderRadius:8,background:"rgba(255,60,60,0.10)",border:"1px solid rgba(255,80,80,0.28)",color:"rgba(255,120,120,0.80)",fontFamily:"'Exo 2',sans-serif",fontSize:11,cursor:"pointer"}}>
                          Clear
                        </button>
                        <button onClick={async()=>{
                          if(!faceFile)return;
                          setFaceLoading(true);setFaceStage("Processing…");
                          const enc=encodeURIComponent;
                          let face:any={age:"",gender:"",origin:"",hair:"",handle:"",name:""};
                          let apiWorked=false;
                          try{
                            const img2=new Image();img2.src=faceFile;
                            await new Promise<void>(res=>{img2.onload=()=>res();});
                            const scale=Math.min(1,600/Math.max(img2.width,img2.height));
                            const cv2=document.createElement("canvas");
                            cv2.width=Math.round(img2.width*scale);cv2.height=Math.round(img2.height*scale);
                            cv2.getContext("2d")!.drawImage(img2,0,0,cv2.width,cv2.height);
                            const b64=cv2.toDataURL("image/jpeg",.85).replace(/^data:image\/\w+;base64,/,"");
                            setFaceStage("AI analysing…");
                            const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
                              headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
                              body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:[
                                {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
                                {type:"text",text:"Reply ONLY with JSON: {\"age\":\"\",\"gender\":\"\",\"origin\":\"\",\"hair\":\"\",\"skin\":\"\",\"handle\":\"\",\"name\":\"\"}"}
                              ]}]})
                            });
                            if(resp.ok){const d=await resp.json();const t=(d.content||[]).map((b:any)=>b.text||"").join("").trim();try{Object.assign(face,JSON.parse(t.replace(/```json|```/g,"").trim()));apiWorked=true;}catch{}}
                          }catch{}
                          setFaceStage("Building links…");
                          const handle=(face.handle||"").replace(/[@\s]/g,"");
                          const name=face.name||"";
                          const desc=[face.age,face.gender,face.origin,face.hair].filter(Boolean).join(" ");
                          const links:any[]=[];
                          links.push({cat:"🔍 Reverse Image Search",sub:"Open site → upload your photo",items:[
                            {label:"FaceCheck.ID",url:"https://facecheck.id",note:"Best face search",hue:"0,85%,65%",bold:true},
                            {label:"Yandex Images",url:"https://yandex.com/images/",note:"Excellent for faces",hue:"188,90%,60%",bold:true},
                            {label:"PimEyes",url:"https://pimeyes.com/",note:"Face database",hue:"270,80%,68%",bold:true},
                            {label:"Google Images",url:"https://images.google.com/",hue:"188,80%,62%"},
                            {label:"TinEye",url:"https://tineye.com/",hue:"188,80%,62%"},
                            {label:"Bing Visual",url:"https://bing.com/visualsearch",hue:"188,80%,62%"},
                          ]});
                          if(handle||name){const q=handle||enc(name);links.push({cat:`📱 Identity Detected: ${handle?"@"+handle:name}`,sub:"Found in your image",items:[
                            {label:"Instagram",url:`https://instagram.com/${q}/`,hue:"320,85%,62%",bold:true},
                            {label:"TikTok",url:`https://tiktok.com/@${q}`,hue:"172,100%,50%",bold:true},
                            {label:"X/Twitter",url:`https://x.com/${q}`,hue:"0,0%,88%"},
                            {label:"Facebook",url:`https://facebook.com/search/people/?q=${enc(handle||name)}`,hue:"220,85%,62%"},
                            {label:"YouTube",url:`https://youtube.com/@${q}`,hue:"0,90%,62%"},
                            {label:"LinkedIn",url:`https://linkedin.com/search/results/people/?keywords=${enc(handle||name)}`,hue:"210,80%,60%"},
                          ]});}
                          if(desc)links.push({cat:"👤 Search by Appearance",sub:desc,items:[
                            {label:"Instagram",url:`https://google.com/search?q=${enc('"'+desc+'" site:instagram.com')}`,hue:"320,85%,62%"},
                            {label:"Facebook",url:`https://google.com/search?q=${enc('"'+desc+'" site:facebook.com')}`,hue:"220,85%,62%"},
                            {label:"TikTok",url:`https://google.com/search?q=${enc('"'+desc+'" site:tiktok.com')}`,hue:"172,100%,50%"},
                            {label:"LinkedIn",url:`https://google.com/search?q=${enc('"'+desc+'" site:linkedin.com')}`,hue:"210,80%,60%"},
                            {label:"Twitter",url:`https://google.com/search?q=${enc('"'+desc+'" site:x.com')}`,hue:"0,0%,88%"},
                          ]});
                          links.push({cat:"🕵️ OSINT Databases",sub:"Public records and people search",items:[
                            {label:"Pipl",url:"https://pipl.com/",hue:"270,80%,68%"},
                            {label:"Spokeo",url:"https://spokeo.com/",hue:"270,80%,68%"},
                            {label:"Intelius",url:"https://intelius.com/",hue:"270,80%,68%"},
                            {label:"BeenVerified",url:"https://beenverified.com/",hue:"270,80%,68%"},
                          ]});
                          setFaceResults({ok:true,face,links,desc,handle,name,apiWorked,dataUrl:faceFile});
                          setFaceLoading(false);setFaceStage("");
                        }}
                        style={{padding:"6px 16px",borderRadius:8,background:"linear-gradient(135deg,rgba(0,160,255,0.85),rgba(0,110,220,0.9))",border:"0",color:"white",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em"}}>
                          SCAN
                        </button>
                      </div>
                    </div>
                  )}
                  {faceLoading && (
                    <div style={{textAlign:"center" as const,padding:"20px 0"}}>
                      <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(0,200,255,0.15)",borderTopColor:"rgba(0,200,255,0.85)",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(0,180,255,0.60)"}}>{faceStage}</div>
                    </div>
                  )}
                  {faceResults?.ok && (
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"8px 10px",background:"rgba(0,180,80,0.08)",border:"1px solid rgba(0,200,80,0.22)",borderRadius:8}}>
                        <img src={faceResults.dataUrl||faceFile||""} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover" as const,border:"2px solid rgba(0,200,255,0.50)",flexShrink:0}}/>
                        <div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"rgba(0,220,255,0.85)",fontWeight:700}}>SCAN COMPLETE · {faceResults.links.reduce((a:number,c:any)=>a+c.items.length,0)} LINKS</div>
                          {faceResults.apiWorked&&faceResults.desc&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,180,255,0.50)",marginTop:2}}>AI detected: {faceResults.desc}</div>}
                          {(faceResults.handle||faceResults.name)&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,220,100,0.70)",marginTop:2}}>Identity: {faceResults.handle?"@"+faceResults.handle:faceResults.name}</div>}
                        </div>
                        <button onClick={()=>{setFaceFile(null);setFaceResults(null);}} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,background:"rgba(255,60,60,0.10)",border:"1px solid rgba(255,80,80,0.28)",color:"rgba(255,120,120,0.80)",fontFamily:"'Exo 2',sans-serif",fontSize:10,cursor:"pointer"}}>New Scan</button>
                      </div>
                      {faceResults.links.map((cat:any)=>(
                        <div key={cat.cat} style={{marginBottom:10}}>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,color:"rgba(0,200,255,0.60)",letterSpacing:"0.10em",marginBottom:cat.sub?2:5}}>{cat.cat}</div>
                          {cat.sub&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(0,160,200,0.40)",marginBottom:5}}>{cat.sub}</div>}
                          <div style={{display:"flex",flexWrap:"wrap" as const,gap:4}}>
                            {cat.items.map((lk:any)=>(
                              <a key={lk.label} href={lk.url} target="_blank" rel="noopener noreferrer"
                                style={{padding:lk.bold?"5px 11px":"4px 9px",borderRadius:6,
                                  background:lk.bold?`hsla(${lk.hue},0.20)`:`hsla(${lk.hue},0.09)`,
                                  border:`1.5px solid hsla(${lk.hue},${lk.bold?"0.48":"0.22"})`,
                                  color:`hsla(${lk.hue},.92)`,fontFamily:"'Exo 2',sans-serif",
                                  fontSize:lk.bold?10.5:10,fontWeight:lk.bold?700:400,
                                  textDecoration:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
                                {lk.label}{lk.note&&<span style={{fontSize:8,opacity:.5}}>({lk.note})</span>}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {dsResults && !dsResults.error && dsResults.platforms?.map((p:any)=>(
                <div key={p.name} style={{marginBottom:12}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:`hsla(${p.color},0.8)`,letterSpacing:"0.1em",marginBottom:6,textTransform:"uppercase" as const}}>{p.icon} {p.name}</div>
                  <div style={{display:"flex",flexWrap:"wrap" as const,gap:5}}>
                    {p.links.slice(0,4).map((lk:any)=>(
                      <a key={lk.url} href={lk.url} target="_blank" rel="noopener noreferrer"
                        style={{padding:"4px 10px",borderRadius:6,background:`hsla(${p.color},0.1)`,border:`1px solid hsla(${p.color},0.25)`,color:`hsla(${p.color},0.85)`,fontFamily:"'Exo 2',sans-serif",fontSize:10.5,textDecoration:"none",cursor:"pointer"}}>
                        {lk.variant}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {dsResults?.error && <div style={{textAlign:"center" as const,padding:"20px",color:"rgba(255,100,100,0.7)",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>Search failed. Try again.</div>}
              {!dsResults && !dsLoading && <div style={{textAlign:"center" as const,padding:"20px 0",color:"rgba(140,130,200,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>Enter a name, username, email or phone number to begin.</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
      {/* ─── GLOBAL FOOTER ─── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"9px 32px",background:"rgba(0,4,16,0.78)",borderTop:"1px solid rgba(0,200,245,0.16)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,gap:12,backdropFilter:"blur(8px)"}}>
        <span style={{color:"rgba(0,208,255,0.65)"}}>BIMS v1.0</span>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"rgba(0,230,200,0.75)",textDecoration:"none",letterSpacing:"0.06em"}}>© 2026 KUMI</a>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <span style={{color:"rgba(0,208,255,0.40)"}}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</span>
      </div>
</div>
  );
};

export default Index;
