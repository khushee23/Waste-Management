import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import Worker from "../models/worker.model.js"

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { id, role } = payload || {}
    if (!id || !role) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (role === "user") {
      const user = await User.findById(id).select("-password")
      if (!user) return res.status(401).json({ message: "Unauthorized" })
      req.auth = { role: "user", id: user._id }
      req.user = user
      return next()
    }

    if (role === "worker") {
      const worker = await Worker.findById(id).select("-password")
      if (!worker) return res.status(401).json({ message: "Unauthorized" })
      req.auth = { role: "worker", id: worker._id }
      req.worker = worker
      return next()
    }

    return res.status(401).json({ message: "Unauthorized" })
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" })
  }
}

