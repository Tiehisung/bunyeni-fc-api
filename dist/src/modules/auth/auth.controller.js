"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const generateToken_1 = __importDefault(require("../../utils/generateToken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const hasher_1 = require("../../utils/hasher");
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await user_model_1.default.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "User already exists", success: false });
        const hashedPassword = await (0, hasher_1.hasher)(password);
        const user = await user_model_1.default.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        res.status(201).json({
            token: (0, generateToken_1.default)(user._id.toString()),
            user,
            success: true,
            message: 'User registered successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", success: false });
    }
};
exports.register = register;
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
