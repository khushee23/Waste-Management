import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { getBinStatus, uploadBinImage } from "../controllers/bin.controller.js"

const router = Router()

router.post("/upload", upload.single("image"), uploadBinImage)
router.get("/:id", getBinStatus)

export default router

