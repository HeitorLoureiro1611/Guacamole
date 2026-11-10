// End-to-end user flow. Needs `npm run dev` and `npm run mock-api` running.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'

const B = 'http://localhost:5173', out = new URL('./shots/', import.meta.url).pathname
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = [], EMAIL = `ana${Date.now()}@teste.dev`
page.on('pageerror', (e) => errors.push(e.message))
page.on('response', (r) => r.status() >= 400 && errors.push(r.status() + ' ' + r.url()))
const shot = (n) => page.screenshot({ path: out + n + '.png', fullPage: true })
const step = (s) => console.log('✓', s)

await page.goto(B + '/'); await page.waitForSelector('text=Python 3 Mundo 1'); await shot('app-home'); step('home lists courses')
await page.goto(B + '/perfil'); await page.waitForURL('**/login'); step('perfil without login -> /login')

await page.click('text=Criar conta'); await page.waitForURL('**/cadastro')
await page.fill('input[name=nome]', 'Ana Souza'); await page.fill('input[name=email]', EMAIL)
await page.fill('input[name=senha]', 'Senha123!'); await page.fill('input[name=confirmar]', 'Senha123!')
await page.check('input[name=termos]'); await page.click('button[type=submit]')
await page.waitForURL('**/cursos'); await page.waitForSelector('text=página 1 de 2'); await shot('app-cursos'); step('register -> /cursos with pagination')

await page.click('text=próxima →'); await page.waitForURL('**/cursos?page=2'); await page.waitForSelector('text=Photoshop'); step('pagination page 2')
await page.goBack(); await page.waitForSelector('text=Python 3 Mundo 1')

await page.click('text=Python 3 Mundo 1'); await page.waitForURL('**/cursos/1'); await page.waitForSelector('text=Aula 5 - Repetições')
await page.click('text=+ Salvar curso'); await page.waitForSelector('text=✓ Salvo'); await shot('app-curso'); step('course detail + save')

await page.click('text=Começar curso →'); await page.waitForURL('**/aulas/101'); await page.waitForSelector('iframe')
await page.click('text=Concluir e próxima →'); await page.waitForURL('**/aulas/102')
await page.waitForSelector('text=(1/5)'); await shot('app-aula'); step('lesson complete + next, sidebar 1/5')

await page.click('text=Perfil'); await page.waitForURL('**/perfil'); await page.waitForSelector('text=Olá,')
assert.match(await page.textContent('main'), /Ana/); await page.waitForSelector('text=1 de 5 aulas'); await shot('app-perfil'); step('perfil shows name + progress')

await page.goto(B + '/cursos/1'); await page.waitForSelector('text=Continuar →'); await page.waitForSelector('text=1 de 5 aulas concluídas'); step('course shows Continuar + progress')

await page.goto(B + '/perfil'); await page.click('text=Sair'); await page.waitForURL('**/login')
assert.equal(await page.evaluate(() => localStorage.getItem('guacamole.token') || sessionStorage.getItem('guacamole.token')), null); step('logout clears token')

await page.fill('input[name=email]', EMAIL); await page.fill('input[name=senha]', 'errada'); await page.click('button[type=submit]')
await page.waitForSelector('text=E-mail ou senha incorretos.'); step('wrong password message')
await page.fill('input[name=senha]', 'Senha123!'); await page.click('button[type=submit]'); await page.waitForURL('**/perfil'); step('login -> /perfil')
await page.goto(B + '/login'); await page.waitForURL('**/perfil'); step('logged-in user skips /login')

await page.goto(B + '/cursos?page=99'); await page.waitForSelector('text=essa página não existe'); step('page past the end explains itself')

// finish course 1 through the API, the last lesson page must celebrate
await page.evaluate(async () => {
  const t = sessionStorage.getItem('guacamole.token')
  for (const id of [102, 103, 104, 105]) await fetch(`http://localhost:8000/lessons/${id}/complete`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
})
await page.goto(B + '/aulas/105'); await page.waitForSelector('text=Curso concluído!'); await shot('app-aula-fim'); step('course completed message')

// session expires while browsing: the action sends the user to log in, not a raw server error
await page.evaluate(() => sessionStorage.setItem('guacamole.token', 'expirado'))
await page.goto(B + '/cursos/3'); await page.click('text=+ Salvar curso'); await page.waitForURL('**/login'); step('expired session -> login')
await page.fill('input[name=email]', EMAIL); await page.fill('input[name=senha]', 'Senha123!'); await page.click('button[type=submit]')
await page.waitForURL('**/cursos/3'); step('after login, back to the same course')

await page.goto(B + '/cursos/999'); await page.waitForSelector('text=Esse curso não existe (404).'); step('missing course 404')
await page.goto(B + '/nada-aqui'); await page.waitForSelector('text=perdida'); await shot('app-404'); step('404 page')

const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
for (const [path, name, wait] of [['/', 'home', 'text=Python 3 Mundo 1'], ['/cursos/1', 'curso', 'text=Aula 5'], ['/aulas/101', 'aula', 'iframe']]) {
  await m.goto(B + path); await m.waitForSelector(wait); await m.screenshot({ path: `${out}app-${name}-mobile.png`, fullPage: true })
  assert.equal(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} scrolls sideways on mobile`)
}
step('mobile: no horizontal scroll')

// expected failures: the wrong password (401) and the missing course 999 (404)
assert.deepEqual(errors.filter((e) => !e.endsWith('/login') && !e.includes('/999') && !e.endsWith('/courses/3/watchlist') && !e.endsWith('/courses/3/progress')), [], 'unexpected errors'); step('no unexpected errors')
await browser.close()
