//modules/og/og.routes.ts
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getMatchMeta, getPlayerMeta } from "./og.controller";

const ogLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
});



const router = Router();

// router.get("/default", getDefault);
router.get("/player/:id", getPlayerMeta);
router.get("/match/:id", ogLimiter, getMatchMeta);
// router.get("/news/:id", getNewsme);
// router.post("/clear-cache", clearOgCache);

export default router;
 
// import { Request, Response, Router } from "express";
// import MatchModel from "../matches/match.model";
// import PlayerModel from "../players/player.model";
// import { generateOgImage } from "./generateOgImage";


// const router = Router();

// // Cache generated images in memory
// const cache = new Map<string, Buffer>();

// // Default OG
// router.get("/og/default", async (req: Request, res: Response) => {
//     try {
//         const cacheKey = "default";
//         if (cache.has(cacheKey)) {
//             res.setHeader("Content-Type", "image/png");
//             return res.send(cache.get(cacheKey));
//         }

//         const image = await generateOgImage({
//             title: process.env.VITE_APP_NAME!,
//             subtitle: process.env.VITE_APP_TAGLINE,
//             type: "default",
//         });

//         cache.set(cacheKey, image);
//         res.setHeader("Content-Type", "image/png");
//         res.setHeader("Cache-Control", "public, max-age=86400");
//         res.send(image);
//     } catch (error) {
//         res.status(500).send("Failed to generate OG image");
//     }
// });

// // Player OG
// router.get("/og/player/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const cacheKey = `player-${id}`;

//         if (cache.has(cacheKey)) {
//             res.setHeader("Content-Type", "image/png");
//             return res.send(cache.get(cacheKey));
//         }

//         const player = await PlayerModel.findById(id).lean();
//         if (!player) return res.status(404).send("Player not found");

//         const image = await generateOgImage({
//             title: `${player.firstName} ${player.lastName}`,
//             subtitle: `${player.position} • ${process.env.VITE_APP_NAME}`,
//             imageUrl: player.image,
//             type: "player",
//         });

//         cache.set(cacheKey, image);
//         res.setHeader("Content-Type", "image/png");
//         res.setHeader("Cache-Control", "public, max-age=86400");
//         res.send(image);
//     } catch (error) {
//         res.status(500).send("Failed to generate OG image");
//     }
// });

// // Match OG
// router.get("/og/match/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const cacheKey = `match-${id}`;

//         if (cache.has(cacheKey)) {
//             res.setHeader("Content-Type", "image/png");
//             return res.send(cache.get(cacheKey));
//         }

//         const match = await MatchModel.findById(id).populate("opponent").lean();
//         if (!match) return res.status(404).send("Match not found");

//         const image = await generateOgImage({
//             title: match.title || `vs ${(match.opponent as any)?.name}`,
//             subtitle: `${match.date} • ${match.competition}`,
//             type: "match",
//         });

//         cache.set(cacheKey, image);
//         res.setHeader("Content-Type", "image/png");
//         res.setHeader("Cache-Control", "public, max-age=86400");
//         res.send(image);
//     } catch (error) {
//         res.status(500).send("Failed to generate OG image");
//     }
// });

// export default router;