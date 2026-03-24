/*
  BIMS Auth — extracted from Login.tsx to break circular imports
  All pages import from here instead of from @/pages/Login
*/

export type UserRole = "owner" | "admin" | "operator" | "analyst";

export interface BIMSUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email?: string;
  createdAt: string;
  createdBy: string;
  active: boolean;
}

const USERS_KEY   = "bims_users";
const SESSION_KEY = "bims_session";

export const ROLE_COLORS: Record<UserRole, string> = {
  owner:    "hsl(270,80%,72%)",
  admin:    "hsl(354,88%,68%)",
  operator: "hsl(193,100%,62%)",
  analyst:  "hsl(158,80%,55%)",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "OWNER", admin: "ADMIN", operator: "OPERATOR", analyst: "ANALYST",
};

const seedAdmin = (): BIMSUser[] => [{
  id: "usr_admin", username: "oni", password: "1234", role: "admin",
  fullName: "System Administrator", email: "",
  createdAt: new Date().toISOString(), createdBy: "system", active: true,
}];

export const getUsers = (): BIMSUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) { const seed = seedAdmin(); localStorage.setItem(USERS_KEY, JSON.stringify(seed)); return seed; }
    return JSON.parse(raw);
  } catch { return seedAdmin(); }
};

export const saveUsers   = (users: BIMSUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
export const isLoggedIn  = () => !!sessionStorage.getItem(SESSION_KEY);
export const getCurrentUser = (): BIMSUser | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
};
export const isAdmin  = () => { const r = getCurrentUser()?.role; return r === "admin" || r === "owner"; };
export const isOwner  = () => getCurrentUser()?.role === "owner";
export const doLogin  = (user: BIMSUser) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
export const doLogout = () => sessionStorage.removeItem(SESSION_KEY);
