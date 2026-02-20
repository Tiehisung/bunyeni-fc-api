import type { Request, Response } from "express";
import generateToken from "../../utils/generateToken";
import UserModel from "../users/user.model";
import { hasher } from "../../utils/hasher";
import { getErrorMessage } from "../../lib";
import { logAction } from "../logs/helper";


export const signup = async (req: Request, res: Response) => {

    try {

        const { email, password, image, name, role } = req.body;

        const hashedPass = await hasher(password)

        const alreadyExists = await UserModel.findOne({ email });
        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: `User with email ${email} already exists`,
            });
        }

        const user = await UserModel.create({
            email,
            password: hashedPass,
            image,
            name,
            role
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Log
        await logAction({
            title: `User [${name}] added.`,
            description: `User added - ${name}`,

        });

        res.status(201).json({
            success: true,
            message: "New user created",
            data: userResponse,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to create user"),
        });
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
