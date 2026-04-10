"use client";

import { Authority } from "@/lib/schemas";

export default function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <div style={{ background: "#FFF8F5", border: "1px solid #F0D8C8", borderRadius: "16px", padding: "20px" }}>
      <h2 className="font-semibold mb-3" style={{ color: "#2C2420" }}>🏛️ Issuing Authority</h2>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="w-20" style={{ color: "#A89888" }}>Name:</span>
          <span className="font-medium" style={{ color: "#2C2420" }}>{authority.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20" style={{ color: "#A89888" }}>Type:</span>
          <span style={{ color: "#4A3C34" }}>{authority.type}</span>
        </div>
        {authority.contactInfo && (
          <div className="flex gap-2">
            <span className="w-20" style={{ color: "#A89888" }}>Contact:</span>
            <span style={{ color: "#4A3C34" }}>{authority.contactInfo}</span>
          </div>
        )}
        {authority.website && (
          <div className="flex gap-2">
            <span className="w-20" style={{ color: "#A89888" }}>Website:</span>
            <a href={authority.website} target="_blank" rel="noreferrer" className="hover:underline break-all" style={{ color: "#C4845A" }}>
              {authority.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}