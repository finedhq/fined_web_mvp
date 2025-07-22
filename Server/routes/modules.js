import express from "express";
import { getModulesByCourse, addModule, deleteModule } from "../controllers/modulesController.js";

const router = express.Router();

router.get("/course/:course_id", getModulesByCourse);
router.post("/add/:course_id", addModule);
router.delete("/:id", deleteModule);

export default router;
