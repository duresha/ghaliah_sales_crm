"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, FileText, Plus, Eye, Loader2, X, Trash2 } from "lucide-react"
import { CompanyForm } from "@/components/company-form"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Company {
  id: string
  name: string
  industry: string
  region: string
  status: "Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed"
  assignedRep: string
  assigned_rep?: string | null
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
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  // Define representatives for edit form
  const [representatives, setRepresentatives] = useState<{id: string, full_name: string}[]>([])

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
        assigned_rep: company.assigned_rep,
        reminderDate: company.reminder_date || "",
        deadlineDate: company.deadline_date || "",
        proposalLinkEN: company.proposal_link_en || "",
        proposalLinkAR: company.proposal_link_ar || "",
        driveFolderLink: company.drive_folder_link || "",
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

  // Fetch companies and representatives on component mount
  useEffect(() => {
    fetchCompanies()
    fetchRepresentatives()
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

  const handleDeleteCompany = async () => {
    if (!deleteCompany) return

    setIsDeleting(true)
    try {
      // Delete the record from Supabase
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', deleteCompany.id)

      if (error) {
        console.error("Error deleting company:", error)
        toast({
          title: "Error",
          description: "Failed to delete the company: " + error.message,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        // Show success toast
        toast({
          title: "Success",
          description: `${deleteCompany.name} has been deleted.`,
          variant: "default",
          duration: 3000,
        })
        
        // Remove from local state
        setCompanies(companies.filter(c => c.id !== deleteCompany.id))
      }
    } catch (error: any) {
      console.error("Error in handleDeleteCompany:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error.message || "Please try again"),
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
      setDeleteCompany(null) // Close dialog
    }
  }

  const handleStartEdit = () => {
    if (selectedCompany) {
      setEditCompany({...selectedCompany});
      setIsEditing(true);
    }
  }

  const handleSaveEdit = async () => {
    if (!editCompany) return;
    setIsSaving(true);
    
    try {
      // Find the representative ID from the name
      const selectedRep = representatives.find(r => r.full_name === editCompany.assignedRep);
      
      // Prepare data for update
      const updateData = {
        status: editCompany.status,
        assigned_rep: selectedRep?.id || null,
        reminder_date: editCompany.reminderDate,
        deadline_date: editCompany.deadlineDate,
        notes: editCompany.notes
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', editCompany.id);
      
      if (error) {
        console.error("Error updating company:", error);
        toast({
          title: "Error",
          description: "Failed to update company: " + error.message,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Update in local state
        const updatedCompanies = companies.map(c => 
          c.id === editCompany.id ? editCompany : c
        );
        setCompanies(updatedCompanies);
        setSelectedCompany(editCompany);
        
        toast({
          title: "Success",
          description: "Company updated successfully.",
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
    setEditCompany(null);
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
      ) : companies.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="relative mx-auto w-12 h-12 mb-4">
              <FileText className="h-12 w-12 text-gray-300" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-3 w-3 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">No Companies Available</h3>
            <p className="text-gray-500 mb-4">You haven't added any companies yet.</p>
            <Button onClick={() => setShowCompanyForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Company
            </Button>
          </div>
        </Card>
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative mx-auto w-10 h-10 mb-3">
                        <FileText className="h-10 w-10 text-gray-300" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="h-2 w-2 text-red-500" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No companies found</p>
                      <p className="text-xs text-gray-500 mb-3">Add your first company to get started</p>
                      <Button size="sm" onClick={() => setShowCompanyForm(true)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add Company
                      </Button>
                    </div>
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
                        {(userRole === "Admin" || userRole === "Manager") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDeleteCompany(company)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete Company"
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
                    <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedCompany(company)}>
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
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(company);
                            }}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {company.proposalLinkEN && (
                              <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <a href={company.proposalLinkEN} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            {(userRole === "Admin" || userRole === "Manager") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  setDeleteCompany(company);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                title="Delete Company"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {filteredCompanies.filter((c) => c.status === status).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm border border-dashed rounded-md">
                    No {status.toLowerCase()} companies
                  </div>
                )}
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
                <div className="flex gap-2">
                  {!isEditing && (userRole === "Admin" || userRole === "Manager") && (
                    <Button variant="outline" onClick={handleStartEdit}>
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => {
                    setSelectedCompany(null);
                    setIsEditing(false);
                    setEditCompany(null);
                  }}>
                    ×
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  {isEditing ? (
                    <Select
                      value={editCompany?.status}
                      onValueChange={(value) => {
                        setEditCompany(prev => prev ? {
                          ...prev, 
                          status: value as ("Lead" | "Proposal Sent" | "Follow-Up" | "Accepted" | "Closed")
                        } : null);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                        <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusColor(selectedCompany.status)} className="ml-2">
                      {selectedCompany.status}
                    </Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Assigned Rep</label>
                  {isEditing ? (
                    <Select
                      value={editCompany?.assignedRep}
                      onValueChange={(value) => {
                        const selectedRep = representatives.find(r => r.full_name === value);
                        setEditCompany(prev => prev ? {
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
                    <p className="text-sm">{selectedCompany.assignedRep}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Reminder Date</label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal h-8 text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editCompany?.reminderDate ? (
                            editCompany.reminderDate
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editCompany?.reminderDate ? new Date(editCompany.reminderDate) : undefined}
                          onSelect={(date) => {
                            setEditCompany(prev => prev ? {
                              ...prev,
                              reminderDate: date ? format(date, 'yyyy-MM-dd') : ''
                            } : null)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm">{selectedCompany.reminderDate || "No date set"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline Date</label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal h-8 text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editCompany?.deadlineDate ? (
                            editCompany.deadlineDate
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editCompany?.deadlineDate ? new Date(editCompany.deadlineDate) : undefined}
                          onSelect={(date) => {
                            setEditCompany(prev => prev ? {
                              ...prev,
                              deadlineDate: date ? format(date, 'yyyy-MM-dd') : ''
                            } : null)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm">{selectedCompany.deadlineDate || "No date set"}</p>
                  )}
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
                {isEditing ? (
                  <Textarea
                    className="mt-1"
                    rows={4}
                    value={editCompany?.notes || ''}
                    onChange={(e) => {
                      setEditCompany(prev => prev ? {...prev, notes: e.target.value} : null);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedCompany.notes || "No notes available"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
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
                
                {isEditing ? (
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
                ) : ((userRole === "Admin" || userRole === "Manager") && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedCompany(null);
                      setDeleteCompany(selectedCompany);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Company
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showCompanyForm && (
        <CompanyForm onClose={() => setShowCompanyForm(false)} onSubmit={handleAddCompany} userRole={userRole} />
      )}
      {deleteCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete {deleteCompany.name}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Industry:</span> {deleteCompany.industry}</p>
                <p><span className="font-medium">Region:</span> {deleteCompany.region}</p>
                <p><span className="font-medium">Status:</span> {deleteCompany.status}</p>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setDeleteCompany(null)} 
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteCompany}
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
