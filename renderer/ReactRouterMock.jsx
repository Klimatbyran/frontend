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

// Link-komponent som mock
export const Link = ({ to, children, className, ...props }) => {
  return (
    <a 
      href={to} 
      className={className}
      onClick={(e) => {
        e.preventDefault()
        window.location.href = to
      }}
      {...props}
    >
      {children}
    </a>
  )
}

// NavLink-komponent som mock
export const NavLink = ({ to, children, className, activeClassName, ...props }) => {
  const location = vikeUseLocation()
  const isActive = location.pathname === to
  const finalClassName = isActive && activeClassName 
    ? `${className} ${activeClassName}` 
    : className

  return (
    <a 
      href={to} 
      className={finalClassName}
      onClick={(e) => {
        e.preventDefault()
        window.location.href = to
      }}
      {...props}
    >
      {children}
    </a>
  )
}
