import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, Trash2, Upload } from 'lucide-react'
import { evAll, evPut, evDel, saveBlob, EV_CATS } from '../lib/db.js'
import { useStore, useT } from '../store.jsx'
const OK = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'], MAX = 5 * 1024 * 1024
function Thumb({ e }) {
  const [u, setU] = useState(''); useEffect(() => { const x = URL.createObjectURL(e.blob); setU(x); return () => URL.revokeObjectURL(x) }, [e])
  return e.type === 'application/pdf' ? <a className="pdf" href={u} target="_blank" rel="noreferrer"><FileText size={32} />Open PDF</a> : <img src={u} alt={e.name} />
}
export default function Vault() {
  const t = useT()
  const { complaints, draft, setDraft } = useStore()
  const [items, setItems] = useState(null), [cat, setCat] = useState(EV_CATS[0]), [filter, setFilter] = useState(''), [q, setQ] = useState(''), [err, setErr] = useState(''), [usage, setUsage] = useState('')
  const load = () => evAll().then(a => setItems(a.sort((x, y) => y.addedAt.localeCompare(x.addedAt)))).catch(() => { setItems([]); setErr('Browser storage is unavailable (private mode or blocked). Evidence cannot be saved here.') })
  useEffect(() => { load(); navigator.storage?.estimate?.().then(s => setUsage(`${(s.usage / 1048576).toFixed(1)} MB used of about ${(s.quota / 1048576).toFixed(0)} MB available`)) }, [])
  async function upload(list) {
    setErr(''); navigator.storage?.persist?.(); const ids = []
    for (const f of list) {
      if (!OK.includes(f.type)) { setErr(`${f.name}: only PNG, JPG, WebP or PDF files are allowed.`); continue }
      if (f.size > MAX) { setErr(`${f.name}: larger than 5 MB.`); continue }
      try { ids.push(await saveBlob(f, f.name.slice(0, 120), cat)) } catch { setErr('Saving failed – storage may be full.') }
    }
    if (ids.length) setDraft({ evidenceIds: [...(draft.evidenceIds || []), ...ids] }); load()
  }
  const recat = async (e, c) => { await evPut({ ...e, category: c }); load() }
  const del = async e => { if (confirm(`Delete "${e.name}" permanently from this browser?`)) { await evDel(e.id); load() } }
  const shown = (items || []).filter(e => (!filter || e.category === filter) && (!q || e.name.toLowerCase().includes(q.toLowerCase())))
  const cName = id => complaints.find(c => c.id === id)?.company
  return (<main className="wrap"><h1>{t('title.e')}</h1>
    <div className="banner"><b>How storage works:</b> files are saved only inside this browser on this device (IndexedDB). They are not uploaded to any server and are not encrypted. Clearing browser data, using private mode or switching device removes or hides them, so keep a backup of important files. Limit 5 MB per file.</div>
    <div className="card" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload([...e.dataTransfer.files]) }}>
      <div className="row"><select aria-label="Category for new files" value={cat} onChange={e => setCat(e.target.value)}>{EV_CATS.map(c => <option key={c}>{c}</option>)}</select>
        <label className="btn"><Upload size={16} /> Add files<input hidden type="file" multiple accept={OK.join(',')} onChange={e => { upload([...e.target.files]); e.target.value = '' }} /></label><small>or drag and drop. Original files are stored unchanged.</small></div>
      {err && <p className="err" role="alert">{err}</p>}{usage && <small>{usage}</small>}</div>
    <div className="row"><input type="text" placeholder="Search file name" value={q} onChange={e => setQ(e.target.value)} /><select aria-label="Filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="">All categories</option>{EV_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
    {items === null ? <p>Loading…</p> : !shown.length ? <div className="card">{items.length ? 'No files match.' : 'No evidence saved yet. Add bills, receipts, screenshots, emails or product photos above.'}</div> :
      <div className="grid">{shown.map(e => <div key={e.id} className="card"><Thumb e={e} /><b className="clip">{e.name}</b><small>{new Date(e.addedAt).toLocaleString('en-IN')} · {(e.size / 1024).toFixed(0)} KB</small>
        <select aria-label="Category" value={e.category} onChange={ev => recat(e, ev.target.value)}>{EV_CATS.map(c => <option key={c}>{c}</option>)}</select>
        <small>{e.complaintId ? `Linked to complaint: ${cName(e.complaintId) || 'saved complaint'}` : 'Not linked to a complaint yet'}</small>
        <div className="row"><a className="icon" aria-label="Download" href={URL.createObjectURL(e.blob)} download={e.name}><Download size={16} /></a><button className="icon" aria-label="Delete" onClick={() => del(e)}><Trash2 size={16} /></button></div></div>)}</div>}
    <Link className="btn" to="/complaint-generator">Continue to complaint →</Link></main>)
}
