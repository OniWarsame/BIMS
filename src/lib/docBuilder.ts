import type { BiometricRecord } from "./biometric-store";

const S = {
  page: "font-family:Georgia,'Times New Roman',serif;max-width:780px;margin:0 auto;padding:0;color:#1a1a2e;line-height:1.7;",
  h2:   "font-size:1.1rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid currentColor;padding-bottom:6px;margin:28px 0 12px;",
  p:    "margin:0 0 10px;",
  table:"width:100%;border-collapse:collapse;margin:12px 0;font-size:0.88rem;",
  td:   "border:1px solid #ccc;padding:8px 12px;vertical-align:top;",
  th:   "border:1px solid #ccc;padding:8px 12px;background:#f0f0f0;font-weight:700;text-align:left;",
  sig:  "margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:40px;",
  sigB: "border-top:2px solid #333;padding-top:8px;font-size:0.85rem;",
};

const td2 = () => new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
const yr  = () => new Date().getFullYear();
const mkId = (r: BiometricRecord, tpl: string) => r.id + "-" + tpl.toUpperCase().replace(/-/g,"_") + "-" + yr();

/* ─── visa shared styles ─── */
const fld = "border:1px solid #999;padding:5px 8px;font-size:11px;width:100%;background:#fff;";
const lbl = "font-size:10px;font-weight:700;color:#333;letter-spacing:0.04em;display:block;margin-bottom:2px;text-transform:uppercase;";
const row2 = "display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;";
const row3 = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;";

function sh(accent: string) {
  return "background:" + accent + ";color:#fff;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;";
}

import { buildVisaDoc } from "./visaForms";
export { buildVisaDoc } from "./visaForms";

export function buildDoc(cat:string, tplId:string, r:BiometricRecord): string {
  const fn  = `${r.name} ${r.surname}`;
  const edu = r.educationRecord || "—";
  const wrk = r.workExperience  || "—";
  const cur = r.currentWorkInfo  ? `${r.currentWorkInfo.company}, ${r.currentWorkInfo.department}` : r.occupation||"—";
  const lng = (r.languages||[]).join(", ") || "—";
  const td  = td2();
  const did = mkId(r,tplId);

  /* ─── CV ─── */
  if(cat==="cv") {
    const isModern = tplId==="cv-modern";
    const isTech   = tplId==="cv-technical";

    const accent = isModern ? "#1a56db" : isTech ? "#0d9488" : "#1e3a5f";
    const hdr = `background:${accent};color:#fff;padding:36px 40px;margin:-1px;`;

    return `<div style="${S.page}">
      <div style="${hdr}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
          ${r.photo ? `<img src="${r.photo}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.5);flex-shrink:0;"/>` : `<div style="width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;border:3px solid rgba(255,255,255,0.5);flex-shrink:0;">${r.name.charAt(0)}</div>`}
          <div style="flex:1;">
            <div style="font-size:2.2rem;font-weight:700;line-height:1.1;margin-bottom:4px;">${fn}</div>
            <div style="font-size:1.1rem;opacity:0.85;margin-bottom:12px;">${r.occupation||"Professional"}</div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.82rem;opacity:0.9;">
              ${r.email?`<span>✉ ${r.email}</span>`:""}
              ${r.phoneNo?`<span>📞 ${r.phoneNo}</span>`:""}
              ${r.address?`<span>📍 ${r.address}</span>`:""}
              ${r.linkedin?`<span>in ${r.linkedin}</span>`:""}
            </div>
          </div>
        </div>
      </div>
      <div style="padding:32px 40px;">
        ${isModern ? `<div style="display:grid;grid-template-columns:1fr 2fr;gap:32px;">
          <div>
            <h2 style="${S.h2}color:${accent}">Profile</h2>
            <p style="${S.p}font-size:0.88rem;">${r.name} ${r.surname} — ${r.occupation||"professional"} with experience in ${wrk.split(".")[0]}.</p>
            <h2 style="${S.h2}color:${accent}">Details</h2>
            <div style="font-size:0.82rem;line-height:2;">
              <div><strong>DOB:</strong> ${r.dateOfBirth||"—"}</div>
              <div><strong>Gender:</strong> ${r.gender||"—"}</div>
              <div><strong>Nationality:</strong> ${r.nationality||"—"}</div>
              <div><strong>Marital:</strong> ${r.maritalStatus||"—"}</div>
              <div><strong>National ID:</strong> ${r.nationalId||"—"}</div>
              <div><strong>Passport:</strong> ${r.passportNo||"—"}</div>
              <div><strong>Blood Type:</strong> ${r.bloodType||"—"}</div>
            </div>
            <h2 style="${S.h2}color:${accent}">Languages</h2>
            <p style="font-size:0.85rem;">${lng}</p>
          </div>
          <div>
            <h2 style="${S.h2}color:${accent}">Education</h2>
            <p style="${S.p}font-size:0.88rem;">${edu}</p>
            ${r.isStudent?`<p style="font-size:0.85rem;"><strong>${r.institutionName||""}</strong> — ${r.department||""} (Year ${r.studyYear||""})</p>`:""}
            <h2 style="${S.h2}color:${accent}">Work Experience</h2>
            <p style="${S.p}font-size:0.88rem;">${wrk}</p>
            ${r.currentWorkInfo?`<p style="font-size:0.85rem;"><strong>Current:</strong> ${cur}</p>`:""}
            ${r.healthRecord?`<h2 style="${S.h2}color:${accent}">Health</h2><p style="font-size:0.85rem;">${r.healthRecord}</p>`:""}
          </div>
        </div>` : `
          <h2 style="${S.h2}color:${accent}">Professional Summary</h2>
          <p style="${S.p}">${r.name} ${r.surname} is a ${r.occupation||"qualified professional"} with extensive experience. ${wrk.split(".")[0]}.</p>
          <h2 style="${S.h2}color:${accent}">Contact Information</h2>
          <table style="${S.table}"><tr><td style="${S.td}"><strong>Email:</strong> ${r.email||"—"}</td><td style="${S.td}"><strong>Phone:</strong> ${r.phoneNo||"—"}</td></tr><tr><td style="${S.td}" colspan="2"><strong>Address:</strong> ${r.address||"—"}</td></tr></table>
          <h2 style="${S.h2}color:${accent}">Personal Details</h2>
          <table style="${S.table}"><tr><th style="${S.th}">Field</th><th style="${S.th}">Details</th></tr>
          <tr><td style="${S.td}">Date of Birth</td><td style="${S.td}">${r.dateOfBirth||"—"}</td></tr>
          <tr><td style="${S.td}">Place of Birth</td><td style="${S.td}">${r.placeOfBirth||"—"}</td></tr>
          <tr><td style="${S.td}">Gender</td><td style="${S.td}">${r.gender||"—"}</td></tr>
          <tr><td style="${S.td}">Nationality</td><td style="${S.td}">${r.nationality||"—"}</td></tr>
          <tr><td style="${S.td}">National ID</td><td style="${S.td}">${r.nationalId||"—"}</td></tr>
          <tr><td style="${S.td}">Marital Status</td><td style="${S.td}">${r.maritalStatus||"—"}</td></tr>
          <tr><td style="${S.td}">Blood Type</td><td style="${S.td}">${r.bloodType||"—"}</td></tr>
          <tr><td style="${S.td}">Languages</td><td style="${S.td}">${lng}</td></tr></table>
          <h2 style="${S.h2}color:${accent}">Education</h2>
          <p style="${S.p}">${edu}</p>
          ${r.isStudent?`<p><strong>Institution:</strong> ${r.institutionName||""} | <strong>Department:</strong> ${r.department||""} | <strong>Year:</strong> ${r.studyYear||""}</p>`:""}
          ${r.isAlumni?`<p><strong>Alumni:</strong> ${r.alumniRecord?.institution||""} — ${r.alumniRecord?.level||""} (${r.alumniRecord?.year||""})</p>`:""}
          <h2 style="${S.h2}color:${accent}">Work Experience</h2>
          <p style="${S.p}">${wrk}</p>
          ${r.currentWorkInfo?`<p><strong>Current Position:</strong> ${cur}</p>`:""}
          <h2 style="${S.h2}color:${accent}">Skills & Languages</h2>
          <p style="${S.p}">${lng}</p>
        `}
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:0.75rem;color:#888;text-align:center;">Document ID: ${did} · Generated: ${td}</div>
      </div>
    </div>`;
  }

  /* ─── CONTRACT ─── */
  if(cat==="contract") {
    const titles:Record<string,string> = {"contract-employment":"EMPLOYMENT CONTRACT","contract-service":"SERVICE AGREEMENT","contract-nda":"NON-DISCLOSURE AGREEMENT","contract-freelance":"FREELANCE / INDEPENDENT CONTRACTOR AGREEMENT"};
    const title = titles[tplId]||"OFFICIAL CONTRACT";
    return `<div style="${S.page}padding:48px;">
      <div style="text-align:center;border-bottom:3px double #1a1a2e;padding-bottom:24px;margin-bottom:32px;">
        <div style="font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;color:#666;margin-bottom:8px;">Official Document</div>
        <h1 style="${S.h1}font-size:1.8rem;letter-spacing:0.06em;">${title}</h1>
        <div style="font-size:0.85rem;color:#666;margin-top:8px;">Document No: ${did} · Effective Date: ${td}</div>
      </div>
      <h2 style="${S.h2}">Parties to this Agreement</h2>
      <table style="${S.table}">
        <tr><th style="${S.th}">Party</th><th style="${S.th}">Full Name</th><th style="${S.th}">ID / Passport</th><th style="${S.th}">Contact</th></tr>
        <tr><td style="${S.td}"><strong>PARTY A</strong><br/>(${tplId==="contract-employment"?"Employee":"Service Provider"})</td><td style="${S.td}"><strong>${fn}</strong><br/>${r.address||"—"}</td><td style="${S.td}">National ID: ${r.nationalId||"—"}<br/>Passport: ${r.passportNo||"—"}</td><td style="${S.td}">${r.email||"—"}<br/>${r.phoneNo||"—"}</td></tr>
        <tr><td style="${S.td}"><strong>PARTY B</strong><br/>(${tplId==="contract-employment"?"Employer":"Client"})</td><td style="${S.td}">[PARTY B FULL NAME]<br/>[PARTY B ADDRESS]</td><td style="${S.td}">[ID / REG. NO.]</td><td style="${S.td}">[EMAIL]<br/>[PHONE]</td></tr>
      </table>
      <h2 style="${S.h2}">1. Scope of ${tplId==="contract-nda"?"Confidentiality":"Engagement"}</h2>
      <p style="${S.p}">This Agreement is entered into on <strong>${td}</strong> between <strong>${fn}</strong> (Party A) and <strong>[PARTY B NAME]</strong> (Party B)${tplId==="contract-employment"?" for the purpose of establishing terms of employment.":" for the provision of professional services."}</p>
      ${tplId==="contract-employment"?`
      <h2 style="${S.h2}">2. Role & Responsibilities</h2>
      <p style="${S.p}">Party A shall be employed as <strong>${r.occupation||"[Position]"}</strong> and shall report to [Reporting Manager]. Responsibilities include those consistent with the role and any additional duties as assigned.</p>
      <h2 style="${S.h2}">3. Compensation</h2>
      <p style="${S.p}">Party B agrees to compensate Party A at a rate of <strong>[SALARY / RATE]</strong> per [month/hour], payable on [payment date]. All statutory deductions shall apply.</p>
      <h2 style="${S.h2}">4. Term</h2>
      <p style="${S.p}">This agreement commences on <strong>${td}</strong> and shall continue until terminated by either party with <strong>[NOTICE PERIOD]</strong> days written notice.</p>`:
      tplId==="contract-nda"?`
      <h2 style="${S.h2}">2. Confidential Information</h2>
      <p style="${S.p}">"Confidential Information" means any data or information that is proprietary to Party B and not generally known to the public, whether in tangible or intangible form.</p>
      <h2 style="${S.h2}">3. Obligations of Party A</h2>
      <p style="${S.p}"><strong>${fn}</strong> agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose any Confidential Information to third parties without prior written consent; (c) use Confidential Information solely for the purpose of the engagement.</p>
      <h2 style="${S.h2}">4. Duration</h2>
      <p style="${S.p}">These obligations shall remain in effect for a period of <strong>[DURATION]</strong> years from the date of this Agreement.</p>`:`
      <h2 style="${S.h2}">2. Services</h2>
      <p style="${S.p}">Party A agrees to provide the following services: <strong>[DESCRIPTION OF SERVICES]</strong> in a professional manner consistent with industry standards.</p>
      <h2 style="${S.h2}">3. Payment Terms</h2>
      <p style="${S.p}">Party B agrees to pay Party A the sum of <strong>[AMOUNT]</strong> upon [completion/milestones]. Payment shall be made within [NUMBER] days of invoice.</p>`}
      <h2 style="${S.h2}">5. Governing Law</h2>
      <p style="${S.p}">This Agreement shall be governed by and construed in accordance with the laws of <strong>${r.nationality||"[Applicable Jurisdiction]"}</strong>.</p>
      <h2 style="${S.h2}">6. Entire Agreement</h2>
      <p style="${S.p}">This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.</p>
      <div style="${S.sig}">
        <div>
          <div style="${S.sigB}"><strong>PARTY A: ${fn}</strong><br/>Signature: ___________________<br/>Date: ${td}<br/>ID: ${r.nationalId||r.passportNo||"—"}</div>
        </div>
        <div>
          <div style="${S.sigB}"><strong>PARTY B: [FULL NAME]</strong><br/>Signature: ___________________<br/>Date: ___________________<br/>ID: ___________________</div>
        </div>
      </div>
      <div style="margin-top:40px;padding:16px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;font-size:0.78rem;color:#888;text-align:center;">
        WITNESS 1: ___________________ · WITNESS 2: ___________________ · Notary: ___________________
      </div>
    </div>`;
  }

  /* ─── BIRTH CERTIFICATE ─── */
  if(cat==="birth") {
    const isBilingual = tplId==="birth-bilingual";
    return `<div style="${S.page}padding:40px;">
      <div style="border:4px double #1a1a2e;padding:40px;position:relative;">
        <div style="position:absolute;top:12px;left:12px;right:12px;bottom:12px;border:1px solid #c9a84c;pointer-events:none;"></div>
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:0.75rem;letter-spacing:0.3em;text-transform:uppercase;color:#888;margin-bottom:6px;">Republic of ${r.nationality||"[Country]"} — Civil Registry Office</div>
          <h1 style="font-size:2rem;font-weight:700;letter-spacing:0.1em;margin:0;color:#1a1a2e;">CERTIFICATE OF BIRTH</h1>
          ${isBilingual?`<div style="font-size:1.1rem;color:#555;margin-top:4px;">شهادة الميلاد / شهادة OLUMAK</div>`:""}
          <div style="width:80px;height:3px;background:#c9a84c;margin:12px auto;"></div>
          <div style="font-size:0.82rem;color:#666;">Certificate No: <strong>${did}</strong> · Registered: ${td}</div>
        </div>
        <p style="text-align:center;font-size:1rem;margin-bottom:24px;font-style:italic;">This is to certify that the following person was duly born and their birth has been registered in the Civil Registry of ${r.nationality||"[Country]"}.</p>
        <table style="${S.table}font-size:0.9rem;">
          <tr style="background:#f8f4e8;"><th style="${S.th}background:#1a1a2e;color:#fff;font-size:0.75rem;letter-spacing:0.1em;" colspan="2">PERSONAL PARTICULARS / البيانات الشخصية</th></tr>
          <tr><td style="${S.td}background:#fafafa;width:40%;"><strong>Full Name</strong>${isBilingual?"<br/>الاسم الكامل":""}</td><td style="${S.td}font-size:1.05rem;"><strong>${fn}</strong></td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Date of Birth</strong>${isBilingual?"<br/>تاريخ الميلاد":""}</td><td style="${S.td}">${r.dateOfBirth||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Place of Birth</strong>${isBilingual?"<br/>مكان الميلاد":""}</td><td style="${S.td}">${r.placeOfBirth||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Gender / Sex</strong>${isBilingual?"<br/>الجنس":""}</td><td style="${S.td}">${r.gender||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Nationality</strong>${isBilingual?"<br/>الجنسية":""}</td><td style="${S.td}">${r.nationality||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>National ID No.</strong></td><td style="${S.td}">${r.nationalId||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Blood Type</strong></td><td style="${S.td}">${r.bloodType||"—"}</td></tr>
          <tr style="background:#f8f4e8;"><th style="${S.th}background:#1a1a2e;color:#fff;font-size:0.75rem;letter-spacing:0.1em;" colspan="2">PARENTAL INFORMATION</th></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Father's Name</strong></td><td style="${S.td}">${r.fatherName||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Mother's Name</strong></td><td style="${S.td}">${r.motherName||"—"}</td></tr>
          <tr><td style="${S.td}background:#fafafa;"><strong>Address</strong></td><td style="${S.td}">${r.address||"—"}</td></tr>
        </table>
        <div style="${S.sig}margin-top:40px;">
          <div style="${S.sigB}text-align:center;"><strong>Registrar / المسجل</strong><br/><br/>___________________________<br/>Name: [REGISTRAR NAME]<br/>Date: ${td}</div>
          <div style="${S.sigB}text-align:center;"><strong>OFFICIAL SEAL / الختم الرسمي</strong><br/><br/><div style="width:100px;height:100px;border:2px solid #888;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#999;text-align:center;">OFFICIAL<br/>SEAL</div></div>
        </div>
      </div>
    </div>`;
  }

  /* ─── PERSONAL STATEMENT ─── */
  if(cat==="personal") {
    const subj:Record<string,{to:string;re:string}> = {
      "ps-academic":   {to:"The Admissions Committee",                    re:"Application for Academic Admission"},
      "ps-job":        {to:"The Hiring Manager / Recruitment Team",       re:`Application for ${r.occupation||"[Position]"}`},
      "ps-visa":       {to:"The Visa Officer / Embassy",                  re:"Personal Statement in Support of Visa Application"},
      "ps-scholarship":{to:"The Scholarship Selection Committee",         re:"Scholarship Application — Personal Statement"},
    };
    const s = subj[tplId]||{to:"To Whom It May Concern",re:"Personal Statement"};
    return `<div style="${S.page}padding:48px;">
      <div style="border-left:5px solid #1a56db;padding-left:20px;margin-bottom:32px;">
        <div style="font-size:0.8rem;color:#888;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">Personal Statement</div>
        <h1 style="font-size:1.6rem;font-weight:700;margin:0;">${s.re}</h1>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:32px;font-size:0.88rem;">
        <div><strong>${fn}</strong><br/>${r.address||"—"}<br/>${r.phoneNo||"—"}<br/>${r.email||"—"}</div>
        <div style="text-align:right;">${td}<br/><br/><strong>${s.to}</strong></div>
      </div>
      <p style="${S.p}"><strong>Dear ${s.to},</strong></p>
      <p style="${S.p}">My name is <strong>${fn}</strong>, a ${r.nationality||""} national born on ${r.dateOfBirth||""} in ${r.placeOfBirth||""}. I am writing to present myself as a candidate and to share the experiences, qualifications, and motivations that define my professional journey.</p>
      <p style="${S.p}">Educationally, ${edu}. ${r.isStudent?`I am currently enrolled at <strong>${r.institutionName||"[Institution]"}</strong>, studying ${r.department||"[Field]"} in Year ${r.studyYear||""}.`:""} ${r.isAlumni?`As an alumnus of ${r.alumniRecord?.institution||"[Institution]"}, I completed my ${r.alumniRecord?.level||""} studies in ${r.alumniRecord?.year||""}.`:""}</p>
      <p style="${S.p}">Professionally, ${wrk}. ${r.currentWorkInfo?`My current role at <strong>${r.currentWorkInfo.company}</strong> in the ${r.currentWorkInfo.department} department has equipped me with practical expertise and leadership experience.`:""}</p>
      ${tplId==="ps-visa"?`<p style="${S.p}">The purpose of my travel is [PURPOSE OF TRAVEL]. I will be staying at [ACCOMMODATION ADDRESS] from [ARRIVAL DATE] to [DEPARTURE DATE]. I have sufficient financial means to support myself during my stay and strong ties to my home country that ensure my return.</p>`:""}
      ${tplId==="ps-scholarship"?`<p style="${S.p}">I am deeply committed to academic excellence and professional development. The financial support provided by this scholarship would enable me to fully dedicate myself to my studies and research without financial constraints, allowing me to contribute meaningfully to [FIELD OF STUDY].</p>`:""}
      <p style="${S.p}">My proficiency in ${lng} enables me to communicate effectively across diverse cultural settings, a skill I consider invaluable in today's interconnected world.</p>
      <p style="${S.p}">I am confident that my background, skills, and determination make me a strong candidate. I welcome the opportunity to discuss my application further and am available at the contact details provided above.</p>
      <p style="${S.p}">Yours sincerely,</p>
      <div style="margin-top:40px;">
        <div style="border-top:2px solid #1a1a2e;width:220px;padding-top:8px;">
          <strong>${fn}</strong><br/>
          ${r.nationalId?`ID: ${r.nationalId}<br/>`:""}${r.passportNo?`Passport: ${r.passportNo}<br/>`:""}
          ${td}
        </div>
      </div>
      <div style="margin-top:24px;padding:12px 16px;background:#f9f9f9;border:1px solid #ddd;font-size:0.78rem;color:#888;">Document ID: ${did}</div>
    </div>`;
  }

  /* ─── NOTARY ─── */
  if(cat==="notary") {
    const titles:Record<string,string> = {"notary-affidavit":"SWORN AFFIDAVIT","notary-power":"POWER OF ATTORNEY","notary-declaration":"STATUTORY DECLARATION","notary-consent":"CONSENT LETTER"};
    const title = titles[tplId]||"NOTARIZED DOCUMENT";
    return `<div style="${S.page}padding:48px;">
      <div style="text-align:center;border-bottom:3px solid #1a1a2e;padding-bottom:24px;margin-bottom:32px;">
        <div style="font-size:0.75rem;letter-spacing:0.25em;text-transform:uppercase;color:#888;">Republic of ${r.nationality||"[Country]"} — Notary Public Office</div>
        <h1 style="font-size:1.8rem;font-weight:700;letter-spacing:0.08em;margin:8px 0;">${title}</h1>
        <div style="font-size:0.82rem;color:#666;">Ref No: ${did} · Date: ${td}</div>
      </div>

      <table style="${S.table}margin-bottom:28px;">
        <tr><th style="${S.th}background:#1a1a2e;color:#fff;" colspan="2">DECLARANT IDENTITY</th></tr>
        <tr><td style="${S.td}width:35%;background:#fafafa;"><strong>Full Name</strong></td><td style="${S.td}"><strong>${fn}</strong></td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Date of Birth</strong></td><td style="${S.td}">${r.dateOfBirth||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Place of Birth</strong></td><td style="${S.td}">${r.placeOfBirth||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Nationality</strong></td><td style="${S.td}">${r.nationality||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>National ID</strong></td><td style="${S.td}">${r.nationalId||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Passport No.</strong></td><td style="${S.td}">${r.passportNo||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Address</strong></td><td style="${S.td}">${r.address||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Phone / Email</strong></td><td style="${S.td}">${r.phoneNo||"—"} / ${r.email||"—"}</td></tr>
      </table>

      ${tplId==="notary-affidavit"?`
      <h2 style="${S.h2}">Declaration</h2>
      <p style="${S.p}">I, <strong>${fn}</strong>, National ID <strong>${r.nationalId||"[ID]"}</strong>, residing at <strong>${r.address||"[Address]"}</strong>, being of sound mind and legal age, do hereby solemnly swear and affirm that:</p>
      <ol style="margin:12px 0;padding-left:24px;line-height:2;">
        <li>I am the person described above and all information provided herein is true and correct to the best of my knowledge.</li>
        <li>[STATEMENT OF FACTS — to be completed by declarant]</li>
        <li>[ADDITIONAL STATEMENT — if required]</li>
        <li>I understand that this affidavit may be used in legal proceedings and I am liable for any false statements made herein.</li>
      </ol>`:
      tplId==="notary-power"?`
      <h2 style="${S.h2}">Grant of Authority</h2>
      <p style="${S.p}">I, <strong>${fn}</strong>, hereby appoint <strong>[ATTORNEY FULL NAME]</strong>, residing at <strong>[ATTORNEY ADDRESS]</strong>, as my true and lawful Attorney-in-Fact to act on my behalf in all matters relating to:</p>
      <ul style="margin:12px 0;padding-left:24px;line-height:2;"><li>[SPECIFIC AUTHORITY 1]</li><li>[SPECIFIC AUTHORITY 2]</li><li>[SPECIFIC AUTHORITY 3]</li></ul>
      <p style="${S.p}">This Power of Attorney shall remain in effect until revoked in writing and shall be valid from <strong>${td}</strong>.</p>`:
      tplId==="notary-consent"?`
      <h2 style="${S.h2}">Statement of Consent</h2>
      <p style="${S.p}">I, <strong>${fn}</strong>, National ID <strong>${r.nationalId||"[ID]"}</strong>, hereby freely and voluntarily give my consent for:</p>
      <p style="${S.p}"><strong>[PURPOSE OF CONSENT — to be completed]</strong></p>
      <p style="${S.p}">I understand the nature and implications of this consent and confirm it is given without duress or coercion.</p>`:`
      <h2 style="${S.h2}">Statutory Declaration</h2>
      <p style="${S.p}">I, <strong>${fn}</strong>, do solemnly and sincerely declare that:</p>
      <ol style="margin:12px 0;padding-left:24px;line-height:2;">
        <li>I am a ${r.nationality||""} national, born on ${r.dateOfBirth||""} at ${r.placeOfBirth||""}.</li>
        <li>[DECLARATION STATEMENT — to be completed]</li>
        <li>I make this declaration conscientiously believing the same to be true.</li>
      </ol>`}

      <h2 style="${S.h2}">Certification Block</h2>
      <div style="border:2px solid #1a1a2e;padding:20px;margin:16px 0;">
        <p style="${S.p}font-size:0.85rem;">Sworn / Declared before me at <strong>${r.address?.split(",").pop()||"[City]"}</strong> on this <strong>${td}</strong></p>
        <div style="${S.sig}margin-top:24px;">
          <div style="${S.sigB}"><strong>DECLARANT</strong><br/>${fn}<br/>Signature: ___________________<br/>Date: ${td}</div>
          <div style="${S.sigB}"><strong>NOTARY PUBLIC / COMMISSIONER</strong><br/>Name: ___________________<br/>Signature: ___________________<br/>Reg. No.: ___________________</div>
        </div>
      </div>
      <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:0.8rem;">
        <div style="border:1px solid #ddd;padding:12px;border-radius:4px;"><strong>WITNESS 1:</strong><br/>Name: ___________________<br/>Signature: ___________________<br/>ID: ___________________</div>
        <div style="border:1px solid #ddd;padding:12px;border-radius:4px;"><strong>WITNESS 2:</strong><br/>Name: ___________________<br/>Signature: ___________________<br/>ID: ___________________</div>
      </div>
      <div style="margin-top:24px;text-align:center;font-size:0.75rem;color:#888;">Document ID: ${did} · This document was prepared using BIMS · Any false declaration is a criminal offence.</div>
    </div>`;
  }

  /* ─── RENT CERTIFICATE ─── */
  if((cat as string)==="rent") {
    const titles:Record<string,string> = {"rent-tenancy":"TENANCY AGREEMENT","rent-certificate":"RENT CERTIFICATE","rent-receipt":"RENT RECEIPT","rent-reference":"LANDLORD REFERENCE LETTER"};
    const title = titles[tplId]||"RENT CERTIFICATE";
    return `<div style="${S.page}padding:48px;">
      <div style="text-align:center;border-bottom:3px double #1a1a2e;padding-bottom:24px;margin-bottom:32px;">
        <div style="font-size:0.75rem;letter-spacing:0.25em;text-transform:uppercase;color:#888;margin-bottom:6px;">Official Tenancy Document</div>
        <h1 style="font-size:1.8rem;font-weight:700;letter-spacing:0.06em;margin:0;">${title}</h1>
        <div style="font-size:0.82rem;color:#666;margin-top:8px;">Ref: ${did} · Date: ${td}</div>
      </div>
      <table style="${S.table}margin-bottom:28px;">
        <tr><th style="${S.th}background:#1a1a2e;color:#fff;" colspan="2">TENANT DETAILS</th></tr>
        <tr><td style="${S.td}width:35%;background:#fafafa;"><strong>Full Name</strong></td><td style="${S.td}"><strong>${fn}</strong></td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Date of Birth</strong></td><td style="${S.td}">${r.dateOfBirth||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Nationality</strong></td><td style="${S.td}">${r.nationality||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>National ID</strong></td><td style="${S.td}">${r.nationalId||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Passport No.</strong></td><td style="${S.td}">${r.passportNo||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Email</strong></td><td style="${S.td}">${r.email||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Phone</strong></td><td style="${S.td}">${r.phoneNo||"—"}</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Permanent Address</strong></td><td style="${S.td}">${r.address||"—"}</td></tr>
      </table>
      <table style="${S.table}margin-bottom:28px;">
        <tr><th style="${S.th}background:#1a1a2e;color:#fff;" colspan="2">PROPERTY & LANDLORD DETAILS</th></tr>
        <tr><td style="${S.td}width:35%;background:#fafafa;"><strong>Property Address</strong></td><td style="${S.td}">[RENTAL PROPERTY ADDRESS]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Landlord Full Name</strong></td><td style="${S.td}">[LANDLORD NAME]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Landlord Contact</strong></td><td style="${S.td}">[LANDLORD PHONE / EMAIL]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Tenancy Start Date</strong></td><td style="${S.td}">[START DATE]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Tenancy End Date</strong></td><td style="${S.td}">[END DATE]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Monthly Rent</strong></td><td style="${S.td}">[AMOUNT] [CURRENCY]</td></tr>
        <tr><td style="${S.td}background:#fafafa;"><strong>Security Deposit</strong></td><td style="${S.td}">[DEPOSIT AMOUNT]</td></tr>
      </table>
      ${tplId==="rent-certificate"?`
      <div style="background:#f8f8f8;border:1px solid #ddd;padding:20px;border-radius:4px;margin-bottom:24px;">
        <p style="${S.p}font-style:italic;">This is to certify that <strong>${fn}</strong> (ID: ${r.nationalId||"—"}) has been a tenant at the above-mentioned property since <strong>[START DATE]</strong> and continues to reside therein. All rent payments have been made regularly and in full.</p>
      </div>`:""}
      <h2 style="${S.h2}">Terms & Conditions</h2>
      <ol style="margin:12px 0;padding-left:24px;line-height:2;font-size:0.88rem;">
        <li>The tenant agrees to pay rent on the agreed date each month.</li>
        <li>The property shall be used for residential purposes only.</li>
        <li>The tenant shall maintain the property in good condition.</li>
        <li>Either party may terminate this agreement with [NOTICE PERIOD] days written notice.</li>
        <li>Any alterations require written consent from the landlord.</li>
      </ol>
      <div style="${S.sig}">
        <div style="${S.sigB}"><strong>TENANT: ${fn}</strong><br/>Signature: ___________________<br/>Date: ${td}<br/>ID: ${r.nationalId||"—"}</div>
        <div style="${S.sigB}"><strong>LANDLORD: [NAME]</strong><br/>Signature: ___________________<br/>Date: ___________________<br/>Contact: ___________________</div>
      </div>
      <div style="margin-top:24px;text-align:center;font-size:0.75rem;color:#888;">Document ID: ${did} · This document is legally binding once signed by both parties.</div>
    </div>`;
  }

  /* ─── TO WHOM IT MAY CONCERN ─── */
  if((cat as string)==="letter") {
    const subjects:Record<string,{title:string;body:string}> = {
      "letter-general": {title:"TO WHOM IT MAY CONCERN",body:`I am writing to confirm that <strong>${fn}</strong>, holder of National ID <strong>${r.nationalId||"[ID]"}</strong> and Passport No. <strong>${r.passportNo||"[Passport]"}</strong>, is known to me and I can confirm the accuracy of the personal details provided herein. [BODY OF LETTER — to be customised]`},
      "letter-employment": {title:"EMPLOYMENT VERIFICATION LETTER",body:`This is to certify that <strong>${fn}</strong> is currently employed as <strong>${r.occupation||"[Position]"}</strong>${r.currentWorkInfo?` at <strong>${r.currentWorkInfo.company}</strong> in the ${r.currentWorkInfo.department} department`:""} and has been in this capacity since [START DATE]. The holder is in good standing with their employer.`},
      "letter-character": {title:"CHARACTER REFERENCE LETTER",body:`I am pleased to provide this character reference for <strong>${fn}</strong>, whom I have known for [DURATION]. During this time, I have found them to be a person of strong character, integrity, and reliability. They are honest, dependable, and demonstrate excellent moral values in all aspects of their personal and professional life.`},
      "letter-bank": {title:"BANK INTRODUCTION LETTER",body:`I, <strong>${fn}</strong> (National ID: ${r.nationalId||"—"}, Passport: ${r.passportNo||"—"}), residing at ${r.address||"[Address]"}, hereby introduce myself for the purpose of [OPENING AN ACCOUNT / FINANCIAL TRANSACTION]. I am a ${r.nationality||""} national currently working as ${r.occupation||"[Occupation]"}.`},
    };
    const s = subjects[tplId]||subjects["letter-general"];
    return `<div style="${S.page}padding:48px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:32px;font-size:0.85rem;">
        <div><strong>${fn}</strong><br/>${r.address||"—"}<br/>${r.phoneNo||"—"}<br/>${r.email||"—"}</div>
        <div style="text-align:right;">${td}<br/>Ref: ${did}</div>
      </div>
      <div style="margin-bottom:20px;"><strong>To Whom It May Concern,</strong></div>
      <h1 style="font-size:1.5rem;font-weight:700;border-bottom:3px solid #1a1a2e;padding-bottom:10px;margin-bottom:24px;">${s.title}</h1>
      <p style="${S.p}">${s.body}</p>
      <p style="${S.p}">[ADDITIONAL INFORMATION AS REQUIRED]</p>
      <p style="${S.p}">I confirm that all information provided in this letter is true and accurate to the best of my knowledge. Should you require any further information, please do not hesitate to contact me at the details provided above.</p>
      <p style="${S.p}margin-top:24px;">Yours faithfully,</p>
      <div style="margin-top:36px;border-top:2px solid #1a1a2e;width:220px;padding-top:8px;font-size:0.85rem;">
        <strong>${fn}</strong><br/>
        ${r.nationalId?`ID: ${r.nationalId}<br/>`:""}${r.passportNo?`Passport: ${r.passportNo}<br/>`:""}${td}
      </div>
      <div style="margin-top:32px;padding:14px;background:#f9f9f9;border:1px solid #ddd;font-size:0.75rem;color:#888;text-align:center;">Document ID: ${did}</div>
    </div>`;
  }

  /* ─── CERTIFICATE LETTER ─── */
  if((cat as string)==="certificate") {
    const certs:Record<string,{title:string;sub:string;body:string}> = {
      "cert-completion":   {title:"CERTIFICATE OF COMPLETION",  sub:"This is to certify that",  body:`has successfully completed <strong>[COURSE / PROGRAMME NAME]</strong> from <strong>[INSTITUTION]</strong>. The programme spanned <strong>[DURATION]</strong> and covered [TOPICS / MODULES].`},
      "cert-achievement":  {title:"CERTIFICATE OF ACHIEVEMENT", sub:"This certificate is awarded to", body:`in recognition of outstanding achievement in <strong>[FIELD / AREA]</strong>. This honour is bestowed in acknowledgement of exceptional performance and dedication.`},
      "cert-good-conduct": {title:"CERTIFICATE OF GOOD CONDUCT", sub:"This is to certify that", body:`has maintained exemplary conduct and behaviour throughout their tenure at <strong>[ORGANISATION / INSTITUTION]</strong>. No disciplinary actions have been recorded against them.`},
      "cert-residence":    {title:"CERTIFICATE OF RESIDENCE",   sub:"This is to certify that", body:`is a resident of <strong>${r.address||"[Address]"}</strong> and has resided at this address since <strong>[DATE]</strong>. This certificate is issued for official purposes.`},
    };
    const c = certs[tplId]||certs["cert-completion"];
    const accent="#1a3a6e";
    return `<div style="${S.page}padding:0;">
      <div style="background:${accent};color:#fff;padding:32px 48px;text-align:center;">
        <div style="font-size:0.7rem;letter-spacing:0.35em;text-transform:uppercase;opacity:0.7;margin-bottom:8px;">${r.nationality||"Official"} · Civil Registry</div>
        <h1 style="font-size:2rem;font-weight:700;letter-spacing:0.1em;margin:0;">${c.title}</h1>
        <div style="width:60px;height:3px;background:rgba(255,255,255,0.5);margin:12px auto;"></div>
        <div style="font-size:0.8rem;opacity:0.7;">Ref: ${did}</div>
      </div>
      <div style="padding:40px 48px;text-align:center;">
        <p style="font-size:1rem;color:#555;margin-bottom:16px;">${c.sub}</p>
        ${r.photo?`<img src="${r.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid ${accent};margin:0 auto 16px;display:block;" alt=""/>`:
        `<div style="width:100px;height:100px;border-radius:50%;background:${accent}18;border:4px solid ${accent};margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:700;color:${accent};">${r.name.charAt(0)}</div>`}
        <h2 style="font-size:2rem;font-weight:700;color:${accent};margin:0 0 8px;">${fn}</h2>
        <p style="font-size:0.9rem;color:#666;margin-bottom:6px;">${r.nationality||""} · ${r.nationalId?`ID: ${r.nationalId}`:""}</p>
        <div style="width:80px;height:2px;background:#c9a84c;margin:16px auto;"></div>
        <p style="font-size:1rem;color:#444;max-width:500px;margin:0 auto 24px;line-height:1.8;">${c.body}</p>
        <p style="font-size:0.85rem;color:#888;margin-bottom:32px;">Issued on <strong>${td}</strong></p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:500px;margin:0 auto;">
          <div style="border-top:2px solid ${accent};padding-top:10px;text-align:center;font-size:0.8rem;">
            <div style="font-weight:700;color:${accent};">AUTHORISED SIGNATORY</div>
            <div style="color:#888;margin-top:4px;">[SIGNATURE]<br/>[TITLE]<br/>[ORGANISATION]</div>
          </div>
          <div style="border-top:2px solid #c9a84c;padding-top:10px;text-align:center;font-size:0.8rem;">
            <div style="font-weight:700;color:#c9a84c;">OFFICIAL SEAL</div>
            <div style="width:60px;height:60px;border:2px solid #c9a84c;border-radius:50%;margin:6px auto;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#c9a84c;text-align:center;">OFFICIAL<br/>SEAL</div>
          </div>
        </div>
      </div>
      <div style="background:#f9f9f9;padding:14px;text-align:center;font-size:0.72rem;color:#aaa;border-top:1px solid #eee;">Document ID: ${did} · This certificate is an official document.</div>
    </div>`;
  }

  /* ─── VISA APPLICATIONS ─── */
  if((cat as string)==="visa") return buildVisaDoc(tplId, r);

  return `<p>Document type not supported.</p>`;
}


