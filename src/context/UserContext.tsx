"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface UserData {
  email: string;
}


interface UserContextValue {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  authLoading: boolean;
}

export const UserContext = createContext<UserContextValue>({
  userData: null,
  setUserData: () => {},
  authLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("userData");
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  const setUserDataWithCache = (data: UserData | null) => {
    setUserData(data);
    if (typeof window !== "undefined") {
      if (data) {
        sessionStorage.setItem("userData", JSON.stringify(data));
      } else {
        sessionStorage.removeItem("userData");
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/getCurrent");
        setUserDataWithCache(response.data.data);
      } catch {
        setUserDataWithCache(null);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData: setUserDataWithCache, authLoading }}>
      {children}
    </UserContext.Provider>
  );
}

