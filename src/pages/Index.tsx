import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Database, UserPlus, Shield, LogOut, Search, X, Users, FileText, Headphones, Bell, MessageSquare } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import TechSupportModal from "@/components/TechSupportModal";
import DirectMessagePanel, { unreadCount } from "@/components/DirectMessagePanel";
import { generateFingerprintHash, getRecords } from "@/lib/biometric-store";
import { doLogout, getCurrentUser, isAdmin } from "@/pages/Login";

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
        color:isEdit?"hsl(192,68%,72%)":"hsl(142,80%,68%)",
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
          background:"rgba(4,18,32,0.92)",
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
            color: done ? "hsl(142,90%,70%)" : "hsl(192,68%,76%)",
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
            <><div style={{width:10,height:10,borderRadius:"50%",border:"2px solid hsla(192,100%,55%,0.3)",borderTopColor:"hsl(192,68%,72%)",animation:"spin 0.8s linear infinite"}}/> SENDING...</>
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
  const [dsType, setDsType] = useState<"name"|"username"|"email"|"phone">("name");
  const [dsResults, setDsResults] = useState<any>(null);
  const [dsLoading, setDsLoading] = useState(false);
  const [dsImageData, setDsImageData] = useState<string|null>(null);
  const [dsImageResults, setDsImageResults] = useState<any>(null);
  const [dsImageLoading, setDsImageLoading] = useState(false);
  const [dsTab, setDsTab] = useState<"text"|"image">("text");
  const [dsImageStage, setDsImageStage] = useState("");
  const dsImageRef = useRef<HTMLInputElement>(null);

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
    operator:"hsl(192,68%,62%)", analyst:"hsl(158,80%,55%)",
  };
  const RU = currentUser?.role || "analyst";

  // Security-themed command definitions
  const CMDS = [
    { label:"Register",    sub:"Enroll Biometric Subject", Icon:UserPlus,  path:"/register", hue:200, color:"hsl(200,100%,68%)", shape:"hexagon" },
    { label:"Database",    sub:"Access Records Vault",     Icon:Database,  path:"/database", hue:195, color:"hsl(192,68%,62%)", shape:"shield"  },
    { label:"Deep Search", sub:"OSINT Intelligence Query", Icon:Search,    path:null,         hue:270, color:"hsl(270,80%,70%)",  shape:"target",  osint:true },
    ...(userIsAdmin ? [
      { label:"Users",   sub:"Access Control",          Icon:Users,    path:"/users",    hue:36,  color:"hsl(36,100%,62%)",  shape:"badge"   },
      { label:"Reports", sub:"Audit & Activity Log",    Icon:FileText, path:"/reports",  hue:158, color:"hsl(158,80%,54%)",  shape:"circuit" },
      { label:"Create",  sub:"Generate Documents",      Icon:FileText, path:"/create",   hue:216, color:"hsl(216,100%,68%)", shape:"chip"    },
    ] : [
      { label:"Create",  sub:"Generate Documents",      Icon:FileText, path:"/create",   hue:216, color:"hsl(216,100%,68%)", shape:"chip"    },
    ]),
  ] as { label:string; sub:string; Icon:any; path:string|null; hue:number; color:string; shape:string; osint?:boolean }[];

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
        background:"rgba(2,8,18,0.88)",
        borderBottom:"1px solid rgba(50,185,215,0.20)",
        backdropFilter:"blur(6px)",
      }}>
        {/* BIMS — hard left */}
        <div style={{position:"absolute",left:20,top:0,bottom:0,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"radial-gradient(circle,rgba(30,130,200,0.4),rgba(10,50,100,0.2))",border:"1.5px solid rgba(50,190,220,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Shield style={{width:14,height:14,color:"hsl(192,68%,72%)"}}/>
          </div>
          <div style={{lineHeight:1}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,letterSpacing:"0.12em",color:"rgba(210,242,248,0.98)",textShadow:"0 0 20px rgba(50,185,215,0.5)"}}>BIMS</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(50,185,215,0.42)",letterSpacing:"0.1em",textTransform:"uppercase" as const,marginTop:3}}>Biometric Identity Management System</div>
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
            {notifCount>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"hsl(218,95%,65%)",border:"2px solid rgba(2,8,18,1)"}}/>}
          </button>

          {/* DM */}
          <button onClick={()=>setShowDM(v=>!v)} style={{position:"relative",width:32,height:32,borderRadius:99,cursor:"pointer",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(140,205,230,0.72)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,175,210,0.16)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <MessageSquare style={{width:13,height:13}}/>
            {dmUnread>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"hsl(270,80%,68%)",border:"2px solid rgba(2,8,18,1)"}}/>}
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
              style={{position:"fixed",top:60,right:14,minWidth:178,zIndex:10000,padding:"8px 0",borderRadius:14,background:"rgba(3,10,22,0.97)",border:"1px solid rgba(50,185,215,0.22)",boxShadow:"0 20px 60px rgba(0,0,0,0.9)",backdropFilter:"blur(20px)"}}>
              <div style={{padding:"8px 14px 8px",borderBottom:"1px solid rgba(50,185,215,0.12)",marginBottom:4}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"rgba(210,242,248,0.95)"}}>{currentUser?.fullName||currentUser?.username}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(50,185,215,0.45)",marginTop:2}}>@{currentUser?.username}</div>
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
                <Fingerprint style={{width:24,height:24,color:"hsl(192,68%,60%)",filter:"drop-shadow(0 0 8px rgba(50,190,218,0.8))"}}/>
              </motion.div>
              <div style={{textAlign:"left" as const}}>
                <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(20px,2.8vw,32px)",fontWeight:900,letterSpacing:"0.14em",color:"rgba(200,245,255,0.98)",textTransform:"uppercase" as const,margin:0,lineHeight:1,textShadow:"0 0 35px rgba(50,190,218,0.5),0 0 70px rgba(0,150,220,0.2)"}}>
                  BIMS
                </h1>
                <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(6px,0.85vw,8.5px)",letterSpacing:"0.18em",color:"rgba(0,195,235,0.48)",margin:"4px 0 0",textTransform:"uppercase" as const}}>
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
                    :"radial-gradient(circle at 38% 32%,rgba(6,18,52,0.97),rgba(2,8,26,0.99))",
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
            {CMDS.map(({label,sub,Icon,path,hue,color,shape,osint},i)=>(
              <motion.button key={label}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                transition={{delay:0.4+i*0.05}}
                whileHover={{y:-4,scale:1.025}} whileTap={{scale:0.97}}
                onClick={()=>osint?setShowDeepSearch(true):path?navigate(path):null}
                style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-start",
                  padding:"14px 15px",
                  background:"linear-gradient(160deg,rgba(4,18,52,0.94),rgba(2,10,36,0.92))",
                  border:`1px solid hsla(${hue},90%,62%,0.18)`,
                  borderTop:`2px solid hsla(${hue},90%,65%,0.45)`,
                  borderRadius:14,cursor:"pointer",
                  transition:"border-color .22s,box-shadow .22s",
                  boxShadow:"0 4px 22px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)",
                  backdropFilter:"blur(22px)",
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
                </div>
                <span style={{fontFamily:"'Exo 2',sans-serif",fontSize:10.5,color:"rgba(140,210,240,0.62)",lineHeight:1.35,position:"relative" as const}}>{sub}</span>
              </motion.button>
            ))}
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
        {showDeepSearch && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(1,3,14,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
            onClick={()=>setShowDeepSearch(false)}>
            <motion.div
              initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
              transition={{type:"spring",stiffness:320,damping:28}}
              onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:560,maxHeight:"80vh",overflowY:"auto",borderRadius:18,background:"linear-gradient(160deg,rgba(6,16,44,0.98),rgba(3,10,30,0.99))",border:"1px solid rgba(100,80,255,0.3)",borderTop:"2px solid rgba(120,100,255,0.55)",boxShadow:"0 32px 80px rgba(0,0,0,0.9)",padding:"20px 22px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:800,color:"rgba(220,210,255,0.96)"}}>Deep Search</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(140,120,255,0.55)",marginTop:2,letterSpacing:"0.08em"}}>OSINT INTELLIGENCE QUERY</div>
                </div>
                <button onClick={()=>setShowDeepSearch(false)} style={{width:30,height:30,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(200,190,255,0.6)"}}>
                  <X style={{width:14,height:14}}/>
                </button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {(["name","username","email","phone"] as const).map(t=>(
                  <button key={t} onClick={()=>setDsType(t)}
                    style={{flex:1,padding:"6px 0",borderRadius:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" as const,border:`1px solid ${dsType===t?"rgba(120,100,255,0.6)":"rgba(255,255,255,0.1)"}`,background:dsType===t?"rgba(100,80,255,0.18)":"rgba(255,255,255,0.04)",color:dsType===t?"rgba(200,185,255,0.95)":"rgba(140,130,200,0.5)",transition:"all .16s"}}>
                    {t}
                  </button>
                ))}
              </div>
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

    </div>
  );
};

export default Index;
