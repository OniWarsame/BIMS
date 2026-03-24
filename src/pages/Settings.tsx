import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Globe, Eye, EyeOff, Check } from "lucide-react";
import CyberBackground from "@/components/CyberBackground";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser, getUsers, saveUsers } from "@/pages/Login";


const LANGUAGES = [
  {code:"en",label:"English",          flag:"🇬🇧",rtl:false},
  {code:"so",label:"Somali — Soomaali",flag:"🇸🇴",rtl:false},
  {code:"ar",label:"Arabic — العربية", flag:"🇸🇦",rtl:true },
  {code:"fr",label:"French — Français",flag:"🇫🇷",rtl:false},
  {code:"sw",label:"Swahili — Kiswahili",flag:"🇰🇪",rtl:false},
  {code:"am",label:"Amharic — አማርኛ",  flag:"🇪🇹",rtl:false},
  {code:"ha",label:"Hausa",            flag:"🇳🇬",rtl:false},
  {code:"de",label:"German — Deutsch", flag:"🇩🇪",rtl:false},
  {code:"zh",label:"Chinese — 中文",   flag:"🇨🇳",rtl:false},
  {code:"es",label:"Spanish — Español",flag:"🇪🇸",rtl:false},
];

function applyLang(code:string){
  const isRtl=LANGUAGES.find(l=>l.code===code)?.rtl??false;
  localStorage.setItem("bims_lang",code);
  document.documentElement.lang=code;
  document.documentElement.dir=isRtl?"rtl":"ltr";
  document.body.style.direction=isRtl?"rtl":"ltr";
  window.dispatchEvent(new Event("bims_lang_change"));
}


/* ── Real-time UI translation strings ── */
const T: Record<string, Record<string, string>> = {
  settings:       {en:"SETTINGS",          so:"GOOBAHA",           ar:"الإعدادات",       fr:"PARAMÈTRES",      sw:"MIPANGILIO",      am:"ቅንብሮች",         ha:"SAITUNA",         de:"EINSTELLUNGEN",   zh:"设置",          es:"CONFIGURACIÓN"},
  preferences:    {en:"SYSTEM PREFERENCES",so:"DOORBIDAADA",        ar:"تفضيلات النظام",  fr:"PRÉFÉRENCES",     sw:"MAPENDELEO",      am:"ቅድሚያ ምርጫዎች",   ha:"ZAƁUKA",          de:"SYSTEMEINST.",    zh:"系统偏好",       es:"PREFERENCIAS"},
  language:       {en:"LANGUAGE",          so:"LUQADDA",           ar:"اللغة",           fr:"LANGUE",          sw:"LUGHA",           am:"ቋንቋ",           ha:"HARSHE",          de:"SPRACHE",         zh:"语言",          es:"IDIOMA"},
  changepass:     {en:"CHANGE PASSWORD",   so:"BEDDEL FURAHA",     ar:"تغيير كلمة المرور",fr:"CHANGER MDP",    sw:"BADILISHA NYWILA",am:"የይለፍ ቃል ቀይር",  ha:"CANZA KALMAR",    de:"PASSWORT ÄNDERN", zh:"更改密码",       es:"CAMBIAR CLAVE"},
  selectlang:     {en:"SELECT SYSTEM LANGUAGE",so:"DOORO LUQADDA", ar:"اختر لغة النظام", fr:"CHOISIR LANGUE",  sw:"CHAGUA LUGHA",    am:"ቋንቋ ምረጥ",       ha:"ZAƁI HARSHE",     de:"SPRACHE WÄHLEN",  zh:"选择语言",       es:"SELECCIONAR"},
  savelang:       {en:"SAVE LANGUAGE",     so:"KAYDI LUQADDA",     ar:"حفظ اللغة",       fr:"SAUVEGARDER",     sw:"HIFADHI LUGHA",   am:"ቋንቋ አስቀምጥ",     ha:"ADANA HARSHE",    de:"SPRACHE SPEICH.", zh:"保存语言",       es:"GUARDAR"},
  saved:          {en:"LANGUAGE SAVED ✓",  so:"LA KEYDIYEY ✓",     ar:"تم الحفظ ✓",      fr:"SAUVEGARDÉ ✓",    sw:"IMEHIFADHIWA ✓",  am:"ተቀምጧል ✓",       ha:"AN ADANA ✓",      de:"GESPEICHERT ✓",   zh:"已保存 ✓",       es:"GUARDADO ✓"},
  curpass:        {en:"Current Password",  so:"Furaha Hadda",      ar:"كلمة المرور الحالية",fr:"Mot de passe actuel",sw:"Nywila ya Sasa",am:"አሁኑ ይለፍ ቃል",   ha:"Kalmar Yanzu",    de:"Aktuelles Passwort",zh:"当前密码",       es:"Contraseña Actual"},
  newpass:        {en:"New Password",      so:"Furaha Cusub",      ar:"كلمة مرور جديدة", fr:"Nouveau mot de passe",sw:"Nywila Mpya",   am:"አዲስ ይለፍ ቃል",   ha:"Sabuwar Kalmar",  de:"Neues Passwort",  zh:"新密码",         es:"Nueva Contraseña"},
  confpass:       {en:"Confirm Password",  so:"Xaqiiji Furaha",    ar:"تأكيد كلمة المرور",fr:"Confirmer le mot",sw:"Thibitisha Nywila",am:"ይለፍ ቃሉን አረጋግጥ",ha:"Tabbatar Kalmar", de:"Passwort bestät.",zh:"确认密码",       es:"Confirmar Clave"},
  changepassbtn:  {en:"CHANGE PASSWORD",   so:"BEDDEL FURAHA",     ar:"تغيير كلمة المرور",fr:"CHANGER",        sw:"BADILISHA",       am:"ቀይር",           ha:"CANZA",           de:"ÄNDERN",          zh:"更改",          es:"CAMBIAR"},
  back:           {en:"←",                so:"←",                  ar:"→",                fr:"←",               sw:"←",               am:"←",             ha:"←",               de:"←",               zh:"←",            es:"←"},
  activelang:     {en:"Active — interface updated",so:"Firfircoon",ar:"نشط — تم التحديث", fr:"Actif — mis à jour",sw:"Amilifu",        am:"ንቁ — ተዘምኗል",    ha:"Aiki",            de:"Aktiv — aktuell", zh:"已激活",         es:"Activo"},
};

const t = (key:string, lang:string) => T[key]?.[lang] || T[key]?.["en"] || key;

export default function Settings() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const [tab,       setTab]       = useState<"password"|"language">("language");
  const [lang,      setLang]      = useState(localStorage.getItem("bims_lang")||"en");
  const [saved,     setSaved]     = useState(false);
  const [curPass,   setCurPass]   = useState("");
  const [newPass,   setNewPass]   = useState("");
  const [confPass,  setConfPass]  = useState("");
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [passErr,   setPassErr]   = useState("");
  const [passOk,    setPassOk]    = useState("");
  const isRtl = LANGUAGES.find(l=>l.code===lang)?.rtl||false;

  /* Apply language to DOM immediately on change */
  useEffect(()=>{
    document.documentElement.lang = lang;
    applyLang(lang);
  }, [lang]);

  const mono:React.CSSProperties = {fontFamily:"'Courier New',monospace",direction: isRtl?"rtl":"ltr"};
  const inp:React.CSSProperties  = {width:"100%",padding:"10px 14px",borderRadius:9,...mono,fontSize:13,color:"#e8dcc8",background:"rgba(8,15,30,0.88)",border:"1.5px solid rgba(203,178,120,0.3)",outline:"none"};

  const selectLang = (code:string) => {
    setLang(code);
    applyLang(code);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const changePass = () => {
    setPassErr(""); setPassOk("");
    if(!curPass){setPassErr(t("curpass",lang)+" is required");return;}
    if(!newPass){setPassErr(t("newpass",lang)+" is required");return;}
    if(newPass.length<4){setPassErr("Min 4 characters");return;}
    if(newPass!==confPass){setPassErr("Passwords do not match");return;}
    const all=getUsers();
    const user=all.find(u=>u.id===me?.id);
    if(!user){setPassErr("User not found");return;}
    if(user.password!==curPass){setPassErr("Current password incorrect");return;}
    saveUsers(all.map(u=>u.id===me?.id?{...u,password:newPass}:u));
    setPassOk("✓ Password changed successfully");
    setCurPass(""); setNewPass(""); setConfPass("");
  };

  const TabBtn = ({id,label}:{id:typeof tab;label:string}) => (
    <button onClick={()=>setTab(id)}
      style={{display:"flex",alignItems:"center",gap:8,...mono,fontSize:11,fontWeight:700,letterSpacing:"0.12em",padding:"10px 20px",borderRadius:10,cursor:"pointer",transition:"all .15s",
        border:tab===id?"2px solid rgba(232,200,112,0.7)":"1px solid rgba(203,178,120,0.28)",
        background:tab===id?"rgba(232,200,112,0.16)":"transparent",
        color:tab===id?"#f0dc90":"rgba(203,178,120,0.5)"}}>
      {label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",...mono,direction:isRtl?"rtl":"ltr"}}>
      <CyberBackground/>

      <PageHeader
        title="SETTINGS"
        subtitle="PREFERENCES · LANGUAGE · DISPLAY"
        icon={<span style={{fontSize:16}}>⚙️</span>}
      />
      <div style={{flex:1,padding:"28px",position:"relative",zIndex:1,maxWidth:720,width:"100%",margin:"0 auto"}}>
        <div style={{display:"flex",gap:10,marginBottom:28}}>
          <TabBtn id="language" label={`🌐 ${t("language",lang)}`}/>
          <TabBtn id="password" label={`🔒 ${t("changepass",lang)}`}/>
        </div>

        {/* ── LANGUAGE TAB ── */}
        {tab==="language"&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div style={{marginBottom:14,fontSize:11,letterSpacing:"0.12em",color:"rgba(203,178,120,0.5)",...mono}}>
              {t("selectlang",lang)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
              {LANGUAGES.map(l=>{
                const active=lang===l.code;
                return(
                  <motion.div key={l.code} onClick={()=>selectLang(l.code)}
                    whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:12,cursor:"pointer",transition:"all .2s",
                      border:active?"2px solid rgba(232,200,112,0.75)":"1px solid rgba(203,178,120,0.25)",
                      background:active?"rgba(232,200,112,0.14)":"rgba(232,200,112,0.04)",
                      boxShadow:active?"0 0 20px rgba(232,200,112,0.1)":"none"}}>
                    <span style={{fontSize:26,flexShrink:0}}>{l.flag}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:active?"#f0dc90":"rgba(203,178,120,0.8)",letterSpacing:"0.04em",...mono}}>{l.label}</div>
                      {active&&<div style={{fontSize:9,color:"rgba(74,222,128,0.7)",marginTop:3,letterSpacing:"0.12em",...mono}}>{t("activelang",l.code)}</div>}
                    </div>
                    {active&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{width:22,height:22,borderRadius:"50%",background:"rgba(74,222,128,0.2)",border:"1.5px solid rgba(74,222,128,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Check size={12} style={{color:"#4ade80"}}/>
                    </motion.div>}
                  </motion.div>
                );
              })}
            </div>

            {/* Live preview of translation */}
            <div style={{padding:"16px 20px",borderRadius:12,border:"1px solid rgba(232,200,112,0.25)",background:"rgba(8,15,30,0.6)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:"rgba(203,178,120,0.45)",marginBottom:10,...mono}}>LIVE PREVIEW</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["settings","language","changepass","savelang","curpass","newpass"].map(k=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:10,color:"rgba(203,178,120,0.35)",minWidth:80,...mono}}>{k}:</span>
                    <AnimatePresence mode="wait">
                      <motion.span key={lang} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}} transition={{duration:0.15}}
                        style={{fontSize:11,fontWeight:700,color:"#f0dc90",...mono}}>
                        {t(k,lang)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PASSWORD TAB ── */}
        {tab==="password"&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <div style={{padding:"24px",borderRadius:14,border:"1px solid rgba(203,178,120,0.28)",background:"rgba(12,22,45,0.88)",display:"flex",flexDirection:"column" as const,gap:18}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.2em",color:"rgba(203,178,120,0.55)"}}>{t("changepass",lang)}</div>
              {[
                {label:t("curpass",lang),val:curPass,set:setCurPass,show:showCur,toggle:()=>setShowCur(v=>!v)},
                {label:t("newpass",lang), val:newPass, set:setNewPass, show:showNew,toggle:()=>setShowNew(v=>!v)},
                {label:t("confpass",lang),val:confPass,set:setConfPass,show:true,toggle:null},
              ].map((f,i)=>(
                <div key={i}>
                  <label style={{display:"block",...mono,fontSize:10,fontWeight:700,letterSpacing:"0.18em",color:"rgba(203,178,120,0.65)",marginBottom:6,textTransform:"uppercase" as const}}>{f.label}</label>
                  <div style={{position:"relative"}}>
                    <input style={{...inp,paddingRight:f.toggle?40:14}} type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} placeholder="••••••"/>
                    {f.toggle&&<button onClick={f.toggle} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(203,178,120,0.45)",padding:0}}>
                      {f.show?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>}
                  </div>
                </div>
              ))}
              <AnimatePresence>
                {passErr&&<motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{padding:"10px 14px",borderRadius:9,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.35)",fontSize:12,fontWeight:700,color:"#f87171",...mono}}>✕ {passErr}</motion.div>}
                {passOk &&<motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{padding:"10px 14px",borderRadius:9,background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.35)",fontSize:12,fontWeight:700,color:"#4ade80",...mono}}>{passOk}</motion.div>}
              </AnimatePresence>
              <button onClick={changePass} style={{...mono,fontSize:12,fontWeight:700,letterSpacing:"0.14em",padding:"11px 28px",borderRadius:11,border:"2px solid rgba(232,200,112,0.65)",background:"rgba(232,200,112,0.18)",color:"#f0dc90",cursor:"pointer",alignSelf:"flex-start" as const}}>
                {t("changepassbtn",lang)}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 32px",background:"rgba(8,15,30,0.92)",borderTop:"1px solid rgba(203,178,120,0.2)",...mono,fontSize:11,fontWeight:700}}>
        <span style={{color:"#e8c870"}}>BIMS v1.0 · © 2026&nbsp;<a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"#f0dc90",textDecoration:"underline"}}>KUMI</a></span>
        <span style={{margin:"0 16px",width:4,height:4,borderRadius:"50%",background:"rgba(203,178,120,0.4)",display:"inline-block"}}/>
        <span style={{color:"hsl(195,80%,72%)"}}>{t("settings",lang)}</span>
      </div>
    
      {/* ─── GLOBAL FOOTER ─── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"9px 32px",background:"rgba(0,4,14,0.88)",borderTop:"1px solid rgba(0,200,245,0.16)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,gap:12,backdropFilter:"blur(8px)"}}>
        <span style={{color:"rgba(0,210,255,0.65)"}}>BIMS v1.0</span>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <a href="https://kumi.ke/" target="_blank" rel="noopener noreferrer" style={{color:"rgba(0,230,200,0.75)",textDecoration:"none",letterSpacing:"0.06em"}}>© 2026 KUMI</a>
        <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(0,200,245,0.35)",display:"inline-block"}}/>
        <span style={{color:"rgba(0,210,255,0.40)"}}>BIOMETRIC IDENTITY MANAGEMENT SYSTEM</span>
      </div>
</div>
  );
}
