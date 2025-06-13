"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Phone, Mail, FileText, Bell, Plus, Calendar } from "lucide-react"
import { ActivityForm } from "@/components/activity-form"

interface ActivityRecord {
  id: string
  activityId: string
  company: string
  proposal?: string
  activityType: "Call" | "Email" | "Note" | "Reminder"
  description: string
  rep: string
  date: string
  autoTriggered: boolean
  timestamp: string
}

const sampleActivities: ActivityRecord[] = [
  {
    id: "1",
    activityId: "ACT-001",
    company: "TechCorp Solutions",
    proposal: "PROP-2024-001",
    activityType: "Call",
    description: "Follow-up call regarding security training proposal. Client expressed interest in expanding scope.",
    rep: "Ahmed Al-Rashid",
    date: "2024-12-10",
    autoTriggered: false,
    timestamp: "2024-12-10T14:30:00Z",
  },
  {
    id: "2",
    activityId: "ACT-002",
    company: "Global Manufacturing Inc",
    activityType: "Reminder",
    description: "Automated reminder: Follow-up on penetration testing proposal due today",
    rep: "Sarah Al-Mahmoud",
    date: "2024-12-10",
    autoTriggered: true,
    timestamp: "2024-12-10T09:00:00Z",
  },
  {
    id: "3",
    activityId: "ACT-003",
    company: "Financial Services Co",
    proposal: "PROP-2024-003",
    activityType: "Email",
    description: "Sent contract documents and implementation timeline to client",
    rep: "Mohammed Al-Zahra",
    date: "2024-12-09",
    autoTriggered: false,
    timestamp: "2024-12-09T16:45:00Z",
  },
  {
    id: "4",
    activityId: "ACT-004",
    company: "Healthcare Systems Ltd",
    activityType: "Note",
    description: "Client meeting notes: Discussed HIPAA compliance requirements and training customization options",
    rep: "Fatima Al-Qasimi",
    date: "2024-12-08",
    autoTriggered: false,
    timestamp: "2024-12-08T11:15:00Z",
  },
  {
    id: "5",
    activityId: "ACT-005",
    company: "TechCorp Solutions",
    activityType: "Reminder",
    description: "Automated reminder: Proposal deadline approaching in 2 days",
    rep: "Ahmed Al-Rashid",
    date: "2024-12-08",
    autoTriggered: true,
    timestamp: "2024-12-08T08:00:00Z",
  },
]

interface ActivitiesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function ActivitiesView({ userRole }: ActivitiesViewProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>(sampleActivities)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [autoFilter, setAutoFilter] = useState<string>("all")

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || activity.activityType === typeFilter
    const matchesRep = repFilter === "all" || activity.rep === repFilter
    const matchesAuto =
      autoFilter === "all" ||
      (autoFilter === "auto" && activity.autoTriggered) ||
      (autoFilter === "manual" && !activity.autoTriggered)

    return matchesSearch && matchesType && matchesRep && matchesAuto
  })

  const handleAddActivity = (newActivity: ActivityRecord) => {
    setActivities((prev) => [...prev, newActivity])
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Call":
        return Phone
      case "Email":
        return Mail
      case "Note":
        return FileText
      case "Reminder":
        return Bell
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "Call":
        return "text-blue-600"
      case "Email":
        return "text-green-600"
      case "Note":
        return "text-purple-600"
      case "Reminder":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const uniqueReps = [...new Set(activities.map((a) => a.rep))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          <p className="text-gray-600">Track all interactions and automated activities</p>
        </div>
        <Button onClick={() => setShowActivityForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Note">Note</SelectItem>
            <SelectItem value="Reminder">Reminder</SelectItem>
          </SelectContent>
        </Select>
        <Select value={repFilter} onValueChange={setRepFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Representative" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reps</SelectItem>
            {uniqueReps.map((rep) => (
              <SelectItem key={rep} value={rep}>
                {rep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={autoFilter} onValueChange={setAutoFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="auto">Automated</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Representative</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.activityType)
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${getActivityColor(activity.activityType)}`} />
                      <div>
                        <div className="font-medium">{activity.activityType}</div>
                        <div className="text-xs text-gray-500">{activity.activityId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.company}</div>
                      {activity.proposal && <div className="text-xs text-gray-500">{activity.proposal}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-md truncate" title={activity.description}>
                      {activity.description}
                    </p>
                  </TableCell>
                  <TableCell>{activity.rep}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {activity.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={activity.autoTriggered ? "secondary" : "outline"}>
                      {activity.autoTriggered ? "Auto" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              {activities.filter((a) => !a.autoTriggered).length} manual,{" "}
              {activities.filter((a) => a.autoTriggered).length} automated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.date === "2024-12-10").length}</div>
            <p className="text-xs text-muted-foreground">Active day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.activityType === "Call").length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter((a) => a.activityType === "Reminder" && a.autoTriggered).length}
            </div>
            <p className="text-xs text-muted-foreground">Automated alerts</p>
          </CardContent>
        </Card>
      </div>
      {showActivityForm && (
        <ActivityForm onClose={() => setShowActivityForm(false)} onSubmit={handleAddActivity} userRole={userRole} />
      )}
    </div>
  )
}
