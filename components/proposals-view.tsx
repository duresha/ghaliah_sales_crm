"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, DollarSign, Users, Plus, Eye } from "lucide-react"
import { ProposalForm } from "@/components/proposal-form"

interface Proposal {
  id: string
  proposalId: string
  company: string
  serviceType: "Training" | "Pen Test"
  subService: string
  participants: number
  duration: "3-day" | "5-day"
  addOns: string[]
  status: "Draft" | "Sent" | "Accepted"
  assignedRep: string
  createdOn: string
  proposalLinkEN?: string
  proposalLinkAR?: string
  totalPrice: number
}

const sampleProposals: Proposal[] = [
  {
    id: "1",
    proposalId: "PROP-2024-001",
    company: "TechCorp Solutions",
    serviceType: "Training",
    subService: "Security Awareness Training",
    participants: 50,
    duration: "5-day",
    addOns: ["Retesting", "Customization"],
    status: "Sent",
    assignedRep: "Ahmed Al-Rashid",
    createdOn: "2024-12-01",
    proposalLinkEN: "https://drive.google.com/proposal-en-1",
    proposalLinkAR: "https://drive.google.com/proposal-ar-1",
    totalPrice: 75000,
  },
  {
    id: "2",
    proposalId: "PROP-2024-002",
    company: "Global Manufacturing Inc",
    serviceType: "Pen Test",
    subService: "Infrastructure Penetration Testing",
    participants: 0,
    duration: "3-day",
    addOns: ["Phishing"],
    status: "Draft",
    assignedRep: "Sarah Al-Mahmoud",
    createdOn: "2024-11-28",
    totalPrice: 45000,
  },
  {
    id: "3",
    proposalId: "PROP-2024-003",
    company: "Financial Services Co",
    serviceType: "Training",
    subService: "Compliance Training",
    participants: 30,
    duration: "3-day",
    addOns: ["Customization"],
    status: "Accepted",
    assignedRep: "Mohammed Al-Zahra",
    createdOn: "2024-11-25",
    proposalLinkEN: "https://drive.google.com/proposal-en-3",
    proposalLinkAR: "https://drive.google.com/proposal-ar-3",
    totalPrice: 55000,
  },
  {
    id: "4",
    proposalId: "PROP-2024-004",
    company: "Healthcare Systems Ltd",
    serviceType: "Training",
    subService: "HIPAA Compliance Training",
    participants: 25,
    duration: "5-day",
    addOns: ["Retesting"],
    status: "Sent",
    assignedRep: "Fatima Al-Qasimi",
    createdOn: "2024-12-05",
    totalPrice: 62000,
  },
]

interface ProposalsViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function ProposalsView({ userRole }: ProposalsViewProps) {
  const [proposals, setProposals] = useState<Proposal[]>(sampleProposals)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban")
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showProposalForm, setShowProposalForm] = useState(false)

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposalId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
    const matchesService = serviceFilter === "all" || proposal.serviceType === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const handleAddProposal = (newProposal: Proposal) => {
    setProposals((prev) => [...prev, newProposal])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "secondary"
      case "Sent":
        return "default"
      case "Accepted":
        return "default"
      default:
        return "outline"
    }
  }

  const statusColumns = ["Draft", "Sent", "Accepted"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proposals</h2>
          <p className="text-gray-600">Manage your service proposals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "kanban" : "table")}>
            {viewMode === "table" ? "Kanban View" : "Table View"}
          </Button>
          <Button onClick={() => setShowProposalForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search proposals..."
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
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
            <SelectItem value="Pen Test">Pen Test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.proposalId}</TableCell>
                  <TableCell>{proposal.company}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proposal.serviceType}</div>
                      <div className="text-sm text-gray-500">{proposal.subService}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {proposal.participants > 0 ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {proposal.participants}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{proposal.duration}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {proposal.totalPrice.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProposal(proposal)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {proposal.proposalLinkEN && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={proposal.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{status}</h3>
                <Badge variant="secondary">{filteredProposals.filter((p) => p.status === status).length}</Badge>
              </div>
              <div className="space-y-3">
                {filteredProposals
                  .filter((proposal) => proposal.status === status)
                  .map((proposal) => (
                    <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{proposal.proposalId}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {proposal.serviceType}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">{proposal.company}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">{proposal.subService}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{proposal.duration}</span>
                            {proposal.participants > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {proposal.participants}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <DollarSign className="h-3 w-3" />
                              {proposal.totalPrice.toLocaleString()}
                            </div>
                            <div className="flex gap-1">
                              {proposal.proposalLinkEN && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={proposal.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {proposal.addOns.slice(0, 2).map((addon, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {addon}
                              </Badge>
                            ))}
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

      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProposal.proposalId}</CardTitle>
                  <CardDescription>{selectedProposal.company}</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedProposal(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Service Type</label>
                  <p className="text-sm">{selectedProposal.serviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sub-Service</label>
                  <p className="text-sm">{selectedProposal.subService}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="text-sm">{selectedProposal.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Participants</label>
                  <p className="text-sm">{selectedProposal.participants || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusColor(selectedProposal.status)} className="ml-2">
                    {selectedProposal.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Price</label>
                  <p className="text-sm font-medium">${selectedProposal.totalPrice.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Add-ons</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProposal.addOns.map((addon, index) => (
                    <Badge key={index} variant="outline">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Assigned Rep</label>
                <p className="text-sm">{selectedProposal.assignedRep}</p>
              </div>

              <div className="flex gap-2">
                {selectedProposal.proposalLinkEN && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProposal.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Proposal (EN)
                    </a>
                  </Button>
                )}
                {selectedProposal.proposalLinkAR && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProposal.proposalLinkAR} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Proposal (AR)
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showProposalForm && (
        <ProposalForm onClose={() => setShowProposalForm(false)} onSubmit={handleAddProposal} userRole={userRole} />
      )}
    </div>
  )
}
