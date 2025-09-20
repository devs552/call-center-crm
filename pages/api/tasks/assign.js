import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { taskIds, userId } = req.body;

    console.log("Incoming body:", req.body);

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "taskIds must be a non-empty array" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Cast to ObjectId
    const objectTaskIds = taskIds.map((id) => new mongoose.Types.ObjectId(id));
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Bulk update
    const updatedTasks = await Task.updateMany(
      { _id: { $in: objectTaskIds } },
      { $set: { assignedTo: objectUserId, status: "assigned" } }
    );

    return res.status(200).json({
      message: "Tasks assigned successfully",
      matched: updatedTasks.matchedCount,
      modified: updatedTasks.modifiedCount,
    });
  } catch (error) {
    console.error("Error assigning tasks:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
