import { evPut, evDel, evAll } from './db.js'
const svg = (title, lines) => new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${96 + lines.length * 34}" font-family="sans-serif"><rect width="100%" height="100%" fill="#f3f5f9"/><rect width="100%" height="36" fill="#0b1f4d"/><text x="14" y="24" fill="#fff" font-size="15">${title}</text>${lines.map((l, i) => `<text x="20" y="${70 + i * 34}" font-size="15" fill="#14213d">${l}</text>`).join('')}<text x="20" y="${84 + lines.length * 34}" font-size="12" fill="#c62828">DEMO SAMPLE - fictional, not a real document</text></svg>`], { type: 'image/svg+xml' })
const ITEMS = [
  ['demo-1', '[DEMO] Refund rejection chat.svg', 'Screenshot', svg('Chat with ExampleMart support', ['You: Screen cracked on arrival, please refund.', 'Support: Sorry, no returns on this item.', 'You: Your page says 7-day returns.', 'Support: Policy does not apply. Closed.'])],
  ['demo-2', '[DEMO] Invoice ExampleMart.svg', 'Bill / Invoice', svg('INVOICE #DEMO-1042 - ExampleMart', ['Item: Demo Smartphone X1', 'Amount paid: Rs 18,999', 'Order date: (10 days ago)', 'Payment: UPI - paid'])]]
export const DEMO_Q = 'My new phone arrived with a cracked screen. ExampleMart refuses a refund even though the page says 7-day returns. What can I do?'
export async function startDemo({ setDraft, addComplaint, complaints, setTour }) {
  for (const [id, name, category, blob] of ITEMS) await evPut({ id, name, type: blob.type, size: blob.size, category, note: 'Demo sample', addedAt: new Date().toISOString(), complaintId: null, blob, demo: true })
  if (!complaints.some(c => c.demo)) addComplaint({ demo: true, company: 'ExampleMart (demo)', product: 'Demo Smartphone X1', remedy: 'Refund', status: 'Awaiting response', letter: '[DEMO] Sample complaint - fictional.', evidenceIds: ['demo-1', 'demo-2'] })
  setDraft({ company: 'ExampleMart (demo)', product: 'Demo Smartphone X1', amount: '18999', date: new Date(Date.now() - 10 * 864e5).toISOString().slice(0, 10), problem: 'The phone arrived with a cracked screen. I reported it within 2 days with photos, but the seller refused a refund saying "no returns on this item", although the product page lists a 7-day return policy. (Fictional demo scenario.)', source: 'Demo', evidenceIds: ['demo-1', 'demo-2'] })
  setTour(0)
}
export async function removeDemo() { for (const e of (await evAll()).filter(e => e.demo)) await evDel(e.id) }
