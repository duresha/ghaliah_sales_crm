"use client"

import { useState, useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Remove test toast
  }, [])

  // Always wrap children in SessionProvider, regardless of mounted state
  // This ensures session is available during both SSR and client-side rendering
  return (
    <SessionProvider>
      {children}
      {/* Add Toaster at the root level to ensure it's always available */}
      <Toaster />
    </SessionProvider>
  )
}
