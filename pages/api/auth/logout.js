import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
  pack: { type: String, required: true },
  region: { type: String },
  landline: { type: String },
  name: { type: String },
  closeDate: { type: Date },
  EID: { type: String },
  building: { type: String },
  flat: { type: String },
  area: { type: String },
  contact: { type: String },
  dncr: { type: Boolean, default: false },
  remarks: { type: String },
  comments: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Task = models.Task || model("Task", TaskSchema);
export default Task;
