"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Users, Mail, Phone } from "lucide-react"

interface RepresentativeFormProps {
  onClose: () => void
  onSubmit: (repData: any) => void
  userRole: "Admin" | "Manager" | "Rep"
}

interface RepresentativeData {
  name: string
  email: string
  role: "Rep" | "Manager" | "Admin"
  phone: string
}

export function RepresentativeForm({ onClose, onSubmit, userRole }: RepresentativeFormProps) {
  const [formData, setFormData] = useState<RepresentativeData>({
    name: "",
    email: "",
    role: "Rep",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newRepresentative = {
        id: Date.now().toString(),
        ...formData,
        assignedCompanies: 0,
        assignedProposals: 0,
        totalRevenue: 0,
        conversionRate: 0,
        lastActivity: new Date().toISOString().split("T")[0],
      }
      onSubmit(newRepresentative)
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  const isFormValid = formData.name && formData.email && formData.phone

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
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="pl-10"
                  required
                />
              </div>
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
                onValueChange={(value: "Rep" | "Manager" | "Admin") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rep">Sales Representative</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  {userRole === "Admin" && <SelectItem value="Admin">Admin</SelectItem>}
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
