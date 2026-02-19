import type { Request, Response } from "express";
import generateToken from "../../utils/generateToken";
import UserModel from "../users/user.model";
import { hasher } from "../../utils/hasher";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await UserModel.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "User already exists", success: false });

        const hashedPassword = await hasher(password);

        const user = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            token: generateToken(user._id.toString()),
            user,
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", success: false });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials", success: false });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials", success: false });

        res.json({
            token: generateToken(user._id.toString()),
            user,
            success: true, message: 'Login successful'
        });
    } catch {
        res.status(500).json({ message: "Server error", success: false });
    }
};
