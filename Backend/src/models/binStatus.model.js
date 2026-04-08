import mongoose, { Schema } from "mongoose"

const binStatusSchema = new mongoose.Schema(
  {
    binId: {
      type: Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
      unique: true,
      index: true,
    },
    overflowLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["normal", "moderate", "overflow"],
      default: "normal",
      index: true,
    },
    assignedWorker: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    activeTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  { timestamps: true }
)

const BinStatus = mongoose.model("BinStatus", binStatusSchema)
export default BinStatus

