const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authMiddleware, JWT_SECRET } = require('../middleware/authMiddleware');

const SEED_USERS = [
    { id: 1, username: 'tonystark', password: 'ironman123', name: 'Tony Stark', role: 'admin' },
    { id: 2, username: 'captain', password: 'shield123', name: 'Steve Rogers', role: 'user' },
    { id: 3, username: 'spiderman', password: 'web123', name: 'Peter Parker', role: 'user' },
    { id: 4, username: 'thor', password: 'hammer123', name: 'Thor Odinson', role: 'user' }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Both username and password are required'
        });
    }

    const user = SEED_USERS.find(u => u.username === username.trim());
    if (!user || user.password !== password) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid username or password credentials'
        });
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.status(200).json({
        success: true,
        message: `Welcome back, Agent ${user.name}. Clearance granted.`,
        token: token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }
    });
});

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
        serverTime: new Date().toISOString()
    });
});

module.exports = router;
