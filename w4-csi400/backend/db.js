const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// ระบุตำแหน่งที่จะสร้าง/เปิดไฟล์ database.sqlite
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// สร้างตารางและใส่ข้อมูลเริ่มต้น (Seed Data)
db.serialize(() => {
    // 1. ตาราง users
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            power TEXT,
            age INT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    `);

    // 2. ตาราง favorites
    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            favorite_item TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // 3. ตรวจสอบและ Seed ข้อมูลเริ่มต้นหากยังไม่มีข้อมูล
    db.get('SELECT COUNT(*) AS count FROM users', [], (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('Seeding initial Avengers Hero data into database...');

            const initialHeroes = [
                {
                    name: 'Tony Stark',
                    power: 'Genius-level intellect & Powered Armor',
                    age: 48,
                    username: 'tonystark',
                    password: bcrypt.hashSync('ironman123', 8),
                    role: 'admin' // Admin ประจำยาน
                },
                {
                    name: 'Steve Rogers',
                    power: 'Super Soldier Serum & Vibranium Shield',
                    age: 105,
                    username: 'captain',
                    password: bcrypt.hashSync('shield123', 8),
                    role: 'user'
                },
                {
                    name: 'Peter Parker',
                    power: 'Spider Physiology & Web-Slinging',
                    age: 18,
                    username: 'spiderman',
                    password: bcrypt.hashSync('web123', 8),
                    role: 'user'
                },
                {
                    name: 'Thor Odinson',
                    power: 'God of Thunder & Mjolnir/Stormbreaker',
                    age: 1500,
                    username: 'thor',
                    password: bcrypt.hashSync('hammer123', 8),
                    role: 'user'
                }
            ];

            const insertStmt = db.prepare(`
                INSERT INTO users (name, power, age, username, password, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            initialHeroes.forEach(hero => {
                insertStmt.run([hero.name, hero.power, hero.age, hero.username, hero.password, hero.role]);
            });
            insertStmt.finalize();

            // Seed favorites ตัวอย่าง
            db.run(`INSERT INTO favorites (user_id, favorite_item) VALUES (1, 'Mark 85 Nanotech Armor')`);
            db.run(`INSERT INTO favorites (user_id, favorite_item) VALUES (2, 'Vibranium Shield')`);
            db.run(`INSERT INTO favorites (user_id, favorite_item) VALUES (3, 'Iron Spider Web Shooters')`);
            console.log('Avengers data seeded successfully.');
        }
    });
});

module.exports = db;