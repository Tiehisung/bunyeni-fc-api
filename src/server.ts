// src/server.ts
import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE FIRST LINE

import app from './app';
import connectDB from './config/db.config';
import { ENV } from "./config/env.config";

const PORT = ENV.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${ENV.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

if (process.env.VERCEL !== '1') {
    startServer();
}

export default app;