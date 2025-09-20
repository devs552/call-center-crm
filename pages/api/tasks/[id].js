import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await connectToDatabase();
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedTask) return res.status(404).json({ message: "Task not found" });
      return res.status(200).json({ message: "Task updated", task: updatedTask });
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) return res.status(404).json({ message: "Task not found" });
      return res.status(200).json({ message: "Task deleted", task: deletedTask });
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
