"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scamshield';
async function startServer() {
    try {
        console.log('[*] Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('[+] Connected to MongoDB successfully.');
    }
    catch (error) {
        console.warn(`[!] MongoDB connection failed (${error.message}). Running with in-memory or degraded state mode.`);
    }
    app_1.default.listen(PORT, () => {
        console.log(`[+] ScamShield AI Backend Gateway listening on http://localhost:${PORT}`);
    });
}
startServer();
