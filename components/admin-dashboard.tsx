"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Phone, 
  CheckCircle, 
  Clock, 
  LogOut, 
  TrendingUp,
  Calendar,
  Bell,
  Search,
  Filter,
  MoreVertical
} from "lucide-react"
import { useRouter } from "next/navigation"
import { EmployeeManagement } from "./employee-management"
import { TaskManagement } from "./task-management"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Task {
  taskCreationTime: string | number | Date
  assignedTo: any
  contact: number 
  name: string 
  _id: null | undefined
  id: string
  title: string
  description: string
  phone_number: string
  customer_name: string
  priority: string
  status: string
  assigned_to: string
  created_by: string
  created_at: string
  notes: string
  assignee_name?: string
}

interface AdminDashboardProps {
  user: any
  profile: Profile
}


export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

 const [empChange, setEmpChange] = useState(false)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch users")

      const result = await res.json()
      console.log("users here", result)

      const newusers = result.users || []
    // const employeeList = newusers.filter((u: Profile) => u.role === "employee")

      setEmployees(newusers)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

 const fetchDashboardData = useCallback(async () => {
  localStorage.setItem("email", profile.email);
  try {
    // Fetch tasks from backend
    const taskRes = await fetch("/api/tasks", { cache: "no-store" });
    const taskData = await taskRes.json();
    let TaskLength =  taskData.tasks || taskData || [];
    let taskList = taskData.tasks || taskData || [];

    // ✅ Sort by creation time (latest first) and keep only last 10
    taskList = taskList
      .sort(
        (a: any, b: any) =>
          new Date(b.taskCreationTime).getTime() -
          new Date(a.taskCreationTime).getTime()
      )
      .slice(0, 10);

    // Fetch employees from backend
    const userRes = await fetch("/api/users", { cache: "no-store" });
    const userData = await userRes.json();
    const employeeList = userData.users || userData || [];

    setTasks(taskList);
    setEmployees(employeeList);

    setStats({
      totalEmployees: employeeList.length,
      totalTasks: TaskLength.length,
      completedTasks: TaskLength.filter((t: any) => t.status === "completed").length,
      inProgressTasks: TaskLength.filter((t: any) => t.status === "in-progress").length,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    setIsLoading(false);
  }
}, [profile.email]);



  useEffect(() => {
    if(empChange === false){
    fetchEmployees()
    fetchDashboardData()
    }
    if(empChange)setEmpChange(false)  
  }, [empChange])

  const handleSignOut = useCallback(async () => {
    signOut()
    router.push("/auth/login")
  }, [router])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <div className="text-center">
    {/* Enhanced animated spinner */}
    <div className="relative mb-8">
      <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
      <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 absolute top-2 left-1/2 transform -translate-x-1/2 animate-reverse-spin"></div>
    </div>
    
    {/* Enhanced loading text with animations */}
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
      {/* Enhanced Header */}
      <header className="bg-white bg-opacity-80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">VS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Voice Studio CRM
                </h1>
                <p className="text-slate-600 text-sm">Administrator Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>
               */}
              <div className="flex items-center space-x-3 bg-slate-100 rounded-xl px-4 py-2">
                <div className="text-right">
                  <p className="font-medium text-slate-900 text-sm">{profile.full_name}</p>
                  <p className="text-xs text-slate-600">{profile.email}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {profile.full_name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="flex items-center gap-2 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Employees</CardTitle>
              <div className="h-8 w-8  bg-opacity-20 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs opacity-75 flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                All employees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Tasks</CardTitle>
              <div className="h-8 w-8  bg-opacity-20 rounded-lg flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs opacity-75 flex items-center mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                Tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">In Progress</CardTitle>
              <div className="h-8 w-8  bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-xs opacity-75 flex items-center mt-2">
                <Clock className="h-3 w-3 mr-1" />
                Active now
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Completed</CardTitle>
              <div className="h-8 w-8  bg-opacity-20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs opacity-75 flex items-center mt-2">
                <CheckCircle className="h-3 w-3 mr-1" />
               Done
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-slate-200 rounded-xl p-1 h-12">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="employees"
              className="rounded-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
            >
              Manage Employees
            </TabsTrigger>
            <TabsTrigger 
              value="tasks"
              className="rounded-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
            >
              Manage Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Enhanced Recent Tasks Card */}
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-800">Recent Tasks</CardTitle>
                  {/* <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div> */}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {tasks.map((task, index) => (
                    <div 
                      key={task._id} 
                      className="p-6 hover:bg-slate-50 transition-colors duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {task.name}
                            </h3>
                            {/* <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {index+1}
                            </span> */}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600 font-medium">
                              {task.customer_name}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {task.contact}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Assigned to:  {task?.assignedTo?.email ?? "Unassigned"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                              {task.status.replace("_", " ")}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(task.taskCreationTime).toLocaleDateString()}
                            </p>
                          </div>
                          {/* <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
              <EmployeeManagement setempChange={setEmpChange} />
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
              <TaskManagement  setempChange={setEmpChange}/>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}