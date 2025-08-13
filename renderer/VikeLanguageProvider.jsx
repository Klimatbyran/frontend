import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export function VikeLanguageProvider({ children, pageContext }) {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('sv')

  useEffect(() => {
    // Bestäm språk baserat på URL från pageContext
    const url = pageContext?.urlOriginal || '/'
    const lang = url.startsWith('/en') ? 'en' : 'sv'
    setCurrentLanguage(lang)
    i18n.changeLanguage(lang)
  }, [pageContext?.urlOriginal, i18n])

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang)
    i18n.changeLanguage(lang)
    
    // Navigera till rätt språkversion
    const currentPath = pageContext?.urlOriginal || '/'
    let newPath
    
    if (lang === 'en') {
      newPath = currentPath.startsWith('/sv') 
        ? currentPath.replace('/sv', '/en')
        : `/en${currentPath}`
    } else {
      newPath = currentPath.startsWith('/en')
        ? currentPath.replace('/en', '/sv')
        : `/sv${currentPath}`
    }
    
    window.location.href = newPath
  }

  const value = {
    currentLanguage,
    changeLanguage,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a VikeLanguageProvider')
  }
  return context
}
