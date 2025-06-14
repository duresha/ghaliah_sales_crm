"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Building2, Calendar, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

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
  assigned_rep: string  // Changed to match Supabase schema
  reminder_date: string // Changed to match Supabase schema
  deadline_date: string // Added to match requirements
  tags: string[]
  notes: string
}

interface Representative {
  id: string
  name: string
  email: string
  role: string
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
    assigned_rep: "",
    reminder_date: "",
    deadline_date: "",
    tags: [],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Fetch representatives from Supabase
  useEffect(() => {
    async function fetchRepresentatives() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, role")
          .in("role", ["rep", "manager"])
          .order("name")
        
        if (error) {
          throw error
        }
        
        setRepresentatives(data || [])
      } catch (error: any) {
        console.error("Error fetching representatives:", error.message)
        toast({
          title: "Error",
          description: "Failed to load representatives. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRepresentatives()
  }, [toast])

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) {
      errors.name = "Company name is required"
    }
    
    if (!formData.industry) {
      errors.industry = "Industry is required"
    }
    
    if (!formData.region) {
      errors.region = "Region is required"
    }
    
    if (!formData.assigned_rep) {
      errors.assigned_rep = "Assigned representative is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)

    try {
      console.log("Submitting company data:", {
        name: formData.name,
        industry: formData.industry,
        region: formData.region,
        status: formData.status,
        assigned_rep: formData.assigned_rep,
        reminder_date: formData.reminder_date || null,
        deadline_date: formData.deadline_date || null,
        notes: formData.notes || null,
        tags: formData.tags,
      });
      
      // Insert company data into the companies table
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: formData.name,
          industry: formData.industry,
          region: formData.region,
          status: formData.status,
          assigned_rep: formData.assigned_rep,
          reminder_date: formData.reminder_date || null,
          deadline_date: formData.deadline_date || null,
          notes: formData.notes || null,
          tags: formData.tags,
        })
        .select()

      if (companyError) {
        console.error("Error details:", companyError);
        throw companyError;
      }
      
      console.log("Successfully created company:", companyData);

      toast({
        title: "Success",
        description: "Company added successfully",
      })

      // Transform data to match the expected format in the parent component
      const newCompany = {
        id: companyData?.[0]?.id || '',
        name: formData.name,
        industry: formData.industry,
        region: formData.region,
        status: formData.status,
        assignedRep: representatives.find(rep => rep.id === formData.assigned_rep)?.name || '',
        reminderDate: formData.reminder_date,
        deadlineDate: formData.deadline_date,
        tags: formData.tags,
        notes: formData.notes,
        createdTime: new Date().toISOString().split('T')[0]
      }

      onSubmit(newCompany)
      setIsSubmitting(false)
      onClose()
    } catch (error: any) {
      console.error("Error adding company:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add company. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.industry && formData.region && formData.assigned_rep

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
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: "" }))
                    }
                  }}
                  placeholder="Enter company name"
                  className={formErrors.name ? "border-red-500" : ""}
                  required
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, industry: value }))
                    if (formErrors.industry) {
                      setFormErrors(prev => ({ ...prev, industry: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.industry ? "border-red-500" : ""}>
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
                {formErrors.industry && <p className="text-red-500 text-xs mt-1">{formErrors.industry}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, region: value }))
                    if (formErrors.region) {
                      setFormErrors(prev => ({ ...prev, region: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.region ? "border-red-500" : ""}>
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
                {formErrors.region && <p className="text-red-500 text-xs mt-1">{formErrors.region}</p>}
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
                <Label htmlFor="assigned_rep">Assigned Representative *</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Loading representatives...</p>
                  </div>
                ) : (
                  <Select
                    value={formData.assigned_rep}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, assigned_rep: value }))
                      if (formErrors.assigned_rep) {
                        setFormErrors(prev => ({ ...prev, assigned_rep: "" }))
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.assigned_rep ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select representative" />
                    </SelectTrigger>
                    <SelectContent>
                      {representatives.map((rep) => (
                        <SelectItem key={rep.id} value={rep.id}>
                          {rep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formErrors.assigned_rep && <p className="text-red-500 text-xs mt-1">{formErrors.assigned_rep}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_date">Reminder Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reminder_date"
                    type="date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reminder_date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline_date">Deadline Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="deadline_date"
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline_date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Priority</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="High Priority"
                        checked={formData.tags.includes("High Priority")}
                        onCheckedChange={() => handleTagToggle("High Priority")}
                      />
                      <Label htmlFor="High Priority" className="text-sm">
                        High Priority
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Medium Priority"
                        checked={formData.tags.includes("Medium Priority")}
                        onCheckedChange={() => handleTagToggle("Medium Priority")}
                      />
                      <Label htmlFor="Medium Priority" className="text-sm">
                        Medium Priority
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Low Priority"
                        checked={formData.tags.includes("Low Priority")}
                        onCheckedChange={() => handleTagToggle("Low Priority")}
                      />
                      <Label htmlFor="Low Priority" className="text-sm">
                        Low Priority
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Company Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Large Company"
                        checked={formData.tags.includes("Large Company")}
                        onCheckedChange={() => handleTagToggle("Large Company")}
                      />
                      <Label htmlFor="Large Company" className="text-sm">
                        Large Company
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="SME"
                        checked={formData.tags.includes("SME")}
                        onCheckedChange={() => handleTagToggle("SME")}
                      />
                      <Label htmlFor="SME" className="text-sm">
                        SME
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Government"
                        checked={formData.tags.includes("Government")}
                        onCheckedChange={() => handleTagToggle("Government")}
                      />
                      <Label htmlFor="Government" className="text-sm">
                        Government
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Private"
                        checked={formData.tags.includes("Private")}
                        onCheckedChange={() => handleTagToggle("Private")}
                      />
                      <Label htmlFor="Private" className="text-sm">
                        Private
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Lead Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Urgent"
                        checked={formData.tags.includes("Urgent")}
                        onCheckedChange={() => handleTagToggle("Urgent")}
                      />
                      <Label htmlFor="Urgent" className="text-sm">
                        Urgent
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Follow-up Required"
                        checked={formData.tags.includes("Follow-up Required")}
                        onCheckedChange={() => handleTagToggle("Follow-up Required")}
                      />
                      <Label htmlFor="Follow-up Required" className="text-sm">
                        Follow-up Required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="Hot Lead"
                        checked={formData.tags.includes("Hot Lead")}
                        onCheckedChange={() => handleTagToggle("Hot Lead")}
                      />
                      <Label htmlFor="Hot Lead" className="text-sm">
                        Hot Lead
                      </Label>
                    </div>
                  </div>
                </div>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Company...
                </>
              ) : (
                "Create Company"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
