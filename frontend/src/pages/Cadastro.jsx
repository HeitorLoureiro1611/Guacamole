import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field, Submit, Notice, EMAIL_RE, fakeRequest } from '../components/Form'

// score 0-4: length, mixed case, digit, symbol
export function strength(p) {
  if (p.length < 8) return 0
  return 1 + [/[a-z]/.test(p) && /[A-Z]/.test(p), /\d/.test(p), /[^\w\s]/.test(p)].filter(Boolean).length
}
const LEVELS = [
  ['mín. 8 caracteres', 'bg-line'],
  ['fraca', 'bg-pink'],
  ['média', 'bg-orange'],
  ['boa', 'bg-cyan'],
  ['forte', 'bg-cyan'],
]

export default function Cadastro() {
  const [senha, setSenha] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const score = strength(senha)

  async function onSubmit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    const next = {}
    if (f.nome.trim().length < 2) next.nome = 'Como podemos te chamar?'
    if (!EMAIL_RE.test(f.email)) next.email = 'Informe um e-mail válido.'
    if (score < 2) next.senha = 'Use 8+ caracteres misturando letras, números ou símbolos.'
    if (f.confirmar !== f.senha) next.confirmar = 'As senhas não conferem.'
    if (!f.termos) next.termos = 'Aceite os termos para continuar.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    await fakeRequest()
    setLoading(false)
    setDone(true)
  }

  return (
    <AuthLayout
      step="02 / registro"
      cowSays="git init minha-carreira"
      httpCode="201"
      title={<>Criar<br /><span className="text-orange">acesso</span></>}
      subtitle="Grátis. Todas as trilhas do Curso em Vídeo, com seu progresso salvo."
      footer={<>Já tem conta? <Link to="/login" className="text-cyan underline-offset-4 hover:underline">Entrar</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {done && <Notice tone="orange">Cadastro validado. A conexão com o servidor chega na próxima etapa.</Notice>}
        <Field label="Nome" name="nome" autoComplete="name" placeholder="Seu nome" error={errors.nome} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" error={errors.email} />
        <div>
          <Field
            label="Senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={errors.senha}
          />
          <div className="mt-3 flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1 flex-1 transition-colors ${i <= score ? LEVELS[score][1] : 'bg-line'}`} />
              ))}
            </div>
            <span className="text-[11px] uppercase tracking-widest text-mute shrink-0 text-right">{LEVELS[score][0]}</span>
          </div>
        </div>
        <Field label="Confirmar senha" name="confirmar" type="password" autoComplete="new-password" placeholder="••••••••" error={errors.confirmar} />
        <div>
          <label className="flex items-start gap-3 text-sm text-mute cursor-pointer select-none">
            <input type="checkbox" name="termos" className="mt-0.5 size-4 accent-orange" aria-invalid={!!errors.termos} />
            <span>Li e aceito os <a href="#" className="text-white underline underline-offset-4">termos de uso</a> e a <a href="#" className="text-white underline underline-offset-4">política de privacidade</a>.</span>
          </label>
          {errors.termos && <p className="mt-2 text-xs text-pink" role="alert">! {errors.termos}</p>}
        </div>
        <Submit loading={loading}>Criar conta</Submit>
      </form>
    </AuthLayout>
  )
}
