import express from "express";
import multer from "multer";
import { addCard, getCardsByModule } from "../controllers/cardsController.js";

const router = express.Router();
const upload = multer(); // handles multipart/form-data

router.get("/:moduleId/getall", getCardsByModule);
router.post("/add/:moduleId", upload.fields([
  { name: "image_file" },
  { name: "audio_file" },
  { name: "video_file" },
]), addCard);

export default router;
