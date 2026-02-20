import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { EUserRole } from "../../types/user";

export type UserRole = "player" | "coach" | "admin";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: EUserRole;
    comparePassword(candidatePassword: string): Promise<boolean>;
    id: string
    image?: string
}

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: Object.values(EUserRole), default: EUserRole.PLAYER },
    emailVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;