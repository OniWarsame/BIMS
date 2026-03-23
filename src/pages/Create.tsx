import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Printer, Loader, RefreshCw } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getRecords, type BiometricRecord } from "@/lib/biometric-store";
import { buildDoc } from "@/lib/docBuilder";
import { getCurrentUser } from "@/pages/Login";

type DocCategory = "cv"|"contract"|"birth"|"personal"|"notary"|"visa";

interface Template { id:string; name:string; desc:string; preview:string; officialUrl?:string; }
interface Category {
  id:DocCategory; label:string; icon:string; color:string;
  bg:string; border:string; desc:string; templates:Template[];
}

const CATEGORIES:Category[] = [
  { id:"cv", label:"Curriculum Vitae", icon:"📄", color:"#60a5fa", bg:"rgba(96,165,250,0.22)", border:"rgba(96,165,250,0.8)", desc:"Professional resume from your biometric profile",
    templates:[
      {id:"cv-classic",   name:"Embassy & Government CV",  desc:"Formal single-column format accepted by embassies, consulates and government bodies worldwide.",     preview:"🏛️"},
      {id:"cv-modern",    name:"University Application",    desc:"Structured academic CV with photo panel — accepted by universities for MSc/PhD admissions.",          preview:"🎓"},
      {id:"cv-minimal",   name:"UN / International Org",    desc:"Clean typographic layout conforming to UN and international organisation standards.",                  preview:"🌐"},
      {id:"cv-technical", name:"Professional Engineer",     desc:"Competency-matrix format for engineering councils, visa sponsors and technical recruiters.",            preview:"⚙️"},
      {id:"cv-academic",  name:"Academic Research Profile", desc:"Publications, citations and research-first layout for academic appointments and grants.",              preview:"📚"},
      {id:"cv-executive", name:"Senior Executive / C-Suite", desc:"Board-level achievement CV with leadership summary — suitable for directorship applications.",       preview:"💼"},
    ]},
  { id:"contract", label:"Official Contract", icon:"📜", color:"#fb923c", bg:"rgba(251,146,60,0.22)", border:"rgba(251,146,60,0.8)", desc:"Contract templates with your personal details pre-filled",
    templates:[
      {id:"contract-employment", name:"Employment Contract",     desc:"Full employment agreement with probation, benefits and termination.",    preview:"💼"},
      {id:"contract-service",    name:"Service Agreement",       desc:"Professional services with deliverables, milestones and payment.",        preview:"🤝"},
      {id:"contract-nda",        name:"Non-Disclosure (NDA)",    desc:"Mutual or one-way confidentiality agreement for business use.",           preview:"🔒"},
      {id:"contract-freelance",  name:"Freelance Agreement",     desc:"Scope of work, rates, IP ownership and project terms.",                  preview:"🖊️"},
      {id:"contract-partnership",name:"Partnership Agreement",   desc:"Joint venture terms, profit sharing and decision-making rules.",          preview:"🤲"},
      {id:"contract-consulting", name:"Consulting Agreement",    desc:"Advisory services, retainer fees and deliverables.",                     preview:"📊"},
    ]},
  { id:"birth", label:"Certificate of Birth", icon:"🏛️", color:"#a78bfa", bg:"rgba(167,139,250,0.22)", border:"rgba(167,139,250,0.8)", desc:"Official-style birth certificate from biometric data",
    templates:[
      {id:"birth-official",  name:"Official Government Style", desc:"Full government format with registry seal and parent details.",  preview:"🏛️"},
      {id:"birth-modern",    name:"Modern Registry",           desc:"Contemporary civil registry format, clean and formal.",          preview:"📑"},
      {id:"birth-bilingual", name:"Bilingual Certificate",     desc:"Dual-language Arabic/English for international use.",            preview:"🌐"},
    ]},
  { id:"personal", label:"Personal Statement", icon:"✍️", color:"#34d399", bg:"rgba(52,211,153,0.22)", border:"rgba(52,211,153,0.8)", desc:"Compelling personal statements for applications",
    templates:[
      {id:"ps-academic",    name:"Academic Admission",    desc:"University and college application tailored to your academic background.", preview:"🎓"},
      {id:"ps-job",         name:"Job Application",       desc:"Cover letter using your work experience and skills.",                      preview:"👔"},
      {id:"ps-visa",        name:"Visa / Travel Letter",  desc:"Formal statement for embassies with travel purpose.",                      preview:"✈️"},
      {id:"ps-scholarship", name:"Scholarship Letter",    desc:"Financial aid application using your education and achievements.",         preview:"🏆"},
      {id:"ps-immigration", name:"Immigration Letter",    desc:"Residency or citizenship application support letter.",                     preview:"🌍"},
      {id:"ps-medical",     name:"Medical / Hospital",    desc:"Patient introductory statement and medical history summary.",              preview:"🏥"},
    ]},
  { id:"notary", label:"General Notary", icon:"⚖️", color:"#fbbf24", bg:"rgba(251,191,36,0.22)", border:"rgba(251,191,36,0.8)", desc:"Notarized document templates with your identity",
    templates:[
      {id:"notary-affidavit",   name:"Sworn Affidavit",       desc:"Legal sworn statement with full notary certification block.",         preview:"⚖️"},
      {id:"notary-power",       name:"Power of Attorney",     desc:"General or specific power of attorney with scope clauses.",           preview:"🖊️"},
      {id:"notary-declaration", name:"Statutory Declaration", desc:"Formal declaration with witness and commissioner blocks.",            preview:"📋"},
      {id:"notary-consent",     name:"Consent Letter",        desc:"Official consent for medical, travel, legal or personal matters.",    preview:"✅"},
      {id:"notary-deed",        name:"Deed of Assignment",    desc:"Transfer of rights, property or assets to another party.",           preview:"🏠"},
      {id:"notary-undertaking", name:"Letter of Undertaking", desc:"Formal commitment letter with binding obligations.",                 preview:"📜"},
    ]},
  { id:"rent" as any, label:"Rent Certificate", icon:"🏠", color:"#f472b6", bg:"rgba(244,114,182,0.22)", border:"rgba(244,114,182,0.8)", desc:"Rental agreements and tenancy certificates",
    templates:[
      {id:"rent-tenancy",    name:"Tenancy Agreement",    desc:"Full residential tenancy contract with all legal terms.",          preview:"🏠"},
      {id:"rent-certificate",name:"Rent Certificate",     desc:"Official certificate confirming tenancy status.",                  preview:"📜"},
      {id:"rent-receipt",    name:"Rent Receipt",         desc:"Monthly rent payment receipt for record-keeping.",                 preview:"🧾"},
      {id:"rent-reference",  name:"Landlord Reference",   desc:"Reference letter from landlord confirming good standing.",         preview:"✉️"},
      {id:"rent-notice",     name:"Notice to Vacate",     desc:"Formal notice to terminate tenancy with legal notice period.",    preview:"📣"},
      {id:"rent-commercial", name:"Commercial Lease",     desc:"Business premises lease with commercial terms.",                  preview:"🏢"},
    ]},
  { id:"letter" as any, label:"To Whom It May Concern", icon:"✉️", color:"#818cf8", bg:"rgba(129,140,248,0.22)", border:"rgba(129,140,248,0.8)", desc:"Official letters addressed to any authority",
    templates:[
      {id:"letter-general",    name:"General Letter",          desc:"All-purpose formal letter for any recipient or authority.",       preview:"📄"},
      {id:"letter-employment", name:"Employment Verification", desc:"Letter confirming employment, salary band and start date.",       preview:"💼"},
      {id:"letter-character",  name:"Character Reference",     desc:"Personal character reference citing conduct and reputation.",     preview:"🌟"},
      {id:"letter-bank",       name:"Bank Introduction",       desc:"Formal letter introducing yourself to a financial institution.", preview:"🏦"},
      {id:"letter-income",     name:"Income Confirmation",     desc:"Confirming income level for rental or loan applications.",       preview:"💰"},
      {id:"letter-travel",     name:"Travel Authorization",    desc:"Letter authorizing travel on behalf of an organization.",        preview:"✈️"},
    ]},
  { id:"certificate" as any, label:"Certificate Letter", icon:"🎖️", color:"#2dd4bf", bg:"rgba(45,212,191,0.22)", border:"rgba(45,212,191,0.8)", desc:"Achievement, completion and recognition certificates",
    templates:[
      {id:"cert-completion",   name:"Certificate of Completion",   desc:"Formal course or training completion with institution details.", preview:"🎓"},
      {id:"cert-achievement",  name:"Certificate of Achievement",  desc:"Recognition of excellence in a specific field or activity.",    preview:"🏆"},
      {id:"cert-good-conduct", name:"Certificate of Good Conduct", desc:"Official statement of clean conduct and professional behaviour.",preview:"✅"},
      {id:"cert-residence",    name:"Certificate of Residence",    desc:"Confirming residential address for official purposes.",         preview:"🏘️"},
      {id:"cert-employment",   name:"Certificate of Employment",   desc:"Formal proof of employment issued to an employee.",             preview:"💼"},
      {id:"cert-training",     name:"Training Certificate",        desc:"Awarded on completion of a specific training programme.",       preview:"📚"},
    ]},
  { id:"visa" as any, label:"Visa Application", icon:"🛂", color:"#f87171", bg:"rgba(248,113,113,0.22)", border:"rgba(248,113,113,0.75)", desc:"Official visa application forms pre-filled with your identity data",
    templates:[
      {id:"visa-usa",      name:"United States",   desc:"DS-160 · ceac.state.gov/GENNIV",        officialUrl:"https://ceac.state.gov/GENNIV/",          preview:"🇺🇸"},
      {id:"visa-uk",       name:"United Kingdom",  desc:"VAF1A · gov.uk/apply-uk-visa",             officialUrl:"https://www.gov.uk/apply-uk-visa",         preview:"🇬🇧"},
      {id:"visa-schengen", name:"Schengen / EU",   desc:"Annex I · Official Schengen Form",          officialUrl:"https://home-affairs.ec.europa.eu/system/files/2020-02/annex_i_-_application_form_en.pdf", preview:"🇪🇺"},
      {id:"visa-canada",   name:"Canada",          desc:"IMM 5257B · canada.ca",                    officialUrl:"https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm5257.html", preview:"🇨🇦"},
      {id:"visa-uae",      name:"UAE",             desc:"ICP Unified · icp.gov.ae",                 officialUrl:"https://icp.gov.ae/en/services/",            preview:"🇦🇪"},
      {id:"visa-egypt",    name:"Egypt",           desc:"Official Form · visa2egypt.gov.eg",         officialUrl:"https://www.visa2egypt.gov.eg/",             preview:"🇪🇬"},
      {id:"visa-turkey",   name:"Turkey",          desc:"e-Visa · evisa.gov.tr",                    officialUrl:"https://www.evisa.gov.tr/",                  preview:"🇹🇷"},
      {id:"visa-saudi",    name:"Saudi Arabia",    desc:"Official · visa.mofa.gov.sa",              officialUrl:"https://visa.mofa.gov.sa/",                  preview:"🇸🇦"},
      {id:"visa-india",    name:"India",           desc:"e-Visa · indianvisaonline.gov.in",          officialUrl:"https://indianvisaonline.gov.in/evisa/tvoa.html", preview:"🇮🇳"},
      {id:"visa-china",    name:"China",           desc:"V.2013 · visaforchina.cn",                 officialUrl:"https://www.visaforchina.cn/",               preview:"🇨🇳"},
      {id:"visa-malaysia", name:"Malaysia",        desc:"eVISA · windowmalaysia.com.my",            officialUrl:"https://www.windowmalaysia.com.my/evisa/eVisa.jsp", preview:"🇲🇾"},
      {id:"visa-ethiopia", name:"Ethiopia",        desc:"e-Visa · evisa.gov.et",                   officialUrl:"https://www.evisa.gov.et/",                  preview:"🇪🇹"},
      {id:"visa-somalia",  name:"Somalia",         desc:"Entry Visa · moi.gov.so",                 officialUrl:"https://www.moi.gov.so/",                    preview:"🇸🇴"},
    ]},
];

/* ═══════════════════════════════════════ COMPONENT */
const dimBorder = (b:string,a:string) => { const m=b.lastIndexOf(","); const rp=String.fromCharCode(41); return m<0?b:b.slice(0,m+1)+a+rp; };

export default function Create() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const [step,   setStep]   = useState<"categories"|"templates"|"result">("categories");
  const [selCat, setSelCat] = useState<Category|null>(null);
  const [selTpl, setSelTpl] = useState<Template|null>(null);
  const [record, setRecord] = useState<BiometricRecord|null>(null);
  const [output, setOutput] = useState("");
  const [allRecords, setAllRecords] = useState<BiometricRecord[]>([]);
  const [pickedId,   setPickedId]   = useState<string>("");

  useEffect(()=>{
    const recs = getRecords();
    setAllRecords(recs);
    if(!me) return;
    const n = me.fullName.trim().toLowerCase();
    const found = recs.find(r =>
      `${r.name} ${r.surname}`.toLowerCase()===n ||
      `${r.surname} ${r.name}`.toLowerCase()===n ||
      (n.includes(r.name.toLowerCase()) && n.includes(r.surname.toLowerCase()))
    );
    if(found){ setRecord(found); setPickedId(found.id); }
    else if(recs.length>0){ setRecord(recs[0]); setPickedId(recs[0].id); }
  },[]);

  const pickCategory = (cat:Category)=>{ setSelCat(cat); setStep("templates"); };

  const pickTemplate = (tpl:Template)=>{
    if(!record){
      alert("No biometric record found. Please register first via New Registration.");
      return;
    }
    setSelTpl(tpl);

    // Visa templates → open official government portal + show data helper
    if(selCat?.id === "visa" && tpl.officialUrl) {
      // Egypt: generate the actual official form pre-filled, + keep official URL button
      if(tpl.id === "visa-egypt") {
        try {
          const html = buildDoc("visa", tpl.id, record);
          setOutput(html||"");
        } catch(e) {
          setOutput("<p>Error generating document: "+(e as Error).message+"</p>");
        }
        setStep("result");
        return;
      }
      // Build a pre-fill reference sheet to help user fill the official form
      const r = record;
      const fullName = `${r.name} ${r.surname}`;
      const dob = r.dateOfBirth || "";
      const nationality = r.nationality || "";
      const passport = r.passportNumber || r.nationalId || "";
      const email = r.email || "";
      const phone = r.phoneNo || "";
      const address = [r.city, r.country].filter(Boolean).join(", ");

      const refHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Application Reference — ${tpl.name} Visa — ${fullName}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;color:#1a202c}
.header{background:linear-gradient(135deg,#1a3a5c,#0f2940);color:#fff;padding:20px 24px;border-radius:10px 10px 0 0}
.header h1{font-size:18px;font-weight:700;margin-bottom:4px}
.header p{font-size:12px;opacity:0.7}
.banner{background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:12px 16px;margin:16px 0;font-size:12px;color:#856404}
.banner strong{color:#533f03}
.btn{display:inline-block;padding:10px 22px;background:#1a3a5c;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;margin:4px}
.btn-green{background:#16803c}
.card{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:16px}
.card-header{background:#e8f0fe;padding:10px 16px;font-size:11px;font-weight:700;color:#1a3a5c;letter-spacing:0.08em;text-transform:uppercase}
.row{display:grid;grid-template-columns:1fr 1fr;gap:0}
.field{padding:10px 16px;border-bottom:1px solid #f0f0f0}
.field:nth-child(odd){border-right:1px solid #f0f0f0}
.label{font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2px}
.value{font-size:13px;font-weight:600;color:#1e293b}
.value.empty{color:#cbd5e1;font-style:italic}
.steps{background:#fff;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start}
.step-num{width:24px;height:24px;background:#1a3a5c;color:#fff;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.step-text{font-size:12px;color:#374151;line-height:1.5}
@media print{body{background:#fff;padding:12px}.btn{display:none}.banner{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="card">
<div class="header">
  <h1>${tpl.preview} ${tpl.name} Visa Application Reference</h1>
  <p>Pre-filled reference sheet · Generated from BIMS record ${r.id}</p>
</div>
<div style="padding:16px">
  <div class="banner">
    ⚠ <strong>IMPORTANT:</strong> This sheet contains your personal data to help you fill the <strong>official ${tpl.name} government visa portal</strong>.
    Do NOT submit this document — use it only as a reference while completing the real application online.
    Click the button below to open the official portal.
  </div>
  <div style="margin-bottom:16px">
    <a href="${tpl.officialUrl}" target="_blank" class="btn btn-green">🌐 Open Official ${tpl.name} Visa Portal</a>
    <button onclick="window.print()" class="btn" style="background:#475569">🖨 Print Reference Sheet</button>
  </div>
</div></div>

<div class="card">
  <div class="card-header">Personal Information</div>
  <div class="row">
    <div class="field"><div class="label">Full Name (as in passport)</div><div class="value">${fullName||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Date of Birth</div><div class="value">${dob||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Nationality</div><div class="value">${nationality||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Place of Birth</div><div class="value">${r.placeOfBirth||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Gender</div><div class="value">${r.gender||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Marital Status</div><div class="value">${r.maritalStatus||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Passport / ID Number</div><div class="value">${passport||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Occupation</div><div class="value">${r.occupation||"<span class='empty'>Not provided</span>"}</div></div>
  </div>
</div>

<div class="card">
  <div class="card-header">Contact &amp; Address</div>
  <div class="row">
    <div class="field"><div class="label">Email Address</div><div class="value">${email||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Phone Number</div><div class="value">${phone||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Current Address</div><div class="value">${address||"<span class='empty'>Not provided</span>"}</div></div>
    <div class="field"><div class="label">Country of Residence</div><div class="value">${r.country||"<span class='empty'>Not provided</span>"}</div></div>
  </div>
</div>

<div class="steps">
  <div class="card-header" style="background:none;padding:0 0 12px">How to apply</div>
  <div class="step"><div class="step-num">1</div><div class="step-text">Click <strong>"Open Official ${tpl.name} Visa Portal"</strong> above to go to the real government website.</div></div>
  <div class="step"><div class="step-num">2</div><div class="step-text">Create an account or log in on the official portal.</div></div>
  <div class="step"><div class="step-num">3</div><div class="step-text">Use the personal data shown in this reference sheet to fill the application form accurately.</div></div>
  <div class="step"><div class="step-num">4</div><div class="step-text">Upload required supporting documents (passport scan, photo, financial proof, etc.).</div></div>
  <div class="step"><div class="step-num">5</div><div class="step-text">Pay the visa fee on the official portal and submit your application.</div></div>
</div>
</body></html>`;

      const printWin = window.open("", "_blank", "width=860,height=700");
      if(printWin){
        printWin.document.write(refHtml);
        printWin.document.close();
        printWin.focus();
      }
      setOutput(refHtml);
      setStep("result");
      return;
    }

    try {
      const html = buildDoc(selCat!.id as string, tpl.id, record);
      setOutput(html||"<p>Document generation failed. Please try again.</p>");
    } catch(e) {
      setOutput("<p>Error generating document: "+(e as Error).message+"</p>");
    }
    setStep("result");
  };

  const handleRecordChange = (id:string)=>{
    const r = allRecords.find(x=>x.id===id);
    if(r){ setRecord(r); setPickedId(id); }
  };

  const handleDownload = ()=>{
    const t = selTpl?.name + " — " + record?.name + " " + record?.surname;
    const css = "*{box-sizing:border-box}body{margin:0;background:#f5f5f5}@media print{body{background:#fff}}";
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>" + t +
      "<" + "/title><style>" + css + "<" + "/style><" + "/head><body>" + output + "<" + "/body><" + "/html>";
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([html],{type:"text/html"}));
    a.download=((selTpl?.name||"doc").replace(/\s+/g,"-"))+"_"+(record?.name||"")+"_"+(record?.surname||"")+".html";
    a.click();
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank", "width=900,height=750");
    if (!printWin) return;
    const css = [
      "* { box-sizing: border-box; margin: 0; padding: 0; }",
      "html, body { margin: 0 !important; padding: 0 !important; background: #fff; }",
      "body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a2e; }",
      /* Screen preview: minimal wrapper, no decorations */
      "@media screen {",
      "  body { padding: 20px; background: #f8f8f8; }",
      "  .doc-wrap { background: #fff; box-shadow: 0 2px 16px rgba(0,0,0,0.1); border-radius: 4px; padding: 32px; max-width: 860px; margin: 0 auto; }",
      "}",
      /* Print: pure document, exact page margins */
      "@media print {",
      "  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }",
      "  @page { margin: 12mm 15mm; size: A4; }",
      "  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
      "  .doc-wrap { padding: 0 !important; box-shadow: none !important; }",
      "  .no-print { display: none !important; }",
      "}",
    ].join("\n");
    const title = `${selTpl?.name || "Document"} — ${record?.name || ""} ${record?.surname || ""}`;
    const printBtn = `<div class="no-print" style="text-align:center;padding:12px 0 0;font-family:sans-serif;font-size:12px;color:#666"><button onclick="window.print()" style="padding:8px 20px;background:#1a3a5c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🖨 Print / Save as PDF</button>&nbsp;&nbsp;<button onclick="window.close()" style="padding:8px 16px;background:#e5e7eb;color:#333;border:none;border-radius:6px;cursor:pointer;font-size:12px">✕ Close</button></div>`;
    printWin.document.write(
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>" + title +
      "<" + "/title><style>" + css + "<" + "/style><" + "/head><body>" +
      printBtn +
      "<div class=\"doc-wrap\">" + output + "<" + "/div>" +
      "<" + "/body><" + "/html>"
    );
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 500);
  };

  const mono:React.CSSProperties={fontFamily:"'JetBrains Mono','Courier New',monospace"};
  const back=()=>{
    if(step==="categories") navigate("/");
    else if(step==="templates"){ setStep("categories"); setSelCat(null); }
    else { setStep("templates"); setSelTpl(null); setOutput(""); }
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",...mono}}>
      <CyberBackground/>

      {/* Custom header with smart back button */}
      <div style={{position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 24px",background:"rgba(0,5,18,0.68)",borderBottom:"1px solid rgba(0,200,255,0.12)",
        backdropFilter:"blur(48px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <motion.button onClick={back} whileHover={{scale:1.04,x:-2}} whileTap={{scale:0.97}}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:11,
              background:"rgba(0,200,255,0.09)",
              border:"1.5px solid rgba(0,200,255,0.3)",
              color:"rgba(0,220,255,0.9)",cursor:"pointer",transition:"all .18s"}}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background="rgba(0,200,255,0.18)";el.style.borderColor="rgba(0,230,255,0.55)";el.style.boxShadow="0 0 20px rgba(0,200,255,0.2)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background="rgba(0,200,255,0.09)";el.style.borderColor="rgba(0,200,255,0.3)";el.style.boxShadow="none";}}>
            <ArrowLeft style={{width:15,height:15}}/>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em"}}>
              {step==="result"?"← BACK TO TEMPLATES":step==="templates"?"← CATEGORIES":"← HOME"}
            </span>
          </motion.button>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:800,letterSpacing:"0.06em",color:"rgba(200,245,255,0.96)"}}>
              {step==="categories"?"CREATE FOR ME":step==="templates"?(selCat?.label.toUpperCase()||"SELECT TEMPLATE"):(selTpl?.name.toUpperCase()||"DOCUMENT READY")}
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,190,230,0.45)",marginTop:1,letterSpacing:"0.06em"}}>
              {step==="categories"?"SELECT DOCUMENT TYPE":step==="templates"?`← ${selCat?.label.toUpperCase() || "CATEGORY"}  ›  CHOOSE TEMPLATE`:`← ${selCat?.label.toUpperCase() || "TEMPLATES"}  ›  PREVIEW`}
            </div>
          </div>
        </div>
        {allRecords.length > 1 && (
          <select value={record?.id||""} onChange={e=>setRecord(allRecords.find(r=>r.id===e.target.value)||null)}
            className="input-cyber" style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
              letterSpacing:"0.08em",padding:"6px 12px",borderRadius:8,maxWidth:200}}>
            {allRecords.map(r=><option key={r.id} value={r.id}>{r.name} {r.surname}</option>)}
          </select>
        )}
      </div>
      <div style={{display:"none"}}>
      <PageHeader
        title={step==="categories"?"CREATE FOR ME":step==="templates"?(selCat?.label.toUpperCase()||"SELECT TEMPLATE"):(selTpl?.name.toUpperCase()||"DOCUMENT READY")}
        subtitle={step==="categories"?"SELECT DOCUMENT TYPE":step==="templates"?"CHOOSE A TEMPLATE":"PREVIEW & DOWNLOAD"}
        icon={<span style={{fontSize:15}}>✦</span>}
        rightContent={
          allRecords.length > 1 ? (
            <select value={record?.id||""} onChange={e=>setRecord(allRecords.find(r=>r.id===e.target.value)||null)}
              style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:700,letterSpacing:"0.1em",
                padding:"7px 12px",borderRadius:8,background:"hsla(215,55%,5%,0.9)",
                border:"1px solid hsla(192,100%,52%,0.35)",color:"hsl(192,100%,72%)",
                outline:"none",cursor:"pointer"}}>
              {allRecords.map(r=><option key={r.id} value={r.id}>{r.name} {r.surname}</option>)}
            </select>
          ) : undefined
        }
      />
      </div>
      <div style={{flex:1,padding:"24px 28px 72px",position:"relative",zIndex:1,maxWidth:1100,width:"100%",margin:"0 auto"}}>
        <AnimatePresence mode="wait">

          {/* ── CATEGORIES ── */}
          {step==="categories"&&(
            <motion.div key="cats" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}>
              <p style={{fontSize:12,color:"rgba(140,220,200,0.82)",letterSpacing:"0.1em",marginBottom:24}}>
                Documents are generated instantly using your biometric profile — no internet required
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
                {CATEGORIES.map((cat,i)=>(
                  <motion.div key={cat.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                    onClick={()=>pickCategory(cat)}
                    whileHover={{y:-5,scale:1.02}}
                    whileTap={{scale:.98}}
                    style={{
                      padding:"22px 20px",
                      borderRadius:16,
                      background:`linear-gradient(145deg,rgba(4,16,46,0.92),rgba(2,8,30,0.94))`,
                      border:`1px solid ${cat.border.replace("0.8","0.28")}`,
                      borderTop:`2px solid ${cat.border.replace("0.8","0.65")}`,
                      cursor:"pointer",
                      transition:"border-color .22s,box-shadow .22s",
                      boxShadow:`0 4px 24px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)`,
                      backdropFilter:"blur(22px)",
                      position:"relative" as const,overflow:"hidden",
                    }}
                    onMouseEnter={e=>{
                      const el=e.currentTarget as HTMLElement;
                      el.style.boxShadow=`0 12px 40px rgba(0,0,0,0.5),0 0 30px ${cat.border.replace("0.8","0.18")},inset 0 1px 0 rgba(255,255,255,0.09)`;
                    }}
                    onMouseLeave={e=>{
                      const el=e.currentTarget as HTMLElement;
                      el.style.boxShadow=`0 4px 24px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)`;
                    }}>
                    {/* Background glow accent */}
                    <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:`radial-gradient(circle,${cat.bg},transparent 70%)`,pointerEvents:"none"}}/>
                    {/* Circuit dots */}
                    <div style={{position:"absolute",inset:0,opacity:.07,backgroundImage:`radial-gradient(circle,${cat.color} 1px,transparent 1px)`,backgroundSize:"16px 16px",pointerEvents:"none"}}/>
                    {/* Icon in security frame */}
                    <div style={{
                      width:52,height:52,borderRadius:14,
                      background:`${cat.bg}`,
                      border:`1.5px solid ${cat.border.replace("0.8","0.5")}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:26,marginBottom:14,
                      boxShadow:`0 4px 16px ${cat.bg}, 0 0 20px ${cat.border.replace("0.8","0.2")}`,
                      position:"relative" as const,
                    }}>{cat.icon}</div>
                    {/* Label */}
                    <div style={{fontSize:14,fontWeight:700,letterSpacing:"0.04em",color:cat.color,marginBottom:5,fontFamily:"'Syne',sans-serif",textShadow:`0 0 20px ${cat.color}55`}}>{cat.label}</div>
                    <div style={{fontSize:11,color:`rgba(180,230,250,0.65)`,lineHeight:1.6,marginBottom:14}}>{cat.desc}</div>
                    {/* Template count badge */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",padding:"3px 10px",borderRadius:99,background:`${cat.color}18`,border:`1px solid ${cat.border.replace("0.8","0.45")}`,color:cat.color,fontFamily:"'JetBrains Mono',monospace"}}>{cat.templates.length} TEMPLATES</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TEMPLATES ── */}
          {step==="templates"&&selCat&&(
            <motion.div key="tpls" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,padding:"16px 20px",borderRadius:14,background:selCat.bg,border:`2px solid ${selCat.border}`,boxShadow:`0 4px 24px ${dimBorder(selCat.border,"0.2")}`}}>
                <span style={{fontSize:32}}>{selCat.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:700,color:selCat.color,letterSpacing:"0.1em"}}>{selCat.label.toUpperCase()}</div>
                  <div style={{fontSize:11,color:`${selCat.color}cc`,marginTop:2}}>{selCat.desc}</div>
                </div>
                {record&&<div style={{fontSize:11,color:`${selCat.color}cc`,textAlign:"right"}}>Generating for:<br/><strong style={{color:selCat.color}}>{record.name} {record.surname}</strong></div>}
              </div>

              {/* VISA — country card grid */}
              {(selCat.id as string)==="visa" ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
                  {selCat.templates.map((tpl,i)=>{
                    const CCOL:Record<string,{bg:string;border:string;accent:string;badge:string}> = {
                      "visa-usa":      {bg:"rgba(0,48,135,0.35)",   border:"rgba(60,120,255,0.9)",  accent:"#4a90ff", badge:"DS-160"},
                      "visa-uk":       {bg:"rgba(1,33,105,0.35)",   border:"rgba(80,130,255,0.9)",  accent:"#6699ff", badge:"VAF1A"},
                      "visa-schengen": {bg:"rgba(0,51,153,0.35)",   border:"rgba(100,140,255,0.9)", accent:"#7aabff", badge:"Annex I"},
                      "visa-canada":   {bg:"rgba(180,10,30,0.32)",  border:"rgba(255,80,80,0.9)",   accent:"#ff7070", badge:"IMM 5257B"},
                      "visa-uae":      {bg:"rgba(0,100,50,0.32)",   border:"rgba(0,220,120,0.9)",   accent:"#00e87a", badge:"ICP Unified"},
                      "visa-egypt":    {bg:"rgba(0,90,40,0.32)",    border:"rgba(0,200,100,0.9)",   accent:"#00c864", badge:"MOI Form"},
                      "visa-turkey":   {bg:"rgba(180,10,30,0.32)",  border:"rgba(255,100,100,0.9)", accent:"#ff8080", badge:"e-Visa"},
                      "visa-saudi":    {bg:"rgba(0,90,40,0.32)",    border:"rgba(0,210,110,0.9)",   accent:"#00d46e", badge:"MFA Form"},
                      "visa-india":    {bg:"rgba(200,80,0,0.30)",   border:"rgba(255,160,60,0.9)",  accent:"#ffaa40", badge:"e-Visa"},
                      "visa-china":    {bg:"rgba(180,10,10,0.32)",  border:"rgba(255,80,60,0.9)",   accent:"#ff6040", badge:"V.2013"},
                      "visa-malaysia": {bg:"rgba(180,10,10,0.30)",  border:"rgba(255,100,80,0.9)",  accent:"#ff7060", badge:"eVISA"},
                      "visa-ethiopia": {bg:"rgba(0,140,60,0.30)",   border:"rgba(0,220,120,0.9)",   accent:"#00dc78", badge:"e-Visa"},
                      "visa-somalia":  {bg:"rgba(20,80,200,0.32)",  border:"rgba(80,160,255,0.9)",  accent:"#66aaff", badge:"Entry Visa"},
                    };
                    const cc = CCOL[tpl.id]||{bg:"rgba(100,100,100,0.3)",border:"rgba(200,200,200,0.8)",accent:"#ccc",badge:"Visa"};
                    const lines = tpl.desc.split("\n");
                    return (
                      <motion.div key={tpl.id}
                        initial={{opacity:0,scale:0.9,y:16}} animate={{opacity:1,scale:1,y:0}} transition={{delay:i*0.04}}
                        style={{borderRadius:16,overflow:"hidden",border:`2px solid ${cc.border}`,background:cc.bg,cursor:"default",transition:"all 0.2s",position:"relative",backdropFilter:"blur(8px)"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-6px) scale(1.02)";(e.currentTarget as HTMLDivElement).style.boxShadow=`0 16px 40px ${cc.border.replace("0.9","0.4")}`;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="";(e.currentTarget as HTMLDivElement).style.boxShadow="";}}>
                        {/* Flag banner */}
                        <div style={{height:72,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${cc.bg},rgba(0,0,0,0.4))`,borderBottom:`1px solid ${cc.border}`,position:"relative"}}>
                          <span style={{fontSize:44,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.5))",lineHeight:1}}>{tpl.preview}</span>
                          <div style={{position:"absolute",top:6,right:8,fontSize:8,fontWeight:800,letterSpacing:"0.14em",padding:"2px 7px",borderRadius:5,background:cc.bg,border:`1px solid ${cc.border}`,color:cc.accent,fontFamily:"'Courier New',monospace"}}>{cc.badge}</div>
                        </div>
                        {/* Country info */}
                        <div style={{padding:"12px 14px 14px"}}>
                          <div style={{fontSize:15,fontWeight:800,color:cc.accent,letterSpacing:"0.06em",marginBottom:5,fontFamily:"'Courier New',monospace",textTransform:"uppercase" as const}}>{tpl.name}</div>
                          <div style={{fontSize:9.5,color:"rgba(220,220,220,0.8)",lineHeight:1.5,marginBottom:10}}>
                            <div style={{fontWeight:700,color:"rgba(255,255,255,0.9)"}}>{tpl.desc}</div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                            <div onClick={(e)=>{e.stopPropagation();pickTemplate(tpl);}}
                              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,background:`${cc.accent}18`,border:`1px solid ${cc.border}`,cursor:"pointer"}}>
                              <span style={{fontSize:11}}>📋</span>
                              <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:cc.accent,fontFamily:"'Courier New',monospace"}}>FILL WITH MY DATA</span>
                            </div>
                            {tpl.officialUrl && (
                              <a href={tpl.officialUrl} target="_blank" rel="noopener noreferrer"
                                onClick={(e)=>e.stopPropagation()}
                                style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,
                                  background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.18)",
                                  cursor:"pointer",textDecoration:"none"}}>
                                <span style={{fontSize:11}}>🌐</span>
                                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"rgba(255,255,255,0.75)",fontFamily:"'Courier New',monospace"}}>OPEN OFFICIAL FORM</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Normal template grid for all other categories */
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
                  {selCat.templates.map((tpl,i)=>(
                    <motion.div key={tpl.id} initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{delay:i*0.06}}
                      onClick={()=>pickTemplate(tpl)}
                      style={{borderRadius:14,overflow:"hidden",border:`2px solid ${selCat.border}`,background:selCat.bg,cursor:"pointer",transition:"all .2s",boxShadow:`0 4px 16px ${dimBorder(selCat.border,"0.15")}`}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)";(e.currentTarget as HTMLDivElement).style.boxShadow=`0 12px 36px ${dimBorder(selCat.border,"0.35")}`;(e.currentTarget as HTMLDivElement).style.borderColor=selCat.color;}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="";(e.currentTarget as HTMLDivElement).style.boxShadow=`0 4px 16px ${dimBorder(selCat.border,"0.15")}`;(e.currentTarget as HTMLDivElement).style.borderColor=selCat.border;}}>
                      <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",background:`${selCat.color}22`,borderBottom:`1px solid ${selCat.border}`,fontSize:42}}>{tpl.preview}</div>
                      <div style={{padding:"14px 16px"}}>
                        <div style={{fontSize:14,fontWeight:700,color:selCat.color,marginBottom:5,letterSpacing:"0.04em"}}>{tpl.name}</div>
                        <div style={{fontSize:11,color:`${selCat.color}cc`,lineHeight:1.6,marginBottom:12}}>{tpl.desc}</div>
                        <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,fontWeight:700,letterSpacing:"0.14em",padding:"5px 12px",borderRadius:7,background:`${selCat.color}22`,border:`1.5px solid ${selCat.border}`,color:selCat.color}}>✦ USE THIS TEMPLATE</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {step==="result"&&output&&(
            <motion.div key="result" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap" as const,gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{selCat?.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:selCat?.color,letterSpacing:"0.08em"}}>{selTpl?.name}</div>
                    <div style={{fontSize:10,color:`${selCat?.color}99`}}>{record?.name} {record?.surname} · {record?.id}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                  <button onClick={()=>{setStep("templates");setSelTpl(null);setOutput("");}}
                    style={{...mono,display:"flex",alignItems:"center",gap:7,fontSize:11,fontWeight:700,letterSpacing:"0.1em",padding:"10px 18px",borderRadius:10,
                      border:"1.5px solid rgba(0,200,255,0.35)",background:"rgba(0,180,255,0.08)",
                      color:"rgba(0,220,255,0.85)",cursor:"pointer",transition:"all .18s",fontFamily:"'Orbitron',sans-serif"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,190,255,0.18)";e.currentTarget.style.borderColor="rgba(0,220,255,0.6)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,180,255,0.08)";e.currentTarget.style.borderColor="rgba(0,200,255,0.35)";}}>
                    ← CHOOSE ANOTHER TEMPLATE
                  </button>
                  <button onClick={()=>pickTemplate(selTpl!)} style={{display:"flex",alignItems:"center",gap:5,...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",padding:"8px 14px",borderRadius:9,border:`1px solid ${selCat?.border}`,background:selCat?.bg,color:selCat?.color,cursor:"pointer"}}><RefreshCw size={11}/> REFRESH</button>
                  <button onClick={handleDownload} style={{display:"flex",alignItems:"center",gap:5,...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",padding:"8px 14px",borderRadius:9,border:`1.5px solid ${selCat?.border}`,background:selCat?.bg,color:selCat?.color,cursor:"pointer"}}><Download size={12}/> DOWNLOAD</button>
                  <button onClick={handlePrint} style={{display:"flex",alignItems:"center",gap:5,...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",padding:"8px 14px",borderRadius:9,border:"1.5px solid rgba(232,200,112,0.55)",background:"rgba(232,200,112,0.14)",color:"#f0dc90",cursor:"pointer"}}><Printer size={12}/> PRINT</button>
                  {/* Official portal link — shown for all visa types */}
                  {selCat?.id==="visa" && selTpl?.officialUrl && (
                    <a href={selTpl.officialUrl} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",gap:6,...mono,fontSize:10,fontWeight:700,
                        letterSpacing:"0.12em",padding:"8px 14px",borderRadius:9,
                        border:"1.5px solid rgba(52,211,153,0.55)",background:"rgba(52,211,153,0.12)",
                        color:"#6ee7b7",cursor:"pointer",textDecoration:"none"}}>
                      🌐 OFFICIAL PORTAL
                    </a>
                  )}
                </div>
              </div>
              <div style={{background:"#fff",color:"#1a1a2e",borderRadius:14,overflow:"hidden",border:`3px solid ${selCat?.border}`,boxShadow:`0 0 60px ${dimBorder(selCat?.border||"rgba(0,0,0,0.8)","0.25")},0 24px 60px rgba(0,0,0,0.5)`}}>
                <div style={{background:selCat?.bg,borderBottom:`2px solid ${selCat?.border}`,padding:"8px 20px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:selCat?.color}}/>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:selCat?.color,...mono}}>{selTpl?.name?.toUpperCase()} · {record?.name} {record?.surname}</span>
                </div>
                <div dangerouslySetInnerHTML={{__html:output}}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 32px",background:"rgba(8,15,30,0.92)",borderTop:"1px solid rgba(52,211,153,0.2)",...mono,fontSize:11,fontWeight:700}}>
        <span style={{color:"#6ee7b7"}}>BIMS v1.0 · © 2026&nbsp;<a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"#a7f3d0",textDecoration:"underline"}}>KUMI</a></span>
        <span style={{margin:"0 16px",width:4,height:4,borderRadius:"50%",background:"rgba(52,211,153,0.4)",display:"inline-block"}}/>
        <span style={{color:"hsl(165,80%,65%)"}}>DOCUMENT MODULE</span>
      </div>
    </div>
  );
}
