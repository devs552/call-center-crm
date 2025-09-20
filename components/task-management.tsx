"use client"

import { JSX, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as XLSX from "xlsx"
import { 
  Edit, 
  Trash2, 
  Upload, 
  FileUp, 
  Users, 
  Clock, 
  MapPin,
  Phone,
  Building2,
  Home,
  MessageSquare,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Package,
  Globe,
  Smartphone,
  Hash,
  FileText,
  Eye,
  Filter,
  Search,
  X,
  CalendarDays
} from "lucide-react"

interface Task {
  _id: string
  Pack: string
  region: string
  landline: string
  name: string
  closed: string
  EID: string
  Building: string
  flat: string
  area: string
  contact: string
  dncr: string
  Remarks: string
  comments: string
  assignedTo: {
    _id: string
    name: string
    email: string
  } | string
  status: string
  taskCreationTime: string
}

interface UserType {
  fullName: string
  _id: string
  name: string
  email: string
}

interface Filters {
  search: string
  status: string
  region: string
  assignedTo: string
  dateFrom: string
  dateTo: string
  pack: string
  area: string
}

export function TaskManagement({setempChange}: {setempChange: (val: boolean) => void}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [bulkUser, setBulkUser] = useState<string>("")

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    region: "",
    assignedTo: "",
    dateFrom: new Date().toISOString().split('T')[0], // Today's date
    dateTo: new Date().toISOString().split('T')[0], // Today's date
    pack: "",
    area: ""
  })

  // Mock toast function for demo
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant?.toUpperCase() || 'INFO'}: ${title} - ${description}`)
    alert(`${title}: ${description}`)
  }

  // Get unique values for filter dropdowns
  const uniqueRegions = useMemo(() => {
    return [...new Set(tasks.map(task => task.region).filter(Boolean))].sort()
  }, [tasks])

  const uniquePacks = useMemo(() => {
    return [...new Set(tasks.map(task => task.Pack).filter(Boolean))].sort()
  }, [tasks])

  const uniqueAreas = useMemo(() => {
    return [...new Set(tasks.map(task => task.area).filter(Boolean))].sort()
  }, [tasks])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter (name, EID, contact, building)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableFields = [
          task.name,
          task.EID,
          task.contact,
          task.Building,
          task.flat,
          typeof task.assignedTo === 'object' ? task.assignedTo?.name : '',
          typeof task.assignedTo === 'object' ? task.assignedTo?.email : ''
        ].join(' ').toLowerCase()
        
        if (!searchableFields.includes(searchLower)) return false
      }

      // Status filter
      if (filters.status && filters.status !== "all" && task.status !== filters.status) return false

      // Region filter
      if (filters.region && filters.region !== "all" && task.region !== filters.region) return false

      // Pack filter
      if (filters.pack && filters.pack !== "all" && task.Pack !== filters.pack) return false

      // Area filter
    if (filters.area && filters.area !== "all" && task.area !== filters.area) {
  return false
}


      // Assigned to filter
   if (filters.assignedTo && filters.assignedTo !== "all") {
  const assignedId =
    typeof task.assignedTo === "object"
      ? task.assignedTo?._id
      : task.assignedTo

  if (assignedId !== filters.assignedTo) return false
}


      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const taskDate = new Date(task.taskCreationTime)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null

        if (fromDate && taskDate < fromDate) return false
        if (toDate && taskDate > toDate) return false
      }

      return true
    })
  }, [tasks, filters])

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      region: "",
      assignedTo: "",
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      pack: "",
      area: ""
    })
  }

  // ------------------ FETCH TASKS ------------------
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
      setempChange(true)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" })
    }
  }

  // ------------------ FETCH USERS ------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

  // ------------------ FILE UPLOAD ------------------
  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" })
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsLoading(true)
    try {
      const res = await fetch("/api/tasks/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      toast({ title: "Success", description: "Tasks imported successfully" })
      fetchTasks()
      setFile(null)
    } catch {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // ------------------ DOWNLOAD TASKS ------------------
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTasks)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks")
    XLSX.writeFile(workbook, "filtered_tasks.xlsx")
  }

  // ------------------ DELETE ------------------
  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast({ title: "Success", description: "Task deleted successfully" })
      fetchTasks()
    } catch {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" })
    }
  }

  // ------------------ UPDATE ------------------
  const openUpdateModal = (task: Task) => {
    setSelectedTask(task)
    setEditForm({
      ...task,
      assignedTo: typeof task.assignedTo === 'object' && task.assignedTo ? task.assignedTo._id : task.assignedTo
    })
    setIsUpdateModalOpen(true)
  }

  const openViewModal = (task: Task) => {
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedTask) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error("Update failed")
      toast({ title: "Success", description: "Task updated successfully" })
      setIsUpdateModalOpen(false)
      fetchTasks()
    } catch {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  // ------------------ BULK ASSIGN ------------------
  const handleBulkAssign = async () => {
    if (!bulkUser || selectedTasks.length === 0) {
      toast({ title: "Error", description: "Select tasks and an employee", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: selectedTasks, userId: bulkUser }),
      })
      if (!res.ok) throw new Error("Bulk assign failed")
      toast({ title: "Success", description: "Tasks assigned successfully" })
      setSelectedTasks([])
      setBulkUser("")
      fetchTasks()
    } catch {
      toast({ title: "Error", description: "Failed to assign tasks", variant: "destructive" })
    }
  }

  // Select all filtered tasks
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task._id))
    } else {
      setSelectedTasks([])
    }
  }

  type StatusType = "pending" | "in-progress" | "completed" | "cancelled";
  const statusConfig: Record<StatusType, { variant: string; icon: JSX.Element; color: string }> = {
    pending: { variant: "secondary", icon: <Clock className="w-3 h-3" />, color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
    "in-progress": { variant: "default", icon: <AlertCircle className="w-3 h-3" />, color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    completed: { variant: "success", icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-green-100 text-green-800 hover:bg-green-200" },
    cancelled: { variant: "destructive", icon: <XCircle className="w-3 h-3" />, color: "bg-red-100 text-red-800 hover:bg-red-200" }
  };

  const getStatusBadge = (status: string) => {
    const allowedStatuses: StatusType[] = ["pending", "in-progress", "completed", "cancelled"];
    const normalizedStatus = allowedStatuses.includes(status as StatusType) ? status : "pending";
    const config = statusConfig[normalizedStatus as StatusType];
    return (
      <Badge className={`flex items-center gap-1 ${config.color} border-0`}>
        {config.icon}
        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const renderTaskField = (label: string, value: any, icon: any) => {
    if (!value && label !== "Comments") return null
    
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <div className="p-3 bg-gray-50 rounded-md text-sm">
          {value || "N/A"}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Task Management System</h1>
          <p className="text-gray-600">Efficiently manage and track your team's tasks</p>
        </div>

        {/* Upload + Download Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileUp className="h-6 w-6" />
              Import / Export Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">
                  Select CSV or Excel file
                </Label>
                <Input 
                  id="file-upload"
                  type="file" 
                  accept=".csv,.xlsx" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={isLoading || !file}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isLoading ? "Uploading..." : "Upload"}
                </Button>
                <Button variant="outline" onClick={handleDownload} className="hover:bg-gray-50">
                  <Download className="mr-2 h-4 w-4" />
                  Download Filtered
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Label>
                <Input
                  placeholder="Search by name, EID, contact..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Region</Label>
                <Select value={filters.region || "all"} onValueChange={(value) => setFilters({...filters, region: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {uniqueRegions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Pack</Label>
                <Select value={filters.pack || "all"} onValueChange={(value) => setFilters({...filters, pack: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Packs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packs</SelectItem>
                    {uniquePacks.map((pack) => (
                      <SelectItem key={pack} value={pack}>{pack}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Area</Label>
                <Select value={filters.area || "all"} onValueChange={(value) => setFilters({...filters, area: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {uniqueAreas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

             <div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
  <Select
     value={filters.assignedTo || "all"}
    onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="All Employees" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Employees</SelectItem>
      {users
        .filter((user) => user._id) // ✅ prevent empty/undefined IDs
        .map((user) => (
          <SelectItem key={user._id} value={user._id}>
            {user.fullName || "Unnamed"}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>


              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date From
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date To
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredTasks.length}</span> of <span className="font-semibold">{tasks.length}</span> tasks
              </div>
              <Button variant="outline" onClick={resetFilters} className="hover:bg-gray-50">
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Assign Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Bulk Task Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Select Employee</Label>
                <Select value={bulkUser} onValueChange={setBulkUser}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {u.name} ({u.email})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleBulkAssign} 
                disabled={!bulkUser || selectedTasks.length === 0}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Users className="mr-2 h-4 w-4" />
                Assign Selected ({selectedTasks.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6" />
              Tasks Overview ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Make table body scrollable, header sticky */}
            <div className="relative w-full" style={{ maxHeight: 500, overflowY: "auto" }}>
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead>
                      {bulkUser.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}
                    </TableHead>
                    <TableHead>Name/ID</TableHead>
                    <TableHead>Pack/Region</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>DNCR</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task._id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell>
                        {bulkUser.length > 0 && (
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTasks([...selectedTasks, task._id])
                              } else {
                                setSelectedTasks(selectedTasks.filter((id) => id !== task._id))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 truncate">
                          <div className="font-semibold text-gray-800">
                            {task.name || "Unnamed Task"}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {task.EID || task._id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 truncate">
                          {task.Pack && (
                            <div className="text-sm font-medium text-blue-600">
                              {task.Pack}
                            </div>
                          )}
                          {task.region && (
                            <div className="text-xs text-gray-500">
                              {task.region}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm truncate">
                          {task.area && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {task.area}
                            </div>
                          )}
                          {task.Building && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {task.Building}
                              {task.flat && `, ${task.flat}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm truncate">
                          {task.contact && (
                            <div className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-gray-400" />
                              {task.contact}
                            </div>
                          )}
                          {task.landline && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {task.landline}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(task.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate">
                          {typeof task.assignedTo === "object" && task.assignedTo ? (
                            <div>
                              <div className="font-medium">{task.assignedTo.name}</div>
                              <div className="text-xs text-gray-500">{task.assignedTo.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 truncate">
                          {formatDate(task.taskCreationTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 truncate">
                          {task.comments || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 truncate">
                          {task.Remarks || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm text-gray-600 truncate ${task.dncr === "blocked" ? "text-red-600 font-semibold" : ""}`}>
                          {task.dncr ? (task.dncr.charAt(0).toUpperCase() + task.dncr.slice(1)) : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openViewModal(task)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openUpdateModal(task)}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(task._id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-gray-300" />
                          <div>No tasks found matching your filters</div>
                          <Button variant="outline" onClick={resetFilters} size="sm">
                            Clear Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Eye className="h-5 w-5" />
                Task Details
              </DialogTitle>
              <DialogDescription>
                Complete overview of task information
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {renderTaskField("Task ID", selectedTask._id, <Hash className="w-4 h-4" />)}
                {renderTaskField("Name", selectedTask.name, <User className="w-4 h-4" />)}
                {renderTaskField("Pack", selectedTask.Pack, <Package className="w-4 h-4" />)}
                {renderTaskField("Region", selectedTask.region, <Globe className="w-4 h-4" />)}
                {renderTaskField("Area", selectedTask.area, <MapPin className="w-4 h-4" />)}
                {renderTaskField("Building", selectedTask.Building, <Building2 className="w-4 h-4" />)}
                {renderTaskField("Flat", selectedTask.flat, <Home className="w-4 h-4" />)}
                {renderTaskField("Contact", selectedTask.contact, <Phone className="w-4 h-4" />)}
                {renderTaskField("Landline", selectedTask.landline, <Phone className="w-4 h-4" />)}
                {renderTaskField("EID", selectedTask.EID, <Hash className="w-4 h-4" />)}
                {renderTaskField("DNCR", selectedTask.dncr, <FileText className="w-4 h-4" />)}
                {renderTaskField("Closed", selectedTask.closed, <XCircle className="w-4 h-4" />)}
                {renderTaskField("Remarks", selectedTask.Remarks, <MessageSquare className="w-4 h-4" />)}
                {renderTaskField("Comments", selectedTask.comments, <MessageSquare className="w-4 h-4" />)}
                {renderTaskField("Status", selectedTask.status, <AlertCircle className="w-4 h-4" />)}
                {renderTaskField("Assigned To", 
                  typeof selectedTask.assignedTo === 'object' && selectedTask.assignedTo 
                    ? `${selectedTask.assignedTo.email} (${selectedTask.assignedTo.email})` 
                    : (selectedTask.assignedTo || "Unassigned"), 
                  <User className="w-4 h-4" />)}
                {renderTaskField("Created Time", formatDate(selectedTask.taskCreationTime), <Calendar className="w-4 h-4" />)}
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit className="h-5 w-5" />
                Update Task
              </DialogTitle>
              <DialogDescription>
                Modify task details and assignment information
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label>Pack</Label>
                  <Input
                    value={editForm.Pack || ""}
                    onChange={(e) => setEditForm({ ...editForm, Pack: e.target.value })}
                    placeholder="Enter pack"
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input
                    value={editForm.region || ""}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    placeholder="Enter region"
                  />
                </div>
                <div>
                  <Label>Area</Label>
                  <Input
                    value={editForm.area || ""}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    placeholder="Enter area"
                  />
                </div>
                <div>
                  <Label>Building</Label>
                  <Input
                    value={editForm.Building || ""}
                    onChange={(e) => setEditForm({ ...editForm, Building: e.target.value })}
                    placeholder="Enter building"
                  />
                </div>
                <div>
                  <Label>Flat</Label>
                  <Input
                    value={editForm.flat || ""}
                    onChange={(e) => setEditForm({ ...editForm, flat: e.target.value })}
                    placeholder="Enter flat"
                  />
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input
                    value={editForm.contact || ""}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    placeholder="Enter contact"
                  />
                </div>
                <div>
                  <Label>Landline</Label>
                  <Input
                    value={editForm.landline || ""}
                    onChange={(e) => setEditForm({ ...editForm, landline: e.target.value })}
                    placeholder="Enter landline"
                  />
                </div>
                <div>
                  <Label>EID</Label>
                  <Input
                    value={editForm.EID || ""}
                    onChange={(e) => setEditForm({ ...editForm, EID: e.target.value })}
                    placeholder="Enter EID"
                  />
                </div>
                <div>
                  <Label>DNCR</Label>
                  <Select
                    value={editForm.dncr || "none"}
                    onValueChange={(value) => setEditForm({ ...editForm, dncr: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="unblocked">Unblocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Select
                    value={editForm.Remarks || "select"}
                    onValueChange={(value) => setEditForm({ ...editForm, Remarks: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="not answering">Not Answering</SelectItem>
                      <SelectItem value="wrong number">Wrong Number</SelectItem>
                      <SelectItem value="dnct">DNCT</SelectItem>
                      <SelectItem value="powered off">Powered Off</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editForm.status || "pending"}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <Select
                    value={editForm.assignedTo as string || ""}
                    onValueChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Comments</Label>
                  <Textarea
                    value={editForm.comments || ""}
                    onChange={(e) => setEditForm({ ...editForm, comments: e.target.value })}
                    placeholder="Enter comments"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {isUpdating ? "Updating..." : "Update Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}