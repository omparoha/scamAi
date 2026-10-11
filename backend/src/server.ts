import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scamshield';

async function startServer() {
  try {
    console.log('[*] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[+] Connected to MongoDB successfully.');
  } catch (error: any) {
    console.warn(`[!] MongoDB connection failed (${error.message}). Running with in-memory or degraded state mode.`);
  }

  app.listen(PORT, () => {
    console.log(`[+] ScamShield AI Backend Gateway listening on http://localhost:${PORT}`);
  });
}

startServer();
