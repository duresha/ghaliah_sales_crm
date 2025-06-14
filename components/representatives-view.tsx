"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Mail, Building2, FileText, Plus, Edit, TrendingUp } from "lucide-react"
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

interface RepresentativesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function RepresentativesView({ userRole }: RepresentativesViewProps) {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [showRepresentativeForm, setShowRepresentativeForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch representatives from Supabase
  const fetchRepresentatives = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name")

      if (error) {
        throw error
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
          lastActivity: user.last_activity || new Date().toISOString().split("T")[0],
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

  // Fetch representatives on component mount
  useEffect(() => {
    fetchRepresentatives()
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

  const totalStats = {
    totalRevenue: representatives.reduce((sum, rep) => sum + rep.totalRevenue, 0),
    totalCompanies: representatives.reduce((sum, rep) => sum + rep.assignedCompanies, 0),
    totalProposals: representatives.reduce((sum, rep) => sum + rep.assignedProposals, 0),
    avgConversion: Math.round(
      representatives.filter((r) => r.conversionRate > 0).reduce((sum, rep) => sum + rep.conversionRate, 0) /
        Math.max(1, representatives.filter((r) => r.conversionRate > 0).length),
    ),
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
            <div className="text-2xl font-bold">${totalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Across all reps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgConversion}%</div>
            <p className="text-xs text-muted-foreground">Team average</p>
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
        {filteredRepresentatives.map((rep) => (
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
        ))}
      </div>

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
              {filteredRepresentatives.map((rep) => (
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
                  <TableCell>{rep.assignedCompanies}</TableCell>
                  <TableCell>{rep.assignedProposals}</TableCell>
                  <TableCell>{rep.totalRevenue > 0 ? `$${rep.totalRevenue.toLocaleString()}` : "N/A"}</TableCell>
                  <TableCell>{rep.conversionRate > 0 ? `${rep.conversionRate}%` : "N/A"}</TableCell>
                  <TableCell>{rep.lastActivity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
