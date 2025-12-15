const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

async function connectMongoDB(uri = process.env.MONGODB_URI, options = {}) {
    if (cached.conn) return cached.conn;

    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    if (!cached.promise) {
        const defaultOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
            connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 5000),
        };
        cached.promise = mongoose.connect(uri, { ...defaultOptions, ...options });
    }

    const hardTimeoutMs = Number(process.env.MONGODB_HARD_TIMEOUT_MS || 8000);
    cached.conn = await Promise.race([
        cached.promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`MongoDB connect timeout after ${hardTimeoutMs}ms`)), hardTimeoutMs)
        ),
    ]);
    return cached.conn;
}

module.exports = { connectMongoDB };
