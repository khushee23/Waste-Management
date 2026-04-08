import fs from "fs"
import mongoose from "mongoose"
import Bin from "../models/bin.model.js"
import Image from "../models/image.model.js"
import BinStatus from "../models/binStatus.model.js"
import Task from "../models/task.model.js"
import { uploadOnCloudinary } from "../lib/cloudinary.js"
import { analyzeImage } from "../services/ai.service.js"
import { decideOverflow } from "../services/decision.service.js"
import { assignNearestWorker } from "../services/assignment.service.js"

const calcPriority = ({ overflowLevel, distanceKm }) => {
  const d = Number.isFinite(distanceKm) ? distanceKm : 1000
  return Number(overflowLevel || 0) + d
}

export const uploadBinImage = async (req, res) => {
  let localPath
  try {
    const file = req.file
    localPath = file?.path
    const { binId, binLocation } = req.body || {}

    if (!file || !localPath) {
      return res.status(400).json({ message: "Image file is required (field name: image)" })
    }
    if (!binId || !mongoose.isValidObjectId(binId)) {
      return res.status(400).json({ message: "Valid binId is required" })
    }

    const bin = await Bin.findById(binId)
    if (!bin) return res.status(404).json({ message: "Bin not found" })

    const uploaded = await uploadOnCloudinary(localPath)
    if (!uploaded?.secure_url && !uploaded?.url) {
      return res.status(502).json({ message: "Failed to upload image to Cloudinary" })
    }
    const imageUrl = uploaded.secure_url || uploaded.url

    const imageDoc = await Image.create({ imageURL: imageUrl, binId })

    const overflowLevel = await analyzeImage(imageUrl)
    const status = decideOverflow(overflowLevel)

    const current = await BinStatus.findOne({ binId })
    if (current?.status === "overflow" && current?.activeTask) {
      // Bin already has an active task; just update latest metrics.
      const updated = await BinStatus.findOneAndUpdate(
        { binId },
        {
          overflowLevel,
          status,
          lastUpdated: new Date(),
        },
        { new: true, upsert: true }
      ).populate("assignedWorker activeTask")

      return res.status(200).json({
        message: "Bin status updated (task already active)",
        image: imageDoc,
        overflowLevel,
        status,
        assignedWorker: updated.assignedWorker,
        task: updated.activeTask,
      })
    }

    let assignedWorker = null
    let task = null

    if (status === "overflow") {
      let parsedLocation = null
      if (typeof binLocation === "string") {
        try {
          parsedLocation = JSON.parse(binLocation)
        } catch {
          parsedLocation = null
        }
      } else if (typeof binLocation === "object" && binLocation) {
        parsedLocation = binLocation
      }

      const nearest = await assignNearestWorker(parsedLocation)
      assignedWorker = nearest?.worker || null

      if (assignedWorker) {
        const priority = calcPriority({ overflowLevel, distanceKm: nearest.distanceKm })
        task = await Task.create({
          binId,
          workerId: assignedWorker._id,
          status: "assigned",
          priority,
        })
      }
    }

    const statusDoc = await BinStatus.findOneAndUpdate(
      { binId },
      {
        overflowLevel,
        status,
        assignedWorker: assignedWorker ? assignedWorker._id : null,
        activeTask: task ? task._id : null,
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    ).populate("assignedWorker activeTask")

    return res.status(200).json({
      message: "Bin image processed",
      image: imageDoc,
      overflowLevel,
      status,
      assignedWorker: statusDoc.assignedWorker,
      task: statusDoc.activeTask,
      edgeCase: status === "overflow" && !assignedWorker ? "NO_WORKER_AVAILABLE_OR_LOCATION_MISSING" : null,
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to process bin image" })
  } finally {
    if (localPath) fs.unlink(localPath, () => {})
  }
}

export const getBinStatus = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid bin id" })

    const bin = await Bin.findById(id)
    if (!bin) return res.status(404).json({ message: "Bin not found" })

    const status = await BinStatus.findOne({ binId: id }).populate("assignedWorker activeTask")
    return res.status(200).json({ bin, status })
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch bin status" })
  }
}

