// server/modules/seo/seo.routes.ts
import { Router } from "express";
import { getPlayerSeo, getMatchSeo } from "./seo.controllers";

const router = Router();

// THESE URLs are what you SHARE on social media
router.get("/player/:id", getPlayerSeo);
router.get("/match/:id", getMatchSeo);

export default router;