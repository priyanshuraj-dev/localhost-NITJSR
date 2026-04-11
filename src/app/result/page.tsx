"use client";

import { useEffect, useState } from "react";
import { useSimplify } from "@/hooks/useSimplify";
import SimplifiedView from "@/components/SimplifiedView";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LanguageSelector from "@/components/LanguageSelector";

export default function ResultPage() {
  const { data, loading, error, simplify, reset } = useSimplify();
  const [originalText, setOriginalText] = useState("");
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [textLoaded, setTextLoaded] = useState(false);

  useEffect(() => {
    const storedText = sessionStorage.getItem("legalText") || "";
    const storedUrl = sessionStorage.getItem("legalFileUrl") || "";
    const urlParams = new URLSearchParams(window.location.search);
    const queryText = urlParams.get("text") || "";
    const text = storedText || queryText;
    if (text) setOriginalText(text);
    if (storedUrl) setCloudinaryUrl(storedUrl);
    setTextLoaded(true);
  }, []);

  useEffect(() => {
    if (!textLoaded) return;
    if (cloudinaryUrl) {
      simplify("", language, cloudinaryUrl);
    } else if (originalText) {
      simplify(originalText, language);
    }
  }, [textLoaded, originalText, cloudinaryUrl]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (cloudinaryUrl) simplify("", lang, cloudinaryUrl);
    else if (originalText) simplify(originalText, lang);
  };

  const handleReset = () => {
    reset();
    sessionStorage.removeItem("legalText");
    sessionStorage.removeItem("legalFileUrl");
    window.location.href = "/";
  };

  if (!textLoaded) return null;

  if (!originalText && !cloudinaryUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F4" }}>
        <div className="text-center space-y-3">
          <p className="text-2xl">📂</p>
          <p style={{ color: "#6B5E56" }}>No document found to analyze.</p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{ marginTop: "16px", padding: "8px 20px", background: "#2C2420", color: "#FAF7F4", border: "none", borderRadius: "100px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F4" }}>

      {/* Top Bar with Language Selector */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: "rgba(250,247,244,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F0EBE5" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B5E56" }}>
            🇮🇳 NyaySetu — Legal Simplifier
          </span>
          <LanguageSelector
            current={language}
            onChange={handleLanguageChange}
            loading={loading}
          />
        </div>
      </div>

      {loading && <LoadingSkeleton />}

      {error && !loading && (
        <div className="max-w-xl mx-auto mt-16 text-center space-y-4 px-4">
          <p className="text-5xl">😕</p>
          <p style={{ color: "#C0504A", fontWeight: 500 }}>{error}</p>
          <button
            onClick={() => simplify(originalText, language)}
            style={{ padding: "8px 20px", background: "#2C2420", color: "#FAF7F4", border: "none", borderRadius: "100px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
          >
            Try Again
          </button>
        </div>
      )}

      {data && !loading && (
        <SimplifiedView
          data={data}
          originalText={originalText}
          onReset={handleReset}
        />
      )}
    </div>
  );
}