"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Activity, Calendar } from "lucide-react"

interface ActivityFormProps {
  onClose: () => void
  onSubmit: (activityData: any) => void
  userRole: "Admin" | "Manager" | "Rep"
}

interface ActivityData {
  company: string
  proposal?: string
  activityType: "Call" | "Email" | "Note" | "Reminder"
  description: string
  rep: string
  date: string
}

const companies = [
  "TechCorp Solutions",
  "Global Manufacturing Inc",
  "Financial Services Co",
  "Healthcare Systems Ltd",
  "StartupXYZ",
  "Enterprise Co",
]

const proposals = ["PROP-2024-001", "PROP-2024-002", "PROP-2024-003", "PROP-2024-004", "PROP-2024-005"]

const representatives = ["Ahmed Al-Rashid", "Sarah Al-Mahmoud", "Mohammed Al-Zahra", "Fatima Al-Qasimi"]

export function ActivityForm({ onClose, onSubmit, userRole }: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityData>({
    company: "",
    proposal: "",
    activityType: "Call",
    description: "",
    rep: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newActivity = {
        id: Date.now().toString(),
        activityId: `ACT-${String(Date.now()).slice(-3)}`,
        ...formData,
        autoTriggered: false,
        timestamp: new Date().toISOString(),
      }
      onSubmit(newActivity)
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  const isFormValid = formData.company && formData.activityType && formData.description && formData.rep && formData.date

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Add New Activity
              </CardTitle>
              <CardDescription>Record a new activity or interaction</CardDescription>
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
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, company: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal">Related Proposal (Optional)</Label>
                <Select
                  value={formData.proposal}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, proposal: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proposal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No proposal</SelectItem>
                    {proposals.map((proposal) => (
                      <SelectItem key={proposal} value={proposal}>
                        {proposal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type *</Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(value: "Call" | "Email" | "Note" | "Reminder") =>
                    setFormData((prev) => ({ ...prev, activityType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Note">Note</SelectItem>
                    <SelectItem value="Reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rep">Representative *</Label>
                <Select
                  value={formData.rep}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, rep: value }))}
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the activity, what was discussed, outcomes, next steps..."
                rows={4}
                required
              />
            </div>
          </CardContent>

          <div className="flex justify-between p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Adding Activity..." : "Add Activity"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
