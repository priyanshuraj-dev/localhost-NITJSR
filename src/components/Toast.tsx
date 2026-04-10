"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "◎",
  warning: "▲",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: "#F0FAF0", border: "#A8C5A0", icon: "#4A8A4A", text: "#2C2420" },
  error:   { bg: "#FFF0EB", border: "#F0A090", icon: "#A04040", text: "#2C2420" },
  info:    { bg: "#EBF0FF", border: "#A0B8D8", icon: "#4060A0", text: "#2C2420" },
  warning: { bg: "#FFFBEB", border: "#E8C870", icon: "#A07040", text: "#2C2420" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        display: "flex", flexDirection: "column", gap: "10px",
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 18px",
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(44,36,32,0.12), 0 2px 8px rgba(44,36,32,0.06)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: c.text,
                fontWeight: 500,
                maxWidth: "340px",
                pointerEvents: "all",
                animation: "toastIn 0.3s ease both",
                cursor: "pointer",
              }}
              onClick={() => remove(t.id)}
            >
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: c.icon, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, flexShrink: 0,
              }}>
                {ICONS[t.type]}
              </div>
              <span style={{ lineHeight: 1.5 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
