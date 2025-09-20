"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Clock, CheckCircle, User, Calendar, TrendingUp, BarChart3 } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string
  created_at: string
  completed_at: string
  profiles: Profile
}

interface TaskHistory {
  id: string
  task_id: string
  changed_by: string
  old_status: string
  new_status: string
  created_at: string
  profiles: Profile
  tasks: {
    title: string
    customer_name: string
  }
}

interface StatusTrackingProps {
  tasks: Task[]
  employees: Profile[]
}

export function StatusTracking({ tasks, employees }: StatusTrackingProps) {
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTaskHistory()
  }, [selectedEmployee, selectedTimeframe])

  const fetchTaskHistory = async () => {
    try {
      let query = supabase
        .from("task_history")
        .select(`
          *,
          profiles:changed_by (
            id,
            full_name,
            email
          ),
          tasks (
            title,
            customer_name
          )
        `)
        .order("created_at", { ascending: false })

      // Filter by timeframe
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number.parseInt(selectedTimeframe))
      query = query.gte("created_at", daysAgo.toISOString())

      // Filter by employee if selected
      if (selectedEmployee !== "all") {
        query = query.eq("changed_by", selectedEmployee)
      }

      const { data: historyData } = await query.limit(50)

      if (historyData) {
        setTaskHistory(historyData)
      }
    } catch (error) {
      console.error("Error fetching task history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEmployeeStats = () => {
    return employees
      .filter((emp) => emp.role === "employee")
      .map((employee) => {
        const employeeTasks = tasks.filter((task) => task.assigned_to === employee.id)
        const completedTasks = employeeTasks.filter((task) => task.status === "completed")
        const inProgressTasks = employeeTasks.filter((task) => task.status === "in_progress")
        const pendingTasks = employeeTasks.filter((task) => task.status === "pending")

        // Calculate completion rate
        const completionRate = employeeTasks.length > 0 ? (completedTasks.length / employeeTasks.length) * 100 : 0

        // Calculate average completion time for completed tasks
        const completedWithTimes = completedTasks.filter((task) => task.completed_at && task.created_at)
        const avgCompletionTime =
          completedWithTimes.length > 0
            ? completedWithTimes.reduce((acc, task) => {
                const created = new Date(task.created_at).getTime()
                const completed = new Date(task.completed_at).getTime()
                return acc + (completed - created)
              }, 0) / completedWithTimes.length
            : 0

        const avgHours = avgCompletionTime > 0 ? Math.round(avgCompletionTime / (1000 * 60 * 60)) : 0

        return {
          employee,
          totalTasks: employeeTasks.length,
          completedTasks: completedTasks.length,
          inProgressTasks: inProgressTasks.length,
          pendingTasks: pendingTasks.length,
          completionRate: Math.round(completionRate),
          avgCompletionHours: avgHours,
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)
  }

  const getOverallStats = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
    const pendingTasks = tasks.filter((task) => task.status === "pending").length
    const highPriorityTasks = tasks.filter((task) => task.priority === "high").length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      highPriorityTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusChangeIcon = (oldStatus: string, newStatus: string) => {
    if (newStatus === "completed") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (newStatus === "in_progress") return <Clock className="h-4 w-4 text-blue-500" />
    return <Activity className="h-4 w-4 text-slate-500" />
  }

  const employeeStats = getEmployeeStats()
  const overallStats = getOverallStats()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallStats.inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{overallStats.pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.highPriorityTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance">Employee Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Performance
              </CardTitle>
              <CardDescription>Track individual employee task completion and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeStats.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No employee performance data available</p>
                    <p className="text-sm text-slate-500">Assign tasks to employees to see performance metrics</p>
                  </div>
                ) : (
                  employeeStats.map((stat) => (
                    <div
                      key={stat.employee.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {stat.employee.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{stat.employee.full_name}</h3>
                          <p className="text-sm text-slate-600">{stat.employee.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{stat.totalTasks}</p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{stat.completedTasks}</p>
                          <p className="text-xs text-slate-500">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{stat.inProgressTasks}</p>
                          <p className="text-xs text-slate-500">In Progress</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{stat.completionRate}%</p>
                          <p className="text-xs text-slate-500">Completion Rate</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-700">{stat.avgCompletionHours}h</p>
                          <p className="text-xs text-slate-500">Avg. Time</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Track task status changes and employee activity</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees
                        .filter((emp) => emp.role === "employee")
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24h</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading activity...</p>
                  </div>
                ) : taskHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No recent activity</p>
                    <p className="text-sm text-slate-500">Task status changes will appear here</p>
                  </div>
                ) : (
                  taskHistory.map((history) => (
                    <div key={history.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0">{getStatusChangeIcon(history.old_status, history.new_status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900">{history.profiles?.full_name}</span>
                          <span className="text-slate-500">changed</span>
                          <span className="font-medium text-slate-900">"{history.tasks?.title}"</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>from</span>
                          {getStatusBadge(history.old_status || "pending")}
                          <span>to</span>
                          {getStatusBadge(history.new_status)}
                        </div>
                        {history.tasks?.customer_name && (
                          <p className="text-sm text-slate-500 mt-1">Customer: {history.tasks.customer_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(history.created_at).toLocaleDateString()}{" "}
                        {new Date(history.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
