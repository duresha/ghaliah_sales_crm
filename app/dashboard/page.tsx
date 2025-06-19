"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, Calendar, DollarSign, Target, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CompaniesView } from "@/components/companies-view"
import { ProposalsView } from "@/components/proposals-view"
import { ActivitiesView } from "@/components/activities-view"
import { RepresentativesView } from "@/components/representatives-view"
import { supabase } from "@/lib/supabaseClient"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

interface User {
  email: string
  role: "Admin" | "Manager" | "Rep"
  name: string
}

interface StatsData {
  totalCompanies: string;
  activeProposals: string;
  monthlyRevenue: string;
  conversionRate: string;
  conversionChange: string;
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [statsData, setStatsData] = useState<StatsData>({
    totalCompanies: "0",
    activeProposals: "0",
    monthlyRevenue: "$0K",
    conversionRate: "0%",
    conversionChange: "0%"
  })
  const [isLoading, setIsLoading] = useState(true)

  const user: User = {
    email: session?.user?.email || "",
    name: session?.user?.name || "",
    role: (session?.user as any)?.role || "Rep",
  }

  // Update document title based on active tab
  useEffect(() => {
    const titles = {
      overview: "Overview Dashboard | Ghaliah",
      companies: "Manage Companies and Leads | Ghaliah",
      proposals: "Create and Manage Proposals | Ghaliah",
      activities: "Log and Track Activities | Ghaliah",
      representatives: "View Team Performance | Ghaliah"
    };
    
    document.title = titles[activeTab as keyof typeof titles] || titles.overview;
  }, [activeTab]);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      
      try {
        // Get total companies count
        const { count: companiesCount, error: companiesError } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
        
        if (companiesError) throw companiesError
        
        // Get active proposals (non-draft)
        const { count: proposalsCount, error: proposalsError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'Draft')
          
        if (proposalsError) throw proposalsError
        
        // Get this month's revenue from active proposals
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)
        const lastDayOfMonth = endOfMonth(now)
        
        const { data: revenueData, error: revenueError } = await supabase
          .from('proposals')
          .select('total_price')
          .in('status', ['Sent', 'Accepted'])
          .gte('created_at', firstDayOfMonth.toISOString())
          .lte('created_at', lastDayOfMonth.toISOString())
          
        if (revenueError) throw revenueError
        
        // Calculate total revenue
        const totalRevenue = revenueData.reduce((sum, proposal) => {
          return sum + (proposal.total_price || 0)
        }, 0)
        
        // Format the revenue as $XK
        const formattedRevenue = `KWD ${Math.round(totalRevenue / 1000)}K`
        
        // Calculate conversion rate for current month
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from('proposals')
          .select('status')
          .neq('status', 'Draft')
          .gte('created_at', firstDayOfMonth.toISOString())
          .lte('created_at', lastDayOfMonth.toISOString())
          
        if (currentMonthError) throw currentMonthError
        
        // Calculate previous month's data for comparison
        const prevMonthStart = startOfMonth(subMonths(now, 1))
        const prevMonthEnd = endOfMonth(subMonths(now, 1))
        
        const { data: prevMonthData, error: prevMonthError } = await supabase
          .from('proposals')
          .select('status')
          .neq('status', 'Draft')
          .gte('created_at', prevMonthStart.toISOString())
          .lte('created_at', prevMonthEnd.toISOString())
          
        if (prevMonthError) throw prevMonthError
        
        // Calculate current month conversion rate
        const currentTotalProposals = currentMonthData.length
        const currentAccepted = currentMonthData.filter(p => p.status === 'Accepted').length
        const currentRate = currentTotalProposals > 0 
          ? Math.round((currentAccepted / currentTotalProposals) * 100) 
          : 0
        
        // Calculate previous month conversion rate
        const prevTotalProposals = prevMonthData.length
        const prevAccepted = prevMonthData.filter(p => p.status === 'Accepted').length
        const prevRate = prevTotalProposals > 0 
          ? Math.round((prevAccepted / prevTotalProposals) * 100)
          : 0
        
        // Calculate change (can be positive or negative)
        const rateChange = prevRate > 0 
          ? currentRate - prevRate
          : 0
        
        const changePrefix = rateChange >= 0 ? '+' : ''
        
        // Update stats data
        setStatsData({
          totalCompanies: String(companiesCount || 0),
          activeProposals: String(proposalsCount || 0),
          monthlyRevenue: totalRevenue ? formattedRevenue : "$0K",
          conversionRate: `${currentRate}%`,
          conversionChange: `${changePrefix}${rateChange}%`
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      fetchStats()
    }
  }, [session])

  const stats = [
    {
      title: "Total Companies",
      value: isLoading ? "Loading..." : statsData.totalCompanies,
      change: "All registered clients",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Active Proposals",
      value: isLoading ? "Loading..." : statsData.activeProposals,
      change: "Sent + Accepted proposals",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Active Proposals Revenue",
      value: isLoading ? "Loading..." : statsData.monthlyRevenue,
      change: "Sum of active values",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: isLoading ? "Loading..." : statsData.conversionRate,
      change: "Accepted / Total proposals",
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
                      {stat.change}
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
