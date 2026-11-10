import { Link } from 'react-router-dom'
import Cow from './Cow'

const LOGO = String.raw`
 ██████╗ ██╗   ██╗ █████╗  ██████╗ █████╗ ███╗   ███╗ ██████╗ ██╗     ███████╗
██╔════╝ ██║   ██║██╔══██╗██╔════╝██╔══██╗████╗ ████║██╔═══██╗██║     ██╔════╝
██║  ███╗██║   ██║███████║██║     ███████║██╔████╔██║██║   ██║██║     █████╗
██║   ██║██║   ██║██╔══██║██║     ██╔══██║██║╚██╔╝██║██║   ██║██║     ██╔══╝
╚██████╔╝╚██████╔╝██║  ██║╚██████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗███████╗
 ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝`

// shortcut: static sample of tracks, swap for the YouTube import API once the backend exists
const FEED = [
  ['PYTHON', '120 aulas', 'text-cyan'],
  ['JAVASCRIPT', '53 aulas', 'text-orange'],
  ['HTML5 + CSS3', '97 aulas', 'text-pink'],
  ['GIT & GITHUB', '20 aulas', 'text-cyan'],
  ['ALGORITMOS', '38 aulas', 'text-orange'],
  ['PHP MODERNO', '62 aulas', 'text-pink'],
]

export default function AuthLayout({ docTitle, step, title, subtitle, children, footer, cowSays, httpCode }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.15fr_1fr]">
      <title>{`${docTitle} · Guacamole`}</title>
      {/* LEFT: brand / terminal panel */}
      <aside className="relative hidden lg:flex flex-col justify-between border-r border-line p-10 overflow-hidden" aria-hidden="true">
        <div className="pt-[12vh]">
          <pre className="glitch text-cyan text-[0.6rem] xl:text-[0.78rem] leading-none font-mono whitespace-pre">{LOGO}</pre>
          <p className="mt-6 max-w-md text-sm text-mute leading-relaxed">
            Todo o acervo do <span className="text-orange">Curso em Vídeo</span> organizado em trilhas.
            Sem algoritmo te distraindo. <span className="text-pink">Só você e o código.</span>
          </p>
        </div>

        {/* the track table is the panel's last element, so the cow stands on it */}
        <div className="max-w-md">
          <Cow says={cowSays} className="ml-6" />
          <div className="border border-line bg-panel">
            <div className="flex justify-between border-b border-line px-4 py-2 text-[11px] uppercase tracking-widest text-mute">
              <span>$ sync --playlists</span><span className="text-cyan">ok</span>
            </div>
            <ul className="px-4 py-3 space-y-1.5 text-xs">
              {FEED.map(([name, n, color]) => (
                <li key={name} className="flex gap-3">
                  <span className="text-mute">&gt;</span>
                  <span className={color}>{name}</span>
                  <span className="flex-1 border-b border-dotted border-line translate-y-[-4px]" />
                  <span className="text-mute">{n}</span>
                </li>
              ))}
              <li className="text-mute">&gt; aguardando login<span className="caret">_</span></li>
            </ul>
          </div>
        </div>

        <span className="pointer-events-none absolute -bottom-6 -left-4 font-display text-[14rem] leading-none text-white/[0.03] select-none whitespace-nowrap">
          {httpCode}
        </span>
      </aside>

      {/* RIGHT: form */}
      <main className="flex flex-col px-4 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-tight">
            GUACAMOLE<span className="text-orange">_</span>
          </Link>
          <span className="text-[11px] uppercase tracking-[0.2em] text-mute">[ {step} ]</span>
        </header>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto py-12">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan">// {step}</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl uppercase leading-[0.95]">{title}</h1>
            {subtitle && <p className="mt-4 text-sm text-mute leading-relaxed">{subtitle}</p>}
            <div className="mt-10">{children}</div>
            {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-mute">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
