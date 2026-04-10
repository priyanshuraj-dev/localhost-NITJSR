"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { icon: "⬡", label: "Upload Document", href: "/dashboard", id: "upload" },
  { icon: "◎", label: "My Documents", href: "/dashboard/documents", id: "documents" },
  { icon: "◈", label: "History", href: "/dashboard/history", id: "history" },
  { icon: "◇", label: "Procedures", href: "/dashboard/procedures", id: "procedures" },
  { icon: "⬢", label: "Languages", href: "/dashboard/languages", id: "languages" },
];

const BOTTOM_ITEMS = [
  { icon: "◉", label: "Settings", href: "/dashboard/settings", id: "settings" },
  { icon: "◎", label: "Help & Support", href: "/dashboard/help", id: "help" },
];

// Mock user — replace with real auth data later
const MOCK_USER = {
  name: "Priyanshu Raj",
  email: "priyanshu@nyayasetu.in",
  initials: "PR",
  plan: "Free Plan",
  uploads: 12,
  maxUploads: 20,
};

export default function DashboardSidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const [active, setActive] = useState("upload");

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: open ? "260px" : "72px",
        background: "#FFFFFF",
        borderRight: "1px solid #F0EBE5",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: open ? "20px 20px 16px" : "20px 16px 16px",
          borderBottom: "1px solid #F0EBE5",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minHeight: "64px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#2C2420",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#FAF7F4",
            flexShrink: 0,
          }}
        >
          ◉
        </div>
        {open && (
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "17px",
              color: "#2C2420",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              animation: "fadeIn 0.2s ease",
            }}
          >
            NyayaSetu
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#C4B8B0",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0 6px",
            marginBottom: "8px",
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          Main
        </p>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
            title={!open ? item.label : undefined}
            style={{ justifyContent: open ? "flex-start" : "center" }}
          >
            <span
              className="nav-icon"
              style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}
            >
              {item.icon}
            </span>
            {open && (
              <span style={{ whiteSpace: "nowrap", animation: "fadeIn 0.15s ease" }}>
                {item.label}
              </span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: "1px solid #F0EBE5", paddingTop: "12px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {BOTTOM_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => setActive(item.id)}
              title={!open ? item.label : undefined}
              style={{ justifyContent: open ? "flex-start" : "center" }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {open && (
                <span style={{ whiteSpace: "nowrap", animation: "fadeIn 0.15s ease" }}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User profile section */}
      <div
        style={{
          padding: open ? "16px" : "12px",
          borderTop: "1px solid #F0EBE5",
          background: "#FAF7F4",
        }}
      >
        {open ? (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {/* Usage bar */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "#A89888" }}>Uploads this month</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#2C2420" }}>
                  {MOCK_USER.uploads}/{MOCK_USER.maxUploads}
                </span>
              </div>
              <div style={{ height: "4px", background: "#E8E0D4", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(MOCK_USER.uploads / MOCK_USER.maxUploads) * 100}%`,
                    background: "#E8B4A0",
                    borderRadius: "2px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            {/* User info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                  flexShrink: 0,
                }}
              >
                {MOCK_USER.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {MOCK_USER.name}
                </p>
                <p style={{ fontSize: "11px", color: "#A89888" }}>{MOCK_USER.plan}</p>
              </div>
              <button
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#A89888",
                  fontSize: "16px",
                  padding: "4px",
                  borderRadius: "6px",
                  transition: "color 0.2s",
                  flexShrink: 0,
                }}
                title="Sign out"
              >
                ⇥
              </button>
            </div>
          </div>
        ) : (
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
              margin: "0 auto",
              cursor: "pointer",
            }}
            title={MOCK_USER.name}
          >
            {MOCK_USER.initials}
          </div>
        )}
      </div>
    </aside>
  );
}
