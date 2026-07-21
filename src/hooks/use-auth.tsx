import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

type Role = "reader" | "admin" | "super-admin";

type StoredUser = {
  user_id: string;
  email: string;
  fullname: string;
  role: Role;
};

type AuthCtx = {
  user: StoredUser | null;
  role: Role | null;
  isAdmin: boolean;       // true for 'admin' OR 'super-admin'
  isSuperAdmin: boolean;  // true only for 'super-admin'
  loading: boolean;
  signOut: () => void;
  refresh: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  signOut: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setUser(api.getUser());
  };

  useEffect(() => {
    refresh();
    setLoading(false);

    // keep in sync if another tab signs in/out
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    api.clearSession();
    setUser(null);
  };

  const role = user?.role ?? null;
  const isSuperAdmin = role === "super-admin";
  const isAdmin = role === "admin" || isSuperAdmin;

  return (
    <Ctx.Provider value={{ user, role, isAdmin, isSuperAdmin, loading, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);