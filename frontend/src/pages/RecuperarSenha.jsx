import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field, Submit, Notice, EMAIL_RE, fakeRequest } from '../components/Form'

export default function RecuperarSenha() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if (!EMAIL_RE.test(email)) return setError('Informe um e-mail válido.')
    setError('')
    setLoading(true)
    await fakeRequest()
    setLoading(false)
    setSentTo(email)
  }

  return (
    <AuthLayout
      docTitle="Recuperar senha"
      step="03 / recuperar"
      cowSays="moo... esqueceu a senha?"
      httpCode="404"
      title={<>Recuperar<br /><span className="text-pink">senha</span></>}
      subtitle={sentTo ? null : 'Digite o e-mail da sua conta. Enviaremos um link para criar uma nova senha.'}
      footer={<>Lembrou? <Link to="/login" className="text-cyan underline underline-offset-4">Voltar ao login</Link></>}
    >
      {sentTo ? (
        <div className="space-y-6">
          <Notice tone="pink">
            Se existir uma conta com <strong className="text-white">{sentTo}</strong>, o link chega em alguns minutos.
          </Notice>
          <ul className="space-y-2 text-sm text-mute">
            <li><span className="text-cyan">&gt;</span> Confira a caixa de spam.</li>
            <li><span className="text-cyan">&gt;</span> O link expira em 30 minutos.</li>
          </ul>
          <button type="button" onClick={() => setSentTo('')} className="text-sm text-orange underline-offset-4 hover:underline">
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" error={error} />
          <Submit loading={loading}>Enviar link</Submit>
        </form>
      )}
    </AuthLayout>
  )
}
