const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CSI400_Week5_SuperSecretKey_2026_AssetSecurity';

// Middleware to verify JWT token for Private APIs
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer <token>

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized: Token is missing',
            message: 'กรุณาส่ง JWT Token ผ่าน Header "Authorization: Bearer <token>" เพื่อเข้าถึง Private API นี้',
            status: 401
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({
                error: 'Unauthorized: Invalid or expired token',
                message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาล็อกอินใหม่',
                status: 401
            });
        }

        req.user = decodedUser;
        next();
    });
}

// Optional Role Guard
function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden: Insufficient privileges',
                message: `สิทธิ์ของคุณ (${req.user.role}) ไม่ได้รับอนุญาตให้ทำรายการนี้ ต้องการสิทธิ์: [${allowedRoles.join(', ')}]`,
                status: 403
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    requireRole,
    JWT_SECRET
};
