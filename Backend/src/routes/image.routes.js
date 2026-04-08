import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { uploadImage } from "../controllers/image.controller.js"

const router = Router()

// multipart/form-data:
// - image: file
// - binId: optional Mongo ObjectId (string)
router.post("/upload", upload.single("image"), uploadImage)

export default router

