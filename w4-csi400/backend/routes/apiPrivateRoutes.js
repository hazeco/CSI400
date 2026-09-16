const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/roleMiddleware');

// กำหนดให้ทุกเส้นทางใน Private API ต้องผ่านทั้งการเช็ค Token และการเช็ค Role Admin!
router.use(authenticateToken);
router.use(authorizeAdmin);

// 1. GET /users - Tony Stark ดูรายชื่อผู้ใช้/ฮีโร่ทั้งหมดในยาน พร้อมบทบาทและสถานะ
router.get('/users', (req, res) => {
    const sql = 'SELECT id, name, power, age, username, role FROM users ORDER BY id ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database query failed', error: err.message });
        }

        res.json({
            message: 'Stark Industries Classified: Full Avengers Personnel Roster',
            accessedByAdminId: req.user.userId,
            totalCrew: rows.length,
            users: rows
        });
    });
});

// 2. DELETE /users/:id - Tony Stark สั่งปลดฮีโร่/ลบสมาชิกออกจากฐานข้อมูลยาน
router.delete('/users/:id', (req, res) => {
    const targetId = req.params.id;

    // ป้องกันไม่ให้ลบ ID 1 (Tony Stark เอง)
    if (parseInt(targetId) === 1) {
        return res.status(400).json({
            message: 'Command Rejected: Tony Stark (System Administrator) cannot be removed from vessel authority!'
        });
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [targetId], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Database deletion error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: `Hero with ID ${targetId} not found in roster.` });
        }

        res.json({
            message: `Authorization Confirmed: Hero ID ${targetId} has been decommissioned and removed from database.`,
            deletedHeroId: parseInt(targetId),
            executedBy: req.user
        });
    });
});

// 3. GET /system-logs - Tony Stark ตรวจสอบระบบเตาปฏิกรณ์ Arc Reactor & ความปลอดภัยยาน
router.get('/system-logs', (req, res) => {
    res.json({
        securityLevel: 'STARK OMEGA CLEARANCE',
        arcReactorOutput: '100% - 3.2 Gigawatts',
        flightDeckDefenseGrid: 'Active (Automated targeting ready)',
        databaseEngine: 'SQLite (Internal Carrier Storage)',
        memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        activeAdminSession: {
            adminId: req.user.userId,
            role: req.user.role,
            loginSessionVerified: true
        },
        systemAlerts: [
            'No unauthorized breaches detected',
            'Quinjet Stealth cloaking system ready',
            'F.R.I.D.A.Y. AI running latest heuristics model'
        ],
        generatedAt: new Date().toISOString()
    });
});

module.exports = router;
