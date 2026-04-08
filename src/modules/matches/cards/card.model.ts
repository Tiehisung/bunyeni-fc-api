import mongoose, { Schema } from "mongoose";
import { ECardType } from "../../../types/card.interface";

export const cardSchema = new Schema(
  {
    minute: String,
    description: String,
    player: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "players",
        required: true
      },
      name: String,
      avatar: String,
      number: String
    },
    match: {},

    type: { type: String, enum: Object.values(ECardType), default: ECardType.YELLOW},
    createdBy: { _id: String, name: String, avatar: String } //As IUser
  },
  { timestamps: true }
);

const CardModel = mongoose.models.cards || mongoose.model("cards", cardSchema);

export default CardModel;

export type IPostCard = mongoose.InferSchemaType<typeof cardSchema>;