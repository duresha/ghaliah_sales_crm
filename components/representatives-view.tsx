"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Mail, Building2, FileText, Plus, Edit, TrendingUp, X, Loader2, Copy, Trash2, Info } from "lucide-react"
import { RepresentativeForm } from "@/components/representative-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  const [isEditing, setIsEditing] = useState(false)
  const [editRepresentative, setEditRepresentative] = useState<Representative | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState<Representative | null>(null)
  const [showEmailModal, setShowEmailModal] = useState<Representative | null>(null)
  const [showContactInfoModal, setShowContactInfoModal] = useState<Representative | null>(null)
  const [deleteRepresentative, setDeleteRepresentative] = useState<Representative | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionError, setDeletionError] = useState<string | null>(null)
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

  const handleStartEdit = (rep: Representative) => {
    setEditRepresentative({...rep})
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editRepresentative) return
    
    setIsSaving(true)
    try {
      // Prepare data for update
      const updateData = {
        email: editRepresentative.email,
        phone: editRepresentative.phone,
        role: editRepresentative.role,
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editRepresentative.id)
      
      if (error) {
        console.error("Error updating team member:", error)
        toast({
          title: "Error",
          description: "Failed to update team member: " + error.message,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        // Update in local state
        const updatedRepresentatives = representatives.map(r => 
          r.id === editRepresentative.id ? editRepresentative : r
        )
        setRepresentatives(updatedRepresentatives)
        
        toast({
          title: "Success",
          description: "Team member updated successfully.",
          duration: 3000,
        })
        
        setIsEditing(false)
        setEditRepresentative(null)
      }
    } catch (error: any) {
      console.error("Error in handleSaveEdit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error.message || "Please try again"),
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditRepresentative(null)
  }
  
  const handleDeleteRepresentative = async () => {
    if (!deleteRepresentative) return
    
    setIsDeleting(true)
    try {
      // Delete the user from the database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', deleteRepresentative.id)
      
      if (error) {
        console.error("Error deleting team member:", error)
        
        // Show error in modal regardless of error type
        const errorMessage = error?.message || "This team member cannot be deleted. There may be dependencies in proposals or companies.";
        setDeletionError(errorMessage);
        setDeleteRepresentative(null);
      } else {
        // Remove from local state
        setRepresentatives(representatives.filter(r => r.id !== deleteRepresentative.id))
        
        toast({
          title: "Success",
          description: `${deleteRepresentative.name} has been removed from the team.`,
          variant: "default",
          duration: 3000,
        })
        
        // Refresh statistics
        fetchStats()
      }
    } catch (error: any) {
      // Handle any other exceptions
      console.error("Error in handleDeleteRepresentative:", error)
      const errorMessage = typeof error === 'object' && error?.message 
        ? error.message 
        : "An unexpected error occurred while deleting the team member.";
      
      setDeletionError(errorMessage);
      setDeleteRepresentative(null);
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleShowPhoneModal = (rep: Representative) => {
    setShowPhoneModal(rep)
  }
  
  const handleShowEmailModal = (rep: Representative) => {
    setShowEmailModal(rep)
  }
  
  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: `${type === 'email' ? 'Email' : 'Phone number'} copied to clipboard`,
          duration: 2000,
        })
      },
      (err) => {
        console.error('Could not copy text: ', err)
      }
    )
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
        <Card className="stats-card-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Revenue</CardTitle>
            <div className="stats-card-icon-purple">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">KWD {Math.round(stats.totalRevenue).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From accepted proposals</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="stats-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <div className="stats-card-icon-blue">
              <Building2 className="h-4 w-4" />
            </div>
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
                <p className="text-xs text-muted-foreground">Across all team members</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="stats-card-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <div className="stats-card-icon-green">
              <FileText className="h-4 w-4" />
            </div>
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
        <Card className="stats-card-amber">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <div className="stats-card-icon-amber">
              <TrendingUp className="h-4 w-4" />
            </div>
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
            <Card key={rep.id} className="team-card-glassmorphism">
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
                      <span className="font-semibold">KWD {Math.round(rep.totalRevenue).toLocaleString()}</span>
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleStartEdit(rep)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowContactInfoModal(rep)}
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredRepresentatives.length > 0 && (
        <Card className="table-card-glassmorphism">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Detailed performance metrics for all team members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="table-header-glassmorphism">
                <TableRow>
                  <TableHead className="table-header-cell">Representative</TableHead>
                  <TableHead className="table-header-cell">Role</TableHead>
                  <TableHead className="table-header-cell">Companies</TableHead>
                  <TableHead className="table-header-cell">Proposals</TableHead>
                  <TableHead className="table-header-cell">Revenue</TableHead>
                  <TableHead className="table-header-cell">Conversion</TableHead>
                  <TableHead className="table-header-cell">Last Activity</TableHead>
                  <TableHead className="table-header-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="table-row-glassmorphism">
                    <TableCell className="table-cell-glassmorphism" colSpan={8}>
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <p>Loading performance data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRepresentatives.map((rep) => (
                    <TableRow key={rep.id} className="table-row-glassmorphism">
                      <TableCell className="table-cell-glassmorphism">
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
                      <TableCell className="table-cell-glassmorphism">
                        <Badge variant={getRoleBadgeColor(rep.role)}>{rep.role}</Badge>
                      </TableCell>
                      <TableCell className="table-cell-glassmorphism">{rep.assignedCompanies || 0}</TableCell>
                      <TableCell className="table-cell-glassmorphism">{rep.assignedProposals || 0}</TableCell>
                      <TableCell className="table-cell-glassmorphism">{rep.totalRevenue > 0 ? `KWD ${Math.round(rep.totalRevenue).toLocaleString()}` : "KWD 0"}</TableCell>
                      <TableCell className="table-cell-glassmorphism">{`${rep.conversionRate || 0}%`}</TableCell>
                      <TableCell className="table-cell-glassmorphism">{rep.lastActivity || "N/A"}</TableCell>
                      <TableCell className="table-cell-glassmorphism">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(rep)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowContactInfoModal(rep)} className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                          {userRole === "Admin" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDeleteRepresentative(rep)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
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
      
      {/* Edit Representative Modal */}
      {isEditing && editRepresentative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Team Member</CardTitle>
                  <CardDescription>Update {editRepresentative.name}'s information</CardDescription>
                </div>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editRepresentative.name}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Name cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={editRepresentative.email}
                    onChange={(e) => setEditRepresentative({...editRepresentative, email: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={editRepresentative.phone}
                    onChange={(e) => setEditRepresentative({...editRepresentative, phone: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editRepresentative.role}
                  onValueChange={(value: "rep" | "manager" | "admin") =>
                    setEditRepresentative({...editRepresentative, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rep">Sales Representative</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
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
          </Card>
        </div>
      )}
      
      {/* Contact Info Modal */}
      {showContactInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <div>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>{showContactInfoModal.name}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowContactInfoModal(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium break-all">{showContactInfoModal.email}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(showContactInfoModal.email, 'email')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Phone Number</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">{showContactInfoModal.phone || "No phone number"}</p>
                  {showContactInfoModal.phone && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(showContactInfoModal.phone, 'phone')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteRepresentative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete {deleteRepresentative.name}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {deleteRepresentative.email}</p>
                <p><span className="font-medium">Role:</span> {deleteRepresentative.role}</p>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setDeleteRepresentative(null)} 
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteRepresentative}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Deletion Error Modal */}
      {deletionError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-full">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Unable to Delete Team Member</CardTitle>
                  <CardDescription>
                    The operation could not be completed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-sm text-amber-800">
                    {deletionError.includes("foreign key constraint") ? 
                      "This team member has dependencies in other tables (proposals or companies) and cannot be deleted until those references are removed." :
                      deletionError}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">What to do next:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Check if this team member is assigned to any proposals</li>
                    <li>Check if this team member is assigned to any companies</li>
                    <li>Reassign or remove these assignments first</li>
                    <li>Try deleting the team member again</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setDeletionError(null)}>
                Dismiss
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
