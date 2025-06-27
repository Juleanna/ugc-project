// src/components/NoSSR.jsx - Компонент для відключення SSR
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Простий NoSSR компонент
export function NoSSR({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback
  }

  return children
}

// Хук для перевірки чи ми на клієнті
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// HOC для відключення SSR
export function withNoSSR(Component, fallback = null) {
  const NoSSRComponent = (props) => {
    return (
      <NoSSR fallback={fallback}>
        <Component {...props} />
      </NoSSR>
    )
  }

  NoSSRComponent.displayName = `withNoSSR(${Component.displayName || Component.name})`
  
  return NoSSRComponent
}

export default NoSSR