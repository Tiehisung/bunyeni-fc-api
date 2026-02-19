"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.fileSchema = new mongoose_1.default.Schema({
    name: { type: String },
    original_filename: { type: String },
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
}, { timestamps: true });
const FileModel = mongoose_1.default.models.files || mongoose_1.default.model("files", exports.fileSchema);
exports.default = FileModel;
