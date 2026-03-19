const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const app = express();

const path = require('path');
const envPath = path.resolve(__dirname, '.env');
const envLocalPath = path.resolve(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
}
const cors = require('cors');
const initRoute = require('./src/loaders/routes');
const { connectMongoDB } = require('./src/config/mongodb');

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

if (allowedOrigins.length === 0) {
    allowedOrigins.push(normalizeOrigin(process.env.FRONTEND_URL || 'https://lachong.store'));
}


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

app.set('effectiveAllowedOrigins', effectiveAllowedOrigins);

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (effectiveAllowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

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

// Ensure DB is available before handling API routes (including Stripe webhook)
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

// Stripe webhook must use raw body for signature verification
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
initRoute(app);

app.use((err, req, res, next) => {
    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({
        message: err?.message || 'Internal Server Error'
    });
});

module.exports = app;