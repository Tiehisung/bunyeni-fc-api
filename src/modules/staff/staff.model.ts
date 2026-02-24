import mongoose, { Schema } from "mongoose";

const staffSchema = new Schema(
    {
        fullname: { type: String, required: true },
        phone: {
            type: String,
            required: true,
            trim: true,
            message: "Phone number required",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            message: "Email required",
            match: [/\S+@\S+\.\S+/, "Email must be valid"],
        },
        // dob: { type: String, required: true },
        dateSigned: {
            type: String,
            required: true,
            default: () => new Date().toISOString(),
        },
        startDate: { type: String, default: () => new Date().toISOString() },
        endDate: { type: String },
        avatar: String,
        galleries: [{ type: Schema.Types.ObjectId }],
        medicals: { type: Schema.Types.Array, default: () => [] },
        role: {
            type: String,
            required: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const StaffModel =
    mongoose.models.staff || mongoose.model("staff", staffSchema);

export default StaffModel;
