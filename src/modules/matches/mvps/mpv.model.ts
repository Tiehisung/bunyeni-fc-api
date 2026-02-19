import mongoose, { Schema } from "mongoose";

export const mvpSchema = new Schema(
  {
    player: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "players",
        required: true
      },
      name: String,
      avatar: String,
      number: Number
    },
    match: {},
    description: String,
    positionPlayed: String,
    season:String
  },

  { timestamps: true }
);

const MvPModel = mongoose.models.mvps || mongoose.model("mvps", mvpSchema);

export default MvPModel;

export type IPostMvp = mongoose.InferSchemaType<typeof mvpSchema>;