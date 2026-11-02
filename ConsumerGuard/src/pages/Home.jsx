import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mic, ImagePlus, Search, MessageSquare, Scale, FileText, FolderLock, MousePointerClick, ShieldAlert, Play } from 'lucide-react'
import { useStore, useT } from '../store.jsx'
import { startDemo, DEMO_Q } from '../lib/demo.js'
const TOOLS = [[MessageSquare, 'a', '/ai-assistant'], [Scale, 'v', '/violation-checker'], [FolderLock, 'e', '/evidence-vault'], [FileText, 'c', '/complaint-generator'], [MousePointerClick, 'd', '/dark-pattern-detector'], [ShieldAlert, 's', '/scam-alerts']]
const RES = [['National Consumer Helpline', 'https://consumerhelpline.gov.in/'], ['Department of Consumer Affairs', 'https://consumeraffairs.nic.in/'], ['Bureau of Indian Standards', 'https://www.bis.gov.in/'], ['National Cyber Crime Portal (helpline 1930)', 'https://cybercrime.gov.in/']]
const M = ['Refunds', 'Replacements', 'Hidden fees', 'UPI fraud', 'Fake delivery SMS', 'Dark patterns', 'Warranty claims', 'Consumer court', 'Evidence']
const W = (s, o = 0) => s.split(' ').flatMap((w, i) => [<span className="w" key={i} style={{ '--i': i + o }}><span>{w}</span></span>, ' '])
const tilt = e => { const r = e.currentTarget.getBoundingClientRect(), s = e.currentTarget.style; s.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 9 + 'deg'); s.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 12 + 'deg') }
const Receipt = () => (<div className="tilt"><div className="receipt" aria-hidden="true"><b>QUICKCART · ORDER 48213</b>
  <div className="ln"><span>Phone (arrived damaged)</span><span>₹14,999</span></div><div className="ln"><span>Delivery</span><span>₹0</span></div>
  <div className="ln"><span><mark className="m1">Handling fee</mark></span><span>₹499</span></div><div className="ln"><span><mark className="m2">Convenience fee</mark></span><span>₹199</span></div>
  <hr /><div className="ln tot"><span>Total</span><span>₹15,697</span></div><div className="stamp">Refund due</div></div></div>)
export default function Home() {
  const [q, setQ] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''); const nav = useNavigate(); const t = useT(); const st = useStore()
  const go = e => { e.preventDefault(); nav('/ai-assistant', { state: { q: q.trim() } }) }
  const demo = async () => { setBusy(true); setErr(''); try { await startDemo(st); nav('/ai-assistant', { state: { q: DEMO_Q } }) } catch { setErr('Demo data could not be saved (browser storage is blocked, e.g. private mode).') } setBusy(false) }
  return (<main>
    <section className="hero" onPointerMove={tilt}><div className="wrap hero-in"><div className="hero-copy"><h1>{W(t('hero1'))}<br />{W(t('hero2'), 2)}</h1><p>{t('heroP')}</p>
      <form onSubmit={go} className="search"><Search size={18} /><input value={q} maxLength={500} onChange={e => setQ(e.target.value)} placeholder={t('ph')} aria-label={t('ph')} /><button className="btn">{t('help')}</button></form>
      <div className="row"><Link className="btn ghost" to="/ai-assistant" state={{ mic: true }}><Mic size={16} /> {t('speak')}</Link><Link className="btn ghost" to="/ai-assistant"><ImagePlus size={16} /> {t('upload')}</Link><Link className="btn ghost" to="/violation-checker">{t('rights')}</Link>
        <button className="btn" disabled={busy} onClick={demo}><Play size={16} /> {t('demo')}</button></div>{err && <p className="err">{err}</p>}</div><Receipt /></div></section>
    <div className="marq" aria-hidden="true"><div>{[...M, ...M].map((m, i) => <span key={i}>{m}</span>)}</div></div>
    <section className="wrap"><h2>{t('toolkit')}</h2><div className="grid tools">{TOOLS.map(([I, k, p]) => <Link key={p} className="card" to={p}><span className="ico"><I size={22} /></span><b>{t('nav.' + k)}</b><small>{t('desc.' + k)}</small></Link>)}</div>
      <h2>How it works</h2><div className="steps">{[['Ask', 'Describe the problem or upload a screenshot.'], ['Check', 'See which rights may apply.'], ['Save', 'Keep your evidence in the Vault.'], ['Complain', 'Download your complaint letter.']].map(([a, b], i) => <div key={a} className="step"><span className="num">{i + 1}</span><b>{a}</b><small>{b}</small></div>)}</div>
      <h2>{t('res')}</h2><div className="grid">{RES.map(([n, u]) => <a key={u} className="card" href={u} target="_blank" rel="noreferrer noopener"><b>{n}</b><small>{u}</small></a>)}</div></section></main>)
}
