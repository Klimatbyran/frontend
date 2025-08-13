// Mock för React Router hooks som automatiskt används av befintliga komponenter
import { useLocation as vikeUseLocation, useNavigate as vikeUseNavigate } from './VikeRouterHooks'

// Exportera Vike-hooks med React Router-namn
export const useLocation = vikeUseLocation
export const useNavigate = vikeUseNavigate

// Andra React Router hooks som kan behövas
export const useParams = () => {
  const location = vikeUseLocation()
  // Enkel parameter-parsing från pathname
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)
  
  // Returnera tom objekt för nu - kan utökas vid behov
  return {}
}

export const useSearchParams = () => {
  const location = vikeUseLocation()
  const searchParams = new URLSearchParams(location.search)
  
  return [
    searchParams,
    (newParams) => {
      const url = new URL(window.location)
      url.search = newParams.toString()
      window.location.href = url.toString()
    }
  ]
}

// Router-komponenter som mock
export const BrowserRouter = ({ children }) => children
export const Routes = ({ children }) => children
export const Route = ({ element }) => element
export const Navigate = ({ to, replace }) => {
  const navigate = vikeUseNavigate()
  navigate(to)
  return null
}
