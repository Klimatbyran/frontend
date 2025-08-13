// Vike-kompatibla navigation hooks och komponenter
import { usePageContext } from 'vike/client'

export function useVikeLocation() {
  const pageContext = usePageContext()
  return {
    pathname: pageContext.urlOriginal || '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }
}

export function useVikeNavigate() {
  return (to) => {
    window.location.href = to
  }
}

export function VikeLink({ to, children, className, ...props }) {
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

export function VikeNavLink({ to, children, className, activeClassName, ...props }) {
  const location = useVikeLocation()
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
