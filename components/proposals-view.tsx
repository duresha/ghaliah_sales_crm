"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, DollarSign, Users, Plus, Eye, Loader2 } from "lucide-react"
import { ProposalForm } from "@/components/proposal-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface Proposal {
  id: string
  proposalId: string
  company: string
  serviceType: string
  subService: string
  participants?: number
  duration: string
  addOns: string[]
  status: "Draft" | "Sent" | "Accepted"
  assignedRep: string
  createdOn: string
  proposalLinkEN?: string
  proposalLinkAR?: string
  totalPrice: number
  notes?: string
  drive_folder_en?: string
  drive_folder_ar?: string
}

interface ProposalsViewProps {
  userRole: "Admin" | "Manager" | "Rep"
}

export function ProposalsView({ userRole }: ProposalsViewProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban")
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const { toast } = useToast()

  // Fetch proposals from Supabase - separate function similar to companies-view
  const fetchProposals = async () => {
    setLoading(true)
    try {
      console.log("Fetching proposals...")
      
      // Fetch proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from("proposals")
        .select(`
          id,
          proposal_code,
          company_id,
          service,
          sub_service,
          participants,
          duration,
          status,
          total_price,
          notes,
          add_ons,
          assigned_rep,
          created_at,
          drive_folder_en,
          drive_folder_ar
        `)
        .order("created_at", { ascending: false })

      if (proposalsError) {
        console.error("Error fetching proposals:", proposalsError)
        toast({
          title: "Error",
          description: "Failed to load proposals. Please refresh the page.",
          variant: "destructive",
        })
        setProposals([])
        setLoading(false)
        return
      }

      if (!proposalsData || proposalsData.length === 0) {
        setProposals([])
        setLoading(false)
        return
      }

      console.log("Proposals data from Supabase:", proposalsData)

      // Fetch companies to map IDs to names
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name")
      
      if (companiesError) {
        console.error("Error fetching companies:", companiesError)
      }

      const companiesMap = (companiesData || []).reduce((acc, company) => {
        acc[company.id] = company.name
        return acc
      }, {} as {[key: string]: string})

      // Fetch representatives to map IDs to names
      const { data: repsData, error: repsError } = await supabase
        .from("users")
        .select("id, name")
      
      if (repsError) {
        console.error("Error fetching representatives:", repsError)
      }

      const repsMap = (repsData || []).reduce((acc, rep) => {
        acc[rep.id] = rep.name
        return acc
      }, {} as {[key: string]: string})

      // Transform data to match our interface
      const transformedProposals: Proposal[] = proposalsData.map(proposal => {
        return {
          id: proposal.id,
          proposalId: proposal.proposal_code || `PROP-${Math.floor(Math.random() * 1000)}`,
          company: companiesMap[proposal.company_id] || "Unknown Company",
          serviceType: proposal.service || "Unknown Service",
          subService: proposal.sub_service || "",
          participants: proposal.participants,
          duration: proposal.duration || "Unknown",
          addOns: proposal.add_ons || [],
          status: (proposal.status as "Draft" | "Sent" | "Accepted") || "Draft",
          assignedRep: repsMap[proposal.assigned_rep] || "Unassigned",
          createdOn: proposal.created_at ? new Date(proposal.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalPrice: proposal.total_price || 0,
          notes: proposal.notes,
          // Handle drive folder fields safely
          drive_folder_en: undefined,
          drive_folder_ar: undefined,
          proposalLinkEN: undefined,
          proposalLinkAR: undefined
        };
      })

      console.log("Transformed proposals:", transformedProposals)
      setProposals(transformedProposals)
    } catch (error: any) {
      console.error("Error in fetchProposals:", error)
      toast({
        title: "Error",
        description: "Failed to load proposals. Please refresh the page.",
        variant: "destructive",
      })
      setProposals([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals()
  }, [])

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposalId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
    const matchesService = serviceFilter === "all" || proposal.serviceType === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const handleAddProposal = (newProposal: Proposal) => {
    // After successful addition, refresh the list from Supabase
    fetchProposals()
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
            <SelectItem value="Pen Test">Penetration Testing</SelectItem>
            <SelectItem value="Compliance Audit">Compliance Audit</SelectItem>
            <SelectItem value="Cyber Risk Assessment">Cyber Risk Assessment</SelectItem>
            <SelectItem value="Incident Response">Incident Response</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading proposals...</p>
        </div>
      ) : viewMode === "table" ? (
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
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No proposals found. Create your first proposal!
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
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
                      {proposal.participants ? (
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
                ))
              )}
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
                    <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setSelectedProposal(proposal)}>
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
                            {proposal.participants && (
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
                            {proposal.addOns?.slice(0, 2).map((addon, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {addon}
                              </Badge>
                            ))}
                            {proposal.addOns && proposal.addOns.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{proposal.addOns.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {filteredProposals.filter((p) => p.status === status).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm border border-dashed rounded-md">
                    No {status.toLowerCase()} proposals
                  </div>
                )}
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
                <div>
                  <label className="text-sm font-medium">Created On</label>
                  <p className="text-sm">{selectedProposal.createdOn}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Add-ons</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProposal.addOns?.length > 0 ? (
                    selectedProposal.addOns.map((addon, index) => (
                      <Badge key={index} variant="outline">
                        {addon}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">None</p>
                  )}
                </div>
              </div>

              {selectedProposal.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProposal.notes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Assigned Rep</label>
                <p className="text-sm">{selectedProposal.assignedRep}</p>
              </div>

              <div className="flex flex-wrap gap-2">
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

