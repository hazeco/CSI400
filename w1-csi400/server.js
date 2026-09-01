// 1.Import Express
const express = require('express');
const app = express();
const port = 3000;

// 2.เปิดใช้งาน Middleware เพื่ออ่าน JSON
app.use(express.json());

// 3.สร้าง Route พื้นฐาน (GET)
app.get('/',(req, res) => {
    res.send('Welcome to my API!');
})

// 4.สร้าง Route สำหรับส่งข้อมูล JSON (GET)
app.get('/api/data',(req, res) => {
    const responseData = {
        message: 'This is a JSON reponse',
        items:['CSI', 'CPE', 'ICT'],
        timestamp: new Date()
    };
    res.json(responseData); // ส่งกลับเป็นJSON
});

// 5.เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// 6.เพิ่ม Route สำหรับ POST ใน server.js
let users = [];
app.post('/api/users', (req,res) => {
    const userData = req.body; // ข้อมูลที่ได้จากclient
    if (!userData.name || !userData.email){
        return res.status(400).json({ error: 'Name and email are required' });
    }
    // ส่งข้อมูลกลับข้อมูลผู้ใช้ที่สร้าง (สมมติ)
    const newUser = {
        id : Date.now(),
        name : userData.name,
        email : userData.email
    };
    users.push(newUser);
    res.status(201).json({
        message : 'User created successfully!',
        user : newUser
    });
});

// 7.ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/api/users', (req,res) => {
    res.json({
        message: 'All users',
        users: users
    })
})

// 8.ดึงผู้ใช้ตามid
app.get('/api/users/:id', (req,res) => {
    const userId = req.params.id;
    const user = users.find(u => u.id.toString() === userId);
    res.json({
        message: 'User found',
        user: user
    });
});