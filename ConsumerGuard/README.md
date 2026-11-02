# ConsumerGuard (Phase 2)
Six features: AI Assistant, Violation Checker, Evidence Vault, Complaint Generator, Dark Pattern Detector, Scam Detection Centre.
Setup: `npm install` → copy `.env.example` to `.env`, set `GEMINI_API_KEY` (server-side only) → `npm run dev`.
Without a key the assistant shows a labelled DEMO reply; Dark Pattern and Scam tools still work via rule-based checks and show NO AI output unless Gemini responds. Production: deploy to Vercel (`api/` is the proxy).
Evidence is stored in browser IndexedDB only (not uploaded, not encrypted).

## Interface
English-only UI. Voice input and AI replies can use English, Hindi or Punjabi via the selector inside the AI Assistant.
"Explore demo" loads fictional sample data and a 6-step tour; "Exit & remove demo data" deletes it. Animations respect the reduced-motion setting.
