"use strict";
// import { auth } from "@/auth";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = logAction;
const log_interface_1 = require("../../types/log.interface");
const db_1 = __importDefault(require("../../config/db"));
const logs_model_1 = __importDefault(require("./logs.model"));
(0, db_1.default)();
async function logAction({ title, description, severity = log_interface_1.ELogSeverity.INFO, meta = {}, }) {
    try {
        // const me = await getMe()
        const log = await logs_model_1.default.create({
            title,
            description,
            // user: (session?.user),
            severity,
            meta,
            createdAt: new Date(),
        });
        return log;
    }
    catch (error) {
        console.error("Failed to commit log:", error);
        return null;
    }
}
