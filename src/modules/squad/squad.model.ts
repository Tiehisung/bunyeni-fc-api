import mongoose, { Schema } from "mongoose";

export const squadSchema = new Schema({
  match: { type: Schema.Types.ObjectId, ref: "matches", required: true },

  description: String,
  title: String,
  formation: String,

  players: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "Player" },
      name: { type: String, required: true },
      position: { type: String, required: true },
      avatar: String,
    },
  ],

  coach: {
    _id: { type: Schema.Types.ObjectId, ref: "Manager" },
    name: String,
    avatar: String,
  },
  assistant: {
    _id: { type: Schema.Types.ObjectId, ref: "Manager" },
    name: String,
    avatar: String,
  },

},
  { timestamps: true });


const SquadModel =
  mongoose.models.squad || mongoose.model("squad", squadSchema);

export default SquadModel;
 