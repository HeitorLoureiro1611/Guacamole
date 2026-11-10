import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import { getToken } from './api'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import RecuperarSenha from './pages/RecuperarSenha'
import Home from './pages/Home'
import Cursos from './pages/Cursos'
import Curso from './pages/Curso'
import Aula from './pages/Aula'
import Perfil from './pages/Perfil'
import NaoEncontrado from './pages/NaoEncontrado'

// pages that only make sense logged in; after login the user comes back here
function RequireAuth({ children }) {
  const location = useLocation()
  return getToken() ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

// login/register make no sense when already logged in. Checked at the route, not inside the page,
// so the page's own redirect after a successful submit is not overridden.
function GuestOnly({ children }) {
  return getToken() ? <Navigate to="/perfil" replace /> : children
}

// BrowserRouter keeps the old scroll position; a new page should start at the top
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/cursos/:id" element={<Curso />} />
        <Route path="/aulas/:id" element={<Aula />} />
        <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/cadastro" element={<GuestOnly><Cadastro /></GuestOnly>} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
