"use client";

import { createContext, useContext } from "react";

export type Tokens = {
  bg: string; bgCard: string; bgSubtle: string;
  border: string; borderMid: string;
  text: string; textSec: string; textMuted: string;
  accent: string; sidebar: string;
};

export const LIGHT: Tokens = {
  bg: "#FAF7F4", bgCard: "#FFFFFF", bgSubtle: "#F5F0EC",
  border: "#F0EBE5", borderMid: "#E8E0D4",
  text: "#2C2420", textSec: "#6B5E56", textMuted: "#A89888",
  accent: "#E8B4A0", sidebar: "#FFFFFF",
};

export const DARK: Tokens = {
  bg: "#1A1410", bgCard: "#231D18", bgSubtle: "#2C2420",
  border: "#3A2E28", borderMid: "#4A3C34",
  text: "#F0EBE5", textSec: "#C4B0A4", textMuted: "#7A6A60",
  accent: "#E8B4A0", sidebar: "#1E1814",
};

export const TokenContext = createContext<{ t: Tokens; dark: boolean }>({ t: LIGHT, dark: false });
export const useTokens = () => useContext(TokenContext);
