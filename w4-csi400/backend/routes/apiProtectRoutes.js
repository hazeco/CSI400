const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// กำหนดให้ทุก Endpoint ในไฟล์นี้ต้องผ่านการตรวจสอบ JWT Token
router.use(authenticateToken);

// 1. GET /profile - ดูข้อมูลส่วนตัวของ Hero จากฐานข้อมูล (ต้องมี Token)
router.get('/profile', (req, res) => {
    const sql = 'SELECT id, name, power, age, username, role FROM users WHERE id = ?';
    db.get(sql, [req.user.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'Hero not found in database' });
        }

        res.json({
            message: 'Welcome to your Avengers Identification Profile',
            heroProfile: user,
            clearanceLevel: req.user.role === 'admin' ? 'Level Alpha (Full Access)' : 'Level Beta (Crew Access)'
        });
    });
});

// 2. GET /dashboard - แดชบอร์ดประจำยานสำหรับ Hero ที่ล็อกอินสำเร็จ
router.get('/dashboard', (req, res) => {
    res.json({
        message: `F.R.I.D.A.Y. Welcome Terminal: Greetings Agent/Hero #${req.user.userId}`,
        role: req.user.role,
        vesselLocation: 'Coordinates: 40.748817, -73.985428 (Avengers Tower)',
        systemStatus: 'Flight Deck Operational',
        dailyBriefing: [
            'Patrol Sector 4 scheduled at 14:00',
            'Suit maintenance protocol available at Bay 3',
            'Tony Stark left a voice memo for active duty heroes'
        ],
        accessTime: new Date().toISOString()
    });
});

// 3. POST /favorites - บันทึกอุปกรณ์หรือ Hero คู่หูที่ชื่นชอบลง SQLite จริง
router.post('/favorites', (req, res) => {
    const { favoriteItem } = req.body;

    if (!favoriteItem) {
        return res.status(400).json({ message: 'favoriteItem is required in request body' });
    }

    const sql = 'INSERT INTO favorites (user_id, favorite_item) VALUES (?, ?)';
    db.run(sql, [req.user.userId, favoriteItem], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        res.status(201).json({
            message: `Favorite gear '${favoriteItem}' has been saved to personal locker for Hero ID: ${req.user.userId}`,
            favoriteId: this.lastID,
            userId: req.user.userId,
            favoriteItem: favoriteItem,
            timestamp: new Date().toISOString()
        });
    });
});

// GET /favorites - ดูรายการโปรดทั้งหมดของ Hero คนนี้จาก Database
router.get('/favorites', (req, res) => {
    const sql = 'SELECT id, favorite_item, created_at FROM favorites WHERE user_id = ?';
    db.all(sql, [req.user.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        res.json({
            message: `Favorite locker items for Hero ID: ${req.user.userId}`,
            total: rows.length,
            favorites: rows
        });
    });
});

module.exports = router;