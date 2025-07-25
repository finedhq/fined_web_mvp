import express from "express";
import multer from "multer";
import {
  addCourse,
  getAllCourses,
  getACourse,
  getACard,
  updateACard,
  getOngoingCourse,
  deleteCourse
} from "../controllers/courseController.js";

const router = express.Router();
const upload = multer();

router.post("/add", upload.single("thumbnail_file"), addCourse);
router.get("/getall", getAllCourses);
router.delete("/:id", deleteCourse);
router.post("/getongoingcourse", getOngoingCourse);
router.post("/course/:course_id", getACourse);
router.post("/course/:course_id/module/:module_id/card/:card_id", getACard);
router.post("/course/:course_id/module/:module_id/card/:card_id/updateCard", updateACard);

export default router;
