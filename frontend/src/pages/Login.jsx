import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field, Submit, Notice, EMAIL_RE } from '../components/Form'
import { api, errorMessage } from '../api'

export default function Login() {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function onSubmit(e) {
    e.preventDefault()
    const { email, senha, lembrar } = Object.fromEntries(new FormData(e.currentTarget))
    const next = {}
    if (!EMAIL_RE.test(email)) next.email = 'Informe um e-mail válido.'
    if (!senha) next.senha = 'Digite sua senha.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      await api.login(email, senha, !!lembrar)
      navigate(location.state?.from || '/perfil', { replace: true }) // back to where login was asked
    } catch (err) {
      setErrors({ form: err.status === 401 ? 'E-mail ou senha incorretos.' : errorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      docTitle="Entrar"
      step="01 / acesso"
      cowSays="ssh voce@guacamole"
      httpCode="401"
      title={<>Entrar no<br /><span className="text-cyan">sistema</span></>}
      subtitle="Continue de onde parou nas suas trilhas."
      footer={<>Primeira vez aqui? <Link to="/cadastro" className="text-orange underline underline-offset-4">Criar conta</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {errors.form && <Notice tone="pink">{errors.form}</Notice>}
        <Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" error={errors.email} />
        <Field
          label="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.senha}
          action={<Link to="/recuperar-senha" className="text-xs text-mute hover:text-cyan">esqueci a senha</Link>}
        />
        <label className="flex items-center gap-3 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" name="lembrar" className="size-4 accent-cyan" />
          Manter conectado
        </label>
        <Submit loading={loading}>Acessar</Submit>
      </form>
    </AuthLayout>
  )
}
