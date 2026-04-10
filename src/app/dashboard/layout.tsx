"use client";

import { useState, useContext } from "react";
import DashboardSidebar from "./components/Sidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { ThemeContext } from "@/context/ThemeContext";
import { TokenContext, LIGHT, DARK } from "@/context/TokenContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);
  const dark = theme === "dark";
  const t = dark ? DARK : LIGHT;
  const pathname = usePathname();
  const isHistory = pathname === "/dashboard/history";

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

    /* shimmer for skeleton loaders */
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

    /* history overlay — restore Tailwind spacing nuked by global reset */
    .history-overlay * { box-sizing: border-box; }
    .history-overlay .space-y-6 > * + * { margin-top: 1.5rem; }
    .history-overlay .space-y-5 > * + * { margin-top: 1.25rem; }
    .history-overlay .space-y-4 > * + * { margin-top: 1rem; }
    .history-overlay .space-y-3 > * + * { margin-top: 0.75rem; }
    .history-overlay .space-y-2 > * + * { margin-top: 0.5rem; }
    .history-overlay .space-y-1 > * + * { margin-top: 0.25rem; }
    .history-overlay .mt-1  { margin-top: 0.25rem; }
    .history-overlay .mt-2  { margin-top: 0.5rem; }
    .history-overlay .mt-3  { margin-top: 0.75rem; }
    .history-overlay .mb-2  { margin-bottom: 0.5rem; }
    .history-overlay .mb-3  { margin-bottom: 0.75rem; }
    .history-overlay .mb-4  { margin-bottom: 1rem; }
    .history-overlay .mb-5  { margin-bottom: 1.25rem; }
    .history-overlay .p-3   { padding: 0.75rem; }
    .history-overlay .p-4   { padding: 1rem; }
    .history-overlay .p-5   { padding: 1.25rem; }
    .history-overlay .p-6   { padding: 1.5rem; }
    .history-overlay .px-2  { padding-left: 0.5rem; padding-right: 0.5rem; }
    .history-overlay .px-3  { padding-left: 0.75rem; padding-right: 0.75rem; }
    .history-overlay .px-4  { padding-left: 1rem; padding-right: 1rem; }
    .history-overlay .py-1  { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .history-overlay .py-2  { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .history-overlay .py-8  { padding-top: 2rem; padding-bottom: 2rem; }
    .history-overlay .gap-1 { gap: 0.25rem; }
    .history-overlay .gap-2 { gap: 0.5rem; }
    .history-overlay .gap-3 { gap: 0.75rem; }
    .history-overlay .gap-4 { gap: 1rem; }
    .history-overlay .gap-6 { gap: 1.5rem; }
    .history-overlay .max-w-4xl { max-width: 56rem; }
    .history-overlay .mx-auto { margin-left: auto; margin-right: auto; }
    .history-overlay .rounded-lg { border-radius: 0.5rem; }
    .history-overlay .rounded-xl { border-radius: 0.75rem; }
    .history-overlay .rounded-3xl { border-radius: 1.5rem; }
    .history-overlay .rounded-full { border-radius: 9999px; }
    .history-overlay .h-2 { height: 0.5rem; }
    .history-overlay .w-full { width: 100%; }
    .history-overlay .h-64 { height: 16rem; }
    .history-overlay .h-14 { height: 3.5rem; }
    .history-overlay .w-14 { width: 3.5rem; }
    .history-overlay .h-12 { height: 3rem; }
    .history-overlay .w-12 { width: 3rem; }
    .history-overlay .h-8  { height: 2rem; }
    .history-overlay .w-8  { width: 2rem; }
    .history-overlay .text-xs  { font-size: 0.75rem; line-height: 1rem; }
    .history-overlay .text-sm  { font-size: 0.875rem; line-height: 1.25rem; }
    .history-overlay .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .history-overlay .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }
    .history-overlay .leading-relaxed { line-height: 1.625; }
    .history-overlay .font-bold     { font-weight: 700; }
    .history-overlay .font-semibold { font-weight: 600; }
    .history-overlay .font-medium   { font-weight: 500; }
    .history-overlay .tracking-wide { letter-spacing: 0.025em; }
    .history-overlay .uppercase     { text-transform: uppercase; }
    .history-overlay .whitespace-pre-line { white-space: pre-line; }
    .history-overlay .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .history-overlay .break-all { word-break: break-all; }
    .history-overlay .overflow-y-auto { overflow-y: auto; }
    .history-overlay .flex-1 { flex: 1 1 0%; }
    .history-overlay .flex-shrink-0 { flex-shrink: 0; }
    .history-overlay .items-center  { align-items: center; }
    .history-overlay .items-start   { align-items: flex-start; }
    .history-overlay .justify-between { justify-content: space-between; }
    .history-overlay .justify-center  { justify-content: center; }
    .history-overlay .flex-wrap { flex-wrap: wrap; }
    .history-overlay .flex-col  { flex-direction: column; }
    .history-overlay .grid { display: grid; }
    .history-overlay .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .history-overlay .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .history-overlay .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .history-overlay .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .history-overlay .border { border-width: 1px; border-style: solid; }
    .history-overlay .overflow-hidden { overflow: hidden; }
    .history-overlay .relative { position: relative; }
    .history-overlay .absolute { position: absolute; }
    .history-overlay .inset-x-0 { left: 0; right: 0; }
    .history-overlay .top-0 { top: 0; }
    .history-overlay .cursor-pointer { cursor: pointer; }
    .history-overlay .transition { transition-property: all; transition-duration: 150ms; }
    .history-overlay .animate-bounce { animation: bounce 1s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,.2,1)} }
    .history-overlay .\\[animation-delay\\:0ms\\]   { animation-delay: 0ms; }
    .history-overlay .\\[animation-delay\\:150ms\\] { animation-delay: 150ms; }
    .history-overlay .\\[animation-delay\\:300ms\\] { animation-delay: 300ms; }
    .history-overlay .w-1\\.5 { width: 0.375rem; }
    .history-overlay .h-1\\.5 { height: 0.375rem; }
    .history-overlay .place-items-center { place-items: center; }
    .history-overlay .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,.05); }
    .history-overlay .hover\\:-translate-y-0\\.5:hover { transform: translateY(-0.125rem); }
    .history-overlay .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1); }
    .history-overlay .opacity-80 { opacity: 0.8; }
  `;

  return (
    <TokenContext.Provider value={{ t, dark }}>
    <>
      <style>{css}</style>
      <div className="dash-layout" style={{ "--sidebar-w": sidebarOpen ? "260px" : "72px" } as React.CSSProperties}>
        <DashboardSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} dark={dark} t={t} />
        <div className="dash-main" style={{ marginLeft: sidebarOpen ? "260px" : "72px" }}>
          {!isHistory && <Navbar />}
          <main className="dash-content" style={{ paddingTop: isHistory ? "32px" : "96px" }}>
            {children}
          </main>
        </div>
      </div>
    </>
    </TokenContext.Provider>
  );
}
