import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import Worker from "../models/worker.model.js"
import { generateToken } from "../lib/utils.js"

const sanitizeEmail = (email) => (typeof email === "string" ? email.trim().toLowerCase() : "")

const setAuthResponse = (res, { role, doc }) => {
  const token = generateToken(doc._id, role, res)
  return res.status(200).json({
    token,
    role,
    [role]: doc,
  })
}

const requireFields = (obj, fields) => fields.every((f) => obj?.[f] !== undefined && obj?.[f] !== null && obj?.[f] !== "")

const createSignupHandler =
  ({ model, role, requiredFields, buildCreatePayload }) =>
  async (req, res) => {
    try {
      const body = req.body || {}
      const safeEmail = sanitizeEmail(body.email)

      const merged = { ...body, email: safeEmail }

      if (!requireFields(merged, requiredFields)) {
        return res.status(400).json({ message: "Missing required fields" })
      }

      const existing = await model.findOne({ email: safeEmail })
      if (existing) return res.status(409).json({ message: "Email already in use" })

      const hashed = await bcrypt.hash(merged.password, 10)
      const created = await model.create(buildCreatePayload({ ...merged, password: hashed }))

      const doc = await model.findById(created._id).select("-password")
      return setAuthResponse(res, { role, doc })
    } catch (err) {
      return res.status(500).json({ message: `Failed to sign up ${role}` })
    }
  }

const createLoginHandler =
  ({ model, role }) =>
  async (req, res) => {
    try {
      const { email, password } = req.body || {}
      const safeEmail = sanitizeEmail(email)

      if (!safeEmail || !password) return res.status(400).json({ message: "Email and password required" })

      const docWithPassword = await model.findOne({ email: safeEmail })
      if (!docWithPassword) return res.status(401).json({ message: "Invalid credentials" })

      const ok = await bcrypt.compare(password, docWithPassword.password)
      if (!ok) return res.status(401).json({ message: "Invalid credentials" })

      const doc = await model.findById(docWithPassword._id).select("-password")
      return setAuthResponse(res, { role, doc })
    } catch (err) {
      return res.status(500).json({ message: `Failed to login ${role}` })
    }
  }

export const signupUser = createSignupHandler({
  model: User,
  role: "user",
  requiredFields: ["name", "email", "password", "rollno", "class", "branch"],
  buildCreatePayload: ({ name, email, password, rollno, class: className, branch }) => ({
    name,
    email,
    password,
    rollno,
    class: className,
    branch,
  }),
})

export const loginUser = createLoginHandler({ model: User, role: "user" })

export const signupWorker = createSignupHandler({
  model: Worker,
  role: "worker",
  requiredFields: ["name", "email", "password", "workerId"],
  buildCreatePayload: ({ name, email, password, workerId }) => ({
    name,
    email,
    password,
    workerId,
  }),
})

export const loginWorker = createLoginHandler({ model: Worker, role: "worker" })

export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  })
  return res.status(200).json({ message: "Logged out" })
}

export const me = async (req, res) => {
  const role = req.auth?.role
  if (role === "user") return res.status(200).json({ role, user: req.user })
  if (role === "worker") return res.status(200).json({ role, worker: req.worker })
  return res.status(200).json({ role: null })
}

