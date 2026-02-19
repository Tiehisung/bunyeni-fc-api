import mongoose from "mongoose";
import { EArchivesCollection } from "../../types/archive.interface";
 


const archiveSchema = new mongoose.Schema(
  {
    // Original data
    data: {},

    sourceCollection: {
      type: String,
      enum: [...Object.values(EArchivesCollection)],
      required: [true, 'Source collection collection required']
    },
    // Archive metadata

    dateArchived: {
      type: Date,
      default: Date.now
    },

    reason: String,
    originalId: mongoose.Schema.Types.ObjectId,
    user: {
      name: String,
      email: String,
      image: String,
      role: String
    }

  }, {
  timestamps: true,
}

);

// Export models (fixed naming consistency)
export const ArchiveModel = mongoose.models.Archive ||
  mongoose.model("Archive", archiveSchema);

export default ArchiveModel