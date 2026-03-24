/*
  Global i18n for BIMS
  Usage in any component:
    import { useLang, t } from "@/lib/i18n";
    const lang = useLang();
    return <h1>{t("home", lang)}</h1>
*/
import { useState, useEffect } from "react";

export const LANGUAGES = [
  {code:"en", label:"English",          flag:"🇬🇧", rtl:false},
  {code:"so", label:"Somali — Soomaali",flag:"🇸🇴", rtl:false},
  {code:"ar", label:"Arabic — العربية", flag:"🇸🇦", rtl:true },
  {code:"fr", label:"French — Français",flag:"🇫🇷", rtl:false},
  {code:"sw", label:"Swahili — Kiswahili",flag:"🇰🇪",rtl:false},
  {code:"am", label:"Amharic — አማርኛ",  flag:"🇪🇹", rtl:false},
  {code:"ha", label:"Hausa",            flag:"🇳🇬", rtl:false},
  {code:"de", label:"German — Deutsch", flag:"🇩🇪", rtl:false},
  {code:"zh", label:"Chinese — 中文",   flag:"🇨🇳", rtl:false},
  {code:"es", label:"Spanish — Español",flag:"🇪🇸", rtl:false},
];

/* Master translation table */
export const STRINGS: Record<string, Record<string,string>> = {
  /* Navigation */
  nav_support:   {en:"Support",       so:"Taageero",   ar:"الدعم",         fr:"Support",      sw:"Msaada",       am:"ድጋፍ",       ha:"Tallafi",       de:"Support",       zh:"支持",          es:"Soporte"},
  nav_logout:    {en:"Logout",        so:"Ka bixi",    ar:"تسجيل الخروج",  fr:"Déconnexion",  sw:"Ondoka",       am:"ውጣ",         ha:"Fita",           de:"Abmelden",      zh:"退出",          es:"Cerrar sesión"},
  nav_profile:   {en:"My Profile",    so:"Profile-ga", ar:"ملفي الشخصي",   fr:"Mon profil",   sw:"Wasifu wangu", am:"መገለጫዬ",      ha:"Bayanai na",     de:"Mein Profil",   zh:"我的资料",      es:"Mi perfil"},
  nav_settings:  {en:"Settings",      so:"Dejinta",    ar:"الإعدادات",     fr:"Paramètres",   sw:"Mipangilio",   am:"ቅንብሮች",      ha:"Saiti",           de:"Einstellungen", zh:"设置",          es:"Configuración"},
  /* Home page */
  home_title:    {en:"BIOMETRIC IDENTITY SCANNER",so:"BAARITAANKA AQOONSIGA BAAYOOLOJIGA",ar:"ماسح الهوية البيومترية",fr:"SCANNER D'IDENTITÉ BIOMÉTRIQUE",sw:"SKANA YA UTAMBULISHO WA BAYOLOJIA",am:"የባዮሜትሪክ ማንነት ስካነር",ha:"KAFATO NA BAYOMETRIC IDENTITY",de:"BIOMETRISCHER IDENTITÄTSSCANNER",zh:"生物识别身份扫描仪",es:"ESCÁNER DE IDENTIDAD BIOMÉTRICA"},
  home_ready:    {en:"● SYSTEM READY",so:"● NIDAAMKU WAA DIYAAR",ar:"● النظام جاهز",fr:"● SYSTÈME PRÊT",sw:"● MFUMO UKO TAYARI",am:"● ሲስተሙ ዝግጁ ነው",ha:"● TSARIN YA SHIRYA",de:"● SYSTEM BEREIT",zh:"● 系统就绪",es:"● SISTEMA LISTO"},
  home_place:    {en:"PLACE FINGER ON SCANNER",so:"GELI FARAHA BAARITAANKA",ar:"ضع إصبعك على الماسح الضوئي",fr:"PLACEZ LE DOIGT SUR LE SCANNER",sw:"WEKA KIDOLE KWENYE SKANA",am:"ጣትዎን በስካነር ላይ ያድርጉ",ha:"SANYA YATSA A KAFATO",de:"FINGER AUF SCANNER LEGEN",zh:"将手指放在扫描仪上",es:"COLOQUE EL DEDO EN EL ESCÁNER"},
  home_scan_btn: {en:"INITIATE SCAN",so:"BILOW BAARITAANKA",ar:"ابدأ المسح",fr:"LANCER LE SCAN",sw:"ANZISHA SKANA",am:"ስካን ጀምር",ha:"FARA KAFATO",de:"SCAN STARTEN",zh:"开始扫描",es:"INICIAR ESCANEO"},
  home_manual:   {en:"↓ Manual login (admin / owner)",so:"↓ Gelitaanka gacanta (maamule / mulkiilaha)",ar:"↓ تسجيل الدخول اليدوي (مشرف / مالك)",fr:"↓ Connexion manuelle (admin / propriétaire)",sw:"↓ Ingia kwa mkono (msimamizi / mmiliki)",am:"↓ የእጅ ግባ (አስተዳዳሪ / ባለቤት)",ha:"↓ Shiga da hannu (admin / mai gida)",de:"↓ Manueller Login (Admin / Eigentümer)",zh:"↓ 手动登录（管理员/所有者）",es:"↓ Inicio manual (admin / propietario)"},
  /* Grid items */
  grid_register: {en:"Register",      so:"Diiwaagelinta",ar:"تسجيل",        fr:"Inscrire",     sw:"Sajili",       am:"ምዝገባ",       ha:"Yi rijista",    de:"Registrieren",  zh:"注册",          es:"Registrar"},
  grid_database: {en:"Database",      so:"Xog-Ururin",   ar:"قاعدة البيانات",fr:"Base données", sw:"Hifadhi data", am:"ዳታቤዝ",        ha:"Database",       de:"Datenbank",     zh:"数据库",        es:"Base de datos"},
  grid_deepsearch:{en:"Deep Search",  so:"Raadinta qoto dheer",ar:"البحث العميق",fr:"Recherche approfondie",sw:"Utafutaji wa kina",am:"ጥልቅ ፍለጋ",ha:"Bincike mai zurfi",de:"Tiefe Suche",zh:"深度搜索",es:"Búsqueda profunda"},
  grid_users:    {en:"Users",         so:"Isticmaalayaasha",ar:"المستخدمون",  fr:"Utilisateurs", sw:"Watumiaji",    am:"ተጠቃሚዎች",      ha:"Masu amfani",   de:"Benutzer",      zh:"用户",          es:"Usuarios"},
  grid_reports:  {en:"Reports",       so:"Warbixinta",   ar:"التقارير",     fr:"Rapports",     sw:"Ripoti",       am:"ሪፖርቶች",       ha:"Rahoto",         de:"Berichte",      zh:"报告",          es:"Informes"},
  grid_create:   {en:"Create",        so:"Samee",        ar:"إنشاء",        fr:"Créer",        sw:"Unda",         am:"ፍጠር",         ha:"Ƙirƙira",        de:"Erstellen",     zh:"创建",          es:"Crear"},
  /* Login */
  login_title:   {en:"BIOMETRIC AUTHENTICATION",so:"XAQIIJINTA BAAYOOLOJIGA",ar:"المصادقة البيومترية",fr:"AUTHENTIFICATION BIOMÉTRIQUE",sw:"UTHIBITISHAJI WA BAYOLOJIA",am:"የባዮሜትሪክ ማረጋገጫ",ha:"TABBATARWA TA BAYOMETRIC",de:"BIOMETRISCHE AUTHENTIFIZIERUNG",zh:"生物识别身份验证",es:"AUTENTICACIÓN BIOMÉTRICA"},
  login_btn:     {en:"Scan Fingerprint",so:"Baaritaanka faraha",ar:"مسح بصمة الإصبع",fr:"Scanner l'empreinte",sw:"Skana kidole",am:"የጣት አሻራ ስካን",ha:"Kafato yatsa",de:"Fingerabdruck scannen",zh:"扫描指纹",es:"Escanear huella"},
  login_manual:  {en:"Manual Login",  so:"Gelitaanka gacanta",ar:"تسجيل الدخول اليدوي",fr:"Connexion manuelle",sw:"Ingia kwa mkono",am:"የእጅ ግባ",ha:"Shiga da hannu",de:"Manueller Login",zh:"手动登录",es:"Inicio manual"},
  login_user:    {en:"Username",      so:"Magaca isticmaalaha",ar:"اسم المستخدم",fr:"Nom d'utilisateur",sw:"Jina la mtumiaji",am:"የተጠቃሚ ስም",ha:"Sunan mai amfani",de:"Benutzername",zh:"用户名",es:"Nombre de usuario"},
  login_pass:    {en:"Password",      so:"Furaha",       ar:"كلمة المرور",  fr:"Mot de passe", sw:"Neno la siri",  am:"የይለፍ ቃል",    ha:"Kalmar sirri",  de:"Passwort",      zh:"密码",          es:"Contraseña"},
  /* Database */
  db_title:      {en:"RECORDS DATABASE",so:"KAYDKA DIIWAANNADA",ar:"قاعدة بيانات السجلات",fr:"BASE DE DONNÉES DES DOSSIERS",sw:"HIFADHI YA REKODI",am:"የሰነዶች ዳታቤዝ",ha:"DATABASE NA RIKODIN",de:"DATENSATZDATENBANK",zh:"记录数据库",es:"BASE DE DATOS DE REGISTROS"},
  db_search:     {en:"Search records…",so:"Raadi diiwaannada…",ar:"ابحث في السجلات…",fr:"Rechercher…",sw:"Tafuta rekodi…",am:"ሰነዶችን ፈልግ…",ha:"Bincika rikodin…",de:"Datensätze suchen…",zh:"搜索记录…",es:"Buscar registros…"},
  db_new:        {en:"New Record",    so:"Diiwaanka cusub",ar:"سجل جديد",    fr:"Nouveau dossier",sw:"Rekodi mpya",am:"አዲስ ሰነድ",ha:"Sabon rikodin",de:"Neuer Datensatz",zh:"新记录",es:"Nuevo registro"},
  /* Settings */
  set_language:  {en:"Language",      so:"Luqadda",      ar:"اللغة",        fr:"Langue",       sw:"Lugha",        am:"ቋንቋ",         ha:"Harshe",         de:"Sprache",       zh:"语言",          es:"Idioma"},
  set_password:  {en:"Change Password",so:"Beddel furaha",ar:"تغيير كلمة المرور",fr:"Changer le mot de passe",sw:"Badilisha neno la siri",am:"የይለፍ ቃል ቀይር",ha:"Canza kalmar sirri",de:"Passwort ändern",zh:"更改密码",es:"Cambiar contraseña"},
  /* Footer */
  footer_system: {en:"BIOMETRIC IDENTITY MANAGEMENT SYSTEM",so:"NIDAAMKA MAAREYNTA AQOONSIGA BAAYOOLOJIGA",ar:"نظام إدارة الهوية البيومترية",fr:"SYSTÈME DE GESTION D'IDENTITÉ BIOMÉTRIQUE",sw:"MFUMO WA USIMAMIZI WA UTAMBULISHO WA BAYOLOJIA",am:"የባዮሜትሪክ ማንነት አስተዳደር ስርዓት",ha:"TSARIN GUDANAR DA BAYOMETRIC IDENTITY",de:"BIOMETRISCHES IDENTITÄTSMANAGEMENTSYSTEM",zh:"生物识别身份管理系统",es:"SISTEMA DE GESTIÓN DE IDENTIDAD BIOMÉTRICA"},
  /* Common */
  btn_save:      {en:"Save",          so:"Keydi",        ar:"حفظ",          fr:"Sauvegarder",  sw:"Hifadhi",      am:"አስቀምጥ",       ha:"Adana",          de:"Speichern",     zh:"保存",          es:"Guardar"},
  btn_cancel:    {en:"Cancel",        so:"Jooji",        ar:"إلغاء",        fr:"Annuler",      sw:"Ghairi",       am:"ሰርዝ",         ha:"Soke",           de:"Abbrechen",     zh:"取消",          es:"Cancelar"},
  btn_delete:    {en:"Delete",        so:"Tirtir",       ar:"حذف",          fr:"Supprimer",    sw:"Futa",         am:"ሰርዝ",         ha:"Share",           de:"Löschen",       zh:"删除",          es:"Eliminar"},
  btn_edit:      {en:"Edit",          so:"Wax ka beddel",ar:"تعديل",        fr:"Modifier",     sw:"Hariri",       am:"አርም",         ha:"Gyara",           de:"Bearbeiten",    zh:"编辑",          es:"Editar"},
  btn_print:     {en:"Print",         so:"Daabac",       ar:"طباعة",        fr:"Imprimer",     sw:"Chapisha",     am:"አትም",         ha:"Buga",            de:"Drucken",       zh:"打印",          es:"Imprimir"},
  btn_download:  {en:"Download",      so:"Soo dejiso",   ar:"تحميل",        fr:"Télécharger",  sw:"Pakua",        am:"አውርድ",        ha:"Sauke",           de:"Herunterladen", zh:"下载",          es:"Descargar"},
  lbl_name:      {en:"Full Name",     so:"Magaca buuxa", ar:"الاسم الكامل", fr:"Nom complet",  sw:"Jina kamili",  am:"ሙሉ ስም",       ha:"Cikakken suna",  de:"Vollständiger Name",zh:"全名",        es:"Nombre completo"},
  lbl_dob:       {en:"Date of Birth", so:"Taariikhda dhalashada",ar:"تاريخ الميلاد",fr:"Date de naissance",sw:"Tarehe ya kuzaliwa",am:"የልደት ቀን",ha:"Ranar haihuwa",de:"Geburtsdatum",zh:"出生日期",es:"Fecha de nacimiento"},
  lbl_id:        {en:"ID Number",     so:"Lambarka aqoonsiga",ar:"رقم الهوية",fr:"Numéro d'identité",sw:"Nambari ya kitambulisho",am:"የመታወቂያ ቁጥር",ha:"Lambar ID",de:"Ausweisnummer",zh:"身份证号",es:"Número de ID"},
  lbl_nationality:{en:"Nationality",  so:"Jinsiyadda",   ar:"الجنسية",      fr:"Nationalité",  sw:"Utaifa",       am:"ዜግነት",        ha:"Ƙasa",            de:"Nationalität",  zh:"国籍",          es:"Nacionalidad"},
  lbl_gender:    {en:"Gender",        so:"Jinsiga",      ar:"الجنس",        fr:"Genre",        sw:"Jinsia",       am:"ጾታ",           ha:"Jinsi",           de:"Geschlecht",    zh:"性别",          es:"Género"},
  no_records:    {en:"No records found",so:"Diiwaanno lama helin",ar:"لم يتم العثور على سجلات",fr:"Aucun dossier trouvé",sw:"Hakuna rekodi zilizopatikana",am:"ምንም ሰነዶች አልተገኙም",ha:"Ba a sami rikodin ba",de:"Keine Datensätze gefunden",zh:"未找到记录",es:"No se encontraron registros"},
};

/** Translate a key to the given language, fall back to English */
export function t(key: string, lang: string): string {
  return STRINGS[key]?.[lang] || STRINGS[key]?.["en"] || key;
}

/** Hook: reads current language from localStorage, re-renders when it changes */
export function useLang(): string {
  const [lang, setLang] = useState<string>(
    () => localStorage.getItem("bims_lang") || "en"
  );

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("bims_lang") || "en");
    window.addEventListener("bims_lang_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("bims_lang_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return lang;
}

/** Call this after saving a new language to notify all components */
export function applyLang(code: string) {
  const isRtl = LANGUAGES.find(l => l.code === code)?.rtl ?? false;
  localStorage.setItem("bims_lang", code);
  document.documentElement.lang = code;
  document.documentElement.dir  = isRtl ? "rtl" : "ltr";
  document.body.style.direction  = isRtl ? "rtl" : "ltr";
  window.dispatchEvent(new Event("bims_lang_change"));
}
