export const LANGS = { en: { name: 'English', speech: 'en-IN', ai: 'English' }, hi: { name: 'हिन्दी', speech: 'hi-IN', ai: 'Hindi' }, pa: { name: 'ਪੰਜਾਬੀ', speech: 'pa-IN', ai: 'Punjabi' } }
const DEMO = `[DEMO MODE – simulated reply, not live AI]\n\n1) What I understood\nYou describe a problem with a purchase or service.\n\n2) Possibly relevant rights\nThe Consumer Protection Act, 2019 broadly covers defective goods, unfair trade practices and deficient services. Please verify specifics on consumeraffairs.nic.in.\n\n3) Suggested next steps\n• Write to the seller/company asking for a refund or replacement, with a deadline.\n• Keep every message, invoice and photo.\n• If unresolved, use the National Consumer Helpline (consumerhelpline.gov.in).\n\n4) Evidence checklist\nInvoice, payment proof, order number, photos/videos, chat or email history.\n\n5) Questions for you\nWhen did you buy it? How much did you pay? What did the seller say?\n\nThis is general information, not legal advice.`
export async function askAI(msgs, lang) {
  const contents = msgs.map(m => ({ role: m.role, parts: [{ text: m.text || '(see attached image)' }, ...(m.images || []).map(i => ({ inlineData: { mimeType: i.mime, data: i.data } }))] }))
  try {
    const r = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, lang: LANGS[lang].ai }) })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.status)
    return { text: (await r.json()).text, demo: false }
  } catch (e) { return { text: DEMO, demo: true } }
}
