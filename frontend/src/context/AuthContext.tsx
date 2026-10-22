"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  roleTitle: string;
  branchId: string;
  branchSlug: string;
  branchName: string;
}

export const ADMIN_USER: UserSession = {
  userId: "e-admin",
  name: "Trần Minh Tuấn",
  email: "admin@company.com",
  role: "admin",
  roleTitle: "Ban Giám Đốc",
  branchId: "b-hq",
  branchSlug: "hn-1",
  branchName: "Toàn bộ hệ thống (HQ)",
};

export const MANAGER_USER: UserSession = {
  userId: "e-mgr-hn1",
  name: "Vũ Thành Công",
  email: "manager@company.com",
  role: "manager",
  roleTitle: "Quản lý Chi nhánh",
  branchId: "b-hn1",
  branchSlug: "hn-1",
  branchName: "Chi nhánh HN-1 (Phụ trách)",
};

interface AuthContextType {
  user: UserSession;
  role: "admin" | "manager" | "staff";
  branchSlug: string;
  login: (email: string, role?: "admin" | "manager") => void;
  logout: () => void;
  switchRole: (role: "admin" | "manager") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: ADMIN_USER,
  role: "admin",
  branchSlug: "hn-1",
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

const STORAGE_KEY = "hrm-session";
const COOKIE_NAME = "hrm-session";

function setSessionCookie(hasSession: boolean) {
  if (typeof document === "undefined") return;
  if (hasSession) {
    document.cookie = `${COOKIE_NAME}=true; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(ADMIN_USER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserSession;
        setUser(parsed);
        setSessionCookie(true);
      } else {
        // Mặc định lưu ADMIN_USER cho môi trường thử nghiệm
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ADMIN_USER));
        setSessionCookie(true);
      }
    } catch {
      setUser(ADMIN_USER);
      setSessionCookie(true);
    }
  }, []);

  const login = (email: string, roleOverride?: "admin" | "manager") => {
    const em = email.toLowerCase().trim();
    let selectedUser: UserSession;
    if (roleOverride === "manager" || em.includes("manager") || em.includes("quanly")) {
      selectedUser = MANAGER_USER;
    } else {
      selectedUser = ADMIN_USER;
    }
    setUser(selectedUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
    } catch {
      /* ignore */
    }
    setSessionCookie(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSessionCookie(false);
  };

  const switchRole = (newRole: "admin" | "manager") => {
    const newUser = newRole === "manager" ? MANAGER_USER : ADMIN_USER;
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      /* ignore */
    }
    setSessionCookie(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        branchSlug: user.branchSlug,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(AuthContext);
}
