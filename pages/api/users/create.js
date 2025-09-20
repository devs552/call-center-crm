import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectToDatabase();

    const { fullName, email, role, salary, password, group, address } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      role: role || "employee",
      salary,
      password: hashedPassword,
      group,
      address,
      creationtimestamp: new Date(),
    });

    await newUser.save();

    return res.status(201).json({ message: "Employee created", user: newUser });
  } catch (err) {
    console.error("Create employee error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
