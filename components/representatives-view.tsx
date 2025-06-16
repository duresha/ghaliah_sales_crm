"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Mail, Building2, FileText, Plus, Edit, TrendingUp, X, Loader2 } from "lucide-react"
import { RepresentativeForm } from "@/components/representative-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface Representative {
  id: string
  name: string
  email: string
  role: "rep" | "manager" | "admin"
  phone: string
  assignedCompanies: number
  assignedProposals: number
  totalRevenue: number
  conversionRate: number
  lastActivity: string
}

interface TeamStats {
  totalRevenue: number
  totalCompanies: number
  activeProposals: number
  avgConversion: number
  isLoading: boolean
}

interface RepresentativesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function RepresentativesView({ userRole }: RepresentativesViewProps) {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [showRepresentativeForm, setShowRepresentativeForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<TeamStats>({
    totalRevenue: 0,
    totalCompanies: 0,
    activeProposals: 0,
    avgConversion: 0,
    isLoading: true
  })
  const { toast } = useToast()

  // Fetch statistics from Supabase
  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }))
      
      // Fetch accepted proposals for total revenue
      const { data: acceptedProposals, error: revenueError } = await supabase
        .from("proposals")
        .select("total_price")
        .eq("status", "Accepted")
      
      if (revenueError) throw revenueError
      
      // Calculate total revenue
      const totalRevenue = acceptedProposals?.reduce((sum, proposal) => 
        sum + (proposal.total_price || 0), 0) || 0
      
      // Fetch active companies count
      const { count: totalCompanies, error: companiesError } = await supabase
        .from("companies")
        .select("id", { count: 'exact', head: true })
      
      if (companiesError) throw companiesError
      
      // Fetch active (sent) proposals count
      const { count: activeProposals, error: proposalsError } = await supabase
        .from("proposals")
        .select("id", { count: 'exact', head: true })
        .eq("status", "Sent")
      
      if (proposalsError) throw proposalsError
      
      // Calculate conversion rate (Accepted proposals / Total proposals)
      const { count: acceptedCount, error: acceptedError } = await supabase
        .from("proposals")
        .select("id", { count: 'exact', head: true })
        .eq("status", "Accepted")
      
      if (acceptedError) throw acceptedError
      
      const { count: totalProposals, error: totalError } = await supabase
        .from("proposals")
        .select("id", { count: 'exact', head: true })
      
      if (totalError) throw totalError
      
      // Calculate average conversion rate
      const avgConversion = totalProposals && totalProposals > 0 
        ? Math.round(((acceptedCount || 0) / totalProposals) * 100) 
        : 0
      
      setStats({
        totalRevenue,
        totalCompanies: totalCompanies || 0,
        activeProposals: activeProposals || 0,
        avgConversion,
        isLoading: false
      })
      
    } catch (error) {
      console.error("Error fetching team statistics:", error)
      setStats({
        totalRevenue: 0,
        totalCompanies: 0,
        activeProposals: 0,
        avgConversion: 0,
        isLoading: false
      })
    }
  }

  // Fetch representatives from Supabase
  const fetchRepresentatives = async () => {
    setIsLoading(true)
    try {
      // Try to query the performance view first
      let { data, error } = await supabase
        .from("representatives_performance_view")
        .select("*")
        .order("name")

      // If the view doesn't exist, perform manual queries
      if (error && error.code === "PGRST116") {
        console.log("View not found, falling back to manual queries")
        
        // Get basic user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .order("name")

        if (userError) throw userError
        
        if (userData) {
          // Transform data to match Representative interface
          data = await Promise.all(
            userData.map(async (user) => {
              // Get companies count for this rep
              const { count: companiesCount } = await supabase
                .from("companies")
                .select("id", { count: 'exact', head: true })
                .eq("assigned_rep", user.id)
              
              // Get proposals count for this rep
              const { count: proposalsCount } = await supabase
                .from("proposals")
                .select("id", { count: 'exact', head: true })
                .eq("assigned_rep", user.id)
              
              // Get total revenue for this rep (from accepted proposals)
              const { data: acceptedProposals } = await supabase
                .from("proposals")
                .select("total_price")
                .eq("assigned_rep", user.id)
                .eq("status", "Accepted")
              
              const totalRevenue = acceptedProposals?.reduce(
                (sum, proposal) => sum + (proposal.total_price || 0), 
                0
              ) || 0
              
              // Calculate conversion rate
              const { count: acceptedCount } = await supabase
                .from("proposals")
                .select("id", { count: 'exact', head: true })
                .eq("assigned_rep", user.id)
                .eq("status", "Accepted")
              
              const { count: totalRepProposals } = await supabase
                .from("proposals")
                .select("id", { count: 'exact', head: true })
                .eq("assigned_rep", user.id)
              
              const conversionRate = totalRepProposals && totalRepProposals > 0
                ? Math.round(((acceptedCount || 0) / totalRepProposals) * 100)
                : 0
              
              // Get last activity timestamp
              const { data: lastProposal } = await supabase
                .from("proposals")
                .select("created_at")
                .eq("assigned_rep", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
              
              const lastActivity = lastProposal && lastProposal.length > 0
                ? new Date(lastProposal[0].created_at).toISOString().split('T')[0]
                : user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toISOString().split('T')[0]
                  : new Date(user.created_at).toISOString().split('T')[0]
              
              return {
                ...user,
                assigned_companies: companiesCount || 0,
                assigned_proposals: proposalsCount || 0,
                total_revenue: totalRevenue,
                conversion_rate: conversionRate,
                last_activity: lastActivity
              }
            })
          )
        }
      }

      if (data) {
        // Transform data to match Representative interface
        const formattedData = data.map(user => ({
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: user.role as "rep" | "manager" | "admin",
          phone: user.phone || "",
          assignedCompanies: user.assigned_companies || 0,
          assignedProposals: user.assigned_proposals || 0,
          totalRevenue: user.total_revenue || 0,
          conversionRate: user.conversion_rate || 0,
          lastActivity: user.last_activity || new Date().toISOString().split('T')[0],
        }));
        setRepresentatives(formattedData);
      }
    } catch (error: any) {
      console.error("Error fetching representatives:", error)
      toast({
        title: "Error",
        description: "Failed to load team members. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch representatives and stats on component mount
  useEffect(() => {
    fetchRepresentatives()
    fetchStats()
  }, [])

  const filteredRepresentatives = representatives.filter((rep) => {
    const matchesSearch =
      rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || rep.role === roleFilter.toLowerCase()

    return matchesSearch && matchesRole
  })

  const handleAddRepresentative = (newRepresentative: Representative) => {
    // Add the new representative to the list and refresh from server
    fetchRepresentatives()
    // Also refresh the statistics
    fetchStats()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "rep":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-600">Manage your sales team and track performance</p>
        </div>
        {userRole === "Admin" && (
          <Button onClick={() => setShowRepresentativeForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Representative
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From accepted proposals</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">Across all reps</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeProposals}</div>
                <p className="text-xs text-muted-foreground">With "Sent" status</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.avgConversion}%</div>
                <p className="text-xs text-muted-foreground">Accepted / Total proposals</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search representatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading team members...</div>
      ) : (
        <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepresentatives.length === 0 ? (
          <Card className="col-span-full p-12">
            <div className="text-center">
              <div className="relative mx-auto w-12 h-12 mb-4">
                <FileText className="h-12 w-12 text-gray-300" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">No Team Members Available</h3>
              <p className="text-gray-500 mb-4">You haven't added any team members yet.</p>
              {userRole === "Admin" && (
                <Button onClick={() => setShowRepresentativeForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Team Member
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredRepresentatives.map((rep) => (
            <Card key={rep.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt={rep.name} />
                    <AvatarFallback>
                      {rep.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{rep.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {rep.email}
                    </CardDescription>
                  </div>
                  <Badge variant={getRoleBadgeColor(rep.role)}>{rep.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                      {rep.phone || "No phone number"}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span className="text-gray-600">Companies</span>
                    </div>
                    <div className="font-semibold">{rep.assignedCompanies}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="text-gray-600">Proposals</span>
                    </div>
                    <div className="font-semibold">{rep.assignedProposals}</div>
                  </div>
                </div>

                {rep.totalRevenue > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-semibold">${rep.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{rep.conversionRate}%</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last Activity</span>
                  <span>{rep.lastActivity}</span>
                </div>

                {userRole === "Admin" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredRepresentatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Detailed performance metrics for all team members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Companies</TableHead>
                  <TableHead>Proposals</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <p>Loading performance data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRepresentatives.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-user.jpg" alt={rep.name} />
                            <AvatarFallback className="text-xs">
                              {rep.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{rep.name}</div>
                            <div className="text-xs text-gray-500">{rep.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeColor(rep.role)}>{rep.role}</Badge>
                      </TableCell>
                      <TableCell>{rep.assignedCompanies || 0}</TableCell>
                      <TableCell>{rep.assignedProposals || 0}</TableCell>
                      <TableCell>{rep.totalRevenue > 0 ? `$${rep.totalRevenue.toLocaleString()}` : "$0"}</TableCell>
                      <TableCell>{`${rep.conversionRate || 0}%`}</TableCell>
                      <TableCell>{rep.lastActivity || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
        </>
      )}
      {showRepresentativeForm && (
        <RepresentativeForm
          onClose={() => setShowRepresentativeForm(false)}
          onSubmit={handleAddRepresentative}
          userRole={userRole}
        />
      )}
    </div>
  )
}
