// frontend/src/components/TranslationDebug.jsx
'use client'

import { useState } from 'react'
import { useTranslationContext } from '@/contexts/TranslationContext'

export default function TranslationDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [testKey, setTestKey] = useState('nav.home')
  
  const { 
    t, 
    currentLocale, 
    translations, 
    loading, 
    error, 
    isBackendConnected,
    reloadTranslations, 
    clearCache,
    getTranslationStats
  } = useTranslationContext()

  // Показуємо тільки в development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const stats = getTranslationStats()

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-colors ${
          error ? 'bg-red-600 hover:bg-red-700' : 
          loading ? 'bg-yellow-600 hover:bg-yellow-700' : 
          'bg-green-600 hover:bg-green-700'
        } text-white`}
        title="Translation Debug"
      >
        🌐 {stats.totalTranslations}
        {loading && <div className="animate-ping absolute inset-0 rounded-full bg-white opacity-25"></div>}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">🌐 Context Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm space-y-1">
            <div><strong>Locale:</strong> {currentLocale}</div>
            <div><strong>Backend:</strong> {isBackendConnected ? '✅ Connected' : '❌ Disconnected'}</div>
            <div><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</div>
            <div><strong>Translations:</strong> {stats.totalTranslations}</div>
            <div><strong>Cache Size:</strong> {stats.cacheSize}</div>
            {error && <div className="text-red-600"><strong>Error:</strong> {error}</div>}
          </div>

          {/* Actions */}
          <div className="mb-4 space-y-2">
            <button
              onClick={reloadTranslations}
              disabled={loading}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              🔄 Reload Translations
            </button>
            <button
              onClick={clearCache}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              🗑️ Clear Cache
            </button>
          </div>

          {/* Test Translation */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Test Key:</label>
            <input
              type="text"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="nav.home"
            />
            <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
              <strong>Result:</strong> "{t(testKey, `[Missing: ${testKey}]`)}"
            </div>
          </div>

          {/* Quick Test Keys */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quick Tests:</label>
            <div className="space-y-1 text-xs">
              {['nav.home', 'common.loading', 'hero.title', 'services.title'].map(key => (
                <button
                  key={key}
                  onClick={() => setTestKey(key)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {key}: "{t(key, 'N/A')}"
                </button>
              ))}
            </div>
          </div>

          {/* Recent Keys */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Sample Keys:</h4>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {Object.keys(translations).slice(0, 8).map(key => (
                <div key={key} className="truncate cursor-pointer hover:bg-gray-100 p-1 rounded"
                     onClick={() => setTestKey(key)}>
                  <span className="text-blue-600 font-mono">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

