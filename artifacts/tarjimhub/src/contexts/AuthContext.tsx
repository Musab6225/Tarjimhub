import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  name: string;
  nameAr?: string | null;
  email: string;
  role: string;
  primaryLanguagePair: string;
  dialectSpecialty?: string | null;
  bio?: string | null;
  bioAr?: string | null;
  certifications?: string | null;
  sessionsCompleted: number;
  rating?: number | null;
  isOnline: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem("tarjimhub_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("tarjimhub_token")
  );

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("tarjimhub_token", newToken);
    localStorage.setItem("tarjimhub_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("tarjimhub_token");
    localStorage.removeItem("tarjimhub_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (u: User) => {
    localStorage.setItem("tarjimhub_user", JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
