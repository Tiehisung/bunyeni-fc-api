// Vercel entrypoint for API routes. This file is used to export all API route handlers.


import app from "../src/app";
import connectDB from "../src/config/db";

// Connect to database (Vercel will cache this)
connectDB().catch(err => {
    console.error("❌ MongoDB connection error:", err);
});

export default app;