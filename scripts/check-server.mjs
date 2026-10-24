// Dev helper: a Vite dev server for checks, separate from the owner's `pnpm dev` on 5173.
// Usage: node scripts/check-server.mjs <cacheDir> [port]   (default port 5199)
// Stop it by PID when done (never with `pkill -f`, which can match your own shell).
import { createServer } from 'vite'

const [cacheDir, port = '5199'] = process.argv.slice(2)
if (!cacheDir) throw new Error('Pass a cache dir outside the repo, for example your scratch dir')
const server = await createServer({ cacheDir, server: { port: Number(port), strictPort: true } })
await server.listen()
console.log(`ready on http://localhost:${port}, pid ${process.pid}`)
