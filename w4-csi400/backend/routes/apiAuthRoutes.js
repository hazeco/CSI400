const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
const SECRET_KEY = 'secretKey';

// POST Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Find user from SQLite by username
    const sql = 'SELECT * FROM users WHERE username = ?';

    // db.get it will get one data from db
    db.get(sql, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        // 2. Check have user in db
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 3. Check the received password against the hash kept in the DB
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 4. Check if password is correct, Create JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' } // set token to expire in 1 hour
        );

        // 5. Send Token back to Client/Postman
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    });
});

//POST /register
router.post('/register', (req, res) => {
    const { name, power, age, username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Hash password for security
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert user/hero to DB
    const sql = `INSERT INTO users (name, power, age, username, password, role) VALUES (?, ?, ?, ?, ?, ?)`;

    // db.run it will run the sql query
    db.run(sql, [name || 'Unknown Hero', power || 'None', age || null, username, hashedPassword, role || 'user'], function (err) {
        // Check error and return error message
        if (err) {
            return res.status(400).json({ message: 'User already exists or DB error', error: err.message });
        }
        // Return success message
        res.status(201).json({
            message: 'Hero registered into Avengers database successfully',
            userId: this.lastID,
            hero: { name: name || 'Unknown Hero', username, role: role || 'user' }
        });
    });
});

module.exports = router;