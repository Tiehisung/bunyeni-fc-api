"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMatchEvent = updateMatchEvent;
const match_model_1 = __importDefault(require("./match.model"));
async function updateMatchEvent(matchId, event) {
    try {
        const updated = await match_model_1.default.findByIdAndUpdate(matchId, {
            $push: { events: event },
        });
        if (updated)
            return { success: true, data: updated };
        return { success: false, };
    }
    catch {
        return { success: false, };
    }
}
