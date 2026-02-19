"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.highlightSchema = new mongoose_1.default.Schema({
    original_filename: { type: String },
    name: { type: String },
    title: String,
    description: { type: String },
    secure_url: { type: String },
    thumbnail_url: String,
    url: { type: String },
    resource_type: String,
    bytes: Number,
    public_id: String,
    asset_id: String,
    format: String,
    width: Number,
    height: Number,
    tags: { type: [String], default: () => [] }, //Can be used to store any tags associated with the file eg.'objectIds', 'profile-picture', 'gallery-image','video', etc.
    match: {},
}, { timestamps: true });
const HighlightModel = mongoose_1.default.models.highlights || mongoose_1.default.model("highlights", exports.highlightSchema);
exports.default = HighlightModel;
