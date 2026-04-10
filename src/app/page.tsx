// "use client";

// import { useEffect, useState } from "react";

// export default function Home() {
//   const [status, setStatus] = useState("Checking...");

//   useEffect(() => {
//     const checkDB = async () => {
//       try {
//         const res = await fetch("/api/check-db");
//         const data = await res.json();

//         if (data.success) {
//           setStatus("✅ MongoDB Connected");
//         } else {
//           setStatus("❌ Connection Failed");
//         }
//       } catch (error) {
//         setStatus("❌ Error connecting to DB");
//       }
//     };

//     checkDB();
//   }, []);

//   return (
//     <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
//       <h1>Database Status</h1>
//       <p>{status}</p>
//     </div>
//   );
// }



"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FloatingCard {
  id: number;
  title: string;
  tag: string;
  color: string;
  rotation: number;
  x: string;
  y: string;
  delay: number;
}

interface StoryStep {
  label: string;
  heading: string;
  body: string;
  accent: string;
  icon: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface Stat {
  number: string;
  label: string;
  suffix: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STORY_STEPS: StoryStep[] = [
  {
    label: "Citizens",
    heading: "Understand any government notice in minutes",
    body: "Upload a confusing legal document and receive a plain-language breakdown — what it means, what you must do, and by when.",
    accent: "#E8B4A0",
    icon: "◎",
  },
  {
    label: "Farmers",
    heading: "Know your rights under every agricultural scheme",
    body: "Navigate subsidy applications, land records, and water rights without needing a lawyer. Step-by-step, in your language.",
    accent: "#A8C5A0",
    icon: "◈",
  },
  {
    label: "Business Owners",
    heading: "Cut through compliance complexity",
    body: "GST filings, trade licences, FSSAI registrations — get visual workflows that map every form, every office, every deadline.",
    accent: "#A0B8D8",
    icon: "◇",
  },
  {
    label: "Researchers",
    heading: "Analyse policy documents at scale",
    body: "Compare legislative changes across states, extract structured data from notices, and identify procedural gaps with AI assistance.",
    accent: "#C4A8D4",
    icon: "◉",
  },
];

const FEATURES: Feature[] = [
  {
    icon: "⬡",
    title: "Plain-Language Summaries",
    desc: "Dense legal text converted to clear, jargon-free explanations anyone can follow.",
    color: "#FFF0EB",
  },
  {
    icon: "⬢",
    title: "Visual Decision Trees",
    desc: "Interactive flowcharts that guide you through procedures step by step.",
    color: "#EBF5EB",
  },
  {
    icon: "⬡",
    title: "12+ Regional Languages",
    desc: "Full support for Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, and more.",
    color: "#EBF0FF",
  },
  {
    icon: "⬢",
    title: "Voice Guidance",
    desc: "Audio walkthroughs for users who prefer listening over reading.",
    color: "#F5EBFF",
  },
  {
    icon: "⬡",
    title: "Document Checklist",
    desc: "Auto-generated lists of required documents and approvals for any procedure.",
    color: "#FFFBEB",
  },
  {
    icon: "⬢",
    title: "Direct Portal Links",
    desc: "Curated links to official government forms, portals, and contact offices.",
    color: "#FFEBF0",
  },
];

const STATS: Stat[] = [
  { number: "4200", label: "Government Procedures Indexed", suffix: "+" },
  { number: "12", label: "Regional Languages Supported", suffix: "" },
  { number: "98", label: "Accuracy Rate", suffix: "%" },
  { number: "3", label: "Average Minutes to Understand Any Notice", suffix: "" },
];

const CARDS: FloatingCard[] = [
  {
    id: 1,
    title: "RTI Application",
    tag: "Central Govt",
    color: "#FDF0EA",
    rotation: -6,
    x: "8%",
    y: "18%",
    delay: 0,
  },
  {
    id: 2,
    title: "Land Records",
    tag: "Revenue Dept",
    color: "#EAF0FD",
    rotation: 4,
    x: "72%",
    y: "10%",
    delay: 0.15,
  },
  {
    id: 3,
    title: "FSSAI Licence",
    tag: "Food Safety",
    color: "#EAF5EA",
    rotation: -3,
    x: "62%",
    y: "55%",
    delay: 0.3,
  },
  {
    id: 4,
    title: "Aadhaar Correction",
    tag: "UIDAI",
    color: "#F5EAF5",
    rotation: 5,
    x: "5%",
    y: "62%",
    delay: 0.45,
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingDocCard({
  card,
  scrollY,
}: {
  card: FloatingCard;
  scrollY: number;
}) {
  const parallaxY = scrollY * (0.04 + card.id * 0.012);

  return (
    <div
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        transform: `rotate(${card.rotation}deg) translateY(${-parallaxY}px)`,
        transition: "transform 0.1s linear",
        zIndex: card.id,
        animationDelay: `${card.delay}s`,
      }}
      className="floating-card-wrapper float-anim"
    >
      <div
        style={{
          background: card.color,
          borderRadius: "16px",
          padding: "18px 22px",
          width: "160px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.8)",
          cursor: "default",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 16px 48px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)";
        }}
      >
        <div
          style={{
            width: "32px",
            height: "4px",
            background: "#D4C4B0",
            borderRadius: "2px",
            marginBottom: "12px",
          }}
        />
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "#E8E0D4",
            borderRadius: "2px",
            marginBottom: "6px",
          }}
        />
        <div
          style={{
            width: "70%",
            height: "3px",
            background: "#E8E0D4",
            borderRadius: "2px",
            marginBottom: "14px",
          }}
        />
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#3D3530",
            marginBottom: "4px",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {card.title}
        </p>
        <span
          style={{
            fontSize: "9px",
            color: "#8A7E76",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {card.tag}
        </span>
      </div>
    </div>
  );
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref}>
      {count}
      {suffix}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const scrollY = useScrollY();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "dragging" | "loading" | "done">("idle");
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Sticky scroll story
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = el.offsetHeight;
    const progress = (scrollY - top + window.innerHeight * 0.3) / sectionHeight;
    const step = Math.min(
      STORY_STEPS.length - 1,
      Math.max(0, Math.floor(progress * STORY_STEPS.length))
    );
    setActiveStep(step);
  }, [scrollY]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("loading");
    setTimeout(() => setUploadState("done"), 2200);
  }, []);

  const heroParallax = scrollY * 0.35;
  const heroOpacity = Math.max(0, 1 - scrollY / 500);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #FAF7F4;
          color: #2C2420;
          overflow-x: hidden;
        }

        ::selection { background: #E8B4A0; color: #2C2420; }

        .float-anim {
          animation: floatUp 6s ease-in-out infinite;
        }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }

        .hero-headline {
          animation: fadeSlideUp 1s ease both;
        }
        .hero-sub {
          animation: fadeSlideUp 1s 0.2s ease both;
        }
        .hero-cta {
          animation: fadeSlideUp 1s 0.4s ease both;
        }
        .hero-cards {
          animation: scaleIn 1.2s 0.3s ease both;
        }

        .nav-link {
          color: #6B5E56;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1px;
          background: #E8B4A0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .nav-link:hover { color: #2C2420; }
        .nav-link:hover::after { transform: scaleX(1); }

        .pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          border: none;
          outline: none;
        }
        .pill-btn:hover { transform: translateY(-2px); }
        .pill-btn-primary {
          background: #2C2420;
          color: #FAF7F4;
          box-shadow: 0 4px 20px rgba(44,36,32,0.25);
        }
        .pill-btn-primary:hover { box-shadow: 0 8px 32px rgba(44,36,32,0.35); }
        .pill-btn-ghost {
          background: transparent;
          color: #2C2420;
          border: 1.5px solid #D4C4B0;
        }
        .pill-btn-ghost:hover { background: #F0EBE5; border-color: #B8A898; }

        .tag-chip {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .feature-card {
          border-radius: 20px;
          padding: 32px 28px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }

        .step-tab {
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.25s ease;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          color: #8A7E76;
        }
        .step-tab:hover { color: #2C2420; }
        .step-tab.active {
          background: #2C2420;
          color: #FAF7F4;
          border-color: #2C2420;
        }

        .upload-zone {
          border: 2px dashed #D4C4B0;
          border-radius: 20px;
          padding: 48px 32px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: #FFFFFF;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: #E8B4A0;
          background: #FFF8F5;
          transform: scale(1.01);
        }
        .upload-zone.done {
          border-color: #A8C5A0;
          background: #F0FAF0;
        }

        .lang-badge {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          background: white;
          border: 1.5px solid #E8E0D4;
          color: #6B5E56;
          transition: all 0.2s;
          cursor: default;
        }
        .lang-badge:hover {
          background: #FAF7F4;
          border-color: #D4C4B0;
          transform: scale(1.04);
        }

        .scroll-indicator {
          animation: fadeIn 1s 1.5s ease both;
        }

        .stagger-1 { animation: fadeSlideUp 0.7s 0.1s ease both; }
        .stagger-2 { animation: fadeSlideUp 0.7s 0.2s ease both; }
        .stagger-3 { animation: fadeSlideUp 0.7s 0.3s ease both; }
        .stagger-4 { animation: fadeSlideUp 0.7s 0.4s ease both; }
        .stagger-5 { animation: fadeSlideUp 0.7s 0.5s ease both; }
        .stagger-6 { animation: fadeSlideUp 0.7s 0.6s ease both; }

        .section-enter {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .section-enter.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .highlight-serif {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }

        @media (max-width: 768px) {
          .hero-cards { display: none; }
          .hero-headline { font-size: clamp(36px, 10vw, 72px) !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .sticky-layout { flex-direction: column !important; }
          .stats-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "linear-gradient(160deg, #FAF7F4 60%, #F5EDE4 100%)",
          paddingTop: "64px",
        }}
      >
        {/* Background circle */}
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,180,160,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Floating doc cards */}
        <div
          className="hero-cards"
          style={{
            position: "absolute",
            inset: 0,
            opacity: heroOpacity,
          }}
        >
          {CARDS.map((card) => (
            <FloatingDocCard key={card.id} card={card} scrollY={scrollY} />
          ))}
        </div>

        {/* Hero text */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            maxWidth: "760px",
            padding: "0 24px",
            transform: `translateY(${heroParallax * 0.3}px)`,
            opacity: heroOpacity,
          }}
        >
          <div className="hero-headline" style={{ marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-block",
                background: "#FFF0EB",
                border: "1px solid #F0D4C4",
                borderRadius: "100px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#A06040",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "28px",
              }}
            >
              ✦ Civic Tech for Bharat
            </span>
          </div>

          <h1
            className="hero-headline"
            style={{
              fontSize: "clamp(48px, 7vw, 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#2C2420",
              marginBottom: "24px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            Government docs,{" "}
            <span
              className="highlight-serif"
              style={{
                color: "#2C2420",
                background: "linear-gradient(180deg, transparent 55%, rgba(232,180,160,0.5) 55%)",
                paddingBottom: "2px",
              }}
            >
              finally
            </span>{" "}
            <br />
            in plain language.
          </h1>

          <p
            className="hero-sub"
            style={{
              fontSize: "18px",
              color: "#6B5E56",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto 36px",
              fontWeight: 400,
            }}
          >
            Upload any legal notice or government document. Get a step-by-step
            guide in your language — with visual workflows, required documents,
            and direct links to the right office.
          </p>

          <div
            className="hero-cta"
            style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <button className="pill-btn pill-btn-primary" style={{ fontSize: "15px", padding: "15px 32px" }}>
              Upload a Document ↑
            </button>
            <button className="pill-btn pill-btn-ghost" style={{ fontSize: "15px", padding: "15px 32px" }}>
              Browse Procedures
            </button>
          </div>

          {/* Trust line */}
          <div
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {["RTI", "Land Records", "GST", "Aadhaar", "PAN", "Passport"].map((tag) => (
              <span
                key={tag}
                className="tag-chip"
                style={{ background: "#F0EBE5", color: "#6B5E56" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="scroll-indicator"
          style={{
            position: "absolute",
            bottom: "36px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: heroOpacity,
          }}
        >
          <span style={{ fontSize: "11px", color: "#A89888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll to explore
          </span>
          <div
            style={{
              width: "24px",
              height: "38px",
              border: "1.5px solid #D4C4B0",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              paddingTop: "6px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "8px",
                borderRadius: "2px",
                background: "#D4C4B0",
                animation: "floatUp 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div
          style={{
            background: "#2C2420",
            borderRadius: "24px",
            padding: "48px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "32px",
          }}
          className="stats-row"
        >
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(36px, 4vw, 52px)",
                  color: "#FAF7F4",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                <AnimatedCounter
                  target={parseInt(s.number)}
                  suffix={s.suffix}
                />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#A89888",
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── STICKY STORY ─────────────────────────────────────────────────── */}
      <div
        ref={stickyRef}
        style={{ position: "relative", height: "280vh" }}
      >
        <div
          style={{
            position: "sticky",
            top: "80px",
            height: "calc(100vh - 80px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              display: "flex",
              gap: "80px",
              alignItems: "center",
            }}
            className="sticky-layout"
          >
            {/* Left: tabs */}
            <div style={{ flex: "0 0 220px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#A89888",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                Built for
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {STORY_STEPS.map((step, i) => (
                  <button
                    key={i}
                    className={`step-tab ${activeStep === i ? "active" : ""}`}
                    onClick={() => setActiveStep(i)}
                  >
                    {step.label}
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  marginTop: "32px",
                  height: "3px",
                  background: "#E8E0D4",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${((activeStep + 1) / STORY_STEPS.length) * 100}%`,
                    background: "#2C2420",
                    borderRadius: "2px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            {/* Right: content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                key={activeStep}
                style={{
                  animation: "fadeSlideUp 0.5s ease both",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "40px",
                    marginBottom: "20px",
                  }}
                >
                  {STORY_STEPS[activeStep].icon}
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(28px, 4vw, 48px)",
                    color: "#2C2420",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    marginBottom: "20px",
                    fontWeight: 700,
                  }}
                >
                  {STORY_STEPS[activeStep].heading}
                </h2>
                <p
                  style={{
                    fontSize: "17px",
                    color: "#6B5E56",
                    lineHeight: 1.75,
                    maxWidth: "480px",
                    marginBottom: "32px",
                  }}
                >
                  {STORY_STEPS[activeStep].body}
                </p>

                {/* Visual mock */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    border: "1px solid #F0EBE5",
                    maxWidth: "440px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: STORY_STEPS[activeStep].accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                      }}
                    >
                      {STORY_STEPS[activeStep].icon}
                    </div>
                    <div>
                      <div
                        style={{
                          width: "120px",
                          height: "10px",
                          background: "#E8E0D4",
                          borderRadius: "5px",
                          marginBottom: "6px",
                        }}
                      />
                      <div
                        style={{
                          width: "80px",
                          height: "8px",
                          background: "#F0EBE5",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                  {[80, 60, 90, 40].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        height: "8px",
                        width: `${w}%`,
                        background: j % 2 === 0 ? "#E8E0D4" : "#F0EBE5",
                        borderRadius: "4px",
                        marginBottom: "10px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  ))}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "10px 16px",
                      background: STORY_STEPS[activeStep].accent + "40",
                      borderRadius: "10px",
                      fontSize: "12px",
                      color: "#2C2420",
                      fontWeight: 500,
                    }}
                  >
                    ✓ 3 steps remaining · Est. 10 mins
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <SectionWrapper>
        <SectionHeader
          eyebrow="What NyayaSetu does"
          title={
            <>
              Everything you need to{" "}
              <span className="highlight-serif">navigate</span> the system
            </>
          }
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "56px",
          }}
          className="grid-3"
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`feature-card stagger-${i + 1}`}
              style={{ background: f.color, border: "1px solid rgba(0,0,0,0.04)" }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  color: "#2C2420",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "20px",
                  color: "#2C2420",
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#6B5E56", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── UPLOAD DEMO ──────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}
          className="grid-2"
        >
          <div>
            <span
              className="tag-chip"
              style={{ background: "#FFF0EB", color: "#A06040", marginBottom: "20px" }}
            >
              Try it now
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                color: "#2C2420",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "18px",
                fontWeight: 700,
              }}
            >
              Drop any government document
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#6B5E56",
                lineHeight: 1.7,
                marginBottom: "28px",
              }}
            >
              PDF, image, Word doc, or plain text. Our AI reads it, identifies the
              procedure type, and generates a complete step-by-step guide in under
              30 seconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Identifies the government department",
                "Lists all required documents",
                "Maps out the full procedure",
                "Translates to your language",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#A8C5A0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: "14px", color: "#6B5E56" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          <div>
            <div
              className={`upload-zone ${uploadState}`}
              onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
              onDragLeave={() => setUploadState("idle")}
              onDrop={handleDrop}
              onClick={() => {
                if (uploadState === "idle") {
                  setUploadState("loading");
                  setTimeout(() => setUploadState("done"), 2200);
                } else if (uploadState === "done") {
                  setUploadState("idle");
                }
              }}
            >
              {uploadState === "idle" && (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "16px", color: "#D4C4B0" }}>
                    ⬡
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420", marginBottom: "8px" }}>
                    Drop your document here
                  </p>
                  <p style={{ fontSize: "13px", color: "#A89888", marginBottom: "20px" }}>
                    PDF, JPG, PNG, DOCX, TXT · Max 20MB
                  </p>
                  <button className="pill-btn pill-btn-primary" style={{ fontSize: "13px", padding: "10px 22px" }}>
                    Browse File
                  </button>
                </>
              )}
              {uploadState === "dragging" && (
                <p style={{ fontSize: "18px", fontWeight: 600, color: "#E8B4A0" }}>
                  Release to upload ↑
                </p>
              )}
              {uploadState === "loading" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "3px solid #E8E0D4",
                      borderTopColor: "#2C2420",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <p style={{ fontSize: "14px", color: "#6B5E56" }}>Analysing document…</p>
                </div>
              )}
              {uploadState === "done" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "36px" }}>✓</div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420" }}>
                    Analysis complete!
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B5E56" }}>
                    Identified: <strong>RTI Application Process</strong>
                  </p>
                  <p style={{ fontSize: "13px", color: "#8A7E76" }}>
                    Click to reset
                  </p>
                </div>
              )}
            </div>

            {/* Language selector */}
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "12px", color: "#A89888", marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Output language
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ਪੰਜਾਬੀ", "ಕನ್ನಡ"].map(
                  (lang, i) => (
                    <span key={i} className="lang-badge">
                      {lang}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── VISUAL WORKFLOW PREVIEW ───────────────────────────────────────── */}
      <SectionWrapper style={{ background: "#F5EDE4", borderRadius: "32px", margin: "0 20px" }}>
        <SectionHeader
          eyebrow="Visual workflows"
          title={
            <>
              See the full path,{" "}
              <span className="highlight-serif">not just the destination</span>
            </>
          }
          subtitle="Interactive decision trees map every step, every office, every form — so you always know exactly where you are and what comes next."
        />

        {/* Workflow mock */}
        <div
          style={{
            marginTop: "56px",
            background: "white",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0",
              overflowX: "auto",
              paddingBottom: "8px",
            }}
          >
            {[
              { step: "01", label: "Submit Application", office: "District Collector", done: true },
              { step: "02", label: "Document Verification", office: "Revenue Dept", done: true },
              { step: "03", label: "Field Inspection", office: "Tehsildar", done: false, active: true },
              { step: "04", label: "Approval & Order", office: "Collector Office", done: false },
              { step: "05", label: "Record Update", office: "Patwari", done: false },
            ].map((node, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "160px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: node.done
                        ? "#A8C5A0"
                        : node.active
                        ? "#2C2420"
                        : "#E8E0D4",
                      color: node.done || node.active ? "white" : "#A89888",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "12px",
                      transition: "all 0.3s",
                      boxShadow: node.active ? "0 0 0 6px rgba(44,36,32,0.12)" : "none",
                    }}
                  >
                    {node.done ? "✓" : node.step}
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: node.active ? "#2C2420" : "#6B5E56",
                      textAlign: "center",
                      marginBottom: "4px",
                    }}
                  >
                    {node.label}
                  </p>
                  <p style={{ fontSize: "10px", color: "#A89888", textAlign: "center" }}>
                    {node.office}
                  </p>
                </div>
                {i < 4 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: i < 2 ? "#A8C5A0" : "#E8E0D4",
                      marginBottom: "36px",
                      minWidth: "32px",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "28px",
              padding: "16px 20px",
              background: "#FFF8F0",
              borderRadius: "12px",
              border: "1px solid #F0DDD0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", marginBottom: "2px" }}>
                Currently at: Field Inspection
              </p>
              <p style={{ fontSize: "12px", color: "#A89888" }}>
                Required: Site visit report · Est. 5–7 business days
              </p>
            </div>
            <button className="pill-btn pill-btn-primary" style={{ fontSize: "12px", padding: "8px 18px" }}>
              View Full Guide →
            </button>
          </div>
        </div>
      </SectionWrapper>

      {/* ── LANGUAGE MARQUEE ─────────────────────────────────────────────── */}
      <SectionWrapper>
        <SectionHeader
          eyebrow="Multilingual"
          title={
            <>
              Guidance in{" "}
              <span className="highlight-serif">your mother tongue</span>
            </>
          }
          subtitle="Every explanation, every workflow, every document checklist — available in 12 regional Indian languages."
        />
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          {[
            { name: "Hindi", native: "हिन्दी", color: "#FFF0EB" },
            { name: "Bengali", native: "বাংলা", color: "#EBF5EB" },
            { name: "Tamil", native: "தமிழ்", color: "#EBF0FF" },
            { name: "Telugu", native: "తెలుగు", color: "#F5EBFF" },
            { name: "Marathi", native: "मराठी", color: "#FFFBEB" },
            { name: "Gujarati", native: "ગુજરાતી", color: "#FFEBF0" },
            { name: "Kannada", native: "ಕನ್ನಡ", color: "#FFF0EB" },
            { name: "Malayalam", native: "മലയാളം", color: "#EBF5EB" },
            { name: "Punjabi", native: "ਪੰਜਾਬੀ", color: "#EBF0FF" },
            { name: "Odia", native: "ଓଡ଼ିଆ", color: "#F5EBFF" },
            { name: "Assamese", native: "অসমীয়া", color: "#FFFBEB" },
            { name: "Urdu", native: "اردو", color: "#FFEBF0" },
          ].map((lang, i) => (
            <div
              key={i}
              style={{
                padding: "14px 24px",
                borderRadius: "16px",
                background: lang.color,
                border: "1px solid rgba(0,0,0,0.05)",
                textAlign: "center",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <p style={{ fontSize: "20px", fontWeight: 500, color: "#2C2420", marginBottom: "4px" }}>
                {lang.native}
              </p>
              <p style={{ fontSize: "11px", color: "#A89888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {lang.name}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <SectionWrapper>
        <div
          style={{
            background: "#2C2420",
            borderRadius: "28px",
            padding: "72px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs */}
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(232,180,160,0.1)",
              top: "-100px",
              right: "-100px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(168,197,160,0.08)",
              bottom: "-80px",
              left: "-80px",
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#A89888",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Free for all citizens
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: "#FAF7F4",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "20px",
              fontWeight: 700,
            }}
          >
            Your rights, clearly explained.{" "}
            <span style={{ fontStyle: "italic", color: "#E8B4A0" }}>
              Starting now.
            </span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#A89888",
              maxWidth: "480px",
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}
          >
            Join thousands of citizens who've already decoded their government
            documents with NyayaSetu.
          </p>
          <div
            style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <button
              className="pill-btn"
              style={{
                background: "#E8B4A0",
                color: "#2C2420",
                fontSize: "15px",
                padding: "15px 32px",
                boxShadow: "0 4px 20px rgba(232,180,160,0.3)",
              }}
            >
              Upload a Document ↑
            </button>
            <button
              className="pill-btn"
              style={{
                background: "transparent",
                color: "#FAF7F4",
                border: "1.5px solid rgba(255,255,255,0.2)",
                fontSize: "15px",
                padding: "15px 32px",
              }}
            >
              Browse All Procedures
            </button>
          </div>
        </div>
      </SectionWrapper>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #E8E0D4",
          padding: "48px 60px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "32px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "#2C2420",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#FAF7F4",
              }}
            >
              ◉
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "16px", color: "#2C2420" }}>
              NyayaSetu
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#A89888", maxWidth: "240px", lineHeight: 1.6 }}>
            Bridging the gap between citizens and the government procedures they need to navigate.
          </p>
        </div>

        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
          {[
            { heading: "Product", links: ["How it Works", "Features", "Languages", "Roadmap"] },
            { heading: "Legal", links: ["Privacy Policy", "Terms of Use", "Data Usage"] },
            { heading: "Community", links: ["Contribute", "Feedback", "Contact"] },
          ].map((col) => (
            <div key={col.heading}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{ fontSize: "14px", color: "#6B5E56", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#2C2420")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#6B5E56")}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>

      <div
        style={{
          padding: "16px 60px",
          borderTop: "1px solid #F0EBE5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <p style={{ fontSize: "12px", color: "#C4B8B0" }}>
          © 2025 NyayaSetu. Made with care for Bharat.
        </p>
        <p style={{ fontSize: "12px", color: "#C4B8B0" }}>
          All government data sourced from official portals.
        </p>
      </div>
    </>
  );
}

// ─── Layout Helpers ───────────────────────────────────────────────────────────
function SectionWrapper({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <section
      ref={ref}
      className={`section-enter ${inView ? "visible" : ""}`}
      style={{
        maxWidth: "1160px",
        margin: "0 auto",
        padding: "80px 40px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
      <span
        className="tag-chip"
        style={{ background: "#F0EBE5", color: "#A89888", marginBottom: "20px" }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          color: "#2C2420",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          fontWeight: 700,
          marginBottom: subtitle ? "16px" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "16px", color: "#6B5E56", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}