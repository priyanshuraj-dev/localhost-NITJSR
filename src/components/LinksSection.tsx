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
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <h2 className="font-semibold text-gray-800">🔗 Forms & Government Portals</h2>

      {/* Form Links */}
      {formLinks && formLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            📄 Official Forms
          </p>
          <div className="space-y-2">
            {formLinks.map((form, i) => (
              <a
                key={i}
                href={form.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition group"
              >
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800 group-hover:text-blue-700">
                      {form.name}
                    </span>
                    {form.isOfficial && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        ✓ Official
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{form.description}</p>
                  )}
                  <p className="text-xs text-blue-400 mt-0.5 truncate">{form.url}</p>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 text-lg">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Portal Links */}
      {portalLinks && portalLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            🌐 Government Portals
          </p>
          <div className="space-y-2">
            {portalLinks.map((portal, i) => (
              <a
                key={i}
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition group"
              >
                <span className="text-2xl">🏛️</span>
                <div className="flex-1">
                  <span className="font-medium text-sm text-gray-800 group-hover:text-indigo-700">
                    {portal.name}
                  </span>
                  {portal.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{portal.description}</p>
                  )}
                  <p className="text-xs text-indigo-400 mt-0.5 truncate">{portal.url}</p>
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 text-lg">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}