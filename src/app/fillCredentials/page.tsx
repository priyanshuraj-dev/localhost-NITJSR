"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { UserContext } from "@/context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUserData } = useContext(UserContext);

  const [loader, setLoader] = useState(false);
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    axios.get("/api/auth/getTempUser")
      .then(res => { if (res.data.email) setFormData(p => ({ ...p, email: res.data.email })); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true); setStatus("");
    try {
      await axios.post("/api/auth/fillCredentials", formData);
      const user = await axios.get("/api/auth/getCurrent");
      setUserData(user.data.data);
      router.push("/dashboard"); router.refresh();
    } catch (err: any) {
      setStatus(err.response?.data?.error || "Login Failed");
    } finally { setLoader(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1.5px solid #E8E0D4", background: "#FFFFFF",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
    color: "#2C2420", outline: "none",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #FAF7F4; color: #2C2420; }
        ::selection { background: #E8B4A0; color: #2C2420; }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatBlob { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-18px) scale(1.04); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .card { animation: fadeSlideUp 0.7s ease both; }
        .blob { position:absolute; border-radius:50%; pointer-events:none; animation:floatBlob 7s ease-in-out infinite; }
        .submit-btn { width:100%; padding:13px; border-radius:100px; border:none; background:#2C2420; color:#FAF7F4; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 4px 16px rgba(44,36,32,0.18); }
        .submit-btn:hover:not(:disabled) { background:#3D3530; transform:translateY(-1px); box-shadow:0 8px 24px rgba(44,36,32,0.24); }
        .submit-btn:disabled { opacity:0.65; cursor:not-allowed; }
        input:focus { border-color:#E8B4A0 !important; box-shadow:0 0 0 3px rgba(232,180,160,0.18) !important; }
        input::placeholder { color:#A89888; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#FAF7F4 60%,#F5EDE4 100%)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

        {/* Blobs */}
        {[
          { w:500, t:"-120px", r:"-100px", bg:"rgba(232,180,160,0.22)", delay:"0s" },
          { w:360, b:"-80px", l:"-80px", bg:"rgba(168,197,160,0.16)", delay:"3.5s" },
          { w:260, t:"40%", l:"10%", bg:"rgba(196,168,212,0.12)", delay:"1.8s" },
        ].map((b, i) => (
          <div key={i} className="blob" style={{ width:b.w, height:b.w, background:`radial-gradient(circle,${b.bg} 0%,transparent 70%)`, top:b.t, bottom:b.b, right:b.r, left:b.l, animationDelay:b.delay }} />
        ))}

        {/* Navbar */}
        <nav style={{ padding:"0 40px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(212,196,176,0.3)", background:"rgba(250,247,244,0.7)", backdropFilter:"blur(12px)", position:"relative", zIndex:10 }}>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"#2C2420", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#FAF7F4" }}>◉</div>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"#2C2420", letterSpacing:"-0.01em" }}>NyayaSetu</span>
          </a>
          <p style={{ fontSize:13, color:"#A89888" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color:"#2C2420", fontWeight:600, textDecoration:"none", borderBottom:"1px solid #E8B4A0" }}>Sign up</a>
          </p>
        </nav>

        {/* Main */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px", position:"relative", zIndex:5 }}>
          <div className="card" style={{ width:"100%", maxWidth:420 }}>

            {/* Header */}
            <div style={{ marginBottom:36 }}>
              <span style={{ display:"inline-block", background:"#FFF0EB", border:"1px solid #F0D4C4", borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#A06040", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>
                ✦ Welcome Back
              </span>
              <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(28px,5vw,36px)", fontWeight:700, color:"#2C2420", letterSpacing:"-0.025em", lineHeight:1.15, marginBottom:8 }}>
                Sign in to{" "}
                <span style={{ background:"linear-gradient(180deg,transparent 55%,rgba(232,180,160,0.5) 55%)", paddingBottom:2 }}>NyayaSetu</span>
              </h1>
              <p style={{ fontSize:14, color:"#6B5E56", lineHeight:1.6 }}>Your government document companion, simplified.</p>
            </div>

            {/* Card */}
            <div style={{ background:"#FFFFFF", borderRadius:20, padding:32, border:"1px solid #E8E0D4", boxShadow:"0 8px 40px rgba(44,36,32,0.08),0 2px 8px rgba(44,36,32,0.04)" }}>

              {status && (
                <div style={{ marginBottom:20, padding:"12px 16px", borderRadius:10, background:"#FFF0EB", border:"1px solid #F0C4B0", fontSize:13, color:"#A04020", textAlign:"center" }}>
                  {status}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Email (locked) */}
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B5E56", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Email Address</label>
                  <div style={{ position:"relative" }}>
                    <input type="email" value={formData.email} readOnly style={{ ...inputStyle, paddingRight:40, background:"#FAF7F4", color:"#A89888", cursor:"not-allowed" }} />
                    <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:13 }}>🔒</span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B5E56", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      required
                      style={{ ...inputStyle, paddingRight:42 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#A89888", display:"flex", alignItems:"center" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loader} className="submit-btn">
                  {loader ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} />Signing in…</> : "Sign In →"}
                </button>

              </form>
            </div>

            <p style={{ textAlign:"center", fontSize:12, color:"#A89888", marginTop:24, lineHeight:1.6 }}>
              By signing in, you agree to our{" "}
              <a href="/terms" style={{ color:"#6B5E56", textDecoration:"none", borderBottom:"1px solid #E8E0D4" }}>Terms</a>{" "}and{" "}
              <a href="/privacy" style={{ color:"#6B5E56", textDecoration:"none", borderBottom:"1px solid #E8E0D4" }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}