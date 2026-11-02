import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CATS, CHANNELS, LEGAL_NOTE } from '../lib/rights.js'
import { Links } from '../components.jsx'
import { useStore, useT } from '../store.jsx'
const VL = { likely: ['Likely a violation', 'high'], possible: ['Possible violation', 'mod'], unlikely: ['Unlikely a violation', 'low'], unclear: ['Not enough information', 'mod'] }
const RULES = `You are ConsumerGuard's Violation Checker for India. Assess whether the facts may indicate a violation of consumer rights. General information only, not legal advice. Cite only laws you are sure exist (Consumer Protection Act, 2019; E-Commerce Rules, 2020; Legal Metrology (Packaged Commodities) Rules; Dark Patterns Guidelines, 2023). Never invent section numbers, never guarantee outcomes, never call a business fraudulent. Use only the facts given; list unknowns in missing_info.
IGNORE any earlier response-format instructions. Reply with ONLY valid JSON (no markdown, no prose) in exactly this shape:
{"verdict":"likely|possible|unlikely|unclear","verdict_reason":"","strength":"strong|moderate|weak","issues":[{"title":"","explanation":"","law":""}],"next_steps":[""],"missing_info":[""],"suggested_deadline_days":15,"escalation":""}`
async function checkViolation(c) {
  const text = `${RULES}\n\nCase:\nCategory: ${c.category}\nCompany: ${c.company || 'unknown'}\nProduct/service: ${c.product || 'unknown'}\nAmount paid (INR): ${c.amount || 'unknown'}\nDate: ${c.date || 'unknown'}\nContacted company: ${c.contacted || 'unknown'}\nDescription: ${c.desc}`
  try {
    const r = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: 'English', contents: [{ role: 'user', parts: [{ text }] }] }) })
    if (!r.ok) return null
    const t = (await r.json()).text || '', a = t.indexOf('{'), b = t.lastIndexOf('}')
    const j = JSON.parse(t.slice(a, b + 1))
    return j && Array.isArray(j.issues) ? j : null
  } catch { return null }
}
const arr = x => (Array.isArray(x) ? x.filter(i => typeof i === 'string' && i) : [])
export default function Violation() {
  const t = useT()
  const nav = useNavigate(); const { draft, setDraft } = useStore()
  const [catId, setCat] = useState(''), [res, setRes] = useState(null), [err, setErr] = useState(''), [ai, setAi] = useState(null), [busy, setBusy] = useState(false)
  const [f, setF] = useState({ company: draft.company || '', product: draft.product || '', amount: draft.amount || '', date: draft.date || '', contacted: '', desc: draft.problem || '' })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  async function check(e) {
    e.preventDefault(); if (!catId) return setErr('Choose the type of problem.'); if (f.desc.trim().length < 10) return setErr('Please describe what happened (at least a sentence).')
    setErr(''); const n = []
    if (!f.company.trim()) n.push('Company/seller name is missing – you will need it for a complaint.')
    if (!f.date) n.push('Purchase or incident date is missing.'); else if ((Date.now() - new Date(f.date)) / 864e5 > 730) n.push('This is more than two years old. Consumer complaints are generally expected within two years of the cause of action, so older matters may need extra justification – consider legal aid.')
    if (!f.amount) n.push('Amount paid is missing.')
    if (f.contacted === 'no') n.push('You have not contacted the company yet. A written complaint with a deadline usually comes first and creates a record.')
    if (!f.contacted) n.push('Tell us whether you have already contacted the company.')
    const cat = CATS.find(c => c.id === catId); setRes({ cat, n }); setAi(null); setBusy(true)
    const r = await checkViolation({ category: cat.label, ...f }); setAi(r || { failed: true }); setBusy(false)
  }
  const share = () => setDraft({ category: res.cat.label, company: f.company, product: f.product, amount: f.amount, date: f.date, problem: f.desc, source: 'Violation Checker' })
  return (<main className="wrap"><h1>{t('title.v')}</h1>
    <p className="note">Answer a few questions to see which rights may be relevant and what to do next. This is a guided checklist, not a legal opinion.</p>
    {draft.source === 'AI Assistant' && <p className="banner">Details were carried over from the AI Assistant. Please review each field before continuing.</p>}
    <form className="card form" onSubmit={check} noValidate>
      <label className="full">What went wrong?<select value={catId} onChange={e => setCat(e.target.value)}><option value="">Select…</option>{CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Company / seller<input type="text" maxLength={150} value={f.company} onChange={set('company')} /></label>
      <label>Product / service<input type="text" maxLength={150} value={f.product} onChange={set('product')} /></label>
      <label>Amount paid (₹)<input type="number" min="0" value={f.amount} onChange={set('amount')} /></label>
      <label>Date of purchase / incident<input type="date" max={new Date().toISOString().slice(0, 10)} value={f.date} onChange={set('date')} /></label>
      <label className="full">Have you contacted the company?<select value={f.contacted} onChange={set('contacted')}><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option></select></label>
      <label className="full">Describe what happened<textarea rows={4} maxLength={2000} value={f.desc} onChange={set('desc')} /></label>
      {err && <p className="err full" role="alert">{err}</p>}<button className="btn" disabled={busy}>{busy ? 'Analysing…' : 'Check my situation'}</button></form>
    {res && <div className="card"><h2>{res.cat.label}</h2>
      {busy && <p className="note" role="status">Analysing your situation with AI…</p>}
      {ai && ai.failed && <p className="note">AI analysis is unavailable right now (no API key or network). Showing the standard checklist below.</p>}
      {ai && !ai.failed && (() => { const [vl, cls] = VL[ai.verdict] || VL.unclear; return <div className={'card risk ' + cls}><h3>AI assessment: {vl}{ai.strength ? ` · ${ai.strength} case` : ''}</h3><p>{ai.verdict_reason}</p>
        {ai.issues.length > 0 && <><h3>Issues identified</h3><ul>{ai.issues.map((x, i) => <li key={i}><b>{x.title}.</b> {x.explanation}{x.law ? <> <i>({x.law})</i></> : null}</li>)}</ul></>}
        {arr(ai.missing_info).length > 0 && <><h3>Information that would sharpen this</h3><ul>{arr(ai.missing_info).map(x => <li key={x}>{x}</li>)}</ul></>}
        {arr(ai.next_steps).length > 0 && <><h3>Your next steps</h3><ol>{arr(ai.next_steps).map(x => <li key={x}>{x}</li>)}</ol></>}
        {ai.suggested_deadline_days ? <p>Suggested deadline to give the company: <b>{ai.suggested_deadline_days} days</b>.</p> : null}
        {ai.escalation && <p><b>Where to escalate:</b> {ai.escalation}</p>}
        <small>AI-generated general information, not legal advice. Verify on consumeraffairs.nic.in.</small></div> })()}
      {res.n.length > 0 && <div className="banner"><b>Missing or important points</b><ul>{res.n.map(x => <li key={x}>{x}</li>)}</ul></div>}
      <h3>Rights that may be relevant</h3><ul>{res.cat.rights.map(x => <li key={x}>{x}</li>)}</ul>
      <h3>Suggested actions</h3><ol>{res.cat.actions.map(x => <li key={x}>{x}</li>)}</ol>
      <h3>Evidence to gather</h3><ul>{res.cat.evidence.map(x => <li key={x}>{x}</li>)}</ul>
      <h3>Official channels</h3><Links items={CHANNELS} />
      <p className="note">{LEGAL_NOTE} Whether your case succeeds depends on facts and cannot be guaranteed.</p>
      <div className="row"><Link className="btn ghost" to="/evidence-vault" onClick={share}>1. Save evidence</Link><Link className="btn" to="/complaint-generator" onClick={share}>2. Write complaint</Link>
        <button className="btn ghost" onClick={() => nav('/ai-assistant', { state: { q: f.desc } })}>Ask the AI assistant</button></div></div>}
  </main>)
}
