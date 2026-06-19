/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setAlwaysOnTop: (enabled: boolean) => void
  }
}
