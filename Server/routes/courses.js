import express from "express";
import multer from "multer";
import {
  addCourse,
  getAllCourses,
} from "../controllers/courseController.js";

const router = express.Router();
const upload = multer(); // Handle multipart/form-data

router.post("/add", upload.single("thumbnail_file"), addCourse);
router.get("/getall", getAllCourses);

export default router;
