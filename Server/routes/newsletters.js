import express from "express";
import { newsletter } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/newsletters", newsletter);

export default router;
