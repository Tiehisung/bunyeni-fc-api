"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.docSchema = new mongoose_1.default.Schema({
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
    tags: { type: [String], default: () => [] },
    //Essential
    folder: { type: String, required: true, default: 'others' },
}, { timestamps: true });
const DocModel = mongoose_1.default.models.documents || mongoose_1.default.model("documents", exports.docSchema);
exports.default = DocModel;
