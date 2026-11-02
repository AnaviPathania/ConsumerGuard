import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mic, Square, Send, ImagePlus, X, Volume2, Copy, FileText, Scale, FolderLock } from 'lucide-react'
import { saveDataUrl } from '../lib/db.js'
import { askAI, LANGS } from '../lib/ai.js'
import { useStore, useT } from '../store.jsx'
const SR = window.SpeechRecognition || window.webkitSpeechRecognition
const OK = ['image/png', 'image/jpeg', 'image/webp'], MAX = 4 * 1024 * 1024
const readB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f) })
export default function Assistant() {
  const t = useT()
  const { lang, setLang, draft, setDraft } = useStore(); const nav = useNavigate(); const loc = useLocation()
  const [msgs, setMsgs] = useState([]), [input, setInput] = useState(''), [files, setFiles] = useState([]), [busy, setBusy] = useState(false)
  const [err, setErr] = useState(''), [listening, setListening] = useState(false), [speaking, setSpeaking] = useState(false), [consent, setConsent] = useState(false)
  const [saved, setSaved] = useState({})
  const rec = useRef(null), end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy])
  useEffect(() => { if (loc.state?.q) send(loc.state.q); if (loc.state?.mic) mic() ; return () => { rec.current?.abort(); speechSynthesis.cancel() } }, [])
  async function addFiles(list) {
    setErr(''); const out = []
    for (const f of list) {
      if (!OK.includes(f.type)) { setErr(`${f.name}: only PNG, JPG or WebP images are allowed.`); continue }
      if (f.size > MAX) { setErr(`${f.name}: larger than 4 MB.`); continue }
      const url = await readB64(f); out.push({ name: f.name, mime: f.type, url, data: url.split(',')[1] })
    }
    setFiles(p => [...p, ...out].slice(0, 5))
  }
  async function send(text = input) {
    text = text.trim(); if (!text && !files.length) return
    if (files.length && !consent) return setErr('Please tick the consent box before sending images to the AI.')
    setErr(''); const next = [...msgs, { role: 'user', text, images: files }]
    setMsgs(next); setInput(''); setFiles([]); setBusy(true)
    const r = await askAI(next, lang); setMsgs(m => [...m, { role: 'model', text: r.text, demo: r.demo }]); setBusy(false)
  }
  function mic() {
    if (listening) return rec.current?.stop()
    if (!SR) return setErr('Voice input is not supported in this browser (try Chrome). You can type instead.')
    const r = new SR(); r.lang = LANGS[lang].speech; r.interimResults = true
    r.onresult = e => setInput(Array.from(e.results).map(x => x[0].transcript).join(''))
    r.onerror = e => { setErr(e.error === 'not-allowed' ? 'Microphone permission denied.' : `Voice error: ${e.error}`); setListening(false) }
    r.onend = () => setListening(false); rec.current = r; setErr(''); r.start(); setListening(true)
  }
  function speak(t) {
    if (!('speechSynthesis' in window)) return setErr('Text-to-speech not supported here.')
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/[*#•\[\]]/g, '')); u.lang = LANGS[lang].speech
    u.onend = u.onerror = () => setSpeaking(false); setSpeaking(true); speechSynthesis.speak(u)
  }
  async function saveImg(im, key) { try { const id = await saveDataUrl(im.url, im.name, 'Screenshot'); setDraft({ evidenceIds: [...(draft.evidenceIds || []), id] }); setSaved(s => ({ ...s, [key]: true })) } catch { setErr('Could not save to the Evidence Vault (browser storage unavailable).') } }
  const toChecker = () => { setDraft({ problem: msgs.filter(m => m.role === 'user').map(m => m.text).join(' ').slice(0, 1500), source: 'AI Assistant' }); nav('/violation-checker') }
  const toComplaint = () => { const users = msgs.filter(m => m.role === 'user').map(m => m.text).join(' '); setDraft({ problem: users.slice(0, 1500), source: 'AI Assistant' }); nav('/complaint-generator') }
  return (<main className="wrap chat">
    <h1>{t('title.a')}</h1>
    <p className="note">Voice and images use the same conversation. Voice &amp; reply language: <select className="mini" aria-label="Voice and reply language" value={lang} onChange={e => setLang(e.target.value)}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select> Never share OTPs, PINs or passwords.</p>
    <div className="msgs" aria-live="polite">
      {!msgs.length && <div className="card">Try: “Maine Amazon se phone order kiya, damaged aaya, seller refund nahi de raha.”</div>}
      {msgs.map((m, i) => <div key={i} className={'msg ' + m.role}>
        {m.images?.map((im, k) => <span key={k}><img src={im.url} alt={im.name} />{m.role === 'user' && <button className="btn ghost small" onClick={() => saveImg(im, k + '-' + i)}><FolderLock size={14} /> {saved[k + '-' + i] ? 'Saved ✓' : 'Save to Vault'}</button>}</span>)}
        <div className="txt">{m.text}</div>
        {m.role === 'model' && <div className="row small">{m.demo && <span className="tag">Demo – simulated</span>}
          <button className="icon" aria-label="Read aloud" onClick={() => speak(m.text)}><Volume2 size={16} /></button>
          <button className="icon" aria-label="Copy" onClick={() => navigator.clipboard?.writeText(m.text)}><Copy size={16} /></button></div>}
      </div>)}
      {busy && <div className="msg model"><span className="dots"><i /><i /><i /></span></div>}<div ref={end} />
    </div>
    {speaking && <button className="btn ghost" onClick={() => { speechSynthesis.cancel(); setSpeaking(false) }}><Square size={14} /> Stop speaking</button>}
    {msgs.length > 0 && <div className="row"><button className="btn ghost" onClick={toChecker}><Scale size={14} /> Check my rights</button><button className="btn ghost" onClick={toComplaint}><FileText size={14} /> Create complaint from this chat</button></div>}
    {files.length > 0 && <><div className="row">{files.map((f, i) => <span key={i} className="thumb"><img src={f.url} alt={f.name} /><button className="icon" aria-label="Remove" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={14} /></button></span>)}</div>
      <label className="note"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to send these images to the AI service for analysis (hide sensitive details first).</label></>}
    {err && <p className="err" role="alert">{err}</p>}
    {listening && <p className="note"><span className="wave"><i /><i /><i /><i /><i /></span> Listening… tap the mic to stop. Review the text, then press send.</p>}
    <div className="composer" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles([...e.dataTransfer.files]) }}>
      <label className="icon" aria-label="Attach images"><ImagePlus /><input hidden type="file" multiple accept={OK.join(',')} onChange={e => { addFiles([...e.target.files]); e.target.value = '' }} /></label>
      <button className={'icon' + (listening ? ' live' : '')} aria-label="Microphone" onClick={mic}>{listening ? <Square /> : <Mic />}</button>
      <textarea value={input} maxLength={2000} rows={2} onChange={e => setInput(e.target.value)} placeholder="Describe your problem…" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
      <button className="btn" disabled={busy} onClick={() => send()}><Send size={16} /></button></div></main>)
}
