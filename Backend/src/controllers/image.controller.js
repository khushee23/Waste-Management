import fs from "fs"
import mongoose from "mongoose"
import Image from "../models/image.model.js"
import { uploadOnCloudinary } from "../lib/cloudinary.js"

export const uploadImage = async (req, res) => {
  let localPath
  try {
    const file = req.file
    localPath = file?.path
    const { binId } = req.body || {}

    if (!file || !localPath) {
      return res.status(400).json({ message: "Image file is required (field name: image)" })
    }

    if (binId && !mongoose.isValidObjectId(binId)) {
      return res.status(400).json({ message: "Invalid binId" })
    }

    const uploaded = await uploadOnCloudinary(localPath)
    if (!uploaded?.secure_url && !uploaded?.url) {
      return res.status(502).json({ message: "Failed to upload image to Cloudinary" })
    }

    const imageUrl = uploaded.secure_url || uploaded.url

    const created = await Image.create({
      imageURL: imageUrl,
      ...(binId ? { binId } : {}),
    })

    return res.status(201).json({
      message: "Image uploaded",
      image: created,
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to upload image" })
  } finally {
    // Cloudinary helper only unlinks on error; we ensure temp cleanup on success too.
    if (localPath) {
      fs.unlink(localPath, () => {})
    }
  }
}

