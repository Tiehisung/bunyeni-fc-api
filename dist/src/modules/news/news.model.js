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
const newsSchema = new mongoose_1.Schema({
    slug: { type: String, required: [true, "Slug is required"], unique: true },
    headline: {
        text: { type: String, required: [true, "Headline text required"] },
        image: {
            type: String,
            required: [true, "Wall image for headline required"],
        },
    },
    source: {
        type: mongoose_1.Schema.Types.Mixed,
        default: "konjiehifc.vercel.app",
    },
    details: [
        {
            text: String,
            media: [{}],
        },
    ],
    type: {
        type: String,
        enum: ['general', 'squad', 'fixture', 'match', 'training',],
        default: 'general'
    },
    metaDetails: {}, //ISquad etc
    stats: {
        type: mongoose_1.Schema.Types.Mixed,
        default: () => ({ isTrending: true, isLatest: true }),
    },
    likes: {
        type: [{ email: String, name: String, date: String, device: String }],
        default: () => []
    },
    comments: {
        type: [{ name: String, date: String, comment: String, image: String }],
        default: () => []
    },
    shares: {
        type: [{ email: String, name: String, date: String, device: String }],
        default: () => []
    },
    views: {
        type: [{ email: String, name: String, date: String, device: String }],
        default: () => []
    },
    status: {
        type: String,
        default: 'unpublished', enum: ['published', 'unpublished', 'archived']
    },
    reporter: { email: String, name: String, image: String, role: String, about: String },
    editors: [{ email: String, name: String, image: String, role: String, about: String, date: String }]
}, { timestamps: true });
const NewsModel = mongoose_1.default.models.news || mongoose_1.default.model("news", newsSchema);
exports.default = NewsModel;
