"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Mail, Building2, FileText, Plus, Edit, TrendingUp } from "lucide-react"
import { RepresentativeForm } from "@/components/representative-form"

interface Representative {
  id: string
  name: string
  email: string
  role: "Rep" | "Manager" | "Admin"
  phone: string
  assignedCompanies: number
  assignedProposals: number
  totalRevenue: number
  conversionRate: number
  lastActivity: string
}

const sampleRepresentatives: Representative[] = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    email: "ahmed.rashid@ghaliah.com",
    role: "Rep",
    phone: "+966 50 123 4567",
    assignedCompanies: 12,
    assignedProposals: 8,
    totalRevenue: 245000,
    conversionRate: 75,
    lastActivity: "2024-12-10",
  },
  {
    id: "2",
    name: "Sarah Al-Mahmoud",
    email: "sarah.mahmoud@ghaliah.com",
    role: "Rep",
    phone: "+966 55 234 5678",
    assignedCompanies: 10,
    assignedProposals: 6,
    totalRevenue: 180000,
    conversionRate: 68,
    lastActivity: "2024-12-09",
  },
  {
    id: "3",
    name: "Mohammed Al-Zahra",
    email: "mohammed.zahra@ghaliah.com",
    role: "Manager",
    phone: "+966 50 345 6789",
    assignedCompanies: 15,
    assignedProposals: 12,
    totalRevenue: 320000,
    conversionRate: 82,
    lastActivity: "2024-12-10",
  },
  {
    id: "4",
    name: "Fatima Al-Qasimi",
    email: "fatima.qasimi@ghaliah.com",
    role: "Rep",
    phone: "+971 50 456 7890",
    assignedCompanies: 8,
    assignedProposals: 5,
    totalRevenue: 125000,
    conversionRate: 62,
    lastActivity: "2024-12-08",
  },
  {
    id: "5",
    name: "Omar Al-Sayed",
    email: "omar.sayed@ghaliah.com",
    role: "Admin",
    phone: "+966 55 567 8901",
    assignedCompanies: 0,
    assignedProposals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    lastActivity: "2024-12-10",
  },
]

interface RepresentativesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function RepresentativesView({ userRole }: RepresentativesViewProps) {
  const [representatives, setRepresentatives] = useState<Representative[]>(sampleRepresentatives)
  const [showRepresentativeForm, setShowRepresentativeForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredRepresentatives = representatives.filter((rep) => {
    const matchesSearch =
      rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || rep.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleAddRepresentative = (newRepresentative: Representative) => {
    setRepresentatives((prev) => [...prev, newRepresentative])
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive"
      case "Manager":
        return "default"
      case "Rep":
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
        representatives.filter((r) => r.conversionRate > 0).length,
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
                {rep.phone}
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
