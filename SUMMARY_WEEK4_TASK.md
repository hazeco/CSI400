# คู่มือและสรุปการบ้าน Week 4: Web Services (CSI400)
> **หัวข้อ:** การสร้างระบบ Login/Register ด้วย JWT และการป้องกันการเข้าถึง API (Authentication & Authorization / OAuth)

---

## 📌 1. วัตถุประสงค์และภาพรวมโจทย์

โจทย์สัปดาห์นี้ต้องการให้นักศึกษาเข้าใจและลงมือปฏิบัติ 3 หัวใจหลักของ **Web Security**:
1. **Authentication (การยืนยันตัวตน):** ตรวจสอบว่า "คุณคือใคร" ผ่านระบบ Login/Register โดยเข้ารหัส Password ด้วย `bcrypt` และออก `JWT Token` (JSON Web Token)
2. **Authorization (การควบคุมสิทธิ์):** ตรวจสอบว่า "คุณทำอะไรได้บ้าง" โดยแบ่งแยกเส้นทาง API ออกเป็น **3 ระดับ** (Public, Protect, Private)
3. **OAuth Concept:** เข้าใจและจำลองกลไกการขอสิทธิ์เข้าถึง API ด้วย Access Token หรือเชื่อมโยง OAuth ภายนอก

---

## 🎯 2. สรุปความต้องการที่โจทย์บังคับตรวจ (Checklist ข้อคะแนน)

### ✅ ข้อที่ 1: ระบบ Authentication (Register / Login ด้วย JWT)
- [x] มีตารางฐานข้อมูล `users` (id, username, password, role) - *ใช้ SQLite เรียบร้อยแล้ว*
- [x] ใช้ `bcrypt` แฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล
- [x] Endpoint `POST /api/auth/register` (สมัครสมาชิก)
- [x] Endpoint `POST /api/auth/login` (ตรวจสอบรหัสผ่านและสร้าง JWT Token คืนกลับไป)
- [x] มี Middleware ตรวจสอบ JWT Token (`authMiddleware.js`)

---

### ⚠️ ข้อที่ 2: สร้าง API ครบ 3 ประเภท "อย่างละ 3 เส้น" (รวม 9 เส้น)
> ***หมายเหตุสำคัญจากโจทย์หน้า 17:*** จะไม่รวมเส้น `/register` และ `/login`

#### หมวดที่ 1: Public API (3 เส้น) - ทุกคนเข้าถึงได้ ไม่ต้อง Login ไม่ต้องมี Token (ธีม: ยาน Avengers Quinjet)
| ลำดับ | Method | Path | หน้าที่การทำงาน | สถานะปัจจุบัน |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `GET` | `/api/public/info` | ข้อมูลระบบยาน Avengers Terminal, F.R.I.D.A.Y. AI, Admin: Tony Stark | ✅ เสร็จแล้ว |
| 2 | `GET` | `/api/public/categories` | รายการสายพลัง/คลาสฮีโร่ในระบบยาน Avengers | ✅ เสร็จแล้ว |
| 3 | `GET` | `/api/public/heros` | ดึงรายชื่อฮีโร่ที่ลงทะเบียนในยานทั้งหมดจาก Database (SQLite) | ✅ เสร็จแล้ว |

#### หมวดที่ 2: Protect API (3 เส้น) - ต้องส่ง JWT Token ใน Header (`Authorization: Bearer <token>`)
| ลำดับ | Method | Path | หน้าที่การทำงาน | สถานะปัจจุบัน |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `GET` | `/api/protect/profile` | ดูข้อมูล Profile ส่วนตัวของ Hero ที่ล็อกอิน (ดึงจาก SQLite ตาม Token) | ✅ เสร็จแล้ว |
| 2 | `GET` | `/api/protect/dashboard` | หน้าต้อนรับแดชบอร์ดประจำยานจาก F.R.I.D.A.Y. และภารกิจประจำวัน | ✅ เสร็จแล้ว |
| 3 | `POST` | `/api/protect/favorites` | บันทึกอุปกรณ์หรือคู่หูโปรดลงตู้ล็อกเกอร์ประจำตัวของฮีโร่ | ✅ เสร็จแล้ว |

#### หมวดที่ 3: Private API (3 เส้น) - สิทธิ์ระดับสูง (Admin: Tony Stark เท่านั้น ผ่าน `roleMiddleware.js`)
| ลำดับ | Method | Path | หน้าที่การทำงาน | สถานะปัจจุบัน |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `GET` | `/api/private/users` | Tony Stark ดูรายชื่อบุคลากรและฮีโร่ทั้งหมดในยาน | ✅ เสร็จแล้ว |
| 2 | `DELETE`| `/api/private/users/:id` | Tony Stark สั่งปลดฮีโร่ออกจากฐานข้อมูลยาน | ✅ เสร็จแล้ว |
| 3 | `GET` | `/api/private/system-logs` | Tony Stark ตรวจสอบระบบเตาปฏิกรณ์ Arc Reactor และความปลอดภัย | ✅ เสร็จแล้ว |

> 🔑 **บัญชีเริ่มต้นในระบบ (Seeded ใน Database แล้ว):**
> - **Admin (Tony Stark):** Username: `tonystark` | Password: `ironman123` | Role: `admin`
> - **User (Captain America):** Username: `captain` | Password: `shield123` | Role: `user`
> - **User (Spider-Man):** Username: `spiderman` | Password: `web123` | Role: `user`
> - **User (Thor):** Username: `thor` | Password: `hammer123` | Role: `user`

---

### ✅ ข้อที่ 3: ระบบ OAuth 2.0 (เชื่อมต่อ GitHub OAuth & Real API)
- [x] เชื่อมต่อ **GitHub OAuth 2.0 Flow** (`/auth/github` -> `/auth/github/callback`)
- [x] นำ `access_token` ไปดึงข้อมูลจริงจาก GitHub และออก **JWT Token** ของยาน Avengers ให้ทันที
- [x] มี Endpoint `/auth/github/real-api` ทดสอบดึงข้อมูล Public GitHub User (ตามสไลด์หน้า 15-16)

---

### ✅ ข้อที่ 4: Frontend สำหรับทดสอบ (`frontend/index.html`)
- [x] หน้าตา UI สไตล์ **Avengers Quinjet Cyberpunk Terminal** (Dark Mode / Glassmorphism)
- [x] ปุ่ม **"Sign in with GitHub (OAuth 2.0)"** กดล็อกอินผ่าน GitHub ได้จริง
- [x] ฟอร์ม Login / Register (มี Preset เลือก Hero ด่วน: Tony Stark, Captain, Spider-Man, Thor)
- [x] **API Command Deck:** มีปุ่มกดทดสอบยิงครบทั้ง 9 Endpoints (Public 3, Protect 3, Private 3)
- [x] **F.R.I.D.A.Y. Terminal Output:** แสดงผล JSON Response แบบสดๆ พร้อม Badge แจ้งสถานะ HTTP Status (200, 401, 403)
- [x] เสิร์ฟผ่าน Server โดยตรง เปิดดูได้ที่: `http://localhost:3000`

---

## 🛠️ 3. แผนการเขียนโค้ดและวิธีทำ (Code Blueprint)

### ไฟล์ที่ต้องเพิ่ม / แก้ไข:

### 1. ปรับปรุง `backend/routes/apiPublicRoutes.js` (เพิ่มให้ครบ 3 เส้น)
```javascript
const express = require('express');
const router = express.Router();

// 1. Info (เดิม)
router.get('/info', (req, res) => {
    res.json({ message: 'This is a public API, no authentication required.' });
});

// 2. Server Status (ใหม่)
router.get('/status', (req, res) => {
    res.json({
        status: 'Online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 3. Public Heroes list (ใหม่)
router.get('/heros', (req, res) => {
    res.json([
        { id: 1, name: 'Iron Man', universe: 'Marvel' },
        { id: 2, name: 'Batman', universe: 'DC' },
        { id: 3, name: 'Spider-Man', universe: 'Marvel' }
    ]);
});

module.exports = router;
```

---

### 2. ปรับปรุง `backend/routes/apiProtectRoutes.js` (เพิ่มให้ครบ 3 เส้น)
```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// ทุกเส้นในไฟล์นี้ต้องผ่าน authenticateToken
router.use(authenticateToken);

// 1. Profile (เดิม)
router.get('/profile', (req, res) => {
    res.json({
        message: 'Welcome to your profile',
        user: req.user
    });
});

// 2. Dashboard (ใหม่)
router.get('/dashboard', (req, res) => {
    res.json({
        message: `Welcome ${req.user.role} to the User Dashboard!`,
        lastLogin: new Date().toLocaleDateString(),
        notifications: ['You have 2 unread messages', 'Your session expires in 1 hour']
    });
});

// 3. Add Favorite (ใหม่)
router.post('/favorites', (req, res) => {
    const { heroName } = req.body;
    res.json({
        message: `Hero '${heroName}' added to favorites for user ID: ${req.user.userId}`,
        savedAt: new Date().toISOString()
    });
});

module.exports = router;
```

---

### 3. สร้าง Middleware ตรวจสอบ Role Admin (`backend/middleware/roleMiddleware.js`)
```javascript
function authorizeAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Forbidden: Access denied. Admin role required!' 
        });
    }
    next();
}

module.exports = authorizeAdmin;
```

---

### 4. สร้าง Route ใหม่ `backend/routes/apiPrivateRoutes.js` (3 เส้นสำหรับ Private)
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/roleMiddleware');

// ต้องมี Token และต้องเป็น Admin เท่านั้น!
router.use(authenticateToken);
router.use(authorizeAdmin);

// 1. Get All Users (Admin เท่านั้น)
router.get('/users', (req, res) => {
    db.all('SELECT id, username, role FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total: rows.length, users: rows });
    });
});

// 2. Delete User (Admin เท่านั้น)
router.delete('/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ID ${req.params.id} has been deleted successfully` });
    });
});

// 3. System Logs & Server Metrics (Admin เท่านั้น)
router.get('/system-logs', (req, res) => {
    res.json({
        systemStatus: 'Optimal',
        database: 'SQLite (Connected)',
        memoryUsage: process.memoryUsage(),
        adminAccessedBy: req.user
    });
});

module.exports = router;
```

---

### 5. นำ Private Route ไปผูกใน `backend/server.js`
```javascript
const apiPrivateRoutes = require('./routes/apiPrivateRoutes');
// ...
app.use('/api/private', apiPrivateRoutes);
```

---

## 🧪 4. คู่มือการทดสอบผ่าน Postman แบบละเอียด (ขั้นตอนแคปรูปส่งงาน)

> 💡 **เกณฑ์การแคปรูปให้ได้คะแนนเต็ม:**
> ในหน้าต่าง Postman แต่ละรูปจะต้องเห็น 4 จุดสำคัญนี้เสมอ:
> 1. **Method & URL** (เช่น `POST http://localhost:3000/api/auth/login`)
> 2. **แท็บ Headers หรือ Body** (แสดงข้อมูลที่ส่งไป เช่น `Authorization` หรือ JSON Body)
> 3. **HTTP Status Code** ด้านล่าง (เช่น `200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`)
> 4. **Response Body** ที่เซิร์ฟเวอร์ตอบกลับมา

---

### 📸 สรุป Checklist ภาพที่ต้องแคปส่งอาจารย์ (รวม 12 รูปครบทุกเงื่อนไข)

---

### [หมวด A: การยืนยันตัวตน (Authentication & JWT)]

#### 📷 รูปที่ 1: ลงทะเบียนฮีโร่ใหม่ (Register)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Natasha Romanoff",
    "power": "Master Martial Artist & Espionage",
    "age": 35,
    "username": "blackwidow",
    "password": "widow123",
    "role": "user"
  }
  ```
- **ผลลัพธ์ที่ต้องแสดง:** Status `201 Created`
  ```json
  {
    "message": "Hero registered into Avengers database successfully",
    "userId": 5,
    "hero": {
      "name": "Natasha Romanoff",
      "username": "blackwidow",
      "role": "user"
    }
  }
  ```
- 🎯 **จุดที่ต้องแคป:** แสดง Status 201 และมี userId สร้างใหม่

---

#### 📷 รูปที่ 2: เข้าสู่ระบบเป็น User ธรรมดา (Spider-Man)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "username": "spiderman",
    "password": "web123"
  }
  ```
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- 🎯 **จุดที่ต้องแคป:** ได้ JWT Token มา (คัดลอก Token นี้ไว้ใช้ในหมวด Protect)

---

#### 📷 รูปที่ 3: เข้าสู่ระบบเป็น Admin (Tony Stark)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "username": "tonystark",
    "password": "ironman123"
  }
  ```
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- 🎯 **จุดที่ต้องแคป:** ได้ JWT Token ของแอดมิน (คัดลอก Token นี้ไว้ใช้ในหมวด Private)

---

### [หมวด B: Public APIs (3 เส้น - ไม่ต้องมี Token)]

#### 📷 รูปที่ 4: Public เส้นที่ 1 - ข้อมูลระบบยาน Quinjet
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/public/info`
- **Headers:** *(ไม่ต้องใส่ Authorization)*
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "system": "Avengers Quinjet & Helicarrier Access Terminal",
    "aiAssistant": "F.R.I.D.A.Y.",
    "systemAdmin": "Tony Stark (Iron Man)",
    "registeredHeroesCount": 5,
    "accessLevel": "Public Guest (Authentication required for flight deck)"
  }
  ```

---

#### 📷 รูปที่ 5: Public เส้นที่ 2 - คลาสสายพลังของฮีโร่
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/public/categories`
- **Headers:** *(ไม่ต้องใส่ Authorization)*
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK` แสดงรายการหมวดหมู่ (Genius/Tech, Super Soldier, Cosmic/Mystic, ฯลฯ)

---

#### 📷 รูปที่ 6: Public เส้นที่ 3 - รายชื่อฮีโร่ที่ลงทะเบียนจาก SQLite
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/public/heros`
- **Headers:** *(ไม่ต้องใส่ Authorization)*
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK` แสดงรายชื่อฮีโร่จากฐานข้อมูล (Tony Stark, Steve Rogers, Peter Parker, Thor) โดยไม่มี password หลุดออกมา

---

### [หมวด C: Protect APIs (3 เส้น - ต้องมี Token)]

#### 📷 รูปที่ 7: ทดสอบระบบความปลอดภัย - ยิง Protect โดยไม่มี Token (Failed Case)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/protect/profile`
- **Headers:** *(เว้นว่าง ไม่ใส่ Authorization)*
- **ผลลัพธ์ที่ต้องแสดง:** Status `401 Unauthorized`
  ```json
  {
    "message": "No token provided"
  }
  ```
- 🎯 **สำคัญมาก:** รูปนี้พิสูจน์ว่าระบบเราบล็อกคนไม่ล็อกอินได้จริง!

---

#### 📷 รูปที่ 8: Protect เส้นที่ 1 - ดูโปรไฟล์ฮีโร่ส่วนตัว (Success Case)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/protect/profile`
- **Headers:** 
  - `Authorization`: `Bearer <ใส่ Token ของ spiderman จากรูปที่ 2>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "message": "Welcome to your Avengers Identification Profile",
    "heroProfile": {
      "id": 3,
      "name": "Peter Parker",
      "power": "Spider Physiology & Web-Slinging",
      "age": 18,
      "username": "spiderman",
      "role": "user"
    },
    "clearanceLevel": "Level Beta (Crew Access)"
  }
  ```

---

#### 📷 รูปที่ 9: Protect เส้นที่ 2 - แดชบอร์ดประจำยาน F.R.I.D.A.Y.
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/protect/dashboard`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ spiderman>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK` แสดงพิกัดยานและ Briefing ประจำวันจาก F.R.I.D.A.Y.

---

#### 📷 รูปที่ 10: Protect เส้นที่ 3 - บันทึกอุปกรณ์โปรดลง Database
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/protect/favorites`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ spiderman>`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "favoriteItem": "Web Shooter Mark II"
  }
  ```
- **ผลลัพธ์ที่ต้องแสดง:** Status `201 Created`
  ```json
  {
    "message": "Favorite gear 'Web Shooter Mark II' has been saved to personal locker for Hero ID: 3",
    "favoriteId": 4,
    "userId": 3,
    "favoriteItem": "Web Shooter Mark II"
  }
  ```

---

### [หมวด D: Private APIs (3 เส้น - Tony Stark / Admin Only)]

#### 📷 รูปที่ 11: ทดสอบระบบสิทธิ์ - User ธรรมดาพยายามเข้า Private (Failed Case)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/private/users`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ spiderman ซึ่งเป็น user ธรรมดา>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `403 Forbidden`
  ```json
  {
    "message": "Access Denied: High-level Stark Industries clearance required. Admin role only!",
    "currentUserRole": "user",
    "requiredRole": "admin"
  }
  ```
- 🎯 **สำคัญมาก:** รูปนี้พิสูจน์ว่าระบบแยก Role `admin` กับ `user` ได้จริง (Authorization Middleware)!

---

#### 📷 รูปที่ 12: Private เส้นที่ 1 - Tony Stark ดูรายชื่อบุคลากรทั้งหมด (Success Case)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/private/users`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ tonystark จากรูปที่ 3>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "message": "Stark Industries Classified: Full Avengers Personnel Roster",
    "accessedByAdminId": 1,
    "totalCrew": 5,
    "users": [ ... ]
  }
  ```

---

#### 📷 รูปที่ 13 (แถมเพิ่ม): Private เส้นที่ 2 - Tony Stark ดูสถานะ Arc Reactor
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/private/system-logs`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ tonystark>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK` แสดงความปลอดภัยยาน `STARK OMEGA CLEARANCE` และพลังงานเตา Arc Reactor `100% - 3.2 Gigawatts`

---

#### 📷 รูปที่ 14 (แถมเพิ่ม): Private เส้นที่ 3 - Tony Stark สั่งปลดลูกเรือ (DELETE)
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/private/users/4`
- **Headers:**
  - `Authorization`: `Bearer <ใส่ Token ของ tonystark>`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK`
  ```json
  {
    "message": "Authorization Confirmed: Hero ID 4 has been decommissioned and removed from database.",
    "deletedHeroId": 4
  }
  ```

---

### [หมวด E: OAuth 2.0 & Real API (ตามสไลด์หน้า 15-16)]

#### 📷 รูปที่ 15: ทดสอบดึง Real GitHub API
- **Method:** `GET`
- **URL:** `http://localhost:3000/auth/github/real-api`
- **ผลลัพธ์ที่ต้องแสดง:** Status `200 OK` แสดงข้อมูล JSON ของผู้ใช้ GitHub (`octocat`)
- 🎯 **รูปหน้าจอ Web:** เปิดบราวเซอร์ไปที่ `http://localhost:3000/auth/github` แล้วล็อกอินด้วย GitHub จากนั้นแคปหน้าจอผลลัพธ์ความสำเร็จที่แสดง GitHub Access Token + Avengers JWT Token!

---

## 📦 5. สิ่งที่ต้องส่งผ่าน dlearning.spu.ac.th (หน้า 18)

1. **Source Code ทั้งหมด:** โฟลเดอร์โปรเจกต์ (Backend + Frontend)
2. **เอกสารรายงาน / บันทึกผลการทดสอบ (PDF/Word หรือ Markdown):**
   - อธิบายการทำงานของระบบ JWT และสิทธิ์การเข้าถึง (Public/Protect/Private)
   - แคปภาพหน้าจอผลการทดสอบใน **Postman** ตามตารางข้อ 4
   - แสดงตัวอย่าง JWT Token Payload ที่ Decode แล้ว (จาก [jwt.io](https://jwt.io))
3. **การนำเสนอ:** พรีเซนต์การทำงานของโค้ดและการยิง API กับอาจารย์ผู้สอน

