"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Phone, Mail, FileText, Bell, Plus, Calendar, X, Loader2 } from "lucide-react"
import { ActivityForm } from "@/components/activity-form"
import { Textarea } from "@/components/ui/textarea"

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

// Sample companies and proposals for dropdowns
const sampleCompanies = [
  "TechCorp Solutions",
  "Global Manufacturing Inc",
  "Financial Services Co",
  "Healthcare Systems Ltd",
  "Retail Innovations",
  "Education Tech Ltd",
  "Logistics Pro"
];

const sampleProposals = [
  "PROP-2024-001",
  "PROP-2024-002",
  "PROP-2024-003",
  "PROP-2024-004",
  "PROP-2024-005"
];

const sampleReps = [
  "Ahmed Al-Rashid",
  "Sarah Al-Mahmoud",
  "Mohammed Al-Zahra",
  "Fatima Al-Qasimi"
];

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
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedActivity, setEditedActivity] = useState<ActivityRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Invalid time";
    }
  }

  const handleStartEditing = () => {
    if (selectedActivity) {
      setEditedActivity({...selectedActivity});
      setIsEditing(true);
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedActivity(null);
  }

  const handleSaveEdit = () => {
    if (!editedActivity) return;
    
    setIsSaving(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Update the activity in the activities array
      const updatedActivities = activities.map(activity => 
        activity.id === editedActivity.id ? editedActivity : activity
      );
      
      setActivities(updatedActivities);
      setSelectedActivity(editedActivity);
      setIsEditing(false);
      setEditedActivity(null);
      setIsSaving(false);
    }, 500);
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

      <Card className="table-card-glassmorphism">
        <Table>
          <TableHeader className="table-header-glassmorphism">
            <TableRow>
              <TableHead className="table-header-cell">Activity</TableHead>
              <TableHead className="table-header-cell">Company</TableHead>
              <TableHead className="table-header-cell">Description</TableHead>
              <TableHead className="table-header-cell">Representative</TableHead>
              <TableHead className="table-header-cell">Date & Source</TableHead>
              <TableHead className="table-header-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow className="table-row-glassmorphism">
                <TableCell className="table-cell-glassmorphism" colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative mx-auto w-10 h-10 mb-3">
                      <FileText className="h-10 w-10 text-gray-300" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="h-2 w-2 text-red-500" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No activities found</p>
                    <p className="text-xs text-gray-500 mb-3">Add your first activity to get started</p>
                    <Button size="sm" onClick={() => setShowActivityForm(true)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Activity
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.activityType)
                return (
                  <TableRow key={activity.id} className="table-row-glassmorphism">
                    <TableCell className="table-cell-glassmorphism">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${getActivityColor(activity.activityType)}`} />
                        <div>
                          <div className="font-medium">{activity.activityType}</div>
                          <div className="text-xs text-gray-500">{activity.activityId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <div>
                        <div className="font-medium">{activity.company}</div>
                        {activity.proposal && <div className="text-xs text-gray-500">{activity.proposal}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <p className="text-sm max-w-md truncate" title={activity.description}>
                        {activity.description}
                      </p>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">{activity.rep}</TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <div className="font-medium">{activity.date}</div>
                      <div className="text-xs text-gray-500">
                        <Badge variant={activity.autoTriggered ? "secondary" : "outline"} className="text-xs">
                          {activity.autoTriggered ? "Auto" : "Manual"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(activity)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <div className="stats-card-icon-blue">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              {activities.filter((a) => !a.autoTriggered).length} manual,{" "}
              {activities.filter((a) => a.autoTriggered).length} automated
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <div className="stats-card-icon-purple">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.date === "2024-12-10").length}</div>
            <p className="text-xs text-muted-foreground">Active day</p>
          </CardContent>
        </Card>
        <Card className="stats-card-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
            <div className="stats-card-icon-green">
              <Phone className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.activityType === "Call").length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card className="stats-card-amber">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
            <div className="stats-card-icon-amber">
              <Bell className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter((a) => a.activityType === "Reminder" && a.autoTriggered).length}
            </div>
            <p className="text-xs text-muted-foreground">Automated alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity View Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = getActivityIcon(selectedActivity.activityType);
                    return <IconComponent className={`h-5 w-5 ${getActivityColor(selectedActivity.activityType)}`} />;
                  })()}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedActivity.activityType}
                      <Badge variant={selectedActivity.autoTriggered ? "secondary" : "outline"} className="ml-2">
                        {selectedActivity.autoTriggered ? "Automated" : "Manual"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedActivity.activityId}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (userRole === "Admin" || userRole === "Manager") && (
                    <Button variant="outline" onClick={handleStartEditing}>
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => {
                    setSelectedActivity(null);
                    setIsEditing(false);
                    setEditedActivity(null);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  {isEditing ? (
                    <Select 
                      value={editedActivity?.company} 
                      onValueChange={(value) => {
                        setEditedActivity(prev => prev ? {...prev, company: value} : null);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleCompanies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-semibold">{selectedActivity.company}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Date & Time</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{selectedActivity.date}</span>
                    <span className="text-gray-500">at {formatTimestamp(selectedActivity.timestamp)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Related Proposal</label>
                  {isEditing ? (
                    <Select 
                      value={editedActivity?.proposal || "none"} 
                      onValueChange={(value) => {
                        setEditedActivity(prev => prev ? {
                          ...prev, 
                          proposal: value === "none" ? undefined : value
                        } : null);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Select proposal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {sampleProposals.map((proposal) => (
                          <SelectItem key={proposal} value={proposal}>
                            {proposal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{selectedActivity.proposal || "None"}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Representative</label>
                  {isEditing ? (
                    <Select 
                      value={editedActivity?.rep} 
                      onValueChange={(value) => {
                        setEditedActivity(prev => prev ? {...prev, rep: value} : null);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Select representative" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleReps.map((rep) => (
                          <SelectItem key={rep} value={rep}>
                            {rep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{selectedActivity.rep}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea 
                    className="mt-2"
                    value={editedActivity?.description || ""}
                    onChange={(e) => {
                      setEditedActivity(prev => prev ? {...prev, description: e.target.value} : null);
                    }}
                    rows={3}
                  />
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border text-sm">
                    {selectedActivity.description}
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="h-4 w-4" />
                    <span>
                      {selectedActivity.autoTriggered 
                        ? "This activity was automatically generated by the system." 
                        : "This activity was manually recorded."}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            
            {isEditing && (
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
      
      {showActivityForm && (
        <ActivityForm onClose={() => setShowActivityForm(false)} onSubmit={handleAddActivity} userRole={userRole} />
      )}
    </div>
  )
}
