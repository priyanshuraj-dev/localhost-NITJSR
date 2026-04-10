"use client";

import { useState, useContext } from "react";
import DashboardSidebar from "./components/Sidebar";
import Navbar from "@/components/Navbar";
import { ThemeContext } from "@/context/ThemeContext";
import { TokenContext, LIGHT, DARK } from "@/context/TokenContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);
  const dark = theme === "dark";
  const t = dark ? DARK : LIGHT;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${t.bg}; color: ${t.text}; overflow-x: hidden; }
    ::selection { background: #E8B4A0; color: #2C2420; }
    .dash-layout { display: flex; min-height: 100vh; background: ${t.bg}; }
    .dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: margin-left 0.3s ease; background: ${t.bg}; }
    .dash-content { flex: 1; padding: 32px 40px; overflow-y: auto; background: ${t.bg}; }
    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .pill-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.02em; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; border: none; outline: none; }
    .pill-btn:hover { transform: translateY(-1px); }
    .pill-btn-primary { background: ${dark ? t.accent : "#2C2420"}; color: ${dark ? "#2C2420" : "#FAF7F4"}; box-shadow: 0 4px 16px rgba(44,36,32,0.2); }
    .pill-btn-primary:hover { box-shadow: 0 8px 28px rgba(44,36,32,0.3); }
    .pill-btn-ghost { background: transparent; color: ${t.text}; border: 1.5px solid ${t.borderMid}; }
    .pill-btn-ghost:hover { background: ${t.bgSubtle}; border-color: ${dark ? "#6A5A50" : "#B8A898"}; }
    .pill-btn-accent { background: #E8B4A0; color: #2C2420; box-shadow: 0 4px 16px rgba(232,180,160,0.3); }
    .pill-btn-accent:hover { box-shadow: 0 8px 28px rgba(232,180,160,0.4); }
    .tag-chip { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .highlight-serif { font-family: 'Playfair Display', serif; font-style: italic; }
    .nav-link { color: ${t.textSec}; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.02em; transition: color 0.2s; }
    .nav-link:hover { color: ${t.text}; }
    .upload-zone { border: 2px dashed ${t.borderMid}; border-radius: 20px; padding: 48px 32px; text-align: center; transition: all 0.3s ease; cursor: pointer; background: ${t.bgCard}; }
    .upload-zone:hover, .upload-zone.dragging { border-color: #E8B4A0; background: ${dark ? "#2C2420" : "#FFF8F5"}; transform: scale(1.005); }
    .upload-zone.done { border-color: #A8C5A0; background: ${dark ? "#1A2E1A" : "#F0FAF0"}; }
    .card { background: ${t.bgCard}; border-radius: 20px; border: 1px solid ${t.border}; box-shadow: 0 2px 12px rgba(0,0,0,${dark ? "0.2" : "0.04"}); transition: box-shadow 0.25s ease; }
    .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,${dark ? "0.35" : "0.08"}); }
    .sidebar-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; color: ${t.textSec}; transition: all 0.2s ease; text-decoration: none; border: none; background: transparent; width: 100%; font-family: 'DM Sans', sans-serif; }
    .sidebar-nav-item:hover { background: ${t.bgSubtle}; color: ${t.text}; }
    .sidebar-nav-item.active { background: ${dark ? t.accent : "#2C2420"}; color: ${dark ? "#2C2420" : "#FAF7F4"}; }
    .sidebar-nav-item.active span { color: ${dark ? "#2C2420" : "#FAF7F4"} !important; }
    .file-type-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px; border-radius: 16px; cursor: pointer; border: 1.5px solid ${t.borderMid}; background: ${t.bgCard}; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
    .file-type-btn:hover { border-color: #E8B4A0; background: ${dark ? "#2C2420" : "#FFF8F5"}; transform: translateY(-2px); }
    .file-type-btn.selected { border-color: ${t.text}; background: ${t.bgSubtle}; box-shadow: 0 4px 16px rgba(44,36,32,0.1); }
    .history-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; cursor: pointer; transition: background 0.2s ease; border: 1px solid transparent; }
    .history-item:hover { background: ${t.bgSubtle}; border-color: ${t.border}; }
    .lang-badge { padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; background: ${t.bgCard}; border: 1.5px solid ${t.borderMid}; color: ${t.textSec}; transition: all 0.2s; cursor: pointer; }
    .lang-badge:hover, .lang-badge.selected { background: ${dark ? t.accent : "#2C2420"}; color: ${dark ? "#2C2420" : "#FAF7F4"}; border-color: ${dark ? t.accent : "#2C2420"}; }
    .stat-card { background: ${t.bgCard}; border-radius: 18px; padding: 24px; border: 1px solid ${t.border}; box-shadow: 0 2px 12px rgba(0,0,0,${dark ? "0.2" : "0.04"}); }
    @media (max-width: 768px) { .dash-content { padding: 20px 16px; } }
  `;

  return (
    <TokenContext.Provider value={{ t, dark }}>
    <>
      <style>{css}</style>
      <div className="dash-layout">
        <DashboardSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} dark={dark} t={t} />
        <div className="dash-main" style={{ marginLeft: sidebarOpen ? "260px" : "72px" }}>
          <Navbar />
          <main className="dash-content" style={{ paddingTop: "96px" }}>
            {children}
          </main>
        </div>
      </div>
    </>
    </TokenContext.Provider>
  );
}
