// server/modules/seo/seo.controller.ts
import { Request, Response } from "express";
import PlayerModel from "../players/player.model";
import MatchModel from "../matches/match.model";
import NewsModel from "../news/news.model";

/**
 * Returns HTML with meta tags for crawlers.
 * This is what you SHARE on social media.
 */
export const getPlayerSeo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const player = await PlayerModel.findById(id).lean();

        if (!player) {
            return res.status(404).send("Player not found");
        }

        const name = `${player.firstName} ${player.lastName}`;
        const ogImageUrl = `${process.env.API_URL}/og/player/${id}`;
        const frontendUrl = `${process.env.FRONTEND_URL}/players/details?playerId=${id}`;

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${name} | ${process.env.APP_NAME}</title>
    <meta name="description" content="Player profile for ${name}. ${player.position} wearing jersey #${player.number}.">
    
    <!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
    <meta property="og:title" content="${name}">
    <meta property="og:description" content="Player profile for ${name}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${frontendUrl}">
    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="${process.env.APP_NAME}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${name}">
    <meta name="twitter:description" content="Player profile for ${name}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <!-- Redirect real users to the actual app -->
    <meta http-equiv="refresh" content="0; url=${frontendUrl}">
</head>
<body>
    <script>
        window.location.href = "${frontendUrl}";
    </script>
    <p>Loading... <a href="${frontendUrl}">Click here</a> if not redirected.</p>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(html);
    } catch (error) {
        console.error("SEO error:", error);
        res.status(500).send("Error generating page");
    }
};

export const getMatchSeo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const match = await MatchModel.findById(id).populate("opponent").lean();

        if (!match) {
            return res.status(404).send("Match not found");
        }

        const teamScore = match.computed?.teamScore || 0;
        const opponentScore = match.computed?.opponentScore || 0;
        const ogImageUrl = `${process.env.API_URL}/og/match/${id}`;
        const frontendUrl = `${process.env.FRONTEND_URL}/matches/${match.slug || id}`;

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${match.title} | ${process.env.APP_NAME}</title>
    <meta name="description" content="${match.title} match. Score: ${teamScore} - ${opponentScore}">
    
    <meta property="og:title" content="${match.title}">
    <meta property="og:description" content="Match result: ${teamScore} - ${opponentScore}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${frontendUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${process.env.APP_NAME}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${match.title}">
    <meta name="twitter:description" content="Match result: ${teamScore} - ${opponentScore}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <meta http-equiv="refresh" content="0; url=${frontendUrl}">
</head>
<body>
    <script>window.location.href = "${frontendUrl}";</script>
    <p>Loading... <a href="${frontendUrl}">Click here</a> if not redirected.</p>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(html);
    } catch (error) {
        console.error("SEO error:", error);
        res.status(500).send("Error generating page");
    }
};