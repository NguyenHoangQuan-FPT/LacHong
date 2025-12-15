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
        };
        cached.promise = mongoose.connect(uri, { ...defaultOptions, ...options });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = { connectMongoDB };
