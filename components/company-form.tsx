"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Building2, Calendar } from "lucide-react"

interface CompanyFormProps {
  onClose: () => void
  onSubmit: (companyData: any) => void
  userRole: "Admin" | "Manager" | "Rep"
}

interface CompanyData {
  name: string
  industry: string
  region: string
  status: "Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed"
  assignedRep: string
  reminderDate: string
  deadlineDate: string
  tags: string[]
  notes: string
}

const industries = [
  "Technology",
  "Manufacturing",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Construction",
  "Energy",
  "Transportation",
  "Government",
]

const regions = ["Riyadh", "Jeddah", "Dubai", "Kuwait", "Doha", "Abu Dhabi", "Manama", "Muscat"]

const representatives = ["Ahmed Al-Rashid", "Sarah Al-Mahmoud", "Mohammed Al-Zahra", "Fatima Al-Qasimi"]

const availableTags = [
  "High Priority",
  "Medium Priority",
  "Low Priority",
  "Large Company",
  "SME",
  "Government",
  "Private",
  "Urgent",
  "Follow-up Required",
  "Hot Lead",
]

export function CompanyForm({ onClose, onSubmit, userRole }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyData>({
    name: "",
    industry: "",
    region: "",
    status: "Lead",
    assignedRep: "",
    reminderDate: "",
    deadlineDate: "",
    tags: [],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newCompany = {
        id: Date.now().toString(),
        ...formData,
        createdTime: new Date().toISOString().split("T")[0],
      }
      onSubmit(newCompany)
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  const isFormValid = formData.name && formData.industry && formData.region && formData.assignedRep

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Add New Company
              </CardTitle>
              <CardDescription>Create a new company record in the CRM</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedRep">Assigned Representative *</Label>
                <Select
                  value={formData.assignedRep}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedRep: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select representative" />
                  </SelectTrigger>
                  <SelectContent>
                    {representatives.map((rep) => (
                      <SelectItem key={rep} value={rep}>
                        {rep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderDate">Reminder Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reminderDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadlineDate">Deadline Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="deadlineDate"
                    type="date"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadlineDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <Label htmlFor={tag} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about the company..."
                rows={3}
              />
            </div>
          </CardContent>

          <div className="flex justify-between p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Creating Company..." : "Create Company"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
