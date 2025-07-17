import express from "express";
import {fetchData, fetchLeaderBoard, fetchNotifications, hasUnseen, updateNotifications, fetchFinScoreLogs, saveFeedback, getRecommendations} from "../controllers/homeController.js"

const router = express.Router();

router.post("/getdata", fetchData);

router.post("/notifications", fetchNotifications);

router.post("/updatenotifications", updateNotifications);

router.post("/hasunseen", hasUnseen);

router.post("/finscorelog", fetchFinScoreLogs);

router.get("/leaderboard", fetchLeaderBoard);

router.post("/feedback", saveFeedback);

router.post("/recommendations", getRecommendations);

export default router;
