"use client";

import { useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUserData } = useContext(UserContext);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(false);
  const handleGoogleLogin = () => {
    const googleUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
    window.location.href = googleUrl;
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      // Fetch user data and update context so Navbar reflects logged-in state
      const me = await axios.get("/api/auth/getCurrent", { withCredentials: true });
      setUserData(me.data.data);
      toast("Welcome back! Redirecting to dashboard…", "success");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Login failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #FAF7F4;
          color: #2C2420;
        }

        ::selection { background: #E8B4A0; color: #2C2420; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatBlob {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }

        .login-card {
          animation: fadeSlideUp 0.7s ease both;
        }

        .login-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border-radius: 10px;
          border: 1.5px solid #E8E0D4;
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #2C2420;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-input::placeholder { color: #A89888; }

        .login-input:focus {
          border-color: #E8B4A0;
          box-shadow: 0 0 0 3px rgba(232,180,160,0.18);
        }

        .login-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #A89888;
          pointer-events: none;
        }

        .login-btn {
          width: 100%;
          padding: 13px 24px;
          border-radius: 100px;
          border: none;
          background: #2C2420;
          color: #FAF7F4;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(44,36,32,0.18);
        }

        .login-btn:hover:not(:disabled) {
          background: #3D3530;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(44,36,32,0.24);
        }

        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: floatBlob 7s ease-in-out infinite;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E8E0D4;
        }
      `}</style>

      {/* ── FULL PAGE WRAPPER ── */}
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
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(232,180,160,0.22) 0%, transparent 70%)",
            top: "-120px",
            right: "-100px",
            animationDelay: "0s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "360px",
            height: "360px",
            background: "radial-gradient(circle, rgba(168,197,160,0.16) 0%, transparent 70%)",
            bottom: "-80px",
            left: "-80px",
            animationDelay: "3.5s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "260px",
            height: "260px",
            background: "radial-gradient(circle, rgba(196,168,212,0.12) 0%, transparent 70%)",
            top: "40%",
            left: "10%",
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
          <a
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#2C2420",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#FAF7F4",
              }}
            >
              ◉
            </div>
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "18px",
                color: "#2C2420",
                letterSpacing: "-0.01em",
              }}
            >
              NyayaSetu
            </span>
          </a>

          <p style={{ fontSize: "13px", color: "#A89888" }}>
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{ color: "#2C2420", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #E8B4A0" }}
            >
              Sign up
            </a>
          </p>
        </nav>

        {/* ── MAIN CONTENT ── */}
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
          <div
            className="login-card"
            style={{
              width: "100%",
              maxWidth: "420px",
            }}
          >
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
                ✦ Welcome Back
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
                Sign in to{" "}
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
                Your government document companion, simplified.
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
              {/* Error */}
              {error && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "#FFF0EB",
                    border: "1px solid #F0C4B0",
                    fontSize: "13px",
                    color: "#A04020",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6B5E56",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail className="login-input-icon" size={16} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "8px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6B5E56",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock className="login-input-icon" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="login-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

 

                {/* Submit */}
                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? (
                    <>
                      <Loader2 style={{ animation: "spin 1s linear infinite" }} size={16} />
                      Signing in…
                    </>
                  ) : (
                    "Sign In →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "24px 0",
                }}
              >
                <div className="divider-line" />
                <span style={{ fontSize: "12px", color: "#C4B8B0", whiteSpace: "nowrap" }}>
                  or continue with
                </span>
                <div className="divider-line" />
              </div>

              {/* Social placeholder buttons */}
              <button
  onClick={handleGoogleLogin}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    width: "100%", padding: "13px 24px", borderRadius: "100px",
    border: "1.5px solid #E8E0D4", background: "#FFFFFF",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
    color: "#2C2420", cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "10px", letterSpacing: "0.01em",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s, background 0.2s",
    ...(hovered && { borderColor: "#D4C4B0", background: "#FAF7F4", boxShadow: "0 4px 20px rgba(44,36,32,0.1)", transform: "translateY(-1px)" }),
  }}
>
  <svg width="18" height="18" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
    <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.31z" fill="#4285F4" />
    <path d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.24-2.51c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.75-5.59-4.1H1.06v2.6A10 10 0 0010 20z" fill="#34A853" />
    <path d="M4.41 11.92A6.02 6.02 0 014.09 10c0-.67.11-1.32.32-1.92V5.48H1.06A10 10 0 000 10c0 1.61.38 3.14 1.06 4.52l3.35-2.6z" fill="#FBBC05" />
    <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.69 0 10 0A10 10 0 001.06 5.48l3.35 2.6C5.2 5.73 7.4 3.98 10 3.98z" fill="#EA4335" />
  </svg>
  <span>{hovered ? "Connecting…" : "Continue with Google"}</span>
</button>
<p style={{ textAlign: "center", fontSize: "12px", color: "#A89888", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
  <span>🔒</span> Secured via Google OAuth 2.0
</p>
            </div>

            {/* Footer note */}
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#A89888",
                marginTop: "24px",
                lineHeight: 1.6,
              }}
            >
              By signing in, you agree to our{" "}
              <a href="/terms" style={{ color: "#6B5E56", textDecoration: "none", borderBottom: "1px solid #E8E0D4" }}>
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" style={{ color: "#6B5E56", textDecoration: "none", borderBottom: "1px solid #E8E0D4" }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}