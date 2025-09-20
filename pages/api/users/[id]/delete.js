import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  try {
    await connectToDatabase();

    const { id } = req.query;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Employee deleted", user: deletedUser });
  } catch (err) {
    console.error("Delete employee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
