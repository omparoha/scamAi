"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'scamshield_jwt_super_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'scamshield_refresh_secret_2026';
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name, role } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Email, password, and name are required' });
            }
            const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const userRole = ['ADMIN', 'SECURITY_ANALYST', 'USER'].includes(role) ? role : 'USER';
            const user = await User_1.User.create({
                email: email.toLowerCase(),
                passwordHash,
                name,
                role: userRole,
            });
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
                expiresIn: '15m',
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
            user.refreshTokens.push(refreshToken);
            await user.save();
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(201).json({
                message: 'User registered successfully',
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ message: `Registration failed: ${error.message}` });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password required' });
            }
            const user = await User_1.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const isValid = await user.comparePassword(password);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
                expiresIn: '15m',
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
            user.refreshTokens.push(refreshToken);
            await user.save();
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.json({
                message: 'Login successful',
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ message: `Login failed: ${error.message}` });
        }
    }
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token missing' });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await User_1.User.findById(decoded.id);
            if (!user || !user.refreshTokens.includes(refreshToken)) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
                expiresIn: '15m',
            });
            return res.json({ accessToken: newAccessToken });
        }
        catch (error) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
    }
    static async me(req, res) {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User_1.User.findById(req.user.id).select('-passwordHash -refreshTokens');
        return res.json({ user });
    }
}
exports.AuthController = AuthController;
