"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, Clock, CheckCircle, Play, Pause, MessageSquare, Calendar, User, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  phone_number: string
  customer_name: string
  priority: string
  status: string
  assigned_to: string
  created_at: string
  notes: string
  completed_at: string
}

interface EmployeeTaskInterfaceProps {
  tasks: Task[]
  onTasksChange: () => void
}

export function EmployeeTaskInterface({ tasks, onTasksChange }: EmployeeTaskInterfaceProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [taskNotes, setTaskNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const updateTaskStatus = async (taskId: string, newStatus: string, notes?: string) => {
    setIsLoading(true)
    try {
      // Mock update - in real app this would update the database
      console.log(`[v0] Updating task ${taskId} to status ${newStatus}`)

      toast({
        title: "Task Updated",
        description: `Task status changed to ${newStatus.replace("_", " ")}.`,
      })

      onTasksChange()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNotes = async () => {
    if (!selectedTask || !taskNotes.trim()) return

    setIsLoading(true)
    try {
      // Mock notes update
      console.log(`[v0] Adding notes to task ${selectedTask.id}: ${taskNotes}`)

      toast({
        title: "Notes Added",
        description: "Task notes have been updated successfully.",
      })

      setTaskNotes("")
      setIsNotesDialogOpen(false)
      setSelectedTask(null)
      onTasksChange()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add notes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      in_progress: { label: "In Progress", variant: "default" as const, icon: Play },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: AlertCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Low Priority", variant: "secondary" as const, className: "bg-green-100 text-green-800" },
      medium: { label: "Medium Priority", variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
      high: { label: "High Priority", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Customer:</span>
              <span>{task.customer_name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Phone:</span>
              <span className="font-mono">{task.phone_number}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Created:</span>
              <span>{new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {task.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Completed:</span>
                <span>{new Date(task.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {task.description && (
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-700">{task.description}</p>
          </div>
        )}

        {task.notes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Notes:</span>
            </div>
            <p className="text-sm text-blue-700">{task.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {task.status === "pending" && (
            <Button
              size="sm"
              onClick={() => updateTaskStatus(task.id, "in_progress")}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-3 w-3 mr-1" />
              Start Task
            </Button>
          )}

          {task.status === "in_progress" && (
            <>
              <Button
                size="sm"
                onClick={() => updateTaskStatus(task.id, "completed")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(task.id, "pending")}
                disabled={isLoading}
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            </>
          )}

          <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)} className="ml-auto">
            <MessageSquare className="h-3 w-3 mr-1" />
            {task.notes ? "Edit Notes" : "Add Notes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const openNotesDialog = (task: Task) => {
    setSelectedTask(task)
    setTaskNotes(task.notes || "")
    setIsNotesDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No pending tasks</p>
                <p className="text-sm text-slate-500">All caught up! Check back later for new assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No tasks in progress</p>
                <p className="text-sm text-slate-500">Start working on a pending task to see it here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No completed tasks yet</p>
                <p className="text-sm text-slate-500">Complete your first task to see it here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task Notes</DialogTitle>
            <DialogDescription>Add or update notes for "{selectedTask?.title}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea
                id="task-notes"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Add any notes about this task, call outcomes, or follow-up actions..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNotes} disabled={isLoading || !taskNotes.trim()}>
                {isLoading ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
