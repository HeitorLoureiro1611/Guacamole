import { Link, NavLink, useLocation } from 'react-router-dom'
import Cow from './Cow'
import { getToken } from '../api'

const link = ({ isActive }) =>
  `px-2 sm:px-3 py-2 text-[11px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] ${
    isActive ? 'text-cyan' : 'text-mute hover:text-white'
  }`

// Shell for every page after login: top nav, content, and the cow standing on the footer (cow rule: bottom of the page).
export default function AppLayout({ docTitle, cowSays, children }) {
  useLocation() // re-render on every navigation so the logged-in state below stays fresh
  const logged = !!getToken()

  return (
    <div className="min-h-dvh flex flex-col">
      <title>{docTitle ? `${docTitle} · Guacamole` : 'Guacamole'}</title>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-cyan focus:px-4 focus:py-2 focus:text-void">
        Pular para o conteúdo
      </a>
      <header className="border-b border-line">
        <nav aria-label="Principal" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8">
          <Link to="/" className="font-display text-base sm:text-lg tracking-tight">
            GUACAMOLE<span className="text-orange">_</span>
          </Link>
          <div className="flex items-center">
            <NavLink to="/" end className={(s) => `${link(s)} max-[359px]:hidden`}>Início</NavLink>
            <NavLink to="/cursos" className={link}>Cursos</NavLink>
            {logged ? (
              <NavLink to="/perfil" className={link}>Perfil</NavLink>
            ) : (
              <Link to="/login" className="ml-1 sm:ml-2 bg-cyan px-3 sm:px-4 py-2 font-display text-[11px] sm:text-xs uppercase text-void focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8 sm:py-14">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-8" aria-hidden="true">
        <Cow says={cowSays} className="ml-6" />
        <div className="flex justify-between border-t border-line py-6 text-[11px] uppercase tracking-widest text-mute">
          <span>GUACAMOLE<span className="text-orange">_</span></span>
          <span>aprenda no seu ritmo</span>
        </div>
      </footer>
    </div>
  )
}
