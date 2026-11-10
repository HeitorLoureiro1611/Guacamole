import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { BTN, BTN_GHOST, Notice } from '../components/Form'
import { ErrorBox, Loading, pad, Progress } from '../components/ui'
import { api, errorMessage, getToken } from '../api'
import useApi from '../useApi'

export default function Curso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const logged = !!getToken()
  const course = useApi(() => api.course(id), [id])
  const lessons = useApi(() => api.lessons(id), [id])
  const progress = useApi(() => (logged ? api.progress(id) : Promise.resolve(null)), [id, logged])
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  async function toggleSave() {
    if (!logged) return navigate('/login', { state: { from: location.pathname } })
    const saved = course.data.saved
    setSaving(true)
    setActionError('')
    try {
      await (saved ? api.unsaveCourse(id) : api.saveCourse(id))
      course.setData((c) => ({ ...c, saved: !saved }))
    } catch (err) {
      if (err.status === 401) return navigate('/login', { state: { from: location.pathname } }) // session expired
      setActionError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (course.loading) return <AppLayout cowSays="man curso"><Loading what="abrindo curso" /></AppLayout>
  if (course.error) {
    return (
      <AppLayout cowSays="moo? curso nao existe">
        <ErrorBox error={course.error} onRetry={course.reload} notFound="Esse curso não existe (404)." />
      </AppLayout>
    )
  }

  const c = course.data
  const list = lessons.data ?? []
  const next = list.find((l) => !l.completed) ?? list[0]
  const started = list.some((l) => l.completed)
  const thumb = list[0] && `https://i.ytimg.com/vi/${list[0].youtube_id_video}/hqdefault.jpg`

  return (
    <AppLayout docTitle={c.title} cowSays="man curso">
      <Link to="/cursos" className="text-xs uppercase tracking-widest text-mute hover:text-cyan">← todos os cursos</Link>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan">// curso #{pad(c.id)}</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] wrap-anywhere text-balance sm:text-5xl xl:text-6xl">{c.title}</h1>
          <p className="mt-4 text-sm text-orange">com {c.teacher} · {c.total_lessons} aulas</p>
          {c.description && <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-mute">{c.description}</p>}

          <div className="mt-10 flex flex-wrap gap-5">
            {next && <Link to={`/aulas/${next.id}`} className={BTN}>{started ? 'Continuar' : 'Começar curso'} →</Link>}
            <button type="button" onClick={toggleSave} disabled={saving} aria-pressed={!!c.saved} className={BTN_GHOST}>
              {saving ? 'salvando…' : c.saved ? '✓ Salvo' : '+ Salvar curso'}
            </button>
          </div>
          {actionError && <div className="mt-6"><Notice tone="pink">{actionError}</Notice></div>}

          {progress.data && (
            <div className="mt-10">
              <Progress value={progress.data.percentage} label="Seu progresso neste curso" />
              <p className="mt-2 text-xs text-mute">{progress.data.completed_lessons} de {progress.data.total_lessons} aulas concluídas</p>
            </div>
          )}
        </div>

        {thumb && (
          // photocopy look: grayscale + hard contrast, tinted by the panel
          <div className="relative hidden self-start border border-line bg-panel lg:block" aria-hidden="true">
            <img src={thumb} alt="" className="aspect-video w-full object-cover opacity-80 grayscale contrast-150 mix-blend-luminosity" />
            <span className="absolute bottom-0 left-0 bg-void px-3 py-1 text-[11px] uppercase tracking-widest text-cyan">▶ youtube</span>
          </div>
        )}
      </section>

      <section className="mt-16" aria-labelledby="aulas">
        <h2 id="aulas" className="font-display text-2xl uppercase">Aulas</h2>
        {lessons.loading && <Loading what="listando aulas" />}
        {lessons.error && <ErrorBox error={lessons.error} onRetry={lessons.reload} />}
        {lessons.data && list.length === 0 && <p className="py-10 text-sm text-mute">&gt; nenhuma aula importada ainda.</p>}
        {list.length > 0 && (
          <ol className="mt-6 border-t border-line">
            {list.map((l) => (
              <li key={l.id}>
                <Link to={`/aulas/${l.id}`} className="group flex items-center gap-4 border-b border-line px-2 py-4 hover:bg-panel">
                  <span className="w-8 shrink-0 text-xs text-mute">{pad(l.position)}</span>
                  <span className="min-w-0 flex-1 wrap-anywhere text-sm group-hover:text-cyan">{l.title}</span>
                  {l.completed
                    ? <span className="text-xs text-cyan">✓ <span className="sr-only">concluída</span></span>
                    : <span className="text-xs text-mute opacity-0 group-hover:opacity-100" aria-hidden="true">▶</span>}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppLayout>
  )
}
