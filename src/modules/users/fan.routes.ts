// routes/fan.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getFanLeaderboard, getFanStats, registerAsFan } from "./fan.controller";
 

const router = Router();

router.use(authenticate);

router.get("/leaderboard", getFanLeaderboard);
router.get("/stats", getFanStats);
router.post("/register/:userId", registerAsFan);

export default router;