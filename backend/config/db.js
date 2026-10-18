import mongoose from 'mongoose';
import { initializeLocalStore } from './localStore.js';

let isMongoConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerforge';

  // Always initialize fallback store so it is ready if MongoDB is unreachable
  await initializeLocalStore();

  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      retryWrites: true,
      autoIndex: true,
    });
    isMongoConnected = true;
    console.log(`MongoDB connected successfully to ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`MongoDB not reachable (${error.message}). Running with persistent local JSON data storage.`);
    return false;
  }
};

export const getDbStatus = () => {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return { connected: true, type: 'mongodb', host: mongoose.connection.host };
  }
  return { connected: true, type: 'local-persistent-store', message: 'Ready' };
};

export default connectDB;
