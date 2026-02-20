// src/config/db.ts
import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (): Promise<void> => {
    mongoose.set("sanitizeFilter", true);
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        const mongoURI = process.env.MONGO_URI as string;

        if (!mongoURI) {
            throw new Error('MONGO_URI  is not defined');
        }

        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('✅ MongoDB connected successfully');

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;
