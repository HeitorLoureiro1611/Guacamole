// Fake backend that follows /api_cursos.md, in memory, on port 8000. Only for testing the frontend
// while the real backend does not exist. Data resets on every start.
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'

const users = [], tokens = new Map(), watch = new Set(), done = new Set()
const teacher = 'Gustavo Guanabara'
const vids = ['S9uPNppGsGo', 'Cg1vvTa5sME', 'nwK1G0Mtwrs', 'jZ4Yh_m6vLk', 'kM1KWl2ivxs']
const names = ['Python 3 Mundo 1', 'Desenvolvimento Web Completo com Programação Orientada a Objetos e Arquitetura Hexagonal Supercalifragilisticexpialidocious',
  'JavaScript', 'HTML5 e CSS3', 'Git e GitHub', 'Algoritmos', 'PHP Moderno', 'Java', 'Banco de Dados MySQL', 'Hardware', 'Linux', 'Word', 'Excel', 'Photoshop', 'Android']
const courses = names.map((t, i) => ({ id: i + 1, title: t, description: `Curso completo de ${t} para iniciantes.\nDo básico ao avançado, com exercícios.`, youtube_id_playlist: 'PL' + i }))
const lessons = courses.flatMap((c) => Array.from({ length: 5 }, (_, j) => ({ id: c.id * 100 + j + 1, course_id: c.id, title: `Aula ${j + 1} - ${['Introdução', 'Primeiros passos', 'Variáveis', 'Condições', 'Repetições'][j]}`, youtube_id_video: vids[j], position: j + 1 })))

const prog = (uid, cid) => {
  const ls = lessons.filter((l) => l.course_id === cid), c = ls.filter((l) => done.has(`${uid}:${l.id}`)).length
  return { completed_lessons: c, total_lessons: ls.length, percentage: Math.round((c / ls.length) * 100) }
}
const DELAY = Number(process.env.MOCK_DELAY || 0) // simulate a slow network: MOCK_DELAY=800

createServer(async (req, res) => {
  const send = (s, b) => setTimeout(() => {
    res.writeHead(s, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' })
    res.end(b === undefined ? '' : JSON.stringify(b))
  }, req.method === 'OPTIONS' ? 0 : DELAY)
  if (req.method === 'OPTIONS') return send(204)
  let body = ''; for await (const ch of req) body += ch
  body = body ? JSON.parse(body) : {}
  const url = new URL(req.url, 'http://x'), p = url.pathname, m = req.method
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const uid = tokens.get(token)
  const auth = () => { if (uid === undefined) { send(401, { message: 'Unauthenticated.' }); return false } return true }
  let r
  if (m === 'POST' && p === '/register') {
    if (users.some((u) => u.email === body.email)) return send(422, { message: 'Erro de validação', errors: { email: ['Este e-mail já está em uso.'] } })
    users.push({ id: users.length + 1, ...body }); const t = randomUUID(); tokens.set(t, users.length); return send(201, { token: t })
  }
  if (m === 'POST' && p === '/login') {
    const u = users.find((u) => u.email === body.email && u.password === body.password)
    if (!u) return send(401, { message: 'Invalid credentials' }); const t = randomUUID(); tokens.set(t, u.id); return send(200, { token: t })
  }
  if (m === 'POST' && p === '/logout') { tokens.delete(token); return send(204) }
  if (p === '/me') { if (!auth()) return; const { password, ...u } = users[uid - 1]; return send(200, u) }
  if (p === '/me/watchlist') { if (!auth()) return; return send(200, courses.filter((c) => watch.has(`${uid}:${c.id}`)).map((c) => ({ id: c.id, title: c.title, teacher, ...prog(uid, c.id) }))) }
  if (m === 'GET' && p === '/courses') {
    const page = Number(url.searchParams.get('page')) || 1, per = 9
    return send(200, { data: courses.slice((page - 1) * per, page * per).map((c) => ({ id: c.id, title: c.title, teacher })), current_page: page, last_page: Math.ceil(courses.length / per) })
  }
  if ((r = p.match(/^\/courses\/(\d+)(\/\w+)?$/))) {
    const c = courses.find((c) => c.id === +r[1]); if (!c) return send(404, { message: 'Not found' })
    const sub = r[2]
    if (!sub) return send(200, { ...c, teacher, total_lessons: 5, saved: watch.has(`${uid}:${c.id}`) })
    if (sub === '/lessons') return send(200, lessons.filter((l) => l.course_id === c.id).map((l) => ({ ...l, completed: done.has(`${uid}:${l.id}`) })))
    if (sub === '/progress') { if (!auth()) return; return send(200, prog(uid, c.id)) }
    if (sub === '/watchlist') { if (!auth()) return; m === 'POST' ? watch.add(`${uid}:${c.id}`) : watch.delete(`${uid}:${c.id}`); return send(204) }
  }
  if ((r = p.match(/^\/lessons\/(\d+)(\/complete)?$/))) {
    const l = lessons.find((l) => l.id === +r[1]); if (!l) return send(404, { message: 'Not found' })
    if (!r[2]) { const c = courses.find((c) => c.id === l.course_id); return send(200, { ...l, course: { id: c.id, title: c.title }, completed: done.has(`${uid}:${l.id}`) }) }
    if (!auth()) return; m === 'POST' ? done.add(`${uid}:${l.id}`) : done.delete(`${uid}:${l.id}`); return send(204)
  }
  send(404, { message: 'Not found' })
}).listen(8000, () => console.log('mock api on http://localhost:8000'))
