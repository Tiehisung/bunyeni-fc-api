// Vercel entrypoint for API routes. This file is used to export all API route handlers.
//api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import connectDB from "../src/config/db.config";

let isReady = false;

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        // connect only once per serverless instance
        if (!isReady) {
            await connectDB();
            isReady = true;
            console.log("✅ Serverless cold start complete");
        }

        return app(req, res);
    } catch (error) {
        console.error("❌ Fatal startup error:", error);

        res.status(500).json({
            message: "Server initialization failed",
        });
    }
}