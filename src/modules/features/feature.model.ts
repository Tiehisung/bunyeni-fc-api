import mongoose, { Schema } from "mongoose";

export const featureSchema = new Schema({

  name: { type: String, unique: true, trim: true, lowercase: true, required: [true, 'Name must be specified'] },
  data: [
    {
      label: { type: String, unique: true ,trim:true},
      value: { type: String, lowercase: true, trim: true, unique: true }
    }
  ]
},
  { timestamps: true });


const FeatureModel =
  mongoose.models.features || mongoose.model("features", featureSchema);

export default FeatureModel;
