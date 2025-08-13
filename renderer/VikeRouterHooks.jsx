import { createContext, useContext } from 'react'

// Skapa en kontext för Vike router-information
const VikeRouterContext = createContext()

export function VikeRouterProvider({ children, pageContext }) {
  const value = {
    location: {
      pathname: pageContext?.urlOriginal || '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    },
    navigate: (to) => {
      window.location.href = to
    }
  }

  return (
    <VikeRouterContext.Provider value={value}>
      {children}
    </VikeRouterContext.Provider>
  )
}

// Vike-kompatibla hooks som ersätter React Router hooks
export function useLocation() {
  const context = useContext(VikeRouterContext)
  if (!context) {
    // Fallback för när vi inte har kontext
    return {
      pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
      search: typeof window !== 'undefined' ? window.location.search : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'default'
    }
  }
  return context.location
}

export function useNavigate() {
  const context = useContext(VikeRouterContext)
  if (!context) {
    // Fallback för när vi inte har kontext
    return (to) => {
      if (typeof window !== 'undefined') {
        window.location.href = to
      }
    }
  }
  return context.navigate
}
