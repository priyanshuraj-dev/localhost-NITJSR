"use client";

import { useState } from "react";

const LANGUAGES = ["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी"];

export default function DashboardTopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const [selectedLang, setSelectedLang] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "8px",
            color: "#6B5E56",
            fontSize: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
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

      {/* Right: search + lang + notif + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#F5F0EC",
            border: "1px solid #E8E0D4",
            borderRadius: "100px",
            padding: "7px 16px",
            width: "220px",
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
              background: "none",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "#2C2420",
              fontFamily: "'DM Sans', sans-serif",
              width: "100%",
            }}
          />
        </div>

        {/* Language picker */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "100px",
              border: "1.5px solid #E8E0D4",
              background: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              color: "#2C2420",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ fontSize: "14px" }}>🌐</span>
            {selectedLang}
            <span style={{ fontSize: "10px", color: "#A89888" }}>▾</span>
          </button>

          {langOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "white",
                border: "1px solid #F0EBE5",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                padding: "8px",
                minWidth: "160px",
                zIndex: 100,
                animation: "scaleIn 0.15s ease",
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: selectedLang === lang ? "#FAF7F4" : "transparent",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: selectedLang === lang ? 600 : 400,
                    color: selectedLang === lang ? "#2C2420" : "#6B5E56",
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F5F0EC")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = selectedLang === lang ? "#FAF7F4" : "transparent")}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1.5px solid #E8E0D4",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              position: "relative",
              transition: "border-color 0.2s",
            }}
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#E8B4A0",
                border: "1.5px solid white",
              }}
            />
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "white",
                border: "1px solid #F0EBE5",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                padding: "16px",
                width: "280px",
                zIndex: 100,
                animation: "scaleIn 0.15s ease",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                Notifications
              </p>
              {[
                { icon: "✓", text: "RTI Application guide ready", time: "2m ago", color: "#A8C5A0" },
                { icon: "⬡", text: "New: Passport procedure updated", time: "1h ago", color: "#A0B8D8" },
              ].map((n, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: i === 0 ? "1px solid #F5F0EC" : "none" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: n.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                    {n.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#2C2420", marginBottom: "2px" }}>{n.text}</p>
                    <p style={{ fontSize: "11px", color: "#A89888" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#E8B4A0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#2C2420",
            cursor: "pointer",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          title="Profile"
        >
          PR
        </div>
      </div>
    </header>
  );
}
