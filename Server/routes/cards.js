import express from "express";
import multer from "multer";
import { addCard, deleteCard, getCardsByModule } from "../controllers/cardsController.js";

const router = express.Router();
const upload = multer();

router.get("/:moduleId/getall", getCardsByModule);
router.delete("/:id", deleteCard);
router.post("/add/:moduleId", upload.fields([
  { name: "image_file" },
  { name: "audio_file" },
  { name: "video_file" },
]), addCard);

export default router;