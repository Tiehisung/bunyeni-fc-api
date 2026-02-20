"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("../src/app"));
const db_1 = __importDefault(require("../src/config/db"));
let isReady = false;
async function handler(req, res) {
    try {
        // connect only once per serverless instance
        if (!isReady) {
            await (0, db_1.default)();
            isReady = true;
            console.log("✅ Serverless cold start complete");
        }
        return (0, app_1.default)(req, res);
    }
    catch (error) {
        console.error("❌ Fatal startup error:", error);
        res.status(500).json({
            message: "Server initialization failed",
        });
    }
}
