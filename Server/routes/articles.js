import express from "express";
import multer from "multer";
import {
  getAllArticles,
  addArticle,
} from "../controllers/articleController.js";

const router = express.Router();
const upload = multer(); // for handling `multipart/form-data`

// GET all articles
router.get("/getall", getAllArticles);

// POST add article
router.post("/add", upload.single("image"), addArticle);

export default router;
