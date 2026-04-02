// modules/seo/seo.controller.ts
import { Request, Response } from "express";
import PlayerModel from "../players/player.model";
import MatchModel from "../matches/match.model";

export const getPlayerMeta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const player = await PlayerModel.findById(id).lean();

        if (!player) {
            return res.status(404).send("Player not found");
        }

        const name = `${player.firstName} ${player.lastName}`;
        const ogImageUrl = `${process.env.API_URL}/og/player/${id}`;
        const frontendUrl = `${process.env.FRONTEND_URL}/players/details?playerId=${id}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${name} | ${process.env.APP_NAME}</title>
    <meta name="description" content="Player profile for ${name}. ${player.position} wearing jersey #${player.number}.">
    
    <meta property="og:title" content="${name}">
    <meta property="og:description" content="Player profile for ${name}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:url" content="${frontendUrl}">
    <meta property="og:type" content="profile">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${name}">
    <meta name="twitter:description" content="Player profile for ${name}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <meta http-equiv="refresh" content="0; url=${frontendUrl}">
</head>
<body>
    <script>window.location.href = "${frontendUrl}";</script>
</body>
</html>
        `;

        res.setHeader("Content-Type", "text/html");
        res.send(html);
    } catch (error) {
        res.status(500).send("Error generating meta tags");
    }
};

export const getMatchMeta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const match = await MatchModel.findById(id).populate("opponent").lean();

        if (!match) {
            return res.status(404).send("Match not found");
        }

        const ogImageUrl = `${process.env.API_URL}/og/match/${id}`;
        const frontendUrl = `${process.env.FRONTEND_URL}/matches/${match.slug || id}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${match.title} | ${process.env.APP_NAME}</title>
    <meta name="description" content="${match.title} match. ${match.computed?.teamScore || 0} - ${match.computed?.opponentScore || 0}">
    
    <meta property="og:title" content="${match.title}">
    <meta property="og:description" content="Match result: ${match.computed?.teamScore || 0} - ${match.computed?.opponentScore || 0}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:url" content="${frontendUrl}">
    <meta property="og:type" content="website">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${match.title}">
    <meta name="twitter:description" content="Match result: ${match.computed?.teamScore || 0} - ${match.computed?.opponentScore || 0}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <meta http-equiv="refresh" content="0; url=${frontendUrl}">
</head>
<body>
    <script>window.location.href = "${frontendUrl}";</script>
</body>
</html>
        `;

        res.setHeader("Content-Type", "text/html");
        res.send(html);
    } catch (error) {
        res.status(500).send("Error generating meta tags");
    }
};