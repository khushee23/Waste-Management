import fs from "fs"
import mongoose from "mongoose"
import Task from "../models/task.model.js"
import BinStatus from "../models/binStatus.model.js"
import { uploadOnCloudinary } from "../lib/cloudinary.js"

export const acceptTask = async (req, res) => {
  try {
    const { taskId, workerId } = req.body || {}
    if (!taskId || !mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Valid taskId required" })
    if (!workerId || !mongoose.isValidObjectId(workerId)) return res.status(400).json({ message: "Valid workerId required" })

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ message: "Task not found" })
    if (task.status === "completed") return res.status(400).json({ message: "Task already completed" })
    if (String(task.workerId) !== String(workerId)) return res.status(403).json({ message: "Task not assigned to this worker" })

    if (task.status === "in-progress") return res.status(200).json({ message: "Task already in-progress", task })

    task.status = "in-progress"
    await task.save()

    return res.status(200).json({ message: "Task accepted", task })
  } catch (err) {
    return res.status(500).json({ message: "Failed to accept task" })
  }
}

export const completeTask = async (req, res) => {
  let localPath
  try {
    const file = req.file
    localPath = file?.path
    const { taskId, workerId } = req.body || {}

    if (!taskId || !mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Valid taskId required" })
    if (!workerId || !mongoose.isValidObjectId(workerId)) return res.status(400).json({ message: "Valid workerId required" })
    if (!file || !localPath) return res.status(400).json({ message: "Proof image is required (field name: proof)" })

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ message: "Task not found" })
    if (task.status === "completed") return res.status(400).json({ message: "Task already completed" })
    if (String(task.workerId) !== String(workerId)) return res.status(403).json({ message: "Task not assigned to this worker" })

    const uploaded = await uploadOnCloudinary(localPath)
    if (!uploaded?.secure_url && !uploaded?.url) {
      return res.status(502).json({ message: "Failed to upload proof to Cloudinary" })
    }

    task.proofImage = uploaded.secure_url || uploaded.url
    task.status = "completed"
    task.completedAt = new Date()
    await task.save()

    await BinStatus.findOneAndUpdate(
      { binId: task.binId },
      {
        overflowLevel: 0,
        status: "normal",
        assignedWorker: null,
        activeTask: null,
        lastUpdated: new Date(),
      },
      { new: true }
    )

    return res.status(200).json({ message: "Task completed", task })
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete task" })
  } finally {
    if (localPath) fs.unlink(localPath, () => {})
  }
}

export const getTasksForWorker = async (req, res) => {
  try {
    const { workerId } = req.params
    if (!mongoose.isValidObjectId(workerId)) return res.status(400).json({ message: "Invalid workerId" })

    const tasks = await Task.find({ workerId }).sort({ createdAt: -1 })
    return res.status(200).json({ tasks })
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch worker tasks" })
  }
}

