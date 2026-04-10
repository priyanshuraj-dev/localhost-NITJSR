"use client";

import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease both", maxWidth: "640px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <span className="tag-chip" style={{ background: "#F0EBE5", color: "#A89888", marginBottom: "12px" }}>
          ◉ Settings
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,3vw,32px)", color: "#2C2420", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "8px" }}>
          Preferences
        </h1>
        <p style={{ fontSize: "15px", color: "#6B5E56", lineHeight: 1.6 }}>
          Customise your NyayaSetu experience.
        </p>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: "28px", marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
          Appearance
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* Light */}
          <button
            onClick={() => setTheme("light")}
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: theme === "light" ? "2px solid #2C2420" : "1.5px solid #E8E0D4",
              background: theme === "light" ? "#FAF7F4" : "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              boxShadow: theme === "light" ? "0 4px 16px rgba(44,36,32,0.1)" : "none",
            }}
          >
            {/* Preview */}
            <div style={{ width: "100%", height: "72px", borderRadius: "10px", background: "#FAF7F4", border: "1px solid #E8E0D4", marginBottom: "14px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", height: "10px", background: "#E8E0D4", borderRadius: "5px" }} />
              <div style={{ position: "absolute", top: "28px", left: "10px", width: "60%", height: "8px", background: "#F0EBE5", borderRadius: "4px" }} />
              <div style={{ position: "absolute", top: "44px", left: "10px", width: "40%", height: "8px", background: "#F0EBE5", borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C2420", marginBottom: "2px" }}>Light</p>
                <p style={{ fontSize: "12px", color: "#A89888" }}>Warm cream background</p>
              </div>
              {theme === "light" && (
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#2C2420", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white" }}>✓</div>
              )}
            </div>
          </button>

          {/* Dark */}
          <button
            onClick={() => setTheme("dark")}
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: theme === "dark" ? "2px solid #E8B4A0" : "1.5px solid #E8E0D4",
              background: theme === "dark" ? "#1E1814" : "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              boxShadow: theme === "dark" ? "0 4px 16px rgba(232,180,160,0.15)" : "none",
            }}
          >
            {/* Preview */}
            <div style={{ width: "100%", height: "72px", borderRadius: "10px", background: "#1E1814", border: "1px solid #3A2E28", marginBottom: "14px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", height: "10px", background: "#3A2E28", borderRadius: "5px" }} />
              <div style={{ position: "absolute", top: "28px", left: "10px", width: "60%", height: "8px", background: "#2C2420", borderRadius: "4px" }} />
              <div style={{ position: "absolute", top: "44px", left: "10px", width: "40%", height: "8px", background: "#2C2420", borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: theme === "dark" ? "#FAF7F4" : "#2C2420", marginBottom: "2px" }}>Dark</p>
                <p style={{ fontSize: "12px", color: "#A89888" }}>Easy on the eyes</p>
              </div>
              {theme === "dark" && (
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#E8B4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#2C2420" }}>✓</div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card" style={{ padding: "28px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
          Account
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Email notifications", desc: "Receive updates about your document analyses", enabled: true },
            { label: "Save analysis history", desc: "Store your past document analyses for reference", enabled: true },
          ].map((pref, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i === 0 ? "1px solid #F0EBE5" : "none" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#2C2420", marginBottom: "2px" }}>{pref.label}</p>
                <p style={{ fontSize: "12px", color: "#A89888" }}>{pref.desc}</p>
              </div>
              <div
                style={{
                  width: "44px", height: "24px", borderRadius: "12px",
                  background: pref.enabled ? "#2C2420" : "#E8E0D4",
                  position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{ position: "absolute", top: "3px", left: pref.enabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
