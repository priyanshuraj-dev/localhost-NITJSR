"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import axios from "axios";

export default function Navbar() {
  const { userData, setUserData, authLoading } = useContext(UserContext);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try { await axios.post("/api/auth/logout"); } catch {}
    setUserData(null);
    toast("You've been signed out.", "info");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        .nyaya-navbar-wrap {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          width: calc(100% - 48px);
          max-width: 1100px;
        }
        .nyaya-navbar {
          background: rgba(250,247,244,0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212,196,176,0.5);
          border-radius: 100px;
          padding: 10px 10px 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 24px rgba(44,36,32,0.08), 0 1px 4px rgba(44,36,32,0.04);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        [data-theme="dark"] .nyaya-navbar {
          background: rgba(26,20,16,0.9);
          border-color: rgba(74,60,52,0.6);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .nyaya-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .nyaya-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #2C2420;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #FAF7F4;
        }
        [data-theme="dark"] .nyaya-logo-icon {
          background: #E8B4A0;
          color: #2C2420;
        }
        .nyaya-logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 17px;
          color: #2C2420;
          letter-spacing: -0.01em;
        }
        [data-theme="dark"] .nyaya-logo-text { color: #F0EBE5; }

        .nyaya-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .nyaya-link {
          padding: 7px 16px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #6B5E56;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .nyaya-link:hover { background: rgba(44,36,32,0.06); color: #2C2420; }
        [data-theme="dark"] .nyaya-link { color: #C4B0A4; }
        [data-theme="dark"] .nyaya-link:hover { background: rgba(255,255,255,0.07); color: #F0EBE5; }

        .nyaya-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .nyaya-btn-ghost {
          padding: 8px 18px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #2C2420;
          background: transparent;
          border: 1.5px solid #D4C4B0;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .nyaya-btn-ghost:hover { background: #F0EBE5; border-color: #B8A898; }
        [data-theme="dark"] .nyaya-btn-ghost { color: #F0EBE5; border-color: #4A3C34; }
        [data-theme="dark"] .nyaya-btn-ghost:hover { background: rgba(255,255,255,0.07); border-color: #6A5A50; }

        .nyaya-btn-primary {
          padding: 8px 18px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #FAF7F4;
          background: #2C2420;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(44,36,32,0.22);
          transition: box-shadow 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .nyaya-btn-primary:hover { box-shadow: 0 6px 20px rgba(44,36,32,0.32); transform: translateY(-1px); }
        [data-theme="dark"] .nyaya-btn-primary { background: #E8B4A0; color: #2C2420; box-shadow: 0 4px 14px rgba(232,180,160,0.25); }

        .nyaya-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #E8B4A0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #2C2420;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }
        [data-theme="dark"] .nyaya-avatar { border-color: rgba(255,255,255,0.15); }

        @media (max-width: 640px) {
          .nyaya-links { display: none; }
          .nyaya-navbar-wrap { width: calc(100% - 24px); top: 10px; }
        }
      `}</style>

      <div className="nyaya-navbar-wrap">
        <nav className="nyaya-navbar">
          {/* Logo */}
          <div className="nyaya-logo" onClick={() => router.push("/")}>
            <div className="nyaya-logo-icon">◉</div>
            <span className="nyaya-logo-text">NyayaSetu</span>
          </div>

          {/* Links */}
          <div className="nyaya-links">
            <button className="nyaya-link" onClick={() => router.push("/how-it-works")}>How it Works</button>
            <button className="nyaya-link" onClick={() => router.push("/about")}>About</button>
            <button className="nyaya-link" onClick={() => router.push("/dashboard")}>Dashboard</button>
          </div>

          {/* Auth actions */}
          <div className="nyaya-actions">
            {authLoading ? (
              <div style={{ width: "120px", height: "34px", borderRadius: "100px", background: "rgba(44,36,32,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : userData ? (
              <>
                <div
                  className="nyaya-avatar"
                  title={userData.email}
                  onClick={() => router.push("/dashboard")}
                >
                  {userData.email.slice(0, 2).toUpperCase()}
                </div>
                <button className="nyaya-btn-ghost" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="nyaya-btn-ghost" onClick={() => router.push("/login")}>
                  Sign In
                </button>
                <button className="nyaya-btn-primary" onClick={() => router.push("/signup")}>
                  Get Started →
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
