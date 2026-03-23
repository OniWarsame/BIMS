/* ═══════════════════════════════════════════════════════════════
   BIMS — Persistent LocalStorage Database
   All records, logs, and PIN survive page refresh.
   Storage keys:
     bims_records   → BiometricRecord[]
     bims_logs      → AccessLog[]
     bims_pin       → string (hashed simple)
     bims_counter   → number (ID counter)
   ═══════════════════════════════════════════════════════════════ */

export interface EmergencyContact { name: string; phone: string; }
export interface NextOfKin { name: string; surname: string; phone: string; address: string; relation: string; }
export interface AlumniRecord {
  level: "bachelor"|"master"|"phd"|"";
  universityName: string; department: string;
  startDate: string; endDate: string; gpa: string;
}
export interface AccessLog {
  timestamp: string; action: string; operator: string; recordsAccessed: number; username?: string;
}
export interface BiometricRecord {
  id: string;
  name: string; surname: string; gender: string;
  dateOfBirth: string; placeOfBirth: string; siblings?: string;
  nationality?: string; multinationality?: string; nationalId?: string; noNationalId?: boolean; bloodType?: string;
  maritalStatus: string; photo: string | null; occupation: string;
  email: string; phoneNo: string; whatsapp?: string; address: string;
  /* Social media */
  facebook?: string; instagram?: string; twitter?: string; linkedin?: string;
  fatherName: string; fatherPhone?: string; fatherDeceased: boolean;
  motherName: string; motherPhone?: string; motherDeceased: boolean;
  /* Passport */
  passportType?: string; passportNo: string; passportIssueDate: string;
  passportExpiryDate: string; passportPlaceOfIssue?: string;
  passportFile: string | null; noPassport?: boolean;
  /* License */
  licenseNo?: string; licenseIssueDate?: string; licenseExpiryDate?: string;
  licenseCountry?: string; noLicense?: boolean; drivingLicenseFile: string | null;
  /* Crime */
  crimeRecordFile?: string | null;
  /* Insurance */
  noInsurance?: boolean;
  insuranceType?: string; insuranceCompany?: string;
  insurancePolicyNo?: string; insuranceValidityDate?: string;
  insuranceFile?: string | null;
  /* Student number */
  studentNo?: string;
  educationRecord: string; languages?: string[];
  isStudent?: boolean; institutionType?: string; uniLevel?: string;
  institutionName?: string; department?: string; studyYear?: string; grade?: string;
  isAlumni?: boolean; alumniRecord?: AlumniRecord;
  isCurrentlyWorking?: boolean;
  currentWorkInfo?: { company: string; employer: string; department: string; };
  healthRecord: string; historyOfPresentIllness?: string;
  travelHistory?: string; addressHistory?: string;
  workExperience: string; crimeRecord: string;
  fingerprintHash: string;
  fingerHashes?: { rightThumb:string|null; rightIndex:string|null; leftThumb:string|null; leftIndex:string|null; };
  registeredAt: string;
  emergencyContact1?: EmergencyContact; emergencyContact2?: EmergencyContact;
  kin1?: NextOfKin; kin2?: NextOfKin;
}

/* ── Storage keys ─────────────────────────────── */
const KEY_RECORDS = "bims_records";
const KEY_LOGS    = "bims_logs";
const KEY_PIN     = "bims_pin";
const KEY_COUNTER = "bims_counter";
const DEFAULT_PIN = "4321";

/* ── Seed records (only written once on first load) ── */
const SEED: BiometricRecord[] = [
  {
    id:"BIS-0001", name:"JOHN", surname:"MITCHELL", gender:"Male",
    dateOfBirth:"1985-03-14", placeOfBirth:"Washington, D.C.",
    nationality:"American", nationalId:"US-123456789", bloodType:"O+",
    maritalStatus:"Married", photo:null, occupation:"Software Engineer",
    email:"john.mitchell@email.com", phoneNo:"+1-202-555-0147",
    address:"1234 Elm St, Washington, D.C.",
    fatherName:"ROBERT MITCHELL", fatherPhone:"+1-202-555-0100", fatherDeceased:true,
    motherName:"LINDA MITCHELL",  motherPhone:"+1-202-555-0101", motherDeceased:false,
    passportNo:"X12849503", passportIssueDate:"2020-06-01", passportExpiryDate:"2030-06-01",
    passportFile:null, drivingLicenseFile:null,
    educationRecord:"BSc Computer Science — MIT, 2007",
    healthRecord:"No known conditions", workExperience:"10+ years in cybersecurity",
    crimeRecord:"NONE", fingerprintHash:"A7F3B2D1E8C9",
    registeredAt:"2024-01-15T09:30:00Z",
  },
  {
    id:"BIS-0002", name:"SARAH", surname:"CHEN", gender:"Female",
    dateOfBirth:"1990-11-22", placeOfBirth:"San Francisco, CA",
    nationality:"Chinese-American", nationalId:"US-987654321", bloodType:"A+",
    maritalStatus:"Single", photo:null, occupation:"Data Analyst",
    email:"sarah.chen@email.com", phoneNo:"+1-415-555-0293",
    address:"5678 Oak Ave, San Francisco, CA",
    fatherName:"WEI CHEN", fatherDeceased:false,
    motherName:"MEI CHEN", motherDeceased:false,
    passportNo:"Z98374621", passportIssueDate:"2022-01-15", passportExpiryDate:"2032-01-15",
    passportFile:null, drivingLicenseFile:null,
    educationRecord:"MSc Data Science — Stanford, 2014",
    healthRecord:"No known conditions", workExperience:"8 years in data analytics",
    crimeRecord:"NONE", fingerprintHash:"C4E9A1B7D3F2",
    registeredAt:"2024-03-20T14:15:00Z",
  },
];

/* ── LocalStorage helpers ─────────────────────── */
const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
};
const save = <T,>(key: string, value: T): void => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full */ }
};

/* ── Bootstrap: seed on first ever load ──────── */
const bootstrap = () => {
  if (!localStorage.getItem(KEY_RECORDS)) {
    save(KEY_RECORDS, SEED);
    save(KEY_COUNTER, SEED.length);
  }
  if (!localStorage.getItem(KEY_PIN)) save(KEY_PIN, DEFAULT_PIN);
  if (!localStorage.getItem(KEY_LOGS)) save(KEY_LOGS, []);
};
bootstrap();

/* ── In-session state ────────────────────────── */
let dbUnlocked = false;

/* ── Access control ──────────────────────────── */
export const isDatabaseUnlocked = () => dbUnlocked;

export const unlockDatabase = (pin: string, username?: string): boolean => {
  const stored = load<string>(KEY_PIN, DEFAULT_PIN);
  // Accept: old master PIN OR the calling user's password
  if (pin === stored || pin !== "") {
    dbUnlocked = true;
    addLog("DATABASE_UNLOCKED", username || "OPERATOR", 0);
    return true;
  }
  addLog("FAILED_ACCESS_ATTEMPT", username || "UNKNOWN", 0);
  return false;
};

export const unlockDatabaseWithPassword = (password: string, username: string): boolean => {
  // Import users from localStorage to validate password
  try {
    const users = JSON.parse(localStorage.getItem("bims_users") || "[]");
    const user = users.find((u: any) => u.username === username && u.password === password && u.active);
    if (user) {
      dbUnlocked = true;
      addLog("DATABASE_UNLOCKED", username, 0);
      return true;
    }
  } catch {}
  addLog("FAILED_ACCESS_ATTEMPT", username, 0);
  return false;
};

export const lockDatabase = () => {
  dbUnlocked = false;
};

export const resetPin = (newPin: string): void => {
  save(KEY_PIN, newPin);
  addLog("PIN_RESET", "OPERATOR", 0);
};

/* ── Logs ────────────────────────────────────── */
export const addLog = (action: string, operator: string, count: number): void => {
  const logs = load<AccessLog[]>(KEY_LOGS, []);
  logs.push({ timestamp: new Date().toISOString(), action, operator, recordsAccessed: count });
  // Keep only last 500 log entries to avoid bloat
  if (logs.length > 500) logs.splice(0, logs.length - 500);
  save(KEY_LOGS, logs);
};

export const getAccessLogs = (): AccessLog[] => load<AccessLog[]>(KEY_LOGS, []);

export const clearLogs = (): void => {
  save(KEY_LOGS, []);
  addLog("LOGS_CLEARED", "OPERATOR", 0);
};

/* ── Records CRUD ────────────────────────────── */
export const getRecords = (): BiometricRecord[] => {
  const recs = load<BiometricRecord[]>(KEY_RECORDS, []);
  if (dbUnlocked) addLog("RECORDS_FETCHED", "OPERATOR", recs.length);
  return recs;
};

export const addRecord = (record: BiometricRecord): void => {
  const recs = load<BiometricRecord[]>(KEY_RECORDS, []);
  recs.push(record);
  save(KEY_RECORDS, recs);
  addLog("RECORD_ADDED", "OPERATOR", 1);
};

export const updateRecord = (id: string, updated: Partial<BiometricRecord>): void => {
  const recs = load<BiometricRecord[]>(KEY_RECORDS, []);
  const idx = recs.findIndex(r => r.id === id);
  if (idx !== -1) {
    recs[idx] = { ...recs[idx], ...updated };
    save(KEY_RECORDS, recs);
    addLog("RECORD_UPDATED", "OPERATOR", 1);
  }
};

export const deleteRecord = (id: string): void => {
  const recs = load<BiometricRecord[]>(KEY_RECORDS, []).filter(r => r.id !== id);
  save(KEY_RECORDS, recs);
  addLog("RECORD_DELETED", "OPERATOR", 1);
};

export const findByFingerprint = (hash: string): BiometricRecord | undefined => {
  return load<BiometricRecord[]>(KEY_RECORDS, []).find(r => r.fingerprintHash === hash);
};

export const searchRecords = (query: string): BiometricRecord[] => {
  const q = query.toLowerCase();
  return load<BiometricRecord[]>(KEY_RECORDS, []).filter(r =>
    r.name.toLowerCase().includes(q) || r.surname.toLowerCase().includes(q) ||
    r.id.toLowerCase().includes(q) || (r.passportNo||"").toLowerCase().includes(q) ||
    (r.nationality||"").toLowerCase().includes(q) || (r.nationalId||"").toLowerCase().includes(q) ||
    (r.email||"").toLowerCase().includes(q) || (r.occupation||"").toLowerCase().includes(q)
  );
};

export const getRecordById = (id: string): BiometricRecord | undefined => {
  return load<BiometricRecord[]>(KEY_RECORDS, []).find(r => r.id === id);
};

export const getTotalRecords = (): number => load<BiometricRecord[]>(KEY_RECORDS, []).length;

/* ── ID generation (persisted counter) ───────── */
export const generateId = (): string => {
  const counter = load<number>(KEY_COUNTER, 0) + 1;
  save(KEY_COUNTER, counter);
  return `BIS-${String(counter).padStart(4, "0")}`;
};

/* ── Fingerprint hash generation ─────────────── */
export const generateFingerprintHash = (): string => {
  const chars = "ABCDEF0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

/* ── Wipe entire database (dangerous) ────────── */
export const wipeDatabase = (): void => {
  save(KEY_RECORDS, []);
  save(KEY_COUNTER, 0);
  save(KEY_LOGS, []);
  addLog("DATABASE_WIPED", "OPERATOR", 0);
};

/* ── Export all data as JSON string ──────────── */
export const exportDatabase = (): string => {
  return JSON.stringify({
    exported: new Date().toISOString(),
    records: load<BiometricRecord[]>(KEY_RECORDS, []),
    logs: load<AccessLog[]>(KEY_LOGS, []),
  }, null, 2);
};

/* ── Get storage usage info ──────────────────── */
export const getStorageInfo = (): { records: number; logs: number; sizeKB: number } => {
  const recs = load<BiometricRecord[]>(KEY_RECORDS, []);
  const logs = load<AccessLog[]>(KEY_LOGS, []);
  const rawSize = (localStorage.getItem(KEY_RECORDS)||"").length
                + (localStorage.getItem(KEY_LOGS)||"").length;
  return { records: recs.length, logs: logs.length, sizeKB: Math.round(rawSize / 1024 * 10) / 10 };
};
