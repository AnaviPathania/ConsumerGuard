import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CATS, CHANNELS, LEGAL_NOTE } from '../lib/rights.js'
import { Links } from '../components.jsx'
import { useStore, useT } from '../store.jsx'
export default function Violation() {
  const t = useT()
  const nav = useNavigate(); const { draft, setDraft } = useStore()
  const [catId, setCat] = useState(''), [res, setRes] = useState(null), [err, setErr] = useState('')
  const [f, setF] = useState({ company: draft.company || '', product: draft.product || '', amount: draft.amount || '', date: draft.date || '', contacted: '', desc: draft.problem || '' })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  function check(e) {
    e.preventDefault(); if (!catId) return setErr('Choose the type of problem.'); if (f.desc.trim().length < 10) return setErr('Please describe what happened (at least a sentence).')
    setErr(''); const n = []
    if (!f.company.trim()) n.push('Company/seller name is missing – you will need it for a complaint.')
    if (!f.date) n.push('Purchase or incident date is missing.'); else if ((Date.now() - new Date(f.date)) / 864e5 > 730) n.push('This is more than two years old. Consumer complaints are generally expected within two years of the cause of action, so older matters may need extra justification – consider legal aid.')
    if (!f.amount) n.push('Amount paid is missing.')
    if (f.contacted === 'no') n.push('You have not contacted the company yet. A written complaint with a deadline usually comes first and creates a record.')
    if (!f.contacted) n.push('Tell us whether you have already contacted the company.')
    setRes({ cat: CATS.find(c => c.id === catId), n })
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
      {err && <p className="err full" role="alert">{err}</p>}<button className="btn">Check my situation</button></form>
    {res && <div className="card"><h2>{res.cat.label}</h2>
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
