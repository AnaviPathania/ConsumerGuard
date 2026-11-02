// Server-side Gemini proxy. The API key stays in env vars and never reaches the browser.
const SYSTEM = `You are ConsumerGuard, an assistant for consumers in India. You give general information, not legal advice.
Structure answers: 1) What I understood 2) Possibly relevant rights 3) Suggested next steps 4) Evidence checklist 5) Where to escalate 6) Questions I need answered.
Only cite laws you are confident exist (e.g. Consumer Protection Act, 2019; Consumer Protection (E-Commerce) Rules, 2020); never invent section numbers. Official channels: National Consumer Helpline consumerhelpline.gov.in; cybercrime 1930 / cybercrime.gov.in.
For images: separate "Text visible in the image" from "My interpretation". Never state an image proves fraud. Never invent details not visible. Warn users never to share OTPs, PINs or passwords. Never guarantee outcomes. Offer to draft a complaint when relevant.`
export default async function handler(req, res) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' })
  const { contents, lang } = req.body || {}
  if (!Array.isArray(contents) || !contents.length) return res.status(400).json({ error: 'contents required' })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: `${SYSTEM}\nRespond in: ${lang || 'English'}.` }] } })
    })
    const d = await r.json()
    if (!r.ok) return res.status(502).json({ error: d.error?.message || 'Gemini error' })
    res.status(200).json({ text: d.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '' })
  } catch (e) { res.status(502).json({ error: 'Upstream failure' }) }
}
