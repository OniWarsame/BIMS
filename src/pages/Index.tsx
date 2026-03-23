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
        padding:"5px 12px", borderRadius:6, cursor:"pointer", border:"none",
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

  const SC  = isMatch?"#00e87a":isNoMatch?"#ff3b3b":isScanning?"#ff9000":"#00d4ff";
  const SH  = isMatch?145:isNoMatch?0:isScanning?32:200;
  const RC:Record<string,string> = {owner:"hsl(270,80%,70%)",admin:"hsl(0,80%,64%)",operator:"hsl(32,95%,60%)",analyst:"hsl(200,100%,62%)"};
  const RU  = currentUser?.role||"analyst";

  const CMDS = [
    {label:"Register",    sub:"Enroll Biometric Subject",   Icon:UserPlus,  path:"/register", hue:200},
    {label:"Database",    sub:"Access Records Vault",       Icon:Database,  path:"/database", hue:180},
    {label:"Deep Search", sub:"OSINT Intelligence Query",   Icon:Search,    path:null,        hue:270, osint:true},
    ...(userIsAdmin?[
      {label:"Users",     sub:"Access Control",             Icon:Users,     path:"/users",    hue:32 },
      {label:"Reports",   sub:"Audit & Activity Log",       Icon:FileText,  path:"/reports",  hue:145},
      {label:"Create",    sub:"Generate Documents",         Icon:null,      path:"/create",   hue:200},
    ]:[{label:"Create",   sub:"Generate Documents",         Icon:null,      path:"/create",   hue:200}]),
  ] as {label:string;sub:string;Icon:any;path:string|null;hue:number;osint?:boolean}[];

  return (
    <div style={{minHeight:"100vh",overflow:"hidden",background:"rgb(3,8,22)",position:"relative"}}>
      <CyberBackground/>
      {/* ══ SLIM NAVBAR ══ */}
      <div style={{position:"fixed",top:15,left:0,right:0,zIndex:40,height:44,
        display:"flex",alignItems:"center",padding:"0 14px",gap:8,
        background:"rgba(1,4,16,0.82)",borderBottom:"1px solid rgba(0,180,255,0.12)",
        backdropFilter:"blur(24px)"}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:12,flexShrink:0}}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,1 26,7 26,21 14,27 2,21 2,7" stroke="rgba(0,180,255,0.55)" strokeWidth="1" fill="none"/>
            <polygon points="14,5 23,10 23,18 14,23 5,18 5,10" stroke="rgba(0,150,220,0.25)" strokeWidth="0.5" fill="rgba(0,80,160,0.08)"/>
            <text x="14" y="18" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="900" fill="rgba(0,220,255,0.9)">B</text>
          </svg>
          <div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:800,letterSpacing:"0.25em",color:"rgba(205,235,255,0.92)"}}>BIMS</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:6.5,fontWeight:500,letterSpacing:"0.08em",color:"rgba(0,160,220,0.38)",textTransform:"uppercase" as const}}>Biometric Identity</div>
          </div>
        </div>

        {/* Status pills */}
        <div className="nav-status-pills" style={{display:"flex",gap:4,flex:1,alignItems:"center"}}>
          {([{l:"Online",H:145},{l:"Vault Secured",H:200},{l:"AES-256",H:32}] as const).map(({l,H},i)=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:2,
              background:`hsla(${H},80%,50%,0.06)`,border:`1px solid hsla(${H},80%,50%,0.18)`}}>
              <div className="status-dot" style={{background:`hsl(${H},90%,58%)`,boxShadow:`0 0 5px hsl(${H},90%,55%)`,animationDelay:`${i*0.7}s`}}/>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:8,fontWeight:500,letterSpacing:"0.06em",color:`hsla(${H},65%,68%,0.65)`}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Right controls */}
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <button className="btn-ghost" onClick={()=>setShowSupport(true)}>
            <Headphones style={{width:11,height:11}}/><span className="nav-support-text">Support</span>
          </button>
          {/* Bell */}
          <button onClick={()=>setShowNotif(v=>!v)} style={{position:"relative",width:28,height:28,borderRadius:2,background:"transparent",border:"1px solid rgba(0,150,220,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(0,175,230,0.45)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,150,220,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <Bell style={{width:12,height:12}}/>
            {notifCount>0&&<div style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:"#00d4ff",border:"1px solid rgb(3,8,22)"}}/>}
          </button>
          {/* DM */}
          <button onClick={()=>setShowDM(v=>!v)} style={{position:"relative",width:28,height:28,borderRadius:2,background:"transparent",border:"1px solid rgba(0,150,220,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(0,175,230,0.45)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,150,220,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <MessageSquare style={{width:12,height:12}}/>
            {dmUnread>0&&<div style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:"hsl(270,80%,65%)",border:"1px solid rgb(3,8,22)"}}/>}
          </button>
          <div style={{width:1,height:18,background:"rgba(0,150,220,0.2)",margin:"0 2px"}}/>
          {/* User */}
          <button onClick={()=>setShowUserMenu(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 7px 2px 3px",borderRadius:2,cursor:"pointer",background:"transparent",border:"1px solid rgba(0,150,220,0.15)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,150,220,0.09)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:22,height:22,borderRadius:3,background:`${RC[RU]}18`,border:`1px solid ${RC[RU]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:RC[RU]}}>
              {(currentUser?.username||"?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:9.5,fontWeight:600,color:"rgba(200,230,255,0.88)"}}>{currentUser?.username||"user"}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:7,fontWeight:500,color:RC[RU],letterSpacing:"0.05em"}}>{(currentUser?.role||"analyst").toUpperCase()}</div>
            </div>
          </button>
          {/* Logout */}
          <button onClick={()=>{doLogout();window.location.href="/login";}} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:2,cursor:"pointer",background:"transparent",border:"1px solid rgba(180,40,40,0.22)",fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:500,color:"rgba(200,70,70,0.52)"}} onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,100,100,0.88)";e.currentTarget.style.background="rgba(180,40,40,0.1)";}} onMouseLeave={e=>{e.currentTarget.style.color="rgba(200,70,70,0.52)";e.currentTarget.style.background="transparent";}}>
            <LogOut style={{width:11,height:11}}/> Logout
          </button>
        </div>

        {/* User dropdown */}
        <AnimatePresence>
          {showUserMenu&&(
            <motion.div initial={{opacity:0,y:-7}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-7}}
              className="bio-card bio-corners"
              style={{position:"absolute",top:48,right:12,minWidth:175,zIndex:60,padding:"7px 0",borderRadius:3,boxShadow:"0 20px 60px rgba(0,0,0,0.95)"}}>
              <div style={{padding:"7px 12px 6px",borderBottom:"1px solid rgba(0,140,210,0.14)",marginBottom:3}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,color:"rgba(200,230,255,0.88)"}}>{currentUser?.fullName||currentUser?.username}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"rgba(0,160,220,0.42)",marginTop:1}}>@{currentUser?.username}</div>
              </div>
              {[{label:"My Profile",path:"/profile"},{label:"Settings",path:"/settings"}].map(({label,path})=>(
                <button key={label} onClick={()=>{setShowUserMenu(false);navigate(path);}} style={{width:"100%",textAlign:"left" as const,padding:"6px 12px",background:"none",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:10.5,color:"rgba(100,185,230,0.52)"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,150,220,0.1)";e.currentTarget.style.color="rgba(160,225,255,0.88)";}} onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(100,185,230,0.52)";}}>
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT — glass overlay sitting ON TOP of the image
          Centered vertical stack: title → scanner → buttons → commands
      ══════════════════════════════════════════════════════════════ */}
      <div style={{position:"fixed",top:59,left:0,right:0,bottom:15,zIndex:2,
        display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",
        overflow:"hidden",padding:"0 16px 4px"}}>

        {/* Glass panel — semi-transparent container over the image */}
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.1,duration:0.5}}
          style={{
            display:"flex",flexDirection:"column" as const,alignItems:"center",
            padding:"18px 24px 16px",
            background:"rgba(1,5,18,0.58)",
            backdropFilter:"blur(14px)",
            border:"1px solid rgba(0,180,255,0.22)",
            borderTop:"2px solid rgba(0,200,255,0.5)",
            borderRadius:4,
            boxShadow:"0 0 80px rgba(0,0,0,0.7),0 0 40px rgba(0,120,200,0.1),inset 0 0 40px rgba(0,60,120,0.06)",
            width:"100%",maxWidth:640,
          }}>

          {/* Title row */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,alignSelf:"stretch"}}>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(0,180,255,0.35))"}}/>
            <div style={{textAlign:"center" as const}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"0.3em",
                color:"rgba(255,140,0,0.65)",textTransform:"uppercase" as const,marginBottom:3}}>
                Biometric Identity Scanner
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                <motion.div animate={{opacity:[1,0.15,1]}} transition={{duration:isScanning?0.4:2,repeat:Infinity}}
                  style={{width:5,height:5,borderRadius:"50%",background:SC,boxShadow:`0 0 8px ${SC}`}}/>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:500,letterSpacing:"0.12em",
                  color:`${SC}cc`,textTransform:"uppercase" as const}}>
                  {isScanning?"SCANNING BIOMETRIC DATA…":isMatch?"IDENTITY VERIFIED":isNoMatch?"NO MATCH FOUND":"SYSTEM READY"}
                </span>
              </div>
            </div>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,180,255,0.35),transparent)"}}/>
          </div>

          {/* ── SCANNER ── */}
          <motion.div initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}}
            transition={{delay:0.2,duration:0.6,ease:[0.34,1.4,0.64,1]}}
            style={{position:"relative",marginBottom:14}}>

            {/* Outer ambient */}
            <motion.div style={{position:"absolute",inset:-36,borderRadius:"50%",pointerEvents:"none",
              background:`radial-gradient(circle,${SC}25 0%,transparent 70%)`}}
              animate={{scale:[0.92,1.08,0.92]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}/>

            {/* Rotating arcs */}
            <svg style={{position:"absolute",inset:-20,pointerEvents:"none",overflow:"visible"}} viewBox="0 0 280 280" width="280" height="280">
              <motion.circle cx="140" cy="140" r="134" fill="none"
                stroke={SC} strokeWidth="1.5" strokeDasharray="38 520" strokeLinecap="round"
                animate={{rotate:[0,360]}} transition={{duration:isScanning?1.3:3.8,repeat:Infinity,ease:"linear"}}
                style={{filter:`drop-shadow(0 0 6px ${SC})`}}/>
              <motion.circle cx="140" cy="140" r="134" fill="none"
                stroke={`${SC}44`} strokeWidth="0.8" strokeDasharray="9 32"
                animate={{rotate:[360,0]}} transition={{duration:6.5,repeat:Infinity,ease:"linear"}}/>
              {/* Tick marks */}
              {Array.from({length:40}).map((_,i)=>{
                const a=(i/40)*Math.PI*2-Math.PI/2;
                const R=134, len=i%10===0?11:i%5===0?6:3;
                return <line key={i}
                  x1={140+(R-len)*Math.cos(a)} y1={140+(R-len)*Math.sin(a)}
                  x2={140+R*Math.cos(a)} y2={140+R*Math.sin(a)}
                  stroke={`${SC}${i%10===0?"bb":i%5===0?"66":"33"}`}
                  strokeWidth={i%10===0?1.5:0.7}/>;
              })}
            </svg>

            {/* MAIN DISC */}
            <div style={{
              width:240,height:240,borderRadius:"50%",
              position:"relative" as const,overflow:"hidden",
              background:`radial-gradient(circle at 38% 34%,rgba(${isMatch?"0,110,60":isNoMatch?"90,15,15":isScanning?"90,55,0":"0,55,110"},0.35) 0%,rgba(1,5,20,0.92) 62%)`,
              border:`2px solid ${SC}${isScanning?"bb":isMatch?"cc":isNoMatch?"aa":"44"}`,
              boxShadow:`0 0 ${isScanning?100:55}px ${SC}${isScanning?"55":"22"},inset 0 0 ${isScanning?60:28}px ${SC}${isScanning?"10":"06"},0 0 0 1px ${SC}11`,
              transition:"all 0.55s ease",
            }}>
              {/* Dot grid */}
              <div style={{position:"absolute",inset:0,borderRadius:"50%",
                backgroundImage:`radial-gradient(circle,${SC}${isScanning?"22":"0d"} 1px,transparent 1px)`,
                backgroundSize:"14px 14px",pointerEvents:"none"}}/>
              {/* Crosshairs */}
              <div style={{position:"absolute",top:"50%",left:14,right:14,height:"0.5px",transform:"translateY(-50%)",
                background:`linear-gradient(90deg,transparent,${SC}${isScanning?"33":"0f"},transparent)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",left:"50%",top:14,bottom:14,width:"0.5px",transform:"translateX(-50%)",
                background:`linear-gradient(180deg,transparent,${SC}${isScanning?"33":"0f"},transparent)`,pointerEvents:"none"}}/>

              {/* Scan beam */}
              {isScanning&&(
                <motion.div style={{position:"absolute",left:0,right:0,height:2.5,
                  background:`linear-gradient(90deg,transparent,${SC}ee,rgba(255,255,255,0.92),${SC}ee,transparent)`,
                  boxShadow:`0 0 18px ${SC},0 0 38px ${SC}88`,borderRadius:2}}
                  initial={{top:"6%"}} animate={{top:["6%","92%","6%"]}}
                  transition={{duration:1.15,repeat:Infinity,ease:"easeInOut"}}/>
              )}

              {/* Fingerprint + state */}
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column" as const,
                alignItems:"center",justifyContent:"center",gap:10}}>
                <motion.div animate={isScanning?{scale:[1,1.1,1]}:{scale:1}} transition={{duration:0.68,repeat:Infinity}}>
                  <Fingerprint style={{width:74,height:74,color:SC,
                    filter:`drop-shadow(0 0 ${isScanning?28:15}px ${SC}) drop-shadow(0 0 ${isScanning?56:30}px ${SC}77)`,
                    transition:"all 0.5s ease"}}/>
                </motion.div>
                <AnimatePresence mode="wait">
                  {isIdle&&<motion.div key="i" initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{textAlign:"center" as const}}>
                    <motion.p animate={{opacity:[1,0.2,1]}} transition={{duration:2.5,repeat:Infinity}}
                      style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:500,letterSpacing:"0.14em",color:"rgba(0,195,250,0.55)",textTransform:"uppercase" as const,margin:0}}>Place Finger</motion.p>
                  </motion.div>}
                  {isScanning&&<motion.div key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <motion.p animate={{opacity:[1,0.08,1]}} transition={{duration:0.38,repeat:Infinity}}
                      style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"rgba(255,165,0,0.92)",textTransform:"uppercase" as const,margin:0}}>Scanning…</motion.p>
                  </motion.div>}
                  {isMatch&&<motion.div key="m" initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
                    <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"#00e87a",textTransform:"uppercase" as const,margin:0}}>✓ Verified</p>
                  </motion.div>}
                  {isNoMatch&&<motion.div key="n" initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
                    <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"#ff3b3b",textTransform:"uppercase" as const,margin:0}}>✕ No Match</p>
                  </motion.div>}
                </AnimatePresence>
              </div>

              {/* Bottom strip */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:18,
                background:"rgba(0,2,12,0.8)",borderTop:`1px solid ${SC}22`,
                display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px"}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:6.5,fontWeight:600,letterSpacing:"0.12em",color:`${SC}66`}}>SYS·BIO·01</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:6.5,fontWeight:600,letterSpacing:"0.1em",color:`${SC}66`}}>
                  {isScanning?"ACTIVE":isMatch?"VERIFIED":isNoMatch?"REJECTED":"STANDBY"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── SCAN BUTTON ── */}
          <motion.button onClick={handleScan} disabled={!isIdle}
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            whileHover={isIdle?{scale:1.04,y:-2}:{}} whileTap={isIdle?{scale:0.97}:{}}
            style={{
              marginBottom:14,width:200,height:38,borderRadius:2,
              cursor:isIdle?"pointer":"not-allowed",
              position:"relative" as const,overflow:"hidden",
              background:isIdle?"rgba(0,100,165,0.22)":"rgba(1,5,18,0.5)",
              border:isIdle?"1px solid rgba(0,200,255,0.48)":"1px solid rgba(0,80,130,0.18)",
              boxShadow:isIdle?"0 0 22px rgba(0,190,255,0.18),inset 0 0 20px rgba(0,130,200,0.06)":"none",
              display:"flex",alignItems:"center",justifyContent:"center",gap:9,
              fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.1em",
              textTransform:"uppercase" as const,
              color:isIdle?"rgba(0,215,255,0.92)":"rgba(0,100,150,0.38)",
              transition:"all 0.3s ease"}}>
            {isIdle&&<motion.div style={{position:"absolute" as const,inset:0,background:"linear-gradient(105deg,transparent 20%,rgba(0,200,255,0.06) 50%,transparent 80%)"}} animate={{x:["-100%","110%"]}} transition={{duration:2.8,repeat:Infinity,repeatDelay:0.8}}/>}
            <Fingerprint style={{width:14,height:14,flexShrink:0,position:"relative" as const}}/>
            <span style={{position:"relative" as const}}>{isIdle?"Initiate Scan":isScanning?"Processing…":"Complete"}</span>
          </motion.button>

          {/* ── COMMAND GRID — 3 columns ── */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.36}}
            style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,width:"100%"}}>
            {CMDS.map(({label,sub,Icon,path,hue,osint},idx)=>(
              <motion.button key={label}
                onClick={()=>path?navigate(path):setShowDeepSearch(true)}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4+idx*0.04}}
                whileHover={{y:-2,scale:1.03}} whileTap={{scale:0.97}}
                style={{cursor:"pointer",outline:"none",border:"none",background:"transparent",padding:0}}>
                <div style={{
                  padding:"9px 10px 8px",borderRadius:2,textAlign:"left" as const,
                  background:"rgba(1,5,18,0.75)",backdropFilter:"blur(10px)",
                  border:`1px solid hsla(${hue},80%,55%,0.14)`,
                  borderTop:`2px solid hsla(${hue},80%,55%,${idx===0||idx===3?0.55:0.28})`,
                  boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
                  position:"relative" as const,overflow:"hidden",
                  transition:"all 0.14s ease",
                }}
                onMouseEnter={e=>{
                  const el=e.currentTarget as HTMLElement;
                  el.style.background="rgba(2,8,26,0.92)";
                  el.style.borderTopColor=`hsla(${hue},85%,58%,0.75)`;
                  el.style.boxShadow=`0 8px 28px rgba(0,0,0,0.65),0 0 16px hsla(${hue},80%,55%,0.12)`;
                }}
                onMouseLeave={e=>{
                  const el=e.currentTarget as HTMLElement;
                  el.style.background="rgba(1,5,18,0.75)";
                  el.style.borderTopColor=`hsla(${hue},80%,55%,${idx===0||idx===3?0.55:0.28})`;
                  el.style.boxShadow="0 4px 20px rgba(0,0,0,0.5)";
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <div style={{width:24,height:24,borderRadius:3,flexShrink:0,
                      background:`hsla(${hue},75%,52%,0.12)`,border:`1px solid hsla(${hue},75%,55%,0.22)`,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {Icon?<Icon style={{width:11,height:11,color:`hsl(${hue},80%,65%)`}}/>:<span style={{fontSize:11,color:`hsl(${hue},80%,65%)`}}>✦</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap" as const}}>
                        <span style={{fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:700,color:"rgba(200,230,255,0.92)"}}>{label}</span>
                        {osint&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:6,fontWeight:700,padding:"1px 3px",borderRadius:2,color:`hsl(${hue},80%,65%)`,background:`hsla(${hue},80%,52%,0.15)`,border:`1px solid hsla(${hue},80%,52%,0.3)`}}>OSINT</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:8,color:`hsla(${hue},35%,60%,0.42)`,lineHeight:1.3}}>{sub}</div>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,
                    background:`linear-gradient(90deg,transparent,hsla(${hue},75%,55%,0.28),transparent)`}}/>
                </div>
              </motion.button>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* ══ DEEP SEARCH MODAL ══ */}
      <AnimatePresence>
        {showDeepSearch&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-start justify-center"
            style={{paddingTop:74,paddingLeft:16,paddingRight:16,background:"rgba(1,3,14,0.88)",backdropFilter:"blur(12px)"}}
            onClick={()=>{setShowDeepSearch(false);setDsInput("");setDsResults(null);setDsImageData(null);setDsTab("text");}}>
            <motion.div initial={{scale:0.94,y:14}} animate={{scale:1,y:0}} exit={{scale:0.94,y:14}}
              className="w-full max-w-3xl bio-card bio-corners"
              style={{borderRadius:3,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,0.95)"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:"1px solid rgba(0,145,210,0.14)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:3,background:"rgba(70,0,160,0.14)",border:"1px solid rgba(110,0,240,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Search style={{width:14,height:14,color:"rgba(160,100,255,0.88)"}}/>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,color:"rgba(200,230,255,0.92)"}}>Deep Search</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7.5,color:"rgba(100,165,215,0.45)",letterSpacing:"0.12em",textTransform:"uppercase" as const}}>OSINT · Social Media · Network Intelligence</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {(["text","image"] as const).map(tab=>(
                    <button key={tab} onClick={()=>setDsTab(tab)} style={{padding:"3px 11px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:500,background:dsTab===tab?"rgba(0,135,205,0.14)":"transparent",border:dsTab===tab?"1px solid rgba(0,185,235,0.38)":"1px solid rgba(0,105,155,0.2)",color:dsTab===tab?"rgba(0,215,255,0.88)":"rgba(80,160,210,0.42)"}}>{tab==="text"?"Text":"Face"}</button>
                  ))}
                  <button onClick={()=>{setShowDeepSearch(false);setDsInput("");setDsResults(null);setDsImageData(null);setDsTab("text");}} style={{width:26,height:26,borderRadius:2,cursor:"pointer",background:"transparent",border:"1px solid rgba(0,105,155,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(80,160,210,0.42)"}}>
                    <X style={{width:11,height:11}}/>
                  </button>
                </div>
              </div>
              {dsTab==="text"&&(
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(0,115,165,0.12)"}}>
                  <div style={{display:"flex",gap:4,marginBottom:9}}>
                    {([{key:"name",label:"Full Name"},{key:"username",label:"Username"},{key:"email",label:"Email"},{key:"phone",label:"Phone"}] as const).map(t=>(
                      <button key={t.key} onClick={()=>{setDsType(t.key);setDsInput("");setDsResults(null);}} style={{flex:1,padding:"4px",borderRadius:2,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:8.5,background:dsType===t.key?"rgba(0,135,205,0.12)":"transparent",border:dsType===t.key?"1px solid rgba(0,185,235,0.32)":"1px solid rgba(0,105,155,0.16)",color:dsType===t.key?"rgba(0,215,255,0.82)":"rgba(80,160,210,0.38)"}}>{t.label}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{position:"relative",flex:1}}>
                      <Search style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:12,height:12,color:"rgba(0,160,220,0.32)",pointerEvents:"none"}}/>
                      <input value={dsInput} onChange={e=>{setDsInput(e.target.value);setDsResults(null);}} onKeyDown={e=>e.key==="Enter"&&dsInput.trim()&&handleDeepSearch()}
                        placeholder={dsType==="name"?"e.g. John Smith":dsType==="username"?"e.g. john_smith":dsType==="email"?"e.g. john@email.com":"e.g. +254700000000"}
                        autoFocus className="input-cyber" style={{paddingLeft:30}}/>
                    </div>
                    <button id="ds-search-btn" onClick={handleDeepSearch} disabled={!dsInput.trim()||dsLoading}
                      className={dsInput.trim()&&!dsLoading?"btn-bio":""}
                      style={{padding:"0 14px",cursor:dsInput.trim()&&!dsLoading?"pointer":"not-allowed",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,whiteSpace:"nowrap" as const,
                        background:dsInput.trim()&&!dsLoading?undefined:"transparent",
                        border:dsInput.trim()&&!dsLoading?undefined:"1px solid rgba(0,90,140,0.16)",
                        color:dsInput.trim()&&!dsLoading?undefined:"rgba(0,110,155,0.32)"}}>
                      {dsLoading?"Searching…":"Search"}
                    </button>
                  </div>
                </div>
              )}
              {dsTab==="image"&&(
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(0,115,165,0.12)"}}>
                  <input ref={dsImageRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onloadend=()=>{setDsImageData(reader.result as string);setDsImageResults(null);};reader.readAsDataURL(file);e.target.value="";}}/>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div onClick={()=>dsImageRef.current?.click()} style={{width:76,height:76,flexShrink:0,cursor:"pointer",borderRadius:3,overflow:"hidden",border:dsImageData?"1px solid rgba(0,225,140,0.4)":"1px dashed rgba(0,160,220,0.3)",background:"rgba(1,4,16,0.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {dsImageData?<img src={dsImageData} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> :<div style={{textAlign:"center" as const}}><Camera style={{width:20,height:20,color:"rgba(0,160,220,0.32)",margin:"0 auto 3px"}}/><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"rgba(0,160,220,0.32)"}}>Upload</div></div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"rgba(195,228,255,0.88)",marginBottom:4}}>Facial Recognition OSINT</div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(80,160,215,0.42)",marginBottom:9,lineHeight:1.5}}>Upload a photo to analyse features and generate targeted OSINT search queries.</div>
                      <button onClick={()=>{if(dsImageData)handleImageDeepSearch(dsImageData);}} disabled={!dsImageData||dsImageLoading}
                        className={dsImageData&&!dsImageLoading?"btn-bio":""}
                        style={{padding:"5px 13px",cursor:dsImageData&&!dsImageLoading?"pointer":"not-allowed",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,
                          background:dsImageData&&!dsImageLoading?undefined:"transparent",border:dsImageData&&!dsImageLoading?undefined:"1px solid rgba(0,90,140,0.16)",color:dsImageData&&!dsImageLoading?undefined:"rgba(0,110,155,0.32)"}}>
                        {dsImageLoading?`${dsImageStage||"Analysing…"}`:"Analyse Face"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{maxHeight:340,overflowY:"auto" as const,padding:"11px 18px"}}>
                {dsLoading&&<div style={{textAlign:"center" as const,padding:"20px 0",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"rgba(80,160,215,0.42)"}}>Searching…</div>}
                {dsResults?.error&&<div style={{textAlign:"center" as const,padding:"16px 0",color:"rgba(220,70,70,0.8)",fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>Search failed. Try again.</div>}
                {dsResults?.platforms&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:7}}>
                    {dsResults.platforms.map((pl:any,i:number)=>(
                      <div key={i} className="bio-card" style={{borderRadius:3,padding:"8px 10px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,letterSpacing:"0.1em",color:`hsl(${pl.color})`,marginBottom:5,textTransform:"uppercase" as const}}>{pl.icon} {pl.name}</div>
                        {pl.links.map((lk:any,j:number)=>(
                          <a key={j} href={lk.url} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"2.5px 0",fontFamily:"'Inter',sans-serif",fontSize:9.5,color:"rgba(100,170,220,0.55)",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}} onMouseEnter={e=>(e.currentTarget.style.color=`hsl(${pl.color})`)} onMouseLeave={e=>(e.currentTarget.style.color="rgba(100,170,220,0.55)")}>&#8599; {lk.label}</a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {dsImageResults?.ok&&(
                  <div>
                    <div className="bio-card" style={{borderRadius:3,padding:"8px 11px",marginBottom:9}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"rgba(0,215,255,0.75)",marginBottom:3}}>FACIAL ANALYSIS</div>
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(160,215,245,0.7)",margin:0}}>{dsImageResults.face?.description}</p>
                    </div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:4}}>
                      {dsImageResults.searchHits?.map((hit:any,i:number)=>(
                        <a key={i} href={hit.url} target="_blank" rel="noopener noreferrer" className="bio-card" style={{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",borderRadius:3,textDecoration:"none"}} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderTopColor="rgba(0,200,255,0.5)";}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderTopColor="rgba(0,200,255,0.32)";}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7.5,fontWeight:700,color:`hsl(${hit.color})`,minWidth:52,flexShrink:0,textTransform:"uppercase" as const}}>{hit.platform}</span>
                          <span style={{fontFamily:"'Inter',sans-serif",fontSize:9.5,color:"rgba(100,170,220,0.55)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,flex:1}}>{hit.label}</span>
                          <ExternalLink style={{width:9,height:9,flexShrink:0,color:"rgba(0,135,180,0.35)"}}/>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {showSupport&&<TechSupportModal onClose={()=>setShowSupport(false)} allowManualReporter={false}/>}
      {showDM&&<DirectMessagePanel onClose={()=>setShowDM(false)}/>}
      </div>
  );
};

export default Index;
