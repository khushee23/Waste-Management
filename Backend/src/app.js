import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import authRoutes from "./routes/auth.routes.js"
import imageRoutes from "./routes/image.routes.js"
import binRoutes from "./routes/bin.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
)

app.use("/api/auth", authRoutes)
app.use("/api/image", imageRoutes)
app.use("/api/bin", binRoutes)
app.use("/api/task", taskRoutes)

export default app