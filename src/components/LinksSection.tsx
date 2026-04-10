"use client";

import { FormLink, PortalLink } from "@/lib/schemas";

interface Props {
  formLinks?: FormLink[] | null;
  portalLinks?: PortalLink[] | null;
}

export default function LinksSection({ formLinks, portalLinks }: Props) {
  const hasLinks =
    (formLinks && formLinks.length > 0) ||
    (portalLinks && portalLinks.length > 0);

  if (!hasLinks) return null;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #F0EBE5", borderRadius: "16px", padding: "20px" }} className="space-y-5">
      <h2 className="font-semibold" style={{ color: "#2C2420" }}>🔗 Forms & Government Portals</h2>

      {/* Form Links */}
      {formLinks && formLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#A89888" }}>
            📄 Official Forms
          </p>
          <div className="space-y-2">
            {formLinks.map((form, i) => (
              <a
                key={i}
                href={form.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border transition group"
                style={{ borderColor: "#F0EBE5", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLAnchorElement).style.background = "#FFF8F5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F0EBE5"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm" style={{ color: "#2C2420" }}>
                      {form.name}
                    </span>
                    {form.isOfficial && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#E8F5E4", color: "#4A8040" }}>
                        ✓ Official
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-xs mt-0.5" style={{ color: "#A89888" }}>{form.description}</p>
                  )}
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#C4845A" }}>{form.url}</p>
                </div>
                <span className="text-lg" style={{ color: "#D4C4B0" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Portal Links */}
      {portalLinks && portalLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#A89888" }}>
            🌐 Government Portals
          </p>
          <div className="space-y-2">
            {portalLinks.map((portal, i) => (
              <a
                key={i}
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border transition group"
                style={{ borderColor: "#F0EBE5", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLAnchorElement).style.background = "#FFF8F5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F0EBE5"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                <span className="text-2xl">🏛️</span>
                <div className="flex-1">
                  <span className="font-medium text-sm" style={{ color: "#2C2420" }}>
                    {portal.name}
                  </span>
                  {portal.description && (
                    <p className="text-xs mt-0.5" style={{ color: "#A89888" }}>{portal.description}</p>
                  )}
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#C4845A" }}>{portal.url}</p>
                </div>
                <span className="text-lg" style={{ color: "#D4C4B0" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}