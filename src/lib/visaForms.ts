
import type { BiometricRecord } from "./biometric-store";

/* \u2500\u2500 Shared helpers \u2500\u2500 */
const td2 = () => new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
const yr  = () => new Date().getFullYear();
const docId = (r:BiometricRecord,t:string) => r.id+"-"+t.toUpperCase().replace(/-/g,"_")+"-"+yr();
const v = (x:string|null|undefined,fb="\u2014") => (x&&x.trim())?x.trim():fb;

/* \u2500\u2500 Shared CSS pieces (string concat safe) \u2500\u2500 */
const PAGE  = "font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;max-width:860px;margin:0 auto;";
const COVER = (c:string) => "background:"+c+";color:#fff;padding:0;";
const BODY  = "padding:18px 20px;";
const SEC   = (c:string) => "background:"+c+";color:#fff;padding:5px 10px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:14px 0 8px;";
const FIELD = "border:1px solid #888;min-height:22px;padding:3px 6px;font-size:11px;background:#fafafa;word-break:break-all;";
const LBL   = "font-size:9px;font-weight:700;color:#444;letter-spacing:0.06em;text-transform:uppercase;display:block;margin-bottom:2px;";
const ROW2  = "display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;";
const ROW3  = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;";
const ROW4  = "display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px;";
const NOTE  = "font-size:9px;color:#666;margin-top:10px;border-top:1px solid #ccc;padding-top:6px;";
const OFFICIAL = "margin-top:14px;padding:8px;background:#f5f5f5;border:1px solid #ccc;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:9px;color:#888;";
const DECL  = "font-size:9px;line-height:1.7;background:#fffdf0;border:1px solid #ddd;padding:8px;margin:10px 0;";

function fCell(label:string, value:string) {
  return '<div><label style="'+LBL+'">'+label+'</label><div style="'+FIELD+'">'+value+'</div></div>';
}
function sigBlock(name:string, date:string, extra:string) {
  return '<div style="margin-top:16px;display:grid;grid-template-columns:2fr 1fr;gap:20px;">'
    +'<div><label style="'+LBL+'">Signature of Applicant</label>'
    +'<div style="border-bottom:2px solid #333;height:32px;margin-top:4px;"></div>'
    +'<div style="font-size:9px;color:#666;margin-top:3px;">'+name+' \u00b7 '+date+'</div>'
    +extra+'</div>'
    +'<div style="text-align:center;">'
    +'<div style="width:65px;height:85px;border:2px solid #666;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#aaa;text-align:center;">PHOTO'+'\
'+'35x45mm</div>'
    +'</div></div>';
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   \ud83c\uddfa\ud83c\uddf8 USA \u2014 DS-160 Nonimmigrant Visa Application
   Source: ceac.state.gov/GENNIV
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
/* ═══════════════════════════════════════════════════
   🇺🇸 USA &#8212; DS-160 Nonimmigrant Visa Application
   Source: ceac.state.gov/GENNIV &#8212; Official form fields
═══════════════════════════════════════════════════ */
function visaUSA(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-usa"); const tds=td2();
  const A="#003087"; const R="#B22234";
  const H=(t:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 7px;background:#dce8f8;font-size:8px;font-weight:700;letter-spacing:0.04em;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+t+"</td>";
  const D=(val:string,w?:string,cs?:number,h?:string)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+(h?"height:"+h+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number,h?:string)=>"<td style=\"border:1px solid #444;"+(w?"width:"+w+";":"")+(h?"height:"+h+";":"height:24px;")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const CB=(label:string)=>"<span style='display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px;'>&#9744; "+label+"</span>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Official header
  p("<table style=\""+T+"margin-bottom:0;\"><tr>");
  p("<td style=\"border:2px solid "+A+";padding:8px;width:12%;background:"+A+";text-align:center;\">");
  p("<div style='font-size:30px;'>&#127861;</div><div style='font-size:7px;color:#fff;font-weight:700;margin-top:3px;'>U.S. DEPT<br/>OF STATE</div></td>");
  p("<td style=\"border:2px solid "+A+";padding:10px;\">");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";letter-spacing:0.06em;'>U.S. DEPARTMENT OF STATE</div>");
  p("<div style='font-size:16px;font-weight:700;margin:3px 0 2px;'>NONIMMIGRANT VISA APPLICATION</div>");
  p("<div style='font-size:12px;font-weight:700;color:"+R+";'>DS-160</div>");
  p("<div style='font-size:8px;color:#555;margin-top:3px;'>Online Nonimmigrant Visa Application &#8226; ceac.state.gov/GENNIV &#8226; Ref: "+id+"</div></td>");
  p("<td style=\"border:2px solid "+A+";padding:5px;width:13%;text-align:center;\">");
  p(r.photo?"<img src='"+r.photo+"' style='width:82px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:82px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;gap:3px;'>&#128247;<br/>PHOTO<br/>2x2 in.</div>");
  p("</td></tr></table>");
  // Official use box &#8212; top right as in real DS-160
  p("<table style=\""+T+"\"><tr>");
  p("<td style='border:1px solid #444;padding:6px 8px;width:75%;'>");
  p("<div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:3px;letter-spacing:0.06em;'>FOR OFFICIAL USE ONLY</div>");
  p("<table style='width:100%;border-collapse:collapse;font-size:8px;'><tr>");
  p("<td style='border:1px solid #aaa;padding:3px 5px;'>Visa class:<br/><br/></td>");
  p("<td style='border:1px solid #aaa;padding:3px 5px;'>Date of issue:<br/><br/></td>");
  p("<td style='border:1px solid #aaa;padding:3px 5px;'>Expiration date:<br/><br/></td>");
  p("<td style='border:1px solid #aaa;padding:3px 5px;'>Visa number:<br/><br/></td>");
  p("<td style='border:1px solid #aaa;padding:3px 5px;'>Consular officer:<br/><br/></td>");
  p("</tr></table></td>");
  p("<td style='border:1px solid #444;padding:5px 7px;font-size:8px;color:#555;'>Petition number:<br/><br/>Application ID:<br/>"+id+"</td>");
  p("</tr></table>");
  // Fields &#8212; exact DS-160 field order
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART I &#8212; PERSONAL INFORMATION</div>");
  p("<table style='"+T+"'><tr>"+H("1. Surname (Family Name)",undefined,2)+H("2. Given Name (First &amp; Middle)")+"</tr>");
  p("<tr>"+D(v(r.surname),undefined,2)+D(v(r.name))+"</tr>");
  p("<tr>"+H("3. Full Name in Native Alphabet (if applicable)")+H("4. Any other names used? (nicknames, maiden name)")+H("5. Telecode for name")+"</tr>");
  p("<tr>"+D("&#8212;")+D("No")+D("N/A")+"</tr>");
  p("<tr>"+H("6. Sex")+H("7. Marital Status")+H("8. Date of Birth (DD-MMM-YYYY)")+"</tr>");
  p("<tr>"+D(v(r.gender))+D(v(r.maritalStatus))+D(v(r.dateOfBirth))+"</tr>");
  p("<tr>"+H("9. City of Birth")+H("10. Country/Region of Birth")+H("11. Country/Region of Origin (Nationality)")+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth))+D(v(r.nationality))+D(v(r.nationality))+"</tr>");
  p("<tr>"+H("12. Do you hold or have you held any nationality other than the one above?",undefined,2)+H("13. National Identification Number")+"</tr>");
  p("<tr>"+D(v(r.multinationality)?"Yes: "+v(r.multinationality):"No",undefined,2)+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("14. U.S. Social Security Number (if applicable)")+H("15. U.S. Taxpayer ID Number (if applicable)")+H("16. Permanent Resident?")+"</tr>");
  p("<tr>"+D("Does not apply")+D("Does not apply")+D("No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART II &#8212; TRAVEL INFORMATION</div>");
  p("<table style='"+T+"'><tr>"+H("17. Purpose of Trip to the U.S.")+H("18. Have you made specific travel plans?")+H("19. Intended date of arrival (DD-MMM-YYYY)")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("20. Intended length of stay in U.S.")+H("21. Address where you will stay in the U.S.",undefined,2)+"</tr>");
  p("<tr>"+E("25%")+E(undefined,2)+"</tr>");
  p("<tr>"+H("22. Person/Organization paying for trip")+H("23. Do you have ties (family/property/job) outside U.S.?",undefined,2)+"</tr>");
  p("<tr>"+D("Self / Myself")+D("Yes",undefined,2)+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART III &#8212; TRAVEL COMPANIONS / PREVIOUS U.S. TRAVEL</div>");
  p("<table style='"+T+"'><tr>"+H("24. Are you travelling with anyone?",undefined,3)+"</tr><tr>"+D("No",undefined,3,"height:20px;")+"</tr>");
  p("<tr>"+H("25. Have you ever been to the U.S.?")+H("26. Last date visited")+H("27. Length of last stay")+"</tr>");
  p("<tr>"+D("No")+E()+E()+"</tr>");
  p("<tr>"+H("28. Have you ever been issued a U.S. visa?",undefined,2)+H("29. Has your visa ever been lost/stolen/cancelled/refused?")+"</tr>");
  p("<tr>"+D("No",undefined,2)+D("No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART IV &#8212; U.S. POINT OF CONTACT / FAMILY INFO</div>");
  p("<table style='"+T+"'><tr>"+H("30. Contact Name in the U.S.")+H("31. Contact Organization")+H("32. Relationship to Contact")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("33. Father's Surname &amp; Given Name")+H("34. Father's Date of Birth")+H("35. Is father in U.S.?")+"</tr>");
  p("<tr>"+D(v(r.fatherName)||"&#8212;")+E()+D("No")+"</tr>");
  p("<tr>"+H("36. Mother's Surname &amp; Given Name")+H("37. Mother's Date of Birth")+H("38. Is mother in U.S.?")+"</tr>");
  p("<tr>"+D(v(r.motherName)||"&#8212;")+E()+D("No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART V &#8212; WORK/EDUCATION/TRAINING &amp; PASSPORT</div>");
  p("<table style='"+T+"'><tr>"+H("39. Primary Occupation")+H("40. Present Employer/School")+H("41. Address of Employer/School")+"</tr>");
  p("<tr>"+D(v(r.occupation))+D(v(r.institutionName)||"&#8212;")+D(v(r.address))+"</tr>");
  p("<tr>"+H("42. Passport Type")+H("43. Passport/Travel Document Number")+H("44. Book Number (if applicable)")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Regular/Ordinary"))+D(v(r.passportNo||r.nationalId))+D("N/A")+"</tr>");
  p("<tr>"+H("45. Country/Authority that Issued Passport")+H("46. Passport Issue Date")+H("47. Passport Expiration Date")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue||r.nationality))+D(v(r.passportIssueDate))+D(v(r.passportExpiryDate))+"</tr></table>");
  // Security background &#8212; exact DS-160 questions
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PART VI &#8212; SECURITY AND BACKGROUND QUESTIONS</div>");
  const qUS=["Have you ever been refused a U.S. Visa or been refused admission to the United States?",
    "Have you ever violated the terms of a U.S. visa, or been unlawfully present in, or deported from the United States?",
    "Do you have a communicable disease of public health significance?",
    "Do you have a mental or physical disorder that poses/has posed a threat to the safety or welfare of yourself or others?",
    "Are you or have you ever been a drug abuser or addict?",
    "Have you ever been arrested or convicted for any offense or crime?",
    "Have you ever been a member of, or in any way associated with, any organization, association, fund, foundation, party, club, society, or similar group that has engaged in terrorist activity?",
    "Have you ever ordered, incited, assisted, or otherwise participated in genocide?",
    "Have you ever committed, ordered, incited, assisted, or otherwise participated in torture?",
    "Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue?"];
  p("<table style='"+T+"'>");
  qUS.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px 7px;font-size:10px;width:55px;text-align:center;'>&#9744; NO</td></tr>");
  });
  p("</table>");
  // Certification
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#f8faff;'>");
  p("<strong>CERTIFICATION:</strong> I certify that I have read and understood all the questions set forth in this application and that my answers are true, complete and correct to the best of my knowledge and belief. I understand that a false or misleading answer may result in the permanent refusal of a visa or denial of entry into the United States.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:65%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:6px;'>SIGNATURE OF APPLICANT</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; Date: "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;color:#555;'>Nationality: "+v(r.nationality)+"<br/>DOB: "+v(r.dateOfBirth)+"<br/>Passport: "+v(r.passportNo||r.nationalId)+"<br/>Ref: "+id+"</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>U.S. Department of State &#8226; DS-160 Nonimmigrant Visa Application &#8226; ceac.state.gov/GENNIV &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇬🇧 UK &#8212; VAF1A Standard Visitor Visa
   Source: gov.uk/apply-uk-visa &#8212; Official form fields
═══════════════════════════════════════════════════ */
function visaUK(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-uk"); const tds=td2();
  const A="#012169"; const R="#C8102E";
  const H=(t:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 7px;background:#dce4f5;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Header
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:13%;text-align:center;'><div style='font-size:28px;'>&#127468;&#127463;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>UK VISAS &amp;<br/>IMMIGRATION</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'><div style='font-size:10px;font-weight:700;color:"+A+";letter-spacing:0.06em;'>HER MAJESTY'S PASSPORT OFFICE &#8226; UK VISAS AND IMMIGRATION</div><div style='font-size:16px;font-weight:700;margin:3px 0 2px;'>FORM VAF1A &#8212; APPLICATION FOR A VISIT VISA</div><div style='font-size:9px;color:#555;'>Standard Visitor Visa &#8226; gov.uk/apply-uk-visa &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>PHOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  // Official use
  p("<table style='"+T+"'><tr><td style='border:1px solid #444;padding:5px 8px;width:70%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:4px;'>FOR OFFICIAL USE ONLY</div>");
  p("<table style='width:100%;border-collapse:collapse;font-size:8px;'><tr><td style='border:1px solid #aaa;padding:3px;'>Date of application:<br/><br/></td><td style='border:1px solid #aaa;padding:3px;'>Supporting documents:<br/>&#9744; Valid passport<br/>&#9744; Financial means</td><td style='border:1px solid #aaa;padding:3px;'>Visa:<br/>&#9744; Refused<br/>&#9744; Granted</td></tr></table></td>");
  p("<td style='border:1px solid #444;padding:5px 7px;font-size:8px;color:#555;'>Ref: "+id+"<br/>Application No.:</td></tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>SECTION 1 &#8212; PERSONAL DETAILS</div>");
  p("<table style='"+T+"'><tr>"+H("1.1 Family name (exactly as in passport)")+H("1.2 Given names (exactly as in passport)")+H("1.3 Date of birth (DD/MM/YYYY)")+"</tr>");
  p("<tr>"+D(v(r.surname))+D(v(r.name))+D(v(r.dateOfBirth))+"</tr>");
  p("<tr>"+H("1.4 Town/city and country of birth")+H("1.5 Sex")+H("1.6 Marital status")+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth))+D(v(r.gender))+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("1.7 Current nationality")+H("1.8 Any other nationalities held (including previous)")+H("1.9 National ID card number")+"</tr>");
  p("<tr>"+D(v(r.nationality))+D(v(r.multinationality)||"None")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("1.10 Occupation / profession")+H("1.11 Employer / educational institution name")+H("1.12 Are you a student?")+"</tr>");
  p("<tr>"+D(v(r.occupation))+D(v(r.institutionName)||"&#8212;")+D(r.isStudent?"Yes":"No")+"</tr>");
  p("<tr>"+H("1.13 Home address (building no., street, town, country)",undefined,2)+H("1.14 Email address")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.email))+"</tr>");
  p("<tr>"+H("1.15 Home telephone number")+H("1.16 Mobile/cell phone number")+H("1.17 Work/school telephone number")+"</tr>");
  p("<tr>"+D(v(r.phoneNo))+D(v(r.whatsapp)||v(r.phoneNo))+E()+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>SECTION 2 &#8212; PASSPORT / TRAVEL DOCUMENT</div>");
  p("<table style='"+T+"'><tr>"+H("2.1 Type of passport/travel document")+H("2.2 Passport number")+H("2.3 Place of issue")+"</tr>");
  p("<tr>"+D(v(r.passportType||"British National Overseas"))+D(v(r.passportNo||r.nationalId))+D(v(r.passportPlaceOfIssue))+"</tr>");
  p("<tr>"+H("2.4 Date of issue")+H("2.5 Date of expiry")+H("2.6 Are you travelling on a different country's passport to your nationality?")+"</tr>");
  p("<tr>"+D(v(r.passportIssueDate))+D(v(r.passportExpiryDate))+D("No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>SECTION 3 &#8212; JOURNEY DETAILS</div>");
  p("<table style='"+T+"'><tr>"+H("3.1 Intended arrival date in UK")+H("3.2 Intended departure date from UK")+H("3.3 Main purpose of visit")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("3.4 Address or accommodation in the UK",undefined,2)+H("3.5 Have you been to UK in last 10 years?")+"</tr>");
  p("<tr>"+E(undefined,2)+D("No")+"</tr>");
  p("<tr>"+H("3.6 Do you intend to work or study in the UK?",undefined,2)+H("3.7 Do you have a sponsor in the UK?")+"</tr>");
  p("<tr>"+D("No",undefined,2)+D("No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>SECTION 4 &#8212; FINANCIAL DETAILS</div>");
  p("<table style='"+T+"'><tr>"+H("4.1 How will you fund your trip?")+H("4.2 How much money (GBP) available?")+H("4.3 Employment status")+"</tr>");
  p("<tr>"+E()+E()+D(v(r.occupation)?"Employed":"&#8212;")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>SECTION 5 &#8212; BACKGROUND INFORMATION</div>");
  const qUK=["Have you ever been refused a visa or entry, or required to leave any country including the UK?",
    "Have you ever been deported, removed, or otherwise required to leave any country?",
    "Have you previously been refused asylum in the UK or any other country?",
    "Have you ever been convicted of any criminal offence in any country (including a spent conviction)?",
    "Are you currently the subject of a criminal investigation, on bail, or on probation?",
    "Have you engaged in any activities that might indicate that you are not a suitable visitor to the UK?",
    "Have you ever been involved in, supported or encouraged terrorist activity in any country?"];
  p("<table style='"+T+"'>");
  qUK.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; No</td></tr>");
  });
  p("</table>");
  p("<div style='background:#f0f0f0;border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;'><strong>DECLARATION:</strong> I declare that the information given in this form and any documents submitted with it is correct and complete. I understand that to make a false statement to obtain a visa is a criminal offence. I consent to any information being processed by UK Visas and Immigration.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr><td style='border:1px solid #444;padding:8px;width:65%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:6px;'>SIGNATURE OF APPLICANT</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; Date: "+tds+"</div></td><td style='border:1px solid #444;padding:7px;font-size:8px;color:#555;'>Passport: "+v(r.passportNo||r.nationalId)+"<br/>Nationality: "+v(r.nationality)+"<br/>DOB: "+v(r.dateOfBirth)+"</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>UK Visas and Immigration &#8226; Home Office &#8226; Form VAF1A &#8226; gov.uk/apply-uk-visa &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇪🇺 SCHENGEN &#8212; Harmonised Visa Application Form
   Source: Actual PDF uploaded &#8212; all 37 fields exact
═══════════════════════════════════════════════════ */
function visaSchengen(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-schengen"); const tds=td2();
  const A="#003399"; const GOLD="#FFCC00";
  const H=(t:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 7px;background:#e4eaff;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number,h?:string)=>"<td style=\"border:1px solid #444;"+(w?"width:"+w+";":"")+(h?"height:"+h+";":"height:24px;")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Header &#8212; matches exact PDF layout
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:13%;text-align:center;'><div style='font-size:28px;'>&#127466;&#127482;</div><div style='font-size:6.5px;color:"+GOLD+";font-weight:700;margin-top:3px;'>EUROPEAN<br/>UNION</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>HARMONISED APPLICATION FORM</div>");
  p("<div style='font-size:16px;font-weight:700;margin:2px 0;'>APPLICATION FOR SCHENGEN VISA</div>");
  p("<div style='font-size:9px;font-style:italic;color:#555;'>This application form is free.</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>Regulation (EC) No 810/2009 of the European Parliament &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;'>");
  // Official use &#8212; exact from PDF
  p("<div style='font-size:7px;font-weight:700;color:"+A+";margin-bottom:3px;'>FOR OFFICIAL USE ONLY</div>");
  p("<div style='font-size:7px;border:1px solid #aaa;padding:2px 3px;margin-bottom:2px;'>Date of application:<br/>&nbsp;</div>");
  p("<div style='font-size:7px;border:1px solid #aaa;padding:2px 3px;margin-bottom:2px;'>Visa application No.:<br/>&nbsp;</div>");
  p("<div style='font-size:7px;'>File handled by:<br/>&nbsp;</div>");
  p("</td></tr></table>");
  // Photo + supporting docs box &#8212; exact PDF layout
  p("<table style='"+T+"'><tr>");
  p("<td style='border:1px solid #444;padding:5px 8px;width:72%;'>");
  p("<div style='font-size:7px;font-weight:700;color:"+A+";'>Application lodged at: &#9744; Embassy/consulate &nbsp; &#9744; CAC &nbsp; &#9744; Service provider &nbsp; &#9744; Border &nbsp; &#9744; Other</div>");
  p("<div style='font-size:7px;margin-top:3px;'>Supporting documents: &#9744; Travel document &nbsp; &#9744; Means of subsistence &nbsp; &#9744; Invitation &nbsp; &#9744; Means of transport &nbsp; &#9744; TMI &nbsp; &#9744; Other</div>");
  p("<div style='font-size:7px;margin-top:3px;'>Visa decision: &#9744; Refused &nbsp; &#9744; Issued: &#9744; A &nbsp; &#9744; C &nbsp; &#9744; LTV &nbsp; Valid from _______ Until _______</div></td>");
  p("<td style='border:1px solid #444;padding:4px;text-align:center;width:28%;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px dashed #888;width:80px;height:100px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>Photo<br/>35x45mm</div>");
  p("</td></tr></table>");
  // Fields 1-11 &#8212; exact PDF field numbers and labels
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>PERSONAL DATA</div>");
  p("<table style='"+T+"'><tr>"+H("1. Surname (Family name) (x)",undefined,3)+"</tr><tr>"+D(v(r.surname),undefined,3,"font-size:13px;")+"</tr>");
  p("<tr>"+H("2. Surname at birth (Former family name(s)) (x)",undefined,3)+"</tr><tr>"+E(undefined,3)+"</tr>");
  p("<tr>"+H("3. First name(s) (Given name(s)) (x)",undefined,3)+"</tr><tr>"+D(v(r.name),undefined,3,"font-size:13px;")+"</tr>");
  p("<tr>"+H("4. Date of birth (day-month-year)")+H("5. Place of birth")+H("6. Country of birth")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth))+D(v(r.placeOfBirth))+D(v(r.nationality))+"</tr>");
  p("<tr>"+H("7. Current nationality (Nationality at birth, if different)")+H("8. Sex")+H("9. Marital status")+"</tr>");
  p("<tr>"+D(v(r.nationality))+D(v(r.gender))+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("10. For minors only: Surname, first name, address and nationality of parental authority/legal guardian",undefined,2)+H("11. National identity number, where applicable")+"</tr>");
  p("<tr>"+D("N/A",undefined,2)+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("12. Type of travel document")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:5px 7px;font-size:10px;' colspan='3'>&#9744; Ordinary passport &nbsp; &#9744; Diplomatic passport &nbsp; &#9744; Service passport &nbsp; &#9744; Official passport &nbsp; &#9744; Special passport &nbsp; &#9744; Other travel document<br/><strong style='font-size:11px;'>"+v(r.passportType||"Ordinary passport")+"</strong></td></tr>");
  p("<tr>"+H("13. Number of travel document")+H("14. Date of issue")+H("15. Valid until")+"</tr>");
  p("<tr>"+D(v(r.passportNo||r.nationalId))+D(v(r.passportIssueDate))+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("16. Issued by")+H("17. Applicant's home address and e-mail address")+H("Telephone number(s)")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue))+D(v(r.address)+"<br/>"+v(r.email))+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("18. Residence in a country other than country of current nationality",undefined,2)+H("* 19. Current occupation")+"</tr>");
  p("<tr>"+D("&#9744; No &nbsp; &#9744; Yes. Residence permit or equivalent No. ___________ Valid until ___________",undefined,2)+D(v(r.occupation))+"</tr>");
  p("<tr>"+H("* 20. Employer and employer's address and telephone number. For students, name and address of educational establishment.",undefined,3)+"</tr>");
  p("<tr>"+D(v(r.institutionName)||"&#8212;",undefined,3)+"</tr></table>");
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>TRAVEL INFORMATION (Fields 21-33)</div>");
  p("<table style='"+T+"'><tr>"+H("21. Main purpose(s) of the journey:",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; Tourism &nbsp; &#9744; Business &nbsp; &#9744; Visiting family or friends &nbsp; &#9744; Cultural &nbsp; &#9744; Sports &nbsp; &#9744; Official visit &nbsp; &#9744; Medical reasons &nbsp; &#9744; Study &nbsp; &#9744; Transit &nbsp; &#9744; Airport transit &nbsp; &#9744; Other<br/>Number of entries: &#9744; 1 &nbsp; &#9744; 2 &nbsp; &#9744; Multiple &nbsp;&nbsp; Number of days: ________</td></tr>");
  p("<tr>"+H("22. Member State(s) of destination")+H("23. Member State of first entry")+H("24. Number of entries requested")+"</tr>");
  p("<tr>"+E()+E()+D("&#9744; Single entry &nbsp; &#9744; Two entries &nbsp; &#9744; Multiple entries")+"</tr>");
  p("<tr>"+H("25. Duration of intended stay or transit (indicate number of days)")+H("26. Schengen visas issued during the past three years")+H("27. Fingerprints collected previously for Schengen visa?")+"</tr>");
  p("<tr>"+E()+D("&#9744; No &nbsp; &#9744; Yes. Date(s) of validity from _________ to _________")+D("&#9744; No &nbsp; &#9744; Yes. Date, if known: _________")+"</tr>");
  p("<tr>"+H("28. Entry permit for the final country of destination, where applicable")+H("29. Intended date of arrival in the Schengen area")+H("30. Intended date of departure from the Schengen area")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("* 31. Surname and first name of inviting person(s) / name of hotel(s) or temporary accommodation(s)",undefined,3)+"</tr><tr>"+E(undefined,3)+"</tr>");
  p("<tr>"+H("Address and e-mail of inviting person/hotel")+H("Telephone and telefax")+H("* 32. Name and address of inviting company/organisation")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("* 33. Cost of travelling and living during the applicant's stay is covered by:",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; The applicant himself/herself &nbsp;&nbsp; Means of support: &#9744; Cash &nbsp; &#9744; Traveller's cheques &nbsp; &#9744; Credit card &nbsp; &#9744; Pre-paid accommodation &nbsp; &#9744; Pre-paid transport &nbsp; &#9744; Other<br/>&#9744; A sponsor (host, company, organisation): &#9744; Accommodation provided &nbsp; &#9744; All expenses covered &nbsp; &#9744; Pre-paid transport &nbsp; &#9744; Other</td></tr></table>");
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;letter-spacing:0.1em;margin:0;'>EU/EEA FAMILY MEMBER (Fields 34-35) / SIGNATURE (Fields 36-37)</div>");
  p("<table style='"+T+"'><tr>"+H("34. Personal data of family member who is an EU, EEA or CH citizen",undefined,2)+H("35. Family relationship with EU/EEA/CH citizen")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9px;' colspan='2'>Surname: ________________________ First name(s): ________________________ Date of birth: ________________ Nationality: ________________ Number of travel document or ID card: ________________</td>");
  p("<td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; spouse &nbsp; &#9744; child &nbsp; &#9744; grandchild &nbsp; &#9744; dependent ascendant</td></tr>");
  p("<tr>"+H("36. Place and date")+H("37. Signature (for minors, signature of parental authority/legal guardian)",undefined,2)+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth||r.city||"")+" &nbsp; "+tds)+"<td style='border:1px solid #444;padding:8px;' colspan='2'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:4px;'>Signature / "+fn+"</div><div style='border-bottom:1.5px solid #333;height:28px;'></div></td></tr></table>");
  // Declaration &#8212; exact text from PDF
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:7.5px;color:#333;line-height:1.6;'>");
  p("I am aware that the visa fee is not refunded if the visa is refused. I am aware of and consent to the following: the collection of the data required by this application form and the taking of my photograph and, if applicable, the taking of fingerprints, are mandatory for the examination of the visa application; and any personal data concerning me which appear on the visa application form, as well as my fingerprints and my photograph will be supplied to the relevant authorities of the Member States and processed by those authorities, for the purposes of a decision on my visa application. Such data as well as data concerning the decision taken on my application or a decision whether to annul, revoke or extend a visa issued will be entered into, and stored in the Visa Information System (VIS) for a maximum period of five years. <strong>I declare that to the best of my knowledge all particulars supplied by me are correct and complete. I am aware that any false statements will lead to my application being rejected or to the annulment of a visa already granted.</strong> I undertake to leave the territory of the Member States before the expiry of the visa, if granted.</div>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Schengen Visa Application &#8226; Regulation (EC) No 810/2009 &#8226; Annex I &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇹🇷 TURKEY &#8212; Official Visa Application Form
   Source: Actual PDF uploaded &#8212; all 32 fields exact
═══════════════════════════════════════════════════ */
function visaTurkey(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-turkey"); const tds=td2();
  const A="#E30A17"; const NAVY="#003087";
  const H=(t:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 7px;background:#fff0f0;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number,h?:string)=>"<td style=\"border:1px solid #444;"+(w?"width:"+w+";":"")+(h?"height:"+h+";":"height:24px;")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Header &#8212; exact match to uploaded PDF
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:13%;text-align:center;'><div style='font-size:28px;'>&#127481;&#127479;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>T.C.<br/>REPUBLIC<br/>OF TURKEY</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'><div style='font-size:11px;font-weight:700;color:"+NAVY+";letter-spacing:0.04em;'>T&#220;RK&#304;YE CUMHUR&#304;YET&#304; DI&#350;&#304;&#350;LER&#304; BAKANLI&#286;I</div><div style='font-size:11px;font-weight:700;color:#555;'>REPUBLIC OF TURKEY, MINISTRY OF FOREIGN AFFAIRS</div><div style='font-size:16px;font-weight:700;margin:4px 0 2px;'>VISA APPLICATION FORM</div><div style='font-size:8px;color:#555;'>evisa.gov.tr &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>FOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  // FOR OFFICIAL USE ONLY &#8212; from PDF
  p("<table style='"+T+"'><tr><td style='border:1px solid #444;padding:5px 8px;'><div style='font-size:8px;font-weight:700;color:"+A+";'>FOR OFFICIAL USE ONLY</div>");
  p("<table style='width:100%;border-collapse:collapse;font-size:8px;margin-top:3px;'><tr>");
  p("<td style='border:1px solid #aaa;padding:3px;width:30%;'>Date of application:<br/>&nbsp;</td>");
  p("<td style='border:1px solid #aaa;padding:3px;'>Supporting documents:<br/>&#9744; Valid passport &nbsp; &#9744; Financial means &nbsp; &#9744; Invitation &nbsp; &#9744; Means of transport &nbsp; &#9744; Other</td>");
  p("<td style='border:1px solid #aaa;padding:3px;width:20%;'>Visa:<br/>&#9744; Refused<br/>&#9744; Granted</td></tr></table></td></tr></table>");
  // Fields 1-23 &#8212; exact from PDF
  p("<table style='"+T+"'><tr>"+H("1. Family name (as in passport)")+H("2. Maiden name")+H("3. First name(s) (as in passport)")+"</tr>");
  p("<tr>"+D(v(r.surname))+E()+D(v(r.name))+"</tr>");
  p("<tr>"+H("4. Date of birth (year-month-day)")+H("5. ID-number (optional)")+H("6. Sex")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth))+D(v(r.nationalId))+D("&#9744; Male &nbsp; &#9744; Female<br/><strong>"+v(r.gender)+"</strong>")+"</tr>");
  p("<tr>"+H("7. Place of birth")+H("8. Marital status",undefined,2)+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth))+"<td style='border:1px solid #444;padding:5px 7px;font-size:9.5px;' colspan='2'>&#9744; Single &nbsp; &#9744; Married &nbsp; &#9744; Separated &nbsp; &#9744; Divorced &nbsp; &#9744; Widowed &nbsp; &#9744; Other<br/><strong>"+v(r.maritalStatus)+"</strong></td></tr>");
  p("<tr>"+H("9. Current citizenship")+H("10. Citizenship at birth")+H("11. Father's full name")+"</tr>");
  p("<tr>"+D(v(r.nationality))+D(v(r.nationality))+D(v(r.fatherName)||"&#8212;")+"</tr>");
  p("<tr>"+H("12. Mother's full name")+H("13. Type of passport",undefined,2)+"</tr>");
  p("<tr>"+D(v(r.motherName)||"&#8212;")+"<td style='border:1px solid #444;padding:5px 7px;font-size:9.5px;' colspan='2'>&#9744; Ordinary Passport &nbsp; &#9744; Diplomatic Passport &nbsp; &#9744; Service Passport &nbsp; &#9744; Travel Document (1951 Convention) &nbsp; &#9744; Alien's passport &nbsp; &#9744; Seaman's Passport &nbsp; &#9744; Other<br/><strong>"+v(r.passportType||"Ordinary Passport")+"</strong></td></tr>");
  p("<tr>"+H("14. Passport number")+H("15. Issue and expiry date")+H("16. Place of issue")+"</tr>");
  p("<tr>"+D(v(r.passportNo||r.nationalId))+D("Issued: "+v(r.passportIssueDate)+" &nbsp; Expires: "+v(r.passportExpiryDate))+D(v(r.passportPlaceOfIssue))+"</tr>");
  p("<tr>"+H("17. If resident outside country of origin, do you have permission to return?",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; No &nbsp; &#9744; Yes, number and validity: ___________________________________________</td></tr>");
  p("<tr>"+H("18. Present occupation and profession")+H("19. Present work address",undefined,2)+"</tr>");
  p("<tr>"+D(v(r.occupation))+D(v(r.address),undefined,2)+"</tr>");
  p("<tr>"+H("Telephone / Fax Number")+H("20. Applicant's home address",undefined,2)+"</tr>");
  p("<tr>"+D(v(r.phoneNo))+D(v(r.address),undefined,2)+"</tr>");
  p("<tr>"+H("Telephone number")+H("E-mail address")+H("E-mail address")+"</tr>");
  p("<tr>"+D(v(r.phoneNo))+D(v(r.email))+E()+"</tr>");
  p("<tr>"+H("21. Type of Visa")+H("22. Number of entries requested")+H("23. Duration of stay")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Transit &nbsp; &#9744; Short stay &nbsp; &#9744; Long stay</td><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Single Entry &nbsp; &#9744; Multiple entry</td><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>Visa is requested for: __________ days</td></tr>");
  // Page 2 fields 24-32
  p("<tr>"+H("24. Have you ever been refused a visa for Turkey?",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; No &nbsp;&nbsp; &#9744; Yes &#8212; When: __________________ Where: __________________</td></tr>");
  p("<tr>"+H("25. Have you ever been deported from or required to leave Turkey?",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; No &nbsp;&nbsp; &#9744; Yes &#8212; When: __________________ Where: __________________</td></tr>");
  p("<tr>"+H("26. In the case of transit, have you an entry permit for the final country of destination?",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; No &nbsp;&nbsp; &#9744; Yes, valid until: ________________ Issuing authority: __________________</td></tr>");
  p("<tr>"+H("27. Purpose of trip",undefined,3)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='3'>&#9744; Official &nbsp; &#9744; Business &nbsp; &#9744; Tourism &nbsp; &#9744; Cultural/Sports &nbsp; &#9744; Private visit (family or friends) &nbsp; &#9744; Medical reasons &nbsp; &#9744; Other (please specify): ___________</td></tr>");
  p("<tr>"+H("28. Date of arrival")+H("29. Date of departure")+H("30. Port of first entry or transit route")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("31. Means of transport")+H("32. Who is paying for your trip and costs of living?",undefined,2)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Air &nbsp; &#9744; Sea &nbsp; &#9744; Land</td><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='2'>&#9744; Myself &nbsp; &#9744; Host person(s) &nbsp; &#9744; Host company &nbsp; (State who and how and submit corresponding documentation)</td></tr>");
  p("</table>");
  // Valid section from PDF
  p("<table style='"+T+"margin-top:0;'><tr>");
  p("<td style='border:1px solid #444;padding:5px 8px;width:50%;'><div style='font-size:8px;'>Type of Visa: &#9744; Single Entry &nbsp; &#9744; Multiple Entry &nbsp; &#9744; Transit &nbsp; &#9744; Double Transit &nbsp; &#9744; Tourist &nbsp; &#9744; Business &nbsp; &#9744; Work &nbsp; &#9744; Education &nbsp; &#9744; Other</div><div style='font-size:8px;margin-top:4px;'>Valid from: ______________ to: ______________</div></td>");
  p("<td style='border:1px solid #444;padding:8px;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>SIGNATURE OF APPLICANT / BAŞVURANIN &#304;MZASI</div><div style='border-bottom:1.5px solid #333;height:28px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>T.C. Di&#351;i&#351;leri Bakanl&#305;&#287;&#305; &#8226; Republic of Turkey Ministry of Foreign Affairs &#8226; evisa.gov.tr &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}


/* ═══════════════════════════════════════════════════
   🇦🇪 UAE &#8212; ICP Unified Visa Application Form
═══════════════════════════════════════════════════ */
function visaUAE(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-uae"); const tds=td2();
  const A="#00732F"; const GOLD="#C8A000";
  const H2=(ar:string,en:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#e8f5e9;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+"<div style='text-align:right;font-family:serif;font-size:9px;color:"+A+";'>"+ar+"</div>"+en+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127462;&#127466;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>FEDERAL AUTHORITY<br/>FOR IDENTITY</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='text-align:right;font-size:14px;font-weight:700;color:"+A+";font-family:serif;'>&#1607;&#1610;&#1574;&#1577; &#1575;&#1604;&#1607;&#1608;&#1610;&#1577; &#1608;&#1575;&#1604;&#1580;&#1606;&#1587;&#1610;&#1577; &#1608;&#1575;&#1604;&#1580;&#1605;&#1575;&#1585;&#1603; &#1608;&#1571;&#1605;&#1606; &#1575;&#1604;&#1605;&#1606;&#1575;&#1601;&#1584;</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>FEDERAL AUTHORITY FOR IDENTITY, CITIZENSHIP, CUSTOMS AND PORT SECURITY</div>");
  p("<div style='font-size:15px;font-weight:700;margin:3px 0 2px;'>UNIFIED VISA APPLICATION FORM &#1606;&#1605;&#1608;&#1584;&#1580; &#1591;&#1604;&#1576; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577; &#1575;&#1604;&#1605;&#1608;&#1581;&#1617;&#1614;&#1583;</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>icp.gov.ae &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>PHOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;'>PERSONAL INFORMATION / &#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1588;&#1582;&#1589;&#1610;&#1577;</div>");
  p("<table style='"+T+"'><tr>"+H2("&#1575;&#1604;&#1604;&#1602;&#1576;","Surname","33%")+H2("&#1575;&#1604;&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1608;&#1604;","First Name","33%")+H2("&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1576;","Father's Name")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+D(v(r.fatherName)||"&#8212;")+"</tr>");
  p("<tr>"+H2("&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","Date of Birth","25%")+H2("&#1605;&#1603;&#1575;&#1606; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","Place of Birth","25%")+H2("&#1575;&#1604;&#1580;&#1606;&#1587;","Gender","25%")+H2("&#1575;&#1604;&#1581;&#1575;&#1604;&#1577; &#1575;&#1604;&#1575;&#1580;&#1578;&#1605;&#1575;&#1593;&#1610;&#1577;","Marital Status")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth),"25%")+D(v(r.placeOfBirth),"25%")+D(v(r.gender),"25%")+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H2("&#1575;&#1604;&#1580;&#1606;&#1587;&#1610;&#1577;","Nationality","33%")+H2("&#1575;&#1604;&#1580;&#1606;&#1587;&#1610;&#1577; &#1575;&#1604;&#1571;&#1589;&#1604;&#1610;&#1577;","Original Nationality","33%")+H2("&#1575;&#1604;&#1583;&#1610;&#1575;&#1606;&#1577;","Religion")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.nationality),"33%")+E()+"</tr>");
  p("<tr>"+H2("&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1608;&#1610;&#1577; &#1575;&#1604;&#1608;&#1591;&#1606;&#1610;&#1577;","National ID Number","33%")+H2("&#1575;&#1604;&#1605;&#1607;&#1606;&#1577;","Occupation","33%")+H2("&#1580;&#1607;&#1577; &#1575;&#1604;&#1593;&#1605;&#1604;","Employer")+"</tr>");
  p("<tr>"+D(v(r.nationalId),"33%")+D(v(r.occupation),"33%")+D(v(r.institutionName)||"&#8212;")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>PASSPORT DETAILS / &#1578;&#1601;&#1575;&#1589;&#1610;&#1604; &#1580;&#1608;&#1575;&#1586; &#1575;&#1604;&#1587;&#1601;&#1585;</div>");
  p("<table style='"+T+"'><tr>"+H2("&#1606;&#1608;&#1593; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","Passport Type","25%")+H2("&#1585;&#1602;&#1605; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","Passport Number","25%")+H2("&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","Issue Date","25%")+H2("&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1575;&#1606;&#1578;&#1607;&#1575;&#1569;","Expiry Date")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H2("&#1605;&#1603;&#1575;&#1606; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","Place of Issue","50%")+H2("&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606; &#1601;&#1610; &#1576;&#1604;&#1583; &#1575;&#1604;&#1573;&#1602;&#1575;&#1605;&#1577;","Address in Country of Residence","50%")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"50%")+D(v(r.address))+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>VISIT INFORMATION / &#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577;</div>");
  p("<table style='"+T+"'><tr>"+H2("&#1575;&#1604;&#1594;&#1585;&#1590; &#1605;&#1606; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577;","Purpose of Visit","25%")+H2("&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1583;&#1582;&#1608;&#1604; &#1575;&#1604;&#1605;&#1602;&#1578;&#1585;&#1581;","Proposed Entry Date","25%")+H2("&#1605;&#1583;&#1577; &#1575;&#1604;&#1573;&#1602;&#1575;&#1605;&#1577;","Duration of Stay","25%")+H2("&#1606;&#1608;&#1593; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577;","Visa Type")+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E("25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Single &nbsp; &#9744; Multiple</td></tr>");
  p("<tr>"+H2("&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606; &#1601;&#1610; &#1575;&#1604;&#1573;&#1605;&#1575;&#1585;&#1575;&#1578;","Address in UAE","50%")+H2("&#1575;&#1604;&#1603;&#1601;&#1610;&#1604; &#1601;&#1610; &#1575;&#1604;&#1583;&#1608;&#1604;&#1577;","Sponsor/Guarantor in UAE","50%")+"</tr>");
  p("<tr>"+E("50%")+E()+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>CONTACT DETAILS / &#1576;&#1610;&#1575;&#1606;&#1575;&#1578; &#1575;&#1604;&#1578;&#1608;&#1575;&#1589;&#1604;</div>");
  p("<table style='"+T+"'><tr>"+H2("&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1575;&#1578;&#1601;","Phone Number","33%")+H2("&#1575;&#1604;&#1576;&#1585;&#1610;&#1583; &#1575;&#1604;&#1573;&#1604;&#1603;&#1578;&#1585;&#1608;&#1606;&#1610;","Email Address","33%")+H2("&#1585;&#1602;&#1605; &#1575;&#1604;&#1608;&#1575;&#1578;&#1587;&#1575;&#1576;","WhatsApp Number")+"</tr>");
  p("<tr>"+D(v(r.phoneNo),"33%")+D(v(r.email),"33%")+D(v(r.whatsapp)||v(r.phoneNo))+"</tr></table>");
  p("<div style='background:#e8f5e9;border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;'><strong>&#1575;&#1604;&#1573;&#1602;&#1585;&#1575;&#1585; / DECLARATION:</strong> I hereby declare that the information given in this application is true and accurate. &#8226; &#1571;&#1602;&#1585; &#1576;&#1571;&#1606; &#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1608;&#1575;&#1585;&#1583;&#1577; &#1601;&#1610; &#1607;&#1584;&#1575; &#1575;&#1604;&#1591;&#1604;&#1576; &#1589;&#1581;&#1610;&#1581;&#1577; &#1608;&#1583;&#1602;&#1610;&#1602;&#1577;.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr><td style='border:1px solid #444;padding:8px;width:60%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>&#1578;&#1608;&#1602;&#1610;&#1593; &#1605;&#1602;&#1583;&#1605; &#1575;&#1604;&#1591;&#1604;&#1576; / APPLICANT'S SIGNATURE</div><div style='border-bottom:1.5px solid #333;height:28px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td><td style='border:1px solid #444;padding:7px;font-size:8px;color:#555;'><div style='font-weight:700;color:"+A+";'>&#1604;&#1604;&#1575;&#1587;&#1578;&#1582;&#1583;&#1575;&#1605; &#1575;&#1604;&#1585;&#1587;&#1605;&#1610; / OFFICIAL USE</div>Visa No: _______________<br/>Valid: _____ to _____<br/>Officer: _______________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Federal Authority for Identity, Citizenship, Customs and Port Security &#8226; icp.gov.ae &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇨🇦 CANADA &#8212; IMM 5257B Visitor Visa Application
═══════════════════════════════════════════════════ */
function visaCanada(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-canada"); const tds=td2();
  const A="#003087"; const R="#E31837";
  const H=(t:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 7px;background:#dce4f5;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+" ></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:26px;'>&#127809;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>IMMIGRATION<br/>REFUGEES AND<br/>CITIZENSHIP<br/>CANADA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'><div style='font-size:10px;font-weight:700;color:"+A+";'>IMMIGRATION, REFUGEES AND CITIZENSHIP CANADA (IRCC)</div><div style='font-size:15px;font-weight:700;margin:3px 0 2px;'>IMM 5257B &#8212; APPLICATION FOR VISITOR VISA (TEMPORARY RESIDENT VISA)</div><div style='font-size:9px;color:#555;'>canada.ca/en/immigration-refugees-citizenship &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>PHOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION A &#8212; PERSONAL DETAILS</div>");
  p("<table style='"+T+"'><tr>"+H("A1. Family name")+H("A2. Given name(s)")+H("A3. Date of birth (DD-MON-YYYY)")+"</tr>");
  p("<tr>"+D(v(r.surname))+D(v(r.name))+D(v(r.dateOfBirth))+"</tr>");
  p("<tr>"+H("A4. City/Town of birth")+H("A5. Country of birth")+H("A6. Sex")+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth))+D(v(r.nationality))+D(v(r.gender))+"</tr>");
  p("<tr>"+H("A7. Country of citizenship")+H("A8. All other countries of citizenship")+H("A9. Marital status")+"</tr>");
  p("<tr>"+D(v(r.nationality))+D(v(r.multinationality)||"None")+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("A10. Current occupation")+H("A11. Employer name &amp; address")+H("A12. Work telephone number")+"</tr>");
  p("<tr>"+D(v(r.occupation))+D(v(r.institutionName)||"&#8212;")+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("A13. Home address (street, city, country)",undefined,2)+H("A14. Email address")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.email))+"</tr>");
  p("<tr>"+H("A15. Home telephone")+H("A16. Mobile telephone")+H("A17. National ID number")+"</tr>");
  p("<tr>"+D(v(r.phoneNo))+D(v(r.whatsapp)||v(r.phoneNo))+D(v(r.nationalId))+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION B &#8212; TRAVEL DOCUMENT</div>");
  p("<table style='"+T+"'><tr>"+H("B1. Type of travel document")+H("B2. Travel document number")+H("B3. Country of issue")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Passport"))+D(v(r.passportNo||r.nationalId))+D(v(r.passportPlaceOfIssue)||v(r.nationality))+"</tr>");
  p("<tr>"+H("B4. Date of issue (DD-MON-YYYY)")+H("B5. Date of expiry (DD-MON-YYYY)")+H("B6. Any other travel documents?")+"</tr>");
  p("<tr>"+D(v(r.passportIssueDate))+D(v(r.passportExpiryDate))+D("&#9744; No &nbsp; &#9744; Yes")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION C &#8212; DETAILS OF INTENDED VISIT</div>");
  p("<table style='"+T+"'><tr>"+H("C1. Intended date of arrival in Canada")+H("C2. Intended length of stay")+H("C3. Purpose of visit to Canada")+"</tr>");
  p("<tr>"+E()+E()+E()+"</tr>");
  p("<tr>"+H("C4. Address while in Canada",undefined,2)+H("C5. Do you have sufficient funds for your visit?")+"</tr>");
  p("<tr>"+E(undefined,2)+D("&#9744; Yes &nbsp; &#9744; No")+"</tr></table>");
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION D &#8212; BACKGROUND INFORMATION</div>");
  const qCA=["Have you ever been refused a visa or permit to travel to or remain in Canada?",
    "Have you ever been ordered to leave Canada or deported from Canada?",
    "Have you ever been convicted of a criminal offence in any country?",
    "Do you have any serious medical conditions or have you been recently diagnosed with a contagious disease?",
    "Are you an officer in or member of any military, police, or security organization?",
    "Are you a member of or associated with an organization that engages in terrorism?"];
  p("<table style='"+T+"'>");
  qCA.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(String.fromCharCode(65+i))+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; No</td></tr>");
  });
  p("</table>");
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#f8faff;'><strong>DECLARATION:</strong> I have read and understood the privacy statement and the questions on this form. The information I have provided on this form is truthful, complete and correct. I understand that providing false or misleading information may result in the refusal of my application, or removal from Canada.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr><td style='border:1px solid #444;padding:8px;width:65%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>SIGNATURE OF APPLICANT</div><div style='border-bottom:1.5px solid #333;height:28px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; Date: "+tds+"</div></td><td style='border:1px solid #444;padding:7px;font-size:8px;color:#555;'>Nationality: "+v(r.nationality)+"<br/>DOB: "+v(r.dateOfBirth)+"<br/>Passport: "+v(r.passportNo||r.nationalId)+"<br/>Ref: "+id+"</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Immigration, Refugees and Citizenship Canada &#8226; IMM 5257B &#8226; canada.ca/ircc &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇸🇴 SOMALIA &#8212; Entry Visa Application
   🇸🇦 SAUDI &#8212; MOFA Visa Application
   🇮🇳 INDIA &#8212; e-Visa Application
   🇨🇳 CHINA &#8212; Visa Application Form V.2013
   🇲🇾 MALAYSIA &#8212; eVISA Application IMM.57
   🇪🇹 ETHIOPIA &#8212; e-Visa Application
   All built using same shared table pattern as Egypt
═══════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════
   🇸🇴 SOMALIA &#8212; Ministry of Interior Entry Visa Form (Official)
═══════════════════════════════════════════════════ */
function visaSomalia(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-somalia"); const tds=td2();
  const A="#4189DD";
  const H=(t:string,ar:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#e8f0ff;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"><div style='text-align:right;font-family:serif;font-size:9px;color:"+A+";'>"+ar+"</div>"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Header
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127480;&#127476;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>SOMALI<br/>REPUBLIC</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='text-align:right;font-size:13px;font-weight:700;color:"+A+";font-family:serif;margin-bottom:2px;'>&#1580;&#1605;&#1607;&#1608;&#1585;&#1610;&#1577; &#1575;&#1604;&#1589;&#1608;&#1605;&#1575;&#1604; &#1575;&#1604;&#1601;&#1610;&#1583;&#1585;&#1575;&#1604;&#1610;&#1577; &#8212; &#1608;&#1586;&#1575;&#1585;&#1577; &#1575;&#1604;&#1583;&#1575;&#1582;&#1604;&#1610;&#1577; &#1608;&#1575;&#1604;&#1588;&#1572;&#1608;&#1606; &#1575;&#1604;&#1601;&#1610;&#1583;&#1585;&#1575;&#1604;&#1610;&#1577;</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>FEDERAL REPUBLIC OF SOMALIA &#8212; MINISTRY OF INTERIOR AND FEDERAL AFFAIRS</div>");
  p("<div style='font-size:15px;font-weight:700;margin:3px 0 2px;'>ENTRY VISA APPLICATION FORM</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";font-family:serif;'>&#1606;&#1605;&#1608;&#1584;&#1580; &#1591;&#1604;&#1576; &#1578;&#1571;&#1588;&#1610;&#1585;&#1577; &#1575;&#1604;&#1583;&#1582;&#1608;&#1604; &nbsp;|&nbsp; Foomka Codsigu Fiisa ee Somaliya</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>moi.gov.so &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>SAWIRKA<br/>PHOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  // Personal
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>MACLUUMAADKA SHAQSIGA / PERSONAL INFORMATION / &#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1588;&#1582;&#1589;&#1610;&#1577;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("1. Family Name / Magaca Dambe","&#1575;&#1604;&#1604;&#1602;&#1576;","33%")+H("2. First Name / Magaca Hore","&#1575;&#1604;&#1575;&#1587;&#1605;","33%")+H("3. Father's Name / Magaca Aabbaha","&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1576;")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+D(v(r.fatherName)||"&#8212;")+"</tr>");
  p("<tr>"+H("4. Date of Birth / Taariikhda Dhalashada","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","25%")+H("5. Place of Birth / Goobta Dhalashada","&#1605;&#1603;&#1575;&#1606; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","25%")+H("6. Sex / Galmada","&#1575;&#1604;&#1580;&#1606;&#1587;","25%")+H("7. Marital Status","&#1575;&#1604;&#1581;&#1575;&#1604;&#1577; &#1575;&#1604;&#1575;&#1580;&#1578;&#1605;&#1575;&#1593;&#1610;&#1577;")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth),"25%")+D(v(r.placeOfBirth),"25%")+D(v(r.gender),"25%")+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("8. Nationality / Dhalashada","&#1575;&#1604;&#1580;&#1606;&#1587;&#1610;&#1577;","33%")+H("9. Other Nationalities","&#1580;&#1606;&#1587;&#1610;&#1575;&#1578; &#1571;&#1582;&#1585;&#1609;","33%")+H("10. National ID No.","&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1608;&#1610;&#1577;")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.multinationality)||"None","33%")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("11. Occupation / Shaqada","&#1575;&#1604;&#1605;&#1607;&#1606;&#1577;","33%")+H("12. Employer / Goobta Shaqada","&#1580;&#1607;&#1577; &#1575;&#1604;&#1593;&#1605;&#1604;","33%")+H("13. Religion / Diinta","&#1575;&#1604;&#1583;&#1610;&#1606;")+"</tr>");
  p("<tr>"+D(v(r.occupation),"33%")+D(v(r.institutionName)||"&#8212;","33%")+E()+"</tr>");
  p("<tr>"+H("14. Permanent Home Address / Cinwaanka","&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606;",undefined,2)+H("15. Phone / Taleefanka","&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1575;&#1578;&#1601;")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("16. Email / Emayl","&#1575;&#1604;&#1576;&#1585;&#1610;&#1583; &#1575;&#1604;&#1573;&#1604;&#1603;&#1578;&#1585;&#1608;&#1606;&#1610;","50%")+H("17. WhatsApp / Mobile","&#1585;&#1602;&#1605; &#1575;&#1604;&#1580;&#1608;&#1575;&#1604;","50%")+"</tr>");
  p("<tr>"+D(v(r.email),"50%")+D(v(r.whatsapp)||v(r.phoneNo))+"</tr></table>");
  // Passport
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>DUKUMENTIGA SAFARKA / TRAVEL DOCUMENT / &#1608;&#1579;&#1610;&#1602;&#1577; &#1575;&#1604;&#1587;&#1601;&#1585;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("18. Passport Type / Nooca Baasaboorka","&#1606;&#1608;&#1593; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","25%")+H("19. Passport No. / Lambarka","&#1585;&#1602;&#1605; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","25%")+H("20. Date of Issue / Taariikhda","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","25%")+H("21. Expiry / Dhicitaanka","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1575;&#1606;&#1578;&#1607;&#1575;&#1569;")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("22. Place of Issue / Meeshii","&#1605;&#1603;&#1575;&#1606; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","50%")+H("23. Issuing Country","&#1575;&#1604;&#1583;&#1608;&#1604;&#1577;","50%")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"50%")+D(v(r.nationality))+"</tr></table>");
  // Visit
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>FAAHFAAHINTA SOOCDAADA / VISIT DETAILS / &#1578;&#1601;&#1575;&#1589;&#1610;&#1604; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("24. Purpose of Visit / Ujeedada","&#1575;&#1604;&#1594;&#1585;&#1590; &#1605;&#1606; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577;","25%")+H("25. Date of Arrival / Imaanshaha","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1608;&#1589;&#1608;&#1604;","25%")+H("26. Duration / Mudada","&#1605;&#1583;&#1577; &#1575;&#1604;&#1573;&#1602;&#1575;&#1605;&#1577;","25%")+H("27. Visa Type / Nooca","&#1606;&#1608;&#1593; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577;")+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E("25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Single &nbsp; &#9744; Multiple &nbsp; &#9744; Transit</td></tr>");
  p("<tr>"+H("28. Port of Entry / Xadka","&#1605;&#1606;&#1601;&#1584; &#1575;&#1604;&#1583;&#1582;&#1608;&#1604;","33%")+H("29. Address in Somalia / Cinwaanka","&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606; &#1601;&#1610; &#1575;&#1604;&#1589;&#1608;&#1605;&#1575;&#1604;","33%")+H("30. Sponsor in Somalia","&#1575;&#1604;&#1603;&#1601;&#1610;&#1604;")+"</tr>");
  p("<tr>"+E("33%")+E("33%")+E()+"</tr>");
  p("<tr>"+H("31. Have you visited Somalia before? / Ma soo booqatay?","&#1586;&#1610;&#1575;&#1585;&#1577; &#1587;&#1575;&#1576;&#1602;&#1577;",undefined,2)+H("32. Date of previous visit","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577; &#1575;&#1604;&#1587;&#1575;&#1576;&#1602;&#1577;")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;' colspan='2'>&#9744; No / Maya &nbsp;&nbsp; &#9744; Yes / Haa &#8212; Number of visits: _____________</td>"+E()+"</tr></table>");
  // Emergency
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>XIRIIRKA DEGDEGGA / EMERGENCY CONTACT</div>");
  p("<table style='"+T+"'><tr>"+H("33. Emergency Contact Name","&#1575;&#1604;&#1575;&#1587;&#1605;","33%")+H("34. Relationship","&#1589;&#1604;&#1577; &#1575;&#1604;&#1602;&#1585;&#1575;&#1576;&#1577;","33%")+H("35. Emergency Phone","&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1575;&#1578;&#1601;")+"</tr>");
  p("<tr>"+D(v(r.emergencyContact1?.name)||"&#8212;","33%")+E("33%")+D(v(r.emergencyContact1?.phone)||"&#8212;")+"</tr></table>");
  // Declarations
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>BAYAAN / DECLARATION / &#1573;&#1602;&#1585;&#1575;&#1585;</div>");
  const qSO=["Have you ever been refused a visa or denied entry to Somalia? / Ma la diidiy in aad u timaadid Somaliya?",
    "Have you ever been deported from any country? / Ma laga masaafuriyay dal kale markasta?",
    "Do you have a criminal record in any country? / Ma haysataa diiwaanka dambiilaha dalka kale?",
    "Are you associated with any terrorist or extremist organization? / Ma ku xidantahay urur argagaxiso ama xad dhaaf ah?",
    "Do you have any serious communicable diseases? / Ma qabataa cudur faafa oo halis ah?"];
  p("<table style='"+T+"'>");
  qSO.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; Maya<br/>No</td></tr>");
  });
  p("</table>");
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#f0f5ff;'>");
  p("<strong>BAYAAN / DECLARATION / &#1573;&#1602;&#1585;&#1575;&#1585;:</strong> Waxaan ku dhaartaa macluumaadka kor ku qoran inuu sax yahay. / I declare that all information provided is true and complete. / &#1571;&#1602;&#1585; &#1576;&#1571;&#1606; &#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1608;&#1575;&#1585;&#1583;&#1577; &#1589;&#1581;&#1610;&#1581;&#1577; &#1608;&#1603;&#1575;&#1605;&#1604;&#1577;.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:60%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>SAXEEXA CODSADAHA / APPLICANT'S SIGNATURE / &#1578;&#1608;&#1602;&#1610;&#1593; &#1605;&#1602;&#1583;&#1605; &#1575;&#1604;&#1591;&#1604;&#1576;</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;'><div style='font-weight:700;color:"+A+";margin-bottom:4px;'>USU ADEEGISTA RASMI / OFFICIAL USE ONLY</div>Visa No: _______________<br/>Valid: ________________<br/>Officer: _______________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Federal Republic of Somalia &#8226; Ministry of Interior and Federal Affairs &#8226; moi.gov.so &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇸🇦 SAUDI ARABIA &#8212; MOFA Official Visa Application Form
═══════════════════════════════════════════════════ */
function visaSaudi(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-saudi"); const tds=td2();
  const A="#006C35"; const GOLD="#C8A000";
  const H=(en:string,ar:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#e8f5e9;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+">"+"<div style='text-align:right;font-family:serif;font-size:9.5px;color:"+A+";'>"+ar+"</div>"+en+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  // Header
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127480;&#127462;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>KINGDOM OF<br/>SAUDI ARABIA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='text-align:right;font-size:14px;font-weight:700;color:"+A+";font-family:serif;margin-bottom:2px;'>&#1575;&#1604;&#1605;&#1605;&#1604;&#1603;&#1577; &#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577; &#1575;&#1604;&#1587;&#1593;&#1608;&#1583;&#1610;&#1577; &#8212; &#1608;&#1586;&#1575;&#1585;&#1577; &#1575;&#1604;&#1582;&#1575;&#1585;&#1580;&#1610;&#1577;</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>KINGDOM OF SAUDI ARABIA &#8212; MINISTRY OF FOREIGN AFFAIRS</div>");
  p("<div style='font-size:15px;font-weight:700;margin:3px 0 2px;'>VISA APPLICATION FORM &#8212; &#1606;&#1605;&#1608;&#1584;&#1580; &#1591;&#1604;&#1576; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577;</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>visa.mofa.gov.sa &#8226; MOFA Visa Form &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>&#1575;&#1604;&#1589;&#1608;&#1585;&#1577;<br/>PHOTO<br/>35x45mm</div>");
  p("</td></tr></table>");
  // Personal
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1588;&#1582;&#1589;&#1610;&#1577; / PERSONAL INFORMATION</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("1. Family Name / Surname","&#1575;&#1604;&#1604;&#1602;&#1576;","33%")+H("2. First Name","&#1575;&#1604;&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1608;&#1604;","33%")+H("3. Father's Name","&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1576;")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+D(v(r.fatherName)||"&#8212;")+"</tr>");
  p("<tr>"+H("4. Date of Birth","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","25%")+H("5. Place of Birth","&#1605;&#1603;&#1575;&#1606; &#1575;&#1604;&#1605;&#1610;&#1604;&#1575;&#1583;","25%")+H("6. Gender","&#1575;&#1604;&#1580;&#1606;&#1587;","25%")+H("7. Marital Status","&#1575;&#1604;&#1581;&#1575;&#1604;&#1577; &#1575;&#1604;&#1575;&#1580;&#1578;&#1605;&#1575;&#1593;&#1610;&#1577;")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth),"25%")+D(v(r.placeOfBirth),"25%")+D(v(r.gender),"25%")+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("8. Nationality","&#1575;&#1604;&#1580;&#1606;&#1587;&#1610;&#1577;","25%")+H("9. Religion","&#1575;&#1604;&#1583;&#1610;&#1606;","25%")+H("10. Occupation","&#1575;&#1604;&#1605;&#1607;&#1606;&#1577;","25%")+H("11. National ID No.","&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1608;&#1610;&#1577;")+"</tr>");
  p("<tr>"+D(v(r.nationality),"25%")+E("25%")+D(v(r.occupation),"25%")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("12. Mother's Full Name","&#1575;&#1587;&#1605; &#1575;&#1604;&#1571;&#1605;","33%")+H("13. Other Nationalities Held","&#1580;&#1606;&#1587;&#1610;&#1575;&#1578; &#1571;&#1582;&#1585;&#1609;","33%")+H("14. Blood Type","&#1601;&#1589;&#1610;&#1604;&#1577; &#1575;&#1604;&#1583;&#1605;")+"</tr>");
  p("<tr>"+D(v(r.motherName)||"&#8212;","33%")+D(v(r.multinationality)||"None","33%")+D(v(r.bloodType)||"&#8212;")+"</tr>");
  p("<tr>"+H("15. Permanent Address","&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606; &#1575;&#1604;&#1583;&#1575;&#1574;&#1605;",undefined,2)+H("16. Phone / &#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1575;&#1578;&#1601;")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("17. Email / &#1575;&#1604;&#1576;&#1585;&#1610;&#1583; &#1575;&#1604;&#1573;&#1604;&#1603;&#1578;&#1585;&#1608;&#1606;&#1610;","&#1575;&#1604;&#1576;&#1585;&#1610;&#1583; &#1575;&#1604;&#1573;&#1604;&#1603;&#1578;&#1585;&#1608;&#1606;&#1610;","50%")+H("18. WhatsApp","&#1585;&#1602;&#1605; &#1575;&#1604;&#1608;&#1575;&#1578;&#1587;&#1575;&#1576;","50%")+"</tr>");
  p("<tr>"+D(v(r.email),"50%")+D(v(r.whatsapp)||v(r.phoneNo))+"</tr></table>");
  // Passport
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#1576;&#1610;&#1575;&#1606;&#1575;&#1578; &#1580;&#1608;&#1575;&#1586; &#1575;&#1604;&#1587;&#1601;&#1585; / PASSPORT DETAILS</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("19. Passport Type","&#1606;&#1608;&#1593; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","25%")+H("20. Passport Number","&#1585;&#1602;&#1605; &#1575;&#1604;&#1580;&#1608;&#1575;&#1586;","25%")+H("21. Date of Issue","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","25%")+H("22. Date of Expiry","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1575;&#1606;&#1578;&#1607;&#1575;&#1569;")+"</tr>");
  p("<tr>"+D(v(r.passportType||"&#1593;&#1575;&#1583;&#1610; / Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("23. Issuing Authority / Place","&#1580;&#1607;&#1577; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","50%")+H("24. Country of Issue","&#1583;&#1608;&#1604;&#1577; &#1575;&#1604;&#1573;&#1589;&#1583;&#1575;&#1585;","50%")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"50%")+D(v(r.nationality))+"</tr></table>");
  // Visit
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#1578;&#1601;&#1575;&#1589;&#1610;&#1604; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577; / VISIT DETAILS</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("25. Purpose of Visit","&#1575;&#1604;&#1594;&#1585;&#1590; &#1605;&#1606; &#1575;&#1604;&#1586;&#1610;&#1575;&#1585;&#1577;","25%")+H("26. Arrival Date","&#1578;&#1575;&#1585;&#1610;&#1582; &#1575;&#1604;&#1608;&#1589;&#1608;&#1604;","25%")+H("27. Duration of Stay","&#1605;&#1583;&#1577; &#1575;&#1604;&#1573;&#1602;&#1575;&#1605;&#1577;","25%")+H("28. Visa Type","&#1606;&#1608;&#1593; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577;")+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E("25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; Single &#9744; Multiple &#9744; Transit</td></tr>");
  p("<tr>"+H("29. Address in Saudi Arabia","&#1575;&#1604;&#1593;&#1606;&#1608;&#1575;&#1606; &#1601;&#1610; &#1575;&#1604;&#1605;&#1605;&#1604;&#1603;&#1577;","33%")+H("30. Sponsor/Kafeel in Kingdom","&#1575;&#1604;&#1603;&#1601;&#1610;&#1604; &#1601;&#1610; &#1575;&#1604;&#1605;&#1605;&#1604;&#1603;&#1577;","33%")+H("31. Sponsor's ID/Iqama No.","&#1585;&#1602;&#1605; &#1575;&#1604;&#1607;&#1608;&#1610;&#1577; / &#1575;&#1604;&#1573;&#1602;&#1575;&#1605;&#1577;")+"</tr>");
  p("<tr>"+E("33%")+E("33%")+E()+"</tr>");
  p("<tr>"+H("32. Point of Entry to the Kingdom","&#1605;&#1606;&#1601;&#1584; &#1575;&#1604;&#1583;&#1582;&#1608;&#1604;",undefined,2)+H("33. Have you visited Saudi Arabia before?","&#1586;&#1610;&#1575;&#1585;&#1577; &#1587;&#1575;&#1576;&#1602;&#1577;")+"</tr>");
  p("<tr>"+E(undefined,2)+"<td style='border:1px solid #444;padding:4px 7px;font-size:9.5px;'>&#9744; &#1604;&#1575; No &nbsp; &#9744; &#1606;&#1593;&#1605; Yes &#8212; When: _______</td></tr></table>");
  // Declarations
  p("<div style='background:"+A+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#1575;&#1604;&#1578;&#1589;&#1585;&#1610;&#1581;&#1575;&#1578; / DECLARATIONS</div>");
  const qSA=["&#1607;&#1604; &#1587;&#1576;&#1602; &#1585;&#1601;&#1590; &#1591;&#1604;&#1576; &#1578;&#1571;&#1588;&#1610;&#1585;&#1578;&#1603; &#1573;&#1604;&#1609; &#1575;&#1604;&#1605;&#1605;&#1604;&#1603;&#1577;&#1567; / Have you ever been refused a visa to Saudi Arabia?",
    "&#1607;&#1604; &#1578;&#1605; &#1578;&#1585;&#1581;&#1610;&#1604;&#1603; &#1605;&#1606; &#1571;&#1610; &#1583;&#1608;&#1604;&#1577;&#1567; / Have you ever been deported from any country?",
    "&#1607;&#1604; &#1604;&#1583;&#1610;&#1603; &#1587;&#1580;&#1604; &#1580;&#1606;&#1575;&#1574;&#1610; &#1601;&#1610; &#1571;&#1610; &#1583;&#1608;&#1604;&#1577;&#1567; / Do you have a criminal record in any country?",
    "&#1607;&#1604; &#1571;&#1606;&#1578; &#1593;&#1590;&#1608; &#1601;&#1610; &#1605;&#1606;&#1592;&#1605;&#1577; &#1573;&#1585;&#1607;&#1575;&#1576;&#1610;&#1577;&#1567; / Are you a member of any terrorist organization?",
    "Do you have any serious communicable disease? / &#1607;&#1604; &#1578;&#1593;&#1575;&#1606;&#1610; &#1605;&#1606; &#1571;&#1610; &#1605;&#1585;&#1590; &#1605;&#1593;&#1583;&#1610;&#1577;&#1567;"];
  p("<table style='"+T+"'>");
  qSA.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;text-align:right;direction:rtl;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; &#1604;&#1575;<br/>No</td></tr>");
  });
  p("</table>");
  p("<div style='text-align:right;background:#e8f5e9;border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.7;direction:rtl;'>");
  p("<strong>&#1575;&#1604;&#1573;&#1602;&#1585;&#1575;&#1585;:</strong> &#1571;&#1602;&#1585; &#1576;&#1571;&#1606; &#1580;&#1605;&#1610;&#1593; &#1575;&#1604;&#1605;&#1593;&#1604;&#1608;&#1605;&#1575;&#1578; &#1575;&#1604;&#1608;&#1575;&#1585;&#1583;&#1577; &#1601;&#1610; &#1607;&#1584;&#1575; &#1575;&#1604;&#1591;&#1604;&#1576; &#1589;&#1581;&#1610;&#1581;&#1577; &#1608;&#1583;&#1602;&#1610;&#1602;&#1577; &#1608;&#1603;&#1575;&#1605;&#1604;&#1577;. <br/><span style='direction:ltr;display:block;text-align:left;'>DECLARATION: I declare that all information provided is true, accurate and complete. I understand that providing false information may result in refusal and legal proceedings.</span></div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:60%;'><div style='text-align:right;font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>&#1578;&#1608;&#1602;&#1610;&#1593; &#1605;&#1602;&#1583;&#1605; &#1575;&#1604;&#1591;&#1604;&#1576; / SIGNATURE OF APPLICANT</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;'><div style='text-align:right;font-weight:700;color:"+A+";margin-bottom:4px;'>&#1604;&#1604;&#1575;&#1587;&#1578;&#1582;&#1583;&#1575;&#1605; &#1575;&#1604;&#1585;&#1587;&#1605;&#1610; / FOR OFFICIAL USE ONLY</div>&#1585;&#1602;&#1605; &#1575;&#1604;&#1578;&#1571;&#1588;&#1610;&#1585;&#1577;: ___________<br/>&#1589;&#1575;&#1604;&#1581;&#1577;: ________________<br/>&#1575;&#1604;&#1605;&#1608;&#1592;&#1601;: ___________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Kingdom of Saudi Arabia &#8226; Ministry of Foreign Affairs &#8226; visa.mofa.gov.sa &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇮🇳 INDIA &#8212; e-Visa Application Form (Official)
   Source: indianvisaonline.gov.in &#8212; Exact field order
═══════════════════════════════════════════════════ */
function visaIndia(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-india"); const tds=td2();
  const A="#FF671F"; const BLUE="#06038D"; const GREEN="#046A38";
  const H=(t:string,hi:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#fff3e0;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+">"+"<div style='color:"+BLUE+";font-size:8.5px;'>"+hi+"</div>"+t+"</td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const CB=(label:string)=>"<span style='display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px;'>&#9744; "+label+"</span>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+BLUE+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127470;&#127475;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>GOVERNMENT<br/>OF INDIA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='font-size:10px;font-weight:700;color:"+BLUE+";'>BUREAU OF IMMIGRATION &#8212; MINISTRY OF HOME AFFAIRS, GOVERNMENT OF INDIA</div>");
  p("<div style='font-size:15px;font-weight:700;margin:3px 0 2px;'>ONLINE VISA APPLICATION FORM (e-VISA)</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>&#2349;&#2366;&#2352;&#2340; &#2311;-&#2357;&#2368;&#2360;&#2366; &#2310;&#2357;&#2375;&#2342;&#2344; &#2346;&#2340;&#2381;&#2352; (e-Tourist / e-Business / e-Medical / e-Conference)</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>indianvisaonline.gov.in &#8226; e-Visa Application &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>PHOTO<br/>2&#215;2 in.</div>");
  p("</td></tr></table>");
  // Visa type selection &#8212; exact from indianvisaonline.gov.in
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>TYPE OF e-VISA APPLIED FOR / &#2310;&#2357;&#2375;&#2342;&#2344; &#2325;&#2367; &#2357;&#2367;&#2332;&#2366; &#2325;&#2366; &#2346;&#2381;&#2352;&#2325;&#2366;&#2352;</div>");
  p("<table style='"+T+"'><tr><td style='border:1px solid #444;padding:5px 10px;font-size:10px;'>"+CB("e-Tourist Visa")+CB("e-Business Visa")+CB("e-Medical Visa")+CB("e-Medical Attendant")+CB("e-Conference Visa")+"</td></tr></table>");
  // Part A &#8212; Personal
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>PART A &#8212; PERSONAL DETAILS / &#2310;&#2340;&#2381;&#2350;&#2331;&#2367;&#2351; &#2358;&#2367;&#2325;&#2366;&#2351;&#2340;&#2368;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("A1. Surname (as in passport)","&#2313;&#2346;&#2344;&#2366;&#2350; (&#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335; &#2350;&#2375;&#2306; &#2332;&#2376;&#2360;&#2366;)","33%")+H("A2. Given Name(s)","&#2344;&#2366;&#2350; (&#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335; &#2350;&#2375;&#2306; &#2332;&#2376;&#2360;&#2366;)","33%")+H("A3. Date of Birth (DD/MM/YYYY)","&#2332;&#2344;&#2381;&#2350; &#2342;&#2367;&#2344;&#2366;&#2306;&#2325;")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+D(v(r.dateOfBirth))+"</tr>");
  p("<tr>"+H("A4. Place of Birth","&#2332;&#2344;&#2381;&#2350; &#2360;&#2381;&#2341;&#2366;&#2344;","25%")+H("A5. Country of Birth","&#2332;&#2344;&#2381;&#2350; &#2342;&#2375;&#2358;","25%")+H("A6. Gender","&#2354;&#2367;&#2306;&#2327;","25%")+H("A7. Marital Status","&#2357;&#2376;&#2357;&#2366;&#2361;&#2367;&#2325; &#2360;&#2381;&#2341;&#2367;&#2340;&#2367;")+"</tr>");
  p("<tr>"+D(v(r.placeOfBirth),"25%")+D(v(r.nationality),"25%")+D(v(r.gender),"25%")+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("A8. Present Nationality","&#2357;&#2352;&#2381;&#2340;&#2350;&#2366;&#2344; &#2352;&#2366;&#2359;&#2381;&#2335;&#2381;&#2352;&#2368;&#2351;&#2340;&#2366;","33%")+H("A9. Other Nationalities Held","&#2309;&#2344;&#2381;&#2351; &#2352;&#2366;&#2359;&#2381;&#2335;&#2381;&#2352;&#2368;&#2351;&#2340;&#2366;","33%")+H("A10. Religion","&#2343;&#2352;&#2381;&#2350;")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.multinationality)||"None","33%")+E()+"</tr>");
  p("<tr>"+H("A11. Father's Full Name","&#2346;&#2367;&#2340;&#2366; &#2325;&#2366; &#2344;&#2366;&#2350;","33%")+H("A12. Mother's Full Name","&#2350;&#2366;&#2340;&#2366; &#2325;&#2366; &#2344;&#2366;&#2350;","33%")+H("A13. National ID / Voter ID No.","&#2352;&#2366;&#2359;&#2381;&#2335;&#2381;&#2352;&#2368;&#2351; &#2346;&#2361;&#2330;&#2366;&#2344; &#2360;&#2306;&#2326;&#2381;&#2351;&#2366;")+"</tr>");
  p("<tr>"+D(v(r.fatherName)||"&#8212;","33%")+D(v(r.motherName)||"&#8212;","33%")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("A14. Occupation / &#2357;&#2381;&#2351;&#2357;&#2360;&#2366;&#2351;","&#2357;&#2381;&#2351;&#2357;&#2360;&#2366;&#2351;","25%")+H("A15. Employer / Institution","&#2344;&#2367;&#2351;&#2379;&#2325;&#2381;&#2340;&#2366; / &#2360;&#2306;&#2360;&#2381;&#2341;&#2366;","37%")+H("A16. Home Address","&#2230;&#2352; &#2325;&#2366; &#2346;&#2340;&#2366;")+"</tr>");
  p("<tr>"+D(v(r.occupation),"25%")+D(v(r.institutionName)||"&#8212;","37%")+D(v(r.address))+"</tr>");
  p("<tr>"+H("A17. Phone No.","&#2347;&#2379;&#2344; &#2344;&#2306;&#2305;.","25%")+H("A18. Mobile / WhatsApp","&#2350;&#2379;&#2348;&#2366;&#2311;&#2354;","25%")+H("A19. Email Address","&#2311;&#2350;&#2375;&#2354; &#2346;&#2340;&#2366;")+"</tr>");
  p("<tr>"+D(v(r.phoneNo),"25%")+D(v(r.whatsapp)||v(r.phoneNo),"25%")+D(v(r.email))+"</tr></table>");
  // Part B &#8212; Passport
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>PART B &#8212; PASSPORT DETAILS / &#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335; &#2357;&#2367;&#2357;&#2352;&#2339;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("B1. Type of Passport","&#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335; &#2325;&#2366; &#2346;&#2381;&#2352;&#2325;&#2366;&#2352;","25%")+H("B2. Passport Number","&#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335; &#2360;&#2306;&#2326;&#2381;&#2351;&#2366;","37%")+H("B3. Place of Issue","&#2332;&#2366;&#2352;&#2368; &#2325;&#2352;&#2344;&#2375; &#2325;&#2366; &#2360;&#2381;&#2341;&#2366;&#2344;")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Ordinary / &#2360;&#2366;&#2343;&#2366;&#2352;&#2339;"),"25%")+D(v(r.passportNo||r.nationalId),"37%")+D(v(r.passportPlaceOfIssue))+"</tr>");
  p("<tr>"+H("B4. Date of Issue (DD/MM/YYYY)","&#2332;&#2366;&#2352;&#2368; &#2325;&#2368; &#2340;&#2366;&#2352;&#2368;&#2326;","25%")+H("B5. Date of Expiry (DD/MM/YYYY)","&#2360;&#2350;&#2366;&#2346;&#2381;&#2340;&#2367; &#2325;&#2368; &#2340;&#2366;&#2352;&#2368;&#2326;","37%")+H("B6. Any other valid passports held?","&#2309;&#2344;&#2381;&#2351; &#2350;&#2366;&#2344;&#2381;&#2351; &#2346;&#2366;&#2360;&#2346;&#2379;&#2352;&#2381;&#2335;?")+"</tr>");
  p("<tr>"+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate),"37%")+D("&#9744; No &nbsp; &#9744; Yes")+"</tr></table>");
  // Part C &#8212; Travel
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>PART C &#8212; VISA &amp; TRAVEL DETAILS / &#2357;&#2367;&#2332;&#2366; &#2324;&#2352; &#2351;&#2366;&#2340;&#2381;&#2352;&#2366; &#2357;&#2367;&#2357;&#2352;&#2339;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("C1. Port of arrival in India","&#2310;&#2327;&#2350;&#2344; &#2325;&#2366; &#2349;&#2366;&#2352;&#2340;&#2368;&#2351; &#2310;&#2360;&#2352;&#2368;&#2344;&#2369;&#2350;&#2366; &#2332;&#2344;&#2346;&#2379;&#2352;&#2381;&#2335;","33%")+H("C2. Intended date of arrival (DD/MM/YYYY)","&#2310;&#2327;&#2350;&#2344; &#2325;&#2368; &#2352;&#2366;&#2358;&#2367;&#2349;&#2370;&#2340; &#2340;&#2366;&#2352;&#2368;&#2326;","33%")+H("C3. Duration of stay requested","&#2310;&#2357;&#2366;&#2360; &#2325;&#2368; &#2309;&#2357;&#2343;&#2367;")+"</tr>");
  p("<tr>"+E("33%")+E("33%")+E()+"</tr>");
  p("<tr>"+H("C4. Last country visited before India","&#2349;&#2366;&#2352;&#2340; &#2360;&#2375; &#2346;&#2361;&#2354;&#2375; &#2309;&#2306;&#2340;&#2367;&#2350; &#2342;&#2375;&#2358;","33%")+H("C5. Purpose of visiting India","&#2349;&#2366;&#2352;&#2340; &#2310;&#2344;&#2375; &#2325;&#2366; &#2313;&#2342;&#2381;&#2342;&#2375;&#2358;&#2381;&#2351;","33%")+H("C6. Have you previously visited India?","&#2349;&#2366;&#2352;&#2340; &#2358;&#2375;&#2320;&#2366;&#2344;&#2368; &#2360;&#2380;&#2369;&#2354;&#2366;&#2350;?")+"</tr>");
  p("<tr>"+E("33%")+E("33%")+D("&#9744; No &nbsp; &#9744; Yes &#8212; Year: ______")+"</tr>");
  p("<tr>"+H("C7. Reference / Sponsor / Contact in India","&#2349;&#2366;&#2352;&#2340; &#2350;&#2375;&#2306; &#2360;&#2306;&#2342;&#2352;&#2381;&#2349; / &#2346;&#2381;&#2352;&#2366;&#2351;&#2379;&#2332;&#2325;",undefined,2)+H("C8. Address of reference in India","&#2370;&#2357;&#2366;&#2360; &#2361;&#2375;&#2306; &#2344;&#2366;&#2350; &#2309;&#2330;&#2366;&#2352;&#2381;&#2351;&#2366;&#2337;&#2381;&#2360;")+"</tr>");
  p("<tr>"+E(undefined,2)+E()+"</tr></table>");
  // Part D &#8212; Background
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>PART D &#8212; BACKGROUND INFORMATION / &#2346;&#2370;&#2352;&#2381;&#2357; &#2332;&#2366;&#2344;&#2325;&#2366;&#2352;&#2368;</div>");
  const qIN=["Have you ever been refused a visa or entry to India? / &#2325;&#2381;&#2351;&#2366; &#2309;&#2366;&#2346;&#2325;&#2379; &#2332;&#2350;&#2381;&#2350;&#2375;&#2348;&#2306;&#2342;&#2368; &#2325;&#2349;&#2368; &#2342;&#2368; &#2327;&#2312;?",
    "Have you ever been deported from India or any other country? / &#2325;&#2381;&#2351;&#2366; &#2310;&#2346;&#2325;&#2379; &#2325;&#2349;&#2368; &#2344;&#2367;&#2352;&#2381;&#2357;&#2366;&#2360;&#2367;&#2340; &#2325;&#2367;&#2351;&#2366; &#2327;&#2351;&#2366;?",
    "Do you have a criminal record in any country? / &#2325;&#2381;&#2351;&#2366; &#2310;&#2346;&#2325;&#2366; &#2325;&#2367;&#2360;&#2368; &#2342;&#2375;&#2358; &#2350;&#2375;&#2306; &#2310;&#2346;&#2352;&#2366;&#2343;&#2367;&#2325; &#2310;&#2349;&#2367;&#2354;&#2375;&#2326; &#2361;&#2376;?",
    "Are you or were you ever member of a terrorist/extremist organization? / &#2325;&#2381;&#2351;&#2366; &#2310;&#2346; &#2325;&#2367;&#2360;&#2368; &#2310;&#2340;&#2306;&#2325;&#2357;&#2366;&#2342;&#2368; &#2360;&#2306;&#2327;&#2336;&#2344; &#2325;&#2375; &#2360;&#2342;&#2360;&#2381;&#2351; &#2361;&#2376;&#2306;?",
    "Do you have any serious communicable disease? / &#2325;&#2381;&#2351;&#2366; &#2310;&#2346;&#2325;&#2379; &#2325;&#2379;&#2312; &#2327;&#2306;&#2349;&#2368;&#2352; &#2360;&#2306;&#2330;&#2366;&#2352;&#2368; &#2352;&#2379;&#2327; &#2361;&#2376;?",
    "Have you ever been involved in espionage? / &#2325;&#2381;&#2351;&#2366; &#2310;&#2346; &#2332;&#2366;&#2360;&#2370;&#2360;&#2368; &#2350;&#2375;&#2306; &#2358;&#2366;&#2350;&#2367;&#2354; &#2352;&#2361;&#2375; &#2361;&#2376;&#2306;?"];
  p("<table style='"+T+"'>");
  qIN.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; No</td></tr>");
  });
  p("</table>");
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#fff8f0;'>");
  p("<strong>DECLARATION / &#2358;&#2346;&#2925;:</strong> I hereby declare that all the information provided by me in this application is correct, true and I take full responsibility of the same. / &#2350;&#2376;&#2306; &#2319;2340;&#2348;&#2366;&#2352;&#2368; &#2328;&#2379;&#2359;&#2339;&#2366; &#2325;&#2352;&#2340;&#2366;/&#2325;&#2352;&#2340;&#2368; &#2361;&#2370;&#2306; &#2325;&#2367; &#2311;&#2360; &#2310;&#2357;&#2375;&#2342;&#2344; &#2350;&#2375;&#2306; &#2342;&#2368; &#2327;&#2312; &#2360;&#2351;&#2368; &#2332;&#2366;&#2344;&#2325;&#2366;&#2352;&#2368; &#2360;&#2361;&#2368;, &#2360;&#2330;&#2381;&#2330;&#2368; &#2324;&#2352; &#2346;&#2370;&#2352;&#2381;&#2339; &#2361;&#2376;.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:65%;'><div style='font-size:8px;font-weight:700;color:"+BLUE+";margin-bottom:5px;'>SIGNATURE OF APPLICANT / &#2310;&#2357;&#2375;&#2342;&#2325; &#2325;&#2375; &#2361;&#2360;&#2381;&#2340;&#2366;&#2325;&#2381;&#2359;&#2352;</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;color:#555;'>Nationality: "+v(r.nationality)+"<br/>DOB: "+v(r.dateOfBirth)+"<br/>Passport: "+v(r.passportNo||r.nationalId)+"<br/>Ref: "+id+"</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Bureau of Immigration &#8226; Ministry of Home Affairs, Government of India &#8226; indianvisaonline.gov.in &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇨🇳 CHINA &#8212; Visa Application Form V.2013 (Official)
   Source: visaforchina.cn &#8212; Exact numbered fields
═══════════════════════════════════════════════════ */
function visaChina(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-china"); const tds=td2();
  const A="#C8102E"; const GOLD="#FFDE00";
  const H=(zh:string,en:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#fff0f0;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+">"+"<div style='color:"+A+";font-size:9px;font-weight:700;'>"+zh+"</div><div style='color:#444;font-size:8px;'>"+en+"</div></td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const CB=(label:string)=>"<span style='display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px;'>&#9744; "+label+"</span>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127464;&#127475;</div><div style='font-size:6.5px;color:"+GOLD+";font-weight:700;margin-top:3px;'>PEOPLE'S<br/>REPUBLIC<br/>OF CHINA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='text-align:center;font-size:13px;font-weight:700;color:"+A+";'>&#20013;&#21326;&#20154;&#27665;&#20849;&#21644;&#22269;&#31614;&#35777;&#30003;&#35831;&#34920;</div>");
  p("<div style='text-align:center;font-size:15px;font-weight:700;margin:3px 0 2px;'>VISA APPLICATION FORM OF THE PEOPLE'S REPUBLIC OF CHINA</div>");
  p("<div style='text-align:center;font-size:9px;color:#555;'>Embassy/Consulate-General of the People's Republic of China</div>");
  p("<div style='text-align:center;font-size:8px;color:#555;margin-top:2px;'>visaforchina.cn / visaforchina.org &#8226; Form V.2013 &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>&#29031;&#29255;<br/>Photo<br/>48&#215;33mm</div>");
  p("</td></tr></table>");
  // Official use box &#8212; top of form as in real V.2013
  p("<table style='"+T+"'><tr>");
  p("<td style='border:1px solid #444;padding:4px 8px;width:75%;font-size:8px;'><strong style='color:"+A+";'>FOR OFFICIAL USE ONLY / &#20165;&#20379;&#39057;&#39034;&#20351;&#29992;</strong><table style='width:100%;border-collapse:collapse;margin-top:3px;font-size:8px;'><tr><td style='border:1px solid #aaa;padding:2px 4px;'>&#31614;&#35777;&#31867;&#21035; Visa Category:<br/><br/></td><td style='border:1px solid #aaa;padding:2px 4px;'>&#31614;&#35777;&#26377;&#25928;&#26399; Valid Until:<br/><br/></td><td style='border:1px solid #aaa;padding:2px 4px;'>&#20837;&#22659;&#27425;&#25968; No. of Entries:<br/><br/></td><td style='border:1px solid #aaa;padding:2px 4px;'>&#31614;&#35777;&#21495;&#30721; Visa No.:<br/><br/></td><td style='border:1px solid #aaa;padding:2px 4px;'>&#24341;&#25509;&#20154;&#21592; Officer:<br/><br/></td></tr></table></td>");
  p("<td style='border:1px solid #444;padding:4px 8px;font-size:8px;color:#555;'>&#30003;&#35831;&#32534;&#21495; App.ID:<br/>"+id+"</td></tr></table>");
  // Personal &#8212; exact V.2013 field numbers
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#20491;&#20154;&#20449;&#24687; PERSONAL INFORMATION</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("1. &#22995;","1. Family Name / Surname",undefined,2)+H("&#29255;","Photo Box (Attached separately)")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:5px 7px;font-size:12px;font-weight:700;' colspan='2'>"+v(r.surname)+"</td><td style='border:1px solid #444;padding:2px;' rowspan='8'><div style='border:1px dashed #bbb;width:80px;height:100px;margin:4px auto;display:flex;align-items:center;justify-content:center;font-size:8px;color:#bbb;text-align:center;'>"+( r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;'/>":"&#29031;&#29255;<br/>PHOTO")+"</div></td></tr>");
  p("<tr>"+H("2. &#30067;&#30010;&#22995; (&#26354;&#22969;&#22995;)","2. Maiden Name / Former Surname",undefined,2)+"</tr>");
  p("<tr>"+E(undefined,2)+"</tr>");
  p("<tr>"+H("3. &#540;","3. First Name / Given Name(s)",undefined,2)+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:5px 7px;font-size:12px;font-weight:700;' colspan='2'>"+v(r.name)+"</td></tr>");
  p("<tr>"+H("4. &#20986;&#29983;&#26085;&#26399;","4. Date of Birth (YYYY-MM-DD)")+"<td style='border:1px solid #444;padding:5px 7px;font-size:12px;font-weight:700;'>"+v(r.dateOfBirth)+"</td></tr>");
  p("<tr>"+H("5. &#20986;&#29983;&#22320;","5. Place of Birth")+"<td style='border:1px solid #444;padding:5px 7px;font-size:12px;font-weight:700;'>"+v(r.placeOfBirth)+"</td></tr>");
  p("<tr>"+H("6. &#24615;&#21035;","6. Sex")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("&#30007; Male")+CB("&#22899; Female")+"<br/><strong style='font-size:11px;'>"+v(r.gender)+"</strong></td></tr>");
  p("<tr>"+H("7. &#29616;&#22312;&#22269;&#31807;","7. Present Nationality","33%")+H("8. &#21407;&#22269;&#31807;","8. Nationality at Birth","33%")+H("9. &#5A5A;&#23567;&#29366;&#20917;","9. Marital Status")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.nationality),"33%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("&#26410;&#5A5A; Single")+CB("&#5DF2;&#5A5A; Married")+CB("&#31983;&#20854;&#20182; Other")+"<br/><strong style='font-size:11px;'>"+v(r.maritalStatus)+"</strong></td></tr>");
  p("<tr>"+H("10. &#29238;&#20551;&#59302;&#21517;","10. Father's Full Name","33%")+H("11. &#27597;&#20551;&#59302;&#21517;","11. Mother's Full Name","33%")+H("12. &#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#26631;&#35782;&#31614;&#35777;","12. Are you an overseas Chinese?")+"</tr>");
  p("<tr>"+D(v(r.fatherName)||"&#8212;","33%")+D(v(r.motherName)||"&#8212;","33%")+D("&#9744; &#26159; Yes &nbsp; &#9744; &#21542; No")+"</tr>");
  p("<tr>"+H("13. &#32844;&#19994;","13. Occupation","25%")+H("14. &#24037;&#20316;&#21333;&#20301;","14. Employer/Institution","37%")+H("15. &#22269;&#23478;&#36523;&#20221;&#35777;&#21495;&#30721;","15. National ID Card No.")+"</tr>");
  p("<tr>"+D(v(r.occupation),"25%")+D(v(r.institutionName)||"&#8212;","37%")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("16. &#25143;&#31807;&#22320;&#22362;","16. Permanent Address",undefined,2)+H("17. &#29616;&#22312;&#23621;&#20住;&#22320;&#22362;","17. Present Address")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.address))+"</tr>");
  p("<tr>"+H("18. &#30005;&#35805;&#21495;&#30721;","18. Phone Number","33%")+H("19. &#30005;&#23376;&#37038;&#20214;","19. Email Address","33%")+H("20. &#32512;&#20805;&#32852;&#32852;&#20154;","20. Emergency Contact")+"</tr>");
  p("<tr>"+D(v(r.phoneNo),"33%")+D(v(r.email),"33%")+D(v(r.emergencyContact1?.name)||"&#8212;")+"</tr></table>");
  // Passport
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#25252;&#29031;&#20449;&#24687; PASSPORT INFORMATION</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("21. &#25252;&#29031;&#31867;&#22411;","21. Passport Type","25%")+H("22. &#25252;&#29031;&#21495;&#30721;","22. Passport Number","25%")+H("23. &#31614;&#21457;&#26085;&#26399;","23. Date of Issue","25%")+H("24. &#26377;&#25928;&#26399;&#33267;","24. Date of Expiry")+"</tr>");
  p("<tr>"+D(v(r.passportType||"&#26222;&#36890;&#25252;&#29031; Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("25. &#31614;&#21457;&#22320;&#28857;","25. Place of Issue","50%")+H("26. &#25252;&#29031;&#31614;&#21457;&#22269;","26. Issuing Country","50%")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"50%")+D(v(r.nationality))+"</tr></table>");
  // Travel info
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#34892;&#31243;&#20449;&#24687; TRAVEL INFORMATION</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("27. &#30003;&#35831;&#31614;&#35777;&#31867;&#21035;","27. Type of Visa Applied For","25%")+H("28. &#30003;&#35831;&#20837;&#22659;&#27425;&#25968;","28. Number of Entries Requested","25%")+H("29. &#20837;&#22659;&#26085;&#26399;","29. Expected Date of Entry","25%")+H("30. &#30041;&#23431;&#26102;&#38388;","30. Intended Duration of Stay")+"</tr>");
  p("<tr>"+D("L (&#26097;&#28216;/Tourism)")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("&#19968;&#27425; Single")+CB("&#20108;&#27425; Double")+CB("&#22810;&#27425; Multiple")+"</td>"+E("25%")+E()+"</tr>");
  p("<tr>"+H("31. &#22312;&#21326;&#23545;&#29289;&#22320;&#22336;","31. Address in China",undefined,2)+H("32. &#37319;&#35831;&#25110;&#36152;&#35831;&#20154;&#21592;&#20449;&#24687;","32. Inviting Unit/Individual",undefined,1)+"</tr>");
  p("<tr>"+E(undefined,2)+E()+"</tr>");
  p("<tr>"+H("33. &#20043;&#21069;&#26159;&#21542;&#26469;&#36807;&#20013;&#22269;?","33. Have you previously visited China?",undefined,2)+H("34. &#26080;&#29616;&#26377;&#25346;&#20018;&#22312;&#36523;&#25628;&#36523;&#19978;?","34. Do you have criminal record?")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:10px;' colspan='2'>"+CB("&#26159; Yes &#8212; Year/&#24180;&#20221;: _______")+CB("&#21542; No")+"</td><td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("&#26159; Yes")+CB("&#21542; No")+"</td></tr></table>");
  // Declarations
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>&#30003;&#35831;&#20154;&#22768;&#26126; APPLICANT'S DECLARATION</div>");
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#fff8f8;'>");
  p("<strong>&#22768;&#26126; DECLARATION:</strong> &#26412;&#20154;&#22768;&#26126;&#65292;&#26412;&#30003;&#35831;&#34920;&#19978;&#25152;&#22586;&#20449;&#24687;&#20551;&#23454;&#12289;&#20934;&#30830;&#12289;&#23436;&#25972;&#12290; / I hereby declare that all information given in this application form is complete, true and accurate. Providing false or misleading information may result in refusal of visa, deportation or other legal actions.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:60%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>&#30003;&#35831;&#20154;&#31614;&#21517; SIGNATURE OF APPLICANT / &#26085;&#26399; DATE</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;'><div style='font-weight:700;color:"+A+";margin-bottom:4px;'>&#20165;&#20379;&#39057;&#39034;&#20351;&#29992; OFFICIAL USE ONLY</div>&#31614;&#35777;&#21495;: _______________<br/>&#26377;&#25928;&#26399;: ________________<br/>&#24341;&#25509;&#20154;&#21592;: _______________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Embassy/Consulate-General of the People's Republic of China &#8226; visaforchina.cn &#8226; Form V.2013 &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇲🇾 MALAYSIA &#8212; IMM.57 eVISA Application Form (Official)
   Source: imi.gov.my &#8212; Exact Malay/English bilingual fields
═══════════════════════════════════════════════════ */
function visaMalaysia(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-malaysia"); const tds=td2();
  const A="#CC0001"; const BLUE="#003087"; const GOLD="#f8c300";
  const H=(ms:string,en:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#e8eeff;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+">"+"<div style='color:"+BLUE+";font-size:8.5px;'>"+ms+"</div><div style='color:#444;font-size:7.5px;'>"+en+"</div></td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const CB=(label:string)=>"<span style='display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px;'>&#9744; "+label+"</span>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+BLUE+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127474;&#127486;</div><div style='font-size:6.5px;color:#fff;font-weight:700;margin-top:3px;'>JABATAN<br/>IMIGRESEN<br/>MALAYSIA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='font-size:10px;font-weight:700;color:"+BLUE+";'>JABATAN IMIGRESEN MALAYSIA &#8212; IMMIGRATION DEPARTMENT OF MALAYSIA</div>");
  p("<div style='font-size:14px;font-weight:700;margin:3px 0 2px;'>BORANG PERMOHONAN e-VISA (IMM.57)</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>eVISA APPLICATION FORM</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>imi.gov.my / windowmalaysia.com.my &#8226; IMM.57 &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>Gambar<br/>Photo<br/>35&#215;50mm</div>");
  p("</td></tr></table>");
  // Jenis visa
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>JENIS VISA / TYPE OF VISA APPLIED</div>");
  p("<table style='"+T+"'><tr><td style='border:1px solid #444;padding:5px 10px;font-size:10px;'>"+CB("Pelancong / Tourist")+CB("Perniagaan / Business")+CB("Sosial / Social")+CB("Transit")+CB("Lain-lain / Others: ___________")+"</td></tr></table>");
  // Bahagian A &#8212; Maklumat Peribadi
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>BAHAGIAN A &#8212; MAKLUMAT PERIBADI / SECTION A &#8212; PERSONAL DETAILS</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("A1. Nama Keluarga","Family Name","33%")+H("A2. Nama Pertama","First Name","33%")+H("A3. Nama Lain-lain (jika ada)","Other Names (if any)")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+E()+"</tr>");
  p("<tr>"+H("A4. Tarikh Lahir (HH/BB/TTTT)","Date of Birth (DD/MM/YYYY)","25%")+H("A5. Tempat Lahir","Place of Birth","25%")+H("A6. Jantina","Sex","25%")+H("A7. Status Perkahwinan","Marital Status")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth),"25%")+D(v(r.placeOfBirth),"25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("Lelaki / Male")+CB("Perempuan / Female")+"<br/><strong>"+v(r.gender)+"</strong></td>"+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("A8. Kewarganegaraan","Nationality","33%")+H("A9. Kewarganegaraan Lain","Other Nationalities","33%")+H("A10. Agama","Religion")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.multinationality)||"Tiada / None","33%")+E()+"</tr>");
  p("<tr>"+H("A11. No. Kad Pengenalan Negara","National ID Number","33%")+H("A12. Pekerjaan","Occupation","33%")+H("A13. Majikan / Institusi","Employer / Institution")+"</tr>");
  p("<tr>"+D(v(r.nationalId),"33%")+D(v(r.occupation),"33%")+D(v(r.institutionName)||"&#8212;")+"</tr>");
  p("<tr>"+H("A14. Nama Bapa","Father's Name","33%")+H("A15. Nama Ibu","Mother's Name","33%")+H("A16. Golongan Darah","Blood Group")+"</tr>");
  p("<tr>"+D(v(r.fatherName)||"&#8212;","33%")+D(v(r.motherName)||"&#8212;","33%")+D(v(r.bloodType)||"&#8212;")+"</tr>");
  p("<tr>"+H("A17. Alamat Kediaman Tetap","Permanent Home Address",undefined,2)+H("A18. No. Telefon","Phone Number")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("A19. Emel","Email Address","50%")+H("A20. No. WhatsApp","WhatsApp Number","50%")+"</tr>");
  p("<tr>"+D(v(r.email),"50%")+D(v(r.whatsapp)||v(r.phoneNo))+"</tr></table>");
  // Bahagian B &#8212; Pasport
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>BAHAGIAN B &#8212; MAKLUMAT PASPORT / SECTION B &#8212; PASSPORT DETAILS</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("B1. Jenis Pasport","Passport Type","25%")+H("B2. No. Pasport","Passport Number","25%")+H("B3. Tarikh Dikeluarkan","Date of Issue","25%")+H("B4. Tarikh Tamat Tempoh","Date of Expiry")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Biasa / Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("B5. Tempat Dikeluarkan","Place of Issue","50%")+H("B6. Negara Mengeluarkan","Issuing Country","50%")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"50%")+D(v(r.nationality))+"</tr></table>");
  // Bahagian C &#8212; Butiran Perjalanan
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>BAHAGIAN C &#8212; BUTIRAN PERJALANAN / SECTION C &#8212; TRAVEL DETAILS</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("C1. Tarikh Ketibaan","Arrival Date","25%")+H("C2. Tempoh Tinggal","Duration of Stay","25%")+H("C3. Tujuan Lawatan","Purpose of Visit","25%")+H("C4. Jenis Kemasukan","Type of Entry")+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E("25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("Tunggal / Single")+CB("Berganda / Multiple")+"</td></tr>");
  p("<tr>"+H("C5. Lapangan Terbang / Pintu Masuk","Port of Entry","33%")+H("C6. Alamat di Malaysia","Address in Malaysia","33%")+H("C7. Penaja di Malaysia","Sponsor in Malaysia")+"</tr>");
  p("<tr>"+E("33%")+E("33%")+E()+"</tr>");
  p("<tr>"+H("C8. Pernah melawat Malaysia sebelum ini?","Have you visited Malaysia before?",undefined,2)+H("C9. Tarikh lawatan terakhir","Date of last visit")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:10px;' colspan='2'>"+CB("Tidak / No")+CB("Ya / Yes &#8212; Bila/When: _______")+"</td>"+E()+"</tr></table>");
  // Bahagian D &#8212; Pengakuan
  p("<div style='background:"+BLUE+";color:#fff;padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>BAHAGIAN D &#8212; PENGISYTIHARAN / SECTION D &#8212; DECLARATION</div>");
  const qMY=["Pernahkah anda ditolak visa atau kebenaran masuk ke Malaysia? / Have you ever been refused a visa or entry into Malaysia?",
    "Pernahkah anda dideportasi dari mana-mana negara? / Have you ever been deported from any country?",
    "Adakah anda mempunyai rekod jenayah di mana-mana negara? / Do you have a criminal record in any country?",
    "Adakah anda anggota organisasi pengganas atau ekstremis? / Are you a member of any terrorist or extremist organization?",
    "Adakah anda mempunyai penyakit berjangkit yang serius? / Do you have any serious communicable diseases?"];
  p("<table style='"+T+"'>");
  qMY.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; Tidak<br/>No</td></tr>");
  });
  p("</table>");
  p("<div style='border:1px solid "+BLUE+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#f0f4ff;'>");
  p("<strong>PERISYTIHARAN / DECLARATION:</strong> Saya dengan ini mengisytiharkan bahawa semua maklumat yang diberikan adalah benar, tepat dan lengkap. / I hereby declare that all information provided is true, accurate and complete. Maklumat palsu boleh menyebabkan permohonan ditolak. / False information may result in refusal of visa.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:60%;'><div style='font-size:8px;font-weight:700;color:"+BLUE+";margin-bottom:5px;'>TANDATANGAN PEMOHON / APPLICANT'S SIGNATURE</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;'><div style='font-weight:700;color:"+BLUE+";margin-bottom:4px;'>UNTUK KEGUNAAN RASMI / OFFICIAL USE</div>No. Visa: _______________<br/>Sah / Valid: ________________<br/>Pegawai / Officer: _______________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Jabatan Imigresen Malaysia &#8226; IMM.57 eVISA Application Form &#8226; imi.gov.my &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

/* ═══════════════════════════════════════════════════
   🇪🇹 ETHIOPIA &#8212; Immigration and Citizenship Service e-Visa Form
   Source: evisa.gov.et &#8212; Official numbered field structure
═══════════════════════════════════════════════════ */
function visaEthiopia(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-ethiopia"); const tds=td2();
  const A="#009A44"; const RED="#EF3340"; const GOLD="#FCDD09";
  const H=(en:string,am:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#e8f5e9;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+">"+"<div style='color:"+A+";font-size:8.5px;'>"+en+"</div><div style='color:#444;font-size:8px;'>"+am+"</div></td>";
  const D=(val:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:5px 7px;font-size:11px;font-weight:700;min-height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":"")+">"+val+"</td>";
  const E=(w?:string,cs?:number)=>"<td style=\"border:1px solid #444;height:24px;"+(w?"width:"+w+";":"")+"\"" +(cs?" colspan=\""+cs+"\"":" ")+"></td>";
  const T="width:100%;border-collapse:collapse;margin:0;font-family:'Times New Roman',serif;";
  const CB=(label:string)=>"<span style='display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px;'>&#9744; "+label+"</span>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style=\"font-family:'Times New Roman',serif;max-width:790px;margin:0 auto;padding:20px 22px;background:#fff;color:#000;\">");
  p("<table style='"+T+"margin-bottom:0;'><tr>");
  p("<td style='border:2px solid "+A+";background:"+A+";padding:10px 8px;width:14%;text-align:center;'><div style='font-size:28px;'>&#127466;&#127481;</div><div style='font-size:6.5px;color:"+GOLD+";font-weight:700;margin-top:3px;'>FDRE<br/>ETHIOPIA</div></td>");
  p("<td style='border:2px solid "+A+";padding:9px;'>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>IMMIGRATION AND CITIZENSHIP SERVICE &#8212; FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</div>");
  p("<div style='font-size:14px;font-weight:700;margin:3px 0 2px;'>ETHIOPIA e-VISA APPLICATION FORM</div>");
  p("<div style='font-size:10px;font-weight:700;color:"+A+";'>&#4843;&#4724;&#4844;&#4653;&#4661; &#4732;&#4720;&#4566; &#4635;&#4596;&#4646;&#4621;&#4608; &#4608;&#4695;&#4783; (&#4773;-&#4732;&#4720;&#4566;)</div>");
  p("<div style='font-size:8px;color:#555;margin-top:2px;'>evisa.gov.et &#8226; ICS e-Visa Form &#8226; Ref: "+id+" &#8226; "+tds+"</div></td>");
  p("<td style='border:2px solid "+A+";padding:5px;width:13%;text-align:center;'>");
  p(r.photo?"<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;display:block;margin:0 auto;'/>":"<div style='border:1px solid #aaa;width:80px;height:100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;color:#888;text-align:center;'>&#128247;<br/>&#4734;&#4808;&#4650;&#4795;<br/>Photo<br/>35&#215;45mm</div>");
  p("</td></tr></table>");
  // Visa type
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>TYPE OF e-VISA / &#4773;-&#4732;&#4720;&#4566; &#4773;&#4739;&#4638;</div>");
  p("<table style='"+T+"'><tr><td style='border:1px solid #444;padding:5px 10px;font-size:10px;'>"+CB("e-Tourist Visa")+CB("e-Business Visa")+CB("Transit Visa")+CB("Conference Visa")+CB("Other: ___________")+"</td></tr></table>");
  // Section 1 &#8212; Personal
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION 1 &#8212; PERSONAL INFORMATION / &#4771;&#4661;&#4621;&#4575; 1 &#8212; &#4613;&#4878;&#4633; &#4850;&#4809;&#4880;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("1. Last Name (Surname)","&#4764;&#4808;&#4723; (&#4723;&#4651;&#4723;)","33%")+H("2. First Name","&#4723;&#4651;&#4723;","33%")+H("3. Middle Name","&#4781;&#4593;&#4711; &#4723;&#4651;&#4723;")+"</tr>");
  p("<tr>"+D(v(r.surname),"33%")+D(v(r.name),"33%")+E()+"</tr>");
  p("<tr>"+H("4. Date of Birth (DD/MM/YYYY)","&#4873;&#4651;&#4843; (&#4621;&#4651;/&#4653;&#4735;/&#4637;&#4803;)","25%")+H("5. Place of Birth","&#4873;&#4651;&#4843; &#4637;&#4655;&#4768;","25%")+H("6. Gender","&#4829;&#4649;","25%")+H("7. Marital Status","&#4795;&#4647;&#4755; &#4779;&#4751;")+"</tr>");
  p("<tr>"+D(v(r.dateOfBirth),"25%")+D(v(r.placeOfBirth),"25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("Male / &#4792;&#4854;")+CB("Female / &#4764;&#4855;&#4661;")+"<br/><strong>"+v(r.gender)+"</strong></td>"+D(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("8. Nationality","&#4843;&#4854;&#4821; &#4757;&#4799;","33%")+H("9. Other Nationalities","&#4650;&#4804;&#4812; &#4843;&#4854;&#4821;","33%")+H("10. Religion (Optional)","&#4747;&#4721; (&#4661;&#4613;&#4766;&#4639;&#4813;)")+"</tr>");
  p("<tr>"+D(v(r.nationality),"33%")+D(v(r.multinationality)||"None","33%")+E()+"</tr>");
  p("<tr>"+H("11. Father's Full Name","&#4779;&#4755; &#4726;&#4755; &#4723;&#4651;&#4723;","33%")+H("12. Mother's Full Name","&#4791;&#4725; &#4726;&#4755; &#4723;&#4651;&#4723;","33%")+H("13. National ID Number","&#4833;&#4650;&#4771;&#4707; &#4639;&#4705;&#4795; &#4613;&#4621;&#4875;")+"</tr>");
  p("<tr>"+D(v(r.fatherName)||"&#8212;","33%")+D(v(r.motherName)||"&#8212;","33%")+D(v(r.nationalId))+"</tr>");
  p("<tr>"+H("14. Occupation / Profession","&#4757;&#4724;&#4651; / &#4638;&#4811;&#4755;","25%")+H("15. Employer / Institution","&#4651;&#4848;&#4691;&#4735; / &#4661;&#4613;&#4752;","25%")+H("16. Blood Type","&#4809;&#4880; &#4659;&#4595;","25%")+H("17. Educational Level","&#4613;&#4771;&#4636;")+"</tr>");
  p("<tr>"+D(v(r.occupation),"25%")+D(v(r.institutionName)||"&#8212;","25%")+D(v(r.bloodType)||"&#8212;","25%")+E()+"</tr>");
  p("<tr>"+H("18. Permanent Home Address","&#4661;&#4756;&#4671;&#4791; &#4638;&#4710;&#4623;&#4785; &#4611;&#4661;&#4803;",undefined,2)+H("19. Phone Number","&#4701;&#4611; &#4616;&#4651;&#4803;")+"</tr>");
  p("<tr>"+D(v(r.address),undefined,2)+D(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("20. Email Address","&#4739;&#4651;&#4771; &#4613;&#4707;&#4739;&#4651;&#4771;&#4803;","50%")+H("21. WhatsApp / Mobile","&#4791;&#4725; &#4701;&#4611;","50%")+"</tr>");
  p("<tr>"+D(v(r.email),"50%")+D(v(r.whatsapp)||v(r.phoneNo))+"</tr></table>");
  // Section 2 &#8212; Passport
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION 2 &#8212; TRAVEL DOCUMENT / &#4771;&#4661;&#4621;&#4575; 2 &#8212; &#4847;&#4705;&#4643;&#4813;&#4791; &#4887;&#4593;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("22. Passport Type","&#4847;&#4705;&#4643;&#4813;&#4791; &#4759;&#4805;","25%")+H("23. Passport Number","&#4847;&#4705;&#4643;&#4813;&#4791; &#4621;&#4651;&#4803;","25%")+H("24. Date of Issue","&#4873;&#4651; &#4637;&#4803; (DD/MM/YY)","25%")+H("25. Date of Expiry","&#4873;&#4651; &#4617;&#4815;&#4623;&#4803;")+"</tr>");
  p("<tr>"+D(v(r.passportType||"Ordinary"),"25%")+D(v(r.passportNo||r.nationalId),"25%")+D(v(r.passportIssueDate),"25%")+D(v(r.passportExpiryDate))+"</tr>");
  p("<tr>"+H("26. Issuing Authority","&#4873;&#4651;&#4843; &#4749;&#4899;","33%")+H("27. Place of Issue","&#4873;&#4651;&#4843; &#4637;&#4655;&#4768;","33%")+H("28. Issuing Country","&#4849;&#4655;&#4761; &#4843;&#4854;&#4821;")+"</tr>");
  p("<tr>"+D(v(r.passportPlaceOfIssue),"33%")+D(v(r.passportPlaceOfIssue),"33%")+D(v(r.nationality))+"</tr></table>");
  // Section 3 &#8212; Travel
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION 3 &#8212; TRAVEL DETAILS / &#4771;&#4661;&#4621;&#4575; 3 &#8212; &#4897;&#4685;&#4651;&#4771; &#4748;&#4654;&#4657;&#4778;</div>");
  p("<table style='"+T+"'>");
  p("<tr>"+H("29. Purpose of Visit","&#4893;&#4661;&#4607;&#4637; &#4843;&#4661;&#4613;&#4805;","25%")+H("30. Intended Date of Arrival","&#4617;&#4615;&#4817;&#4791; &#4873;&#4651;","25%")+H("31. Duration of Stay","&#4761;&#4655;&#4893;&#4795; &#4613;&#4661;&#4803;","25%")+H("32. Visa Type Requested","&#4613;&#4739;&#4651;&#4771;&#4803; &#4759;&#4805;")+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E("25%")+"<td style='border:1px solid #444;padding:4px 7px;font-size:10px;'>"+CB("Single")+CB("Multiple")+CB("Transit")+"</td></tr>");
  p("<tr>"+H("33. Port of Entry","&#4617;&#4615;&#4817;&#4791; &#4617;&#4651;&#4743;","25%")+H("34. Address in Ethiopia","&#4837;&#4611; &#4787;&#4611;&#4803;","25%")+H("35. Sponsor/Contact in Ethiopia","&#4661;&#4615;&#4789;&#4643;&#4813; &#4811;&#4643; &#4617;&#4615;&#4817;&#4791;",undefined,1)+"</tr>");
  p("<tr>"+E("25%")+E("25%")+E()+"</tr>");
  p("<tr>"+H("36. Have you previously visited Ethiopia?","&#4811;&#4631;&#4691; &#4833;&#4759; &#4837;&#4611; &#4861;&#4795;&#4613;&#4819; &#4725;&#4613;?",undefined,2)+H("37. Date of last visit","&#4617;&#4615;&#4817;&#4791; &#4748;&#4654;&#4657;&#4778; &#4873;&#4651;")+"</tr>");
  p("<tr><td style='border:1px solid #444;padding:4px 7px;font-size:10px;' colspan='2'>"+CB("&#4725;&#4613; / No")+CB("&#4659;&#4659;&#4659; / Yes &#8212; Year: _______")+"</td>"+E()+"</tr></table>");
  // Section 4 &#8212; Emergency
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION 4 &#8212; EMERGENCY CONTACT / &#4771;&#4661;&#4621;&#4575; 4 &#8212; &#4775;&#4680;&#4656;&#4789; &#4613;&#4739;&#4785;&#4651;&#4771;</div>");
  p("<table style='"+T+"'><tr>"+H("38. Emergency Contact Full Name","&#4613;&#4739;&#4785;&#4651;&#4771; &#4726;&#4755; &#4723;&#4651;&#4723;","33%")+H("39. Relationship","&#4795;&#4747;&#4721;&#4771; &#4647;&#4661;","33%")+H("40. Emergency Phone","&#4613;&#4739;&#4785;&#4651;&#4771; &#4701;&#4611;")+"</tr>");
  p("<tr>"+D(v(r.emergencyContact1?.name)||"&#8212;","33%")+E("33%")+D(v(r.emergencyContact1?.phone)||"&#8212;")+"</tr></table>");
  // Declarations
  p("<div style='background:"+A+";color:"+GOLD+";padding:3px 8px;font-size:8.5px;font-weight:700;margin:0;'>SECTION 5 &#8212; BACKGROUND DECLARATIONS / &#4771;&#4661;&#4621;&#4575; 5 &#8212; &#4845;&#4699;&#4593; &#4838;&#4810;&#4784;</div>");
  const qET=["Have you ever been refused a visa or denied entry to Ethiopia? / &#4822;&#4765;&#4837; &#4832;&#4661; &#4705;&#4891;&#4813; &#4769;&#4651;&#4803;?",
    "Have you ever been deported from Ethiopia or any other country? / &#4843;&#4759;&#4613;&#4813; &#4733;&#4735;&#4845; &#4661;&#4761;&#4655;&#4770;&#4651;&#4803;?",
    "Do you have a criminal record in any country? / &#4833;&#4759; &#4850;&#4761; &#4843;&#4654;&#4831; &#4843;&#4701;&#4661; &#4613;&#4638;&#4611;&#4803;?",
    "Are you associated with any terrorist or extremist organization? / &#4847;&#4648;&#4591;&#4821;&#4813; &#4648;&#4591;&#4821; &#4827;&#4651; &#4751;&#4613;&#4761;?",
    "Do you have any serious communicable diseases? / &#4643;&#4762;&#4651;&#4813; &#4771;&#4651;&#4639;&#4813; &#4843;&#4671;&#4661;&#4799;?"];
  p("<table style='"+T+"'>");
  qET.forEach((q,i)=>{
    p("<tr><td style='border:1px solid #444;padding:3px 8px;font-size:8.5px;width:88%;'>"+(i+1)+". "+q+"</td><td style='border:1px solid #444;padding:3px;font-size:10px;text-align:center;'>&#9744; &#4725;&#4613;<br/>No</td></tr>");
  });
  p("</table>");
  p("<div style='border:1px solid "+A+";padding:7px 10px;margin-top:4px;font-size:8px;color:#333;line-height:1.6;background:#f0fff4;'>");
  p("<strong>DECLARATION / &#4643;&#4767;&#4651;&#4771;&#4803;:</strong> I hereby declare that all the information provided in this application is true and complete to the best of my knowledge. / &#4633;&#4660; &#4633;&#4661; &#4809;&#4880;&#4643;&#4813; &#4655;&#4851;&#4613;&#4795; &#4813;&#4651;&#4771;&#4795;&#4813; &#4643;&#4767;&#4651;&#4771;&#4803;. Providing false information may result in refusal and legal action.</div>");
  p("<table style='"+T+"margin-top:4px;'><tr>");
  p("<td style='border:1px solid #444;padding:8px;width:60%;'><div style='font-size:8px;font-weight:700;color:"+A+";margin-bottom:5px;'>SIGNATURE OF APPLICANT / &#4633;&#4660; &#4893;&#4651;&#4749;&#4785;</div><div style='border-bottom:1.5px solid #333;height:30px;margin-bottom:3px;'></div><div style='font-size:8px;'>"+fn+" &nbsp; "+tds+"</div></td>");
  p("<td style='border:1px solid #444;padding:7px;font-size:8px;'><div style='font-weight:700;color:"+A+";margin-bottom:4px;'>&#4641;&#4651;&#4829;&#4651;&#4771; &#4613;&#4751;&#4766;&#4611;&#4803; / OFFICIAL USE ONLY</div>Visa No: _______________<br/>Valid: ________________<br/>Officer: _______________</td></tr></table>");
  p("<div style='margin-top:4px;font-size:7.5px;color:#aaa;text-align:center;'>Immigration and Citizenship Service &#8226; Federal Democratic Republic of Ethiopia &#8226; evisa.gov.et &#8226; BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}



/* ═══════════════════════════════════════════════════
   🇪🇬 EGYPT — Ministry of Interior e-Visa Application Form
   Source: visa2egypt.gov.eg — Official numbered field structure
═══════════════════════════════════════════════════ */
function visaEgypt(r:BiometricRecord):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,"visa-egypt"); const tds=td2();
  const A="#C8102E"; const GOLD="#C09300";
  const H=(en:string,ar:string,w?:string,cs?:number)=>"<td style=\"border:1px solid #444;padding:3px 5px;background:#fef3f3;font-size:8px;font-weight:700;"+(w?"width:"+w+";":"")+"\""+(cs?" colspan=\""+cs+"\"":"")+"><div style='color:"+A+";font-size:8.5px;'>"+en+"</div><div style='color:#444;font-size:8px;direction:rtl;text-align:right;'>"+ar+"</div></td>";
  const rows:string[]=[]; const p=(...s:string[])=>rows.push(...s);
  p("<div style='"+PAGE+"border:2px solid "+A+";'>");
  p("<div style='background:"+A+";color:#fff;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-bottom:10px;'>");
  p("<div style='font-size:28px;'>🇪🇬</div>");
  p("<div><div style='font-size:13px;font-weight:800;letter-spacing:0.05em;'>ARAB REPUBLIC OF EGYPT</div>");
  p("<div style='font-size:10px;opacity:0.85;'>جمهورية مصر العربية</div>");
  p("<div style='font-size:9px;opacity:0.7;'>Ministry of Interior — e-Visa Application Form | وزارة الداخلية — طلب التأشيرة الإلكترونية</div></div></div>");
  p("<div style='text-align:center;font-size:11px;font-weight:700;color:"+A+";letter-spacing:0.1em;margin-bottom:10px;border-bottom:1.5px solid "+A+";padding-bottom:6px;'>VISA APPLICATION FORM — نموذج طلب التأشيرة</div>");
  p("<table style='width:100%;border-collapse:collapse;margin-bottom:8px;font-family:Arial,sans-serif;'>");
  p("<tr>"+H("1. Family Name (as in passport)","اللقب (كما في جواز السفر)","40%")+H("2. First / Given Name","الاسم الأول","35%")+H("3. Application ID","رقم الطلب","25%")+"</tr>");
  p("<tr>"+tds(v(r.surname).toUpperCase())+tds(v(r.name))+tds(id)+"</tr>");
  p("<tr>"+H("4. Date of Birth","تاريخ الميلاد","25%")+H("5. Place of Birth","مكان الميلاد","35%")+H("6. Gender","الجنس","20%")+H("7. Marital Status","الحالة الاجتماعية","20%")+"</tr>");
  p("<tr>"+tds(v(r.dateOfBirth))+tds(v(r.placeOfBirth)||v(r.city))+tds(v(r.gender))+tds(v(r.maritalStatus))+"</tr>");
  p("<tr>"+H("8. Nationality","الجنسية","35%")+H("9. Country of Birth","بلد الميلاد","35%")+H("10. Religion","الديانة","30%")+"</tr>");
  p("<tr>"+tds(v(r.nationality))+tds(v(r.nationality))+tds(v(r.religion))+"</tr>");
  p("<tr>"+H("11. Passport Number","رقم جواز السفر","30%")+H("12. Passport Issue Date","تاريخ إصدار الجواز","25%")+H("13. Passport Expiry Date","تاريخ انتهاء الجواز","25%")+H("14. Issue Country","بلد الإصدار","20%")+"</tr>");
  p("<tr>"+tds(v(r.passportNumber))+tds(v(r.passportIssue))+tds(v(r.passportExpiry))+tds(v(r.nationality))+"</tr>");
  p("<tr>"+H("15. Occupation / Profession","المهنة","35%")+H("16. Employer / Company Name","اسم صاحب العمل","35%")+H("17. Phone Number","رقم الهاتف","30%")+"</tr>");
  p("<tr>"+tds(v(r.occupation))+tds(v(r.employer))+tds(v(r.phoneNo))+"</tr>");
  p("<tr>"+H("18. Email Address","البريد الإلكتروني","50%")+H("19. Address in Home Country","العنوان في البلد الأصلي","50%")+"</tr>");
  p("<tr>"+tds(v(r.email))+tds([v(r.address),v(r.city),v(r.country)].filter(Boolean).join(", "))+"</tr>");
  p("<tr>"+H("20. Purpose of Visit","الغرض من الزيارة","33%")+H("21. Intended Date of Arrival","تاريخ الوصول المقصود","33%")+H("22. Duration of Stay (days)","مدة الإقامة (أيام)","34%")+"</tr>");
  p("<tr>"+tds("Tourism / سياحة")+tds("—")+tds("30")+"</tr>");
  p("<tr>"+H("23. Intended Address in Egypt","العنوان المقصود في مصر","60%")+H("24. Have you visited Egypt before?","هل سبق لك زيارة مصر؟","40%")+"</tr>");
  p("<tr>"+tds("—")+tds("No / لا")+"</tr>");
  p("<tr>"+H("25. Emergency Contact Name","اسم جهة الاتصال في حالات الطوارئ","50%")+H("26. Emergency Contact Phone","هاتف جهة الاتصال الطارئ","50%")+"</tr>");
  p("<tr>"+tds(v(r.emergencyContact))+tds(v(r.emergencyPhone))+"</tr>");
  p("</table>");
  p("<table style='width:100%;border-collapse:collapse;margin-bottom:10px;'>");
  p("<tr><td colspan='2' style='border:1px solid #444;padding:6px 8px;background:#fef3f3;font-size:8.5px;font-weight:700;color:"+A+";'>27. DECLARATION — إقرار</td></tr>");
  p("<tr><td style='border:1px solid #444;padding:8px;font-size:8px;color:#333;width:65%;'>I declare that the information given in this application is true and correct to the best of my knowledge. I understand that providing false information may result in visa refusal or cancellation.<br/><br/><span style='direction:rtl;display:block;'>أقر بأن المعلومات الواردة في هذا الطلب صحيحة وسليمة على حد علمي. أفهم أن تقديم معلومات مزيفة قد يؤدي إلى رفض التأشيرة أو إلغائها.</span></td>");
  p("<td style='border:1px solid #444;padding:8px;font-size:8px;vertical-align:top;'>");
  if(r.photo) p("<img src='"+r.photo+"' style='width:80px;height:100px;object-fit:cover;border:1px solid #ccc;display:block;margin:0 auto 6px;'/>");
  p("<div style='font-size:7.5px;color:#888;text-align:center;'>Applicant Photo<br/>صورة المتقدم</div>");
  p("<div style='margin-top:12px;border-top:1px solid #ccc;padding-top:6px;font-size:7.5px;color:#666;'>Signature / التوقيع:<br/>Date / التاريخ: _____________</div></td></tr>");
  p("</table>");
  p("<div style='font-size:7.5px;color:#aaa;text-align:center;border-top:1px dashed #ddd;padding-top:6px;'>Ministry of Interior, Arab Republic of Egypt • visa2egypt.gov.eg • BIMS Ref: "+id+"</div>");
  p("</div>"); return rows.join("");
}

function visaGenericFull(r:BiometricRecord, tplId:string, country:string, authority:string, flag:string, accent:string, website:string, formRef:string, langLabel:string):string {
  const fn=v(r.name)+" "+v(r.surname); const id=docId(r,tplId); const td=td2();
  const rows:string[]=[];
  const push=(...s:string[])=>rows.push(...s);

  push('<div style="'+PAGE+'border:2px solid '+accent+';">');
  push('<div style="background:'+accent+';padding:10px 16px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;">'
    +'<div style="font-size:32px;">'+flag+'</div>'
    +'<div style="color:#fff;">'
    +'<div style="font-size:13px;font-weight:700;letter-spacing:0.06em;">'+country.toUpperCase()+' \u2014 VISA APPLICATION FORM</div>'
    +(langLabel?'<div style="font-size:10px;opacity:0.75;margin-top:1px;">'+langLabel+'</div>':'')
    +'<div style="font-size:10px;opacity:0.85;margin-top:2px;">'+authority+'</div>'
    +'<div style="font-size:9px;opacity:0.7;margin-top:1px;">'+formRef+'</div></div>'
    +'<div style="text-align:right;color:#fff;font-size:9px;opacity:0.8;">'+website+'<br/>Ref: '+id+'</div>'
    +'</div>');
  push('<div style="'+BODY+'">'
    +'<div style="background:#fffdf0;border:1px solid #ccc;padding:7px 10px;font-size:9px;color:#555;margin-bottom:12px;">'
    +'\u26a0 Form mirrors official '+country+' visa application structure. Apply at '+website+' or nearest '+country+' Embassy. Pre-filled from BIMS record '+r.id+'</div>');

  push('<div style="'+SEC(accent)+'">SECTION A \u2014 PERSONAL INFORMATION</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Surname (As in Passport)",v(r.surname))
    +fCell("First / Given Name(s)",v(r.name))
    +fCell("Other / Previous Names","None")
    +'</div>');
  push('<div style="'+ROW4+'">'
    +fCell("Date of Birth",v(r.dateOfBirth))
    +fCell("Place of Birth",v(r.placeOfBirth))
    +fCell("Country of Birth",v(r.nationality))
    +fCell("Gender / Sex",v(r.gender))
    +'</div>');
  push('<div style="'+ROW4+'">'
    +fCell("Nationality / Citizenship",v(r.nationality))
    +fCell("Other Nationality (if any)",v(r.multinationality,"None"))
    +fCell("Marital Status",v(r.maritalStatus))
    +fCell("Blood Type",v(r.bloodType))
    +'</div>');
  push('<div style="'+ROW2+'">'
    +fCell("National ID Number",v(r.nationalId))
    +fCell("Religion","[RELIGION]")
    +'</div>');
  push('<div style="'+ROW2+'">'
    +fCell("Father\'s Full Name",v(r.fatherName))
    +fCell("Mother\'s Full Name",v(r.motherName))
    +'</div>');

  push('<div style="'+SEC(accent)+'">SECTION B \u2014 PASSPORT / TRAVEL DOCUMENT</div>');
  push('<div style="'+ROW4+'">'
    +fCell("Document Type",v(r.passportType,"Ordinary Passport"))
    +fCell("Passport Number",v(r.passportNo))
    +fCell("Date of Issue",v(r.passportIssueDate))
    +fCell("Date of Expiry",v(r.passportExpiryDate))
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Place / City of Issue",v(r.passportPlaceOfIssue))
    +fCell("Issuing Country / Authority",v(r.nationality))
    +fCell("Any Previous Passports?","No")
    +'</div>');

  push('<div style="'+SEC(accent)+'">SECTION C \u2014 CONTACT & ADDRESS INFORMATION</div>');
  push('<div style="'+ROW2+'">'
    +fCell("Permanent Home Address",v(r.address))
    +fCell("Current Address (if different)","Same as above")
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Mobile / Cell Phone",v(r.phoneNo))
    +fCell("WhatsApp Number",v(r.whatsapp||r.phoneNo))
    +fCell("Email Address",v(r.email))
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("LinkedIn",v(r.linkedin,"None"))
    +fCell("Instagram",v(r.instagram,"None"))
    +fCell("Facebook",v(r.facebook,"None"))
    +'</div>');

  push('<div style="'+SEC(accent)+'">SECTION D \u2014 TRAVEL & VISIT DETAILS</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Purpose of Visit","Tourism / Business")
    +fCell("Proposed Date of Entry","[DATE]")
    +fCell("Proposed Duration of Stay","[DAYS / WEEKS]")
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Accommodation in "+country,"[HOTEL / HOST ADDRESS]")
    +fCell("Port of Entry","[AIRPORT / PORT]")
    +fCell("Return / Onward Ticket Ref.","[BOOKING REFERENCE]")
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Countries Visited Last 5 Years",v(r.travelHistory,"None"))
    +fCell("Previous Visits to "+country+"?","No")
    +fCell("Previous Visa Refused by "+country+"?","No")
    +'</div>');

  push('<div style="'+SEC(accent)+'">SECTION E \u2014 OCCUPATION & FINANCIAL STATUS</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Current Occupation / Job Title",v(r.occupation))
    +fCell("Employer / Institution Name",v(r.currentWorkInfo?.company||r.institutionName))
    +fCell("Employer / School Address",v(r.address))
    +'</div>');
  push('<div style="'+ROW3+'">'
    +fCell("Work / School Phone",v(r.phoneNo))
    +fCell("Monthly Income","[AMOUNT + CURRENCY]")
    +fCell("Highest Level of Education",v(r.educationRecord,"[QUALIFICATION]").substring(0,60))
    +'</div>');
  push('<div style="'+ROW2+'">'
    +fCell("Available Funds for Trip","[AMOUNT + CURRENCY]")
    +fCell("Travel Insurance Provider",v(r.insuranceCompany,"[INSURANCE / N/A]"))
    +'</div>');

  push('<div style="'+SEC(accent)+'">SECTION F \u2014 BACKGROUND DECLARATIONS</div>');
  push('<div style="border:1px solid #ddd;padding:8px;font-size:9px;line-height:2;">');
  ["Have you ever been refused entry to or deported from this country?",
   "Have you ever been refused a visa to this country?",
   "Do you have a criminal record in any country?",
   "Are you subject to any travel bans or court orders?",
   "Do you have any known health conditions of public health significance?",
   "Are you associated with any terrorist or extremist organization?"
  ].forEach(q=>push('<div style="border-bottom:1px solid #f0f0f0;padding:2px 0;"><strong>No</strong> \u2014 '+q+'</div>'));
  push('</div>');

  push('<div style="'+DECL+'">'
    +'I hereby solemnly declare that all information and documents submitted with this application are true, complete and correct. '
    +'I acknowledge that providing false or misleading information may result in the refusal of this application, cancellation of any visa granted, and possible legal proceedings under the laws of '+country+'.'
    +'</div>');
  push(sigBlock(fn,td,''));
  push('<div style="'+OFFICIAL+'">'
    +'<div><strong>FOR OFFICIAL USE ONLY</strong><br/>Visa No: __________</div>'
    +'<div>Valid: __________<br/>Duration: ________</div>'
    +'<div>Consular Officer<br/>Stamp & Signature: ___</div>'
    +'</div>');
  push('<div style="'+NOTE+'">Source: '+authority+' \u00b7 '+website+' \u00b7 '+formRef+' \u00b7 Ref: '+id+' \u00b7 '+td+'</div>');
  push('</div></div>');
  return rows.join("");
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 DISPATCH \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
export function buildVisaDoc(tplId:string, r:BiometricRecord):string {
  switch(tplId) {
    case "visa-usa":      return visaUSA(r);
    case "visa-uk":       return visaUK(r);
    case "visa-schengen": return visaSchengen(r);
    case "visa-egypt":    return visaEgypt(r);
    case "visa-uae":      return visaUAE(r);
    case "visa-canada":   return visaCanada(r);
    case "visa-somalia":  return visaSomalia(r);
    case "visa-turkey":   return visaGenericFull(r,"visa-turkey","Turkey","Republic of Turkey \u2014 Ministry of Foreign Affairs, Directorate General of Consular Affairs","\ud83c\uddf9\ud83c\uddf7","#c8102e","mfa.gov.tr/visa","Sticker Visa Application Form (e-Visa / Embassy)","T\u00fcrkiye Vize Ba\u015fvuru Formu");
    case "visa-saudi":    return visaGenericFull(r,"visa-saudi","Saudi Arabia","Kingdom of Saudi Arabia \u2014 Ministry of Foreign Affairs","\ud83c\uddf8\ud83c\udde6","#006233","mofa.gov.sa","Kingdom Visa Application Form","\u0646\u0645\u0648\u0630\u062c \u0637\u0644\u0628 \u062a\u0623\u0634\u064a\u0631\u0629");
    case "visa-india":    return visaGenericFull(r,"visa-india","India","Bureau of Immigration, Ministry of Home Affairs, Government of India","\ud83c\uddee\ud83c\uddf3","#ff671f","indianvisaonline.gov.in","e-Visa Application Form (eTA / e-Tourist Visa)","\u092d\u093e\u0930\u0924 \u0908-\u0935\u0940\u091c\u093c\u093e \u0906\u0935\u0947\u0926\u0928 \u092a\u0924\u094d\u0930");
    case "visa-china":    return visaGenericFull(r,"visa-china","China","Embassy / Consulate-General of the People\'s Republic of China","\ud83c\udde8\ud83c\uddf3","#c8102e","visaforchina.cn","Chinese Visa Application Form (V.2013)","\u4e2d\u534e\u4eba\u6c11\u5171\u548c\u56fd\u7b7e\u8bc1\u7533\u8bf7\u8868");
    case "visa-malaysia": return visaGenericFull(r,"visa-malaysia","Malaysia","Immigration Department of Malaysia \u2014 Jabatan Imigresen Malaysia","\ud83c\uddf2\ud83c\uddfe","#cc0001","imi.gov.my","eVISA Application Form (IMM.57)","Borang Permohonan e-Visa");
    case "visa-ethiopia": return visaGenericFull(r,"visa-ethiopia","Ethiopia","Immigration and Citizenship Service, Federal Democratic Republic of Ethiopia","\ud83c\uddea\ud83c\uddf9","#009a44","evisa.gov.et","Ethiopia e-Visa Application Form","\u12e8\u12a2\u1275\u12ee\u1335\u12eb \u126a\u12db \u121b\u1218\u120d\u12a8\u127b \u1245\u133d");
    default:              return "<p>Visa form not found for: "+tplId+"</p>";
  }
}
