import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Database, UserPlus, Wifi, Server, Shield, LogOut, Search, X, ExternalLink, Camera, Users, FileText, Headphones, Bell, CheckCircle, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import TechSupportModal from "@/components/TechSupportModal";
import DirectMessagePanel, { unreadCount, getDMs } from "@/components/DirectMessagePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
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
        fontFamily:"'Orbitron',monospace", fontSize:8, fontWeight:700, letterSpacing:"0.14em",
        padding:"5px 12px", borderRadius:6, cursor:"pointer",
        border:`1px solid ${isEdit?"hsla(192,100%,52%,0.4)":"hsla(142,80%,50%,0.55)"}`,
        background:isEdit?"hsla(192,100%,52%,0.08)":"hsla(142,80%,45%,0.1)",
        color:isEdit?"hsl(192,100%,72%)":"hsl(142,80%,68%)",
        transition:"all .15s"
      } as React.CSSProperties}
      onMouseEnter={e=>{e.currentTarget.style.background=isEdit?"hsla(192,100%,52%,0.2)":"hsla(142,80%,45%,0.22)"; e.currentTarget.style.boxShadow=isEdit?"0 0 12px hsla(192,100%,52%,0.3)":"0 0 12px hsla(142,80%,50%,0.3)";}}
      onMouseLeave={e=>{e.currentTarget.style.background=isEdit?"hsla(192,100%,52%,0.08)":"hsla(142,80%,45%,0.1)"; e.currentTarget.style.boxShadow="none";}}>
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
          background:"hsla(215,55%,4%,0.92)",
          border:"1px solid hsla(192,100%,52%,0.35)",
          borderRadius:7, outline:"none", resize:"none",
          color:"hsl(192,55%,94%)",
          fontFamily:"'Rajdhani','Segoe UI',sans-serif",
          fontSize:13, fontWeight:500, lineHeight:1.55,
          padding:"10px 12px", marginBottom:8,
          transition:"border-color .15s, box-shadow .15s"
        }}
        onFocus={e=>{e.currentTarget.style.borderColor="hsla(192,100%,58%,0.7)"; e.currentTarget.style.boxShadow="0 0 0 3px hsla(192,100%,52%,0.12)";}}
        onBlur={e=>{e.currentTarget.style.borderColor="hsla(192,100%,52%,0.35)"; e.currentTarget.style.boxShadow="none";}}
      />

      {/* hint */}
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:7,letterSpacing:"0.14em",
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
            fontFamily:"'Orbitron',monospace", fontSize:9, fontWeight:800, letterSpacing:"0.18em",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            border: done
              ? "1px solid hsla(142,90%,55%,0.55)"
              : "1.5px solid hsla(192,100%,58%,0.65)",
            background: done
              ? "hsla(142,80%,6%,0.8)"
              : sending
                ? "hsla(192,100%,52%,0.06)"
                : "hsla(192,100%,52%,0.14)",
            color: done ? "hsl(142,90%,70%)" : "hsl(192,100%,76%)",
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
            <><div style={{width:10,height:10,borderRadius:"50%",border:"2px solid hsla(192,100%,55%,0.3)",borderTopColor:"hsl(192,100%,72%)",animation:"spin 0.8s linear infinite"}}/> SENDING...</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> SEND RESPONSE</>
          )}
        </button>

        {/* CANCEL button */}
        {!done && (
          <button onClick={()=>setOpen(false)}
            style={{
              padding:"8px 14px", borderRadius:7, cursor:"pointer",
              fontFamily:"'Orbitron',monospace", fontSize:8, fontWeight:700, letterSpacing:"0.12em",
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
  const [statusText, setStatusText] = useState("SYSTEM READY — AWAITING BIOMETRIC INPUT");
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
  const saveTickets = (tickets: any[]) => localStorage.setItem("bims_tickets", JSON.stringify(tickets));

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
    setStatusText("PROCESSING BIOMETRIC DATA...");
    setTimeout(() => {
      const records = getRecords();
      const shouldMatch = Math.random() > 0.5 && records.length > 0;
      if (shouldMatch) {
        const record = records[Math.floor(Math.random() * records.length)];
        setScanState("match");
        setStatusText(`IDENTITY VERIFIED — ${record.surname}, ${record.name}`);
        setTimeout(() => navigate(`/result/${record.id}`), 1500);
      } else {
        generateFingerprintHash();
        setScanState("no-match");
        setStatusText("NO RECORD FOUND");
        setTimeout(() => { setScanState("idle"); setStatusText("SYSTEM READY — AWAITING BIOMETRIC INPUT"); }, 5000);
      }
    }, 2500);
  };

  const isMatch    = scanState === "match";
  const isNoMatch  = scanState === "no-match";
  const isScanning = scanState === "scanning";
  const isIdle     = scanState === "idle";

  const RC: Record<string,string> = {
    owner:"hsl(270,80%,72%)", admin:"hsl(354,88%,68%)",
    operator:"hsl(195,100%,62%)", analyst:"hsl(158,80%,55%)",
  };
  const RU = currentUser?.role || "analyst";

  // Security-themed command definitions
  const CMDS = [
    { label:"Register",    sub:"Enroll Biometric Subject", Icon:UserPlus,  path:"/register", hue:200, color:"hsl(200,100%,68%)", shape:"hexagon" },
    { label:"Database",    sub:"Access Records Vault",     Icon:Database,  path:"/database", hue:195, color:"hsl(195,100%,62%)", shape:"shield"  },
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
  const scanGlow  = isMatch?"rgba(50,200,130,0.6)":isNoMatch?"rgba(220,60,60,0.6)":isScanning?"rgba(255,160,30,0.6)":"rgba(0,180,255,0.6)";

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "hsl(220,55%,6%)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit',-apple-system,sans-serif",
    }}>
      <CyberBackground/>

      {/* NAV */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:40,height:52,
        display:"flex",alignItems:"center",padding:"0 20px",gap:10,
        background:"rgba(4,10,28,0.88)",
        borderBottom:"1px solid rgba(40,120,255,0.18)",
        backdropFilter:"blur(40px)"}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:14,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:10,
            background:"linear-gradient(135deg,hsl(200,100%,50%),hsl(220,100%,62%))",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 16px rgba(0,160,255,0.4)"}}>
            <Shield style={{width:16,height:16,color:"white"}}/>
          </div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,
              letterSpacing:"0.04em",color:"rgba(220,240,255,0.96)"}}>
              Nexus<span style={{color:"hsl(200,100%,68%)",marginLeft:4}}>BIMS</span>
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,
              color:"rgba(80,150,220,0.45)",letterSpacing:"0.06em"}}>BIOMETRIC PLATFORM</div>
          </div>
        </div>

        {/* Status pills */}
        <div className="nav-status-pills" style={{display:"flex",gap:5,flex:1,alignItems:"center"}}>
          {([{l:"Online",H:158},{l:"Secured",H:200},{l:"AES-256",H:36}] as const).map(({l,H},i)=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",
              borderRadius:99,background:`hsla(${H},80%,50%,0.08)`,
              border:`1px solid hsla(${H},80%,50%,0.22)`}}>
              <div className="status-dot" style={{background:`hsl(${H},90%,58%)`,
                boxShadow:`0 0 5px hsl(${H},90%,55%)`,animationDelay:`${i*0.8}s`}}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
                color:`hsla(${H},60%,70%,0.7)`}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Right controls */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={()=>setShowSupport(true)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:99,
              cursor:"pointer",background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.1)",
              fontFamily:"'Outfit',sans-serif",fontSize:11.5,fontWeight:500,
              color:"rgba(140,195,255,0.75)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(40,120,255,0.14)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <Headphones style={{width:12,height:12}}/><span className="nav-support-text">Support</span>
          </button>
          <button onClick={()=>setShowNotif(v=>!v)}
            style={{position:"relative",width:32,height:32,borderRadius:99,cursor:"pointer",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"rgba(140,185,255,0.65)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(40,120,255,0.14)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <Bell style={{width:13,height:13}}/>
            {notifCount>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,
              borderRadius:"50%",background:"hsl(218,100%,68%)",border:"1.5px solid hsl(220,55%,6%)"}}/>}
          </button>
          <button onClick={()=>setShowDM(v=>!v)}
            style={{position:"relative",width:32,height:32,borderRadius:99,cursor:"pointer",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"rgba(140,185,255,0.65)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(40,120,255,0.14)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <MessageSquare style={{width:13,height:13}}/>
            {dmUnread>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,
              borderRadius:"50%",background:"hsl(270,80%,70%)",border:"1.5px solid hsl(220,55%,6%)"}}/>}
          </button>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)",margin:"0 2px"}}/>
          <button onClick={()=>setShowUserMenu(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"4px 10px 4px 4px",
              borderRadius:99,cursor:"pointer",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(40,120,255,0.1)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            <div style={{width:24,height:24,borderRadius:"50%",
              background:`${RC[RU]}22`,border:`2px solid ${RC[RU]}55`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,color:RC[RU]}}>
              {(currentUser?.username||"?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:600,
                color:"rgba(210,235,255,0.92)",lineHeight:1.2}}>
                {currentUser?.username||"user"}
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,
                color:RC[RU],letterSpacing:"0.05em",lineHeight:1}}>
                {(currentUser?.role||"analyst").toUpperCase()}
              </div>
            </div>
          </button>
          <button onClick={()=>{doLogout();window.location.href="/login";}}
            style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:99,
              cursor:"pointer",background:"transparent",
              border:"1px solid rgba(200,60,60,0.25)",
              fontFamily:"'Outfit',sans-serif",fontSize:11.5,fontWeight:500,
              color:"rgba(220,80,80,0.6)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,110,110,0.95)";e.currentTarget.style.background="rgba(200,50,50,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="rgba(220,80,80,0.6)";e.currentTarget.style.background="transparent";}}>
            <LogOut style={{width:11,height:11}}/> Logout
          </button>
        </div>

        {/* User dropdown */}
        <AnimatePresence>
          {showUserMenu&&(
            <motion.div
              initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:-8,scale:0.95}} transition={{duration:0.16}}
              style={{position:"absolute",top:58,right:16,minWidth:175,zIndex:60,
                padding:"8px 0",borderRadius:14,
                background:"rgba(4,12,32,0.97)",
                border:"1px solid rgba(40,120,255,0.25)",
                boxShadow:"0 20px 60px rgba(0,0,0,0.9)",
                backdropFilter:"blur(30px)"}}>
              <div style={{padding:"8px 14px 7px",
                borderBottom:"1px solid rgba(40,120,255,0.12)",marginBottom:4}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,
                  color:"rgba(210,235,255,0.95)"}}>
                  {currentUser?.fullName||currentUser?.username}
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,
                  color:"rgba(80,150,230,0.5)",marginTop:2}}>
                  @{currentUser?.username}
                </div>
              </div>
              {[{label:"My Profile",path:"/profile"},{label:"Settings",path:"/settings"}].map(({label,path})=>(
                <button key={label} onClick={()=>{setShowUserMenu(false);navigate(path);}}
                  style={{width:"100%",textAlign:"left" as const,padding:"7px 14px",
                    background:"none",border:"none",cursor:"pointer",
                    fontFamily:"'Outfit',sans-serif",fontSize:12.5,
                    color:"rgba(120,185,245,0.6)",transition:"all .14s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(40,120,255,0.1)";e.currentTarget.style.color="rgba(180,225,255,0.95)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(120,185,245,0.6)";}}>
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN CONTENT */}
      <div style={{position:"fixed",top:52,left:0,right:0,bottom:0,zIndex:2,
        display:"flex",flexDirection:"column" as const,
        alignItems:"center",justifyContent:"center",
        padding:"12px 20px",overflow:"hidden"}}>

        <div style={{width:"100%",maxWidth:660,
          display:"flex",flexDirection:"column" as const,
          alignItems:"center",gap:16}}>

          {/* Title */}
          <div style={{textAlign:"center" as const}}>
            <h1 style={{fontFamily:"'Syne',sans-serif",
              fontSize:"clamp(15px,2.2vw,24px)",fontWeight:800,
              letterSpacing:"0.1em",color:"rgba(220,245,255,0.98)",
              textTransform:"uppercase" as const,margin:"0 0 6px"}}>
              Biometric Identity Scanner
            </h1>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
              <motion.span
                animate={{opacity:[1,0.15,1]}}
                transition={{duration:isScanning?0.45:2.2,repeat:Infinity}}
                style={{display:"inline-block",width:6,height:6,borderRadius:"50%",
                  background:scanColor,boxShadow:`0 0 10px ${scanGlow}`,flexShrink:0}}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9.5,
                letterSpacing:"0.14em",color:`${scanColor}cc`,
                textTransform:"uppercase" as const}}>
                {isScanning?"SCANNING…":isMatch?"IDENTITY VERIFIED":isNoMatch?"NO MATCH FOUND":"SYSTEM READY"}
              </span>
            </div>
          </div>

          {/* Scanner disc */}
          <div style={{position:"relative",flexShrink:0}}>
            {/* Ambient pulse */}
            <motion.div
              animate={{scale:[0.88,1.1,0.88],opacity:[0.28,0.55,0.28]}}
              transition={{duration:3.5,repeat:Infinity,ease:"easeInOut"}}
              style={{position:"absolute",inset:-48,borderRadius:"50%",
                background:`radial-gradient(circle,${scanGlow} 0%,transparent 65%)`,
                pointerEvents:"none"}}
            />
            {/* Arc rings */}
            <svg style={{position:"absolute",inset:-28,overflow:"visible",pointerEvents:"none"}}
              viewBox="0 0 300 300" width="300" height="300">
              <motion.circle cx="150" cy="150" r="144" fill="none"
                stroke={scanColor} strokeWidth="1.8" strokeDasharray="45 520" strokeLinecap="round"
                style={{filter:`drop-shadow(0 0 8px ${scanGlow})`}}
                animate={{rotate:[0,360]}}
                transition={{duration:isScanning?1.2:4,repeat:Infinity,ease:"linear"}}/>
              <motion.circle cx="150" cy="150" r="144" fill="none"
                stroke={`${scanColor}35`} strokeWidth="0.8" strokeDasharray="9 30"
                animate={{rotate:[360,0]}}
                transition={{duration:7,repeat:Infinity,ease:"linear"}}/>
              {Array.from({length:36}).map((_,i)=>{
                const a=(i/36)*Math.PI*2-Math.PI/2, R=144, len=i%9===0?13:i%3===0?7:3;
                return <line key={i}
                  x1={150+(R-len)*Math.cos(a)} y1={150+(R-len)*Math.sin(a)}
                  x2={150+R*Math.cos(a)} y2={150+R*Math.sin(a)}
                  stroke={`${scanColor}${i%9===0?"bb":i%3===0?"55":"28"}`}
                  strokeWidth={i%9===0?1.5:0.6}/>;
              })}
            </svg>
            {/* Disc */}
            <div
              className={isScanning?"scanner-pulse":""}
              style={{width:242,height:242,borderRadius:"50%",
                background:isMatch
                  ?"radial-gradient(circle at 38% 38%,hsla(158,80%,10%,0.97),hsla(158,80%,3%,0.99))"
                  :isNoMatch
                    ?"radial-gradient(circle at 38% 38%,hsla(354,80%,10%,0.97),hsla(354,80%,3%,0.99))"
                    :"radial-gradient(circle at 38% 38%,rgba(8,22,62,0.97),rgba(2,8,28,0.99))",
                border:`2px solid ${scanColor}55`,
                boxShadow:`0 0 60px ${scanGlow}22,inset 0 0 60px rgba(0,0,0,0.5)`,
                display:"flex",flexDirection:"column" as const,
                alignItems:"center",justifyContent:"center",gap:10,
                position:"relative",overflow:"hidden",transition:"all 0.4s"}}>
              <div style={{position:"absolute",inset:22,borderRadius:"50%",
                border:`1px solid ${scanColor}25`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:44,borderRadius:"50%",
                border:`1px dashed ${scanColor}18`,pointerEvents:"none"}}/>
              {isScanning&&(
                <motion.div
                  animate={{y:["-55%","155%"]}}
                  transition={{duration:0.82,repeat:Infinity,ease:"linear"}}
                  style={{position:"absolute",left:0,right:0,height:3,
                    background:`linear-gradient(90deg,transparent,${scanColor}dd,transparent)`,
                    boxShadow:`0 0 16px ${scanGlow}`}}/>
              )}
              <motion.div
                animate={isScanning?{scale:[1,1.1,1],opacity:[0.8,1,0.8]}:{scale:1,opacity:1}}
                transition={{duration:0.82,repeat:isScanning?Infinity:0}}>
                <Fingerprint style={{width:74,height:74,color:scanColor,
                  filter:`drop-shadow(0 0 20px ${scanGlow})`}}/>
              </motion.div>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
                letterSpacing:"0.25em",color:`${scanColor}80`,
                textTransform:"uppercase" as const}}>
                {isScanning?"SCANNING…":isMatch?"VERIFIED":isNoMatch?"NO MATCH":"PLACE FINGER"}
              </span>
            </div>
          </div>

          {/* Scan button */}
          <motion.button
            onClick={handleScan} disabled={!isIdle}
            whileHover={isIdle?{scale:1.015,y:-2}:{}} whileTap={isIdle?{scale:0.98}:{}}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              padding:"13px 48px",borderRadius:14,
              fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,
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
              boxShadow:isIdle
                ?"0 6px 30px rgba(0,160,255,0.5),0 0 0 1px rgba(0,190,255,0.2),inset 0 1px 0 rgba(255,255,255,0.18)"
                :`0 0 28px ${scanGlow}25`,
              cursor:isIdle?"pointer":"default",
              opacity:isIdle?1:0.88,transition:"all 0.3s",
              width:"100%",maxWidth:360}}>
            {isScanning
              ?<><div style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${scanColor}55`,borderTopColor:scanColor,animation:"spin .7s linear infinite"}}/> SCANNING...</>
              :<><Fingerprint style={{width:19,height:19}}/> INITIATE SCAN</>}
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
                  position:"relative" as const,overflow:"hidden",
                  textAlign:"left" as const}}
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
                <div style={{position:"absolute",top:0,right:0,width:55,height:55,
                  background:`radial-gradient(circle at top right,hsla(${hue},90%,62%,0.14),transparent 65%)`,
                  pointerEvents:"none"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,position:"relative" as const}}>
                  <div style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",
                    background:`hsla(${hue},80%,55%,0.14)`,
                    border:`1px solid hsla(${hue},80%,62%,0.32)`,borderRadius:8,
                    boxShadow:`0 0 12px hsla(${hue},80%,55%,0.2)`}}>
                    <ShapeIcon shape={shape} hue={hue} size={16}/>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,
                    color:"rgba(220,245,255,0.95)",letterSpacing:"0.025em"}}>{label}</span>
                  {osint&&<span style={{fontSize:7.5,fontWeight:700,padding:"1px 5px",borderRadius:4,
                    background:"hsla(270,80%,55%,0.22)",border:"1px solid hsla(270,80%,65%,0.38)",
                    color:"hsl(270,80%,78%)",letterSpacing:"0.06em"}}>OSINT</span>}
                </div>
                <span style={{fontFamily:"'Outfit',sans-serif",fontSize:10.5,
                  color:"rgba(140,210,240,0.62)",lineHeight:1.35,
                  position:"relative" as const}}>{sub}</span>
              </motion.button>
            ))}
          </div>

        </div>
      </div>

      {/* Modals */}
      <TechSupportModal open={showSupport} onClose={()=>setShowSupport(false)} currentUser={currentUser}/>
      <DirectMessagePanel open={showDM} onClose={()=>setShowDM(false)} currentUser={currentUser}/>

      {/* ══ NOTIFICATION PANEL ══ */}
      <AnimatePresence>
        {showNotif&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:40,background:"rgba(1,3,14,0.72)",backdropFilter:"blur(5px)"}}
            onClick={()=>setShowNotif(false)}>
            <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:340,damping:35}}
              className="bio-card" style={{position:"absolute",top:59,right:0,bottom:15,width:340,borderRadius:0,overflow:"auto",padding:"14px 12px"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingBottom:9,borderBottom:"1px solid rgba(0,145,220,0.14)"}}>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"rgba(0,215,255,0.75)"}}>NOTIFICATIONS</span>
                <button onClick={()=>setShowNotif(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(0,160,220,0.42)"}}><X style={{width:13,height:13}}/></button>
              </div>
              {tickets.length===0&&<div style={{textAlign:"center" as const,padding:"28px 0",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"rgba(0,135,185,0.35)"}}>No notifications</div>}
              {tickets.map((t:any)=>(
                <div key={t.id} className="bio-card" style={{marginBottom:7,padding:"9px 11px",borderRadius:3}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:"rgba(0,215,255,0.75)"}}>{t.issue||t.issueCode}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7.5,color:"rgba(0,145,200,0.42)"}}>{t.id}</span>
                  </div>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:10.5,color:"rgba(140,200,240,0.65)",lineHeight:1.5,margin:0}}>{t.description}</p>
                  {t.adminResponse&&(
                    <div className="bio-card" style={{padding:"5px 8px",borderRadius:2,marginTop:5}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7.5,fontWeight:600,color:"rgba(255,140,0,0.55)",letterSpacing:"0.1em",marginBottom:2,textTransform:"uppercase" as const}}>Response</div>
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(140,200,240,0.65)",lineHeight:1.5,margin:0}}>{t.adminResponse}</p>
                    </div>
                  )}
                  {userIsAdmin&&(
                    <div style={{marginTop:7}}>
                      <AdminReplyBox ticket={t} onSave={(resp:string)=>{const all=JSON.parse(localStorage.getItem("bims_tickets")||"[]");const idx=all.findIndex((x:any)=>x.id===t.id);if(idx>=0){all[idx].adminResponse=resp;all[idx].read=true;localStorage.setItem("bims_tickets",JSON.stringify(all));};}} isEdit={!!t.adminResponse}/>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </div>
    </div>
    </div>
  );
};

export default Index;
