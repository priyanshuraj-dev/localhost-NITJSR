"use client";

import { Authority } from "@/lib/schemas";

export default function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
      <h2 className="font-semibold text-indigo-800 mb-3">🏛️ Issuing Authority</h2>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Name:</span>
          <span className="font-medium text-gray-800">{authority.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Type:</span>
          <span className="text-gray-700">{authority.type}</span>
        </div>
        {authority.contactInfo && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Contact:</span>
            <span className="text-gray-700">{authority.contactInfo}</span>
          </div>
        )}
        {authority.website && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Website:</span>
            <a href={authority.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
              {authority.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}