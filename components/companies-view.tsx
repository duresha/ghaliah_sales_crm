"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, FileText, Plus, Eye, Loader2, X, Mail, Phone } from "lucide-react"
import { CompanyForm } from "@/components/company-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface Company {
  id: string
  name: string
  industry: string
  region: string
  status: "Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed"
  assignedRep: string
  reminderDate: string
  deadlineDate: string
  proposalLinkEN?: string
  proposalLinkAR?: string
  driveFolderLink?: string
  tags: string[]
  notes: string
  createdTime: string
}

interface CompaniesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function CompaniesView({ userRole }: CompaniesViewProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch companies from Supabase
  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select(`
          *
        `)
        .order("created_at", { ascending: false })

      if (companiesError) {
        console.error("Error details:", companiesError);
        throw companiesError
      }

      if (!companiesData) {
        setCompanies([])
        return
      }

      console.log("Companies data from Supabase:", companiesData);

      // Fetch representatives to map IDs to names
      const { data: repsData, error: repsError } = await supabase
        .from("users")
        .select("id, name")
      
      if (repsError) {
        console.error("Error fetching representatives:", repsError);
        throw repsError
      }

      const repsMap = (repsData || []).reduce((acc, rep) => {
        acc[rep.id] = rep.name
        return acc
      }, {} as {[key: string]: string})

      // Transform data to match our interface
      const transformedCompanies: Company[] = companiesData.map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        region: company.region,
        status: company.status as "Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed",
        assignedRep: repsMap[company.assigned_rep] || "Unassigned",
        reminderDate: company.reminder_date || "",
        deadlineDate: company.deadline_date || "",
        tags: company.tags || [],
        notes: company.notes || "",
        createdTime: new Date(company.created_at).toISOString().split('T')[0],
      }))

      setCompanies(transformedCompanies)
    } catch (error: any) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || company.status === statusFilter
    const matchesRegion = regionFilter === "all" || company.region === regionFilter

    // Filter by user role
    if (userRole === "Rep") {
      // In real app, filter by assigned rep matching current user
      return matchesSearch && matchesStatus && matchesRegion
    }

    return matchesSearch && matchesStatus && matchesRegion
  })

  const handleAddCompany = (newCompany: Company) => {
    // After successful addition, refresh the list from Supabase
    fetchCompanies()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lead":
        return "secondary"
      case "Proposal Sent":
        return "default"
      case "Follow-Up":
        return "outline"
      case "Accepted":
        return "default"
      case "Closed":
        return "secondary"
      default:
        return "outline"
    }
  }

  const statusColumns = ["Lead", "Proposal Sent", "Follow-Up", "Accepted", "Closed"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="text-gray-600">Manage your company leads and prospects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "kanban" : "table")}>
            {viewMode === "table" ? "Kanban View" : "Table View"}
          </Button>
          <Button onClick={() => setShowCompanyForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
            <SelectItem value="Follow-Up">Follow-Up</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="Riyadh">Riyadh</SelectItem>
            <SelectItem value="Jeddah">Jeddah</SelectItem>
            <SelectItem value="Dubai">Dubai</SelectItem>
            <SelectItem value="Kuwait">Kuwait</SelectItem>
            <SelectItem value="Doha">Doha</SelectItem>
            <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
            <SelectItem value="Manama">Manama</SelectItem>
            <SelectItem value="Muscat">Muscat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading companies...</p>
        </div>
      ) : viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Rep</TableHead>
                <TableHead>Reminder Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No companies found. Add your first company!
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="flex gap-1 mt-1">
                          {(company.tags || []).slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.region}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(company.status)}>{company.status}</Badge>
                    </TableCell>
                    <TableCell>{company.assignedRep}</TableCell>
                    <TableCell>{company.reminderDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        {company.proposalLinkEN && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={company.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {company.driveFolderLink && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={company.driveFolderLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{status}</h3>
                <Badge variant="secondary">{filteredCompanies.filter((c) => c.status === status).length}</Badge>
              </div>
              <div className="space-y-3">
                {filteredCompanies
                  .filter((company) => company.status === status)
                  .map((company) => (
                    <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{company.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {company.industry} • {company.region}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(company.tags || []).slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{company.assignedRep}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Due: {company.reminderDate}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {company.proposalLinkEN && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={company.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCompany.name}</CardTitle>
                  <CardDescription>
                    {selectedCompany.industry} • {selectedCompany.region}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCompany(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusColor(selectedCompany.status)} className="ml-2">
                    {selectedCompany.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Assigned Rep</label>
                  <p className="text-sm">{selectedCompany.assignedRep}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Reminder Date</label>
                  <p className="text-sm">{selectedCompany.reminderDate || "No date set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline Date</label>
                  <p className="text-sm">{selectedCompany.deadlineDate || "No date set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm">{selectedCompany.createdTime}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedCompany.tags || []).map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCompany.notes || "No notes available"}
                </p>
              </div>

              <div className="flex gap-2">
                {selectedCompany.proposalLinkEN && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedCompany.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Proposal (EN)
                    </a>
                  </Button>
                )}
                {selectedCompany.proposalLinkAR && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedCompany.proposalLinkAR} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Proposal (AR)
                    </a>
                  </Button>
                )}
                {selectedCompany.driveFolderLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedCompany.driveFolderLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Drive Folder
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showCompanyForm && (
        <CompanyForm onClose={() => setShowCompanyForm(false)} onSubmit={handleAddCompany} userRole={userRole} />
      )}
    </div>
  )
}
