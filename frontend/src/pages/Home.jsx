import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { BTN, BTN_GHOST } from '../components/Form'
import { CourseCard, ErrorBox, Loading } from '../components/ui'
import { api, getToken } from '../api'
import useApi from '../useApi'

const STEPS = [
  ['escolha um curso', 'text-cyan'],
  ['assista às aulas', 'text-orange'],
  ['marque como concluída', 'text-pink'],
  ['acompanhe seu progresso', 'text-cyan'],
]

export default function Home() {
  const logged = !!getToken()
  const courses = useApi(() => api.courses(1), [])
  const watch = useApi(() => (logged ? api.watchlist() : Promise.resolve([])), [logged])
  const started = (watch.data ?? []).filter((c) => c.percentage > 0 && c.percentage < 100).slice(0, 3)

  return (
    <AppLayout docTitle="Aprenda tecnologia do zero" cowSays="apt install conhecimento">
      <section className="grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan">// 200 ok</p>
          <h1 className="mt-4 font-display text-4xl uppercase leading-[0.9] min-[390px]:text-5xl sm:text-7xl">
            Aprenda<br /><span className="text-cyan">tecnologia</span><br />do zero<span className="text-orange">.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute sm:text-base">
            Os cursos gratuitos do <span className="text-orange">Curso em Vídeo</span> organizados em trilhas,
            com o seu progresso salvo aula por aula.
          </p>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link to="/cursos" className={BTN}>Explorar cursos →</Link>
            {!logged && <Link to="/cadastro" className={BTN_GHOST}>Criar conta grátis</Link>}
          </div>
        </div>

        <div className="border border-line bg-panel" aria-label="Como funciona">
          <div className="flex justify-between border-b border-line px-4 py-2 text-[11px] uppercase tracking-widest text-mute">
            <span>$ guacamole --como-funciona</span><span className="text-cyan">ok</span>
          </div>
          <ol className="space-y-3 px-4 py-5 text-sm">
            {STEPS.map(([step, color], i) => (
              <li key={step} className="flex gap-3">
                <span className="text-mute">[{i + 1}]</span><span className={color}>{step}</span>
              </li>
            ))}
            <li className="text-mute">&gt; pronto pra começar<span className="caret">_</span></li>
          </ol>
        </div>
      </section>

      {started.length > 0 && (
        <section className="mt-24" aria-labelledby="continue">
          <h2 id="continue" className="font-display text-2xl uppercase">Continue de onde parou</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {started.map((c, i) => <CourseCard key={c.id} course={c} index={i} progress={c} />)}
          </div>
        </section>
      )}

      <section className="mt-24" aria-labelledby="cursos">
        <div className="flex items-end justify-between gap-4">
          <h2 id="cursos" className="font-display text-2xl uppercase">Cursos</h2>
          <Link to="/cursos" className="text-xs uppercase tracking-widest text-mute hover:text-cyan">ver todos →</Link>
        </div>
        {courses.loading && <Loading what="buscando cursos" />}
        {courses.error && <ErrorBox error={courses.error} onRetry={courses.reload} />}
        {courses.data && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.data.items.slice(0, 6).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
