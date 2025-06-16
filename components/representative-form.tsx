"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Users, Mail, Phone } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface RepresentativeFormProps {
  onClose: () => void
  onSubmit: (repData: any) => void
  userRole: "Admin" | "Manager" | "Rep"
}

interface RepresentativeData {
  name: string
  email: string
  role: "rep" | "manager" | "admin"
  phone: string
}

export function RepresentativeForm({ onClose, onSubmit, userRole }: RepresentativeFormProps) {
  const [formData, setFormData] = useState<RepresentativeData>({
    name: "",
    email: "",
    role: "rep",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEmailError("")

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", formData.email)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error("Error checking email uniqueness")
      }

      if (existingUser) {
        setEmailError("This email address is already registered")
        setIsSubmitting(false)
        return
      }

      // Insert new user
      const { data, error } = await supabase.from("users").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        auth_id: null,
        temp_password: true,
      }).select()

      if (error) {
        console.error("Supabase error details:", error)
        throw error
      }

      // Show success toast
      toast({
        title: "Success",
        description: "New team member added successfully",
      })

      // Add user to local state via onSubmit callback
      if (data && data.length > 0) {
        const newRepresentative = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          role: data[0].role as "Rep" | "Manager" | "Admin",
          phone: data[0].phone || "",
          assignedCompanies: 0,
          assignedProposals: 0,
          totalRevenue: 0,
          conversionRate: 0,
          lastActivity: new Date().toISOString().split("T")[0],
        }
        onSubmit(newRepresentative)
      }
      
      setIsSubmitting(false)
      onClose()
    } catch (error: any) {
      console.error("Error adding new representative:", error)
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.email && formData.phone && !emailError

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add New Representative
              </CardTitle>
              <CardDescription>Add a new team member to the CRM</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    setEmailError("")
                  }}
                  placeholder="Enter email address"
                  className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+966 50 123 4567"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "rep" | "manager" | "admin") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rep">Sales Representative</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  {userRole === "Admin" && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <div className="flex justify-between p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Adding Representative..." : "Add Representative"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
