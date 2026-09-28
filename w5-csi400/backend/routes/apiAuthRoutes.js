const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbGet } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/authMiddleware');
const { validateLogin } = require('../middleware/validationMiddleware');

// POST /api/auth/login - เข้าสู่ระบบและรับ JWT Token
router.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body;

    try {
        // OWASP Principle: Use Parameterized Query to prevent SQL Injection
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (User not found)',
                status: 401
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Password mismatch)',
                status: 401
            });
        }

        // Generate JWT Token
        const tokenPayload = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            organization: user.organization
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

        return res.json({
            message: 'Login successful',
            status: 200,
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                organization: user.organization
            }
        });
    } catch (err) {
        console.error('[AUTH ERROR]', err);
        // OWASP Rule 4.4.5: Do NOT leak SQL details to client
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/auth/me - ตรวจสอบข้อมูลผู้ใช้งานปัจจุบัน (ต้องการ Token)
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        message: 'Token is valid',
        user: req.user
    });
});

module.exports = router;
