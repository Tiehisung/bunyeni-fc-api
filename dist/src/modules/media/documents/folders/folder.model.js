"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docFolderSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.docFolderSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'You must provide a folder name'],
        unique: [true, 'Name must be a unique value']
    },
    description: { type: String },
    isDefault: { type: Boolean, default: () => false },
    documents: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "documents", default: () => []
    },
}, { timestamps: true });
const FolderModel = mongoose_1.default.models["folders"] || mongoose_1.default.model("folders", exports.docFolderSchema);
exports.default = FolderModel;
