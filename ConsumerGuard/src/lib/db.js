// Evidence storage: IndexedDB in THIS browser only. Files are not uploaded anywhere and not encrypted.
const open = () => new Promise((res, rej) => { const r = indexedDB.open('consumerguard', 1); r.onupgradeneeded = () => r.result.createObjectStore('ev', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
const tx = async (mode, fn) => { const d = await open(); return new Promise((res, rej) => { const t = d.transaction('ev', mode); const q = fn(t.objectStore('ev')); t.oncomplete = () => res(q.result); t.onerror = () => rej(t.error) }) }
export const evAll = () => tx('readonly', s => s.getAll())
export const evPut = e => tx('readwrite', s => s.put(e))
export const evDel = id => tx('readwrite', s => s.delete(id))
export const EV_CATS = ['Bill / Invoice', 'Payment receipt', 'Screenshot', 'Email', 'Product photo', 'Warranty card', 'Other']
export async function saveBlob(blob, name, category = 'Screenshot', note = '') {
  const id = crypto.randomUUID(); await evPut({ id, name, type: blob.type, size: blob.size, category, note, addedAt: new Date().toISOString(), complaintId: null, blob }); return id
}
export const saveDataUrl = async (url, name, category) => saveBlob(await (await fetch(url)).blob(), name, category)
