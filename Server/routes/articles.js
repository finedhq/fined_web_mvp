import express from "express";
import multer from "multer";
import {
  getAllArticles,
  saveEmail,
  removeEmail,
  addArticle,
  fetchEnteredEmail,
  updateTask,
  rate,
  fetchRating,
  deleteArticle
} from "../controllers/articleController.js";

const router = express.Router();
const upload = multer();

router.post("/getall", getAllArticles);

router.post("/saveemail", saveEmail);

router.post("/removeemail", removeEmail);

router.post("/getenteredemail", fetchEnteredEmail);

router.post("/updatetask", updateTask);

router.post("/fetchrating", fetchRating);

router.post("/rate", rate);

router.delete("/:id", deleteArticle);

router.post("/add", upload.single("image"), addArticle);

export default router;