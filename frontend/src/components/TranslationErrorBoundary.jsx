import React from 'react'

class TranslationErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Translation Error:', error, errorInfo)
    
    // Відправити помилку в систему моніторингу
    // analytics.track('translation_error', { error, errorInfo })
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '1px solid #f00' }}>
          <h3>⚠️ Помилка завантаження перекладів</h3>
          <p>Сторінка працює в режимі за замовчуванням.</p>
          <button onClick={() => window.location.reload()}>
            Перезавантажити сторінку
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// Використання в layout:
export default function Layout({ children }) {
  return (
    <TranslationErrorBoundary>
      <TranslationProvider>
        {children}
      </TranslationProvider>
    </TranslationErrorBoundary>
  )
}