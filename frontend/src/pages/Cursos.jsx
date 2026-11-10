import { useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { CourseCard, ErrorBox, Loading, PageTitle, Pagination } from '../components/ui'
import { api } from '../api'
import useApi from '../useApi'

export default function Cursos() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1) // page lives in the URL so back/forward and sharing work
  const { data, error, loading, reload } = useApi(() => api.courses(page), [page])

  function go(n) {
    setParams(n > 1 ? { page: n } : {})
    window.scrollTo({ top: 0 })
  }

  return (
    <AppLayout docTitle="Cursos" cowSays="ls ./cursos --all">
      <PageTitle label="catálogo" sub="Escolha um curso e comece agora. Seu progresso fica salvo aula por aula.">
        Cursos
      </PageTitle>

      <div className="mt-12">
        <h2 className="sr-only">Lista de cursos</h2>
        {loading && !data && <Loading what="buscando cursos" />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {data && data.items.length === 0 && (
          <p className="py-10 text-sm text-mute">
            {page > 1
              ? <>&gt; essa página não existe. <button type="button" onClick={() => go(1)} className="text-cyan underline underline-offset-4">Voltar para a primeira</button></>
              : <>&gt; nenhum curso importado ainda.</>}
          </p>
        )}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${loading ? 'opacity-50' : ''}`} aria-busy={loading}>
              {data.items.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
            <Pagination page={data.page} lastPage={data.lastPage} onChange={go} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
