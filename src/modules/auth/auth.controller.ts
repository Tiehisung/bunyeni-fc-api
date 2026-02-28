import type { Request, Response } from "express";
import UserModel from "../users/user.model";
import { generateJwtTokens, cookieOptions, verifyRefreshToken } from "../../utils/jwt.utils";
import { hasher } from "../../utils/hasher";


// controllers/auth.controller.ts

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role, } = req.body;

        console.log(req.body)
        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const hashedPassword = await hasher(password)
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name, role
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateJwtTokens({
            _id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // console.log( 'accessToken', accessToken )

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookie
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Return user without password
        const userResponse = user.toObject();
        delete (userResponse as any).password;
        delete (userResponse as any).refreshToken;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact admin.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const { accessToken, refreshToken } = generateJwtTokens({
            _id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Return user without password
        const userResponse = user.toObject();
        delete (userResponse as any).password;
        delete (userResponse as any).refreshToken;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user with this refresh token
        const user = await UserModel.findOne({
            _id: decoded._id,
            refreshToken
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateJwtTokens({
            _id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // Update refresh token in database
        user.refreshToken = tokens.refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set new cookies
        res.cookie('accessToken', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
};


export const logout = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const refreshToken = req.cookies.refreshToken;

        if (userId && refreshToken) {
            // Clear refresh token from database
            await UserModel.findByIdAndUpdate(userId, {
                $unset: { refreshToken: 1 }
            });
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findById(req.user?._id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?._id;

        // Get user with password
        const user = await UserModel.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};


