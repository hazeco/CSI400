const cors = require('cors');

// Domains explicitly required by lab instruction (Page 24 & 26) + Strict Production Whitelist
const defaultAllowedDomains = [
    'http://localhost:5500',    // Frontend สำหรับการทดสอบ Dev Team
    'https://api.banka.com',    // Production Client
    'https://api.bankb.com',    // Partner Client
    'https://hazeco.github.io', // Production GitHub Pages Frontend (Strict Single-Domain Whitelist)
    'http://127.0.0.1:5500',    // Local dev alternative
    'http://localhost:3000',    // Direct host
    'http://127.0.0.1:3000'
];

// Combine with environment variable if specified (e.g., custom deployed frontend)
const envOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
    : [];

const allowedDomains = Array.from(new Set([...defaultAllowedDomains, ...envOrigins]));

const isOriginAllowed = (origin) => {
    if (!origin) return true; // Postman, curl, direct server requests (PDF Page 20)
    
    // Strict Whitelist (OWASP Standard): Check exact match only, no open wildcard (*.github.io)
    return allowedDomains.includes(origin);
};

const corsOptions = {
    origin: (origin, callback) => {
        // If origin is not provided (e.g., Postman / curl / same-origin requests) -> Allow
        if (!origin) {
            return callback(null, true);
        }

        if (isOriginAllowed(origin)) {
            callback(null, true); // Allow authorized origin
        } else {
            // Block unauthorized origins (PDF Page 20, 22, 25)
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Express error handler specifically for CORS rejections (PDF Page 22 & 25)
const handleCorsError = (err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'Access denied: CORS policy does not allow this origin',
            attemptedOrigin: req.headers.origin || 'unknown',
            status: 403,
            allowedDomainsSample: [
                'http://localhost:5500',
                'https://api.banka.com',
                'https://api.bankb.com'
            ]
        });
    }
    next(err);
};

module.exports = {
    corsMiddleware: cors(corsOptions),
    corsOptions,
    handleCorsError,
    allowedDomains,
    isOriginAllowed
};
