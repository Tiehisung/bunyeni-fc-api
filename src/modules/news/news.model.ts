import mongoose, { Schema } from "mongoose";

const newsSchema = new Schema(
  {
    slug: { type: String, required: [true, "Slug is required"], unique: true },
    headline: {
      text: { type: String, required: [true, "Headline text required"] },
      image: {
        type: String,
        required: [true, "Wall image for headline required"],
      },
    },
    source: {
      type: Schema.Types.Mixed,
      default: "bunyenifc.vercel.app",
    },
    details: [
      {
        text: String,
        media: [{}],
      },
    ],
    type: {
      type: String
      , enum: ['general', 'squad', 'fixture', 'match', 'training',],
      default: 'general'
    },
    metaDetails: {}, //ISquad etc

    stats: {
      type: Schema.Types.Mixed,
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
  },
  { timestamps: true }
);

const NewsModel = mongoose.models.news || mongoose.model("news", newsSchema);
export default NewsModel;

