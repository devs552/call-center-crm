import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    await connectToDatabase();

    // ✅ Get token from Authorization header OR cookie
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.split(" ")[1]) ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    // ✅ Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // ✅ Optional: Only allow admins
    // if (decoded.profile !== "admin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // ✅ Fetch all users (exclude passwords)
    const users = await User.find({}, "-password");

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
