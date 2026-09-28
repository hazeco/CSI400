# CSI400 Week 5: Web Security (CORS, JWT, SQL Injection, XSS)
> **หัวข้อที่เลือกปฏิบัติ:** ทรัพย์สินอื่นๆ (Other Assets)  
> **อาจารย์ผู้สอน:** อ.ทินภัทร บริรักษ์ (Mr. Thinnaphat Borirak) — มหาวิทยาลัยศรีปทุม (SPU)

---

## 📌 สรุปโครงสร้างโปรเจกต์ (Project Directory)

```
w5-csi400/
├── backend/
│   ├── database.sqlite                 # ฐานข้อมูล SQLite พร้อม Seed Data ทรัพย์สินอื่นๆ 12 รายการ
│   ├── db.js                           # การเชื่อมต่อฐานข้อมูล และฟังก์ชัน Parameterized Query
│   ├── middleware/
│   │   ├── authMiddleware.js           # ตรวจสอบ JWT Bearer Token (Private API Guard)
│   │   ├── corsMiddleware.js           # Whitelist ตรวจสอบ Origin (Dev 5500, Bank A, Bank B, Hacker 403)
│   │   └── validationMiddleware.js     # ตรวจสอบและกรอง XSS ด้วย express-validator & sanitize-html
│   ├── routes/
│   │   ├── apiAuthRoutes.js            # POST /api/auth/login (ออก JWT Token)
│   │   ├── apiAssetRoutes.js           # Production Management API (CRUD ทรัพย์สินอื่นๆ)
│   │   ├── apiCustomerRoutes.js        # Inquiry API ทรัพย์สินรายบุคคล
│   │   ├── apiReportRoutes.js          # Report APIs (Summary, High-Value >= 10M, Ownership by Type)
│   │   └── apiSecurityTestRoutes.js    # Demo endpoints (/api/private-data, XSS test, SQLi test)
│   ├── package.json
│   ├── server.js                       # Express Server, CSP Header, Error Handler
│   └── .env                            # พอร์ตและ Secret Key
├── frontend/
│   ├── index.html                      # แดชบอร์ดระบบหลัก (จัดการทรัพย์สิน, รายงาน, Security Lab)
│   ├── banka.html                      # จำลองการเรียกจากโดเมน https://api.banka.com (Allowed)
│   ├── bankb.html                      # จำลองการเรียกจากโดเมน https://api.bankb.com (Allowed)
│   ├── hacker.html                     # จำลองการเรียกจากโดเมน https://www.hacker.com (Blocked 403)
│   ├── app.js                          # สคริปต์ควบคุมการทำงานหน้าบ้าน
│   └── style.css                       # ดีไซน์ UI โมเดิร์น Dark Theme
├── postman/
│   └── CSI400_Week5_Asset_Security.postman_collection.json # ไฟล์ Import เข้า Postman
└── render.yaml                         # Blueprint สำหรับ Deploy ขึ้น Render.com แบบ 1-Click
```

---

## 🎯 ข้อมูลในหัวข้อ "ทรัพย์สินอื่นๆ" (Other Assets)

ระบบรองรับ 4 ประเภทย่อยตามโจทย์หน้า 25:
1. **`machinery` — เครื่องจักร เครื่องมือและอุปกรณ์การผลิต**  
   - เครื่องกลึง CNC 5 แกน Precision High-Speed (18.5 ล้านบาท) - *High-Value*
   - แขนกลหุ่นยนต์ประกอบชิ้นส่วน Fanuc Robot 6-Axis (12.0 ล้านบาท) - *High-Value*
   - หม้อไอน้ำอุตสาหกรรมแรงดันสูง 15 Ton/Hr (6.5 ล้านบาท)
2. **`valuable` — ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า**  
   - ชุดเพชรแท้ Blue Diamond Collection 15 กะรัต (45.0 ล้านบาท) - *High-Value*
   - ทองคำแท่งบริสุทธิ์ 99.99% น้ำหนัก 100 บาททอง (4.25 ล้านบาท)
   - ตู้เซฟนิรภัยมาตรฐานธนาคาร Chubbsafes Class VI (1.5 ล้านบาท)
3. **`financial` — สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร**  
   - พันธบัตรรัฐบาลเพื่อการออมและพัฒนาโครงสร้างพื้นฐาน (30.0 ล้านบาท) - *High-Value*
   - พอร์ตหุ้นสามัญในกลุ่มดัชนี SET50 (25.0 ล้านบาท) - *High-Value*
   - บัญชีเงินฝากประจำปลอดภาษี 36 เดือน (8.5 ล้านบาท)
4. **`office` — ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ**  
   - ระบบคอมพิวเตอร์แม่ข่าย Data Center Server Rack (7.8 ล้านบาท)
   - คอมพิวเตอร์กราฟิก Mac Studio M2 Ultra 15 เครื่อง (2.4 ล้านบาท)
   - ชุดเฟอร์นิเจอร์สำนักงานผู้บริหาร Herman Miller Aeron 20 ชุด (1.85 ล้านบาท)

---

## 🚀 วิธีการรันบนเครื่อง Local (Localhost)

1. เข้าไปยังโฟลเดอร์ Backend:
   ```bash
   cd w5-csi400/backend
   npm install
   npm start
   ```
2. เซิร์ฟเวอร์จะเปิดที่ `http://localhost:3000`
3. เปิดเบราว์เซอร์เข้าใช้งาน:
   - หน้าหลัก Dashboard: `http://localhost:3000/index.html`
   - จำลอง Bank A: `http://localhost:3000/banka.html`
   - จำลอง Bank B: `http://localhost:3000/bankb.html`
   - จำลอง Hacker: `http://localhost:3000/hacker.html`

> 🔑 **บัญชีผู้ใช้งานทดสอบ (Default Users):**
> - **System Admin:** Username: `admin` | Password: `admin123`
> - **Bank A Officer:** Username: `bank_officer` | Password: `officer123`
> - **Bank B Partner:** Username: `partner_agent` | Password: `partner123`
