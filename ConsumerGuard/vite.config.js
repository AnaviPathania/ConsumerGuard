import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Dev-only middleware so /api/gemini works under `npm run dev`. In production use Vercel (api/ folder).
const devApi = (env) => ({ name: 'dev-api', configureServer(s) {
  s.middlewares.use('/api/gemini', (req, res) => {
    let b = ''; req.on('data', c => (b += c)); req.on('end', async () => {
      Object.assign(process.env, env)
      req.body = b ? JSON.parse(b) : {}
      res.status = c => { res.statusCode = c; return res }
      res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)) }
      const { default: h } = await s.ssrLoadModule('/api/gemini.js'); await h(req, res)
    })
  })
}})
export default defineConfig(({ mode }) => ({ plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))] }))
