import { useState } from "react";
import { SimplifiedOutput } from "@/lib/schemas";

interface UseSimplifyReturn {
  data: SimplifiedOutput | null;
  loading: boolean;
  error: string | null;
  simplify: (text: string, language?: string, cloudinaryUrl?: string) => Promise<void>;
  reset: () => void;
}

export function useSimplify(): UseSimplifyReturn {
  const [data, setData] = useState<SimplifiedOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simplify = async (text: string, language = "en", cloudinaryUrl?: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const body: Record<string, string> = { language };
      if (cloudinaryUrl) body.cloudinaryUrl = cloudinaryUrl;
      else body.text = text;

      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Something went wrong");
      setData(json.data as SimplifiedOutput);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, loading, error, simplify, reset };
}