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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/getCurrent");
        setUserData(response.data.data);
      } catch {
        setUserData(null);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, authLoading }}>
      {children}
    </UserContext.Provider>
  );
}

