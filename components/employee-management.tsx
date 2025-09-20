"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar, 
  DollarSign, 
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Shield,
  User,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { set } from "date-fns"


interface Profile {
  _id: string
  email: string
  fullName: string
  role: string
  salary: number
  creationtimestamp: string
  isActive?: boolean
  lastLogin?: string
  taskCount?: number
}



export function EmployeeManagement({setempChange}: {setempChange: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "employee",
    password: "",
    salary: "",
  })

  // Fetch employees with mock active status
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/users`)
      const data = await res.json()
      // Add mock data for active status and additional info
      const enhancedEmployees = data.users.map((emp: Profile, index: number) => ({
        ...emp,
        isActive: Math.random() > 0.3, // Random active status for demo
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        taskCount: Math.floor(Math.random() * 20) + 1
      }))
      setEmployees(enhancedEmployees)
     setempChange(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    
    fetchEmployees()
  }, [])

  const resetForm = () => {
    setFormData({
      email: "",
      fullName: "",
      role: "employee",
      password: "",
      salary: "",
    })
  }

  // Filter employees based on search and role filter
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || employee.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Add employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password,
          salary: Number(formData.salary),
        }),
      })

      if (!res.ok) throw new Error("Failed to add employee")

      toast({
        title: "Employee Added",
        description: `${formData.fullName} has been successfully added.`,
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchEmployees()
   
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    setIsLoading(true)

    try {
      const res = await fetch(`/api/users/${editingEmployee._id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          role: formData.role,
          salary: Number(formData.salary),
        }),
      })

      if (!res.ok) throw new Error("Failed to update employee")

      toast({
        title: "Employee Updated",
        description: `${formData.fullName}'s information has been updated.`,
      })

      resetForm()
      setIsEditDialogOpen(false)
      setEditingEmployee(null)
      fetchEmployees()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete employee
  const handleDeleteEmployee = async (employee: Profile) => {
    try {
      const res = await fetch(`/api/users/${employee._id}/delete`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete employee")

      toast({
        title: "Employee Removed",
        description: `${employee.fullName} has been removed.`,
      })

      fetchEmployees()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove employee",
        variant: "destructive",
      })
    }
  }

  // Open edit
  const openEditDialog = (employee: Profile) => {
    setEditingEmployee(employee)
    setFormData({
      email: employee.email,
      fullName: employee.fullName,
      role: employee.role,
      password: "",
      salary: employee.salary.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (email: string) => {
  
    let selectedemail= localStorage.getItem("email")
    if (email === selectedemail?.toString() ) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          current
        </Badge>
      )}
    // } else if (daysSinceLogin <= 7) {
    //   return (
    //     <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
    //       <Clock className="w-3 h-3 mr-1" />
    //       Inactive
    //     </Badge>
    //   )
    // }
   
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                Team Members
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Manage your call center team and track their activity status
              </CardDescription>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Employee</DialogTitle>
                  <DialogDescription>Create a new account for a team member</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-5">
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="h-11"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Annual Salary</Label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
                      className="h-11"
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Adding..." : "Add Employee"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm || roleFilter !== "all" ? "No employees found" : "No employees yet"}
                </p>
                <p className="text-sm text-gray-500">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Add team members to start managing tasks"}
                </p>
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const isActive = employee._id && 
                  Math.floor((Date.now() - new Date(employee.lastLogin || '').getTime()) / (1000 * 60 * 60 * 24)) <= 1;
                const selectedEmail = localStorage.getItem("email");
                return (
                  <div
                    key={employee._id}
                    className={`group relative p-5 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                      selectedEmail === employee.email 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md' 
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {/* Active indicator stripe */}
                    {selectedEmail === employee.email  && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-l-xl"></div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg ${
                          selectedEmail === employee.email 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                            : employee.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        }`}>
                          {employee.fullName?.charAt(0).toUpperCase()}
                          {selectedEmail === employee.email && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>

                        {/* Employee Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {employee.fullName}
                            </h3>
                            {getStatusBadge(employee.email)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              
                              <span>Rs{employee.salary.toLocaleString()}/year</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Joined {new Date(employee.creationtimestamp).toLocaleDateString()}</span>
                            </div>
                            {/* <div className="flex items-center gap-2 text-gray-500">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{employee.taskCount || 0} active tasks</span>
                            </div> */}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 ml-4">
                        <Badge 
                          variant={employee.role === "admin" ? "default" : "secondary"}
                          className={`${
                            employee.role === "admin" 
                              ? "bg-purple-100 text-purple-700 border-purple-200" 
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          } font-medium`}
                        >
                          {employee.role === "admin" ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </Badge>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {employee.fullName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEmployee(employee)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Employee
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-5">
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="h-11"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Email Address</Label>
              <Input 
                type="email" 
                value={formData.email} 
                disabled 
                className="bg-gray-50 h-11" 
              />
            </div>
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label className="text-sm font-medium">Annual Salary</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
                className="h-11"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}