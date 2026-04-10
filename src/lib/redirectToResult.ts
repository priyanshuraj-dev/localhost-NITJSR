import { useRouter } from "next/navigation";

export function redirectToResult(extractedText: string) {
  if (!extractedText || extractedText.trim().length < 20) {
    console.warn("Text too short to analyze");
    return;
  }
  sessionStorage.setItem("legalText", extractedText.trim());
  window.location.href = "/result";
}

export function useRedirectToResult() {
  const router = useRouter();

  const redirect = (extractedText: string) => {
    if (!extractedText || extractedText.trim().length < 20) return;
    sessionStorage.setItem("legalText", extractedText.trim());
    router.push("/result");
  };

  return redirect;
}