"use client"

import type React from "react"
import Image from "next/image"

import { useState, useMemo } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, Bell, Globe, ExternalLink } from "lucide-react"
import { LucideUser } from "lucide-react"

interface UserProps {
  email: string
  role: "Admin" | "Manager" | "Rep"
  name: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: UserProps
}

// Function to generate consistent gradient colors based on user email
function generateGradientColors(email: string): [string, string] {
  // Simple hash function to get a deterministic but unique value from the email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate two colors with good contrast
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40 + Math.abs((hash >> 8) % 180)) % 360; // Offset by at least 40 degrees
  
  const saturation = 70 + Math.abs((hash >> 4) % 30); // 70-100%
  const lightness = 55 + Math.abs((hash >> 6) % 15); // 55-70%
  
  return [
    `hsl(${hue1}, ${saturation}%, ${lightness}%)`,
    `hsl(${hue2}, ${saturation}%, ${lightness}%)`
  ];
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const router = useRouter()

  // Generate gradient colors based on user email
  const gradientColors = useMemo(() => 
    generateGradientColors(user.email),
    [user.email]
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive"
      case "Manager":
        return "default"
      case "Rep":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ghaliah Sales</h1>
                <p className="text-xs text-gray-500">Sales CRM System</p>
              </div>
            </div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/images/logo.png"
                alt="Ghaliah Sales Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Learn Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-colors"
                onClick={() => window.open("https://ghaliah.sulitechkw.com/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn
              </Button>

              {/* //TODO: Add language toggle  and Notification bell*/}
              {/* <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                <Globe className="h-4 w-4 mr-2" />
                {language === "en" ? "العربية" : "English"}
              </Button>

              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback 
                        style={{
                          backgroundImage: `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                          backgroundSize: '300% 300%',
                          animation: 'gradient-wave 8s ease infinite',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant={getRoleBadgeColor(user.role)} className="w-fit mt-1">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* //TODO: Add profile and settings */}
                  {/* <DropdownMenuItem>
                    <LucideUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Global styles for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-wave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
