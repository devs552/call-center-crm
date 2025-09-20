"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle, Clock, LogOut, User, Building2, MapPin, Hash, Calendar } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
interface Profile {
  id: string
  email: string
  full_name: string
  role: string
}

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
  notes: string
}

interface EmployeeDashboardProps {
  user: any
  profile: Profile
}

export function EmployeeDashboard({ user, profile }: EmployeeDashboardProps) {
   const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
  })
 
  const [isLoading, setIsLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    comments: "",
  })

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Filter tasks for today only
  const getTodaysTasks = (taskList: Task[]) => {
    const today = getTodayDate()
    return taskList.filter((task) => {
      const taskDate = new Date(task.taskCreationTime).toISOString().split('T')[0]
      return taskDate === today
    })
  }

  // Fetch only employee's tasks for today
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" })
      const data = await res.json()
      const taskList: Task[] = data.tasks || []

      // Filter by employee and today's date
      const myTasks = taskList.filter(
        (t: any) => {
          const assignedEmail = typeof t.assignedTo === 'object' ? t.assignedTo?.email : ''
          return assignedEmail === profile.email
        }
      )

      const todaysTasks = getTodaysTasks(myTasks)

      setTasks(todaysTasks)
      setStats({
        totalTasks: todaysTasks.length,
        completedTasks: todaysTasks.filter((t) => t.status === "completed").length,
        inProgressTasks: todaysTasks.filter((t) => t.status === "in-progress").length,
        pendingTasks: todaysTasks.filter((t) => !t.status || t.status === "pending").length,
      })
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [profile.email])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

   const handleSignOut = useCallback(async () => {
     signOut()
     router.push("/auth/login")
   }, [router])
 

  const startEditing = (task: Task) => {
    setEditingTask(task._id)
    setFormData({
      status: task.status || "",
      notes: task.Remarks || task.notes || "", // use Remarks first, then notes
      comments: task.comments || "",
    })
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setFormData({ status: "", notes: "", comments: "" })
  }

  const saveTask = async (taskId: string) => {
    try {
      const statusToSave = formData.status || "in-active"
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: statusToSave,
          Remarks: formData.notes,
        }),
      })
      if (res.ok) {
        setEditingTask(null)
        fetchTasks()
      } else {
        console.error("Failed to update task:", await res.text())
      }
    } catch (err) {
      console.error("Failed to update task:", err)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
      "in-progress": { color: "bg-blue-100 text-blue-800", icon: <Clock className="w-3 h-3" /> },
      completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { color: "bg-red-100 text-red-800", icon: <Clock className="w-3 h-3" /> },
      "in-active": { color: "bg-gray-200 text-gray-700", icon: <User className="w-3 h-3" /> },
    }
    const normalized = statusConfig[status as keyof typeof statusConfig] ? status : "in-active"
    const config = statusConfig[normalized as keyof typeof statusConfig]
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    )
  }

  const getRemarksBadge = (remarks: string) => {
    const remarksConfig: Record<string, string> = {
      "not answering": "bg-orange-100 text-orange-800",
      "wrong number": "bg-pink-100 text-pink-800",
      "powered off": "bg-gray-200 text-gray-700",
      "active": "bg-green-100 text-green-800",
      "invalid": "bg-red-100 text-red-800",
      "out of network": "bg-purple-100 text-purple-800",
      "dncr": "bg-blue-100 text-blue-800",
    }
    const normalized = remarks?.toLowerCase() || ""
    const color = remarksConfig[normalized] || "bg-slate-100 text-slate-700"
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {remarks ? remarks.charAt(0).toUpperCase() + remarks.slice(1) : "—"}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <div className="text-center">
    {/* Animated spinner */}
    <div className="relative mb-8">
      <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
      <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 absolute top-2 left-1/2 transform -translate-x-1/2 animate-reverse-spin"></div>
    </div>
    
    {/* Loading text with animation */}
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 animate-pulse">
        Loading Dashboard
      </h2>
      <div className="flex justify-center space-x-1">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
      <p className="text-slate-600 font-medium animate-fade-in">
        Loading your dashboard...
      </p>
    </div>
  </div>
  
  <style jsx>{`
    @keyframes reverse-spin {
      from {
        transform: rotate(360deg);
      }
      to {
        transform: rotate(0deg);
      }
    }
    .animate-reverse-spin {
      animation: reverse-spin 1s linear infinite;
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .animate-fade-in {
      animation: fade-in 2s ease-in-out infinite alternate;
    }
  `}</style>
</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white bg-opacity-80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">VS</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Voice Studio CRM
              </h1>
              <p className="text-slate-600 text-sm">Employee Dashboard - Today's Tasks</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-slate-100 rounded-xl px-4 py-2">
            <div className="text-right">
              <p className="font-medium text-slate-900 text-sm">{profile.full_name}</p>
              <p className="text-xs text-slate-600">{profile.email}</p>
            </div>
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Today's Tasks</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs">Assigned for today</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Pending</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>In Progress</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inProgressTasks}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Completed</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks Table - Fixed Scrolling */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-6 w-6" />
              Today's Tasks ({tasks.length}) - {getTodayDate()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No tasks assigned for today</p>
                <p className="text-sm">Check back tomorrow or contact your manager</p>
              </div>
            ) : (
              <div className="relative">
                {/* Fixed header */}
                <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[1000px]">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="min-w-[120px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Pack/ID</th>
                            <th className="min-w-[150px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Customer</th>
                            <th className="min-w-[140px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Contact</th>
                            <th className="min-w-[180px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Location</th>
                            <th className="min-w-[120px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Status</th>
                            <th className="min-w-[150px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Remarks</th>
                            <th className="min-w-[150px] px-4 py-3 text-left text-sm font-semibold text-slate-600 bg-slate-50">Comments</th>
                            <th className="min-w-[120px] px-4 py-3 text-right text-sm font-semibold text-slate-600 bg-slate-50">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="max-h-[500px] overflow-auto">
                  <div className="min-w-[1000px]">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        {tasks.map((task) => (
                          <tr key={task._id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="min-w-[120px] px-4 py-3">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-600">
                                  {task.Pack}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {task.EID || task._id.slice(-8)}
                                </div>
                              </div>
                            </td>
                            
                            <td className="min-w-[150px] px-4 py-3">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-800">
                                  {task.name || "Unnamed Customer"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {task.region}
                                </div>
                              </div>
                            </td>
                            
                            <td className="min-w-[140px] px-4 py-3">
                              <div className="space-y-1 text-sm">
                                {task.contact && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
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
                            </td>
                            
                            <td className="min-w-[180px] px-4 py-3">
                              <div className="space-y-1 text-sm">
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
                            </td>
                            
                            <td className="min-w-[160px] px-4 py-3">
                              {editingTask === task._id ? (
                                <select
                                  className="border rounded-md p-2 text-sm w-full"
                                  value={formData.status || "in-active"}
                                  onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                  }
                                >
                                     <option value="in-active">In-active</option>
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                               
                                </select>
                              ) : (
                                getStatusBadge(task.status)
                              )}
                            </td>
                            
                            <td className="min-w-[150px] px-4 py-3">
                              {editingTask === task._id ? (
                                <select
                                  className="border rounded-md p-2 text-sm w-full"
                                  value={formData.notes}
                                  onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                  }
                                >
                                  <option value="">Select Remarks</option>
                                  <option value="not answering">Not Answering</option>
                                  <option value="wrong number">Wrong Number</option>
                                  <option value="powered off">Powered Off</option>
                                  <option value="active">Active</option>
                                  <option value="invalid">Invalid</option>
                                  <option value="out of network">Out of Network</option>
                                  <option value="dncr">DNCR</option>
                                </select>
                              ) : (
                                getRemarksBadge(task.Remarks || task.notes)
                              )}
                            </td>
                            
                            <td className="min-w-[150px] px-4 py-3">
                              {editingTask === task._id ? (
                                <textarea
                                  className="border rounded-md p-2 text-sm w-full resize-none"
                                  rows={2}
                                  value={formData.comments}
                                  onChange={(e) =>
                                    setFormData({ ...formData, comments: e.target.value })
                                  }
                                  placeholder="Add comments..."
                                />
                              ) : (
                                <div className="text-xs text-slate-600 max-w-[140px] truncate">
                                  {task.comments || "—"}
                                </div>
                              )}
                            </td>
                            
                            <td className="min-w-[120px] px-4 py-3 text-right">
                              <div className="flex items-center gap-1 justify-end">
                                {editingTask === task._id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                      onClick={() => saveTask(task._id)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelEditing}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditing(task)}
                                    className="hover:bg-blue-50"
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}