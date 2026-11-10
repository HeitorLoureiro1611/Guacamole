import { useId, useState } from 'react'

export function Field({ label, error, hint, action, type = 'text', ...props }) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const msgId = `${id}-msg`

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-xs uppercase tracking-[0.2em] text-mute">{label}</label>
        {action}
      </div>
      <div className={`group flex items-center border bg-panel transition-colors focus-within:border-cyan ${error ? 'border-pink' : 'border-line hover:border-mute/50'}`}>
        <span className="pl-4 text-cyan select-none" aria-hidden="true">&gt;</span>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? msgId : undefined}
          className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-mute/50 outline-none"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={show}
            className="px-4 py-3.5 text-[11px] uppercase tracking-widest text-mute hover:text-cyan focus-visible:text-cyan"
          >
            {show ? 'ocultar' : 'ver'}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={msgId} className={`mt-2 text-xs ${error ? 'text-pink' : 'text-mute'}`} role={error ? 'alert' : undefined}>
          {error ? `! ${error}` : hint}
        </p>
      )}
    </div>
  )
}

// brutalist primary button look, shared by <Submit> and link-buttons across the app
export const BTN = `inline-block bg-cyan px-6 py-4 font-display uppercase tracking-wide text-void
  shadow-[6px_6px_0_var(--color-pink)] transition-[transform,box-shadow]
  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-pink)]
  active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--color-pink)]
  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange
  disabled:opacity-60 disabled:cursor-wait`
export const BTN_GHOST = `inline-block border border-line px-6 py-4 font-display uppercase tracking-wide text-white
  transition-colors hover:border-cyan hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4
  focus-visible:outline-orange disabled:opacity-60`

export function Submit({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`${BTN} w-full`}
    >
      <span className="flex items-center justify-between">
        {loading ? 'processando…' : children}
        <span aria-hidden="true">{loading ? '◐' : '→'}</span>
      </span>
    </button>
  )
}

export function Notice({ tone = 'cyan', children }) {
  const tones = { cyan: 'border-cyan text-cyan', pink: 'border-pink text-pink', orange: 'border-orange text-orange' }
  return (
    <div role="status" className={`border-l-2 bg-panel px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// shortcut: password recovery has no route in api_cursos.md, so RecuperarSenha only simulates; replace when the backend adds one
export const fakeRequest = () => new Promise((r) => setTimeout(r, 900))
