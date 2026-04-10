"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoryStep {
  label: string; heading: string; body: string; accent: string; icon: string;
}
interface Feature {
  icon: string; title: string; desc: string; color: string; accent: string;
}
interface Stat {
  number: string; label: string; suffix: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STORY_STEPS: StoryStep[] = [
  { label: "Citizens", heading: "Understand any government notice in minutes", body: "Upload a confusing legal document and receive a plain-language breakdown — what it means, what you must do, and by when.", accent: "#E8B4A0", icon: "◎" },
  { label: "Farmers", heading: "Know your rights under every agricultural scheme", body: "Navigate subsidy applications, land records, and water rights without needing a lawyer. Step-by-step, in your language.", accent: "#A8C5A0", icon: "◈" },
  { label: "Business Owners", heading: "Cut through compliance complexity", body: "GST filings, trade licences, FSSAI registrations — get visual workflows that map every form, every office, every deadline.", accent: "#A0B8D8", icon: "◇" },
  { label: "Researchers", heading: "Analyse policy documents at scale", body: "Compare legislative changes across states, extract structured data from notices, and identify procedural gaps with AI assistance.", accent: "#C4A8D4", icon: "◉" },
];

const FEATURES: Feature[] = [
  { icon: "⬡", title: "Plain-Language Summaries", desc: "Dense legal text converted to clear, jargon-free explanations anyone can follow.", color: "#FFF0EB", accent: "#E8B4A0" },
  { icon: "⬢", title: "Visual Decision Trees", desc: "Interactive flowcharts that guide you through procedures step by step.", color: "#EBF5EB", accent: "#A8C5A0" },
  { icon: "⬡", title: "12+ Regional Languages", desc: "Full support for Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, and more.", color: "#EBF0FF", accent: "#A0B8E8" },
  { icon: "⬢", title: "Voice Guidance", desc: "Audio walkthroughs for users who prefer listening over reading.", color: "#F5EBFF", accent: "#C4A8E8" },
  { icon: "⬡", title: "Document Checklist", desc: "Auto-generated lists of required documents and approvals for any procedure.", color: "#FFFBEB", accent: "#D4C060" },
  { icon: "⬢", title: "Direct Portal Links", desc: "Curated links to official government forms, portals, and contact offices.", color: "#FFEBF0", accent: "#E8A0B4" },
];

const STATS: Stat[] = [
  { number: "4200", label: "Government Procedures Indexed", suffix: "+" },
  { number: "12", label: "Regional Languages Supported", suffix: "" },
  { number: "98", label: "Accuracy Rate", suffix: "%" },
  { number: "3", label: "Average Minutes to Understand Any Notice", suffix: "" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) { requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; }); ticking = true; }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
function HeroCard({ title, tag, tagColor, tagTextColor, accentColor, icon, scrollY, factor, wide }: {
  title: string; tag: string; tagColor: string; tagTextColor: string;
  accentColor: string; icon: string; scrollY: number; factor: number; wide?: boolean;
}) {
  return (
    <div
      style={{ background: "#FFFFFF", borderRadius: "18px", padding: "18px 20px", width: wide ? "210px" : "162px", boxShadow: "0 8px 32px rgba(44,36,32,0.09), 0 2px 8px rgba(232,160,180,0.07)", border: `1px solid ${accentColor}45`, cursor: "default", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06) translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(44,36,32,0.13)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1) translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(44,36,32,0.09)"; }}
    >
      <div style={{ height: "3px", background: `linear-gradient(90deg,${accentColor},#E8A0B4,#C4A8E8)`, borderRadius: "2px", marginBottom: "14px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: `${accentColor}25`, border: `1px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#2C2420", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.01em", lineHeight: 1.3 }}>{title}</p>
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "100px", background: tagColor, fontSize: "9px", color: tagTextColor, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{tag}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {[60, 40].map((w, i) => <div key={i} style={{ width: `${w}%` === "60%" ? "28px" : "18px", height: "5px", background: i === 0 ? `${accentColor}60` : "#EDE5DC", borderRadius: "3px" }} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0; const step = target / (1800 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <div ref={ref}>{count}{suffix}</div>;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function SectionWrapper({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { ref, inView } = useInView(0.08);
  return (
    <section ref={ref} className={`section-enter ${inView ? "visible" : ""}`}
      style={{ maxWidth: "1160px", margin: "0 auto", padding: "80px 40px", ...style }}>
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(232,160,180,0.12)", border: "1px solid rgba(232,160,180,0.25)", marginBottom: "20px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8A0B4" }} />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#A06040", letterSpacing: "0.1em", textTransform: "uppercase" }}>{eyebrow}</span>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,48px)", color: "#2C2420", lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 700, marginBottom: subtitle ? "16px" : 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "16px", color: "#6B5E56", lineHeight: 1.7 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const scrollY = useScrollY();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "dragging" | "loading" | "done">("idle");
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stickyRef.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const progress = (scrollY - top + window.innerHeight * 0.3) / el.offsetHeight;
    setActiveStep(Math.min(STORY_STEPS.length - 1, Math.max(0, Math.floor(progress * STORY_STEPS.length))));
  }, [scrollY]);

  const heroOpacity = Math.max(0, 1 - scrollY / 480);
  const heroParallax = scrollY * 0.3;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setUploadState("loading");
    setTimeout(() => setUploadState("done"), 2200);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;background:#FAF7F4;color:#2C2420;overflow-x:hidden;}
        ::selection{background:#E8B4A0;color:#2C2420;}

        .float-anim{animation:floatUp 6s ease-in-out infinite;}
        @keyframes floatUp{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.93);}to{opacity:1;transform:scale(1);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes shimmerBg{0%{background-position:-200% center;}100%{background-position:200% center;}}

        .hero-headline{animation:fadeSlideUp 0.9s ease both;}
        .hero-sub{animation:fadeSlideUp 0.9s 0.18s ease both;}
        .hero-cta{animation:fadeSlideUp 0.9s 0.36s ease both;}
        .hero-cards{animation:scaleIn 1.1s 0.25s ease both;}

        .pill-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:100px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.02em;cursor:pointer;transition:transform 0.2s ease,box-shadow 0.2s ease;border:none;outline:none;}
        .pill-btn:hover{transform:translateY(-2px);}
        .pill-btn-primary{background:linear-gradient(135deg,#2C2420 0%,#3D2030 50%,#2A1C2E 100%);color:#FAF7F4;box-shadow:0 4px 20px rgba(44,36,32,0.28);}
        .pill-btn-primary:hover{box-shadow:0 8px 32px rgba(44,36,32,0.38);}
        .pill-btn-ghost{background:transparent;color:#2C2420;border:1.5px solid #D4C4B0;}
        .pill-btn-ghost:hover{background:#F0EBE5;border-color:#B8A898;}
        .pill-btn-gradient{background:linear-gradient(135deg,#E8B4A0 0%,#E8A0B4 50%,#C4A8E8 100%);color:#2C2420;box-shadow:0 8px 28px rgba(232,160,180,0.35);}
        .pill-btn-gradient:hover{box-shadow:0 12px 40px rgba(232,160,180,0.45);}

        .tag-chip{display:inline-block;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}

        .feature-card{border-radius:22px;padding:32px 28px;transition:transform 0.25s ease,box-shadow 0.25s ease;cursor:default;position:relative;overflow:hidden;}
        .feature-card:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 24px 60px rgba(0,0,0,0.1);}
        .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--ac),#E8A0B4,#C4A8E8);opacity:0;transition:opacity 0.25s;}
        .feature-card:hover::before{opacity:1;}

        .step-tab{padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all 0.25s ease;background:transparent;font-family:'DM Sans',sans-serif;color:#8A7E76;}
        .step-tab:hover{color:#2C2420;}
        .step-tab.active{background:linear-gradient(135deg,#2C2420,#3D2030);color:#FAF7F4;border-color:transparent;box-shadow:0 4px 16px rgba(44,36,32,0.25);}

        .upload-zone{border:2px dashed #D4C4B0;border-radius:22px;padding:52px 32px;text-align:center;transition:all 0.3s ease;cursor:pointer;background:#FFFFFF;}
        .upload-zone:hover,.upload-zone.dragging{border-color:#E8A0B4;background:linear-gradient(135deg,#FFF5F8,#FFF0EB);transform:scale(1.01);}
        .upload-zone.done{border-color:#A8C5A0;background:linear-gradient(135deg,#F0FAF0,#F0F8F0);}

        .card{background:#FFFFFF;border-radius:20px;border:1px solid #F0EBE5;box-shadow:0 4px 24px rgba(44,36,32,0.06);}

        .section-enter{opacity:0;transform:translateY(36px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .section-enter.visible{opacity:1;transform:translateY(0);}

        .highlight-serif{font-family:'Playfair Display',serif;font-style:italic;}

        .stagger-1{animation:fadeSlideUp 0.65s 0.05s ease both;}
        .stagger-2{animation:fadeSlideUp 0.65s 0.14s ease both;}
        .stagger-3{animation:fadeSlideUp 0.65s 0.23s ease both;}
        .stagger-4{animation:fadeSlideUp 0.65s 0.32s ease both;}
        .stagger-5{animation:fadeSlideUp 0.65s 0.41s ease both;}
        .stagger-6{animation:fadeSlideUp 0.65s 0.50s ease both;}

        .lang-card{padding:14px 20px;border-radius:16px;border:1px solid rgba(0,0,0,0.05);text-align:center;transition:transform 0.2s ease,box-shadow 0.2s ease;cursor:default;}
        .lang-card:hover{transform:translateY(-5px);box-shadow:0 10px 28px rgba(0,0,0,0.09);}

        @media(max-width:900px){.hero-split{grid-template-columns:1fr !important;}.hero-cards{display:none !important;}.grid-3{grid-template-columns:1fr !important;}.grid-2{grid-template-columns:1fr !important;}.sticky-layout{flex-direction:column !important;}.stats-row{grid-template-columns:1fr 1fr !important;}}
      `}</style>

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: "64px", background: "linear-gradient(150deg, #FAF7F4 0%, #F7F0EB 60%, #F2E8DF 100%)" }}>

        {/* Subtle mesh background */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 65% 50%, rgba(232,160,180,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 70% at 20% 60%, rgba(196,168,232,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 50% at 80% 20%, rgba(168,197,160,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Split layout container */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "60px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }} className="hero-split">

          {/* LEFT — Text */}
          <div style={{ transform: `translateY(${heroParallax * 0.18}px)`, opacity: heroOpacity }}>

            {/* Badge */}
            <div className="hero-headline" style={{ marginBottom: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", background: "rgba(232,160,180,0.14)", border: "1px solid rgba(232,160,180,0.30)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8A0B4" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#A06040", letterSpacing: "0.1em", textTransform: "uppercase" }}>✦ Civic Tech for Bharat</span>
              </div>
            </div>

            <h1 className="hero-headline" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(40px,5.5vw,76px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: "#2C2420", marginBottom: "24px", fontWeight: 700 }}>
              Government<br />
              docs,{" "}
              <span className="highlight-serif" style={{ color: "#2C2420", background: "linear-gradient(180deg, transparent 52%, rgba(232,180,160,0.5) 52%)", paddingBottom: "3px" }}>finally</span>
              <br />
              in plain language.
            </h1>

            <p className="hero-sub" style={{ fontSize: "17px", color: "#6B5E56", lineHeight: 1.78, maxWidth: "480px", marginBottom: "36px", fontWeight: 400 }}>
              Upload any legal notice or government document. Get a step-by-step guide in your language — with visual workflows, required documents, and direct links to the right office.
            </p>

            <div className="hero-cta" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "44px" }}>
              <button className="pill-btn pill-btn-gradient" style={{ fontSize: "15px", padding: "16px 32px" }}>
                Upload a Document ↑
              </button>
              <button className="pill-btn pill-btn-ghost" style={{ fontSize: "15px", padding: "16px 32px" }}>
                Browse Procedures
              </button>
            </div>

            {/* Trust chips */}
            <div className="hero-cta" style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
              {[
                { label: "RTI", bg: "#FFF0EB", color: "#A06040" },
                { label: "Land Records", bg: "#EBF5EB", color: "#4A8A4A" },
                { label: "GST", bg: "#EBF0FF", color: "#4060A0" },
                { label: "Aadhaar", bg: "#F5EBFF", color: "#7040A0" },
                { label: "PAN", bg: "#FFFBEB", color: "#907040" },
                { label: "Passport", bg: "#FFEBF0", color: "#A04060" },
              ].map(t => (
                <span key={t.label} style={{ padding: "5px 12px", borderRadius: "100px", background: t.bg, fontSize: "11px", fontWeight: 600, color: t.color, letterSpacing: "0.05em", textTransform: "uppercase", border: `1px solid ${t.color}25` }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Cards collage */}
          <div className="hero-cards" style={{ position: "relative", height: "520px", transform: `translateY(${heroParallax * 0.08}px)`, opacity: heroOpacity }}>

            {/* Background decorative circle */}
            <div style={{ position: "absolute", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,180,160,0.14) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

            {/* Card 1 — top left */}
            <div className="float-anim" style={{ position: "absolute", top: "30px", left: "0px", transform: "rotate(-5deg)", animationDelay: "0s" }}>
              <HeroCard title="RTI Application" tag="Central Govt" tagColor="#FFF0EB" tagTextColor="#A06040" accentColor="#E8B4A0" icon="📄" scrollY={scrollY} factor={0.05} />
            </div>

            {/* Card 2 — top right */}
            <div className="float-anim" style={{ position: "absolute", top: "10px", right: "10px", transform: "rotate(4deg)", animationDelay: "0.4s" }}>
              <HeroCard title="Land Records" tag="Revenue Dept" tagColor="#EBF5EB" tagTextColor="#4A8A4A" accentColor="#A8C5A0" icon="🗺️" scrollY={scrollY} factor={0.04} />
            </div>

            {/* Card 3 — center (slightly overlapping) */}
            <div className="float-anim" style={{ position: "absolute", top: "160px", left: "50%", transform: "translateX(-50%) rotate(-2deg)", animationDelay: "0.8s", zIndex: 5 }}>
              <HeroCard title="GST Registration" tag="MCA Portal" tagColor="#EBF0FF" tagTextColor="#4060A0" accentColor="#A0B8E8" icon="📑" scrollY={scrollY} factor={0.06} wide />
            </div>

            {/* Card 4 — bottom left */}
            <div className="float-anim" style={{ position: "absolute", bottom: "30px", left: "10px", transform: "rotate(5deg)", animationDelay: "1.2s" }}>
              <HeroCard title="Aadhaar Correction" tag="UIDAI" tagColor="#F5EBFF" tagTextColor="#7040A0" accentColor="#C4A8E8" icon="🪪" scrollY={scrollY} factor={0.035} />
            </div>

            {/* Card 5 — bottom right */}
            <div className="float-anim" style={{ position: "absolute", bottom: "20px", right: "0px", transform: "rotate(-3deg)", animationDelay: "0.6s" }}>
              <HeroCard title="FSSAI Licence" tag="Food Safety" tagColor="#FFEBF0" tagTextColor="#A04060" accentColor="#E8A0B4" icon="📝" scrollY={scrollY} factor={0.045} />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: heroOpacity * 0.7 }}>
          <span style={{ fontSize: "10px", color: "#B8A898", letterSpacing: "0.12em", textTransform: "uppercase" }}>Scroll to explore</span>
          <div style={{ width: "24px", height: "38px", border: "1.5px solid #D4C4B0", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
            <div style={{ width: "4px", height: "8px", borderRadius: "2px", background: "linear-gradient(135deg,#E8B4A0,#E8A0B4)", animation: "floatUp 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div style={{ position: "relative", borderRadius: "28px", padding: "52px 48px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px", overflow: "hidden", background: "linear-gradient(135deg,#2C2420 0%,#3D2030 50%,#2A1C2E 100%)" }} className="stats-row">
          {/* Rainbow strip */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#E8B4A0,#E8A0B4,#C4A8E8,#A8C5A0)" }} />
          {/* Orb */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,160,180,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(34px,4vw,52px)", color: "#FAF7F4", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "10px" }}>
                <AnimatedCounter target={parseInt(s.number)} suffix={s.suffix} />
              </div>
              <p style={{ fontSize: "13px", color: "rgba(250,247,244,0.5)", fontWeight: 400, lineHeight: 1.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── STICKY STORY ─────────────────────────────────────────────────── */}
      <div ref={stickyRef} style={{ position: "relative", height: "280vh" }}>
        <div style={{ position: "sticky", top: "80px", height: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div style={{ maxWidth: "1100px", width: "100%", display: "flex", gap: "80px", alignItems: "center" }} className="sticky-layout">

            {/* Left tabs */}
            <div style={{ flex: "0 0 220px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#A89888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Built for</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {STORY_STEPS.map((step, i) => (
                  <button key={i} className={`step-tab ${activeStep === i ? "active" : ""}`} onClick={() => setActiveStep(i)}>{step.label}</button>
                ))}
              </div>
              <div style={{ marginTop: "32px", height: "3px", background: "#E8E0D4", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((activeStep + 1) / STORY_STEPS.length) * 100}%`, background: "linear-gradient(90deg,#E8B4A0,#E8A0B4,#C4A8E8)", borderRadius: "2px", transition: "width 0.5s ease" }} />
              </div>
            </div>

            {/* Right content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div key={activeStep} style={{ animation: "fadeSlideUp 0.45s ease both" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "20px" }}>{STORY_STEPS[activeStep].icon}</span>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,48px)", color: "#2C2420", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "20px", fontWeight: 700 }}>
                  {STORY_STEPS[activeStep].heading}
                </h2>
                <p style={{ fontSize: "17px", color: "#6B5E56", lineHeight: 1.75, maxWidth: "480px", marginBottom: "32px" }}>{STORY_STEPS[activeStep].body}</p>

                {/* Visual mock — styled like dashboard card */}
                <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "28px", boxShadow: "0 4px 24px rgba(44,36,32,0.07)", border: "1px solid #F0EBE5", maxWidth: "440px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg,${STORY_STEPS[activeStep].accent},#E8A0B4,#C4A8E8)` }} />
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: STORY_STEPS[activeStep].accent + "30", border: `1px solid ${STORY_STEPS[activeStep].accent}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{STORY_STEPS[activeStep].icon}</div>
                    <div>
                      <div style={{ width: "120px", height: "10px", background: "#E8E0D4", borderRadius: "5px", marginBottom: "6px" }} />
                      <div style={{ width: "80px", height: "8px", background: "#F0EBE5", borderRadius: "4px" }} />
                    </div>
                  </div>
                  {[80, 60, 90, 45].map((w, j) => (
                    <div key={j} style={{ height: "8px", width: `${w}%`, background: j % 2 === 0 ? "#E8E0D4" : "#F0EBE5", borderRadius: "4px", marginBottom: "10px", transition: "width 0.5s ease" }} />
                  ))}
                  <div style={{ marginTop: "16px", padding: "11px 16px", background: STORY_STEPS[activeStep].accent + "25", borderRadius: "12px", fontSize: "12px", color: "#2C2420", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: STORY_STEPS[activeStep].accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#2C2420" }}>✓</div>
                    3 steps remaining · Est. 10 mins
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <SectionWrapper>
        <SectionHeader eyebrow="What NyayaSetu does" title={<>Everything you need to <span className="highlight-serif">navigate</span> the system</>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginTop: "56px" }} className="grid-3">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card stagger-${i + 1}`} style={{ background: f.color, border: `1px solid ${f.accent}30`, "--ac": f.accent } as React.CSSProperties}>
              <div style={{ fontSize: "26px", marginBottom: "18px", color: "#2C2420" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "19px", color: "#2C2420", marginBottom: "10px", letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#6B5E56", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── UPLOAD DEMO ──────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }} className="grid-2">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(232,160,180,0.12)", border: "1px solid rgba(232,160,180,0.25)", marginBottom: "22px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8A0B4" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#A06040", letterSpacing: "0.1em", textTransform: "uppercase" }}>Try it now</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,44px)", color: "#2C2420", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "18px", fontWeight: 700 }}>
              Drop any government document
            </h2>
            <p style={{ fontSize: "16px", color: "#6B5E56", lineHeight: 1.7, marginBottom: "28px" }}>
              PDF, image, Word doc, or plain text. Our AI reads it, identifies the procedure type, and generates a complete step-by-step guide in under 30 seconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Identifies the government department", color: "#E8B4A0" },
                { label: "Lists all required documents", color: "#E8A0B4" },
                { label: "Maps out the full procedure", color: "#C4A8E8" },
                { label: "Translates to your language", color: "#A8C5A0" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#2C2420", flexShrink: 0, fontWeight: 700 }}>✓</div>
                  <span style={{ fontSize: "14px", color: "#6B5E56" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Upload zone */}
            <div className={`upload-zone ${uploadState}`}
              onDragOver={e => { e.preventDefault(); setUploadState("dragging"); }}
              onDragLeave={() => setUploadState("idle")}
              onDrop={handleDrop}
              onClick={() => { if (uploadState === "idle") { setUploadState("loading"); setTimeout(() => setUploadState("done"), 2200); } else if (uploadState === "done") setUploadState("idle"); }}>

              {uploadState === "idle" && (
                <>
                  <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg,#FFF0EB,#FFE8F0)", border: "1px solid rgba(232,160,180,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 18px" }}>⬆</div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420", marginBottom: "8px" }}>Drop your document here</p>
                  <p style={{ fontSize: "13px", color: "#A89888", marginBottom: "24px" }}>PDF, JPG, PNG, DOCX, TXT · Max 20 MB</p>
                  <button className="pill-btn pill-btn-gradient" style={{ fontSize: "13px", padding: "11px 26px" }}>Browse Files</button>
                </>
              )}
              {uploadState === "dragging" && <p style={{ fontSize: "18px", fontWeight: 600, color: "#E8A0B4" }}>Release to upload ✦</p>}
              {uploadState === "loading" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", border: "3px solid #F0E8EC", borderTopColor: "#E8A0B4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: "14px", color: "#6B5E56" }}>Analysing document…</p>
                </div>
              )}
              {uploadState === "done" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#A8C5A0,#80B878)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "white" }}>✓</div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420" }}>Analysis complete!</p>
                  <p style={{ fontSize: "13px", color: "#6B5E56" }}>Identified: <strong>RTI Application Process</strong></p>
                  <p style={{ fontSize: "12px", color: "#A89888" }}>Click to reset</p>
                </div>
              )}
            </div>

            {/* Language badges */}
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "11px", color: "#A89888", marginBottom: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Output language</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ਪੰਜਾਬੀ", "ಕನ್ನಡ"].map((lang, i) => (
                  <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, background: "white", border: "1.5px solid #E8E0D4", color: "#6B5E56", cursor: "default", transition: "all 0.2s" }}>{lang}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── WORKFLOW PREVIEW ─────────────────────────────────────────────── */}
      <div style={{ padding: "0 40px", maxWidth: "1240px", margin: "0 auto 80px" }}>
        <div style={{ background: "linear-gradient(135deg,#2C2420 0%,#3D2030 55%,#2A1C2E 100%)", borderRadius: "32px", padding: "56px 52px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#E8B4A0,#E8A0B4,#C4A8E8,#A8C5A0)" }} />
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,160,180,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "30%", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle,rgba(196,168,232,0.10) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(232,160,180,0.15)", border: "1px solid rgba(232,160,180,0.25)", marginBottom: "22px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8A0B4" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#E8C0CC", letterSpacing: "0.1em", textTransform: "uppercase" }}>Visual workflows</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,3.5vw,42px)", color: "#FAF7F4", lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "14px", fontWeight: 700 }}>
              See the full path,{" "}
              <span style={{ fontStyle: "italic", color: "#E8B4A0" }}>not just the destination</span>
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(250,247,244,0.55)", lineHeight: 1.7, maxWidth: "500px", marginBottom: "44px" }}>
              Interactive decision trees map every step, every office, every form — so you always know exactly where you are and what comes next.
            </p>

            {/* Workflow nodes */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "32px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0", overflowX: "auto", paddingBottom: "4px" }}>
                {[
                  { step: "01", label: "Submit Application", office: "District Collector", done: true },
                  { step: "02", label: "Document Verification", office: "Revenue Dept", done: true },
                  { step: "03", label: "Field Inspection", office: "Tehsildar", done: false, active: true },
                  { step: "04", label: "Approval & Order", office: "Collector Office", done: false },
                  { step: "05", label: "Record Update", office: "Patwari", done: false },
                ].map((node, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "158px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: node.done ? "linear-gradient(135deg,#A8C5A0,#80B878)" : node.active ? "linear-gradient(135deg,#E8B4A0,#E8A0B4)" : "rgba(255,255,255,0.08)", color: node.done || node.active ? "#2C2420" : "rgba(250,247,244,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, marginBottom: "12px", boxShadow: node.active ? "0 0 0 6px rgba(232,160,180,0.2)" : "none", transition: "all 0.3s" }}>{node.done ? "✓" : node.step}</div>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: node.active ? "#FAF7F4" : node.done ? "rgba(250,247,244,0.8)" : "rgba(250,247,244,0.4)", textAlign: "center", marginBottom: "4px" }}>{node.label}</p>
                      <p style={{ fontSize: "10px", color: "rgba(250,247,244,0.3)", textAlign: "center" }}>{node.office}</p>
                    </div>
                    {i < 4 && <div style={{ flex: 1, height: "2px", background: i < 2 ? "linear-gradient(90deg,#A8C5A0,#A8C5A050)" : "rgba(255,255,255,0.12)", marginBottom: "36px", minWidth: "24px" }} />}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "24px", padding: "16px 20px", background: "rgba(232,180,160,0.12)", borderRadius: "14px", border: "1px solid rgba(232,180,160,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#FAF7F4", marginBottom: "2px" }}>Currently at: Field Inspection</p>
                  <p style={{ fontSize: "12px", color: "rgba(250,247,244,0.45)" }}>Required: Site visit report · Est. 5–7 business days</p>
                </div>
                <button className="pill-btn pill-btn-gradient" style={{ fontSize: "12px", padding: "9px 20px" }}>View Full Guide →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LANGUAGE GRID ────────────────────────────────────────────────── */}
      <SectionWrapper>
        <SectionHeader eyebrow="Multilingual" title={<>Guidance in <span className="highlight-serif">your mother tongue</span></>} subtitle="Every explanation, every workflow, every document checklist — available in 12 regional Indian languages." />
        <div style={{ marginTop: "48px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
          {[
            { name: "Hindi", native: "हिन्दी", color: "#FFF0EB", accent: "#E8B4A0" },
            { name: "Bengali", native: "বাংলা", color: "#EBF5EB", accent: "#A8C5A0" },
            { name: "Tamil", native: "தமிழ்", color: "#EBF0FF", accent: "#A0B8E8" },
            { name: "Telugu", native: "తెలుగు", color: "#F5EBFF", accent: "#C4A8E8" },
            { name: "Marathi", native: "मराठी", color: "#FFFBEB", accent: "#D4C060" },
            { name: "Gujarati", native: "ગુજરાતી", color: "#FFEBF0", accent: "#E8A0B4" },
            { name: "Kannada", native: "ಕನ್ನಡ", color: "#FFF0EB", accent: "#E8B4A0" },
            { name: "Malayalam", native: "മലയാളം", color: "#EBF5EB", accent: "#A8C5A0" },
            { name: "Punjabi", native: "ਪੰਜਾਬੀ", color: "#EBF0FF", accent: "#A0B8E8" },
            { name: "Odia", native: "ଓଡ଼ିଆ", color: "#F5EBFF", accent: "#C4A8E8" },
            { name: "Assamese", native: "অসমীয়া", color: "#FFFBEB", accent: "#D4C060" },
            { name: "Urdu", native: "اردو", color: "#FFEBF0", accent: "#E8A0B4" },
          ].map((lang, i) => (
            <div key={i} className="lang-card" style={{ background: lang.color, border: `1px solid ${lang.accent}30` }}>
              <p style={{ fontSize: "22px", fontWeight: 500, color: "#2C2420", marginBottom: "4px" }}>{lang.native}</p>
              <p style={{ fontSize: "10px", color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{lang.name}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div style={{ borderRadius: "28px", padding: "72px 60px", textAlign: "center", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#2C2420 0%,#3D2030 55%,#2A1C2E 100%)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#E8B4A0,#E8A0B4,#C4A8E8,#A8C5A0)" }} />
          <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,160,180,0.12) 0%,transparent 70%)", top: "-100px", right: "-100px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(196,168,232,0.08) 0%,transparent 70%)", bottom: "-80px", left: "-80px", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(232,160,180,0.15)", border: "1px solid rgba(232,160,180,0.25)", marginBottom: "24px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8A0B4" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#E8C0CC", letterSpacing: "0.1em", textTransform: "uppercase" }}>Free for all citizens</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,56px)", color: "#FAF7F4", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "20px", fontWeight: 700 }}>
              Your rights, clearly explained.{" "}
              <span style={{ fontStyle: "italic", color: "#E8B4A0" }}>Starting now.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(250,247,244,0.5)", maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.7 }}>
              Join thousands of citizens who've already decoded their government documents with NyayaSetu.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="pill-btn pill-btn-gradient" style={{ fontSize: "15px", padding: "16px 34px" }}>Upload a Document ↑</button>
              <button className="pill-btn" style={{ background: "transparent", color: "#FAF7F4", border: "1.5px solid rgba(255,255,255,0.18)", fontSize: "15px", padding: "16px 34px" }}>Browse All Procedures</button>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #E8E0D4", padding: "48px 60px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg,#2C2420,#3D2030)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#FAF7F4" }}>◉</div>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "17px", color: "#2C2420" }}>NyayaSetu</span>
          </div>
          <p style={{ fontSize: "13px", color: "#A89888", maxWidth: "240px", lineHeight: 1.6 }}>Bridging the gap between citizens and the government procedures they need to navigate.</p>
        </div>
        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
          {[
            { heading: "Product", links: ["How it Works", "Features", "Languages", "Roadmap"] },
            { heading: "Legal", links: ["Privacy Policy", "Terms of Use", "Data Usage"] },
            { heading: "Community", links: ["Contribute", "Feedback", "Contact"] },
          ].map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>{col.heading}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ fontSize: "14px", color: "#6B5E56", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#2C2420")}
                    onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "#6B5E56")}>{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
      <div style={{ padding: "16px 60px", borderTop: "1px solid #F0EBE5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "12px", color: "#C4B8B0" }}>© 2025 NyayaSetu. Made with care for Bharat.</p>
        <p style={{ fontSize: "12px", color: "#C4B8B0" }}>All government data sourced from official portals.</p>
      </div>
    </>
  );
}