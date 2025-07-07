import express from "express";
import multer from "multer";
import {
  getAllArticles,
  saveEmail,
  removeEmail,
  addArticle,
  fetchEnteredEmail
} from "../controllers/articleController.js";

const router = express.Router();
const upload = multer();

router.post("/getall", getAllArticles);

router.post("/saveemail", saveEmail);

router.post("/removeemail", removeEmail);

router.post("/getenteredemail", fetchEnteredEmail);

router.post("/add", upload.single("image"), addArticle);

export default router;