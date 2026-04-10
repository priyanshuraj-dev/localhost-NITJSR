"use client";

import { useEffect, useState } from "react";
import { useSimplify } from "@/hooks/useSimplify";
import SimplifiedView from "@/components/SimplifiedView";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LanguageSelector from "@/components/LanguageSelector";

export default function ResultPage() {
  const { data, loading, error, simplify, reset } = useSimplify();
  const [originalText, setOriginalText] = useState("");
  const [language, setLanguage] = useState("en");
  const [textLoaded, setTextLoaded] = useState(false);

  useEffect(() => {
    const storedText = sessionStorage.getItem("legalText") || "";
    const urlParams = new URLSearchParams(window.location.search);
    const queryText = urlParams.get("text") || "";
    const text = storedText || queryText;
    if (text) setOriginalText(text);
    setTextLoaded(true);
  }, []);

  useEffect(() => {
    if (textLoaded && originalText) {
      simplify(originalText, language);
    }
  }, [textLoaded, originalText]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (originalText) simplify(originalText, lang);
  };

  const handleReset = () => {
    reset();
    sessionStorage.removeItem("legalText");
    window.location.href = "/";
  };

  if (!textLoaded) return null;

  if (!originalText) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-2xl">📂</p>
          <p className="text-gray-600">No document found to analyze.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Bar with Language Selector */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">
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
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => simplify(originalText, language)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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