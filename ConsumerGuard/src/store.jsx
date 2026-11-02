import { createContext, useContext, useEffect, useState } from 'react'
import { T } from './lib/dict.js'
const Ctx = createContext(null)
const load = (s, k, d) => { try { return JSON.parse(s.getItem(k)) ?? d } catch { return d } }
export function StoreProvider({ children }) {
  const [lang, setLang] = useState(() => load(localStorage, 'cg.lang', 'en'))
  const [complaints, setComplaints] = useState(() => load(localStorage, 'cg.complaints', []))
  const [draft, setD] = useState(() => load(sessionStorage, 'cg.draft', {}))
  const [tour, setTour] = useState(() => load(sessionStorage, 'cg.tour', null)) // demo tour step or null
  useEffect(() => { localStorage.setItem('cg.lang', JSON.stringify(lang)); document.documentElement.lang = lang }, [lang])
  useEffect(() => localStorage.setItem('cg.complaints', JSON.stringify(complaints)), [complaints])
  useEffect(() => sessionStorage.setItem('cg.draft', JSON.stringify(draft)), [draft])
  useEffect(() => sessionStorage.setItem('cg.tour', JSON.stringify(tour)), [tour])
  const setDraft = o => setD(d => ({ ...d, ...o })), clearDraft = () => setD({})
  const addComplaint = c => { const id = crypto.randomUUID(); setComplaints(p => [{ id, status: 'Draft', createdAt: new Date().toISOString(), ...c }, ...p]); return id }
  const dropDemo = () => { setComplaints(p => p.filter(c => !c.demo)); setD(d => d.source === 'Demo' ? {} : d); setTour(null) }
  return <Ctx.Provider value={{ lang, setLang, complaints, addComplaint, draft, setDraft, clearDraft, tour, setTour, dropDemo }}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)
export const useT = () => { const { lang } = useStore(); return k => T[lang]?.[k] ?? T.en[k] ?? k }
