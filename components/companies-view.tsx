"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, FileText, Plus, Eye } from "lucide-react"
import { CompanyForm } from "@/components/company-form"

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

const sampleCompanies: Company[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Technology",
    region: "Riyadh",
    status: "Proposal Sent",
    assignedRep: "Ahmed Al-Rashid",
    reminderDate: "2024-12-15",
    deadlineDate: "2024-12-20",
    proposalLinkEN: "https://drive.google.com/proposal-en-1",
    proposalLinkAR: "https://drive.google.com/proposal-ar-1",
    driveFolderLink: "https://drive.google.com/folder-1",
    tags: ["High Priority", "Technology", "Large"],
    notes: "Interested in comprehensive security training for 50+ employees",
    createdTime: "2024-12-01",
  },
  {
    id: "2",
    name: "Global Manufacturing Inc",
    industry: "Manufacturing",
    region: "Jeddah",
    status: "Follow-Up",
    assignedRep: "Sarah Al-Mahmoud",
    reminderDate: "2024-12-12",
    deadlineDate: "2024-12-25",
    tags: ["Medium Priority", "Manufacturing"],
    notes: "Requires penetration testing for industrial systems",
    createdTime: "2024-11-28",
  },
  {
    id: "3",
    name: "Financial Services Co",
    industry: "Finance",
    region: "Dubai",
    status: "Accepted",
    assignedRep: "Mohammed Al-Zahra",
    reminderDate: "2024-12-18",
    deadlineDate: "2024-12-30",
    proposalLinkEN: "https://drive.google.com/proposal-en-3",
    proposalLinkAR: "https://drive.google.com/proposal-ar-3",
    driveFolderLink: "https://drive.google.com/folder-3",
    tags: ["High Priority", "Finance", "Compliance"],
    notes: "Signed contract for security awareness training",
    createdTime: "2024-11-25",
  },
  {
    id: "4",
    name: "Healthcare Systems Ltd",
    industry: "Healthcare",
    region: "Riyadh",
    status: "Lead",
    assignedRep: "Fatima Al-Qasimi",
    reminderDate: "2024-12-14",
    deadlineDate: "2024-12-22",
    tags: ["Medium Priority", "Healthcare"],
    notes: "Initial contact made, interested in HIPAA compliance training",
    createdTime: "2024-12-05",
  },
]

interface CompaniesViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function CompaniesView({ userRole }: CompaniesViewProps) {
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyForm, setShowCompanyForm] = useState(false)

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
    setCompanies((prev) => [...prev, newCompany])
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
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
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
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="flex gap-1 mt-1">
                        {company.tags.slice(0, 2).map((tag, index) => (
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
              ))}
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
                          {company.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{company.assignedRep}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Due: {company.reminderDate}</span>
                          <div className="flex gap-1">
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
                  ×
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
                  <p className="text-sm">{selectedCompany.reminderDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <p className="text-sm">{selectedCompany.deadlineDate}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCompany.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-gray-600 mt-1">{selectedCompany.notes}</p>
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
