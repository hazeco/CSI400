const express = require('express');
const router = express.Router();
const db = require('../db');

// API Public don't need login, user can access directly

// 1. GET /info - ข้อมูลระบบยาน Avengers Quinjet Public Terminal (Admin: Tony Stark)
router.get('/info', (req, res) => {
    const sql = 'SELECT COUNT(*) AS totalCrew FROM users';
    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        res.json({
            system: 'Avengers Quinjet & Helicarrier Access Terminal',
            aiAssistant: 'F.R.I.D.A.Y.',
            vesselStatus: 'Operational / Docked at Avengers Compound',
            systemAdmin: 'Tony Stark (Iron Man)',
            registeredHeroesCount: row ? row.totalCrew : 0,
            accessLevel: 'Public Guest (Authentication required for flight deck)'
        });
    });
});

// 2. GET /categories - หมวดหมู่สายพลังของฮีโร่ในระบบยาน Avengers
router.get('/categories', (req, res) => {
    res.json({
        message: 'Avengers Hero Specialization Classes',
        categories: [
            { class: 'Genius / Tech', example: 'Iron Man, War Machine', lead: 'Tony Stark' },
            { class: 'Super Soldier / Combat', example: 'Captain America, Black Widow' },
            { class: 'Cosmic / Mystic', example: 'Thor, Doctor Strange' },
            { class: 'Gamma / Titan', example: 'Hulk' },
            { class: 'Stealth / Marksman', example: 'Hawkeye' }
        ]
    });
});

// 3. GET /heros - ดึงรายชื่อฮีโร่ทั้งหมดที่ลงทะเบียนในยานจาก Database (ไม่เปิดเผย password)
router.get('/heros', (req, res) => {
    const sql = 'SELECT id, name, power, age, role, username FROM users';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        res.json({
            message: 'Public Roster of Registered Avengers Heroes',
            total: rows.length,
            heroes: rows
        });
    });
});

module.exports = router;