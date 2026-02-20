"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const generateToken_1 = __importDefault(require("../../utils/generateToken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const hasher_1 = require("../../utils/hasher");
const lib_1 = require("../../lib");
const helper_1 = require("../logs/helper");
const signup = async (req, res) => {
    try {
        const { email, password, image, name, role } = req.body;
        const hashedPass = await (0, hasher_1.hasher)(password);
        const alreadyExists = await user_model_1.default.findOne({ email });
        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: `User with email ${email} already exists`,
            });
        }
        const user = await user_model_1.default.create({
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
        await (0, helper_1.logAction)({
            title: `User [${name}] added.`,
            description: `User added - ${name}`,
        });
        res.status(201).json({
            success: true,
            message: "New user created",
            data: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to create user"),
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials", success: false });
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials", success: false });
        res.json({
            token: (0, generateToken_1.default)(user._id.toString()),
            user,
            success: true, message: 'Login successful'
        });
    }
    catch {
        res.status(500).json({ message: "Server error", success: false });
    }
};
exports.login = login;
