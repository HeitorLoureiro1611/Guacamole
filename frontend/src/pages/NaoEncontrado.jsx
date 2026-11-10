import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { BTN } from '../components/Form'
import { PageTitle } from '../components/ui'

export default function NaoEncontrado() {
  return (
    <AppLayout docTitle="Página não encontrada" cowSays="moo? 404 not found">
      <PageTitle label="404 not found" sub="Essa página não existe ou mudou de lugar.">
        Página<br /><span className="text-pink">perdida</span>
      </PageTitle>
      <Link to="/" className={`${BTN} mt-10`}>Voltar ao início</Link>
    </AppLayout>
  )
}
