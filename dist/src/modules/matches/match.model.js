"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const match_interface_1 = require("../../types/match.interface");
const matchSchema = new mongoose_1.Schema({
    title: { type: String },
    slug: { type: String, unique: [true, "Slug must be unique"] },
    opponent: { type: mongoose_1.Schema.Types.ObjectId, ref: "teams", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        enum: [...Object.values(match_interface_1.EMatchStatus)],
        default: () => match_interface_1.EMatchStatus.UPCOMING,
    },
    goals: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "goals" }],
    squad: { type: mongoose_1.Schema.Types.ObjectId, ref: "squad" },
    sponsor: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "sponsors" }],
    broadcaster: {},
    venue: { name: { type: String, default: () => 'Home Park' }, files: [{}] },
    isHome: Boolean,
    events: [{ description: String, title: String, minute: String, modeOfScore: String }],
    mvp: {} //iplayer preferred
}, { timestamps: true });
const MatchModel = mongoose_1.default.models.matches || mongoose_1.default.model("matches", matchSchema);
exports.default = MatchModel;
