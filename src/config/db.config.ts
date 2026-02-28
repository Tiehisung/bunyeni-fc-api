// src/config/db.ts
import mongoose from "mongoose";

declare global {
    // allow global cache in serverless
    var mongooseConn: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

global.mongooseConn ||= {
    conn: null,
    promise: null,
};

const connectDB = async () => {
    if (global.mongooseConn.conn) {
        return global.mongooseConn.conn;
    }

    if (!global.mongooseConn.promise) {
        global.mongooseConn.promise = mongoose.connect(
            process.env.MONGO_URI as string,
            {
                bufferCommands: false,
            }
        );
    }

    global.mongooseConn.conn = await global.mongooseConn.promise;
    console.log("✅ Mongo connected (cached)");

    return global.mongooseConn.conn;
};

export default connectDB;