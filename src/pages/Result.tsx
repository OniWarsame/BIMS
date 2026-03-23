import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowLeft, Fingerprint, FileText, User, Briefcase,
  Mail, Phone, MapPin, Heart, GraduationCap, AlertTriangle, Users,
  Globe, Car, Pencil, Printer, Search, X, ExternalLink, Save, RotateCcw, Camera, Lock
} from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getRecords, updateRecord, unlockDatabase, type BiometricRecord } from "@/lib/biometric-store";
import { getCurrentUser, getUsers, ROLE_COLORS, ROLE_LABELS } from "@/pages/Login";

/* ── Edit form helpers ── */
const inputStyle = {
  width:"100%", padding:"0.45rem 0.7rem", borderRadius:"8px",
  background:"hsla(25,12%,8%,0.85)", border:"1.5px solid hsla(33,60%,30%,0.45)",
  color:"hsl(38,30%,92%)", fontFamily:"inherit", fontSize:"0.82rem", outline:"none",
};
const EF = ({label,v,k,hc,placeholder=""}:{label:string;v:string;k:string;hc:(k:string,v:string)=>void;placeholder?:string}) => (
  <div>
    <p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{color:"hsla(33,80%,60%,0.5)"}}>{label}</p>
    <input value={v} onChange={e=>hc(k,e.target.value)} placeholder={placeholder||label}
      style={inputStyle}
      onFocus={e=>{e.currentTarget.style.borderColor="hsla(33,100%,55%,0.65)";e.currentTarget.style.boxShadow="0 0 12px hsla(33,100%,52%,0.15)";}}
      onBlur={e=>{e.currentTarget.style.borderColor="hsla(33,60%,30%,0.45)";e.currentTarget.style.boxShadow="none";}}/>
  </div>
);
const EFSel = ({label,v,k,hc,opts}:{label:string;v:string;k:string;hc:(k:string,v:string)=>void;opts:string[]}) => (
  <div>
    <p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{color:"hsla(33,80%,60%,0.5)"}}>{label}</p>
    <select value={v} onChange={e=>hc(k,e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
      <option value="">— select —</option>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
);
const EFArea = ({label,v,k,hc}:{label:string;v:string;k:string;hc:(k:string,v:string)=>void}) => (
  <div>
    <p className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{color:"hsla(33,80%,60%,0.5)"}}>{label}</p>
    <textarea value={v} onChange={e=>hc(k,e.target.value)} rows={3}
      style={{...inputStyle,resize:"vertical"}}
      onFocus={e=>{e.currentTarget.style.borderColor="hsla(33,100%,55%,0.65)";e.currentTarget.style.boxShadow="0 0 12px hsla(33,100%,52%,0.15)";}}
      onBlur={e=>{e.currentTarget.style.borderColor="hsla(33,60%,30%,0.45)";e.currentTarget.style.boxShadow="none";}}/>
  </div>
);
const Section = ({label,color,children}:{label:string;color:string;children:React.ReactNode}) => (
  <div>
    <p className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase mb-3"
      style={{color:`hsl(${color},65%)`,borderBottom:`1px solid hsla(${color},25%,0.35)`,paddingBottom:"0.5rem"}}>
      {label}
    </p>
    <div className="space-y-3">{children}</div>
  </div>
);
const Row2 = ({children}:{children:React.ReactNode}) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = getRecords().find(r => r.id === id);

  if (!record) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CyberBackground />
        <div className="card-surface rounded-lg p-10 text-center relative z-[1]">
          <Fingerprint className="w-12 h-12 mx-auto mb-4" style={{ color:"hsla(38,85%,55%,0.25)" }} />
          <p className="font-mono text-sm mb-2" style={{ color:"hsl(0,80%,65%)" }}>RECORD_NOT_FOUND</p>
          <p className="font-mono text-xs mb-6" style={{ color:"hsla(192,100%,60%,0.45)" }}>ID: {id}</p>
          <button onClick={() => navigate("/")} className="font-mono text-sm px-6 py-2 rounded-lg" style={{border:"1.5px solid hsla(38,85%,55%,0.45)",color:"hsl(38,90%,72%)"}}>RETURN TO PORTAL</button>
        </div>
      </div>
    );
  }

  /* Field display */
  const F = ({ label, value, mono=false, full=false, warn=false }: { label:string; value?:string|null; mono?:boolean; full?:boolean; warn?:boolean }) => (
    <div className={full ? "col-span-2 md:col-span-4" : ""}>
      <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color:"hsla(38,80%,65%,0.5)" }}>{label}</p>
      <p className={`${mono?"font-mono text-xs tracking-wider":"font-display text-sm font-semibold"} leading-snug`}
        style={{ color: warn?"hsl(33,100%,65%)": value?"hsl(38,30%,92%)":"hsla(38,20%,55%,0.6)" }}>
        {value||"—"}
      </p>
    </div>
  );

  const Sec = ({ icon:Icon, title, accent="gold", children }:{ icon:any; title:string; accent?:string; children:React.ReactNode }) => {
    const c = accent==="green"?"140,80%":accent==="orange"?"33,100%":"38,85%";
    return (
      <div className="card-surface rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3" style={{ borderBottom:`1px solid hsla(${c},55%,0.2)` }}>
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background:`hsla(${c},55%,0.1)`, border:`1px solid hsla(${c},55%,0.25)` }}>
            <Icon className="w-3.5 h-3.5" style={{ color:`hsl(${c},65%)` }} />
          </div>
          <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:`hsl(${c},68%)` }}>{title}</h2>
        </div>
        {children}
      </div>
    );
  };

  const Badge = ({ text, c="38,85%" }:{ text:string; c?:string }) => (
    <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded" style={{ background:`hsla(${c},55%,0.12)`, border:`1px solid hsla(${c},55%,0.32)`, color:`hsl(${c},68%)` }}>{text}</span>
  );

  const handlePrint = () => window.print();
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<BiometricRecord>>({});
  const [editSaved, setEditSaved] = useState(false);

  /* ── PIN gate ── */
  const [pinGate, setPinGate] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  const openEdit = () => {
    setPinValue("");
    setPinError("");
    setPinGate(true);
  };

  const confirmPin = () => {
    if (!unlockDatabase(pinValue)) {
      setPinError("INCORRECT PIN — ACCESS DENIED");
      setPinValue("");
      return;
    }
    setPinGate(false);
    setEditDraft({ ...record });
    setEditSaved(false);
    setShowEdit(true);
  };

  const saveEdit = () => {
    updateRecord(record.id, editDraft);
    setEditSaved(true);
    setTimeout(() => { setShowEdit(false); window.location.reload(); }, 900);
  };

  const hc = (field: string, val: string) => setEditDraft(p => ({ ...p, [field]: val }));

  /* Build search queries from identity data */
  const fullName  = `${record.name} ${record.surname}`.trim();
  const username  = record.name.toLowerCase();
  const email     = record.email || "";
  const phone     = record.phoneNo || "";

  /* ── Username variants from name ── */
  const firstName = record.name.toLowerCase().trim();
  const lastName  = record.surname.toLowerCase().trim();
  const fn  = encodeURIComponent(fullName);
  const fe  = encodeURIComponent(email);
  const fph = phone.replace(/\D/g,"");

  /* All common username patterns */
  const uv = [
    `${firstName}${lastName}`,
    `${firstName}.${lastName}`,
    `${firstName}_${lastName}`,
    `${firstName}${lastName[0] || ""}`,
    `${firstName[0] || ""}${lastName}`,
    `${firstName[0] || ""}.${lastName}`,
    `${firstName[0] || ""}_${lastName}`,
    `${firstName}${lastName}${new Date().getFullYear().toString().slice(2)}`,
    `${firstName}${lastName}1`,
    `real${firstName}${lastName}`,
  ].filter((v,i,a) => v.length > 2 && a.indexOf(v) === i).slice(0, 8);

  /* Google site-search helper — always returns a search results page, never 404 */
  const gSite = (site: string, term: string) =>
    `https://www.google.com/search?q=site:${site}+${encodeURIComponent(term)}`;
  const gSearch = (q: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  /* Twitter/X search always returns a feed, not a profile */
  const xSearch = (q: string, filter = "") =>
    `https://x.com/search?q=${encodeURIComponent(q)}${filter ? "&" + filter : ""}`;

  type SP = { name:string; color:string; icon:string; tag?:string; searches:{label:string;url:string;note:string}[] };

  const platforms: SP[] = [

    /* ── GOOGLE MASTER SEARCH ── */
    { name:"Google", color:"188,80%,62%", icon:"G", tag:"MASTER",
      searches:[
        { label:`Exact: "${fullName}"`,
          url: gSearch(`"${fullName}"`),
          note:"Finds exact name across the entire web" },
        { label:`Social media profiles`,
          url: gSearch(`"${fullName}" site:instagram.com OR site:facebook.com OR site:twitter.com OR site:tiktok.com OR site:linkedin.com OR site:snapchat.com`),
          note:"Scans all major social platforms at once" },
        ...(email ? [{
          label:`Email: "${email}"`,
          url: gSearch(`"${email}"`),
          note:"Every public mention of this email address" }] : []),
        ...(phone ? [{
          label:`Phone: "${phone}"`,
          url: gSearch(`"${phone}"`),
          note:"Every public mention of this phone number" }] : []),
        { label:`Username variants`,
          url: gSearch(uv.slice(0,4).map(v => `"${v}"`).join(" OR ")),
          note:"Searches common username patterns derived from this name" },
        { label:`News & articles`,
          url: `https://www.google.com/search?q="${fn}"&tbm=nws`,
          note:"News articles, press coverage and mentions" },
        { label:`Image search`,
          url: `https://www.google.com/search?q="${fn}"&tbm=isch`,
          note:"Photos and images associated with this name" },
      ]},

    /* ── FACEBOOK ── */
    { name:"Facebook", color:"220,85%,62%", icon:"f",
      searches:[
        { label:`People: ${fullName}`,
          url: `https://www.facebook.com/search/people/?q=${fn}`,
          note:"Facebook people directory — shows all matching accounts" },
        { label:`Posts mentioning: ${fullName}`,
          url: `https://www.facebook.com/search/posts/?q=${fn}`,
          note:"Public posts that mention this person's name" },
        { label:`First name only: ${record.name}`,
          url: `https://www.facebook.com/search/people/?q=${encodeURIComponent(record.name)}`,
          note:"All accounts with the same first name — useful to find similar" },
        { label:`Surname only: ${record.surname}`,
          url: `https://www.facebook.com/search/people/?q=${encodeURIComponent(record.surname)}`,
          note:"All accounts with the same last name" },
        { label:`Google → Facebook`,
          url: gSite("facebook.com", `"${fullName}"`),
          note:"Google-indexed Facebook pages, profiles and posts" },
        ...(email ? [{
          label:`Google email on FB`,
          url: gSearch(`site:facebook.com "${email}"`),
          note:"Facebook profiles linked to this email" }] : []),
      ]},

    /* ── INSTAGRAM ── */
    { name:"Instagram", color:"320,85%,62%", icon:"📸",
      searches:[
        { label:`Google: "${fullName}" on Instagram`,
          url: gSite("instagram.com", `"${fullName}"`),
          note:"Google-indexed Instagram profiles matching this name" },
        { label:`All username variants`,
          url: gSearch(`site:instagram.com ${uv.slice(0,5).map(v=>`"${v}"`).join(" OR ")}`),
          note:`Scans ${uv.length} username patterns: ${uv.slice(0,3).join(", ")}…` },
        { label:`Username: ${uv[0]}`,
          url: gSite("instagram.com", uv[0]),
          note:`Most common format — search shows indexed profiles` },
        { label:`Username: ${uv[1] || uv[0]}`,
          url: gSite("instagram.com", uv[1] || uv[0]),
          note:"Dot-separated username format" },
        { label:`Username: ${uv[2] || uv[0]}`,
          url: gSite("instagram.com", uv[2] || uv[0]),
          note:"Underscore-separated username format" },
      ]},

    /* ── X / TWITTER ── */
    { name:"X / Twitter", color:"0,0%,88%", icon:"𝕏",
      searches:[
        { label:`People: ${fullName}`,
          url: xSearch(fullName, "f=user"),
          note:"Twitter/X people search — shows matching user accounts" },
        { label:`Posts: "${fullName}"`,
          url: xSearch(`"${fullName}"`),
          note:"All tweets and posts mentioning this exact name" },
        { label:`Recent mentions`,
          url: xSearch(`"${fullName}"`, "f=live"),
          note:"Most recent posts mentioning this person" },
        { label:`Google: "${fullName}" on X`,
          url: gSite("x.com", `"${fullName}"`),
          note:"Google-indexed X profiles and tweets" },
        { label:`Username variants on X`,
          url: gSearch(`site:x.com ${uv.slice(0,3).map(v=>`"${v}"`).join(" OR ")}`),
          note:"Finds X profiles using common username patterns" },
        ...(email ? [{
          label:`Google email on X`,
          url: gSearch(`site:x.com "${email}"`),
          note:"X profiles associated with this email" }] : []),
      ]},

    /* ── LINKEDIN ── */
    { name:"LinkedIn", color:"210,90%,58%", icon:"in", tag:"PROFESSIONAL",
      searches:[
        { label:`People: ${fullName}`,
          url: `https://www.linkedin.com/search/results/people/?keywords=${fn}`,
          note:"LinkedIn people directory with full name filter" },
        { label:`Google → LinkedIn`,
          url: gSite("linkedin.com", `"${fullName}"`),
          note:"Google-indexed LinkedIn profiles — often bypasses login wall" },
        { label:`All name variants`,
          url: gSearch(`site:linkedin.com/in/ "${record.name}" "${record.surname}"`),
          note:"Finds LinkedIn profile URLs containing both names" },
        ...(email ? [{
          label:`Email on LinkedIn`,
          url: gSearch(`site:linkedin.com "${email}"`),
          note:"LinkedIn profiles mentioning this email" }] : []),
        { label:`Profession search`,
          url: `https://www.linkedin.com/search/results/people/?keywords=${fn}&origin=GLOBAL_SEARCH_HEADER`,
          note:"Full LinkedIn search with access to connection network" },
      ]},

    /* ── TIKTOK ── */
    { name:"TikTok", color:"172,100%,50%", icon:"♪",
      searches:[
        { label:`Users: ${fullName}`,
          url: `https://www.tiktok.com/search/user?q=${fn}`,
          note:"TikTok's own user search engine" },
        { label:`Videos: ${fullName}`,
          url: `https://www.tiktok.com/search?q=${fn}`,
          note:"All TikTok videos related to this name" },
        { label:`Google: "${fullName}" on TikTok`,
          url: gSite("tiktok.com", `"${fullName}"`),
          note:"Google-indexed TikTok profiles and videos" },
        { label:`Username variants`,
          url: gSearch(`site:tiktok.com ${uv.slice(0,4).map(v=>`"${v}"`).join(" OR ")}`),
          note:`Checks ${uv.slice(0,4).join(", ")} on TikTok` },
      ]},

    /* ── SNAPCHAT ── */
    { name:"Snapchat", color:"50,100%,55%", icon:"👻",
      searches:[
        { label:`Google: "${fullName}" on Snapchat`,
          url: gSite("snapchat.com", `"${fullName}"`),
          note:"Google-indexed Snapchat public profiles" },
        { label:`Username: ${uv[0]}`,
          url: gSearch(`site:snapchat.com "${uv[0]}"`),
          note:"Searches Snapchat for most likely username" },
        { label:`All username variants`,
          url: gSearch(`site:snapchat.com ${uv.slice(0,4).map(v=>`"${v}"`).join(" OR ")}`),
          note:"Scans multiple username formats on Snapchat" },
      ]},

    /* ── YOUTUBE ── */
    { name:"YouTube", color:"0,90%,55%", icon:"▶",
      searches:[
        { label:`Channels: ${fullName}`,
          url: `https://www.youtube.com/results?search_query=${fn}&sp=EgIQAg%3D%3D`,
          note:"YouTube filtered to channels only — find the person's channel" },
        { label:`All videos`,
          url: `https://www.youtube.com/results?search_query=${fn}`,
          note:"All YouTube content related to this name" },
        { label:`Google → YouTube channel`,
          url: gSite("youtube.com", `"${fullName}"`),
          note:"Google-indexed YouTube channels and videos" },
      ]},

    /* ── GITHUB ── */
    { name:"GitHub", color:"215,28%,68%", icon:"</>", tag:"TECH",
      searches:[
        { label:`Users: ${fullName}`,
          url: `https://github.com/search?q=${fn}&type=users`,
          note:"GitHub user search — shows all accounts matching this name" },
        { label:`Username: ${uv[0]}`,
          url: `https://github.com/search?q=${encodeURIComponent(uv[0])}&type=users`,
          note:"Searches GitHub for most common username format" },
        { label:`All username variants`,
          url: `https://github.com/search?q=${encodeURIComponent(uv.slice(0,3).join(" OR "))}&type=users`,
          note:"Scans multiple username patterns" },
        ...(email ? [{
          label:`Commits by email`,
          url: gSearch(`site:github.com "${email}"`),
          note:"Finds GitHub commits and profiles linked to this email" }] : []),
      ]},

    /* ── REDDIT ── */
    { name:"Reddit", color:"15,90%,60%", icon:"R",
      searches:[
        { label:`Users: ${fullName}`,
          url: `https://www.reddit.com/search/?q=${fn}&type=user`,
          note:"Reddit user search — finds accounts by display name" },
        { label:`Username: ${uv[0]}`,
          url: `https://www.reddit.com/search/?q=${encodeURIComponent(uv[0])}&type=user`,
          note:"Searches Reddit for most likely username" },
        { label:`Posts mentioning: "${fullName}"`,
          url: `https://www.reddit.com/search/?q="${fn}"`,
          note:"Reddit posts and comments mentioning this name" },
        { label:`Google → Reddit`,
          url: gSite("reddit.com", `"${fullName}"`),
          note:"Google-indexed Reddit profiles and posts" },
      ]},

    /* ── EMAIL & BREACH ── */
    { name:"Email & Breach", color:"0,80%,65%", icon:"⚠", tag:"SECURITY",
      searches: email ? [
        { label:`HaveIBeenPwned`,
          url: `https://haveibeenpwned.com/account/${fe}`,
          note:"Check if this email appeared in any known data breaches" },
        { label:`Google: all mentions of email`,
          url: gSearch(`"${email}"`),
          note:"Every publicly indexed page that lists this email" },
        { label:`Social accounts with email`,
          url: gSearch(`"${email}" site:facebook.com OR site:instagram.com OR site:linkedin.com OR site:twitter.com`),
          note:"Social media accounts publicly associated with this email" },
        { label:`Forums & registrations`,
          url: gSearch(`"${email}" forum OR register OR account OR profile`),
          note:"Forum posts, registrations and profiles listing this email" },
        { label:`Hunter.io intel`,
          url: `https://hunter.io/email-verifier/${fe}`,
          note:"Email validity check and domain intelligence" },
      ] : [{ label:"No email on record", url:"", note:"Add an email to this identity to enable breach and email tracking" }]},

    /* ── PHONE ── */
    { name:"Phone Lookup", color:"35,90%,60%", icon:"📞",
      searches: phone ? [
        { label:`Truecaller: ${phone}`,
          url: `https://www.truecaller.com/search/${fph}`,
          note:"World's largest crowdsourced phone directory" },
        { label:`Google: all mentions`,
          url: gSearch(`"${phone}"`),
          note:"Every publicly indexed page listing this phone number" },
        { label:`WhatsApp: ${phone}`,
          url: `https://wa.me/${fph}`,
          note:"Opens a WhatsApp chat — confirms if number is registered" },
        { label:`Social + phone`,
          url: gSearch(`"${phone}" site:facebook.com OR site:linkedin.com OR site:instagram.com`),
          note:"Social media accounts that list this phone number publicly" },
        { label:`Reverse lookup`,
          url: gSearch(`"${phone}" name OR person OR contact OR profile`),
          note:"Tries to find the person's name from this phone number" },
      ] : [{ label:"No phone on record", url:"", note:"Add a phone number to enable phone lookup and tracking" }]},

    /* ── PEOPLE SEARCH ENGINES ── */
    { name:"People Engines", color:"270,70%,72%", icon:"🔍", tag:"OSINT",
      searches:[
        { label:`Pipl: ${fullName}`,
          url: `https://pipl.com/search/?q=${fn}`,
          note:"Deep people search aggregating social, professional and public records" },
        { label:`Spokeo: ${fullName}`,
          url: `https://www.spokeo.com/search?q=${fn}`,
          note:"People aggregator with social, address and phone data" },
        { label:`BeenVerified`,
          url: `https://www.beenverified.com/people/${encodeURIComponent(record.name)}/${encodeURIComponent(record.surname)}/`,
          note:"Background check database with social media links" },
        { label:`Intelius`,
          url: `https://www.intelius.com/people-search/results/all/?firstName=${encodeURIComponent(record.name)}&lastName=${encodeURIComponent(record.surname)}`,
          note:"Public records and people search database" },
        { label:`FastPeopleSearch`,
          url: `https://www.fastpeoplesearch.com/name/${encodeURIComponent(record.name+"-"+record.surname)}`,
          note:"Free people search with addresses and phone numbers" },
      ]},

    /* ── SIMILAR ACCOUNTS (username multi-search) ── */
    { name:"Similar Accounts", color:"38,90%,62%", icon:"👥", tag:"VARIANTS",
      searches:[
        { label:`WhatsMyName OSINT tool`,
          url: `https://whatsmyname.app/?q=${encodeURIComponent(uv[0])}`,
          note:`Checks "${uv[0]}" across 300+ platforms simultaneously — most powerful tool` },
        { label:`Namecheckr: ${uv[0]}`,
          url: `https://www.namecheckr.com/${encodeURIComponent(uv[0])}`,
          note:"If a platform shows 'taken', the account exists — click each to open" },
        { label:`Instant Username Search`,
          url: `https://instantusername.com/#${encodeURIComponent(uv[0])}`,
          note:"Real-time availability check across 100+ platforms" },
        ...uv.slice(0, 4).map(v => ({
          label: `Google: all platforms "${v}"`,
          url:   gSearch(`"${v}" site:instagram.com OR site:twitter.com OR site:tiktok.com OR site:reddit.com OR site:github.com OR site:linkedin.com`),
          note:  `Searches all social platforms for the username "${v}"`,
        })),
        { label:`Sherlock-style Google`,
          url: gSearch(`"${uv[0]}" OR "${uv[1] || uv[0]}" OR "${uv[2] || uv[0]}" profile OR account OR bio`),
          note:"Broad search for any online profile matching these username patterns" },
      ]},
  ];

  return (
    <div className="min-h-screen relative flex flex-col" id="result-page">
      <CyberBackground />

      
            </div>
          );
          const roleColor = ROLE_COLORS[linked.role];
          return (
            <div className="card-surface rounded-xl p-5" style={{ borderTop:`2px solid hsla(195,100%,50%,0.35)` }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4" style={{color:"hsl(195,100%,65%)"}}/>
                <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:"hsl(195,100%,65%)" }}>SYSTEM ACCESS ACCOUNT</h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{background:linked.active?"#4ade80":"#6b7280",boxShadow:linked.active?"0 0 6px #4ade80":"none"}}/>
                  <span className="font-mono text-[10px] font-bold" style={{color:linked.active?"#4ade80":"#6b7280"}}>{linked.active?"ACTIVE":"DISABLED"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl" style={{background:"hsla(195,100%,45%,0.07)",border:"1px solid hsla(195,100%,50%,0.2)"}}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-1" style={{color:"hsla(195,80%,65%,0.5)"}}>LOGIN USERNAME</p>
                  <p className="font-mono text-sm font-bold" style={{color:"hsl(195,100%,78%)"}}>@{linked.username}</p>
                </div>
                <div className="p-3 rounded-xl" style={{background:"hsla(195,100%,45%,0.07)",border:"1px solid hsla(195,100%,50%,0.2)"}}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-1" style={{color:"hsla(195,80%,65%,0.5)"}}>PASSWORD</p>
                  <p className="font-mono text-sm font-bold" style={{color:"hsl(195,100%,78%)"}}>{linked.password}</p>
                </div>
                <div className="p-3 rounded-xl" style={{background:`${roleColor}12`,border:`1px solid ${roleColor}40`}}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-1" style={{color:`${roleColor}88`}}>ROLE</p>
                  <p className="font-mono text-sm font-bold" style={{color:roleColor}}>{ROLE_LABELS[linked.role]}</p>
                </div>
                <div className="p-3 rounded-xl" style={{background:"hsla(195,100%,45%,0.07)",border:"1px solid hsla(195,100%,50%,0.2)"}}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-1" style={{color:"hsla(195,80%,65%,0.5)"}}>CREATED</p>
                  <p className="font-mono text-[11px] font-bold" style={{color:"hsl(195,100%,78%)"}}>{new Date(linked.createdAt).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </motion.div>
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center px-8 py-2.5"
        style={{ background:"hsla(25,15%,5%,0.88)", backdropFilter:"blur(20px)", borderTop:"1px solid hsla(35,65%,38%,0.25)" }}>
        <div className="flex items-center gap-4 font-mono text-[11px] font-semibold">
          <span style={{ color:"hsla(192,90%,62%,0.75)" }}>BIMS v1.0 · © 2026 <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{ color:"hsl(38,90%,72%)", textDecoration:"underline", textUnderlineOffset:"3px", textShadow:"0 0 8px hsla(38,90%,62%,0.45)" }}>KUMI</a></span>
          <span className="w-1 h-1 rounded-full" style={{ background:"hsla(192,100%,55%,0.4)" }}/>
          <span style={{ color:"hsla(38,65%,58%,0.6)" }}>ENCRYPTED CHANNEL</span>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
