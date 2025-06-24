import express from "express";
import { getModulesByCourse, addModule } from "../controllers/modulesController.js";

const router = express.Router();

router.get("/course/:course_id", getModulesByCourse);
router.post("/add/:course_id", addModule);

export default router;
