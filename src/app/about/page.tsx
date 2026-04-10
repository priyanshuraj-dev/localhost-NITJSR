"use client";

import Navbar from "@/components/Navbar";

const TEAM_VALUES = [
  { icon: "◎", title: "Accessibility First", desc: "Every citizen deserves to understand the documents that affect their life, regardless of education level or language." },
  { icon: "◈", title: "Accuracy Matters", desc: "We ground every analysis in the actual document content — no hallucinations, no guesswork." },
  { icon: "◇", title: "Privacy by Design", desc: "Your documents are processed and never stored beyond what's needed. Your data belongs to you." },
  { icon: "⬡", title: "Open to All", desc: "NyayaSetu is free for every citizen. Government information should never be behind a paywall." },
];

const STATS = [
  { value: "4,200+", label: "Procedures Indexed" },
  { value: "12", label: "Regional Languages" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "< 30s", label: "Average Analysis Time" },
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #FAF7F4; color: #2C2420; }
        .about-hero { padding: 160px 40px 80px; max-width: 900px; margin: 0 auto; }
        .about-tag { display: inline-block; padding: 5px 14px; border-radius: 100px; background: #EBF0FF; color: #4060A0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
        .about-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 64px); font-weight: 700; color: #2C2420; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 28px; }
        .about-title em { font-style: italic; color: #A06040; }
        .about-lead { font-size: 18px; color: #6B5E56; line-height: 1.8; max-width: 640px; }
        .about-stats { background: #2C2420; padding: 60px 40px; }
        .about-stats-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .about-stat-val { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 48px); color: #FAF7F4; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
        .about-stat-label { font-size: 13px; color: #A89888; }
        .about-mission { padding: 80px 40px; max-width: 900px; margin: 0 auto; }
        .about-section-tag { font-size: 11px; font-weight: 600; color: #A89888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .about-section-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3.5vw, 40px); color: #2C2420; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 20px; }
        .about-section-body { font-size: 16px; color: #6B5E56; line-height: 1.8; max-width: 640px; }
        .about-values { padding: 0 40px 80px; max-width: 900px; margin: 0 auto; }
        .about-values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .about-value-card { background: white; border: 1px solid #F0EBE5; border-radius: 20px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .about-value-icon { font-size: 24px; margin-bottom: 14px; }
        .about-value-title { font-size: 16px; font-weight: 600; color: #2C2420; margin-bottom: 8px; }
        .about-value-desc { font-size: 14px; color: #6B5E56; line-height: 1.65; }
        .about-cta { background: linear-gradient(160deg, #FAF7F4 60%, #F5EDE4 100%); padding: 80px 40px; text-align: center; }
        .about-cta-inner { max-width: 560px; margin: 0 auto; }
        .about-cta-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 44px); color: #2C2420; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; }
        .about-cta-sub { font-size: 16px; color: #6B5E56; line-height: 1.7; margin-bottom: 32px; }
        .about-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px; background: #E8B4A0; color: #2C2420; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(232,180,160,0.3); transition: box-shadow 0.2s, transform 0.2s; text-decoration: none; }
        .about-btn:hover { box-shadow: 0 8px 32px rgba(232,180,160,0.45); transform: translateY(-2px); }
        @media (max-width: 768px) {
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
          .about-values-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <div className="about-hero">
        <span className="about-tag">◉ About NyayaSetu</span>
        <h1 className="about-title">
          Bridging citizens<br />and the <em>system</em>
        </h1>
        <p className="about-lead">
          Government procedures, legal notices, and administrative documents are written in complex bureaucratic language that most citizens struggle to understand. NyayaSetu exists to change that — making every government document accessible, clear, and actionable for every Indian citizen.
        </p>
      </div>

      {/* Stats */}
      <div className="about-stats">
        <div className="about-stats-grid">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="about-stat-val">{s.value}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="about-mission">
        <p className="about-section-tag">Our Mission</p>
        <h2 className="about-section-title">Plain language for every citizen</h2>
        <p className="about-section-body">
          We believe that understanding your rights and obligations under the law should not require a lawyer or a degree. NyayaSetu uses AI to convert dense legal and bureaucratic text into clear, structured guidance — step-by-step instructions, visual workflows, required document checklists, and direct links to the right government portals — in 12 regional Indian languages.
        </p>
      </div>

      {/* Values */}
      <div className="about-values">
        <p className="about-section-tag">Our Values</p>
        <h2 className="about-section-title">What we stand for</h2>
        <div className="about-values-grid">
          {TEAM_VALUES.map((v) => (
            <div key={v.title} className="about-value-card">
              <div className="about-value-icon">{v.icon}</div>
              <p className="about-value-title">{v.title}</p>
              <p className="about-value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <div className="about-cta-inner">
          <h2 className="about-cta-title">Try it for yourself</h2>
          <p className="about-cta-sub">Upload any government document and see how NyayaSetu turns complexity into clarity.</p>
          <a href="/dashboard" className="about-btn">Upload a Document ↑</a>
        </div>
      </div>
    </>
  );
}
