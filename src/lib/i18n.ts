/*
  Global i18n for BIMS — full coverage across all pages
  Usage: import { useLang, t } from "@/lib/i18n";
         const lang = useLang();
         return <h1>{t("home_title", lang)}</h1>
*/
import { useState, useEffect } from "react";

export const LANGUAGES = [
  {code:"en", label:"English",           flag:"🇬🇧", rtl:false},
  {code:"so", label:"Somali — Soomaali", flag:"🇸🇴", rtl:false},
  {code:"ar", label:"Arabic — العربية",  flag:"🇸🇦", rtl:true },
  {code:"fr", label:"French — Français", flag:"🇫🇷", rtl:false},
  {code:"sw", label:"Swahili — Kiswahili",flag:"🇰🇪",rtl:false},
  {code:"am", label:"Amharic — አማርኛ",   flag:"🇪🇹", rtl:false},
  {code:"ha", label:"Hausa",             flag:"🇳🇬", rtl:false},
  {code:"de", label:"German — Deutsch",  flag:"🇩🇪", rtl:false},
  {code:"zh", label:"Chinese — 中文",    flag:"🇨🇳", rtl:false},
  {code:"es", label:"Spanish — Español", flag:"🇪🇸", rtl:false},
];

type LangMap = Record<string,string>;
const L = (en:string,so:string,ar:string,fr:string,sw:string,am:string,ha:string,de:string,zh:string,es:string): LangMap =>
  ({en,so,ar,fr,sw,am,ha,de,zh,es});

export const STRINGS: Record<string, LangMap> = {
  // ── Navigation ──
  nav_support:    L("Support","Taageero","الدعم","Support","Msaada","ድጋፍ","Tallafi","Support","支持","Soporte"),
  nav_logout:     L("Logout","Ka bixi","تسجيل الخروج","Déconnexion","Ondoka","ውጣ","Fita","Abmelden","退出","Cerrar sesión"),
  nav_profile:    L("My Profile","Profile-ga","ملفي الشخصي","Mon profil","Wasifu wangu","መገለጫዬ","Bayanai na","Mein Profil","我的资料","Mi perfil"),
  nav_settings:   L("Settings","Dejinta","الإعدادات","Paramètres","Mipangilio","ቅንብሮች","Saiti","Einstellungen","设置","Configuración"),
  nav_home:       L("Home","Guriga","الرئيسية","Accueil","Nyumbani","መነሻ","Gida","Startseite","主页","Inicio"),
  nav_back:       L("Back","Dib u noqo","رجوع","Retour","Rudi","ተመለስ","Koma","Zurück","返回","Volver"),

  // ── Home page ──
  home_title:     L("BIOMETRIC IDENTITY SCANNER","BAARITAANKA AQOONSIGA BAAYOOLOJIGA","ماسح الهوية البيومترية","SCANNER D'IDENTITÉ BIOMÉTRIQUE","SKANA YA UTAMBULISHO WA BAYOLOJIA","የባዮሜትሪክ ማንነት ስካነር","KAFATO NA BAYOMETRIC IDENTITY","BIOMETRISCHER IDENTITÄTSSCANNER","生物识别身份扫描仪","ESCÁNER DE IDENTIDAD BIOMÉTRICA"),
  home_ready:     L("● SYSTEM READY","● NIDAAMKU WAA DIYAAR","● النظام جاهز","● SYSTÈME PRÊT","● MFUMO UKO TAYARI","● ሲስተሙ ዝግጁ ነው","● TSARIN YA SHIRYA","● SYSTEM BEREIT","● 系统就绪","● SISTEMA LISTO"),
  home_place:     L("PLACE FINGER ON SCANNER","GELI FARAHA BAARITAANKA","ضع إصبعك على الماسح","PLACEZ LE DOIGT SUR LE SCANNER","WEKA KIDOLE KWENYE SKANA","ጣትዎን በስካነር ላይ ያድርጉ","SANYA YATSA A KAFATO","FINGER AUF SCANNER LEGEN","将手指放在扫描仪上","COLOQUE EL DEDO EN EL ESCÁNER"),
  home_scan_btn:  L("INITIATE SCAN","BILOW BAARITAANKA","ابدأ المسح","LANCER LE SCAN","ANZISHA SKANA","ስካን ጀምር","FARA KAFATO","SCAN STARTEN","开始扫描","INICIAR ESCANEO"),
  home_manual:    L("↓ Manual login","↓ Gelitaanka gacanta","↓ تسجيل الدخول اليدوي","↓ Connexion manuelle","↓ Ingia kwa mkono","↓ የእጅ ግባ","↓ Shiga da hannu","↓ Manueller Login","↓ 手动登录","↓ Inicio manual"),

  // ── Grid buttons ──
  grid_register:  L("Register","Diiwaagelinta","تسجيل","Inscrire","Sajili","ምዝገባ","Yi rijista","Registrieren","注册","Registrar"),
  grid_database:  L("Database","Xog-Ururin","قاعدة البيانات","Base données","Hifadhi data","ዳታቤዝ","Database","Datenbank","数据库","Base de datos"),
  grid_deepsearch:L("Deep Search","Raadinta qoto dheer","البحث العميق","Recherche approfondie","Utafutaji wa kina","ጥልቅ ፍለጋ","Bincike mai zurfi","Tiefe Suche","深度搜索","Búsqueda profunda"),
  grid_users:     L("Users","Isticmaalayaasha","المستخدمون","Utilisateurs","Watumiaji","ተጠቃሚዎች","Masu amfani","Benutzer","用户","Usuarios"),
  grid_reports:   L("Reports","Warbixinta","التقارير","Rapports","Ripoti","ሪፖርቶች","Rahoto","Berichte","报告","Informes"),
  grid_create:    L("Create","Samee","إنشاء","Créer","Unda","ፍጠር","Ƙirƙira","Erstellen","创建","Crear"),

  // ── Login ──
  login_title:    L("BIOMETRIC AUTHENTICATION","XAQIIJINTA BAAYOOLOJIGA","المصادقة البيومترية","AUTHENTIFICATION BIOMÉTRIQUE","UTHIBITISHAJI WA BAYOLOJIA","የባዮሜትሪክ ማረጋገጫ","TABBATARWA TA BAYOMETRIC","BIOMETRISCHE AUTHENTIFIZIERUNG","生物识别身份验证","AUTENTICACIÓN BIOMÉTRICA"),
  login_btn:      L("Scan Fingerprint","Baaritaanka faraha","مسح بصمة الإصبع","Scanner l'empreinte","Skana kidole","የጣት አሻራ ስካን","Kafato yatsa","Fingerabdruck scannen","扫描指纹","Escanear huella"),
  login_manual:   L("Manual Login","Gelitaanka gacanta","تسجيل الدخول اليدوي","Connexion manuelle","Ingia kwa mkono","የእጅ ግባ","Shiga da hannu","Manueller Login","手动登录","Inicio manual"),
  login_user:     L("Username","Magaca isticmaalaha","اسم المستخدم","Nom d'utilisateur","Jina la mtumiaji","የተጠቃሚ ስም","Sunan mai amfani","Benutzername","用户名","Nombre de usuario"),
  login_pass:     L("Password","Furaha","كلمة المرور","Mot de passe","Neno la siri","የይለፍ ቃል","Kalmar sirri","Passwort","密码","Contraseña"),
  login_sign_in:  L("SIGN IN","GALI","تسجيل الدخول","SE CONNECTER","INGIA","ግባ","SHIGA","ANMELDEN","登录","INICIAR SESIÓN"),
  login_fp_tab:   L("FINGERPRINT","FARAHA","بصمة الإصبع","EMPREINTE","KIDOLE","የጣት አሻራ","YATSA","FINGERABDRUCK","指纹","HUELLA"),
  login_pw_tab:   L("USERNAME / PASSWORD","MAGACA / FURAHA","مستخدم / كلمة مرور","UTILISATEUR / MOT DE PASSE","JINA / NENO","ስም / ቃል","SUNA / KALMA","BENUTZER / PASSWORT","用户名/密码","USUARIO / CONTRASEÑA"),

  // ── Registration ──
  reg_title:      L("NEW REGISTRATION","DIIWAAGELINTA CUSUB","تسجيل جديد","NOUVELLE INSCRIPTION","USAJILI MPYA","አዲስ ምዝገባ","SABON RAJISTA","NEUE REGISTRIERUNG","新注册","NUEVO REGISTRO"),
  reg_step_personal:L("Personal","Shakhsiga","الشخصية","Personnel","Binafsi","ግል","Kaina","Persönlich","个人","Personal"),
  reg_step_creds: L("Credentials","Xog-ogaalka","الوثائق","Documents","Hati","ሰነዶች","Takaddun","Dokumente","证件","Documentos"),
  reg_step_contact:L("Contact","Xiriirka","الاتصال","Contact","Mawasiliano","ዕውቅና","Tuntuɗi","Kontakt","联系","Contacto"),
  reg_step_bio:   L("Biometrics","Baayooloji","القياسات الحيوية","Biométrie","Biometri","ባዮሜትሪክ","Bayometric","Biometrie","生物特征","Biometría"),
  reg_step_notes: L("Notes","Xusuusin","ملاحظات","Notes","Maelezo","ማስታወሻ","Bayanai","Notizen","备注","Notas"),
  reg_photo:      L("PROFILE PHOTO","SAWIRKA PROFILE","صورة الملف الشخصي","PHOTO DE PROFIL","PICHA YA WASIFU","የፕሮፋይል ፎቶ","HOTON PROFILE","PROFILFOTO","头像","FOTO DE PERFIL"),
  reg_upload:     L("CLICK TO UPLOAD PHOTO","GUJI SI AAN U KEENTO SAWIR","انقر لرفع صورة","CLIQUER POUR TÉLÉCHARGER","BONYEZA KUPAKIA PICHA","ፎቶ ለመስቀል ጠቅ ያድርጉ","DANNA DON LODA HOTO","KLICKEN ZUM HOCHLADEN","点击上传照片","HACER CLIC PARA SUBIR FOTO"),
  reg_upload_file:L("UPLOAD FILE","KEENO FAYLKA","رفع ملف","TÉLÉCHARGER FICHIER","PAKIA FAILI","ፋይል ስቀል","LODA FAYIL","DATEI HOCHLADEN","上传文件","SUBIR ARCHIVO"),
  reg_selfie:     L("TAKE SELFIE","KAXEE SELFIE","التقط صورة سيلفي","PRENDRE SELFIE","PIGA SELFIE","ሴልፊ ያንሱ","DAUKI SELFIE","SELFIE AUFNEHMEN","拍自拍","TOMAR SELFIE"),
  reg_capture:    L("CAPTURE","QAADO","التقاط","CAPTURER","PIGA PICHA","ቀረጽ","DAUKA","AUFNEHMEN","拍摄","CAPTURAR"),
  reg_first_name: L("First Name","Magaca hore","الاسم الأول","Prénom","Jina la kwanza","የፊት ስም","Suna na farko","Vorname","名字","Nombre"),
  reg_last_name:  L("Last Name","Magaca dambe","اسم العائلة","Nom de famille","Jina la mwisho","የአያት ስም","Sunan iyali","Nachname","姓氏","Apellido"),
  reg_dob:        L("Date of Birth","Taariikhda dhalashada","تاريخ الميلاد","Date de naissance","Tarehe ya kuzaliwa","የልደት ቀን","Ranar haihuwa","Geburtsdatum","出生日期","Fecha de nacimiento"),
  reg_gender:     L("Gender","Jinsiga","الجنس","Genre","Jinsia","ጾታ","Jinsi","Geschlecht","性别","Género"),
  reg_nationality:L("Nationality","Jinsiyadda","الجنسية","Nationalité","Utaifa","ዜግነት","Ƙasa","Nationalität","国籍","Nacionalidad"),
  reg_country:    L("Country","Wadanka","البلد","Pays","Nchi","ሀገር","Ƙasa","Land","国家","País"),
  reg_city:       L("City","Magaalada","المدينة","Ville","Mji","ከተማ","Birni","Stadt","城市","Ciudad"),
  reg_address:    L("Address","Cinwaanka","العنوان","Adresse","Anwani","አድራሻ","Adireshi","Adresse","地址","Dirección"),
  reg_phone:      L("Phone Number","Telefoonka","رقم الهاتف","Numéro de téléphone","Nambari ya simu","ስልክ ቁጥር","Lambar waya","Telefonnummer","电话号码","Número de teléfono"),
  reg_email:      L("Email","Iimayl","البريد الإلكتروني","E-mail","Barua pepe","ኢሜይል","Imel","E-Mail","电子邮件","Correo electrónico"),
  reg_blood_type: L("Blood Type","Nooca dhiigga","فصيلة الدم","Groupe sanguin","Kundi la damu","የደም አይነት","Nau'in jini","Blutgruppe","血型","Tipo de sangre"),
  reg_occupation: L("Occupation","Shaqada","المهنة","Profession","Kazi","ሙያ","Sana'a","Beruf","职业","Ocupación"),
  reg_emergency:  L("Emergency Contact","Xiriirka xaaladaha degdegga","جهة اتصال طوارئ","Contact d'urgence","Mawasiliano ya dharura","ድንገተኛ እውቅና","Tuntuɗi na gaggawa","Notfallkontakt","紧急联系人","Contacto de emergencia"),
  reg_next:       L("NEXT","XIGA","التالي","SUIVANT","INGIA","ቀጥላ","GABA","WEITER","下一步","SIGUIENTE"),
  reg_back:       L("BACK","DIBO","رجوع","RETOUR","RUDI","ተመለስ","KOMA","ZURÜCK","返回","VOLVER"),
  reg_submit:     L("SUBMIT REGISTRATION","GUDBI DIIWAAGELINTA","إرسال التسجيل","SOUMETTRE L'INSCRIPTION","TUMA USAJILI","ምዝገባ አስገባ","AIKA RAJISTA","REGISTRIERUNG EINREICHEN","提交注册","ENVIAR REGISTRO"),
  reg_passport:   L("Passport","Baasaboor","جواز السفر","Passeport","Pasipoti","ፓስፖርት","Fasfo","Reisepass","护照","Pasaporte"),
  reg_license:    L("Driving License","Laysenka wadista","رخصة القيادة","Permis de conduire","Leseni ya udereva","የሽርሽር ፈቃድ","Lasisin tuƙi","Führerschein","驾照","Licencia de conducir"),
  reg_no_passport:L("No Passport","Baasaboor ma leh","لا يوجد جواز","Pas de passeport","Hana pasipoti","ፓስፖርት የለም","Babu fasfo","Kein Reisepass","无护照","Sin pasaporte"),
  reg_success:    L("Registration Complete","Diiwaagelinta waa la dhameystay","اكتمل التسجيل","Inscription terminée","Usajili umekamilika","ምዝገባ ተጠናቋል","Rajista ya kammala","Registrierung abgeschlossen","注册完成","Registro completado"),

  // ── Database ──
  db_title:       L("IDENTITY DATABASE","KAYDKA AQOONSIGA","قاعدة بيانات الهوية","BASE DE DONNÉES D'IDENTITÉ","HIFADHI YA UTAMBULISHO","የማንነት ዳታቤዝ","DATABASE NA ASALI","IDENTITÄTSDATENBANK","身份数据库","BASE DE DATOS DE IDENTIDAD"),
  db_subtitle:    L("CIVIL RECORDS ARCHIVE","KAYDKA DIIWAANADA MADANIGA","أرشيف السجلات المدنية","ARCHIVE DES DOSSIERS CIVILS","KUMBUKUMBU ZA REKODI ZA RAIA","የሲቪል ሰነዶች ማህደር","AJIYAR RIKODIN NA JAMA'A","ZIVILAKTENARCHIV","公民档案库","ARCHIVO DE REGISTROS CIVILES"),
  db_search:      L("Search records…","Raadi diiwaannada…","ابحث في السجلات…","Rechercher…","Tafuta rekodi…","ሰነዶችን ፈልግ…","Bincika rikodin…","Datensätze suchen…","搜索记录…","Buscar registros…"),
  db_text_search: L("TEXT SEARCH","RAADINTA QORAALKA","البحث النصي","RECHERCHE TEXTE","UTAFUTAJI WA MAANDISHI","የጽሑፍ ፍለጋ","BINCIKE NA RUBUTU","TEXTSUCHE","文字搜索","BÚSQUEDA DE TEXTO"),
  db_face_recog:  L("FACE RECOGNITION","AQOONSIGA WEJIIGA","التعرف على الوجه","RECONNAISSANCE FACIALE","UTAMBUZI WA USO","የፊት ለፊት ዕውቅና","GANE FUSKA","GESICHTSERKENNUNG","人脸识别","RECONOCIMIENTO FACIAL"),
  db_upload_photo:L("Upload a photo to search","Soo geli sawir si aad u raadsato","رفع صورة للبحث","Télécharger une photo pour rechercher","Pakia picha kutafuta","ፎቶ ስቀል ለፍለጋ","Loda hoto don bincike","Foto zum Suchen hochladen","上传照片搜索","Subir foto para buscar"),
  db_no_match:    L("NO FACE MATCH","WAJI LA MUTHWANA HALIKUPATIKANA","لا يوجد تطابق للوجه","AUCUNE CORRESPONDANCE","HAKUNA MFANO WA USO","ምንም ፊት አልተዛመደም","BA A SAMI FUSKA BA","KEINE GESICHTSÜBEREINSTIMMUNG","未找到匹配面孔","SIN COINCIDENCIA FACIAL"),
  db_match_found: L("IDENTITY MATCHED","AQOONSIGU WAA CADDEYNAY","تم العثور على تطابق","IDENTITÉ TROUVÉE","UTAMBULISHO UMEPATIKANA","ማንነት ተዛምዷል","AN GANO ASALI","IDENTITÄT GEFUNDEN","找到匹配身份","IDENTIDAD ENCONTRADA"),
  db_new:         L("New Record","Diiwaanka cusub","سجل جديد","Nouveau dossier","Rekodi mpya","አዲስ ሰነድ","Sabon rikodin","Neuer Datensatz","新记录","Nuevo registro"),
  db_records:     L("Records","Diiwaanada","السجلات","Dossiers","Rekodi","ሰነዶች","Rikodin","Datensätze","记录","Registros"),
  db_access_logs: L("ACCESS LOGS","DIIWAANKA GELITAANKA","سجلات الوصول","JOURNAUX D'ACCÈS","KUMBUKUMBU ZA UFIKIAJI","የመዳረሻ ምዝግቦች","RIKODIN SHIGA","ZUGRIFFSPROTOKOLLE","访问日志","REGISTROS DE ACCESO"),
  db_lock:        L("LOCK","XIDH","قفل","VERROUILLER","FUNGA","ቆልፍ","KULLE","SPERREN","锁定","BLOQUEAR"),
  db_full_profile:L("FULL PROFILE","PROFILE-KA BUUXA","الملف الشخصي الكامل","PROFIL COMPLET","WASIFU KAMILI","ሙሉ ፕሮፋይል","CIKAKKEN PROFILE","VOLLSTÄNDIGES PROFIL","完整档案","PERFIL COMPLETO"),
  db_view:        L("VIEW","ARAG","عرض","VOIR","TAZAMA","ይመልከቱ","DUBA","ANZEIGEN","查看","VER"),
  db_edit:        L("EDIT","WAXKA BEDDEL","تعديل","MODIFIER","HARIRI","አርም","GYARA","BEARBEITEN","编辑","EDITAR"),
  db_delete:      L("DELETE","TIRTIR","حذف","SUPPRIMER","FUTA","ሰርዝ","SHARE","LÖSCHEN","删除","ELIMINAR"),
  db_col_id:      L("ID","ID","المعرف","ID","ID","መ/ቁ","ID","ID","编号","ID"),
  db_col_name:    L("FULL NAME","MAGACA BUUXA","الاسم الكامل","NOM COMPLET","JINA KAMILI","ሙሉ ስም","CIKAKKEN SUNA","VOLLSTÄNDIGER NAME","全名","NOMBRE COMPLETO"),
  db_col_gender:  L("GENDER","JINSIGA","الجنس","GENRE","JINSIA","ጾታ","JINSI","GESCHLECHT","性别","GÉNERO"),
  db_col_nat:     L("NATIONALITY","JINSIYADDA","الجنسية","NATIONALITÉ","UTAIFA","ዜግነት","ƘASA","NATIONALITÄT","国籍","NACIONALIDAD"),
  db_col_dob:     L("DOB","T/DHALASHADA","تاريخ الميلاد","DATE NAI.","TAREHE KUZALIWA","ቀን ልደት","RANAR HAIHUWA","GEBURTSDATUM","出生日期","FECHA NAC."),
  db_col_reg:     L("REGISTERED","LA DIIWAANGELIYEY","مسجل","ENREGISTRÉ","IMESAJILIWA","ተመዝግቧል","YA RAJISTA","REGISTRIERT","已注册","REGISTRADO"),
  db_col_action:  L("ACTION","FICIL","إجراء","ACTION","HATUA","ድርጊት","AIKI","AKTION","操作","ACCIÓN"),
  db_fp_required: L("FINGERPRINT REQUIRED","FARAHA AYAA LOOHAHAN","بصمة الإصبع مطلوبة","EMPREINTE REQUISE","KIDOLE KINAHITAJIKA","ጣት አሻራ ያስፈልጋል","BUKATAR YATSA","FINGERABDRUCK ERFORDERLICH","需要指纹","SE REQUIERE HUELLA"),
  db_scan_finger: L("TAP TO SCAN","RIIX SI AAN U BAARNO","انقر للمسح","APPUYER POUR SCANNER","GONGA KUSCAN","ጠቅ ያድርጉ ለስካን","DANNA DON KAFATO","TIPPEN ZUM SCANNEN","点击扫描","TOQUE PARA ESCANEAR"),
  db_otp_verify:  L("OTP VERIFICATION","XAQIIJINTA OTP","التحقق من OTP","VÉRIFICATION OTP","UTHIBITISHAJI WA OTP","OTP ማረጋገጫ","TABBATAR DA OTP","OTP-VERIFIZIERUNG","OTP验证","VERIFICACIÓN OTP"),
  db_otp_sent:    L("OTP sent to registered contact","OTP ayaa loo diray xiriirka","تم إرسال OTP للجهة المسجلة","OTP envoyé au contact enregistré","OTP imetumwa kwa mawasiliano","OTP ወደ ተመዝጋቢ ዕውቅና ተልኳል","An aika OTP ga tuntuɗin rajista","OTP an registrierten Kontakt gesendet","OTP已发送至注册联系人","OTP enviado al contacto registrado"),
  db_enter_otp:   L("ENTER OTP TO ACCESS EDIT","GELI OTP SI AAD U WAXKA BEDDESHID","أدخل OTP للوصول للتعديل","ENTREZ OTP POUR MODIFIER","WEKA OTP KWA UHARIRI","OTP ያስገቡ ለማርትዕ","SHIGAR OTP DON GYARA","OTP EINGEBEN ZUM BEARBEITEN","输入OTP以进行编辑","INGRESE OTP PARA EDITAR"),
  db_try_photo:   L("TRY ANOTHER PHOTO","KAL SOO GELI SAWIR","جرب صورة أخرى","ESSAYER UNE AUTRE PHOTO","JARIBU PICHA NYINGINE","ሌላ ፎቶ ሞክሩ","GWADA WATA HOTO","ANDERES FOTO VERSUCHEN","尝试另一张照片","INTENTAR OTRA FOTO"),
  db_clear:       L("CLEAR","NADIIFI","مسح","EFFACER","FUTA","አጽዳ","SHARE","LÖSCHEN","清除","LIMPIAR"),
  db_query_img:   L("QUERY IMAGE","SAWIRKA RAADINTA","صورة الاستعلام","IMAGE DE RECHERCHE","PICHA YA UTAFUTAJI","የፍለጋ ምስል","HOTON BINCIKE","SUCHANFRAGEBILD","查询图像","IMAGEN DE CONSULTA"),
  db_scanning:    L("SCANNING…","BAARITAAN…","جارٍ المسح…","SCAN EN COURS…","INASCAN…","ስካን እየተደረገ…","KAFATO…","WIRD GESCANNT…","扫描中…","ESCANEANDO…"),

  // ── Result / Full Profile ──
  res_title:      L("BIOMETRIC PROFILE","PROFILE-KA BAAYOOLOJIGA","الملف البيومتري","PROFIL BIOMÉTRIQUE","WASIFU WA KIBAOLOJIA","የባዮሜትሪክ ፕሮፋይል","PROFILE TA BAYOMETRIC","BIOMETRISCHES PROFIL","生物特征档案","PERFIL BIOMÉTRICO"),
  res_personal:   L("Personal Information","Macluumaadka Shakhsiga","المعلومات الشخصية","Informations personnelles","Taarifa za kibinafsi","የግል መረጃ","Bayanan kaina","Persönliche Informationen","个人信息","Información personal"),
  res_contact:    L("Contact Information","Macluumaadka Xiriirka","معلومات الاتصال","Informations de contact","Mawasiliano","የዕውቅና መረጃ","Bayanin tuntuɗi","Kontaktinformationen","联系信息","Información de contacto"),
  res_documents:  L("Documents","Dokumeentiyada","الوثائق","Documents","Nyaraka","ሰነዶች","Takardu","Dokumente","证件","Documentos"),
  res_biometrics: L("Biometrics","Baayoolojiga","القياسات الحيوية","Biométrie","Biometri","ባዮሜትሪክ","Bayometric","Biometrie","生物特征","Biometría"),
  res_notes:      L("Notes","Xusuusin","ملاحظات","Notes","Maelezo","ማስታወሻ","Bayanai","Notizen","备注","Notas"),
  res_edit:       L("EDIT RECORD","WAXKA BEDDEL","تعديل السجل","MODIFIER LE DOSSIER","HARIRI REKODI","ሰነድ አርም","GYARA RIKODIN","DATENSATZ BEARBEITEN","编辑记录","EDITAR REGISTRO"),
  res_print:      L("PRINT","DAABAC","طباعة","IMPRIMER","CHAPISHA","አትም","BUGA","DRUCKEN","打印","IMPRIMIR"),
  res_export:     L("EXPORT","DHOFI","تصدير","EXPORTER","HAMISHA","ወደ ውጭ ላክ","FITARWA","EXPORTIEREN","导出","EXPORTAR"),
  res_not_found:  L("Record not found","Diiwaanku ma jiro","السجل غير موجود","Dossier introuvable","Rekodi haipatikani","ሰነዱ አልተገኘም","Ba a sami rikodin ba","Datensatz nicht gefunden","未找到记录","Registro no encontrado"),

  // ── Reports ──
  rep_title:      L("REPORTS & AUDIT","WARBIXINTA & HUBINTA","التقارير والتدقيق","RAPPORTS ET AUDIT","RIPOTI NA UKAGUZI","ሪፖርቶች እና ኦዲት","RAHOTO DA DUBA","BERICHTE & AUDIT","报告与审计","INFORMES Y AUDITORÍA"),
  rep_activity:   L("Activity Log","Diiwaanka Howlaha","سجل النشاط","Journal d'activité","Kumbukumbu ya shughuli","የእንቅስቃሴ ምዝግብ","Rikodin aiki","Aktivitätsprotokoll","活动日志","Registro de actividad"),
  rep_export:     L("Export Report","Soo dhofi warbixinta","تصدير التقرير","Exporter le rapport","Hamisha ripoti","ሪፖርት ላክ","Fitarwa rahoto","Bericht exportieren","导出报告","Exportar informe"),
  rep_filter:     L("Filter","Shaandeeye","تصفية","Filtrer","Chuja","ማጣሪያ","Tace","Filtern","筛选","Filtrar"),
  rep_all:        L("All","Dhammaan","الكل","Tout","Yote","ሁሉ","Duka","Alle","全部","Todo"),
  rep_date_from:  L("From","Laga bilaabo","من","De","Kutoka","ከ","Daga","Von","从","Desde"),
  rep_date_to:    L("To","Ilaa","إلى","À","Hadi","እስከ","Zuwa","Bis","到","Hasta"),
  rep_no_logs:    L("No activity logs","Ma jiraan diiwaanno howleed","لا توجد سجلات نشاط","Aucun journal","Hakuna kumbukumbu","ምንም ምዝግቦች የሉም","Babu rikodin aiki","Keine Protokolle","无活动日志","Sin registros"),

  // ── Create / Documents ──
  cre_title:      L("CREATE DOCUMENT","SAMEE DOKUMEENTI","إنشاء مستند","CRÉER UN DOCUMENT","TENGENEZA HATI","ሰነድ ፍጠር","ƘIRƘIRI TAKARDU","DOKUMENT ERSTELLEN","创建文件","CREAR DOCUMENTO"),
  cre_select_cat: L("Select Category","Dooro Nooca","اختر الفئة","Sélectionner la catégorie","Chagua aina","ምድብ ምረጥ","Zaɓi rukuni","Kategorie auswählen","选择类别","Seleccionar categoría"),
  cre_select_type:L("Select Document Type","Dooro Nooca Dokumeentiga","اختر نوع المستند","Sélectionner le type de document","Chagua aina ya hati","የሰነድ አይነት ምረጥ","Zaɓi nau'in takardu","Dokumenttyp auswählen","选择文件类型","Seleccionar tipo de documento"),
  cre_generate:   L("Generate Document","Samee Dokumeentiga","إنشاء المستند","Générer le document","Tengeneza hati","ሰነድ ፍጠር","Ƙirƙiri takardu","Dokument generieren","生成文件","Generar documento"),
  cre_preview:    L("DOCUMENT PREVIEW","MUUQAALKA DOKUMEENTIGA","معاينة المستند","APERÇU DU DOCUMENT","HAKIKI YA HATI","ሰነድ ቅድሚያ ቅጽ","KALLON TAKARDU","DOKUMENTVORSCHAU","文件预览","VISTA PREVIA DEL DOCUMENTO"),
  cre_download:   L("Download","Soo dejiso","تنزيل","Télécharger","Pakua","አውርድ","Sauke","Herunterladen","下载","Descargar"),
  cre_print:      L("Print","Daabac","طباعة","Imprimer","Chapisha","አትም","Buga","Drucken","打印","Imprimir"),
  cre_no_record:  L("No biometric record found","Diiwaanka baayoolojiga lama helin","لم يُعثر على سجل بيومتري","Aucun dossier biométrique","Rekodi ya biometriki haipatikani","ምንም የባዮሜትሪክ ሰነድ አልተገኘም","Ba a sami rikodin bayometric ba","Kein biometrischer Datensatz gefunden","未找到生物特征记录","No se encontró registro biométrico"),
  cre_visa:       L("Visa Applications","Codsiyada Fiisa","طلبات التأشيرة","Demandes de visa","Maombi ya visa","የቪዛ ማመልከቻዎች","Buƙatun biza","Visaanträge","签证申请","Solicitudes de visa"),
  cre_official:   L("Open Official Portal","Fur Bawwabada Rasmiga","فتح البوابة الرسمية","Ouvrir le portail officiel","Fungua tovuti rasmi","ኦፊሴላዊ ፖርታል ክፈት","Buɗe hanyar hukuma","Offizielles Portal öffnen","打开官方门户","Abrir portal oficial"),

  // ── Profile ──
  pro_title:      L("MY PROFILE","PROFILE-KAYGA","ملفي الشخصي","MON PROFIL","WASIFU WANGU","የእኔ ፕሮፋይል","PROFILE NAWA","MEIN PROFIL","我的档案","MI PERFIL"),
  pro_role:       L("Role","Doorka","الدور","Rôle","Jukumu","ሚና","Matsayi","Rolle","角色","Rol"),
  pro_username:   L("Username","Magaca isticmaalaha","اسم المستخدم","Nom d'utilisateur","Jina la mtumiaji","የተጠቃሚ ስም","Sunan mai amfani","Benutzername","用户名","Nombre de usuario"),
  pro_member_since:L("Member Since","Xubin laga bilaabay","عضو منذ","Membre depuis","Mwanachama tangu","አባል ከ","Memba tun daga","Mitglied seit","会员自","Miembro desde"),
  pro_change_pass:L("Change Password","Beddel furaha","تغيير كلمة المرور","Changer le mot de passe","Badilisha neno la siri","የይለፍ ቃል ቀይር","Canza kalmar sirri","Passwort ändern","更改密码","Cambiar contraseña"),
  pro_logout:     L("Logout","Ka bixi","تسجيل الخروج","Déconnexion","Ondoka","ውጣ","Fita","Abmelden","退出","Cerrar sesión"),

  // ── Settings ──
  set_language:   L("Language","Luqadda","اللغة","Langue","Lugha","ቋንቋ","Harshe","Sprache","语言","Idioma"),
  set_password:   L("Change Password","Beddel furaha","تغيير كلمة المرور","Changer le mot de passe","Badilisha neno la siri","የይለፍ ቃል ቀይር","Canza kalmar sirri","Passwort ändern","更改密码","Cambiar contraseña"),
  language:       L("Language","Luqadda","اللغة","Langue","Lugha","ቋንቋ","Harshe","Sprache","语言","Idioma"),
  changepass:     L("Change Password","Beddel Furaha","تغيير كلمة المرور","Changer Mot de Passe","Badilisha Neno","የይለፍ ቃል ቀይር","Canza Kalmar","Passwort Ändern","修改密码","Cambiar Contraseña"),
  selectlang:     L("Select your language","Dooro luqaddaada","اختر لغتك","Choisissez votre langue","Chagua lugha yako","ቋንቋዎን ምረጡ","Zaɓi harshena","Wähle deine Sprache","选择你的语言","Elige tu idioma"),
  activelang:     L("✓ ACTIVE","✓ FIRFIRCOON","✓ نشط","✓ ACTIF","✓ AMILIFU","✓ ነቅሷል","✓ AIKI","✓ AKTIV","✓ 已选","✓ ACTIVO"),
  curpass:        L("Current Password","Furaha hadda","كلمة المرور الحالية","Mot de passe actuel","Neno la siri la sasa","አሁን ያለ የይለፍ ቃል","Kalmar sirri ta yanzu","Aktuelles Passwort","当前密码","Contraseña actual"),
  newpass:        L("New Password","Furaha cusub","كلمة المرور الجديدة","Nouveau mot de passe","Neno jipya la siri","አዲስ የይለፍ ቃል","Sabuwar kalmar sirri","Neues Passwort","新密码","Nueva contraseña"),

  // ── User Management ──
  usr_title:      L("USER MANAGEMENT","MAAREYNTA ISTICMAALAYAASHA","إدارة المستخدمين","GESTION DES UTILISATEURS","USIMAMIZI WA WATUMIAJI","የተጠቃሚ አስተዳደር","GUDANAR DA MASU AMFANI","BENUTZERVERWALTUNG","用户管理","GESTIÓN DE USUARIOS"),
  usr_add:        L("Add User","Ku dar isticmaale","إضافة مستخدم","Ajouter utilisateur","Ongeza mtumiaji","ተጠቃሚ ጨምር","Ƙara mai amfani","Benutzer hinzufügen","添加用户","Agregar usuario"),
  usr_edit:       L("Edit User","Waxka beddel isticmaalaha","تعديل المستخدم","Modifier utilisateur","Hariri mtumiaji","ተጠቃሚ አርም","Gyara mai amfani","Benutzer bearbeiten","编辑用户","Editar usuario"),
  usr_delete:     L("Delete User","Tirtir isticmaalaha","حذف المستخدم","Supprimer utilisateur","Futa mtumiaji","ተጠቃሚ ሰርዝ","Share mai amfani","Benutzer löschen","删除用户","Eliminar usuario"),
  usr_full_name:  L("Full Name","Magaca buuxa","الاسم الكامل","Nom complet","Jina kamili","ሙሉ ስም","Cikakken suna","Vollständiger Name","全名","Nombre completo"),
  usr_username:   L("Username","Magaca isticmaalaha","اسم المستخدم","Nom d'utilisateur","Jina la mtumiaji","የተጠቃሚ ስም","Sunan mai amfani","Benutzername","用户名","Nombre de usuario"),
  usr_role:       L("Role","Doorka","الدور","Rôle","Jukumu","ሚና","Matsayi","Rolle","角色","Rol"),
  usr_password:   L("Password","Furaha","كلمة المرور","Mot de passe","Neno la siri","የይለፍ ቃል","Kalmar sirri","Passwort","密码","Contraseña"),
  usr_confirm_pw: L("Confirm Password","Xaqiiji furaha","تأكيد كلمة المرور","Confirmer mot de passe","Thibitisha neno","የይለፍ ቃል አረጋግጥ","Tabbatar kalmar","Passwort bestätigen","确认密码","Confirmar contraseña"),
  usr_active:     L("Active","Firfircoon","نشط","Actif","Amilifu","ንቁ","Aiki","Aktiv","激活","Activo"),
  usr_inactive:   L("Inactive","Aan firfircoonayn","غير نشط","Inactif","Haifanyi kazi","ንቁ አይደለም","Ba aiki ba","Inaktiv","未激活","Inactivo"),
  usr_save:       L("Save User","Keyd Isticmaalaha","حفظ المستخدم","Sauvegarder","Hifadhi mtumiaji","ተጠቃሚ አስቀምጥ","Adana mai amfani","Benutzer speichern","保存用户","Guardar usuario"),
  usr_cancel:     L("Cancel","Jooji","إلغاء","Annuler","Ghairi","ሰርዝ","Soke","Abbrechen","取消","Cancelar"),
  usr_no_users:   L("No users found","Ma jiraan isticmaalayaal","لا يوجد مستخدمون","Aucun utilisateur","Hakuna watumiaji","ምንም ተጠቃሚዎች የሉም","Babu masu amfani","Keine Benutzer gefunden","未找到用户","No se encontraron usuarios"),
  usr_owner:      L("Owner","Mulkiilaha","المالك","Propriétaire","Mmiliki","ባለቤት","Mai gida","Eigentümer","所有者","Propietario"),
  usr_admin:      L("Admin","Maamule","مشرف","Administrateur","Msimamizi","አስተዳዳሪ","Admin","Administrator","管理员","Administrador"),
  usr_operator:   L("Operator","Hawlwadeen","مشغل","Opérateur","Opereta","ኦፐሬተር","Mai aiki","Operator","操作员","Operador"),
  usr_analyst:    L("Analyst","Xisaabaad","محلل","Analyste","Mchambuzi","ተንታኝ","Mai nazari","Analyst","分析员","Analista"),

  // ── Tech Support ──
  tec_title:      L("TECHNICAL SUPPORT","TAAGEERADA FARSAMADA","الدعم الفني","SUPPORT TECHNIQUE","MSAADA WA KIUFUNDI","የቴክኒክ ድጋፍ","TALLAFIN FASAHA","TECHNISCHER SUPPORT","技术支持","SOPORTE TÉCNICO"),
  tec_issue:      L("Issue Type","Nooca Dhibaatada","نوع المشكلة","Type de problème","Aina ya tatizo","የችግር አይነት","Nau'in matsala","Problemtyp","问题类型","Tipo de problema"),
  tec_priority:   L("Priority","Muhiimadda","الأولوية","Priorité","Kipaumbele","ቅድሳት","Muhimmanci","Priorität","优先级","Prioridad"),
  tec_describe:   L("Describe your issue","Sharax dhibaatadaada","صف مشكلتك","Décrivez votre problème","Elezea tatizo lako","ችግርዎን ያብራሩ","Bayyana matsalar ka","Beschreiben Sie Ihr Problem","描述您的问题","Describa su problema"),
  tec_submit:     L("Submit Ticket","Gudbi codsiga","إرسال التذكرة","Soumettre le ticket","Tuma tikiti","ቲኬት አስገባ","Aika tikiti","Ticket einreichen","提交工单","Enviar ticket"),
  tec_reported_by:L("Reported by","Waxaa xaraya","أُبلغ عنها بواسطة","Signalé par","Imeripotiwa na","ተዘግቦ","An ba da rahoto","Gemeldet von","报告人","Reportado por"),
  tec_sent:       L("Ticket submitted successfully","Codsiga si guul leh ayaa loo diray","تم إرسال التذكرة بنجاح","Ticket soumis avec succès","Tikiti imetumwa","ቲኬት ተልኳል","An aika tikiti","Ticket erfolgreich eingereicht","工单已成功提交","Ticket enviado exitosamente"),

  // ── Footer ──
  footer_system:  L("BIOMETRIC IDENTITY MANAGEMENT SYSTEM","NIDAAMKA MAAREYNTA AQOONSIGA BAAYOOLOJIGA","نظام إدارة الهوية البيومترية","SYSTÈME DE GESTION D'IDENTITÉ BIOMÉTRIQUE","MFUMO WA USIMAMIZI WA UTAMBULISHO","የባዮሜትሪክ ማንነት አስተዳደር ስርዓት","TSARIN GUDANAR DA BAYOMETRIC IDENTITY","BIOMETRISCHES IDENTITÄTSMANAGEMENTSYSTEM","生物识别身份管理系统","SISTEMA DE GESTIÓN DE IDENTIDAD BIOMÉTRICA"),
  footer_version: L("BIMS v1.0","BIMS v1.0","BIMS نسخة 1.0","BIMS v1.0","BIMS v1.0","BIMS v1.0","BIMS v1.0","BIMS v1.0","BIMS v1.0","BIMS v1.0"),


  // ── Additional keys for full coverage ──
  rep_system:      L("SYSTEM REPORTS","WARBIXINNADA NIDAAMKA","تقارير النظام","RAPPORTS SYSTÈME","RIPOTI ZA MFUMO","የሲስተም ሪፖርቶች","RAHOTON TSARIN","SYSTEMBERICHTE","系统报告","INFORMES DEL SISTEMA"),
  rep_db_history:  L("DATABASE ACCESS HISTORY","TARIIKH GELITAANKA","سجل الوصول لقاعدة البيانات","HISTORIQUE D'ACCÈS","HISTORIA YA UFIKIAJI","የዳታቤዝ ታሪክ","TARIHIN SHIGA","DATENBANKZUGRIFFSPROTOKOLL","数据库访问历史","HISTORIAL DE ACCESO"),
  rep_storage:     L("STORAGE INFORMATION","XOGTA KAYDKA","معلومات التخزين","INFORMATIONS DE STOCKAGE","TAARIFA ZA HIFADHI","የማከማቻ መረጃ","BAYANIN AJIYA","SPEICHERINFORMATION","存储信息","INFORMACIÓN DE ALMACENAMIENTO"),
  rep_summary:     L("SUMMARY","SOOGALINTA","ملخص","RÉSUMÉ","MUHTASARI","ማጠቃለያ","TAƘAITAWA","ZUSAMMENFASSUNG","摘要","RESUMEN"),
  rep_sessions:    L("USER SESSIONS","XOGTII ISTICMAALAYAASHA","جلسات المستخدمين","SESSIONS UTILISATEURS","VIKAO VYA WATUMIAJI","የተጠቃሚ ክፍለ ጊዜዎች","ZAMAN MASU AMFANI","BENUTZERSITZUNGEN","用户会话","SESIONES DE USUARIO"),
  rep_no_events:   L("NO EVENTS FOUND","XAFLADOOD LAMA HELIN","لم يُعثر على أحداث","AUCUN ÉVÉNEMENT TROUVÉ","HAKUNA MATUKIO","ምንም ክስተቶች አልተገኙም","BABU ABUBUWAN DA SUKA FARU","KEINE EREIGNISSE GEFUNDEN","未找到事件","NO SE ENCONTRARON EVENTOS"),
  cre_fill_data:   L("FILL WITH MY DATA","KU BUUXI XOGTAYDA","ملء ببياناتي","REMPLIR AVEC MES DONNÉES","JAZA NA DATA YANGU","በእኔ ዳታ ሙላ","CIKA DA BAYANAN NA","MIT MEINEN DATEN FÜLLEN","用我的数据填写","RELLENAR CON MIS DATOS"),
  cre_open_form:   L("OPEN OFFICIAL FORM","FUR FOOMKA RASMIGA","فتح النموذج الرسمي","OUVRIR LE FORMULAIRE OFFICIEL","FUNGUA FOMU RASMI","ኦፊሴላዊ ቅጽ ክፈት","BUƊE TSARIN HUKUMA","OFFIZIELLES FORMULAR ÖFFNEN","打开官方表格","ABRIR FORMULARIO OFICIAL"),
  pro_biometric_id:L("BIOMETRIC ID","AQOONSIGA BAAYOOLOJIGA","المعرف البيومتري","ID BIOMÉTRIQUE","ID YA BIOMETRIKI","የባዮሜትሪክ መ/ቁ","BAYOMETRIC ID","BIOMETRISCHE ID","生物特征ID","ID BIOMÉTRICA"),
  pro_account:     L("ACCOUNT STATUS","XAALADDA XISAABTA","حالة الحساب","ÉTAT DU COMPTE","HALI YA AKAUNTI","የመለያ ሁኔታ","YANAYIN ASUSU","KONTOSTATUS","账户状态","ESTADO DE CUENTA"),
  pro_credentials: L("SYSTEM ACCOUNT CREDENTIALS","XOGTADA NIDAAMKA","بيانات اعتماد الحساب","IDENTIFIANTS DU COMPTE","VITAMBULISHO VYA AKAUNTI","የሂሳብ ምስክርነት","TAKADDUN SHAIDA NA ASUSU","SYSTEMKONTO-ANMELDEDATEN","系统账户凭据","CREDENCIALES DE CUENTA"),
  pro_no_biometric:L("NO BIOMETRIC RECORD LINKED","DIIWAANKA BAAYOOLOJIGA LAMA HELIN","لا يوجد سجل بيومتري مرتبط","AUCUN DOSSIER BIOMÉTRIQUE LIÉ","HAKUNA REKODI YA BIOMETRIKI","ምንም የባዮሜትሪክ ሰነድ","BABU RIKODIN BAYOMETRIC","KEIN BIOMETRISCHER DATENSATZ VERKNÜPFT","无关联生物特征记录","SIN REGISTRO BIOMÉTRICO VINCULADO"),
  pro_dob:         L("DATE OF BIRTH","TAARIIKHDA DHALASHADA","تاريخ الميلاد","DATE DE NAISSANCE","TAREHE YA KUZALIWA","የልደት ቀን","RANAR HAIHUWA","GEBURTSDATUM","出生日期","FECHA DE NACIMIENTO"),
  pro_place_birth: L("PLACE OF BIRTH","GOOBTA DHALASHADA","مكان الميلاد","LIEU DE NAISSANCE","MAHALI PA KUZALIWA","የልደት ቦታ","WURIN HAIHUWA","GEBURTSORT","出生地","LUGAR DE NACIMIENTO"),
  pro_system_role: L("SYSTEM ROLE","DOORKA NIDAAMKA","دور النظام","RÔLE DU SYSTÈME","JUKUMU LA MFUMO","የሲስተም ሚና","MATSAYIN TSARIN","SYSTEMROLLE","系统角色","ROL DEL SISTEMA"),
  res_identity:    L("IDENTITY PROFILE","PROFILE AQOONSIGA","ملف الهوية","PROFIL D'IDENTITÉ","WASIFU WA UTAMBULISHO","የማንነት ፕሮፋይል","PROFILE NA ASALI","IDENTITÄTSPROFIL","身份档案","PERFIL DE IDENTIDAD"),
  res_biometric:   L("BIOMETRIC DATA","XOGTA BAAYOOLOJIGA","البيانات البيومترية","DONNÉES BIOMÉTRIQUES","DATA YA BIOMETRIKI","የባዮሜትሪክ ዳታ","BAYANAN BAYOMETRIC","BIOMETRISCHE DATEN","生物特征数据","DATOS BIOMÉTRICOS"),
  res_return:      L("RETURN TO PORTAL","KU NOQO BOGGA","العودة إلى البوابة","RETOUR AU PORTAIL","RUDI KWENYE LANGO","ወደ ፖርታሉ ተመለስ","KOMA HANYAR SHIGA","ZUM PORTAL ZURÜCKKEHREN","返回门户","VOLVER AL PORTAL"),
  res_first_name:  L("FIRST NAME","MAGACA HORE","الاسم الأول","PRÉNOM","JINA LA KWANZA","የፊት ስም","SUNA NA FARKO","VORNAME","名字","NOMBRE"),
  res_registered:  L("REGISTERED","LA DIIWAANGELIYEY","مسجل","ENREGISTRÉ","IMESAJILIWA","ተመዝግቧል","YA RAJISTA","REGISTRIERT","已注册","REGISTRADO"),
  res_kin:         L("NEXT OF KIN","XUKUNKA DANBE","أقرب الأقارب","PROCHE PARENT","JAMAA WA KARIBU","ቅርብ ዘመድ","DANGI MAI KUSANCI","NÄCHSTER ANGEHÖRIGER","近亲","PARIENTE MÁS CERCANO"),
  res_father:      L("FATHER","AABAHA","الأب","PÈRE","BABA","አባት","UBA","VATER","父亲","PADRE"),
  res_mother:      L("MOTHER","HOOYADDA","الأم","MÈRE","MAMA","እናት","UWAR","MUTTER","母亲","MADRE"),
  res_edit_identity:L("EDIT IDENTITY","WAXKA BEDDEL AQOONSIGA","تعديل الهوية","MODIFIER L'IDENTITÉ","HARIRI UTAMBULISHO","ማንነት አርም","GYARA ASALI","IDENTITÄT BEARBEITEN","编辑身份","EDITAR IDENTIDAD"),
  usr_cant_delete: L("THIS ACTION CANNOT BE UNDONE","FI'ILKAN LAMA BEDDELI KARO","لا يمكن التراجع عن هذا الإجراء","CETTE ACTION EST IRRÉVERSIBLE","HATUA HII HAIWEZI KUTENDULIWA","ይህ ድርጊት ሊቀለበስ አይችልም","BA A IYA MAGANIN WANNAN BA","DIESE AKTION KANN NICHT RÜCKGÄNGIG GEMACHT WERDEN","此操作无法撤销","ESTA ACCIÓN NO SE PUEDE DESHACER"),
  usr_no_found:    L("NO USERS FOUND","ISTICMAALAYAAL LAMA HELIN","لم يُعثر على مستخدمين","AUCUN UTILISATEUR TROUVÉ","HAKUNA WATUMIAJI","ምንም ተጠቃሚዎች አልተገኙም","BABU MASU AMFANI DA AKA SAMU","KEINE BENUTZER GEFUNDEN","未找到用户","NO SE ENCONTRARON USUARIOS"),

  // ── Common buttons ──
  btn_save:       L("Save","Keydi","حفظ","Sauvegarder","Hifadhi","አስቀምጥ","Adana","Speichern","保存","Guardar"),
  btn_cancel:     L("Cancel","Jooji","إلغاء","Annuler","Ghairi","ሰርዝ","Soke","Abbrechen","取消","Cancelar"),
  btn_delete:     L("Delete","Tirtir","حذف","Supprimer","Futa","ሰርዝ","Share","Löschen","删除","Eliminar"),
  btn_edit:       L("Edit","Wax ka beddel","تعديل","Modifier","Hariri","አርም","Gyara","Bearbeiten","编辑","Editar"),
  btn_print:      L("Print","Daabac","طباعة","Imprimer","Chapisha","አትም","Buga","Drucken","打印","Imprimir"),
  btn_download:   L("Download","Soo dejiso","تحميل","Télécharger","Pakua","አውርድ","Sauke","Herunterladen","下载","Descargar"),
  btn_search:     L("Search","Raadi","بحث","Rechercher","Tafuta","ፈልግ","Bincike","Suchen","搜索","Buscar"),
  btn_close:      L("Close","Xidh","إغلاق","Fermer","Funga","ዝጋ","Rufe","Schließen","关闭","Cerrar"),
  btn_confirm:    L("Confirm","Xaqiiji","تأكيد","Confirmer","Thibitisha","አረጋግጥ","Tabbatar","Bestätigen","确认","Confirmar"),
  btn_verify:     L("VERIFY","XAQIIJI","التحقق","VÉRIFIER","THIBITISHA","አረጋግጥ","TABBATAR","VERIFIZIEREN","验证","VERIFICAR"),
  btn_submit:     L("Submit","Gudbi","إرسال","Soumettre","Tuma","አስገባ","Aika","Einreichen","提交","Enviar"),
  btn_clear:      L("Clear","Nadiifi","مسح","Effacer","Futa","አጽዳ","Share","Löschen","清除","Limpiar"),
  btn_export:     L("Export","Dhofi","تصدير","Exporter","Hamisha","ወደ ውጭ ላክ","Fitarwa","Exportieren","导出","Exportar"),
  btn_view:       L("View","Arag","عرض","Voir","Tazama","ይመልከቱ","Duba","Anzeigen","查看","Ver"),

  // ── Labels ──
  lbl_name:       L("Full Name","Magaca buuxa","الاسم الكامل","Nom complet","Jina kamili","ሙሉ ስም","Cikakken suna","Vollständiger Name","全名","Nombre completo"),
  lbl_dob:        L("Date of Birth","Taariikhda dhalashada","تاريخ الميلاد","Date de naissance","Tarehe ya kuzaliwa","የልደት ቀን","Ranar haihuwa","Geburtsdatum","出生日期","Fecha de nacimiento"),
  lbl_id:         L("ID Number","Lambarka aqoonsiga","رقم الهوية","Numéro d'identité","Nambari ya kitambulisho","የመታወቂያ ቁጥር","Lambar ID","Ausweisnummer","身份证号","Número de ID"),
  lbl_nationality:L("Nationality","Jinsiyadda","الجنسية","Nationalité","Utaifa","ዜግነት","Ƙasa","Nationalität","国籍","Nacionalidad"),
  lbl_gender:     L("Gender","Jinsiga","الجنس","Genre","Jinsia","ጾታ","Jinsi","Geschlecht","性别","Género"),
  lbl_phone:      L("Phone","Telefoonka","الهاتف","Téléphone","Simu","ስልክ","Waya","Telefon","电话","Teléfono"),
  lbl_email:      L("Email","Iimayl","البريد الإلكتروني","E-mail","Barua pepe","ኢሜይል","Imel","E-Mail","电子邮件","Correo"),
  lbl_address:    L("Address","Cinwaanka","العنوان","Adresse","Anwani","አድራሻ","Adireshi","Adresse","地址","Dirección"),
  lbl_country:    L("Country","Wadanka","البلد","Pays","Nchi","ሀገር","Ƙasa","Land","国家","País"),
  lbl_yes:        L("Yes","Haa","نعم","Oui","Ndiyo","አዎ","Ee","Ja","是","Sí"),
  lbl_no:         L("No","Maya","لا","Non","Hapana","አይ","A'a","Nein","否","No"),
  no_records:     L("No records found","Diiwaanno lama helin","لم يتم العثور على سجلات","Aucun dossier trouvé","Hakuna rekodi","ምንም ሰነዶች አልተገኙም","Ba a sami rikodin ba","Keine Datensätze","未找到记录","No se encontraron registros"),
  loading:        L("Loading…","Raraya…","جارٍ التحميل…","Chargement…","Inapakia…","እየጫነ…","Ana lodi…","Laden…","加载中…","Cargando…"),
  error:          L("Error","Khalad","خطأ","Erreur","Hitilafu","ስህተት","Kuskure","Fehler","错误","Error"),
  success:        L("Success","Guul","نجاح","Succès","Mafanikio","ስኬት","Nasara","Erfolg","成功","Éxito"),
  required:       L("Required","Waajib","مطلوب","Obligatoire","Inahitajika","ያስፈልጋል","Ana bukatar","Erforderlich","必填","Requerido"),
};

/** Translate a key, fall back to English */
export function t(key: string, lang: string): string {
  return STRINGS[key]?.[lang] || STRINGS[key]?.["en"] || key;
}

/** Hook: reads lang from localStorage, re-renders on change */
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

/** Call after saving a new language — notifies all components */
export function applyLang(code: string) {
  const isRtl = LANGUAGES.find(l => l.code === code)?.rtl ?? false;
  localStorage.setItem("bims_lang", code);
  document.documentElement.lang = code;
  document.documentElement.dir  = isRtl ? "rtl" : "ltr";
  document.body.style.direction  = isRtl ? "rtl" : "ltr";
  window.dispatchEvent(new Event("bims_lang_change"));
}
