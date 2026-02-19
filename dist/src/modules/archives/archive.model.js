"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const archive_interface_1 = require("../../types/archive.interface");
const archiveSchema = new mongoose_1.default.Schema({
    // Original data
    data: {},
    sourceCollection: {
        type: String,
        enum: [...Object.values(archive_interface_1.EArchivesCollection)],
        required: [true, 'Source collection collection required']
    },
    // Archive metadata
    dateArchived: {
        type: Date,
        default: Date.now
    },
    reason: String,
    originalId: mongoose_1.default.Schema.Types.ObjectId,
    user: {
        name: String,
        email: String,
        image: String,
        role: String
    }
}, {
    timestamps: true,
});
// Export models (fixed naming consistency)
exports.ArchiveModel = mongoose_1.default.models.Archive ||
    mongoose_1.default.model("Archive", archiveSchema);
exports.default = exports.ArchiveModel;
