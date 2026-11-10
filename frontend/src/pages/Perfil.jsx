import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { BTN, BTN_GHOST } from '../components/Form'
import { CourseCard, ErrorBox, Loading, PageTitle } from '../components/ui'
import { api } from '../api'
import useApi from '../useApi'

export default function Perfil() {
  const navigate = useNavigate()
  const me = useApi(api.me, [])
  const watch = useApi(api.watchlist, [])
  const [leaving, setLeaving] = useState(false)

  async function logout() {
    setLeaving(true)
    await api.logout().catch(() => {}) // token is cleared locally even if the server call fails
    navigate('/login', { replace: true })
  }

  // token expired: api.js already dropped it, send the user to log in again
  if (me.error?.status === 401 || watch.error?.status === 401) return <Navigate to="/login" replace state={{ from: '/perfil' }} />

  const list = watch.data ?? []
  const done = list.reduce((sum, c) => sum + (c.completed_lessons || 0), 0)
  const finished = list.filter((c) => c.percentage >= 100).length

  return (
    <AppLayout docTitle="Perfil" cowSays="whoami">
      {me.loading && <Loading what="carregando perfil" />}
      {me.error && <ErrorBox error={me.error} onRetry={me.reload} />}
      {me.data && (
        <div className="flex flex-wrap items-end justify-between gap-8">
          <PageTitle label="200 ok /me" sub={me.data.email}>
            Olá, <span className="text-cyan wrap-anywhere">{me.data.name?.split(' ')[0]}</span>
          </PageTitle>
          <button type="button" onClick={logout} disabled={leaving} className={BTN_GHOST}>
            {leaving ? 'saindo…' : 'Sair'}
          </button>
        </div>
      )}

      {watch.data && (
        <dl className="mt-12 grid grid-cols-3 border border-line">
          {[
            ['cursos salvos', list.length, 'text-cyan'],
            ['aulas concluídas', done, 'text-orange'],
            ['cursos finalizados', finished, 'text-pink'],
          ].map(([label, value, color]) => (
            <div key={label} className="border-l border-line p-4 first:border-l-0 sm:p-6">
              <dt className="text-[10px] uppercase tracking-widest text-mute sm:text-[11px]">{label}</dt>
              <dd className={`mt-2 font-display text-3xl sm:text-5xl ${color}`}>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="mt-16" aria-labelledby="salvos">
        <h2 id="salvos" className="font-display text-2xl uppercase">Meus cursos</h2>
        {watch.loading && <Loading what="buscando seus cursos" />}
        {watch.error && <ErrorBox error={watch.error} onRetry={watch.reload} />}
        {watch.data && list.length === 0 && (
          <div className="mt-6 border border-dashed border-line p-8">
            <p className="text-sm text-mute">&gt; você ainda não salvou nenhum curso.</p>
            <Link to="/cursos" className={`${BTN} mt-6`}>Explorar cursos →</Link>
          </div>
        )}
        {list.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, i) => <CourseCard key={c.id} course={c} index={i} progress={c} />)}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
