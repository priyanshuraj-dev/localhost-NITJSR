"use client";

export default function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="bg-blue-50 rounded-xl p-5 space-y-2">
        <div className="h-5 bg-blue-100 rounded w-1/4" />
        <div className="h-4 bg-blue-100 rounded w-full" />
        <div className="h-4 bg-blue-100 rounded w-5/6" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
      </div>
      <p className="text-center text-sm text-gray-400">🤖 AI is analyzing your document...</p>
    </div>
  );
}