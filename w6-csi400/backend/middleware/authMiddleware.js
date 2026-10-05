const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'avengers_stark_industries_secret_key_2026';

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Access denied. Missing Authorization header (Format: Bearer <token>)'
        });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid Authorization header format. Expected "Bearer <token>"'
        });
    }

    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Token verification failed: Invalid or expired access token'
        });
    }
}

module.exports = {
    authMiddleware,
    JWT_SECRET
};
