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
/**
 * Gallery Schema
 *
 * @typedef {Object} Gallery
 * @property {string} title - The title of the gallery.
 * @property {string} description - The description of the gallery, trimmed of whitespace.
 * @property {Array<ObjectId>} files - An array of ObjectIds referencing the files associated with the gallery.
 * @property {ObjectId} player - An ObjectId referencing the player associated with the gallery.
 * @property {ObjectId} manager - An ObjectId referencing the manager associated with the gallery.
 *
 * @property {Date} createdAt - The date when the gallery was created.
 * @property {Date} updatedAt - The date when the gallery was last updated.
 */
const gallerySchema = new mongoose_1.Schema({
    title: { type: String, },
    description: { type: String, trim: true },
    files: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "files" }], // IFileProps[]
    // Probable associated owners
    tags: [String], //eg. objectIds, anything relevant to search
    type: { type: mongoose_1.Schema.Types.String, enum: ['player', 'donation', 'general'], default: 'general' },
    createdBy: {}
}, { timestamps: true });
const GalleryModel = mongoose_1.default.models.galleries || mongoose_1.default.model("galleries", gallerySchema);
exports.default = GalleryModel;
