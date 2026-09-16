// Middleware สำหรับตรวจสอบสิทธิ์ Admin (Tony Stark Clearance Level Alpha)
function authorizeAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required. Please provide a valid token.' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access Denied: High-level Stark Industries clearance required. Admin role only!',
            currentUserRole: req.user.role,
            requiredRole: 'admin'
        });
    }

    next();
}

module.exports = authorizeAdmin;
