const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const initRoute = require('./src/loaders/routes');
const { connectMongoDB } = require('./src/config/mongodb');

const app = express();

app.use(express.json());

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/$/, '');

const allowedOrigins = [
    process.env.CORS_ORIGINS,
    process.env.VITE_APP_URL,
    process.env.APP_URL,
]
    .filter(Boolean)
    .flatMap((v) => String(v).split(','))
    .map(normalizeOrigin)
    .filter(Boolean);

// If you prefer setting only a domain (without protocol), support APP_DOMAIN.
// Example: APP_DOMAIN=lachong.vn => allow https://lachong.vn and http://lachong.vn
if (process.env.APP_DOMAIN) {
    const domain = normalizeOrigin(process.env.APP_DOMAIN).replace(/^https?:\/\//, '');
    if (domain) {
        allowedOrigins.push(`https://${domain}`);
        allowedOrigins.push(`http://${domain}`);
    }
}

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const effectiveAllowedOrigins = Array.from(new Set(allowedOrigins)).length
    ? Array.from(new Set(allowedOrigins))
    : defaultOrigins;

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (effectiveAllowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

// Health/root endpoints (useful when opening the domain in a browser)
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Lac Hong API is running.',
        health: '/api',
        apiBase: '/api/v1'
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Lac Hong Service is running.' });
});

// Ensure DB is connected (cached across invocations in serverless).
// Skip DB connect for simple health endpoints to avoid "blank" timeouts.
app.use(async (req, res, next) => {
    if (req.path === '/' || req.path === '/api') return next();

    try {
        await connectMongoDB();
        next();
    } catch (error) {
        return res.status(503).json({
            message: 'Database unavailable',
            error: error?.message || String(error)
        });
    }
});

// App routes
initRoute(app);

// Basic error handler (returns JSON instead of an unclear blank response)
app.use((err, req, res, next) => {
    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({
        message: err?.message || 'Internal Server Error'
    });
});

module.exports = app;