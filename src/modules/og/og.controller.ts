// server/modules/og/og.controller.ts
import { Request, Response } from "express";
import MatchModel from "../matches/match.model";
import PlayerModel from "../players/player.model";
import NewsModel from "../news/news.model";
import { generateOgImage } from "./og.service";
import { getErrorMessage } from "../../lib";

const ogCache = new Map<string, Buffer>();

export const getDefaultOg = async (req: Request, res: Response) => {
    try {
        const cacheKey = "default";

        if (ogCache.has(cacheKey)) {
            res.setHeader("Content-Type", "image/png");
            return res.send(ogCache.get(cacheKey));
        }

        const image = await generateOgImage({
            title: process.env.APP_NAME!,
            subtitle: process.env.APP_TAGLINE,
            type: "default",
        });

        ogCache.set(cacheKey, image);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(image);
    } catch (error) {
        res.status(500).send("Failed to generate OG image");
    }
};

export const getPlayerOg = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `player-${id}`;

        if (ogCache.has(cacheKey)) {
            res.setHeader("Content-Type", "image/png");
            return res.send(ogCache.get(cacheKey));
        }

        const player = await PlayerModel.findById(id).lean();
        if (!player) {
            return res.status(404).json({ success: false, message: "Player not found" });
        }

        const image = await generateOgImage({
            title: `${player.firstName} ${player.lastName}`,
            subtitle: `${player.position} • ${process.env.APP_NAME}`,
            imageUrl: player.image || player.avatar,
            type: "player",
        });

        ogCache.set(cacheKey, image);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(image);
    } catch (error) {
        res.status(500).send("Failed to generate OG image");
    }
};

export const getMatchOg = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `match-${id}`;

        if (ogCache.has(cacheKey)) {
            res.setHeader("Content-Type", "image/png");
            return res.send(ogCache.get(cacheKey));
        }

        const match = await MatchModel.findById(id).populate("opponent").lean();
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        const teamScore = match.computed?.teamScore || 0;
        const opponentScore = match.computed?.opponentScore || 0;
        const resultText = match.status === "FT"
            ? `${teamScore} - ${opponentScore}`
            : match.status === "LIVE"
                ? "LIVE NOW"
                : "UPCOMING";

        const image = await generateOgImage({
            title: match.title || `vs ${(match.opponent as any)?.name}`,
            subtitle: `${match.date} • ${resultText}`,
            type: "match",
        });

        ogCache.set(cacheKey, image);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(image);
    } catch (error) {
        res.status(500).send("Failed to generate OG image");
    }
};

export const getNewsOg = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `news-${id}`;

        if (ogCache.has(cacheKey)) {
            res.setHeader("Content-Type", "image/png");
            return res.send(ogCache.get(cacheKey));
        }

        const news = await NewsModel.findById(id).lean();
        if (!news) {
            return res.status(404).json({ success: false, message: "News not found" });
        }

        const image = await generateOgImage({
            title: news.headline?.text || news.title,
            subtitle: "Latest News",
            imageUrl: news.headline?.image,
            type: "news",
        });

        ogCache.set(cacheKey, image);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(image);
    } catch (error) {
        res.status(500).send("Failed to generate OG image");
    }
};

export const clearOgCache = async (req: Request, res: Response) => {
    try {
        ogCache.clear();
        res.status(200).json({ success: true, message: "OG cache cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};