# คู่มือและสรุปงานปฏิบัติการ Week 6: Web Services (CSI400)
> **หัวข้อวิชา:** การทดสอบ API (API Testing: Postman Scripting + Mocha & Chai Automation)  
> **หัวข้อปฏิบัติที่เลือก:** **ระบบ Avengers Hero QA & Test Automation Center (อิงจากแนวฮีโร่ใน Week 4)**  
> **อาจารย์ผู้สอน:** อ.ทินภัทร บริรักษ์ (Mr. Thinnaphat Borirak) — มหาวิทยาลัยศรีปทุม (SPU)

---

## 📌 1. ภาพรวมและวัตถุประสงค์งานสัปดาห์ที่ 6

ในงานปฏิบัตินี้ มีเป้าหมายสำคัญในการยกระดับกระบวนการทดสอบซอฟต์แวร์จาก **Manual Testing (การทดสอบด้วยมือ)** ให้กลายเป็น **Automated Testing (การทดสอบอัตโนมัติ)** โดยครอบคลุม 3 เสาหลักตามเกณฑ์ในหน้า 12 ของเอกสารประกอบการสอน:

```
+---------------------------------------------------------------------------------------+
|                                3 หัวข้อหลักของการประเมิน                              |
+---------------------------------------------------------------------------------------+
| 1. การทดสอบด้วย Postman Script        | Collection v2.1 + Environment + pm.test Script|
| 2. การทดสอบ Automate Test ด้วย Mocha | Mocha Runner + Chai Expect Style + Negative   |
| 3. การทดสอบ & แสดงผลผ่าน Frontend    | Dashboard ซิงก์ Server.js (ไม่ใช่ CLI / ไม่ใช่ AI) |
+---------------------------------------------------------------------------------------+
```

---

## 🎯 2. สรุปความต้องการที่โจทย์บังคับตรวจ (Checklist ข้อคะแนน 9%)

### ✅ หัวข้อที่ 1: การทดสอบด้วยการเขียน Postman Script
- [x] มีไฟล์ Postman Collection ที่สมบูรณ์: [`postman/Avengers_Hero_API.postman_collection.json`](file:///d:/code/CSI400/w6-csi400/postman/Avengers_Hero_API.postman_collection.json)
- [x] มีไฟล์ Postman Environment: [`postman/Avengers_Hero_API.postman_environment.json`](file:///d:/code/CSI400/w6-csi400/postman/Avengers_Hero_API.postman_environment.json)
- [x] มี **Pre-request Script** สำหรับสร้าง dynamic Authorization Header (`Bearer {{authToken}}`)
- [x] มี **Tests Script (`pm.test`)** เขียนตรวจสอบครบทุกเงื่อนไข:
  - ตรวจสอบ HTTP Status 200, 201, 401, 404
  - ตรวจสอบ `Content-Type: application/json`
  - ตรวจสอบ Schema และ Data Properties (`id`, `name`, `codename`, `powerClass`, `powerLevel`)
  - จัดเก็บตัวแปรข้าม Request อัตโนมัติ (`pm.environment.set("authToken", json.token)`)
- [x] รองรับการรันผ่าน **Newman CLI** (`npm run newman` หรือ `npm run test:newman`) ผ่าน 100% ไม่มีข้อผิดพลาด

---

### ✅ หัวข้อที่ 2: การทดสอบ Automate Test ด้วย Mocha + Chai Dependent
- [x] โครงสร้าง Test Suite ด้วย `describe()` และ `it()` จัดหมวดหมู่อย่างเป็นระเบียบ
- [x] ใช้ **Chai Assertion Library** แบบ **Expect Style** (`expect(res).to.have.status(200)`, `expect(res.body).to.be.an('array')`)
- [x] เขียน Test Script ครบทุก **HTTP Methods (CRUD)**:
  - `GET /api/heroes` (เรียกดูรายการฮีโร่ทั้งหมด + การ Search + Filter สถานะ)
  - `GET /api/heroes/:id` (เรียกดูฮีโร่รายคน เช่น Tony Stark #1)
  - `POST /api/heroes` (สร้างฮีโร่ใหม่ พร้อมตรวจการ Gen ID)
  - `PUT /api/heroes/:id` (อัปเดตข้อมูลและสถานะของฮีโร่)
  - `DELETE /api/heroes/:id` (ลบฮีโร่ พร้อมตรวจยืนยันด้วย GET ซ้ำว่าได้ 404)
- [x] เขียน **Negative Test Cases** ครอบคลุม:
  - กรณีไม่ได้ใส่ Field สำคัญ (`name`, `codename`) -> คาดหวัง **HTTP 400 Bad Request**
  - กรณีใส่ Password ผิด หรือไม่มี Token ใน Protected Route -> คาดหวัง **HTTP 401 Unauthorized**
  - กรณีระบุ ID ฮีโร่ที่ไม่มีอยู่ในระบบ หรือถูกลบไปแล้ว -> คาดหวัง **HTTP 404 Not Found**
  - กรณีสร้างฮีโร่ที่มีชื่อ Codename ซ้ำในระบบ -> คาดหวัง **HTTP 409 Conflict**
- [x] มีการใช้ **Mocha Hooks (`before`, `after`)** เพื่อรีเซ็ตสถานะข้อมูล (Test Isolation & Clean-up)
- [x] มีสคริปต์ `npm test` รันผ่านฉลุย **24 Test Cases รวดเร็วภายใน ~400ms**

---

### ✅ หัวข้อที่ 3: Frontend Dashboard Sync ไปยัง `server.js`
- [x] **การออกแบบส่วนติดต่อผู้ใช้ (Frontend Interface):**
  - **ไม่ใช่แนว CLI (Command Line Interface):** ไม่มีหน้าจอดำเขียว terminal simulator หรือการพิมพ์คำสั่งแบบ Hacker Console
  - **ไม่ใช่แนว AI Chatbot:** ไม่มีหน้าต่างแชทสนทนา หรือหุ่นยนต์ผู้ช่วย AI
  - **สไตล์ Modern Web Operations Dashboard:** หน้าเว็บแดชบอร์ดระดับ Enterprise ในธีม Avengers QA Command Center (Dark Glassmorphism, Neon Blue / Gold / Emerald Accents, Google Fonts Outfit & Plus Jakarta Sans)
- [x] **การ Sync ข้อมูลแบบ Real-time กับ `server.js`:**
  - **Mocha + Chai Live Runner:** มีปุ่มกด `⚡ Run Automated Test Suite (Mocha)` ยิงคำสั่ง `POST /api/tests/run` ไปยัง `server.js` ให้รันเทสต์สดๆ แล้วนำผลลัพธ์ (Pass/Fail, Duration ms, Assertion details) กลับมาอัปเดตบนหน้าเว็บทันที
  - **Hero Registry Management:** มีระบบแสดง Card ฮีโร่ พร้อมปุ่ม Enlist New Hero (Modal Form), Edit Hero Status, และ Decommission Hero ซึ่งซิงก์ข้อมูลตรงกับเซิร์ฟเวอร์ทันที
  - **Interactive API Explorer (Manual Testing Playground):** หน้าจำลอง Manual Testing ที่ผู้เรียนสามารถเลือก Endpoint (GET, POST, PUT, DELETE, LOGIN), แก้ไข JSON Payload, กดส่งคำขอ และตรวจดู HTTP Status Badge พร้อม JSON Response สดๆ เพื่อเปรียบเทียบข้อแตกต่างระหว่าง Manual vs Automation
  - **Postman & Newman Hub:** หน้าสำหรับคลิกดาวน์โหลดไฟล์ Collection และ Environment JSON ได้ในคลิกเดียว พร้อมแสดงตัวอย่างโค้ดคำสั่งตามสไลด์บทเรียน

---

## 💻 3. คำสั่งและวิธีการทดสอบระบบ

```bash
# 1. เข้าสู่โฟลเดอร์ Week 6
cd w6-csi400

# 2. เริ่มต้นเซิร์ฟเวอร์
npm start
# เปิดดู Dashboard ได้ที่ http://localhost:3000

# 3. รันการทดสอบ Unit & Integration Tests (Mocha + Chai)
npm test

# 4. รันการทดสอบ Postman ผ่าน Newman CLI
npm run newman

# 5. รันการทดสอบแบบ CI/CD Suite ทั้งหมด
npm run test:all
```

---

## 📊 4. สรุปผลการรันชุดทดสอบ (Test Results Evidence)

### 1) ผลการรัน `npm test` (Mocha + Chai)
```text
  🔐 Security & Authentication Test Suite (Mocha + Chai)
    1. POST /api/auth/login - User Authentication
      √ should login successfully as Tony Stark and return 200 with JWT token
      √ should login successfully as Steve Rogers (Captain America)
    2. Negative Cases - Invalid Credentials & Bad Request
      √ should return 401 Unauthorized for incorrect password
      √ should return 401 Unauthorized for non-existent username
      √ should return 400 Bad Request when username or password is missing
    3. Protected Route Verification with Bearer Token
      √ should grant access to /api/auth/me when valid Bearer token is provided
      √ should return 401 Unauthorized when Authorization header is missing
      √ should return 401 Unauthorized when an invalid or fake token is supplied (Slide 9)

  🦸‍♂️ Avengers Hero API Test Suite (Mocha + Chai + Supertest)
    1. GET /api/heroes - Retrieve Heroes
      √ should return status 200 and a list of all heroes
      √ should filter heroes by status query parameter
      √ should search heroes by keyword in name or codename
    2. GET /api/heroes/:id - Hero Details
      √ should return status 200 and hero details for valid ID (Iron Man #1)
      √ should return status 404 for a non-existent hero ID (Negative Test)
      √ should return status 400 for a non-numeric ID parameter
    3. POST /api/heroes - Register New Hero
      √ should create a new hero and return status 201 with generated ID
      √ should return status 400 Bad Request when "name" is missing (Negative Test)
      √ should return status 400 Bad Request when "codename" is missing (Negative Test)
      √ should return status 409 Conflict when registering duplicate codename
    4. PUT /api/heroes/:id - Update Hero Information
      √ should update existing hero and return status 200 with updated fields
      √ should return status 404 when updating non-existent hero (Negative Test)
    5. DELETE /api/heroes/:id - Decommission Hero
      √ should delete created hero and return status 200
      √ should verify deleted hero no longer exists with GET 404 (Cleanup verification)
      √ should return status 404 when deleting already removed hero
    6. GET /api/heroes/stats/summary - Operational Telemetry
      √ should return status 200 and telemetry data summary

  24 passing (438ms)
```

### 2) ผลการรัน `npm run test:newman` (Newman Postman Runner)
```text
┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                10 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                10 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │                20 │                0 │
├─────────────────────────┴───────────────────┴──────────────────┤
│ total run duration: 1070ms                                     │
│ average response time: 15ms                                    │
└────────────────────────────────────────────────────────────────┘
    √ collection should execute all requests with zero assertion failures
```
