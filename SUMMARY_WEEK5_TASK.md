# คู่มือและสรุปงานปฏิบัติการ Week 5: Web Services (CSI400)
> **หัวข้อวิชา:** การป้องกันช่องโหว่ด้านความปลอดภัยใน Web Services (Web Security: CORS, JWT, SQL Injection, XSS)  
> **หัวข้อปฏิบัติที่เลือก:** **กลุ่มที่ 4 — "ทรัพย์สินอื่นๆ (Other Assets)"**  
> **อาจารย์ผู้สอน:** อ.ทินภัทร บริรักษ์ (Mr. Thinnaphat Borirak) — มหาวิทยาลัยศรีปทุม (SPU)

---

## 📌 1. ภาพรวมและวัตถุประสงค์งานสัปดาห์ที่ 5

ในงานปฏิบัตินี้ นักศึกษาได้รับมอบหมายให้ทำหน้าที่เป็น **Backend Developer** พัฒนาระบบ **Private Asset Ownership API** สำหรับตรวจสอบการถือครองทรัพย์สินภายในองค์กร โดยมีเป้าหมายสำคัญด้านความปลอดภัยตามมาตรฐาน **OWASP Top 10** ดังนี้:

1. **CORS Control (Cross-Origin Resource Sharing):**
   - อนุญาตเฉพาะ Frontend ที่เชื่อถือได้ 3 โดเมนหลัก:
     - `http://localhost:5500` (Frontend สำหรับ Dev Team)
     - `https://api.banka.com` (Production Client)
     - `https://api.bankb.com` (Partner Client)
   - บล็อกโดเมนภายนอกที่ไม่ได้รับอนุญาต เช่น `https://www.hacker.com` และตอบกลับด้วย **HTTP Status 403 Forbidden**
2. **JWT Authentication & Authorization (Private API):**
   - การเข้าถึงข้อมูลทรัพย์สินทุกเส้นต้องแนบ `Authorization: Bearer <token>`
   - ปฏิเสธ Request ที่ไม่มี Token หรือ Token หมดอายุด้วย **HTTP Status 401 Unauthorized**
3. **SQL Injection Prevention:**
   - ใช้ **Parameterized Queries (Prepared Statements)** ผ่านเครื่องหมาย `?`
   - ป้องกันการ Bypass Login หรือการค้นหาข้อมูลด้วยคำสั่ง SQL แอบแฝง เช่น `' OR '1'='1`
4. **XSS Prevention (Cross-Site Scripting):**
   - ตรวจสอบและกรองข้อมูลนำเข้า (Input Validation) ด้วย `express-validator`
   - ตัดโค้ดอันตราย (เช่น `<script>`, `onerror=`, `javascript:`) ด้วย `sanitize-html`
   - กำหนด **Content Security Policy (CSP)** Header ให้กับเซิร์ฟเวอร์

---

## 💎 2. ข้อมูลทรัพย์สินในหัวข้อ: "ทรัพย์สินอื่นๆ" (Other Assets)

ตามข้อกำหนดในเอกสารประกอบการสอนหน้า 25 ระบบได้จำลองข้อมูลทรัพย์สินกลุ่มที่ 4 ออกเป็น **4 ประเภทย่อย** พร้อม Seed Data เริ่มต้น 12 รายการในฐานข้อมูล SQLite:

| ประเภทย่อย (Key) | ชื่อภาษาไทย (Category Title) | ตัวอย่างรายการในระบบ | มูลค่าประเมิน | สถานะ | ผู้ถือครอง |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `machinery` | เครื่องจักร เครื่องมือและอุปกรณ์การผลิต | เครื่องกลึงอัตโนมัติ CNC 5 แกน Precision | 18,500,000 ฿ | active | บ. สยามแอดวานซ์ (CUST-003) |
| `machinery` | เครื่องจักร เครื่องมือและอุปกรณ์การผลิต | แขนกลหุ่นยนต์ประกอบชิ้นส่วน Fanuc Robot | 12,000,000 ฿ | active | บ. สยามแอดวานซ์ (CUST-003) |
| `machinery` | เครื่องจักร เครื่องมือและอุปกรณ์การผลิต | หม้อไอน้ำอุตสาหกรรมแรงดันสูง 15 Ton/Hr | 6,500,000 ฿ | pledged | บ. สยามแอดวานซ์ (CUST-003) |
| `valuable` | ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า | ชุดอัญมณีเพชรแท้ Blue Diamond Collection | 45,000,000 ฿ | active | น.ส.แพรวา (CUST-002) |
| `valuable` | ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า | ทองคำแท่งบริสุทธิ์ 99.99% รวม 100 บาททอง | 4,250,000 ฿ | pledged | นายสมศักดิ์ (CUST-001) |
| `valuable` | ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า | ตู้เซฟนิรภัยมาตรฐานธนาคาร Chubbsafes Class VI | 1,500,000 ฿ | active | นายสมศักดิ์ (CUST-001) |
| `financial` | สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร) | พันธบัตรรัฐบาลเพื่อการออม (10 ปี) | 30,000,000 ฿ | active | นายสมศักดิ์ (CUST-001) |
| `financial` | สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร) | พอร์ตหุ้นสามัญในกลุ่มดัชนี SET50 | 25,000,000 ฿ | active | น.ส.แพรวา (CUST-002) |
| `financial` | สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร) | บัญชีเงินฝากประจำพิเศษ 36 เดือน | 8,500,000 ฿ | active | นายกฤษฎา (CUST-004) |
| `office` | ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ | ระบบคอมพิวเตอร์แม่ข่าย Data Center Server | 7,800,000 ฿ | under_review| บ. สยามแอดวานซ์ (CUST-003) |
| `office` | ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ | Mac Studio M2 Ultra (จำนวน 15 เครื่อง) | 2,400,000 ฿ | active | บ. สยามแอดวานซ์ (CUST-003) |
| `office` | ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ | ชุดเฟอร์นิเจอร์สำนักงาน Herman Miller Aeron | 1,850,000 ฿ | active | นายกฤษฎา (CUST-004) |

> 💰 **สถิติรวมของระบบ:**
> - ทรัพย์สินทั้งหมด: **12 รายการ**
> - มูลค่ารวมทั้งสิ้น: **163,300,000 บาท (163.3 ล้านบาท)**
> - ทรัพย์สินมูลค่าสูง (High-Value >= 10 ล้านบาท): **5 รายการ** (มูลค่ารวม 130.5 ล้านบาท)

---

## 📋 3. รายการ API Endpoints ทั้งหมด (ตามเกณฑ์ประเมินหน้า 26)

| ข้อที่ | หมวดหมู่ API | Method | Endpoint Path | ต้องการ JWT? | คำอธิบายการทำงาน |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **0** | **Authentication** | `POST` | `/api/auth/login` | ❌ ไม่ต้อง | ล็อกอินรับ JWT Token (ป้องกัน SQLi ด้วย Parameterized Query) |
| **0** | **System Info** | `GET` | `/api/public/info` | ❌ ไม่ต้อง | ข้อมูลระบบและ Whitelist โดเมนที่เปิดใช้งาน |
| **1** | **Production Management** | `POST` | `/api/assets` | ✅ ต้องมี | เพิ่มข้อมูลทรัพย์สิน (มี Validation + XSS Sanitizer กรองแท็ก) |
| **1** | **Production Management** | `PUT` | `/api/assets/:id` | ✅ ต้องมี | แก้ไขข้อมูลทรัพย์สิน (ตรวจสอบข้อมูลก่อนอัปเดต) |
| **1** | **Production Management** | `GET` | `/api/assets/:id` | ✅ ต้องมี | ดูรายละเอียดทรัพย์สินพร้อมข้อมูลผู้ถือครอง |
| **2** | **Asset Ownership Inquiry**| `GET` | `/api/assets` | ✅ ต้องมี | ดึงรายการทรัพย์สินทั้งหมด (ค้นหา/กรองประเภทได้) |
| **2** | **Asset Ownership Inquiry**| `GET` | `/api/customers/:id/assets` | ✅ ต้องมี | ดูรายการทรัพย์สินของผู้ถือครองรายบุคคล |
| **2** | **Asset Ownership Inquiry**| `GET` | `/api/customers` | ✅ ต้องมี | ดูรายชื่อลูกค้า/ผู้ถือครองทั้งหมด |
| **3** | **Asset Ownership Summary**| `GET` | `/api/reports/assets/summary` | ✅ ต้องมี | รายงานสรุป: จำนวนทรัพย์สิน, จำนวนเจ้าของ, แยกตามประเภท, มูลค่ารวม |
| **4** | **High-Value Asset Report**| `GET` | `/api/reports/assets/high-value?minValue=10000000` | ✅ ต้องมี | ค้นหาทรัพย์สินที่มีมูลค่ามากกว่า 10,000,000 บาท |
| **5** | **Asset Type Ownership** | `GET` | `/api/reports/ownership?assetType=machinery` | ✅ ต้องมี | ค้นหาว่าใครเป็นผู้ถือครองทรัพย์สินแต่ละประเภทบ้าง |
| **6** | **Security & CORS Check** | `GET` | `/api/private-data` | ✅ ต้องมี | ตัวอย่างหน้า 25: ส่งกลับ `['secret1','secret2','secret3']` |
| **6** | **XSS Defense Test** | `POST` | `/api/security/test-xss` | ❌ ไม่ต้อง | จุดสาธิตการตัดแท็ก `<script>` ของ sanitize-html |
| **6** | **SQLi Defense Test** | `POST` | `/api/security/test-sqli` | ❌ ไม่ต้อง | จุดสาธิตความปลอดภัยของ Parameterized Query |

---

## 🧪 4. คู่มือการทดสอบผ่าน Postman ทีละขั้นตอน (Postman Testing Guide)

เราได้สร้างไฟล์ Collection ที่สมบูรณ์แบบพร้อมใช้งานไว้ที่:  
`w5-csi400/postman/CSI400_Week5_Asset_Security.postman_collection.json`

### ขั้นตอนการ Import เข้า Postman
1. เปิดโปรแกรม **Postman**
2. กดปุ่ม **Import** (มุมบนซ้าย)
3. เลือกไฟล์ `CSI400_Week5_Asset_Security.postman_collection.json`
4. จะได้ Collection ชื่อ **"CSI400 Week 5: Web Security & Private Asset API"** พร้อม 7 โฟลเดอร์การทดสอบ

### จุดตรวจสำคัญสำหรับแคปภาพหน้าจอส่งอาจารย์

#### จุดตรวจที่ 1: การล็อกอินรับ Token (1.1 Login as Admin)
- ส่งคำขอ `POST /api/auth/login`
- Body: `{"username": "admin", "password": "admin123"}`
- **ผลลัพธ์:** HTTP `200 OK` และมี Postman Test Script ที่จะบันทึก Token เข้าตัวแปร `{{token}}` โดยอัตโนมัติ ทำให้ไม่ต้องคัดลอก Token เอง

#### จุดตรวจที่ 2: การทดสอบ CORS Whitelist (โฟลเดอร์ 02. Security & CORS Tests)
- **กรณีอนุญาต (2.1 และ 2.2):**
  - ใส่ Header `Origin: https://api.banka.com` หรือ `http://localhost:5500`
  - แนบ `Authorization: Bearer {{token}}`
  - **ผลลัพธ์:** HTTP `200 OK` และ Response Header มี `Access-Control-Allow-Origin: https://api.banka.com`
- **กรณีบล็อกโดเมน Hacker (2.3):**
  - ใส่ Header `Origin: https://www.hacker.com`
  - **ผลลัพธ์:** HTTP `403 Forbidden` พร้อมข้อความ JSON:
    ```json
    {
      "error": "Access denied: CORS policy does not allow this origin",
      "attemptedOrigin": "https://www.hacker.com",
      "status": 403
    }
    ```
    *(และไม่มี Header Access-Control-Allow-Origin ตอบกลับ ทำให้เบราว์เซอร์บล็อกทันที)*

#### จุดตรวจที่ 3: การป้องกัน JWT Guard เมื่อไม่มี Token (2.4)
- ยิง `GET /api/private-data` โดยไม่แนบ Header Authorization
- **ผลลัพธ์:** HTTP `401 Unauthorized` (`{"error": "Unauthorized: Token is missing"}`)

#### จุดตรวจที่ 4: การป้องกัน XSS และ SQL Injection (2.5 และ 2.6)
- **XSS Test:** ยิงแท็ก `<script>alert('XSS Attack!');</script>` -> ระบบตัดออกเหลือเฉพาะข้อความที่ปลอดภัย
- **SQLi Test:** ส่ง Username เป็น `' OR '1'='1` -> Parameterized Query มองเป็นข้อความธรรมดา ไม่สามารถ Bypass ล็อกอินได้

#### จุดตรวจที่ 5: รายงานสรุปและทรัพย์สินมูลค่าสูง (โฟลเดอร์ 05 และ 06)
- **5.1 Summary:** เรียก `GET /api/reports/assets/summary` ได้ตัวเลขสรุป 12 รายการ และมูลค่า 163.3 ล้านบาท
- **6.1 High-Value:** เรียก `GET /api/reports/assets/high-value?minValue=10000000` ได้รายการทรัพย์สิน 5 รายการที่มีมูลค่าเกิน 10 ล้านบาท

---

## 🌐 5. คู่มือการทดสอบผ่าน Browser & Frontend Simulators (ตามโจทย์หน้า 27)

โปรเจกต์มีหน้า Frontend แยกจำลองตามสถานการณ์จริง:

### 1. หน้า `frontend/banka.html` (จำลอง Production Client: `https://api.banka.com`)
- กดปุ่ม **"🔑 ล็อกอินดึง Token"** เพื่อดึง JWT Token ประจำตัว Bank A Officer
- กดปุ่ม **"📡 เรียก /api/private-data"** -> แสดงผลสำเร็จ (Status: HTTP 200 OK สีเขียว)
- กดปุ่มดูสรุปทรัพย์สินและค้นหาทรัพย์สินมูลค่าสูงได้สมบูรณ์

### 2. หน้า `frontend/bankb.html` (จำลอง Partner Client: `https://api.bankb.com`)
- กดปุ่มล็อกอินในฐานะ Bank B Partner
- ทดสอบเรียกดูผู้ถือครองเครื่องจักรโรงงาน (`?assetType=machinery`)
- ทดสอบเรียกดูทรัพย์สินของ บริษัท สยามแอดวานซ์เทค (Customer ID: 3)

### 3. หน้า `frontend/hacker.html` (จำลอง Unauthorized Origin: `https://www.hacker.com`)
- ทดสอบพยายามขโมยข้อมูล `/api/private-data` โดยไม่มี Token -> ติด 401 Unauthorized
- ทดสอบส่ง Token ขโมยมา -> ติด CORS Block / HTTP 403 Forbidden
- อธิบายและแสดงข้อความที่ Browser Console ทำการบล็อกตามกฎ Same-Origin Policy (SOP)

### 4. หน้า `frontend/index.html` (Dashboard หลัก)
- แดชบอร์ดสรุปสถิติทรัพย์สิน 4 หมวดของ "ทรัพย์สินอื่นๆ" แบบ Interactive
- มีฟังก์ชันค้นหา, กรองประเภท, เพิ่ม (POST), แก้ไข (PUT), ลบ (DELETE)
- มีห้อง **Security Defense Lab** สำหรับทดสอบ CORS, XSS, SQLi แบบเห็นผลสดๆ ทันที

---

## ☁️ 6. ขั้นตอนการ Deploy: GitHub Pages + Backend Cloud

### ❓ คำถามสำคัญ: "Deploy ผ่าน GitHub Pages ก็ได้ เอา API อะไรไหมเพื่อ Deploy?"

> **คำตอบที่ถูกต้องตามหลักสถาปัตยกรรมเว็บ:**
> 1. **GitHub Pages ให้บริการเฉพาะ Static Frontend (HTML, CSS, JavaScript) เท่านั้น**  
>    GitHub Pages **ไม่สามารถรัน Node.js Server หรือฐานข้อมูล SQLite/MySQL ได้**
> 2. **ดังนั้น ระบบจำเป็นต้องแยกการ Deploy ออกเป็น 2 ส่วน:**
>    - **Frontend:** นำขึ้น **GitHub Pages** (ฟรี)
>    - **Backend API:** นำขึ้น **Render.com** (ฟรีสำหรับ Web Service ที่รัน Node.js + SQLite)

---

### 🚀 ขั้นตอนที่ 1: Deploy Backend API ขึ้น Render.com (ฟรี 100%)

1. **Push โฟลเดอร์โปรเจกต์ขึ้น GitHub:**
   ```bash
   git add .
   git commit -m "Add Week 5 Web Security Asset System"
   git push origin main
   ```
2. สมัครใช้งานเว็บไซต์ [Render.com](https://render.com) (เข้าสู่ระบบด้วยบัญชี GitHub)
3. ไปที่แดชบอร์ด กดปุ่ม **New +** -> เลือก **Web Service**
4. เชื่อมต่อกับ GitHub Repository ของวิชานี้
5. กรอกข้อมูลตั้งค่าดังนี้:
   - **Name:** `csi400-w5-asset-api` (หรือชื่อตามต้องการ)
   - **Root Directory:** `w5-csi400/backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
6. ในส่วน **Environment Variables** ให้เพิ่มตัวแปร:
   - `PORT` = `3000`
   - `JWT_SECRET` = `CSI400_Week5_SuperSecretKey_2026_AssetSecurity`
   - `ALLOWED_ORIGINS` = `http://localhost:5500,https://api.banka.com,https://api.bankb.com,https://<your-username>.github.io`
7. กด **Create Web Service** -> รอ Render ทำการ Build ประมาณ 1-2 นาที
8. เมื่อสถานะขึ้น **Live** จะได้ URL เช่น:  
   `https://csi400-w5-asset-api.onrender.com`

---

### 🌐 ขั้นตอนที่ 2: Deploy Frontend ขึ้น GitHub Pages

1. ใน GitHub Repository ไปที่แท็บ **Settings** -> เมนูด้านซ้ายเลือก **Pages**
2. ภายใต้หัวข้อ **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** เลือก `main` และเลือกโฟลเดอร์ `/ (root)` หรือใช้ GitHub Action
3. เมื่อ GitHub Pages สร้างเสร็จ จะได้ URL เช่น:  
   `https://<your-username>.github.io/CSI400/w5-csi400/frontend/`
4. เปิดเข้าไปยังหน้าเว็บที่ Deploy แล้ว
5. ในช่อง **Backend API URL** (ด้านบนของหน้าเว็บ):  
   ให้นำ URL ที่ได้จาก Render มาวาง เช่น `https://csi400-w5-asset-api.onrender.com` แล้วกด **"💾 บันทึก URL"**
6. ตอนนี้หน้าเว็บ GitHub Pages จะสามารถยิงเชื่อมต่อกับ Backend API บน Cloud ได้อย่างสมบูรณ์!

---

### 🔄 ขั้นตอนที่ 3: การทดสอบ Deployed API ผ่าน Postman

เมื่อ Deploy ขึ้น Render เรียบร้อยแล้ว สามารถนำ URL นั้นมาทดสอบใน Postman ได้ทันที:
1. เปิด Postman Collection: `CSI400 Week 5: Web Security & Private Asset API`
2. ไปที่แท็บ **Variables**
3. เปลี่ยนค่า `baseUrl` จาก `http://localhost:3000` เป็น:
   ```
   https://csi400-w5-asset-api.onrender.com
   ```
4. กด **Save**
5. รันคำขอตามลำดับ:
   - `1.1 Login as Admin` -> ได้รับ Token จาก Cloud Server
   - `2.1 CORS Test` -> ทดสอบการอนุญาต Origin
   - `5.1 Summary Report` -> ตรวจสอบข้อมูลบน Cloud
   - `6.1 High-Value Report` -> ตรวจสอบรายงานทรัพย์สินมูลค่าเกิน 10 ล้านบาท

---

## 🎯 7. สรุปความพร้อมของงานสำหรับการส่งตรวจ (Checklist)

- [x] **สร้างโฟลเดอร์ `w5-csi400` เรียบร้อย:** แบ่งโครงสร้าง `backend/`, `frontend/`, `postman/` ชัดเจน
- [x] **หัวข้อ "ทรัพย์สินอื่นๆ" ครบทั้ง 4 ประเภทย่อย:** เครื่องจักร, ตู้เซฟ/อัญมณี, สินทรัพย์การเงิน, ของใช้สำนักงาน/คอมพิวเตอร์
- [x] **CORS Whitelist 3 โดเมน + บล็อก Hacker (403):** มี Middleware และ Error Handler ตามโจทย์
- [x] **JWT Authentication (Private API):** ป้องกันการเข้าถึง Endpoint ทรัพย์สินทุกเส้น (ดักจับ 401 เมื่อไม่มี Token)
- [x] **ป้องกัน SQL Injection:** ใช้ Parameterized Query (`?`) ทุกคำสั่ง SELECT, INSERT, UPDATE, DELETE
- [x] **ป้องกัน XSS:** ใช้ `express-validator` และ `sanitize-html` กรองแท็ก `<script>` ออกก่อนจัดเก็บ
- [x] **API ครบถ้วนตามโจทย์หน้า 26:**
  - Production Management API (`POST`, `PUT`, `GET /api/assets/:id`)
  - Asset Ownership Inquiry API (`GET /api/assets`, `GET /api/customers/:id/assets`)
  - Asset Ownership Summary API (`GET /api/reports/assets/summary`)
  - High-Value Asset Report API (`GET /api/reports/assets/high-value?minValue=10000000`)
  - Asset Type Ownership Report API (`GET /api/reports/ownership?assetType=machinery`)
  - ตัวอย่างหน้า 25: `GET /api/private-data`
- [x] **Frontend ครบตามโจทย์หน้า 27:**
  - `banka.html` (จำลองเรียกจาก `api.banka.com`)
  - `bankb.html` (จำลองเรียกจาก `api.bankb.com`)
  - `hacker.html` (จำลองเรียกจาก `hacker.com` แสดงผล CORS Block)
  - `index.html` (แดชบอร์ดระดับพรีเมียม สรุปข้อมูล และมี Security Lab)
- [x] **Postman Collection:** มีไฟล์ JSON สำเร็จรูปพร้อม Script อัตโนมัติในโฟลเดอร์ `postman/`
- [x] **คู่มือการ Deploy:** แนะนำชัดเจนทั้ง GitHub Pages และ Render.com พร้อม Blueprint `render.yaml`
