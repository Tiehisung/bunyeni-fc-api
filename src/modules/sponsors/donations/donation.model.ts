import mongoose, { Schema } from "mongoose";
import { fileSchema } from "../../media/files/file.model";

const donationSchema = new Schema(
  {
    item: {
      type: String,
      required: [true, "You must specify items for donation"],
      trim: true,
    },
    description: String,
    files: [fileSchema]
    ,
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "sponsors",
      required: [true, "Sponsor required"],
    },
  },
  { timestamps: true }
);

const DonationModel =
  mongoose.models.donations || mongoose.model("donations", donationSchema);

export default DonationModel;

