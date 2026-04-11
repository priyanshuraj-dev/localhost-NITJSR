"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import axios from "axios";

const NAV_ITEMS = [
  { icon: "⬡", label: "Upload Document", href: "/dashboard",          id: "upload" },
  { icon: "◎", label: "My Documents",    href: "/dashboard/documents", id: "documents" },
  { icon: "◈", label: "History",         href: "/dashboard/history",   id: "history" },
  { icon: "◇", label: "Procedures",      href: "/how-it-works",        id: "procedures" },
];

const BOTTOM_ITEMS = [
  { icon: "◉", label: "Settings",      href: "/dashboard/settings", id: "settings" },
  { icon: "◎", label: "Help & Support", href: "/about",             id: "help" },
];

type Tokens = Record<string, string>;

const DEFAULT_TOKENS: Tokens = {
  bg: "#FAF7F4", bgCard: "#FFFFFF", bgSubtle: "#F5F0EC",
  border: "#F0EBE5", borderMid: "#E8E0D4",
  text: "#2C2420", textSec: "#6B5E56", textMuted: "#A89888",
  accent: "#E8B4A0", sidebar: "#FFFFFF",
};

export default function DashboardSidebar({
  open,
  onToggle,
  dark = false,
  t,
}: {
  open: boolean;
  onToggle: () => void;
  dark?: boolean;
  t?: Tokens;
}) {
  const tk = t ?? DEFAULT_TOKENS;
  const [active, setActive] = useState("upload");
  const [mounted, setMounted] = useState(false);
  const { userData, setUserData } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const initials = mounted && userData?.email ? userData.email.slice(0, 2).toUpperCase() : "??";

  const handleLogout = async () => {
    try { await axios.post("/api/auth/logout"); } catch {}
    setUserData(null);
    router.push("/login");
  };

  const navigate = (item: (typeof NAV_ITEMS)[0]) => {
    setActive(item.id);
    router.push(item.href);
  };

  return (
    <aside
      style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: open ? "260px" : "72px",
        background: tk.sidebar,
        borderRight: `1px solid ${tk.border}`,
        display: "flex", flexDirection: "column",
        zIndex: 50, transition: "width 0.3s ease, background 0.25s ease", overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: open ? "20px 20px 16px" : "20px 16px 16px",
          borderBottom: `1px solid ${tk.border}`,
          display: "flex", alignItems: "center", gap: "10px", minHeight: "64px",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: dark ? tk.accent : "#2C2420", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: dark ? "#2C2420" : "#FAF7F4", flexShrink: 0 }}>
          ◉
        </div>
        {open && (
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: tk.text, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            NyayaSetu
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: tk.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 6px", marginBottom: "8px", opacity: open ? 1 : 0, transition: "opacity 0.2s" }}>
          Main
        </p>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => navigate(item)}
            title={!open ? item.label : undefined}
            style={{ justifyContent: open ? "flex-start" : "center" }}
          >
            <span className="nav-icon" style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
            {open && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: `1px solid ${tk.border}`, paddingTop: "12px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {BOTTOM_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => navigate(item)}
              title={!open ? item.label : undefined}
              style={{ justifyContent: open ? "flex-start" : "center" }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {open && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* User profile */}
      <div style={{ padding: open ? "16px" : "12px", borderTop: `1px solid ${tk.border}`, background: tk.bgSubtle, transition: "background 0.25s ease" }}>
        {open ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E8B4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#2C2420", flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: tk.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {mounted ? (userData?.email ?? "Guest") : "Guest"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: tk.textMuted, fontSize: "16px", padding: "4px", borderRadius: "6px", transition: "color 0.2s", flexShrink: 0 }}
              title="Sign out"
            >
              ⇥
            </button>
          </div>
        ) : (
          <div
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E8B4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#2C2420", margin: "0 auto", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            title={userData?.email ?? "Profile"}
            onClick={handleLogout}
          >
            {initials}
          </div>
        )}
      </div>
    </aside>
  );
}
