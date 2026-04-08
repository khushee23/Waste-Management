import { Router } from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import {
  loginUser,
  loginWorker,
  logout,
  me,
  signupUser,
  signupWorker,
} from "../controllers/auth.controller.js"

const router = Router()

// User auth
router.post("/user/signup", signupUser)
router.post("/user/login", loginUser)

// Worker auth
router.post("/worker/signup", signupWorker)
router.post("/worker/login", loginWorker)

// Session
router.post("/logout", logout)
router.get("/me", requireAuth, me)

export default router