// Client for the backend described in /api_cursos.md. The user is always identified by the
// token (Authorization: Bearer), never by a user_id sent from here.
const BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
const KEY = 'guacamole.token'

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `HTTP ${status}`)
    this.status = status // 0 = server unreachable
    this.data = data
  }
}

// "Manter conectado" -> localStorage (survives closing the browser), otherwise sessionStorage
export const getToken = () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY)
function saveToken(token, remember) {
  if (!token) throw new ApiError(500, { message: 'O servidor não devolveu o token.' })
  clearToken()
  ;(remember ? localStorage : sessionStorage).setItem(KEY, token)
}
export function clearToken() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}

async function request(method, path, body) {
  const token = getToken()
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0)
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (res.status === 401 && token) clearToken() // token expired or revoked
  if (!res.ok) throw new ApiError(res.status, data)
  // Laravel API Resources wrap bodies as { data: ... }; unwrap only when that is the sole key (pagination keeps its keys)
  return data && !Array.isArray(data) && Object.keys(data).length === 1 && 'data' in data ? data.data : data
}

// shortcut: accepts Laravel paginate ({ data, current_page, last_page }, or under meta) or a plain array; adjust once the backend fixes the format
function page(r, asked) {
  return {
    items: Array.isArray(r) ? r : r?.data ?? [],
    page: r?.current_page ?? r?.meta?.current_page ?? asked,
    lastPage: r?.last_page ?? r?.meta?.last_page ?? 1,
  }
}

export function errorMessage(err) {
  if (err.status === 0) return 'Não foi possível conectar ao servidor. Tente de novo em instantes.'
  if (err.status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
  if (err.status === 404) return 'Não encontrado.'
  if (err.status >= 500) return 'O servidor teve um problema. Tente de novo em instantes.'
  // other server texts may be in English or technical; validation (422) messages are meant for the user
  return (err.status === 422 && err.data?.message) || `Algo deu errado (HTTP ${err.status}).`
}

// shortcut: assumes auth responses look like { token: "..." }, adjust here if the backend uses another field
export const api = {
  // auth
  register: async (name, email, password) => saveToken((await request('POST', '/register', { name, email, password }))?.token, false),
  login: async (email, password, remember) => saveToken((await request('POST', '/login', { email, password }))?.token, remember),
  logout: () => request('POST', '/logout').finally(clearToken),

  // authenticated user
  me: () => request('GET', '/me'),
  watchlist: () => request('GET', '/me/watchlist'),

  // courses
  courses: async (n = 1) => page(await request('GET', `/courses?page=${n}`), n),
  course: (id) => request('GET', `/courses/${id}`),
  lessons: (courseId) => request('GET', `/courses/${courseId}/lessons`),
  progress: (courseId) => request('GET', `/courses/${courseId}/progress`),
  saveCourse: (courseId) => request('POST', `/courses/${courseId}/watchlist`),
  unsaveCourse: (courseId) => request('DELETE', `/courses/${courseId}/watchlist`),

  // lessons
  lesson: (id) => request('GET', `/lessons/${id}`),
  completeLesson: (id) => request('POST', `/lessons/${id}/complete`),
  uncompleteLesson: (id) => request('DELETE', `/lessons/${id}/complete`),
}
