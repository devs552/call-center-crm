import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();

  try {
    await connectToDatabase();

    const { id } = req.query;
    const { fullName, role, salary, password, group, address } = req.body;

    const updateData = {
      fullName,
      role,
      salary,
      group,
      address,
    };

    // Only hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Employee updated", user: updatedUser });
  } catch (err) {
    console.error("Update employee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
