import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { acceptTask, completeTask, getTasksForWorker } from "../controllers/task.controller.js"

const router = Router()

router.post("/accept", acceptTask)
router.post("/complete", upload.single("proof"), completeTask)
router.get("/worker/:workerId", getTasksForWorker)

export default router

