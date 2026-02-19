import mongoose, { Schema } from "mongoose";

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

const gallerySchema = new Schema(
  {
    title: { type: String, },
    description: { type: String, trim: true },
    files: [{ type: Schema.Types.ObjectId, ref: "files" }], // IFileProps[]
    // Probable associated owners
    tags: [String],//eg. objectIds, anything relevant to search
    type: { type: Schema.Types.String, enum: ['player', 'donation', 'general'], default: 'general' },
    createdBy: {}
  },
  { timestamps: true }
);

const GalleryModel =
  mongoose.models.galleries || mongoose.model("galleries", gallerySchema);
export default GalleryModel;