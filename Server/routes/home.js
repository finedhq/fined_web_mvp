import express from "express";
import {fetchData, fetchLeaderBoard} from "../controllers/homeController.js"

const router = express.Router();

router.post("/getdata", fetchData);

router.get("/leaderboard", fetchLeaderBoard);

export default router;
