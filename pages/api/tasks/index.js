import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const tasks = Array.isArray(req.body) ? req.body : [req.body];

      const inserted = await Task.insertMany(
        tasks.map((task) => ({ ...task, assignedTo: null }))
      );

      return res.status(201).json({ message: "Tasks created", tasks: inserted });
    } catch (error) {
      console.error("Error creating tasks:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const tasks = await Task.find().populate("assignedTo", "full_name email");
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
