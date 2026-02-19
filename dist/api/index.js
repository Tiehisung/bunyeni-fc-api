"use strict";
// Vercel entrypoint for API routes. This file is used to export all API route handlers.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// api/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../src/app"));
const db_1 = __importDefault(require("../src/config/db"));
// Connect to database (Vercel will cache this)
(0, db_1.default)().catch(err => {
    console.error("❌ MongoDB connection error:", err);
});
exports.default = app_1.default;
