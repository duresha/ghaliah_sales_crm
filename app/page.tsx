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
import { Mail, Lock, UserCircle2, LineChart, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SparklesCore } from "@/components/ui/sparkles"
import { GradientButton } from "@/components/ui/gradient-button"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Set page title
  useEffect(() => {
    document.title = "Ghaliah Sales | Welcome"
    return () => {
      document.title = "Ghaliah Sales CRM" // Reset on unmount
    }
  }, [])

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-800 via-purple-900 to-slate-900"></div>
      
      {/* Particles Effect */}
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#e9d5ff"
          speed={0.8}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 relative z-10 w-full max-w-4xl mx-auto">
        {/* Login Card */}
        <Card className="w-full md:w-1/2 max-w-md relative z-10 shadow-xl bg-white/90 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center justify-center mb-3">
              <Image 
                src="/images/logo.png"
                alt="Ghaliah Sales Logo"
                width={56}
                height={56}
                className="mb-2"
                priority
              />
              <h1 className="text-2xl font-bold text-gray-900">Ghaliah Sales</h1>
            </div>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your CRM account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-900">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Email</TabsTrigger>
                <TabsTrigger value="google" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Google</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-2">
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
                        className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                        className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <GradientButton type="submit" className="w-full py-2" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </GradientButton>
                </form>
              </TabsContent>

              <TabsContent value="google" className="space-y-4 mt-2">
                <GradientButton 
                  onClick={handleGoogleLogin} 
                  variant="variant" 
                  className="w-full py-2 flex items-center justify-center" 
                  disabled={isLoading}
                >
                  <Image 
                    src="/images/google-logo.png"
                    alt="Google"
                    width={16}
                    height={16}
                    className="mr-2 h-4 w-4"
                  />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </GradientButton>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-xs text-gray-600">
              <p className="font-medium">Accounts:</p>
              <p>rawan@gmail.com / admin@123</p>
              <p>rawam_manager@gmail.com / manager@123</p>
              <p>rep@gmail.com / rep@123</p>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button 
                variant="link" 
                className="text-purple-600 hover:text-purple-700 text-sm"
                onClick={() => router.push('/about')}
              >
                About Ghaliah
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Info Card with Glassmorphism */}
        <div className="w-full md:w-1/2 max-w-md backdrop-blur-md bg-purple-500/20 rounded-lg p-8 shadow-lg border border-white/20 text-white hidden md:flex flex-col">
          <div className="space-y-8 flex-grow">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Ghaliah Sales</h2>
              <div className="h-1 w-20 bg-white/60 rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <UserCircle2 className="h-6 w-6 text-purple-300 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">Streamline Your Sales</h3>
                  <p className="text-white/80 text-sm">Manage your client relationships, track proposals, and boost your team's performance all in one place.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <LineChart className="h-6 w-6 text-purple-300 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">Real-time Analytics</h3>
                  <p className="text-white/80 text-sm">Get comprehensive insights into your sales pipeline and make data-driven decisions.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-purple-300 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">Team Collaboration</h3>
                  <p className="text-white/80 text-sm">Keep your entire team aligned with shared contacts, activities and progress tracking.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm text-white/70">
            <p>© {new Date().getFullYear()} Ghaliah Sales. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
