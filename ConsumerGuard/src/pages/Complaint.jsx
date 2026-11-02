import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { useStore, useT } from '../store.jsx'
import { evAll, evPut } from '../lib/db.js'
const F = [['name', 'Your name'], ['company', 'Company / seller'], ['product', 'Product / service'], ['date', 'Purchase date', 'date'], ['amount', 'Amount paid (₹)', 'number'], ['ref', 'Order / reference no.']]
const REMEDY = ['Refund', 'Replacement', 'Repair', 'Compensation', 'Other']
export default function Complaint() {
  const t = useT()
  const { draft, addComplaint, clearDraft } = useStore()
  const [f, setF] = useState(() => ({ name: '', company: draft.company || '', product: draft.product || '', date: draft.date || '', amount: draft.amount || '', ref: '', problem: draft.problem || '', remedy: 'Refund' }))
  const [errs, setErrs] = useState({}), [letter, setLetter] = useState(''), [saved, setSaved] = useState(false), [ev, setEv] = useState([]), [sel, setSel] = useState(draft.evidenceIds || [])
  useEffect(() => { evAll().then(setEv).catch(() => {}) }, [])
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const chosen = ev.filter(e => sel.includes(e.id))
  function gen(e) {
    e.preventDefault(); const x = {}
    ;['name', 'company', 'product', 'problem'].forEach(k => { if (!f[k].trim()) x[k] = 'Required' })
    if (f.amount && +f.amount < 0) x.amount = 'Must be positive'
    if (f.date && new Date(f.date) > new Date()) x.date = 'Date cannot be in the future'
    setErrs(x); if (Object.keys(x).length) return
    const enc = chosen.length ? `\n\nEnclosures:\n${chosen.map((c, i) => `${i + 1}. ${c.name} (${c.category})`).join('\n')}` : ''
    setLetter(`To,\nThe Grievance Officer / Customer Care\n${f.company}\n\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nSubject: Complaint regarding ${f.product}${f.ref ? ` (Ref: ${f.ref})` : ''}\n\nDear Sir/Madam,\n\nI, ${f.name}, purchased ${f.product}${f.date ? ` on ${f.date}` : ''}${f.amount ? ` for ₹${f.amount}` : ''}.\n\n${f.problem}\n\nI request a ${f.remedy.toLowerCase()} within 15 days of receiving this letter. I have kept copies of the invoice, payments and communications. If the issue is not resolved, I may approach the National Consumer Helpline and the appropriate Consumer Commission under the Consumer Protection Act, 2019.\n\nPlease acknowledge this complaint in writing.\n\nYours faithfully,\n${f.name}${enc}`); setSaved(false)
  }
  const pdf = () => { const d = new jsPDF(); d.setFontSize(11); d.text(d.splitTextToSize(letter, 175), 18, 20); d.save('complaint-letter.pdf') }
  async function save() {
    const id = addComplaint({ company: f.company, product: f.product, letter, remedy: f.remedy, evidenceIds: sel })
    try { for (const c of chosen) await evPut({ ...c, complaintId: id }) } catch {} setSaved(true)
  }
  return (<main className="wrap"><h1>{t('title.c')}</h1>
    {draft.source && <p className="banner">Details were carried over from the <b>{draft.source}</b>. Please check every field before generating. <button className="link" onClick={() => { clearDraft(); setF({ ...f, company: '', product: '', date: '', amount: '', problem: '' }); setSel([]) }}>Clear carried-over data</button></p>}
    <form className="card form" onSubmit={gen} noValidate>
      {F.map(([k, l, t]) => <label key={k}>{l}<input type={t || 'text'} value={f[k]} onChange={set(k)} maxLength={200} />{errs[k] && <span className="err">{errs[k]}</span>}</label>)}
      <label className="full">Describe the problem<textarea rows={5} value={f.problem} onChange={set('problem')} maxLength={2000} />{errs.problem && <span className="err">{errs.problem}</span>}</label>
      <label className="full">Desired resolution<select value={f.remedy} onChange={set('remedy')}>{REMEDY.map(r => <option key={r}>{r}</option>)}</select></label>
      <div className="full"><b>Attach evidence from your Vault</b>{ev.length ? ev.map(e => <label key={e.id} className="check"><input type="checkbox" checked={sel.includes(e.id)} onChange={() => setSel(s => s.includes(e.id) ? s.filter(i => i !== e.id) : [...s, e.id])} /> {e.name} <small>({e.category})</small></label>) : <p className="note">No evidence saved yet. <Link to="/evidence-vault">Open the Evidence Vault</Link></p>}</div>
      <button className="btn">Generate letter</button></form>
    {letter && <div className="card"><h2>Your letter (editable)</h2><textarea rows={18} value={letter} onChange={e => setLetter(e.target.value)} />
      <div className="row"><button className="btn" onClick={pdf}>Download PDF</button><button className="btn ghost" onClick={() => navigator.clipboard?.writeText(letter)}>Copy</button><button className="btn ghost" onClick={save} disabled={saved}>{saved ? 'Saved ✓ (evidence linked)' : 'Save complaint'}</button></div>
      <p className="note">Template letter generated locally, not by AI and not legal advice. Evidence files are listed as enclosures but are not inside the PDF. Saved complaints stay in this browser.</p></div>}
  </main>)
}
