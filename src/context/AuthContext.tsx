import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { users } from "../data/users";

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** Mengembalikan true jika login berhasil, false jika gagal. */
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Key localStorage untuk persist session demo. Hanya menyimpan userId
// (identifier), TIDAK PERNAH password atau data sensitif lain.
const SESSION_STORAGE_KEY = "mediroute_auth_user";

interface PersistedSession {
  userId: string;
}

function readPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedSession>;
    if (typeof parsed.userId !== "string") return null;

    return users.find((u) => u.id === parsed.userId) ?? null;
  } catch {
    // localStorage tidak tersedia atau data korup -> anggap belum login.
    return null;
  }
}

function persistUser(user: User): void {
  try {
    const session: PersistedSession = { userId: user.id };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Gagal menyimpan (mis. private browsing) -> abaikan, sesi tetap
    // berjalan in-memory untuk request saat ini.
  }
}

function clearPersistedUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Abaikan jika localStorage tidak tersedia.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: hanya dibaca sekali saat AuthProvider pertama kali
  // mount (termasuk saat browser di-refresh), bukan di setiap render.
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    readPersistedUser()
  );

  function login(email: string, password: string): boolean {
    const matchedUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!matchedUser) return false;
    setCurrentUser(matchedUser);
    persistUser(matchedUser);
    return true;
  }

  function logout(): void {
    setCurrentUser(null);
    clearPersistedUser();
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
