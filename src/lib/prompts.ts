export const LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  bn: "Bengali (বাংলা)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
  ta: "Tamil (தமிழ்)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  or: "Odia (ଓଡ଼ିଆ)",
};

export const SIMPLIFICATION_PROMPT = (text: string, language: string = "en") => `
You are a legal language simplification expert helping Indian citizens understand complex government documents and legal texts.

Your task is to analyze the following legal/government text and return a structured JSON response.

TEXT TO ANALYZE:
"""
${text}
"""

OUTPUT LANGUAGE: ${LANGUAGES[language] || "English"}
IMPORTANT: The values of ALL text fields (title, summary, simplifiedText, steps descriptions, document names, warnings, visualGuide etc.) must be written in ${LANGUAGES[language] || "English"}. Only keep JSON keys in English.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "title": "Short title of this document/procedure (5-8 words max)",
  "summary": "2-3 sentence plain-language summary of what this document is about",
  "simplifiedText": "The full document rewritten in simple, everyday language that a class 8 student can understand. Use short sentences. Avoid jargon.",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "What to do in this step (clear, actionable)",
      "tip": "Optional helpful tip for this step",
      "icon": "A single relevant emoji for this step"
    }
  ],
  "requiredDocuments": [
    {
      "name": "Document name",
      "required": true,
      "description": "What this document is and why it is needed",
      "alternatives": ["Alternative document if original not available"]
    }
  ],
  "authority": {
    "name": "Name of the government body or authority",
    "type": "Type (e.g., Central Government, State Government, Municipality)",
    "contactInfo": "Phone or address if mentioned",
    "website": "Official website URL if known"
  },
  "estimatedTime": "How long this process typically takes",
  "fees": "Any fees involved (write 'Free' if no fees)",
  "warnings": [
    "Important warning or common mistake to avoid"
  ],
  "formLinks": [
    {
      "name": "Form name (e.g. Form 49A)",
      "url": "Direct URL to download or fill the form",
      "description": "What this form is for",
      "isOfficial": true
    }
  ],
  "portalLinks": [
    {
      "name": "Portal name (e.g. NSDL PAN Portal)",
      "url": "https://...",
      "description": "What you can do on this portal"
    }
  ],
  "visualGuide": [
    "🏠 Start at home — gather your documents",
    "🏦 Visit the nearest TIN Facilitation Centre",
    "📝 Fill Form 49A in BLOCK LETTERS",
    "💰 Pay the fee of Rs. 107",
    "📬 Receive PAN card by post in 15 days"
  ],
  "language": "${language}"
}

Rules:
- simplifiedText must be easy to read for a common person
- steps must be in logical order with relevant emojis as icons
- formLinks: Use ONLY real, verified Indian government form URLs. Examples of valid base domains:
    PAN: https://www.onlineservices.nsdl.com, https://www.utiitsl.com
    Income Tax: https://www.incometax.gov.in
    GST: https://www.gst.gov.in
    Passport: https://www.passportindia.gov.in
    Aadhaar: https://myaadhaar.uidai.gov.in
    EPF: https://unifiedportal-mem.epfindia.gov.in
    MCA: https://www.mca.gov.in
    DigiLocker: https://www.digilocker.gov.in
    RTI: https://rtionline.gov.in
    Voter ID: https://voters.eci.gov.in
  Only include formLinks if you are confident the URL path is real. If unsure of the exact path, use the portal homepage URL instead.
- portalLinks: Use ONLY the homepage or main service page of official portals from the domains above.
- If no relevant forms or portals exist for this document type, return empty arrays [] for formLinks and portalLinks.
- visualGuide should be 4-6 short lines, each starting with a relevant emoji, telling the story of the process visually.
- If the document describes a process, infer the workflow and never leave visualGuide empty.
- If a field is not found in the text, use your knowledge of Indian government procedures to fill it.
- warnings should highlight potential rejection risks or missing requirements.
- ALL text content must be in ${LANGUAGES[language] || "English"} only.
- Do not include multiple languages inside the output values.
- Return ONLY the JSON object, nothing else.
`;

export const CHAT_CONTEXT_PROMPT = (
  originalText: string,
  simplifiedOutput: string,
  userQuestion: string,
  language: string = "en"
) => `
You are a helpful assistant that explains government procedures and legal documents to Indian citizens in simple language.

ORIGINAL DOCUMENT:
"""
${originalText}
"""

SIMPLIFIED ANALYSIS ALREADY PROVIDED:
"""
${simplifiedOutput}
"""

USER QUESTION: "${userQuestion}"

Answer in ${LANGUAGES[language] || "English"}.
- Use simple, everyday language.
- Be specific and actionable.
- Use the simplified analysis as the main context.
- If the question is about process steps, fees, documents, forms, or authority, answer using those details.
- If the document does not mention the answer, say "The document does not mention that."
- Do not invent details not present in the text or simplified analysis.
- Keep the response under 150 words.
`;