"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToArchive = saveToArchive;
const archive_model_1 = __importDefault(require("./archive.model"));
async function saveToArchive({ data, sourceCollection, reason, originalId }) {
    try {
        // const session = await auth()
        const log = await archive_model_1.default.create({
            data,
            sourceCollection,
            originalId,
            // user: (session?.user),
            reason,
        });
        return log;
    }
    catch (error) {
        console.error("Failed to commit log:", error);
        return null;
    }
}
