import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { EUserRole } from "../../types/user.interface";

export type UserRole = "player" | "coach" | "admin";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: Object.values(EUserRole), default: EUserRole.GUEST },
    emailVerified: { type: Boolean, default: true },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    refreshToken: {
        type: String,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
}, { timestamps: true });

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;

// export interface IUser extends Document {
//     // Basic Info
//     name: string;
//     email: string;
//     password: string;
//     role: EUserRole;

//     // Status
//     emailVerified: boolean;
//     isActive: boolean;
//     lastLogin?: Date;

//     // Auth Tokens
//     refreshToken?: string;
//     resetPasswordToken?: string;
//     resetPasswordExpires?: Date;

//     // Timestamps
//     createdAt: Date;
//     updatedAt: Date;

//     // Methods
//     comparePassword(candidatePassword: string): Promise<boolean>;
//     generatePasswordResetToken(): string;
// }