import express from "express";
import { saveQuery } from "../controllers/contactController.js";

const router = express.Router();

router.post("/user", saveQuery);

export default router;