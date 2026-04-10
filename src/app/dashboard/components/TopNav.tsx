"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import axios from "axios";

export default function DashboardTopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { userData, setUserData } = useContext(UserContext);
  const router = useRouter();

  const initials = userData?.email
    ? userData.email.slice(0, 2).toUpperCase()
    : "??";

  const handleLogout = async () => {
    try { await axios.post("/api/auth/logout"); } catch {}
    setUserData(null);
    router.push("/login");
  };

  return (
    <header
      style={{
        height: "64px",
        background: "rgba(250,247,244,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #F0EBE5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "6px", borderRadius: "8px", color: "#6B5E56",
            display: "flex", flexDirection: "column", gap: "4px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F0EBE5")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
        >
          <span style={{ display: "block", width: "18px", height: "2px", background: "#6B5E56", borderRadius: "1px" }} />
          <span style={{ display: "block", width: "14px", height: "2px", background: "#6B5E56", borderRadius: "1px" }} />
          <span style={{ display: "block", width: "18px", height: "2px", background: "#6B5E56", borderRadius: "1px" }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#A89888" }}>Dashboard</span>
          <span style={{ fontSize: "13px", color: "#D4C4B0" }}>/</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420" }}>Upload Document</span>
        </div>
      </div>

      {/* Right: search + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Search */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#F5F0EC", border: "1px solid #E8E0D4",
            borderRadius: "100px", padding: "7px 16px", width: "220px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E8B4A0";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(232,180,160,0.15)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E8E0D4";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "14px", color: "#A89888" }}>⌕</span>
          <input
            placeholder="Search procedures…"
            style={{
              background: "none", border: "none", outline: "none",
              fontSize: "13px", color: "#2C2420",
              fontFamily: "'DM Sans', sans-serif", width: "100%",
            }}
          />
        </div>

        {/* Avatar + logout */}
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#E8B4A0", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "13px", fontWeight: 700,
            color: "#2C2420", cursor: "pointer",
            border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          title={userData?.email ?? "Profile"}
          onClick={handleLogout}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
