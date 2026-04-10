"use client";

import Navbar from "@/components/Navbar";

const STEPS = [
  {
    num: "01",
    title: "Upload Your Document",
    desc: "Drop any government notice, legal letter, land record, or administrative form. We accept PDF, images (JPG/PNG), Word documents (.docx), and plain text files up to 10 MB.",
    color: "#FFF0EB",
    accent: "#E8B4A0",
    icon: "⬡",
  },
  {
    num: "02",
    title: "AI Reads & Identifies",
    desc: "Our AI — powered by Google Gemini — reads the actual content of your document, identifies the procedure type, the relevant government department, and the key obligations.",
    color: "#EBF5EB",
    accent: "#A8C5A0",
    icon: "◎",
  },
  {
    num: "03",
    title: "Get a Plain-Language Guide",
    desc: "Receive a structured breakdown: a plain-language summary, step-by-step procedure, list of required documents, authorities involved, and direct links to official portals.",
    color: "#EBF0FF",
    accent: "#A0B8D8",
    icon: "◈",
  },
  {
    num: "04",
    title: "Follow in Your Language",
    desc: "Every guide is available in 8 regional Indian languages — Hindi, Bengali, Tamil, Telugu, Marathi, Punjabi, Kannada, and English — so you can follow along comfortably.",
    color: "#F5EBFF",
    accent: "#C4A8D4",
    icon: "◇",
  },
];

const FEATURES = [
  { icon: "📄", title: "PDF & Image Support", desc: "Scanned documents, photos of notices, digital PDFs — all handled." },
  { icon: "📝", title: "Word & Text Files", desc: "DOCX and plain text files are extracted and analysed accurately." },
  { icon: "🌐", title: "8 Regional Languages", desc: "Full output translation into major Indian languages." },
  { icon: "🏛", title: "Authority Mapping", desc: "Know exactly which office to visit and who to contact." },
  { icon: "🔗", title: "Official Portal Links", desc: "Direct links to government forms and portals — no searching needed." },
  { icon: "📋", title: "Document Checklist", desc: "Auto-generated list of every document you need to arrange." },
];

export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #FAF7F4; color: #2C2420; }
        .hiw-hero { padding: 160px 40px 80px; text-align: center; max-width: 760px; margin: 0 auto; }
        .hiw-tag { display: inline-block; padding: 5px 14px; border-radius: 100px; background: #FFF0EB; color: #A06040; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
        .hiw-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 60px); font-weight: 700; color: #2C2420; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 20px; }
        .hiw-sub { font-size: 17px; color: #6B5E56; line-height: 1.75; max-width: 520px; margin: 0 auto; }
        .hiw-steps { max-width: 900px; margin: 0 auto; padding: 0 40px 80px; display: flex; flex-direction: column; gap: 0; }
        .hiw-step { display: grid; grid-template-columns: 80px 1fr; gap: 32px; padding: 40px 0; border-bottom: 1px solid #F0EBE5; align-items: start; }
        .hiw-step:last-child { border-bottom: none; }
        .hiw-step-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #E8E0D4; line-height: 1; }
        .hiw-step-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
        .hiw-step-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #2C2420; margin-bottom: 10px; }
        .hiw-step-desc { font-size: 15px; color: #6B5E56; line-height: 1.75; }
        .hiw-features { background: #2C2420; padding: 80px 40px; }
        .hiw-features-inner { max-width: 1100px; margin: 0 auto; }
        .hiw-features-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 44px); color: #FAF7F4; font-weight: 700; letter-spacing: -0.02em; text-align: center; margin-bottom: 56px; }
        .hiw-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .hiw-feature-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px; }
        .hiw-feature-icon { font-size: 28px; margin-bottom: 14px; }
        .hiw-feature-title { font-size: 15px; font-weight: 600; color: #FAF7F4; margin-bottom: 8px; }
        .hiw-feature-desc { font-size: 13px; color: #A89888; line-height: 1.65; }
        .hiw-cta { padding: 80px 40px; text-align: center; }
        .hiw-cta-inner { max-width: 560px; margin: 0 auto; }
        .hiw-cta-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 44px); color: #2C2420; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; }
        .hiw-cta-sub { font-size: 16px; color: #6B5E56; line-height: 1.7; margin-bottom: 32px; }
        .hiw-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px; background: #2C2420; color: #FAF7F4; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(44,36,32,0.25); transition: box-shadow 0.2s, transform 0.2s; text-decoration: none; }
        .hiw-btn:hover { box-shadow: 0 8px 32px rgba(44,36,32,0.35); transform: translateY(-2px); }
        @media (max-width: 768px) {
          .hiw-features-grid { grid-template-columns: 1fr 1fr; }
          .hiw-step { grid-template-columns: 1fr; gap: 16px; }
          .hiw-step-num { font-size: 32px; }
        }
        @media (max-width: 480px) {
          .hiw-features-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <div className="hiw-hero">
        <span className="hiw-tag">✦ How it Works</span>
        <h1 className="hiw-title">From confusing document<br />to clear action plan</h1>
        <p className="hiw-sub">NyayaSetu turns complex government paperwork into step-by-step guidance anyone can follow — in minutes, in your language.</p>
      </div>

      {/* Steps */}
      <div className="hiw-steps">
        {STEPS.map((step) => (
          <div key={step.num} className="hiw-step">
            <div className="hiw-step-num">{step.num}</div>
            <div>
              <div className="hiw-step-icon" style={{ background: step.color }}>{step.icon}</div>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="hiw-features">
        <div className="hiw-features-inner">
          <h2 className="hiw-features-title">Everything included in every analysis</h2>
          <div className="hiw-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="hiw-feature-card">
                <div className="hiw-feature-icon">{f.icon}</div>
                <p className="hiw-feature-title">{f.title}</p>
                <p className="hiw-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="hiw-cta">
        <div className="hiw-cta-inner">
          <h2 className="hiw-cta-title">Ready to decode your document?</h2>
          <p className="hiw-cta-sub">Upload any government notice or legal document and get your plain-language guide in under 30 seconds.</p>
          <a href="/dashboard" className="hiw-btn">Upload a Document ↑</a>
        </div>
      </div>
    </>
  );
}
