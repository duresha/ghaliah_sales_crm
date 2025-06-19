"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SparklesCore } from "@/components/ui/sparkles"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for auth errors from URL
  useEffect(() => {
    const authError = searchParams.get("error")
    if (authError) {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "authenticated") {
    return null // Will redirect
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.")
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Google login error:", error)
      setError("An error occurred during Google login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Sparkles Background */}
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
      </div>
      
      {/* Login Card */}
      <Card className="w-full max-w-md mx-auto relative z-10">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <Image 
              src="/images/logo.png"
              alt="Ghaliah Sales Logo"
              width={48}
              height={48}
              className="mb-2"
            />
            <h1 className="text-2xl font-bold text-gray-900">Ghaliah Sales</h1>
          </div>
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your CRM account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="google" className="space-y-4">
              <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={isLoading}>
                <Image 
                  src="/images/google-logo.png"
                  alt="Google"
                  width={16}
                  height={16}
                  className="mr-2 h-4 w-4"
                />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Accounts:</p>
            <p>rawan@gmail.com / admin@123</p>
            <p>rawam_manager@gmail.com / manager@123</p>
            <p>rep@gmail.com / rep@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
