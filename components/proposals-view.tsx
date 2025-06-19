"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import { Search } from "lucide-react"
import { DollarSign } from "lucide-react"
import { Users } from "lucide-react"
import { Plus } from "lucide-react"
import { Eye } from "lucide-react"
import { Loader2 } from "lucide-react"
import { Languages } from "lucide-react"
import { Trash2 } from "lucide-react"
import { X } from "lucide-react"
import { ProposalForm } from "@/components/proposal-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  assigned_rep?: string | null
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
  const [deleteProposal, setDeleteProposal] = useState<Proposal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editProposal, setEditProposal] = useState<Proposal | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  // Define representatives and add-on options for edit form
  const [representatives, setRepresentatives] = useState<{id: string, full_name: string}[]>([])
  const addOnOptions = [
    "Coffee Breaks",
    "Lunch",
    "Workshop Materials",
    "Certificates",
    "Follow-up Sessions",
    "Transportation"
  ];

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
          proposalId: proposal.proposal_code || `GHALIAH-${Math.floor(Math.random() * 1000)}`,
          company: companiesMap[proposal.company_id] || "Unknown Company",
          serviceType: proposal.service || "Unknown Service",
          subService: proposal.sub_service || "",
          participants: proposal.participants,
          duration: proposal.duration || "Unknown",
          addOns: proposal.add_ons || [],
          status: (proposal.status as "Draft" | "Sent" | "Accepted") || "Draft",
          assignedRep: repsMap[proposal.assigned_rep] || "Unassigned",
          assigned_rep: proposal.assigned_rep,
          createdOn: proposal.created_at ? new Date(proposal.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalPrice: proposal.total_price || 0,
          notes: proposal.notes,
          // Include the drive folder links
          drive_folder_en: proposal.drive_folder_en || undefined,
          drive_folder_ar: proposal.drive_folder_ar || undefined,
          proposalLinkEN: proposal.drive_folder_en || undefined,
          proposalLinkAR: proposal.drive_folder_ar || undefined
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

  // Fetch representatives for the edit form
  const fetchRepresentatives = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name:name, email, role")
        .in("role", ["rep", "manager"])
        .order("name")
      
      if (error) {
        console.error("Error fetching representatives:", error)
        // Use fallback representatives on error
        setRepresentatives([
          { id: "r1", full_name: "Ahmed Al-Rashid" },
          { id: "r2", full_name: "Sarah Al-Mahmoud" },
          { id: "r3", full_name: "Mohammed Al-Zahra" },
          { id: "r4", full_name: "Fatima Al-Qasimi" }
        ])
        return
      }
      
      // If no representatives found, use fallbacks
      if (!data || data.length === 0) {
        setRepresentatives([
          { id: "r1", full_name: "Ahmed Al-Rashid" },
          { id: "r2", full_name: "Sarah Al-Mahmoud" },
          { id: "r3", full_name: "Mohammed Al-Zahra" },
          { id: "r4", full_name: "Fatima Al-Qasimi" }
        ])
        return
      }
      
      setRepresentatives(data)
    } catch (error) {
      console.error("Error in fetchRepresentatives:", error)
      // Use fallback representatives on exception
      setRepresentatives([
        { id: "r1", full_name: "Ahmed Al-Rashid" },
        { id: "r2", full_name: "Sarah Al-Mahmoud" },
        { id: "r3", full_name: "Mohammed Al-Zahra" },
        { id: "r4", full_name: "Fatima Al-Qasimi" }
      ])
    }
  }

  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals()
    fetchRepresentatives()
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
  
  // Helper function to get the appropriate card class for each status
  const getKanbanCardClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "kanban-card-draft"
      case "Sent":
        return "kanban-card-sent"
      case "Accepted":
        return "kanban-card-accepted"
      default:
        return ""
    }
  }
  
  // Helper function to get the appropriate column header class for each status
  const getKanbanColumnHeaderClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "kanban-column-header-draft"
      case "Sent":
        return "kanban-column-header-sent"
      case "Accepted":
        return "kanban-column-header-accepted"
      default:
        return ""
    }
  }

  const statusColumns = ["Draft", "Sent", "Accepted"]

  const handleDeleteProposal = async () => {
    if (!deleteProposal) return

    setIsDeleting(true)
    try {
      // Delete the record from Supabase
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', deleteProposal.id)

      if (error) {
        console.error("Error deleting proposal:", error)
        toast({
          title: "Error",
          description: "Failed to delete the proposal: " + error.message,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        // Show success toast
        toast({
          title: "Success",
          description: `Proposal ${deleteProposal.proposalId} has been deleted.`,
          variant: "default",
          duration: 3000,
        })
        
        // Remove from local state
        setProposals(proposals.filter(p => p.id !== deleteProposal.id))
      }
    } catch (error: any) {
      console.error("Error in handleDeleteProposal:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error.message || "Please try again"),
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
      setDeleteProposal(null) // Close dialog
    }
  }

  const handleStartEdit = () => {
    if (selectedProposal) {
      setEditProposal({...selectedProposal});
      setIsEditing(true);
    }
  }

  const handleSaveEdit = async () => {
    if (!editProposal) return;
    setIsSaving(true);
    
    try {
      // Find the representative ID from the name
      const selectedRep = representatives.find(r => r.full_name === editProposal.assignedRep);
      
      // Prepare data for update
      const updateData = {
        duration: editProposal.duration,
        participants: editProposal.participants,
        total_price: editProposal.totalPrice,
        status: editProposal.status,
        notes: editProposal.notes,
        assigned_rep: selectedRep?.id || null,
        add_ons: editProposal.addOns
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', editProposal.id);
      
      if (error) {
        console.error("Error updating proposal:", error);
        toast({
          title: "Error",
          description: "Failed to update proposal: " + error.message,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Update in local state
        const updatedProposals = proposals.map(p => 
          p.id === editProposal.id ? editProposal : p
        );
        setProposals(updatedProposals);
        setSelectedProposal(editProposal);
        
        toast({
          title: "Success",
          description: "Proposal updated successfully.",
          duration: 3000,
        });
        
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error in handleSaveEdit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error.message || "Please try again"),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProposal(null);
  }

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
            {/* <SelectItem value="Compliance Audit">Compliance Audit</SelectItem> */}
            <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
            <SelectItem value="Incident Response">Incident Response</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="relative mx-auto w-12 h-12 mb-4">
              <FileText className="h-12 w-12 text-gray-300" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-3 w-3 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">No Proposals Available</h3>
            <p className="text-gray-500 mb-4">You haven't created any proposals yet.</p>
            <Button onClick={() => setShowProposalForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Proposal
            </Button>
          </div>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="table-card-glassmorphism">
          <Table>
            <TableHeader className="table-header-glassmorphism">
              <TableRow>
                <TableHead className="table-header-cell">Proposal ID</TableHead>
                <TableHead className="table-header-cell">Company</TableHead>
                <TableHead className="table-header-cell">Service</TableHead>
                <TableHead className="table-header-cell">Price</TableHead>
                <TableHead className="table-header-cell">Status</TableHead>
                <TableHead className="table-header-cell">Representative</TableHead>
                <TableHead className="table-header-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="table-row-glassmorphism">
                  <TableCell className="table-cell-glassmorphism" colSpan={7}>
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProposals.length === 0 ? (
                <TableRow className="table-row-glassmorphism">
                  <TableCell className="table-cell-glassmorphism" colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative mx-auto w-10 h-10 mb-3">
                        <FileText className="h-10 w-10 text-gray-300" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="h-2 w-2 text-red-500" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No proposals found</p>
                      <p className="text-xs text-gray-500 mb-3">Add your first proposal to get started</p>
                      <Button size="sm" onClick={() => setShowProposalForm(true)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add Proposal
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} className="table-row-glassmorphism">
                    <TableCell className="table-cell-glassmorphism">
                      <div className="font-medium">{proposal.proposalId}</div>
                      <div className="text-xs text-gray-500">{proposal.createdOn}</div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">{proposal.company}</TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <div>{proposal.serviceType}</div>
                      <div className="text-xs text-gray-500">{proposal.subService}</div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <div className="font-medium">KWD {Math.round(proposal.totalPrice).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {proposal.duration}{proposal.participants && proposal.participants > 0 ? ` | ${proposal.participants} participants` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">
                      <Badge variant={getStatusColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-cell-glassmorphism">{proposal.assignedRep}</TableCell>
                    <TableCell className="table-cell-glassmorphism">
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
                        {(userRole === "Admin" || userRole === "Manager") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDeleteProposal(proposal)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`${getKanbanColumnHeaderClass(status)} inline-block`}>{status}</h3>
                <Badge variant="secondary">{filteredProposals.filter((p) => p.status === status).length}</Badge>
              </div>
              <div className="space-y-3">
                {filteredProposals
                  .filter((proposal) => proposal.status === status)
                  .map((proposal) => (
                    <Card 
                      key={proposal.id} 
                      className={`${getKanbanCardClass(proposal.status)} cursor-pointer transition-shadow`} 
                      onClick={() => setSelectedProposal(proposal)}
                    >
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
                            <div className="text-sm font-medium">
                              KWD {Math.round(proposal.totalPrice).toLocaleString()}
                            </div>
                            <div className="flex gap-1">
                              {proposal.drive_folder_en && (
                                <Button variant="ghost" size="sm" asChild title="Open English Proposal">
                                  <a href={proposal.drive_folder_en} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                              {proposal.drive_folder_ar && (
                                <Button variant="ghost" size="sm" asChild title="Open Arabic Proposal">
                                  <a href={proposal.drive_folder_ar} target="_blank" rel="noopener noreferrer">
                                    <Languages className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                              {(userRole === "Admin" || userRole === "Manager") && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    setDeleteProposal(proposal);
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                  title="Delete Proposal"
                                >
                                  <Trash2 className="h-3 w-3" />
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
                <div className="flex gap-2">
                  {!isEditing && (userRole === "Admin" || userRole === "Manager") && (
                    <Button variant="outline" onClick={handleStartEdit}>
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => {
                    setSelectedProposal(null);
                    setIsEditing(false);
                    setEditProposal(null);
                  }}>
                    ×
                  </Button>
                </div>
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
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        className="h-8 text-sm w-24"
                        value={editProposal?.duration ? parseInt(editProposal.duration.split('-')[0]) : ""}
                        onChange={(e) => {
                          const days = parseInt(e.target.value);
                          if (!isNaN(days) && days >= 1 && days <= 365) {
                            setEditProposal(prev => prev ? {...prev, duration: `${days}-day`} : null);
                          }
                        }}
                        placeholder="Days"
                      />
                      <span className="text-gray-600">days</span>
                    </div>
                  ) : (
                    <p className="text-sm">{selectedProposal.duration}</p>
                  )}
                </div>
                                  {((selectedProposal.serviceType === "Training" || (editProposal && editProposal.serviceType === "Training")) && 
                    (isEditing || (selectedProposal.participants && selectedProposal.participants > 0))) && (
                    <div>
                      <label className="text-sm font-medium">Participants</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          className="h-8 text-sm"
                          value={editProposal?.participants || ''}
                          onChange={(e) => {
                            setEditProposal(prev => prev ? {
                              ...prev,
                              participants: parseInt(e.target.value) || 0
                            } : null);
                          }}
                        />
                      ) : (
                        <p className="text-sm">{selectedProposal.participants}</p>
                      )}
                    </div>
                  )}
                <div>
                  <label className="text-sm font-medium">Status</label>
                  {isEditing ? (
                    <Select
                      value={editProposal?.status}
                      onValueChange={(value) => {
                        setEditProposal(prev => prev ? {
                          ...prev, 
                          status: value as ("Draft" | "Sent" | "Accepted")
                        } : null);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusColor(selectedProposal.status)} className="ml-2">
                      {selectedProposal.status}
                    </Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Total Price</label>
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="mr-2">KWD</span>
                      <Input
                        type="number"
                        min="0"
                        className="h-8 text-sm"
                        value={editProposal?.totalPrice || 0}
                        onChange={(e) => {
                          setEditProposal(prev => prev ? {
                            ...prev, 
                            totalPrice: parseInt(e.target.value) || 0
                          } : null);
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium">KWD {Math.round(selectedProposal.totalPrice).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Created On</label>
                  <p className="text-sm">{selectedProposal.createdOn}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Assigned Rep</label>
                  {isEditing ? (
                    <Select
                      value={editProposal?.assignedRep}
                      onValueChange={(value) => {
                        const selectedRep = representatives.find(r => r.full_name === value);
                        setEditProposal(prev => prev ? {
                          ...prev, 
                          assignedRep: value,
                          assigned_rep: selectedRep?.id || null
                        } : null);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select representative" />
                      </SelectTrigger>
                      <SelectContent>
                        {representatives.map((rep) => (
                          <SelectItem key={rep.id} value={rep.full_name}>
                            {rep.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{selectedProposal.assignedRep}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Add-ons</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {addOnOptions.map((addOn) => (
                      <div key={addOn} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${addOn}`}
                          checked={editProposal?.addOns.includes(addOn)}
                          onCheckedChange={() => {
                            setEditProposal(prev => {
                              if (!prev) return null;
                              const addOns = prev.addOns.includes(addOn) 
                                ? prev.addOns.filter(a => a !== addOn) 
                                : [...prev.addOns, addOn];
                              return {...prev, addOns};
                            });
                          }}
                        />
                        <Label htmlFor={`edit-${addOn}`} className="text-sm">
                          {addOn}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                {isEditing ? (
                  <Textarea
                    className="mt-1"
                    rows={4}
                    value={editProposal?.notes || ''}
                    onChange={(e) => {
                      setEditProposal(prev => prev ? {...prev, notes: e.target.value} : null);
                    }}
                  />
                ) : (
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProposal.notes || "No notes provided."}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedProposal.drive_folder_en && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProposal.drive_folder_en} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      English Proposal
                    </a>
                  </Button>
                )}
                {selectedProposal.drive_folder_ar && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProposal.drive_folder_ar} target="_blank" rel="noopener noreferrer">
                      <Languages className="mr-2 h-4 w-4" />
                      Arabic Proposal
                    </a>
                  </Button>
                )}
                {(userRole === "Admin" || userRole === "Manager") && !isEditing && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedProposal(null);
                      setDeleteProposal(selectedProposal);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Proposal
                  </Button>
                )}
                
                {isEditing && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showProposalForm && (
        <ProposalForm onClose={() => setShowProposalForm(false)} onSubmit={handleAddProposal} userRole={userRole} />
      )}
      {deleteProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete proposal {deleteProposal.proposalId}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Company:</span> {deleteProposal.company}</p>
                <p><span className="font-medium">Service:</span> {deleteProposal.serviceType}</p>
                <p><span className="font-medium">Created on:</span> {deleteProposal.createdOn}</p>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setDeleteProposal(null)} 
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteProposal}
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
    </div>
  )
}
