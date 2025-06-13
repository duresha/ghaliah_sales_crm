"use client"

import { useState, useEffect } from "react"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always wrap children in SessionProvider, regardless of mounted state
  // This ensures session is available during both SSR and client-side rendering
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
