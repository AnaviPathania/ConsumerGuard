import { useNavigate } from 'react-router-dom'
import { useStore } from './store.jsx'
import { removeDemo, DEMO_Q } from './lib/demo.js'
const S = [
  ['/ai-assistant', 'AI Assistant', 'The sample question is sent for you. With a Gemini key you get a LIVE answer; without one you see a labelled DEMO reply. Voice and image upload work here too.', { q: DEMO_Q }],
  ['/violation-checker', 'Violation Checker', 'Choose "Defective or damaged product". The form is prefilled from the demo case. This step is rule-based (works offline).'],
  ['/evidence-vault', 'Evidence Vault', 'Two [DEMO] sample images were saved in this browser. Try uploading, recategorising and deleting. Real local storage.'],
  ['/complaint-generator', 'Complaint Generator', 'Enter your name, tick the demo evidence, generate the letter and download the PDF. Local template, not AI.'],
  ['/scam-alerts', 'Scam Centre', 'Paste: "Your KYC will expire today, click bit.ly/abc and share OTP". Rule-based warning signs; the AI panel needs a key.'],
  ['/dark-pattern-detector', 'Dark Pattern Detector', 'Tick a few patterns to see the risk level. Rule-based; the AI panel needs a key.']]
export default function Tour() {
  const { tour, setTour, dropDemo } = useStore(); const nav = useNavigate()
  if (tour === null) return null
  const go = n => { setTour(n); nav(S[n][0], { state: S[n][3] }) }
  const exit = async () => { await removeDemo(); dropDemo(); nav('/') }
  return (<aside className="tour" role="region" aria-label="Demo tour"><i className="bar" style={{ '--p': (tour + 1) / S.length }} /><span className="tag">DEMO DATA · fictional</span>
    <b>Step {tour + 1}/{S.length}: {S[tour][1]}</b><small>{S[tour][2]}</small>
    <div className="row"><button className="btn ghost small" onClick={() => go(tour)}>Go to this step</button>
      {tour > 0 && <button className="btn ghost small" onClick={() => go(tour - 1)}>Back</button>}{tour < S.length - 1 && <button className="btn small" onClick={() => go(tour + 1)}>Next</button>}
      <button className="btn ghost small" onClick={exit}>Exit & remove demo data</button></div></aside>)
}
