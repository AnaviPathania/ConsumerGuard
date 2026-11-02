import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { Shield, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore, useT } from './store.jsx'
import Tour from './Tour.jsx'
import Home from './pages/Home.jsx'
import Assistant from './pages/Assistant.jsx'
import Complaint from './pages/Complaint.jsx'
import Violation from './pages/Violation.jsx'
import Vault from './pages/Vault.jsx'
import DarkPatterns from './pages/DarkPatterns.jsx'
import Scams from './pages/Scams.jsx'
const NAV = [['/ai-assistant', 'a'], ['/violation-checker', 'v'], ['/evidence-vault', 'e'], ['/complaint-generator', 'c'], ['/dark-pattern-detector', 'd'], ['/scam-alerts', 's']]
export default function App() {
  const t = useT(); const [open, setOpen] = useState(false); const loc = useLocation()
  useEffect(() => { // staggered scroll reveal for static content on each page
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 })
    document.querySelectorAll('main h2,main .grid>*,main .steps>*,main form.card').forEach((el, i) => { if (el.closest('.hero')) return; el.classList.add('rv'); el.style.setProperty('--d', (i % 6) * 70 + 'ms'); io.observe(el) })
    return () => io.disconnect()
  }, [loc.pathname])
  useEffect(() => { // cursor-follow spotlight on cards
    const m = e => { const c = e.target.closest?.('.card'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px') }
    document.addEventListener('pointermove', m); return () => document.removeEventListener('pointermove', m)
  }, [])
  return (<>
    <header className="nav"><Link to="/" className="brand"><Shield size={22} /> ConsumerGuard</Link>
      <button className="icon menu" aria-label="Menu" onClick={() => setOpen(!open)}><Menu /></button>
      <nav className={open ? 'open' : ''} onClick={() => setOpen(false)}>{NAV.map(([p, k]) => <NavLink key={p} to={p}>{t('nav.' + k)}</NavLink>)}</nav></header>
    <Routes><Route path="/" element={<Home />} /><Route path="/ai-assistant" element={<Assistant />} /><Route path="/complaint-generator" element={<Complaint />} />
      <Route path="/violation-checker" element={<Violation />} /><Route path="/evidence-vault" element={<Vault />} /><Route path="/dark-pattern-detector" element={<DarkPatterns />} /><Route path="/scam-alerts" element={<Scams />} />
      <Route path="*" element={<main className="wrap"><h1>404 – Page not found</h1><Link className="btn" to="/">Go home</Link></main>} /></Routes>
    <Tour /><footer className="foot">{t('footer')}</footer></>)
}
