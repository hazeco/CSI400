# 🛡️ Avengers QA & API Test Operations Center (CSI400 Week 6)
> **วิชา:** CSI400 Web Services — สัปดาห์ที่ 6  
> **หัวข้อการสอน:** การทดสอบ API (Postman + Mocha & Chai Test Automation)  
> **อาจารย์ผู้สอน:** อ.ทินภัทร บริรักษ์ (Mr. Thinnaphat Borirak) — มหาวิทยาลัยศรีปทุม (SPU)  
> **ธีมระบบ:** Avengers Hero Command & Test Automation Hub (ต่อยอดจาก Week 4)

---

## 📌 1. วัตถุประสงค์และภาพรวมโจทย์ (หน้า 12)

โจทย์สัปดาห์นี้กำหนดให้นักศึกษาแปลงการทดสอบ API แบบ **Manual Testing** ให้กลายเป็น **Automate Testing** ที่รวดเร็ว เชื่อถือได้ และพร้อมรองรับกระบวนการ CI/CD โดยแบ่งเกณฑ์การประเมินออกเป็น 3 หัวข้อหลัก:

1. **การทดสอบด้วยการเขียน Postman Script:**
   - สร้าง Postman Collection & Environment JSON
   - มี Pre-request Script สำหรับใส่ Header Dynamic
   - มีชุดเขียน Test Script ด้วย `pm.test()` และ Chai assertion ตรวจสอบ HTTP Status, Response JSON และ Schema
   - รองรับการรันผ่าน Newman CLI
2. **การทดสอบ Automate Test ด้วย Mocha + Chai Dependent:**
   - ใช้ `describe()`, `it()` จัดหมวดหมู่การทดสอบ
   - ใช้ Chai `expect` syntax ตรวจสอบผลลัพธ์
   - ทดสอบครอบคลุม HTTP Methods (GET, POST, PUT, DELETE)
   - มีการทดสอบ Negative Cases (400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict)
   - ใช้ Hooks (`before`, `after`) สำหรับ Reset/Clean-up ข้อมูล
3. **การทดสอบและแสดงผล API ผ่าน Frontend Sync ไปยัง `server.js` (Dashboard):**
   - **หน้าตา Interface สไตล์ Modern Web Dashboard (ไม่ใช่ CLI และไม่ใช่แนว AI Chatbot)**
   - ออกแบบเป็นศูนย์ควบคุมการทดสอบ (Avengers QA Hub) รองรับการสั่งรัน Automated Test Suite สดๆ ผ่านหน้าเว็บ และแสดงสถานะแบบ Real-time Sync
   - มีระบบ Hero Registry CRUD Services ตรวจสอบและจัดการข้อมูล
   - มี Interactive API Explorer สำหรับส่ง Request ทดสอบทั้งแบบ Manual และดูผลตอบกลับได้ทันที

> **หมายเหตุตามโจทย์:** อนุโลมให้ไม่ต้องเชื่อมต่อระบบฐานข้อมูลจริง (No-Database) โดยจัดการข้อมูลผ่าน JSON Data Store ในระบบได้โดยตรง

---

## 🗂️ 2. โครงสร้างโปรเจกต์ (Project Structure)

```text
w6-csi400/
├── backend/
│   ├── data/
│   │   ├── initialHeroes.json        # ข้อมูล Hero เริ่มต้น (Seed Data)
│   │   ├── heroes.json               # ข้อมูล Runtime JSON Store (No-DB)
│   │   └── heroStore.js              # โมดูลจัดการ CRUD, Reset และ Telemetry
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT Token Verification Middleware
│   ├── routes/
│   │   ├── authRoutes.js             # POST /api/auth/login, GET /api/auth/me
│   │   ├── heroRoutes.js             # Hero CRUD (GET, POST, PUT, DELETE, /stats/summary)
│   │   ├── testRunnerRoutes.js       # Live Mocha Runner Sync (POST /api/tests/run)
│   │   └── systemRoutes.js           # GET /api/system/health, GET /postman-files
│   └── server.js                     # Main Express Backend & Static Server
├── frontend/
│   ├── index.html                    # Modern Operations Dashboard (ไม่ใช่ CLI / ไม่ใช่ AI)
│   ├── css/
│   │   └── style.css                 # Custom Design System (Glassmorphism & Tactical Theme)
│   └── js/
│       └── app.js                    # Live Sync Logic, Mocha Runner Trigger, Hero CRUD
├── postman/
│   ├── Avengers_Hero_API.postman_collection.json    # Collection พร้อม pm.test และ Pre-request
│   └── Avengers_Hero_API.postman_environment.json   # Environment Variables (BASE_URL, authToken)
├── test/
│   ├── hero.api.test.js              # Mocha + Chai ทดสอบ Hero CRUD & Negative Cases
│   ├── auth.api.test.js              # Mocha + Chai ทดสอบ JWT Login & 401 Unauthorized
│   └── newman.test.js                # Newman programmatic test runner ใน Mocha
├── package.json
└── README.md
```

---

## 🚀 3. วิธีการติดตั้งและรันระบบ

### 1) ติดตั้ง Dependencies
```bash
cd w6-csi400
npm install
```

### 2) เริ่มต้นเซิร์ฟเวอร์ (Development / Production)
```bash
npm start
# หรือ
npm run dev
```
เปิดบราวเซอร์ไปที่: **`http://localhost:3000`**

---

## 🧪 4. การรัน Automated Test Suites

### ก) รัน Mocha + Chai Unit & Integration Tests (24 เทสต์เคส)
```bash
npm test
```
*ครอบคลุมทั้ง CRUD, Filter, Search, Schema Validation, JWT Authentication, 400 Bad Request, 401 Unauthorized และ 404 Not Found*

### ข) รัน Postman Collection ผ่าน Newman CLI
```bash
npm run newman
```
*รันไฟล์ Collection ตรงๆ ผ่าน Newman CLI พร้อมสรุปผล Report สวยงาม*

### ค) รัน Postman ผ่าน Newman ใน Mocha (CI/CD Pipeline Wrapper)
```bash
npm run test:newman
```

### ง) รันการทดสอบทั้งหมดพร้อมกัน (All Suites)
```bash
npm run test:all
```

---

## 📋 5. รายละเอียด API Endpoints ทั้งหมด

| Method | Endpoint Path | ระดับสิทธิ์ | คำอธิบายการทำงาน | Status Codes ที่ทดสอบ |
| :---: | :--- | :---: | :--- | :---: |
| `POST` | `/api/auth/login` | Public | ยืนยันตัวตน Agent (รับ JWT Token) | `200`, `400`, `401` |
| `GET` | `/api/auth/me` | Protected | ดูข้อมูล Agent ปัจจุบัน (ต้องส่ง Bearer Token) | `200`, `401` |
| `GET` | `/api/heroes` | Public | ดึงรายชื่อ Hero ทั้งหมด (รองรับ Filter & Search) | `200` |
| `GET` | `/api/heroes/:id` | Public | ดูรายละเอียด Hero รายคนตาม ID | `200`, `400`, `404` |
| `POST` | `/api/heroes` | Public | ลงทะเบียน Hero คนใหม่เข้าหน่วย Avengers | `201`, `400`, `409` |
| `PUT` | `/api/heroes/:id` | Public | อัปเดตข้อมูล / สถานะการปฏิบัติงานของ Hero | `200`, `400`, `404` |
| `DELETE`| `/api/heroes/:id` | Public | ปลดประจำการ Hero ออกจากหน่วย (Decommission) | `200`, `400`, `404` |
| `GET` | `/api/heroes/stats/summary`| Public | ข้อมูลสถิติและ Telemetry ภาพรวมของ Hero | `200` |
| `POST` | `/api/tests/run` | Public | สั่งรัน Mocha/Chai Test Suite ผ่าน Frontend Sync | `200` |
| `GET` | `/api/system/health` | Public | ตรวจสอบสถานะ Server และ Frameworks | `200` |

---

## 🎨 6. คุณลักษณะของ Frontend Dashboard

- **Modern Superhero Operations Dashboard:** สไตล์ศูนย์บัญชาการปฏิบัติการ Avengers / S.H.I.E.L.D. ที่มีความพรีเมียม โมเดิร์น สะอาดตา
- **ไม่ใช่ CLI / Terminal:** ไม่มีจอเขียว retro prompt หรือการพิมพ์คำสั่งจำลอง
- **ไม่ใช่ AI Chatbot:** ไม่มีช่องแชทถามตอบ หรือ Avatar AI ให้ความรู้สึกเหมือนระบบ Enterprise QA Platform จริง
- **Live Sync to `server.js`:** 
  - กดปุ่ม **"Run Automated Test Suite (Mocha)"** หน้าเว็บจะยิงคำสั่งไปสั่งให้เซิร์ฟเวอร์รัน Mocha/Chai และส่งผลการตรวจกลับมาแสดงผลแบบ Real-time พร้อมเวลาที่ใช้ (ms) และ Badge ผ่าน/ไม่ผ่าน
  - จัดการรายชื่อฮีโร่ (เพิ่ม, แก้ไข, ลบ) ข้อมูลซิงก์ตรงกับหน่วยความจำของเซิร์ฟเวอร์ทันที
  - มี **Interactive API Explorer (Manual Testing Deck)** ให้ทดสอบยิง Request แต่ละเส้นเพื่อดูเปรียบเทียบผลลัพธ์ระหว่าง Manual vs Automation
