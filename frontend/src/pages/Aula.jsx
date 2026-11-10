import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { BTN, BTN_GHOST, Notice } from '../components/Form'
import { ErrorBox, Loading, pad } from '../components/ui'
import { api, errorMessage, getToken } from '../api'
import useApi from '../useApi'

export default function Aula() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const logged = !!getToken()
  const lesson = useApi(() => api.lesson(id), [id])
  // the spec only says "course": accept either { id, title } or a bare id
  const courseId = lesson.data && (lesson.data.course?.id ?? lesson.data.course)
  const lessons = useApi(() => (courseId ? api.lessons(courseId) : Promise.resolve(null)), [courseId])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  if (lesson.loading && !lesson.data) return <AppLayout cowSays="./assistir --foco"><Loading what="carregando aula" /></AppLayout>
  if (lesson.error) {
    return (
      <AppLayout cowSays="moo? aula nao existe">
        <ErrorBox error={lesson.error} onRetry={lesson.reload} notFound="Essa aula não existe (404)." />
      </AppLayout>
    )
  }

  const list = lessons.data ?? []
  // switching lessons: show the new one right away from the sidebar list instead of the old one until the server answers
  const fresh = String(lesson.data.id) === String(id)
  const l = fresh ? lesson.data : list.find((x) => String(x.id) === String(id)) ?? lesson.data
  const ready = String(l.id) === String(id) // never act on a lesson other than the one in the URL
  const i = list.findIndex((x) => String(x.id) === String(l.id))
  const prev = i > 0 ? list[i - 1] : null
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null

  // mark/unmark this lesson; with goNext, completes and moves on
  async function toggleComplete(goNext = false) {
    if (!logged) return navigate('/login', { state: { from: location.pathname } })
    const done = !l.completed
    setBusy(true)
    setActionError('')
    try {
      await (done ? api.completeLesson(l.id) : api.uncompleteLesson(l.id))
      lesson.setData((x) => ({ ...x, completed: done }))
      lessons.setData((xs) => xs?.map((x) => (String(x.id) === String(l.id) ? { ...x, completed: done } : x)))
      if (goNext && next) navigate(`/aulas/${next.id}`)
    } catch (err) {
      if (err.status === 401) return navigate('/login', { state: { from: location.pathname } }) // session expired
      setActionError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppLayout docTitle={l.title} cowSays="./assistir --foco">
      {courseId && (
        <Link to={`/cursos/${courseId}`} className="text-xs uppercase tracking-widest text-mute hover:text-cyan">
          ← {lesson.data.course?.title ?? 'voltar ao curso'}
        </Link>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="aspect-video border border-line bg-panel">
            <iframe
              key={l.youtube_id_video}
              src={`https://www.youtube-nocookie.com/embed/${l.youtube_id_video}?rel=0`}
              title={l.title}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-cyan">// aula {pad(l.position)}{list.length > 0 && ` de ${pad(list.length)}`}</p>
          <h1 className="mt-3 font-display text-3xl uppercase leading-tight wrap-anywhere sm:text-4xl">{l.title}</h1>

          <div className="mt-8 flex flex-wrap gap-5">
            {!l.completed && next ? (
              <button type="button" disabled={busy || !ready} onClick={() => toggleComplete(true)} className={BTN}>Concluir e próxima →</button>
            ) : null}
            <button type="button" disabled={busy || !ready} onClick={() => toggleComplete()} aria-pressed={!!l.completed} className={!l.completed && lessons.data && !next ? BTN : BTN_GHOST}>
              {l.completed ? '✓ Concluída' : 'Marcar como concluída'}
            </button>
          </div>
          {!logged && <p className="mt-4 text-xs text-mute">Entre na sua conta para salvar o progresso.</p>}
          {actionError && <div className="mt-6"><Notice tone="pink">{actionError}</Notice></div>}
          {list.length > 0 && list.every((x) => x.completed) && (
            <div className="mt-6">
              <Notice>
                Curso concluído! Você terminou todas as {list.length} aulas.{' '}
                <Link to="/cursos" className="text-white underline underline-offset-4">Escolher o próximo curso</Link>
              </Notice>
            </div>
          )}

          <nav aria-label="Navegar entre aulas" className="mt-10 flex justify-between gap-4 border-t border-line pt-6 text-sm">
            {prev ? <Link to={`/aulas/${prev.id}`} className="text-mute hover:text-cyan">← anterior</Link> : <span />}
            {next ? <Link to={`/aulas/${next.id}`} className="text-mute hover:text-cyan">próxima →</Link> : <span />}
          </nav>
        </section>

        <aside aria-labelledby="lista-aulas" className="self-start border border-line bg-panel">
          <h2 id="lista-aulas" className="border-b border-line px-4 py-3 text-[11px] uppercase tracking-widest text-mute">
            $ ls ./aulas {list.length > 0 && <span className="text-cyan">({list.filter((x) => x.completed).length}/{list.length})</span>}
          </h2>
          {lessons.loading && <div className="px-4"><Loading what="listando" /></div>}
          <ol className="max-h-[60vh] overflow-y-auto">
            {list.map((x) => {
              const current = String(x.id) === String(l.id)
              return (
                <li key={x.id}>
                  <Link
                    to={`/aulas/${x.id}`}
                    aria-current={current ? 'page' : undefined}
                    className={`flex gap-3 border-b border-line px-4 py-3 text-xs hover:bg-void ${current ? 'bg-void text-cyan' : ''}`}
                  >
                    <span className={current ? 'text-cyan' : 'text-mute'}>{current ? '▶' : pad(x.position)}</span>
                    <span className="min-w-0 flex-1 wrap-anywhere">{x.title}</span>
                    {x.completed && <span className="text-cyan">✓<span className="sr-only"> concluída</span></span>}
                  </Link>
                </li>
              )
            })}
          </ol>
        </aside>
      </div>
    </AppLayout>
  )
}
