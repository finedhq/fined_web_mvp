import express from "express";
import { saveUserResponse } from "../controllers/userResponseController.js";

const router = express.Router();

router.post("/save", saveUserResponse);

export default router;
