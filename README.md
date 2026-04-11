# NyayaSetu — Government Docs in Plain Language

> Upload any government document. Get a step-by-step guide in your language — with visual workflows, required documents, and direct links to the right office.

<!-- SCREENSHOT: Hero page -->
![NyayaSetu Hero](public/screenshots/hero.png)

---

## What is NyayaSetu?

NyayaSetu ("Justice Bridge" in Hindi) is a civic-tech web app that helps Indian citizens understand complex government documents and legal procedures. Powered by Google Gemini AI, it turns dense legal text into plain-language guides — complete with step-by-step procedures, document checklists, authority contacts, and official portal links.

Built for citizens, farmers, business owners, and researchers who shouldn't need a lawyer to understand a government notice.

---

## Features

- **Plain-Language Summaries** — Dense legal text converted to clear, jargon-free explanations
- **Step-by-Step Procedures** — Ordered action plans with office names, timeframes, and tips
- **Visual Decision Trees** — Emoji-driven visual guides that map the full process at a glance
- **Voice Guidance** — Browser TTS reads the full guide aloud, step by step, in your language
- **AI Chat Assistant** — Ask follow-up questions about any document with full context
- **Document Checklist** — Auto-generated list of every document you need to arrange
- **Official Portal Links** — Direct links to government forms and portals
- **10 Regional Languages** — Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Punjabi, Odia, and English
- **Multiple Input Formats** — PDF, JPG/PNG images, DOCX, and plain text (up to 10 MB)
- **Analysis History** — Every analysis is saved to your account for later reference

<!-- SCREENSHOT: Result / analysis page -->
![Analysis Result](public/screenshots/result.png)

---

## How It Works

| Step | What happens |
|------|-------------|
| 1. Upload | Drop a PDF, image, Word doc, or paste text directly |
| 2. AI Reads | Gemini reads the actual document content and identifies the procedure type |
| 3. Get a Guide | Receive a structured breakdown: summary, steps, documents, authorities, links |
| 4. Follow Along | Switch to any of 10 regional languages; use voice guidance if preferred |

<!-- SCREENSHOT: How it works page -->
![How It Works](public/screenshots/how-it-works.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + inline styles |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Database | MongoDB via Mongoose |
| File Storage | Cloudinary |
| Auth | JWT (cookie-based) + Google OAuth 2.0 |
| Validation | Zod |
| Document Parsing | mammoth (DOCX), pdfjs-dist (PDF) |
| Voice | Web Speech API (browser-native TTS) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyse/        # Core AI analysis endpoint
│   │   ├── simplify/       # Simplified plain-language output
│   │   ├── chat/           # AI chat assistant
│   │   ├── cloudinary/     # File upload to Cloudinary + MongoDB
│   │   └── auth/           # Login, signup, Google OAuth, JWT
│   ├── dashboard/          # Upload & analyse interface
│   ├── result/             # Analysis output page
│   ├── how-it-works/       # Feature explainer page
│   ├── login/ signup/      # Auth pages
│   └── fillCredentials/    # Post-Google-OAuth credential setup
├── components/             # UI components (Chat, Voice, Steps, etc.)
├── context/                # React context (User, Theme, Tokens)
├── hooks/                  # useChat, useSimplify
├── lib/                    # Gemini client, prompts, schemas, JWT utils
└── models/                 # Mongoose models (User, History)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB connection string
- Google Gemini API key
- Cloudinary account
- Google OAuth credentials (optional, for Google login)

### Installation

```bash
git clone https://github.com/your-username/nyayasetu.git
cd nyayasetu
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

### `POST /api/analyse`
Analyses a government document using Gemini AI. Requires authentication (`logtok` cookie).

**Body:**
```json
{
  "cloudinaryUrl": "https://...",   // uploaded file URL (or)
  "text": "paste document text",    // raw text input
  "fileName": "notice.pdf",
  "language": "English"
}
```

**Returns:** Structured JSON with `documentType`, `summary`, `keyPoints`, `steps`, `requiredDocuments`, `authorities`, `portalLinks`, `warnings`, `difficulty`, `estimatedTotalTime`.

---

### `POST /api/simplify`
Returns a detailed simplified output validated against a Zod schema — includes `visualGuide`, `formLinks`, `fees`, and more.

---

### `POST /api/chat`
Answers follow-up questions about a document using the full analysis as context.

**Body:**
```json
{
  "originalText": "...",
  "simplifiedOutput": { ... },
  "question": "Can I apply online?"
}
```

---

### `POST /api/cloudinary/upload`
Uploads a file (multipart/form-data) to Cloudinary and saves metadata to MongoDB. Supports PDF, JPG/PNG, DOCX, TXT. Max 10 MB.

---

## Supported Languages

`English` · `हिन्दी` · `বাংলা` · `தமிழ்` · `తెలుగు` · `मराठी` · `ગુજરાતી` · `ಕನ್ನಡ` · `ਪੰਜਾਬੀ` · `ଓଡ଼ିଆ`

---

## Screenshots

<!-- Add your screenshots to public/screenshots/ and update paths below -->

| Dashboard | Analysis Result | Voice Guide |
|-----------|----------------|-------------|
| ![Dashboard](public/screenshots/dashboard.png) | ![Result](public/screenshots/result.png) | ![Voice](public/screenshots/voice.png) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a pull request

---

## License

MIT
