import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },   // Task ID (from sheet)
  Pack: { type: String },
  region: { type: String },
  landline: { type: String },
  name: { type: String },
  closed: { type: String }, // closed date
  EID: { type: String },
  Building: { type: String },
  flat: { type: String },
  area: { type: String },
  contact: { type: String },
  dncr: { type: String },
  Remarks: { type: String },
  comments: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null on creation
  status: { type: String, default: "pending" },
  taskCreationTime: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
