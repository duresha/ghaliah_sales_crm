"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, Calendar, DollarSign, Target, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CompaniesView } from "@/components/companies-view"
import { ProposalsView } from "@/components/proposals-view"
import { ActivitiesView } from "@/components/activities-view"
import { RepresentativesView } from "@/components/representatives-view"

interface User {
  email: string
  role: "Admin" | "Manager" | "Rep"
  name: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
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

  if (!session?.user) {
    return null
  }

  const user: User = {
    email: session.user.email || "",
    name: session.user.name || "",
    role: (session.user as any).role || "Rep",
  }

  const stats = [
    {
      title: "Total Companies",
      value: user.role === "Rep" ? "12" : "48",
      change: "+12%",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Active Proposals",
      value: user.role === "Rep" ? "8" : "23",
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "This Month Revenue",
      value: user.role === "Rep" ? "$45K" : "$180K",
      change: "+23%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5%",
      icon: Target,
      color: "text-orange-600",
    },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            {user.role !== "Rep" && <TabsTrigger value="representatives">Team</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { company: "TechCorp Ltd", action: "Proposal sent", time: "2 hours ago", status: "success" },
                    { company: "Global Industries", action: "Follow-up call", time: "4 hours ago", status: "pending" },
                    { company: "StartupXYZ", action: "Meeting scheduled", time: "1 day ago", status: "info" },
                    { company: "Enterprise Co", action: "Proposal accepted", time: "2 days ago", status: "success" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{activity.company}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { company: "MegaCorp", task: "Follow-up on proposal", date: "Today, 3:00 PM", priority: "high" },
                    {
                      company: "TechStart",
                      task: "Schedule demo call",
                      date: "Tomorrow, 10:00 AM",
                      priority: "medium",
                    },
                    { company: "BusinessPro", task: "Send updated proposal", date: "Dec 12, 2:00 PM", priority: "low" },
                    {
                      company: "InnovateInc",
                      task: "Contract review meeting",
                      date: "Dec 15, 11:00 AM",
                      priority: "high",
                    },
                  ].map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{reminder.company}</p>
                        <p className="text-sm text-gray-600">{reminder.task}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            reminder.priority === "high"
                              ? "destructive"
                              : reminder.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {reminder.priority}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{reminder.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <CompaniesView userRole={user.role} />
          </TabsContent>

          <TabsContent value="proposals">
            <ProposalsView userRole={user.role} />
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesView userRole={user.role} />
          </TabsContent>

          {user.role !== "Rep" && (
            <TabsContent value="representatives">
              <RepresentativesView userRole={user.role} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
