import { useState } from 'react'
import { Sparkles, ImagePlus } from 'lucide-react'
import { askAI } from './lib/ai.js'
import { useStore } from './store.jsx'
const OK = ['image/png', 'image/jpeg', 'image/webp'], MAX = 4 * 1024 * 1024
const b64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f) })
export const Links = ({ items }) => <ul className="links">{items.map(([n, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer noopener">{n}</a></li>)}</ul>
// Optional AI analysis. Shows AI text ONLY when the live Gemini call succeeded.
export function AiPanel({ instruction, text }) {
  const { lang } = useStore(); const [files, setFiles] = useState([]), [ok, setOk] = useState(false), [busy, setBusy] = useState(false), [out, setOut] = useState(null), [err, setErr] = useState('')
  async function add(list) { setErr(''); const o = []; for (const f of list) { if (!OK.includes(f.type)) { setErr('Only PNG, JPG or WebP images.'); continue } if (f.size > MAX) { setErr(`${f.name} is over 4 MB.`); continue } const url = await b64(f); o.push({ name: f.name, mime: f.type, url, data: url.split(',')[1] }) } setFiles(p => [...p, ...o].slice(0, 3)) }
  async function run() {
    if (!text.trim() && !files.length) return setErr('Add some text or a screenshot first.')
    if (files.length && !ok) return setErr('Tick the consent box to send images to the AI service.')
    setErr(''); setBusy(true); setOut(await askAI([{ role: 'user', text: `${instruction}\n\nUser text:\n${text}`, images: files }], lang)); setBusy(false)
  }
  return (<div className="card"><b>Optional: AI analysis</b>
    <div className="row"><label className="btn ghost"><ImagePlus size={16} /> Add screenshot<input hidden type="file" accept={OK.join(',')} multiple onChange={e => { add([...e.target.files]); e.target.value = '' }} /></label>
      {files.map((f, i) => <span key={i} className="thumb"><img src={f.url} alt={f.name} /></span>)}</div>
    {files.length > 0 && <label className="note"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} /> I agree to send these images to the AI service. I have hidden OTPs, PINs and passwords.</label>}
    <button className="btn" disabled={busy} onClick={run}><Sparkles size={16} /> {busy ? 'Analysing…' : 'Analyse with AI'}</button>
    {err && <p className="err" role="alert">{err}</p>}
    {out?.demo && <p className="note">Live AI is not available (no Gemini key configured, or the request failed), so no AI analysis was produced. The rule-based result above is still valid.</p>}
    {out && !out.demo && <div><span className="tag">Live AI suggestion – not verified</span><div className="txt">{out.text}</div></div>}</div>)
}
