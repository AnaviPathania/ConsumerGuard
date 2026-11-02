import { useState } from 'react'
import { AiPanel, Links } from '../components.jsx'
const P = [['hidden', 'Extra fees appeared only at the final payment step', 3, 'Drip pricing / hidden charges: the true price is not shown upfront.'], ['urgency', 'Countdown timer or "only 2 left" pressure', 2, 'False urgency can rush you before you compare. Reload to see if the timer resets.'], ['presel', 'Add-ons or subscriptions were pre-ticked', 3, 'Pre-selected extras make you pay unless you notice and untick them.'], ['discount', '"Discount" measured from a very high crossed-out price', 2, 'The reference price may not be a real selling price. Compare with other sellers.'], ['cancel', 'Easy to sign up but hard to cancel', 3, 'Cancellation should not be harder than joining.'], ['shame', 'Decline button uses guilt wording ("No, I hate saving money")', 1, 'Confirm-shaming steers choices with emotion.'], ['sneak', 'Items were added to the basket without my action', 3, 'Basket sneaking adds products or charges you did not choose.'], ['trial', 'Free trial turns into a paid plan without clear notice', 3, 'Forced continuity: you are charged after the trial unless you cancel.']]
const LV = [['None selected', 'low'], ['Low concern', 'low'], ['Moderate concern', 'mod'], ['High concern', 'high']]
import { useT } from '../store.jsx'
export default function DarkPatterns() {
  const t = useT()
  const [sel, setSel] = useState([]), [desc, setDesc] = useState('')
  const hits = P.filter(p => sel.includes(p[0])), score = hits.reduce((a, p) => a + p[2], 0)
  const lv = !score ? 0 : score >= 6 ? 3 : score >= 3 ? 2 : 1, [label, cls] = LV[lv]
  return (<main className="wrap"><h1>{t('title.d')}</h1>
    <p className="note">Tick what you noticed. The assessment is based only on what you report. It is not proof that a business acted unlawfully.</p>
    <div className="card">{P.map(p => <label key={p[0]} className="check"><input type="checkbox" checked={sel.includes(p[0])} onChange={() => setSel(s => s.includes(p[0]) ? s.filter(i => i !== p[0]) : [...s, p[0]])} /> {p[1]}</label>)}</div>
    <div className={'card risk ' + cls}><h2>{label}</h2><div className="meter" data-l={lv} role="img" aria-label={`Severity ${lv} of 3`}><i /><i /><i /></div>
      {hits.length ? <><ul>{hits.map(p => <li key={p[0]}><b>{p[1]}.</b> {p[3]}</li>)}</ul><h3>How to protect yourself</h3><ul><li>Screenshot every checkout step and the final price.</li><li>Do not pay if the total changes unexpectedly; untick add-ons before paying.</li><li>Note how to cancel before you subscribe.</li><li>Report persistent cases to the National Consumer Helpline.</li></ul></> : <p>Select anything that matched your experience.</p>}
      <small>The Guidelines for Prevention and Regulation of Dark Patterns, 2023 describe such practices; confirm the text on consumeraffairs.nic.in.</small><Links items={[['National Consumer Helpline', 'https://consumerhelpline.gov.in/'], ['Department of Consumer Affairs', 'https://consumeraffairs.nic.in/']]} /></div>
    <div className="card"><label className="full">Describe the website or experience (optional)<textarea rows={3} maxLength={2000} value={desc} onChange={e => setDesc(e.target.value)} /></label></div>
    <AiPanel text={`Patterns the user ticked: ${hits.map(p => p[1]).join('; ') || 'none'}\n${desc}`} instruction="Analyse this website experience or screenshot for possible dark patterns (hidden charges, fake urgency, pre-selected subscriptions, misleading discounts, difficult cancellation). Separate what is visible from your interpretation. Do not call the business fraudulent. Explain why each point may be misleading and give protective steps." />
  </main>)
}
