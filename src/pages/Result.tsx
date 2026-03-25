import { useLang, t } from "@/lib/i18n";
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
import { getCurrentUser, getUsers, ROLE_COLORS, ROLE_LABELS } from "@/lib/auth";

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
  const lang = useLang();
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

      {/* ── PIN GATE ── */}
      <AnimatePresence>
        {pinGate && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{background:"hsla(210,80%,4%,0.88)",backdropFilter:"blur(16px)"}}>
            <motion.div initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
              className="card-surface rounded-2xl p-8 w-full max-w-sm text-center"
              style={{border:"1.5px solid hsla(33,100%,52%,0.45)",boxShadow:"0 0 60px hsla(33,100%,52%,0.12)"}}>
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{background:"hsla(33,100%,52%,0.12)",border:"2px solid hsla(33,100%,52%,0.4)"}}>
                <Lock className="w-6 h-6" style={{color:"hsl(33,100%,65%)"}}/>
              </div>
              <h3 className="font-display text-lg font-bold mb-1" style={{color:"hsl(33,100%,72%)"}}>
                CONFIRM EDIT
              </h3>
              <p className="font-mono text-xs mb-1 tracking-wider" style={{color:"hsla(38,70%,65%,0.6)"}}>
                {record.surname}, {record.name} · {record.id}
              </p>
              <p className="font-mono text-xs mb-4 tracking-widest mt-3" style={{color:"hsla(185,80%,65%,0.5)"}}>
                ENTER PIN TO CONTINUE
              </p>
              <div className="mb-2">
                <input type="password" value={pinValue} autoFocus maxLength={8}
                  onChange={e=>{setPinValue(e.target.value);setPinError("");}}
                  onKeyDown={e=>{if(e.key==="Enter")confirmPin();if(e.key==="Escape"){setPinGate(false);setPinValue("");setPinError("");}}}
                  placeholder="• • • • • •"
                  className="input-cyber text-center font-bold w-full"
                  style={{fontSize:"1.3rem",letterSpacing:"0.45em",borderColor:pinError?"hsl(0,90%,58%)":"hsla(33,80%,50%,0.38)"}}/>
              </div>
              <div className="h-6 flex items-center justify-center mb-4">
                {pinError&&<p className="font-mono text-xs tracking-wider" style={{color:"hsl(0,90%,65%)"}}>{pinError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>{setPinGate(false);setPinValue("");setPinError("");}}
                  className="flex-1 h-10 rounded-lg font-mono font-bold tracking-widest text-xs transition-all"
                  style={{border:"1.5px solid hsla(33,60%,35%,0.38)",color:"hsla(33,70%,65%,0.6)"}}>
                  CANCEL
                </button>
                <button onClick={confirmPin}
                  className="flex-1 h-10 rounded-lg font-mono font-bold tracking-widest text-xs transition-all"
                  style={{background:"hsla(33,100%,50%,0.2)",border:"1.5px solid hsla(33,100%,52%,0.55)",color:"hsl(33,100%,72%)"}}>
                  UNLOCK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 overflow-y-auto pb-14"
            style={{background:"rgba(0,5,14,0.78)",backdropFilter:"blur(18px)"}}>
            <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}} transition={{duration:0.22}}
              className="card-surface rounded-2xl overflow-hidden w-full max-w-3xl mb-8"
              style={{border:"1.5px solid hsla(33,100%,52%,0.45)",boxShadow:"0 0 80px hsla(33,100%,52%,0.1),0 24px 60px rgba(0,0,0,.8)"}}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{borderColor:"hsla(33,60%,25%,0.4)",background:"hsla(33,60%,7%,0.8)"}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{background:"hsla(33,100%,52%,0.15)",border:"1.5px solid hsla(33,100%,55%,0.4)"}}>
                    <Pencil className="w-5 h-5" style={{color:"hsl(33,100%,70%)"}}/>
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold tracking-wider" style={{color:"hsl(33,100%,75%)"}}>EDIT IDENTITY</h2>
                    <p className="font-mono text-[10px] tracking-widest" style={{color:"hsla(33,70%,60%,0.5)"}}>
                      {record.id} · {record.surname}, {record.name}
                    </p>
                  </div>
                </div>
                <button onClick={()=>setShowEdit(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{color:"hsla(33,70%,60%,0.5)",border:"1px solid hsla(33,50%,35%,0.25)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="hsla(33,60%,40%,0.15)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <X className="w-4 h-4"/>
                </button>
              </div>

              {/* Edit fields */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                {/* Personal */}
                <Section label={t("res_personal",lang)} color="33,100%">
                  <Row2>
                    <EF label={t("res_first_name",lang)}   v={editDraft.name||""}       k="name"       hc={hc}/>
                    <EF label="SURNAME"      v={editDraft.surname||""}     k="surname"    hc={hc}/>
                  </Row2>
                  <Row2>
                    <EFSel label={t("lbl_gender",lang)} v={editDraft.gender||""} k="gender" hc={hc}
                      opts={["Male","Female","Non-binary","Prefer not to say"]}/>
                    <EF label={t("lbl_dob",lang)} v={editDraft.dateOfBirth||""} k="dateOfBirth" hc={hc} placeholder="YYYY-MM-DD"/>
                  </Row2>
                  <Row2>
                    <EF label="PLACE OF BIRTH"   v={editDraft.placeOfBirth||""} k="placeOfBirth" hc={hc}/>
                    <EF label="SIBLINGS"          v={(editDraft as any).siblings||""} k="siblings" hc={hc}/>
                  </Row2>
                  <Row2>
                    <EF label={t("lbl_nationality",lang)}       v={editDraft.nationality||""}  k="nationality" hc={hc}/>
                    <EF label="NATIONAL ID"       v={editDraft.nationalId||""}   k="nationalId"  hc={hc}/>
                  </Row2>
                  <Row2>
                    <EFSel label="MARITAL STATUS" v={editDraft.maritalStatus||""} k="maritalStatus" hc={hc}
                      opts={["Single","Married","Divorced","Widowed"]}/>
                    <EFSel label="BLOOD TYPE" v={editDraft.bloodType||""} k="bloodType" hc={hc}
                      opts={["A+","A-","B+","B-","AB+","AB-","O+","O-"]}/>
                  </Row2>
                  <EF label="OCCUPATION"     v={editDraft.occupation||""} k="occupation" hc={hc}/>
                  <EF label="EMAIL"          v={editDraft.email||""}      k="email"      hc={hc}/>
                  <Row2>
                    <EF label="PHONE"       v={editDraft.phoneNo||""}  k="phoneNo"  hc={hc}/>
                    <EF label="WHATSAPP"    v={(editDraft as any).whatsapp||""} k="whatsapp" hc={hc}/>
                  </Row2>
                  <EFArea label="ADDRESS"   v={editDraft.address||""} k="address" hc={hc}/>
                </Section>

                {/* Passport */}
                <Section label="PASSPORT" color="188,80%">
                  <Row2>
                    <EF label="PASSPORT NO."     v={editDraft.passportNo||""}          k="passportNo"          hc={hc}/>
                    <EF label="PLACE OF ISSUE"   v={editDraft.passportPlaceOfIssue||""} k="passportPlaceOfIssue" hc={hc}/>
                  </Row2>
                  <Row2>
                    <EF label="ISSUE DATE"       v={editDraft.passportIssueDate||""}   k="passportIssueDate"  hc={hc} placeholder="YYYY-MM-DD"/>
                    <EF label="EXPIRY DATE"      v={editDraft.passportExpiryDate||""}  k="passportExpiryDate" hc={hc} placeholder="YYYY-MM-DD"/>
                  </Row2>
                </Section>

                {/* Driving License */}
                <Section label="DRIVING LICENSE" color="142,70%">
                  <Row2>
                    <EF label="LICENSE NO."      v={(editDraft as any).licenseNo||""}       k="licenseNo"      hc={hc}/>
                    <EF label="COUNTRY"          v={(editDraft as any).licenseCountry||""}  k="licenseCountry" hc={hc}/>
                  </Row2>
                  <Row2>
                    <EF label="ISSUE DATE"       v={(editDraft as any).licenseIssueDate||""}  k="licenseIssueDate"  hc={hc} placeholder="YYYY-MM-DD"/>
                    <EF label="EXPIRY DATE"      v={(editDraft as any).licenseExpiryDate||""} k="licenseExpiryDate" hc={hc} placeholder="YYYY-MM-DD"/>
                  </Row2>
                </Section>

                {/* Family */}
                <Section label="FAMILY" color="320,80%">
                  <Row2>
                    <EF label="FATHER'S FULL NAME"  v={editDraft.fatherName||""}   k="fatherName"  hc={hc} placeholder="Full name"/>
                    <EF label="FATHER'S PHONE"      v={editDraft.fatherPhone||""}  k="fatherPhone" hc={hc} placeholder="+254-700-000-000"/>
                  </Row2>
                  <Row2>
                    <EF label="MOTHER'S FULL NAME"  v={editDraft.motherName||""}   k="motherName"  hc={hc} placeholder="Full name"/>
                    <EF label="MOTHER'S PHONE"      v={editDraft.motherPhone||""}  k="motherPhone" hc={hc} placeholder="+254-700-000-000"/>
                  </Row2>
                  <p className="font-mono text-[10px] font-bold tracking-widest mt-1" style={{color:"hsla(320,70%,65%,0.5)"}}>NEXT OF KIN</p>
                  <Row2>
                    <EF label="KIN FIRST NAME"   v={(editDraft as any).kinName||""}    k="kinName"    hc={hc} placeholder="First name"/>
                    <EF label="KIN SURNAME"       v={(editDraft as any).kinSurname||""} k="kinSurname" hc={hc} placeholder="Last name"/>
                  </Row2>
                  <Row2>
                    <EF label="KIN PHONE"        v={(editDraft as any).kinPhone||""}   k="kinPhone"   hc={hc} placeholder="+254-700-000-000"/>
                    <EF label="KIN RELATION"     v={(editDraft as any).kinRelation||""} k="kinRelation" hc={hc} placeholder="e.g. Brother"/>
                  </Row2>
                  <EFArea label="KIN ADDRESS"    v={(editDraft as any).kinAddress||""} k="kinAddress" hc={hc}/>
                </Section>

                {/* Education */}
                <Section label="EDUCATION" color="33,100%">
                  <Row2>
                    <EF label="UNIVERSITY / COLLEGE" v={(editDraft as any).universityName||""} k="universityName" hc={hc} placeholder="Institution name"/>
                    <EF label="DEPARTMENT"           v={(editDraft as any).department||""}      k="department"     hc={hc} placeholder="e.g. Computer Science"/>
                  </Row2>
                  <Row2>
                    <EF label="STUDENT NUMBER"  v={(editDraft as any).studentNo||""}  k="studentNo"  hc={hc} placeholder="e.g. STU/2024/001"/>
                    <EF label="YEAR OF STUDY"   v={(editDraft as any).studyYear||""}  k="studyYear"  hc={hc} placeholder="e.g. Year 2"/>
                  </Row2>
                  <Row2>
                    <EF label="GRADE / GPA"     v={(editDraft as any).grade||""}      k="grade"      hc={hc} placeholder="e.g. A, 3.8"/>
                    <EF label="LEVEL"           v={(editDraft as any).educationLevel||""} k="educationLevel" hc={hc} placeholder="e.g. Undergraduate"/>
                  </Row2>
                  <Row2>
                    <EF label="START DATE"      v={(editDraft as any).eduStartDate||""} k="eduStartDate" hc={hc} placeholder="YYYY-MM-DD"/>
                    <EF label="END DATE"        v={(editDraft as any).eduEndDate||""}   k="eduEndDate"   hc={hc} placeholder="YYYY-MM-DD"/>
                  </Row2>
                  <EFArea label="PREVIOUS EDUCATION HISTORY" v={editDraft.educationRecord||""} k="educationRecord" hc={hc}/>
                </Section>

                {/* Work */}
                <Section label="WORK EXPERIENCE" color="38,85%">
                  <Row2>
                    <EF label="COMPANY NAME"      v={(editDraft as any).workCompany||""}   k="workCompany"  hc={hc} placeholder="Company name"/>
                    <EF label="EMPLOYER / MANAGER" v={(editDraft as any).workEmployer||""}  k="workEmployer" hc={hc} placeholder="Name"/>
                  </Row2>
                  <EF label="DEPARTMENT"          v={(editDraft as any).workDepartment||""} k="workDepartment" hc={hc} placeholder="Department"/>
                  <EFArea label="PREVIOUS WORK EXPERIENCE" v={editDraft.workExperience||""} k="workExperience" hc={hc}/>
                </Section>

                {/* Health */}
                <Section label="HEALTH & RECORDS" color="0,80%">
                  <EFArea label="HEALTH RECORD"              v={editDraft.healthRecord||""}              k="healthRecord"           hc={hc}/>
                  <EFArea label="HISTORY OF PRESENT ILLNESS" v={(editDraft as any).historyOfPresentIllness||""} k="historyOfPresentIllness" hc={hc}/>
                  <EFArea label="CRIME RECORD"               v={editDraft.crimeRecord||""}              k="crimeRecord"            hc={hc}/>
                </Section>

                {/* Insurance */}
                <Section label="INSURANCE" color="270,80%">
                  <Row2>
                    <EF label="INSURANCE TYPE"    v={(editDraft as any).insuranceType||""}    k="insuranceType"    hc={hc} placeholder="e.g. Health, Life"/>
                    <EF label="INSURANCE COMPANY" v={(editDraft as any).insuranceCompany||""} k="insuranceCompany" hc={hc} placeholder="e.g. APA Insurance"/>
                  </Row2>
                  <Row2>
                    <EF label="POLICY NUMBER"     v={(editDraft as any).insurancePolicyNo||""} k="insurancePolicyNo" hc={hc} placeholder="Policy number"/>
                    <EF label="VALIDITY DATE (EXPIRY)" v={(editDraft as any).insuranceValidityDate||""} k="insuranceValidityDate" hc={hc} placeholder="YYYY-MM-DD"/>
                  </Row2>
                </Section>

                {/* Emergency Contacts */}
                <Section label="EMERGENCY CONTACTS" color="0,90%">
                  <p className="font-mono text-[10px] font-bold tracking-widest" style={{color:"hsla(0,80%,65%,0.5)"}}>CONTACT 1</p>
                  <Row2>
                    <EF label={t("lbl_name",lang)}  v={(editDraft as any).ec1Name||""}  k="ec1Name"  hc={hc} placeholder="Full name"/>
                    <EF label="PHONE NO."  v={(editDraft as any).ec1Phone||""} k="ec1Phone" hc={hc} placeholder="+254-700-000-000"/>
                  </Row2>
                  <p className="font-mono text-[10px] font-bold tracking-widest mt-1" style={{color:"hsla(0,80%,65%,0.5)"}}>CONTACT 2 (OPTIONAL)</p>
                  <Row2>
                    <EF label={t("lbl_name",lang)}  v={(editDraft as any).ec2Name||""}  k="ec2Name"  hc={hc} placeholder="Full name"/>
                    <EF label="PHONE NO."  v={(editDraft as any).ec2Phone||""} k="ec2Phone" hc={hc} placeholder="+254-700-000-000"/>
                  </Row2>
                </Section>

                {/* Social Media */}
                <Section label="SOCIAL MEDIA" color="210,90%">
                  <Row2>
                    <EF label="FACEBOOK"   v={(editDraft as any).facebook||""}   k="facebook"  hc={hc} placeholder="facebook.com/username"/>
                    <EF label="INSTAGRAM"  v={(editDraft as any).instagram||""}  k="instagram" hc={hc} placeholder="@username"/>
                  </Row2>
                  <Row2>
                    <EF label="X / TWITTER" v={(editDraft as any).twitter||""}  k="twitter"   hc={hc} placeholder="@username"/>
                    <EF label="LINKEDIN"    v={(editDraft as any).linkedin||""}  k="linkedin"  hc={hc} placeholder="linkedin.com/in/username"/>
                  </Row2>
                  <Row2>
                    <EF label="TIKTOK"     v={(editDraft as any).tiktok||""}    k="tiktok"    hc={hc} placeholder="@username"/>
                    <EF label="SNAPCHAT"   v={(editDraft as any).snapchat||""}   k="snapchat"  hc={hc} placeholder="@username"/>
                  </Row2>
                </Section>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t"
                style={{borderColor:"hsla(33,60%,25%,0.35)",background:"hsla(33,40%,6%,0.7)"}}>
                <button onClick={()=>setShowEdit(false)}
                  className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all"
                  style={{border:"1px solid hsla(33,50%,30%,0.4)",color:"hsla(33,70%,60%,0.6)"}}>
                  <RotateCcw className="w-3.5 h-3.5"/> CANCEL
                </button>
                <button onClick={saveEdit}
                  className="flex items-center gap-2 font-display font-bold tracking-widest text-sm px-8 py-2.5 rounded-xl transition-all"
                  style={{
                    background:editSaved?"hsla(140,80%,45%,0.25)":"hsla(33,100%,52%,0.2)",
                    border:editSaved?"2px solid hsla(140,80%,55%,0.65)":"2px solid hsla(33,100%,55%,0.65)",
                    color:editSaved?"hsl(42,100%,72%)":"hsl(33,100%,80%)",
                    boxShadow:editSaved?"0 0 24px hsla(140,80%,50%,0.25)":"0 0 24px hsla(33,100%,52%,0.22)",
                  }}>
                  <Save className="w-4 h-4"/> {editSaved?"SAVED!":"SAVE CHANGES"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEEP SEARCH MODAL ── */}
      <AnimatePresence>
        {showDeepSearch && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 overflow-y-auto"
            style={{background:"hsla(25,15%,4%,0.92)",backdropFilter:"blur(18px)"}}
            onClick={()=>setShowDeepSearch(false)}>
            <motion.div initial={{scale:0.94,y:20}} animate={{scale:1,y:0}} exit={{scale:0.94,y:20}} transition={{duration:0.22}}
              className="card-surface rounded-2xl overflow-hidden w-full max-w-3xl mb-8"
              style={{border:"1.5px solid hsla(270,80%,60%,0.45)",boxShadow:"0 0 80px hsla(270,80%,55%,0.14),0 24px 60px rgba(0,0,0,.75)"}}
              onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{borderColor:"hsla(270,50%,30%,0.4)",background:"hsla(270,60%,10%,0.7)"}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{background:"hsla(270,80%,55%,0.15)",border:"1.5px solid hsla(270,80%,60%,0.4)"}}>
                    <Search className="w-5 h-5" style={{color:"hsl(270,80%,78%)"}}/>
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold tracking-wider" style={{color:"hsl(270,80%,82%)"}}>
                      DEEP SOCIAL SEARCH
                    </h2>
                    <p className="font-mono text-[10px] tracking-widest" style={{color:"hsla(270,60%,65%,0.55)"}}>
                      {fullName}{email?` · ${email}`:""}{phone?` · ${phone}`:""} · {platforms.length} PLATFORMS
                    </p>
                  </div>
                </div>
                <button onClick={()=>setShowDeepSearch(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{color:"hsla(270,60%,65%,0.5)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="hsla(270,60%,55%,0.15)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
              {/* Disclaimer */}
              <div className="px-6 py-3" style={{background:"hsla(38,60%,30%,0.08)",borderBottom:"1px solid hsla(192,80%,35%,0.2)"}}>
                <p className="font-mono text-[10px] tracking-wider" style={{color:"hsla(38,80%,65%,0.6)"}}>
                  ⚠ Each button opens the platform's search in a new tab. Results depend on the platform's privacy settings and public data.
                </p>
              </div>
              {/* Platforms grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map(platform=>(
                  <div key={platform.name} className="rounded-xl overflow-hidden"
                    style={{border:`1px solid hsla(${platform.color},0.28)`,background:`hsla(${platform.color},0.06)`}}>
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b"
                      style={{borderColor:`hsla(${platform.color},0.22)`,background:`hsla(${platform.color},0.1)`}}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                        style={{background:`hsla(${platform.color},0.18)`,border:`1px solid hsla(${platform.color},0.38)`,color:`hsl(${platform.color})`}}>
                        {platform.icon}
                      </div>
                      <span className="font-display text-sm font-bold tracking-wide flex-1" style={{color:`hsl(${platform.color})`}}>
                        {platform.name}
                      </span>
                      {(platform as any).tag&&(
                        <span className="font-mono text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                          style={{background:`hsla(${platform.color},0.18)`,border:`1px solid hsla(${platform.color},0.35)`,color:`hsl(${platform.color})`}}>
                          {(platform as any).tag}
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {platform.searches.map((s,i)=>(
                        s.url
                          ? <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                              className="flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-all group"
                              style={{border:`1px solid hsla(${platform.color},0.2)`,background:`hsla(${platform.color},0.05)`,display:"block"}}
                              onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.background=`hsla(${platform.color},0.18)`; (e.currentTarget as HTMLAnchorElement).style.borderColor=`hsla(${platform.color},0.5)`;}}
                              onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.background=`hsla(${platform.color},0.05)`; (e.currentTarget as HTMLAnchorElement).style.borderColor=`hsla(${platform.color},0.2)`;}}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] font-bold truncate" style={{color:`hsl(${platform.color})`}}>{s.label}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" style={{color:`hsla(${platform.color},0.55)`}}/>
                              </div>
                              {(s as any).note&&<span className="font-mono text-[9px]" style={{color:`hsla(${platform.color},0.45)`}}>{(s as any).note}</span>}
                            </a>
                          : <div key={i} className="px-3 py-2 rounded-lg" style={{border:`1px solid hsla(${platform.color},0.12)`,background:`hsla(${platform.color},0.03)`}}>
                              <span className="font-mono text-[10px] font-bold block" style={{color:`hsla(${platform.color},0.35)`}}>{s.label}</span>
                              {(s as any).note&&<span className="font-mono text-[9px]" style={{color:`hsla(${platform.color},0.25)`}}>{(s as any).note}</span>}
                            </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="px-6 py-4 border-t text-center" style={{borderColor:"hsla(270,50%,25%,0.35)",background:"hsla(270,40%,8%,0.5)"}}>
                <p className="font-mono text-[10px] tracking-wider" style={{color:"hsla(270,60%,60%,0.4)"}}>
                  BIMS DEEP SEARCH ENGINE · FORENSIC IDENTITY TRACKING · FOR AUTHORISED USE ONLY
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="cyber-header flex items-center justify-between px-8 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 flex items-center justify-center rounded-lg transition-all" style={{color:"hsl(38,90%,65%)"}}
            onMouseEnter={e=>e.currentTarget.style.background="hsla(192,100%,52%,0.12)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center" style={{ background:"rgba(40,185,215,0.08)" }}>
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider text-foreground block leading-tight">IDENTITY PROFILE</span>
            <span className="font-mono text-[10px] tracking-widest" style={{ color:"hsla(38,85%,65%,0.55)" }}>VERIFIED RECORD · {record.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded hidden md:inline" style={{ background:"hsla(140,80%,45%,0.1)", border:"1px solid hsla(140,80%,45%,0.3)", color:"hsl(140,80%,62%)" }}>✓ VERIFIED</span>
        </div>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="max-w-7xl mx-auto px-6 py-7 relative z-[1] w-full flex-1 space-y-5">

        {/* ══ BANNER ══ */}
        <div className="card-surface rounded-xl p-6 flex items-start gap-6" style={{ borderLeft:"3px solid hsl(38,85%,58%)" }}>
          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor:"hsla(192,80%,35%,0.45)", background:"hsla(25,12%,9%,0.9)" }}>
            {record.photo ? <img src={record.photo} alt="Subject" className="w-full h-full object-cover"/> : <User className="w-12 h-12 m-auto mt-7" style={{ color:"hsla(38,60%,50%,0.25)" }}/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] font-bold tracking-[0.22em] mb-1" style={{ color:"hsl(38,85%,62%)" }}>IDENTITY_VERIFIED · {record.id}</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground glow-text leading-none mb-2">{record.surname}, {record.name}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {record.gender && <Badge text={record.gender}/>}
              {record.nationality && <Badge text={record.nationality}/>}
              {record.bloodType && <Badge text={`Blood: ${record.bloodType}`} c="0,80%"/>}
              {record.maritalStatus && <Badge text={record.maritalStatus}/>}
              {record.occupation && <Badge text={record.occupation}/>}
              {record.isStudent && <Badge text="STUDENT" c="140,80%"/>}
              {record.isAlumni && <Badge text="ALUMNI" c="140,80%"/>}
              {record.noPassport && <Badge text="NO PASSPORT" c="33,100%"/>}
              {record.noLicense && <Badge text="NO LICENSE" c="33,100%"/>}
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-xs" style={{ color:"hsla(38,20%,70%,0.8)" }}>
              {record.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-primary/50"/>{record.email}</span>}
              {record.phoneNo && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-primary/50"/>{record.phoneNo}</span>}
              {record.address && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary/50"/>{record.address}</span>}
            </div>
          </div>
          {/* Right: date + edit/print */}
          <div className="text-right flex-shrink-0 hidden md:flex flex-col items-end gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em]" style={{ color:"hsla(192,100%,60%,0.45)" }}>REGISTERED</p>
              <p className="font-mono text-sm font-semibold mt-1" style={{ color:"hsl(38,20%,85%)" }}>
                {new Date(record.registeredAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
              </p>
              <p className="font-mono text-xs mt-0.5" style={{ color:"hsla(192,100%,60%,0.4)" }}>
                {new Date(record.registeredAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <button onClick={()=>setShowDeepSearch(true)}
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-all"
                style={{border:"1.5px solid hsla(270,80%,65%,0.55)",background:"hsla(270,80%,55%,0.14)",color:"hsl(270,80%,78%)"}}>
                <Search className="w-3.5 h-3.5"/> DEEP SEARCH
              </button>
              {getCurrentUser()?.role === "admin" && (
                <button onClick={openEdit}
                  className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-all"
                  style={{border:"1.5px solid hsla(33,100%,52%,0.55)",background:"hsla(33,100%,52%,0.12)",color:"hsl(33,100%,70%)"}}>
                  <Pencil className="w-3.5 h-3.5"/> EDIT
                </button>
              )}
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-all"
                style={{border:"1.5px solid hsla(38,85%,55%,0.5)",background:"hsla(38,85%,55%,0.12)",color:"hsl(38,90%,70%)"}}>
                <Printer className="w-3.5 h-3.5"/> PRINT
              </button>
            </div>
          </div>
        </div>

        {/* ══ ROW 1: Personal + Contacts ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Sec icon={User} title={t("res_personal",lang)}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <F label={t("lbl_dob",lang)}    value={record.dateOfBirth}/>
              <F label="PLACE OF BIRTH"   value={record.placeOfBirth}/>
              <F label={t("lbl_nationality",lang)}      value={record.nationality}/>
              <F label="NATIONAL ID"      value={record.noNationalId?"NO NATIONAL ID":record.nationalId}/>
              <F label="BLOOD TYPE"       value={record.bloodType}/>
              <F label="MARITAL STATUS"   value={record.maritalStatus}/>
              <F label={t("lbl_gender",lang)}           value={record.gender}/>
              <F label="OCCUPATION"       value={record.occupation}/>
              <F label="NO. OF SIBLINGS"  value={(record as any).siblings}/>
              <F label="EMAIL"            value={record.email}/>
              <F label="PHONE NUMBER"     value={record.phoneNo}/>
              <F label="WHATSAPP"         value={(record as any).whatsapp}/>
              {record.address && <div className="col-span-2"><F label="ADDRESS" value={record.address}/></div>}
            </div>
          </Sec>
          <Sec icon={Globe} title={t("db_col_name",lang)}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <F label="FACEBOOK"    value={(record as any).facebook}/>
              <F label="INSTAGRAM"   value={(record as any).instagram}/>
              <F label="X / TWITTER" value={(record as any).twitter}/>
              <F label="LINKEDIN"    value={(record as any).linkedin}/>
            </div>
          </Sec>
        </div>

        {/* ══ ROW 2: Documents ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Sec icon={FileText} title="Passport">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {record.noPassport
                ? <div className="col-span-2"><F label="PASSPORT STATUS" value="NO PASSPORT ON RECORD" warn/></div>
                : <>
                    <F label="PASSPORT TYPE"    value={(record as any).passportType}/>
                    <F label="PASSPORT NO."     value={record.passportNo}/>
                    <F label="PLACE OF ISSUE"   value={record.passportPlaceOfIssue}/>
                    <F label="ISSUE DATE"       value={record.passportIssueDate}/>
                    <F label="EXPIRY DATE"      value={record.passportExpiryDate}/>
                    <F label="PASSPORT FILE"    value={record.passportFile||"—"}/>
                  </>}
            </div>
          </Sec>
          <Sec icon={Car} title="Driving License">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {record.noLicense
                ? <div className="col-span-2"><F label="LICENSE STATUS" value="NO LICENSE ON RECORD" warn/></div>
                : <>
                    <F label="LICENSE NO."      value={(record as any).licenseNo}/>
                    <F label="ISSUE DATE"       value={(record as any).licenseIssueDate}/>
                    <F label="EXPIRY DATE"      value={(record as any).licenseExpiryDate}/>
                    <F label="COUNTRY OF ISSUE" value={(record as any).licenseCountry}/>
                    <F label="LICENSE FILE"     value={record.drivingLicenseFile||"—"}/>
                  </>}
            </div>
          </Sec>
        </div>

        {/* ══ ROW 3: Family ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Sec icon={Heart} title={t("res_kin",lang)}>
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:"hsla(38,80%,65%,0.5)"}}>FATHER</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <F label="NAME"   value={record.fatherName}/>
                  <F label="PHONE"  value={record.fatherPhone}/>
                  <F label="STATUS" value={record.fatherDeceased?"DECEASED":"ALIVE"}/>
                </div>
              </div>
              <div className="pt-3 border-t" style={{borderColor:"hsla(38,50%,22%,0.3)"}}>
                <p className="font-mono text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:"hsla(38,80%,65%,0.5)"}}>MOTHER</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <F label="NAME"   value={record.motherName}/>
                  <F label="PHONE"  value={record.motherPhone}/>
                  <F label="STATUS" value={record.motherDeceased?"DECEASED":"ALIVE"}/>
                </div>
              </div>
            </div>
          </Sec>
          <Sec icon={Users} title="Next of Kin">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <F label={t("lbl_name",lang)}  value={record.kin1?`${record.kin1.name} ${record.kin1.surname}`:null}/>
              <F label="RELATION"   value={record.kin1?.relation}/>
              <F label="PHONE"      value={record.kin1?.phone}/>
              <F label="ADDRESS"    value={record.kin1?.address}/>
            </div>
          </Sec>
        </div>

        {/* ══ Emergency Contacts ══ */}
        <Sec icon={AlertTriangle} title={t("reg_emergency",lang)} accent="orange">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <F label="CONTACT 1 NAME"  value={record.emergencyContact1?.name}/>
            <F label="CONTACT 1 PHONE" value={record.emergencyContact1?.phone}/>
            <F label="CONTACT 2 NAME"  value={record.emergencyContact2?.name}/>
            <F label="CONTACT 2 PHONE" value={record.emergencyContact2?.phone}/>
          </div>
        </Sec>

        {/* ══ Education ══ */}
        <Sec icon={GraduationCap} title="Educational Record" accent="orange">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <F label="STUDENT STATUS"    value={record.isStudent?"CURRENTLY ENROLLED":"NOT ENROLLED"}/>
            <F label="INSTITUTION TYPE"  value={record.institutionType||"—"}/>
            <F label="LEVEL"             value={record.uniLevel?.toUpperCase()||"—"}/>
            <F label="INSTITUTION NAME"  value={record.institutionName||"—"}/>
            <F label="DEPARTMENT"        value={record.department||"—"}/>
            <F label="STUDENT NUMBER"    value={(record as any).studentNo||"—"}/>
            <F label="YEAR OF STUDY"     value={record.studyYear||"—"}/>
            <F label="ALUMNI STATUS"     value={record.isAlumni?"GRADUATED":"—"}/>
            <F label="GRADUATION LEVEL"  value={record.alumniRecord?.level?.toUpperCase()||"—"}/>
            {record.isAlumni&&<>
              <F label="ALUMNI UNIVERSITY"  value={record.alumniRecord?.universityName}/>
              <F label="ALUMNI DEPARTMENT"  value={record.alumniRecord?.department}/>
              <F label="ALUMNI START DATE"  value={record.alumniRecord?.startDate}/>
              <F label="ALUMNI END DATE"    value={record.alumniRecord?.endDate}/>
              <F label="ALUMNI GPA"         value={record.alumniRecord?.gpa}/>
            </>}
            {record.educationRecord&&<div className="col-span-2 md:col-span-4"><F label="PREVIOUS EDUCATION HISTORY" value={record.educationRecord}/></div>}
          </div>
        </Sec>

        {/* ══ Work ══ */}
        <Sec icon={Briefcase} title={t("reg_occupation",lang)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <F label="CURRENTLY WORKING" value={record.isCurrentlyWorking?"YES":"NO"}/>
            {record.isCurrentlyWorking&&<>
              <F label="COMPANY"    value={record.currentWorkInfo?.company}/>
              <F label="EMPLOYER"   value={record.currentWorkInfo?.employer}/>
              <F label="DEPARTMENT" value={record.currentWorkInfo?.department}/>
            </>}
            {record.workExperience&&<div className="col-span-2 md:col-span-4"><F label="PREVIOUS WORK EXPERIENCE" value={record.workExperience}/></div>}
          </div>
        </Sec>

        {/* ══ Health ══ */}
        <Sec icon={Heart} title="Health & Records">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <F label="HEALTH RECORD"              value={record.healthRecord}/>
            <F label="HISTORY OF PRESENT ILLNESS" value={(record as any).historyOfPresentIllness}/>
            <F label="CRIME RECORD"               value={record.crimeRecord}/>
            <F label="CRIME RECORD FILE"          value={(record as any).crimeRecordFile||"—"}/>
          </div>
        </Sec>

        {/* ══ Insurance ══ */}
        <Sec icon={Shield} title="Insurance">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {(record as any).noInsurance
              ? <div className="col-span-2 md:col-span-4"><F label="INSURANCE STATUS" value="NO INSURANCE ON RECORD" warn/></div>
              : <>
                  <F label="INSURANCE TYPE"    value={(record as any).insuranceType}/>
                  <F label="INSURANCE COMPANY" value={(record as any).insuranceCompany}/>
                  <F label="POLICY NUMBER"     value={(record as any).insurancePolicyNo}/>
                  <F label="VALIDITY DATE"     value={(record as any).insuranceValidityDate}/>
                  <F label="INSURANCE FILE"    value={(record as any).insuranceFile||"—"}/>
                </>}
          </div>
        </Sec>

        {/* ══ Biometrics ══ */}
        <div className="card-surface rounded-xl p-5" style={{ borderTop:"2px solid hsla(38,85%,55%,0.3)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="w-4 h-4 text-primary"/>
            <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:"hsl(38,85%,65%)" }}>BIOMETRIC DATA</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {record.fingerHashes
              ? [{label:"RIGHT THUMB",key:"rightThumb"},{label:"RIGHT INDEX FINGER",key:"rightIndex"},{label:"LEFT THUMB",key:"leftThumb"},{label:"LEFT INDEX FINGER",key:"leftIndex"}]
                .map(({label,key})=>(
                  <div key={key} className="text-center">
                    <Fingerprint className="w-8 h-8 mx-auto mb-2" style={{
                      color:record.fingerHashes?.[key as keyof typeof record.fingerHashes]?"hsl(38,85%,60%)":"hsla(192,80%,40%,0.3)",
                      filter:record.fingerHashes?.[key as keyof typeof record.fingerHashes]?"drop-shadow(0 0 8px hsla(38,85%,55%,0.5))":"none",
                    }}/>
                    <p className="font-mono text-[9px] font-bold tracking-wider mb-1" style={{ color:"hsla(38,80%,65%,0.5)" }}>{label}</p>
                    <p className="font-mono text-[10px] font-semibold" style={{ color:"hsl(38,85%,65%)" }}>{record.fingerHashes?.[key as keyof typeof record.fingerHashes]||"—"}</p>
                  </div>
                ))
              : <div className="col-span-4 flex items-center gap-4">
                  <Fingerprint className="w-8 h-8 text-primary"/>
                  <div>
                    <p className="font-mono text-[9px] tracking-widest mb-0.5" style={{ color:"hsla(38,80%,65%,0.5)" }}>FINGERPRINT HASH</p>
                    <p className="font-mono text-sm font-bold" style={{ color:"hsl(38,85%,65%)" }}>{record.fingerprintHash}</p>
                  </div>
                </div>}
          </div>
        </div>

        {/* ══ System Account ══ */}
        {(() => {
          const n = `${record.name} ${record.surname}`.toLowerCase();
          const linked = getUsers().find(u =>
            `${u.fullName}`.toLowerCase() === n ||
            u.fullName.toLowerCase().includes(record.name.toLowerCase()) && u.fullName.toLowerCase().includes(record.surname.toLowerCase())
          );
          if (!linked) return (
            <div className="card-surface rounded-xl p-5" style={{ borderTop:"2px solid hsla(195,100%,50%,0.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{color:"hsl(195,100%,60%)"}}/>
                <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:"hsl(195,100%,65%)" }}>SYSTEM ACCESS ACCOUNT</h2>
              </div>
              <p className="font-mono text-xs" style={{color:"hsla(195,70%,60%,0.45)"}}>No system account linked to this identity.</p>
            </div>
          );
          const roleColor = ROLE_COLORS[linked.role];
          return (
            <div className="card-surface rounded-xl p-5 print:hidden" style={{ borderTop:`2px solid hsla(195,100%,50%,0.35)` }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4" style={{color:"hsl(195,100%,65%)"}}/>
                <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:"hsl(195,100%,65%)" }}>SYSTEM ACCESS ACCOUNT</h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{background:linked.active?"#4ade80":"#6b7280",boxShadow:linked.active?"0 0 6px #4ade80":"none"}}/>
                  <span className="font-mono text-[10px] font-bold" style={{color:linked.active?"#4ade80":"#6b7280"}}>{linked.active?"ACTIVE":"DISABLED"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl print:hidden" style={{background:"hsla(195,100%,45%,0.07)",border:"1px solid hsla(195,100%,50%,0.2)"}}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-1" style={{color:"hsla(195,80%,65%,0.5)"}}>LOGIN USERNAME</p>
                  <p className="font-mono text-sm font-bold" style={{color:"hsl(195,100%,78%)"}}>@{linked.username}</p>
                </div>
                <div className="p-3 rounded-xl print:hidden" style={{background:"hsla(195,100%,45%,0.07)",border:"1px solid hsla(195,100%,50%,0.2)"}}>
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

export default ResultPage;
