import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, Fingerprint, FileText, User, Briefcase,
  Mail, Phone, MapPin, Users, AlertTriangle, Heart, GraduationCap,
  Globe, CreditCard, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";
import { getRecords } from "@/lib/biometric-store";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = getRecords().find(r => r.id === id);

  if (!record) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CyberBackground />
        <div className="card-surface rounded-lg p-10 text-center relative z-[1]">
          <Fingerprint className="w-12 h-12 mx-auto mb-4" style={{ color:"hsla(200,100%,50%,0.25)" }} />
          <p className="font-mono text-sm mb-2" style={{ color:"hsl(0,80%,65%)" }}>RECORD_NOT_FOUND</p>
          <p className="font-mono text-xs mb-6" style={{ color:"hsla(200,80%,60%,0.45)" }}>ID: {id}</p>
          <Button variant="outline" onClick={() => navigate("/")}>RETURN TO PORTAL</Button>
        </div>
      </div>
    );
  }

  /* ── reusable field ── */
  const F = ({ label, value, mono=false, full=false, warn=false }: {
    label:string; value?:string|null; mono?:boolean; full?:boolean; warn?:boolean;
  }) => (
    <div className={full ? "col-span-2" : ""}>
      <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
        style={{ color:"hsla(200,80%,65%,0.55)" }}>
        {label}
      </p>
      <p className={`${mono ? "font-mono text-xs tracking-wider" : "font-display text-sm font-semibold"} leading-snug`}
        style={{ color: warn ? "hsl(33,100%,65%)" : value ? "hsl(210,20%,92%)" : "hsla(210,20%,55%,0.7)" }}>
        {value || "—"}
      </p>
    </div>
  );

  /* ── section header ── */
  const SH = ({ icon: Icon, title, accent="blue" }: { icon:any; title:string; accent?:"blue"|"orange" }) => (
    <div className="flex items-center gap-3 pb-3 mb-4"
      style={{ borderBottom:`1px solid hsla(${accent==="orange"?"33,100%,52%":"200,100%,50%"},0.2)` }}>
      <div className="w-7 h-7 rounded flex items-center justify-center"
        style={{ background:`hsla(${accent==="orange"?"33,100%,52%":"200,100%,50%"},0.1)`, border:`1px solid hsla(${accent==="orange"?"33,100%,52%":"200,100%,50%"},0.25)` }}>
        <Icon className="w-3.5 h-3.5" style={{ color:`hsl(${accent==="orange"?"33,100%,62%":"200,100%,62%"})` }} />
      </div>
      <h2 className="font-display text-sm font-bold tracking-widest uppercase"
        style={{ color:`hsl(${accent==="orange"?"33,100%,65%":"200,100%,65%"})` }}>
        {title}
      </h2>
    </div>
  );

  /* ── badge ── */
  const Badge = ({ text, color="blue" }: { text:string; color?:"blue"|"orange"|"red"|"green" }) => {
    const c = {
      blue:   ["hsla(200,100%,50%,0.1)","hsla(200,100%,50%,0.3)","hsl(200,100%,65%)"],
      orange: ["hsla(33,100%,52%,0.1)", "hsla(33,100%,52%,0.35)","hsl(33,100%,65%)"],
      red:    ["hsla(0,75%,55%,0.1)",   "hsla(0,75%,55%,0.3)",   "hsl(0,80%,68%)"],
      green:  ["hsla(140,80%,45%,0.1)", "hsla(140,80%,45%,0.3)", "hsl(140,80%,62%)"],
    }[color];
    return (
      <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded"
        style={{ background:c[0], border:`1px solid ${c[1]}`, color:c[2] }}>
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <CyberBackground />

      {/* ── Header ── */}
      <div className="cyber-header flex items-center justify-between px-8 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center"
            style={{ background:"hsla(200,100%,50%,0.08)" }}>
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-display text-base font-bold tracking-wider text-foreground block leading-tight">
              IDENTITY PROFILE
            </span>
            <span className="font-mono text-[10px] tracking-widest" style={{ color:"hsla(200,100%,65%,0.55)" }}>
              VERIFIED RECORD
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold" style={{ color:"hsl(200,100%,62%)" }}>{record.id}</span>
          <span className="font-mono text-[10px] px-2 py-1 rounded"
            style={{ background:"hsla(140,80%,45%,0.1)", border:"1px solid hsla(140,80%,45%,0.3)", color:"hsl(140,80%,62%)" }}>
            ✓ VERIFIED
          </span>
        </div>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.4, ease:[0.4,0,0.2,1] }}
        className="max-w-7xl mx-auto px-6 py-7 relative z-[1] w-full flex-1">

        {/* ══ IDENTITY BANNER ══ */}
        <div className="card-surface rounded-xl p-6 mb-5 flex items-center gap-6"
          style={{ borderLeft:"3px solid hsl(200,100%,50%)" }}>
          {/* Photo */}
          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border"
            style={{ borderColor:"hsla(200,60%,35%,0.45)", background:"hsla(218,55%,10%,0.9)" }}>
            {record.photo
              ? <img src={record.photo} alt="Subject" className="w-full h-full object-cover" />
              : <User className="w-12 h-12 m-auto mt-7" style={{ color:"hsla(200,60%,50%,0.25)" }} />
            }
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] font-bold tracking-[0.22em] mb-1" style={{ color:"hsl(200,100%,60%)" }}>
              IDENTITY_VERIFIED · {record.id}
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground glow-text leading-none mb-2">
              {record.surname}, {record.name}
            </h1>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {record.gender     && <Badge text={record.gender}      color="blue"   />}
              {record.nationality && <Badge text={record.nationality} color="blue"   />}
              {record.maritalStatus && <Badge text={record.maritalStatus} color="blue" />}
              {record.isStudent  && <Badge text={record.institutionType === "university" ? `UNIVERSITY · ${(record.uniLevel||"").toUpperCase()}` : "COLLEGE STUDENT"} color="green" />}
              {record.noPassport && <Badge text="NO PASSPORT"        color="orange" />}
              {record.noLicense  && <Badge text="NO LICENSE"         color="orange" />}
              {record.occupation && <Badge text={record.occupation}  color="blue"   />}
            </div>
            {/* Contact line */}
            <div className="flex flex-wrap gap-4 font-mono text-xs" style={{ color:"hsla(210,20%,70%,0.8)" }}>
              {record.email   && <span className="flex items-center gap-1.5"><Mail   className="w-3 h-3 text-primary/50" />{record.email}</span>}
              {record.phoneNo && <span className="flex items-center gap-1.5"><Phone  className="w-3 h-3 text-primary/50" />{record.phoneNo}</span>}
              {record.address && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary/50" />{record.address}</span>}
            </div>
          </div>
          {/* Registration date */}
          <div className="text-right flex-shrink-0 hidden md:block">
            <p className="font-mono text-[9px] tracking-[0.2em]" style={{ color:"hsla(200,80%,60%,0.45)" }}>REGISTERED</p>
            <p className="font-mono text-sm font-semibold mt-1" style={{ color:"hsl(210,20%,85%)" }}>
              {new Date(record.registeredAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
            </p>
            <p className="font-mono text-xs mt-0.5" style={{ color:"hsla(200,80%,60%,0.4)" }}>
              {new Date(record.registeredAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
            </p>
          </div>
        </div>

        {/* ══ ROW 1: Personal · Documents · Family ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* ── PERSONAL ── */}
          <div className="card-surface rounded-xl p-5 space-y-4">
            <SH icon={User} title="Personal Information" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <F label="DATE OF BIRTH"  value={record.dateOfBirth}   />
              <F label="PLACE OF BIRTH" value={record.placeOfBirth}  />
              <F label="NATIONALITY"    value={record.nationality}   />
              <F label="NATIONAL ID"    value={record.nationalId}    />
              <F label="MARITAL STATUS" value={record.maritalStatus} />
              <F label="OCCUPATION"     value={record.occupation}    />
              <F label="GENDER"         value={record.gender}        />
            </div>
          </div>

          {/* ── DOCUMENTS ── */}
          <div className="card-surface rounded-xl p-5 space-y-4">
            <SH icon={FileText} title="Documents" />
            <div className="space-y-4">
              {record.noPassport ? (
                <F label="PASSPORT" value="NO PASSPORT ON RECORD" warn />
              ) : (
                <>
                  <F label="PASSPORT NO."     value={record.passportNo}             />
                  <F label="PLACE OF ISSUE"   value={record.passportPlaceOfIssue}   />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <F label="ISSUE DATE"  value={record.passportIssueDate}  />
                    <F label="EXPIRY DATE" value={record.passportExpiryDate} />
                  </div>
                </>
              )}
              <div className="pt-1 border-t" style={{ borderColor:"hsla(200,50%,25%,0.25)" }}>
                {record.noLicense
                  ? <F label="DRIVING LICENSE" value="NO LICENSE ON RECORD" warn />
                  : <F label="DRIVING LICENSE" value={record.drivingLicenseFile || "Not uploaded"} />
                }
              </div>
            </div>
          </div>

          {/* ── FAMILY ── */}
          <div className="card-surface rounded-xl p-5 space-y-4">
            <SH icon={Heart} title="Family Information" />
            <div className="space-y-4">
              <div>
                <F label="FATHER'S NAME" value={record.fatherName} />
                {record.fatherDeceased && (
                  <span className="font-mono text-[9px] font-bold tracking-wider mt-1 inline-block"
                    style={{ color:"hsl(0,80%,65%)", background:"hsla(0,75%,55%,0.1)", border:"1px solid hsla(0,75%,55%,0.25)", padding:"1px 6px", borderRadius:3 }}>
                    DECEASED
                  </span>
                )}
              </div>
              <div>
                <F label="MOTHER'S NAME" value={record.motherName} />
                {record.motherDeceased && (
                  <span className="font-mono text-[9px] font-bold tracking-wider mt-1 inline-block"
                    style={{ color:"hsl(0,80%,65%)", background:"hsla(0,75%,55%,0.1)", border:"1px solid hsla(0,75%,55%,0.25)", padding:"1px 6px", borderRadius:3 }}>
                    DECEASED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ ROW 2: Education (if student) + Records ══ */}
        <div className={`grid grid-cols-1 ${record.isStudent ? "lg:grid-cols-2" : ""} gap-5 mb-5`}>

          {/* ── EDUCATIONAL RECORD ── */}
          {record.isStudent && (
            <div className="card-surface rounded-xl p-5 space-y-4">
              <SH icon={GraduationCap} title="Educational Record" accent="orange" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <F label="INSTITUTION TYPE" value={(record.institutionType||"").toUpperCase()} />
                {record.uniLevel      && <F label="LEVEL"       value={record.uniLevel.toUpperCase()} />}
                {record.institutionName && <F label="INSTITUTION" value={record.institutionName} full />}
                {record.department    && <F label="DEPARTMENT"  value={record.department}    />}
                {record.studyYear     && <F label="YEAR"        value={record.studyYear}     />}
                {record.grade         && <F label="GRADE / GPA" value={record.grade}         />}
              </div>
              {record.educationRecord && (
                <div className="pt-3 border-t" style={{ borderColor:"hsla(33,60%,30%,0.3)" }}>
                  <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-2"
                    style={{ color:"hsla(33,100%,62%,0.55)" }}>PREVIOUS EDUCATION</p>
                  <p className="font-mono text-xs leading-relaxed" style={{ color:"hsl(210,20%,82%)" }}>
                    {record.educationRecord}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── RECORDS & HISTORY ── */}
          <div className="card-surface rounded-xl p-5 space-y-4">
            <SH icon={Briefcase} title="Records & History" />
            {!record.isStudent && record.educationRecord && (
              <div>
                <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                  style={{ color:"hsla(200,80%,65%,0.55)" }}>EDUCATION</p>
                <p className="font-mono text-xs leading-relaxed" style={{ color:"hsl(210,20%,85%)" }}>{record.educationRecord}</p>
              </div>
            )}
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                style={{ color:"hsla(200,80%,65%,0.55)" }}>HEALTH RECORD</p>
              <p className="font-mono text-xs leading-relaxed" style={{ color:"hsl(210,20%,85%)" }}>{record.healthRecord || "—"}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                style={{ color:"hsla(200,80%,65%,0.55)" }}>WORK EXPERIENCE</p>
              <p className="font-mono text-xs leading-relaxed" style={{ color:"hsl(210,20%,85%)" }}>{record.workExperience || "—"}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                style={{ color:"hsla(200,80%,65%,0.55)" }}>CRIME RECORD</p>
              <p className="font-mono text-xs leading-relaxed" style={{ color:"hsl(210,20%,85%)" }}>{record.crimeRecord || "—"}</p>
            </div>
          </div>
        </div>

        {/* ══ ROW 3: Emergency Contacts + Next of Kin ══ */}
        {(record.emergencyContact1?.name || record.emergencyContact2?.name || record.kin1?.name || record.kin2?.name) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            {/* ── EMERGENCY CONTACTS ── */}
            {(record.emergencyContact1?.name || record.emergencyContact2?.name) && (
              <div className="card-surface rounded-xl p-5 space-y-4">
                <SH icon={AlertTriangle} title="Emergency Contacts" accent="orange" />
                <div className="grid grid-cols-2 gap-5">
                  {record.emergencyContact1?.name && (
                    <div className="sub-divider space-y-3">
                      <F label="NAME"     value={record.emergencyContact1.name}  />
                      <F label="PHONE"    value={record.emergencyContact1.phone} />
                    </div>
                  )}
                  {record.emergencyContact2?.name && (
                    <div className="sub-divider space-y-3">
                      <F label="NAME"     value={record.emergencyContact2.name}  />
                      <F label="PHONE"    value={record.emergencyContact2.phone} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── NEXT OF KIN ── */}
            {(record.kin1?.name || record.kin2?.name) && (
              <div className="card-surface rounded-xl p-5 space-y-4">
                <SH icon={Users} title="Next of Kin" />
                <div className="grid grid-cols-2 gap-5">
                  {record.kin1?.name && (
                    <div className="sub-divider space-y-3">
                      <F label="FULL NAME" value={`${record.kin1.name} ${record.kin1.surname}`} />
                      <F label="RELATION"  value={record.kin1.relation} />
                      <F label="PHONE"     value={record.kin1.phone}    />
                      <F label="ADDRESS"   value={record.kin1.address}  />
                    </div>
                  )}
                  {record.kin2?.name && (
                    <div className="sub-divider space-y-3">
                      <F label="FULL NAME" value={`${record.kin2.name} ${record.kin2.surname}`} />
                      <F label="RELATION"  value={record.kin2.relation} />
                      <F label="PHONE"     value={record.kin2.phone}    />
                      <F label="ADDRESS"   value={record.kin2.address}  />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ BIOMETRIC FOOTER ══ */}
        <div className="card-surface rounded-xl p-5"
          style={{ borderTop:"2px solid hsla(200,100%,50%,0.3)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="w-4 h-4 text-primary" />
            <h2 className="font-display text-sm font-bold tracking-widest uppercase" style={{ color:"hsl(200,100%,65%)" }}>
              BIOMETRIC DATA
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {record.fingerHashes ? (
              [
                { label:"RIGHT THUMB",        key:"rightThumb" },
                { label:"RIGHT INDEX FINGER",  key:"rightIndex" },
                { label:"LEFT THUMB",          key:"leftThumb"  },
                { label:"LEFT INDEX FINGER",   key:"leftIndex"  },
              ].map(({ label, key }) => (
                <div key={key} className="text-center">
                  <Fingerprint className="w-8 h-8 mx-auto mb-2" style={{
                    color: record.fingerHashes?.[key as keyof typeof record.fingerHashes]
                      ? "hsl(200,100%,55%)"
                      : "hsla(200,60%,40%,0.3)",
                    filter: record.fingerHashes?.[key as keyof typeof record.fingerHashes]
                      ? "drop-shadow(0 0 8px hsla(200,100%,50%,0.5))"
                      : "none",
                  }} />
                  <p className="font-mono text-[9px] font-bold tracking-wider mb-1" style={{ color:"hsla(200,80%,65%,0.5)" }}>
                    {label}
                  </p>
                  <p className="font-mono text-[10px] font-semibold" style={{ color:"hsl(200,100%,62%)" }}>
                    {record.fingerHashes?.[key as keyof typeof record.fingerHashes] || "—"}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-4 flex items-center gap-4">
                <Fingerprint className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-mono text-[9px] tracking-widest mb-0.5" style={{ color:"hsla(200,80%,65%,0.5)" }}>FINGERPRINT HASH</p>
                  <p className="font-mono text-sm font-bold" style={{ color:"hsl(200,100%,62%)" }}>{record.fingerprintHash}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <div className="relative z-[1] py-4 text-center border-t" style={{ borderColor:"hsla(200,60%,20%,0.3)" }}>
        <span className="font-mono text-[11px] tracking-widest" style={{ color:"hsla(200,100%,60%,0.3)" }}>
          © 2026 KUMI — BIOMETRIC IDENTITY MANAGEMENT SYSTEM — ALL RIGHTS RESERVED
        </span>
      </div>
    </div>
  );
};

export default ResultPage;
