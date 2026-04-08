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

    isPublished: Boolean,
    stats: {
      type: Schema.Types.Mixed,
      default: () => ({ isTrending: true, isLatest: true }),
    },
    likes: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, date: String, device: String }],
    comments: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, date: String, device: String, comment: String }],
    views: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, date: String, device: String }],
    shares: {
      type: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, date: String, device: String }],
      default: () => []
    },

    status: {
      type: String,
      default: 'unpublished', enum: ['published', 'unpublished', 'archived']
    },
    reporter: { email: String, name: String, image: String, role: String, about: String },
    editors: [{ email: String, name: String, image: String, role: String, about: String, date: String }],
    createdBy: { _id: String, name: String, avatar: String } //As IUser
  },
  { timestamps: true }
);

// Virtual for counts
newsSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

newsSchema.virtual("commentsCount").get(function () {
  return this.comments?.length || 0;
});

newsSchema.virtual("viewsCount").get(function () {
  return this.views?.length || 0;
});

newsSchema.virtual("sharesCount").get(function () {
  return this.shares?.length || 0;
});

// Indexes for better query performance
newsSchema.index({ createdAt: -1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ type: 1 });
newsSchema.index({ isPublished: 1 });


const NewsModel = mongoose.models.news || mongoose.model("news", newsSchema);
export default NewsModel;

