import mongoose, { Schema } from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    binId: {
      type: Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in-progress", "completed"],
      default: "assigned",
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    proofImage: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

const Task = mongoose.model("Task", taskSchema)
export default Task

