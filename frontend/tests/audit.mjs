// UI audit: every page x 5 widths, logged out and in. Checks sideways scroll, elements spilling
// out of the screen and axe accessibility rules. Needs `npm run dev` and `npm run mock-api` running.
import { chromium } from 'playwright'
import { readFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const B = 'http://localhost:5173', API = 'http://localhost:8000', out = new URL('./shots/audit-', import.meta.url).pathname
mkdirSync(new URL('./shots/', import.meta.url), { recursive: true })
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const WIDTHS = [320, 390, 768, 1024, 1440]
const PAGES = [['/', 'home'], ['/cursos', 'cursos'], ['/cursos/2', 'curso-longo'], ['/aulas/201', 'aula-longa'], ['/perfil', 'perfil'],
  ['/login', 'login'], ['/cadastro', 'cadastro'], ['/recuperar-senha', 'recuperar'], ['/xyz', '404']]
const problems = new Set()

const post = (path, body, token) => fetch(API + path, { method: 'POST', body: body && JSON.stringify(body), headers: token ? { Authorization: `Bearer ${token}` } : {} })
const { token } = await (await post('/register', { name: 'Maria Eduarda dos Santos Albuquerque', email: `audit${Date.now()}@t.dev`, password: 'Senha123!' })).json()
for (const id of [1, 2]) await post(`/courses/${id}/watchlist`, null, token)
await post('/lessons/201/complete', null, token)

const browser = await chromium.launch()
for (const logged of [false, true]) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
    if (logged) await ctx.addInitScript((t) => sessionStorage.setItem('guacamole.token', t), token)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => problems.add(`JS error ${e.message}`))
    for (const [path, name] of PAGES) {
      await page.goto(B + path); await page.evaluate(() => document.fonts.ready)
      await page.waitForFunction(() => !document.body.innerText.match(/> (buscando|abrindo|listando|carregando)/), null, { timeout: 8000 })
        .catch(() => problems.add(`${name}@${w}: still loading after 8s`))
      const where = `${logged ? 'in' : 'out'} ${name}@${w}`
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth, bad = []
        if (document.documentElement.scrollWidth > vw) bad.push(`page scrolls sideways (${document.documentElement.scrollWidth}px > ${vw}px)`)
        for (const el of document.querySelectorAll('main *, header *, aside *, footer *')) {
          const b = el.getBoundingClientRect()
          if (!b.width || getComputedStyle(el).position === 'absolute' || el.closest('[aria-hidden=true]')) continue
          if (b.right > vw + 1 || b.left < -1) bad.push(`<${el.tagName.toLowerCase()}> "${(el.textContent || '').trim().slice(0, 30)}" spills out (${Math.round(b.left)}..${Math.round(b.right)})`)
        }
        return [...new Set(bad)].slice(0, 4)
      })
      r.forEach((x) => problems.add(`${where}: ${x}`))
      if (w === 390 || w === 1440) {
        await page.addScriptTag({ content: AXE })
        const v = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] })).violations
          .map((v) => `${v.id}: ${v.nodes.length}x ${v.nodes[0].target.join(' ')} | ${v.nodes[0].failureSummary?.split('\n')[1]?.trim()}`))
        v.forEach((x) => problems.add(`axe ${logged ? 'in' : 'out'} ${name}: ${x}`))
        await page.screenshot({ path: `${out}${logged ? 'in' : 'out'}-${name}-${w}.png`, fullPage: true })
      }
    }
    await ctx.close()
  }
}
await browser.close()
console.log(problems.size ? [...problems].join('\n') : 'no problems found')
process.exitCode = problems.size ? 1 : 0
