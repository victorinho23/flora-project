// src/main.jsx
// Entrada de la app: carga estilos, aplica el tema guardado y renderiza App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './app/app.jsx'

// Aplica el tema (claro u oscuro) que el usuario dejo guardado
try {
  document.documentElement.dataset.theme = localStorage.getItem('flora-theme') ?? 'light'
} catch {
  document.documentElement.dataset.theme = 'light'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
  
)
