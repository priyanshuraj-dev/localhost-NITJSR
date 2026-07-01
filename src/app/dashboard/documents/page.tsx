"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface DocumentItem {
  id: string;
  nameDoc: string;
  uploadUrl: string;
  language: string;
  createdAt: string;
}

const LANG_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get("/api/documents");
        setDocuments(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.nameDoc.toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIcon = (url: string) => {
    const u = url.toLowerCase();

    if (u.includes(".pdf")) return "📄";
    if (
      u.includes(".jpg") ||
      u.includes(".jpeg") ||
      u.includes(".png") ||
      u.includes(".webp")
    )
      return "🖼️";
    if (u.includes(".docx")) return "📝";
    if (u.includes(".txt")) return "📃";

    return "📁";
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading Documents...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <h2
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "30px",
          marginBottom: "8px",
        }}
      >
        My Documents
      </h2>

      <p
        style={{
          color: "#6B5E56",
          marginBottom: "24px",
        }}
      >
        View all uploaded documents.
      </p>

      <input
        placeholder="Search document..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: "1px solid #DDD",
          borderRadius: "12px",
          marginBottom: "24px",
          fontSize: "15px",
        }}
      />

      {filteredDocuments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "80px",
            color: "#6B5E56",
          }}
        >
          <div style={{ fontSize: "60px" }}>📂</div>
          <h3>No Documents Found</h3>
          <p>Your uploaded documents will appear here.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: "#fff",
                border: "1px solid #E8E0D4",
                borderRadius: "16px",
                padding: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{getIcon(doc.uploadUrl)}</span>
                  {doc.nameDoc}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    color: "#6B5E56",
                    fontSize: "14px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <span>
                    🌐 {LANG_LABELS[doc.language] || doc.language}
                  </span>

                  <span>
                    📅 {formatDate(doc.createdAt)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <a
                  href={doc.uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "#2C2420",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Open
                </a>

                <a
                  href={doc.uploadUrl}
                  download
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "#F5F2EF",
                    border: "1px solid #DDD",
                    color: "#2C2420",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}