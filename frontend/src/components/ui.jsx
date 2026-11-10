import { Link } from 'react-router-dom'
import { Notice } from './Form'
import { errorMessage } from '../api'

// static class names so Tailwind can see them
export const ACCENTS = [
  { text: 'text-cyan', bg: 'bg-cyan', hover: 'hover:border-cyan focus-visible:border-cyan' },
  { text: 'text-orange', bg: 'bg-orange', hover: 'hover:border-orange focus-visible:border-orange' },
  { text: 'text-pink', bg: 'bg-pink', hover: 'hover:border-pink focus-visible:border-pink' },
]

export const pad = (n) => String(n).padStart(2, '0')

export function PageTitle({ label, children, sub }) {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.25em] text-cyan">// {label}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-6xl uppercase leading-[0.95] wrap-anywhere">{children}</h1>
      {sub && <p className="mt-4 max-w-2xl text-sm text-mute leading-relaxed wrap-anywhere">{sub}</p>}
    </header>
  )
}

// ASCII progress bar: [██████░░░░] 40%
export function Progress({ value, label = 'Progresso' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)))
  const filled = Math.round(pct / 5)
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="flex items-center gap-3 text-xs">
      <span aria-hidden="true" className="whitespace-nowrap text-cyan">
        [{'█'.repeat(filled)}<span className="text-mute/40">{'░'.repeat(20 - filled)}</span>]
      </span>
      <span className="text-mute">{pct}%</span>
    </div>
  )
}

export function Loading({ what = 'carregando' }) {
  return <p role="status" className="py-10 text-sm text-mute">&gt; {what}<span className="caret">_</span></p>
}

export function ErrorBox({ error, onRetry, notFound = 'Não encontrado.' }) {
  return (
    <div className="space-y-4 py-6">
      <Notice tone="pink">{error.status === 404 ? notFound : errorMessage(error)}</Notice>
      {error.status === 404 ? (
        <Link to="/cursos" className="text-sm text-cyan underline-offset-4 hover:underline">Ver todos os cursos</Link>
      ) : (
        onRetry && <button type="button" onClick={onRetry} className="text-sm text-orange underline-offset-4 hover:underline">Tentar de novo</button>
      )}
    </div>
  )
}

export function CourseCard({ course, index = 0, progress }) {
  const a = ACCENTS[index % ACCENTS.length]
  return (
    <Link
      to={`/cursos/${course.id}`}
      className={`group relative flex flex-col border sm:min-h-56 border-line bg-panel p-6 transition-[transform,border-color] hover:-translate-y-1 ${a.hover}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${a.bg}`} aria-hidden="true" />
      <span className="text-[11px] uppercase tracking-[0.2em] text-mute">curso #{pad(course.id)}</span>
      <h3 className="mt-4 font-display text-xl uppercase leading-tight wrap-anywhere">{course.title}</h3>
      <p className={`mt-2 text-sm ${a.text}`}>{course.teacher}</p>
      <div className="mt-auto pt-6">
        {progress ? (
          <>
            <Progress value={progress.percentage} label={`Progresso em ${course.title}`} />
            <p className="mt-2 text-xs text-mute">{progress.completed_lessons} de {progress.total_lessons} aulas</p>
          </>
        ) : (
          <span className="text-xs uppercase tracking-widest text-mute group-hover:text-white">ver curso →</span>
        )}
      </div>
    </Link>
  )
}

export function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null
  const btn = 'border border-line px-4 py-2 text-xs uppercase tracking-widest hover:border-cyan hover:text-cyan disabled:opacity-30 disabled:hover:border-line disabled:hover:text-inherit'
  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-between gap-4">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>← anterior</button>
      <span className="text-xs text-mute">página {page} de {lastPage}</span>
      <button type="button" className={btn} disabled={page >= lastPage} onClick={() => onChange(page + 1)}>próxima →</button>
    </nav>
  )
}
