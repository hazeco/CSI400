# CSI400

โปรเจกต์ฝึกใช้ Express.js สำหรับวิชา CSI400 ประกอบด้วย 2 โปรเจกต์ย่อย:

- `w1-csi400/` — Express server (week 1)
- `w2-csi400/` — Express server (week 2)

## ความต้องการของระบบ (Requirements)

- Node.js `v22.x` (แนะนำ `v22.23.1` ขึ้นไป)
- npm `v10.x` ขึ้นไป (มากับ Node.js อยู่แล้ว)
- Git

### ติดตั้ง Node.js

ดาวน์โหลดและติดตั้งจากเว็บไซต์ทางการ: https://nodejs.org (เลือกเวอร์ชัน LTS หรือ v22)

หรือถ้าใช้ [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 22
nvm use 22
```

ตรวจสอบเวอร์ชันที่ติดตั้ง:

```bash
node -v
npm -v
```

## วิธี Clone โปรเจกต์

```bash
git clone https://github.com/<your-username>/CSI400.git
cd CSI400
```

## วิธีติดตั้งและรันโปรเจกต์

### w1-csi400

```bash
cd w1-csi400
npm install
node server.js
```

### w2-csi400

```bash
cd w2-csi400
npm install
node server.js
```

หลังจากรันแล้ว เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) (ทั้งสองโปรเจกต์ใช้พอร์ต 3000 เริ่มทีละโปรเจกต์เท่านั้น)
