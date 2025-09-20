import multer from "multer";
import * as XLSX from "xlsx";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

const upload = multer({
  storage: multer.memoryStorage(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateId() {
  return "TASK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    upload.single("file")(req, {}, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload error" });
      }

      try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const tasks = rows.map((row) => {
          let assignedTo = null;

          if (row["assigned to"] && mongoose.Types.ObjectId.isValid(row["assigned to"])) {
            assignedTo = row["assigned to"]; // ✅ valid ObjectId
          }

          return {
            id: row.id ? String(row.id) : generateId(),
            Pack: row.Pack || "",
            region: row.region || "",
            landline: row.Landline || "",
            name: row.Name || "",
            closed: row.Closed || "",
            EID: row.EID || "",
            Building: row.Building || "",
            flat: row.Flat || "",
            area: row.Area || "",
            contact: row.contact || "",
            dncr: row.dncr || "",
            Remarks: row.REMARKS || "",
            comments: row.comments || "",
            assignedTo, // ✅ only ObjectId or null
            status: row.STATUS || "",
            taskCreationTime: row["task creation time"]
              ? new Date(row["task creation time"])
              : new Date(),
          };
        });

        await Task.insertMany(tasks);

        return res.status(201).json({ message: "Tasks uploaded successfully" });
      } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
