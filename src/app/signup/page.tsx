"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = "auto";
  }, []);

  const { toast } = useToast();

  const handleGoogleSignup = () => {
    toast("Redirecting to Google…", "info");
    const googleUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
    window.location.href = googleUrl;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #FAF7F4; color: #2C2420; }
        ::selection { background: #E8B4A0; color: #2C2420; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .reg-card { animation: fadeSlideUp 0.7s ease both; }

        .blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: floatBlob 7s ease-in-out infinite;
        }

        .google-btn {
          width: 100%;
          padding: 13px 24px;
          border-radius: 100px;
          border: 1.5px solid #E8E0D4;
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #2C2420;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .google-btn:hover {
          border-color: #D4C4B0;
          background: #FAF7F4;
          box-shadow: 0 4px 20px rgba(44,36,32,0.1);
          transform: translateY(-1px);
        }

        .divider-line { flex: 1; height: 1px; background: #E8E0D4; }

        .nav-link-reg {
          color: #6B5E56;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .nav-link-reg:hover {
          color: #2C2420;
          border-bottom-color: #E8B4A0;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FAF7F4 60%, #F5EDE4 100%)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="blob"
          style={{
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(232,180,160,0.22) 0%, transparent 70%)",
            top: "-120px", right: "-100px",
            animationDelay: "0s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "360px", height: "360px",
            background: "radial-gradient(circle, rgba(168,197,160,0.16) 0%, transparent 70%)",
            bottom: "-80px", left: "-80px",
            animationDelay: "3.5s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "260px", height: "260px",
            background: "radial-gradient(circle, rgba(196,168,212,0.12) 0%, transparent 70%)",
            top: "40%", left: "10%",
            animationDelay: "1.8s",
          }}
        />

        {/* ── NAVBAR ── */}
        <nav
          style={{
            padding: "0 40px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(212,196,176,0.3)",
            background: "rgba(250,247,244,0.7)",
            backdropFilter: "blur(12px)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "#2C2420", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "14px", color: "#FAF7F4",
              }}
            >
              ◉
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#2C2420", letterSpacing: "-0.01em" }}>
              NyayaSetu
            </span>
          </a>

          <p style={{ fontSize: "13px", color: "#A89888" }}>
            Already have an account?{" "}
            <a href="/login" className="nav-link-reg" style={{ color: "#2C2420", fontWeight: 600 }}>
              Sign in
            </a>
          </p>
        </nav>

        {/* ── MAIN ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            position: "relative",
            zIndex: 5,
          }}
        >
          <div className="reg-card" style={{ width: "100%", maxWidth: "420px" }}>

            {/* Header */}
            <div style={{ marginBottom: "36px" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#FFF0EB",
                  border: "1px solid #F0D4C4",
                  borderRadius: "100px",
                  padding: "5px 14px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#A06040",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                ✦ New Account
              </span>
              <h1
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "clamp(28px, 5vw, 36px)",
                  fontWeight: 700,
                  color: "#2C2420",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  marginBottom: "8px",
                }}
              >
                Join{" "}
                <span
                  style={{
                    background: "linear-gradient(180deg, transparent 55%, rgba(232,180,160,0.5) 55%)",
                    paddingBottom: "2px",
                  }}
                >
                  NyayaSetu
                </span>
              </h1>
              <p style={{ fontSize: "14px", color: "#6B5E56", lineHeight: 1.6 }}>
                Understand your rights. Navigate government procedures with ease.
              </p>
            </div>

            {/* Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid #E8E0D4",
                boxShadow: "0 8px 40px rgba(44,36,32,0.08), 0 2px 8px rgba(44,36,32,0.04)",
              }}
            >
              {/* What you get */}
              <div
                style={{
                  background: "#FAF7F4",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                  border: "1px solid #F0EBE5",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                  What you get
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    "Plain-language summaries of any government notice",
                    "Step-by-step procedure guides in your language",
                    "Document checklists & direct portal links",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span
                        style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: "#FFF0EB", border: "1px solid #F0D4C4",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "9px", color: "#A06040", flexShrink: 0, marginTop: "1px",
                        }}
                      >
                        ✦
                      </span>
                      <span style={{ fontSize: "13px", color: "#6B5E56", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogleSignup}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="google-btn"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                  <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.31z" fill="#4285F4" />
                  <path d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.24-2.51c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.75-5.59-4.1H1.06v2.6A10 10 0 0010 20z" fill="#34A853" />
                  <path d="M4.41 11.92A6.02 6.02 0 014.09 10c0-.67.11-1.32.32-1.92V5.48H1.06A10 10 0 000 10c0 1.61.38 3.14 1.06 4.52l3.35-2.6z" fill="#FBBC05" />
                  <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.69 0 10 0A10 10 0 001.06 5.48l3.35 2.6C5.2 5.73 7.4 3.98 10 3.98z" fill="#EA4335" />
                </svg>
                <span>{hovered ? "Connecting…" : "Continue with Google"}</span>
              </button>

              {/* Security note */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#A89888",
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <span>🔒</span> Secured via Google OAuth 2.0
              </p>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div className="divider-line" />
                <span style={{ fontSize: "12px", color: "#C4B8B0", whiteSpace: "nowrap" }}>or</span>
                <div className="divider-line" />
              </div>

              {/* Sign in redirect */}
              <p style={{ textAlign: "center", fontSize: "13px", color: "#A89888" }}>
                Already have an account?{" "}
                <a
                  href="/login"
                  style={{ color: "#2C2420", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #E8B4A0" }}
                >
                  Sign in →
                </a>
              </p>
            </div>

            {/* Footer note */}
            <p style={{ textAlign: "center", fontSize: "12px", color: "#A89888", marginTop: "24px", lineHeight: 1.6 }}>
              By signing up, you agree to our{" "}and{" "}Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}