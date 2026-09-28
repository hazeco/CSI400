const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('[DB] Error connecting to SQLite database:', err.message);
    } else {
        console.log('[DB] Connected to SQLite database:', dbPath);
    }
});

// Promisified DB helpers with Parameterized Queries (OWASP Standard - Anti SQL Injection)
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Initialize schema and seed data
db.serialize(() => {
    // 1. Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'officer',
            organization TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Customers Table
    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            id_card TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            customer_type TEXT DEFAULT 'individual',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Assets Table (Topic: ทรัพย์สินอื่นๆ - Other Assets)
    db.run(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'ทรัพย์สินอื่นๆ',
            asset_type TEXT NOT NULL,
            asset_type_th TEXT NOT NULL,
            description TEXT,
            value REAL NOT NULL,
            customer_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            location TEXT,
            serial_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Seed Data
    db.get('SELECT COUNT(*) AS count FROM users', [], async (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('[DB] Seeding users data...');
            const adminPass = bcrypt.hashSync('admin123', 10);
            const officerPass = bcrypt.hashSync('officer123', 10);
            const partnerPass = bcrypt.hashSync('partner123', 10);

            const userStmt = db.prepare(`
                INSERT INTO users (username, password, name, role, organization)
                VALUES (?, ?, ?, ?, ?)
            `);
            userStmt.run(['admin', adminPass, 'นายพีรพัฒน์ มั่นคง (System Admin)', 'admin', 'Central Asset Registrar']);
            userStmt.run(['bank_officer', officerPass, 'ธนกฤต บริรักษ์ (Bank A Officer)', 'officer', 'Bank A Production Client']);
            userStmt.run(['partner_agent', partnerPass, 'วรินทร คู่ค้า (Bank B Partner)', 'partner', 'Bank B Partner Client']);
            userStmt.finalize();
        }
    });

    db.get('SELECT COUNT(*) AS count FROM customers', [], async (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('[DB] Seeding customers data...');
            const custStmt = db.prepare(`
                INSERT INTO customers (customer_code, name, id_card, email, phone, customer_type)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            custStmt.run(['CUST-001', 'นายสมศักดิ์ มหาทรัพย์เจริญ', '1103701234567', 'somsak@asset.co.th', '081-234-5678', 'individual']);
            custStmt.run(['CUST-002', 'นางสาวแพรวา ธนบดี', '3100609876543', 'praewa@wealthcorp.th', '089-876-5432', 'individual']);
            custStmt.run(['CUST-003', 'บริษัท สยามแอดวานซ์อินดัสทรี จำกัด', '0105558012345', 'contact@siamadvance.com', '02-765-4321', 'corporate']);
            custStmt.run(['CUST-004', 'นายกฤษฎา วัฒนพาณิชย์', '1100405556677', 'kritsada@panich.org', '086-555-4433', 'individual']);
            custStmt.finalize();
        }
    });

    db.get('SELECT COUNT(*) AS count FROM assets', [], async (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('[DB] Seeding assets data (หัวข้อ: ทรัพย์สินอื่นๆ)...');
            const assetStmt = db.prepare(`
                INSERT INTO assets (
                    asset_code, name, category, asset_type, asset_type_th, description,
                    value, customer_id, status, location, serial_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const initialAssets = [
                // 1. เครื่องจักร เครื่องมือและอุปกรณ์การผลิต (machinery)
                [
                    'AST-MCH-001',
                    'เครื่องกลึงอัตโนมัติ CNC 5 แกน Precision High-Speed',
                    'ทรัพย์สินอื่นๆ',
                    'machinery',
                    'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต',
                    'เครื่องจักรความแม่นยำสูงนำเข้าจากเยอรมนี สำหรับขึ้นรูปชิ้นส่วนอากาศยานและยานยนต์',
                    18500000,
                    3,
                    'active',
                    'โรงงานนิคมอุตสาหกรรมบางปู สมุทรปราการ',
                    'CNC-DE-889421-2024'
                ],
                [
                    'AST-MCH-002',
                    'แขนกลหุ่นยนต์ประกอบชิ้นส่วนอัตโนมัติ Fanuc Robot 6-Axis',
                    'ทรัพย์สินอื่นๆ',
                    'machinery',
                    'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต',
                    'แขนกลหุ่นยนต์อุตสาหกรรมพร้อมระบบ AI Vision Control',
                    12000000,
                    3,
                    'active',
                    'โรงงานนิคมอุตสาหกรรมอีสเทิร์นซีบอร์ด ระยอง',
                    'FNC-RBT-6AX-55321'
                ],
                [
                    'AST-MCH-003',
                    'หม้อไอน้ำอุตสาหกรรมแรงดันสูง Industrial Steam Boiler 15 Ton/Hr',
                    'ทรัพย์สินอื่นๆ',
                    'machinery',
                    'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต',
                    'หม้อไอน้ำประหยัดพลังงานมาตรฐานสากล ASME',
                    6500000,
                    3,
                    'pledged',
                    'โรงงานแปรรูปอาหาร นิคมนวนคร ปทุมธานี',
                    'BLR-ASME-2023-09'
                ],

                // 2. ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า (valuable)
                [
                    'AST-VAL-001',
                    'ชุดอัญมณีเพชรแท้ Blue Diamond Collection 15 กะรัต พร้อมใบเซอร์ GIA',
                    'ทรัพย์สินอื่นๆ',
                    'valuable',
                    'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า',
                    'เพชรน้ำหนึ่งระดับ Rare Grade พร้อมใบรับรองจากสถาบัน GIA สหรัฐอเมริกา',
                    45000000,
                    2,
                    'active',
                    'ห้องมั่นคง ธนาคารกรุงเทพ สำนักงานใหญ่ สีลม',
                    'GIA-DIA-BLUE-15CT-2025'
                ],
                [
                    'AST-VAL-002',
                    'ทองคำแท่งบริสุทธิ์ 99.99% ตรามาตรฐาน LBMA น้ำหนักรวม 100 บาททอง',
                    'ทรัพย์สินอื่นๆ',
                    'valuable',
                    'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า',
                    'ทองคำแท่งคุณภาพส่งออก ได้รับการรับรองจากสมาคมค้าทองคำ',
                    4250000,
                    1,
                    'pledged',
                    'ตู้เซฟนิรภัยสาขาธนาคารกสิกรไทย พหลโยธิน',
                    'LBMA-GLD-9999-100B'
                ],
                [
                    'AST-VAL-003',
                    'ตู้เซฟนิรภัยมาตรฐานธนาคาร Chubbsafes Sovereign Class VI พร้อมระบบชีวมิติ',
                    'ทรัพย์สินอื่นๆ',
                    'valuable',
                    'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า',
                    'ตู้เซฟป้องกันการโจรกรรมและการเจาะระเบิด มาตรฐาน EN 1143-1',
                    1500000,
                    1,
                    'active',
                    'คฤหาสน์มหาทรัพย์เจริญ ซอยทองหล่อ 13',
                    'CHUBB-SOV-VI-4401'
                ],

                // 3. สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร (financial)
                [
                    'AST-FIN-001',
                    'พันธบัตรรัฐบาลเพื่อการออมและพัฒนาโครงสร้างพื้นฐานแห่งชาติ (10 ปี)',
                    'ทรัพย์สินอื่นๆ',
                    'financial',
                    'สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร)',
                    'พันธบัตรกระทรวงการคลัง ดอกเบี้ยคงที่ 3.85% ต่อปี ครบกำหนดไถ่ถอนปี 2034',
                    30000000,
                    1,
                    'active',
                    'ธนาคารแห่งประเทศไทย / บัญชีหลักทรัพย์ธนาคารไทยพาณิชย์',
                    'TH-BOND-GOV-2024-10Y'
                ],
                [
                    'AST-FIN-002',
                    'พอร์ตหุ้นสามัญในกลุ่มดัชนี SET50 บริษัทจดทะเบียนชั้นนำ',
                    'ทรัพย์สินอื่นๆ',
                    'financial',
                    'สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร)',
                    'พอร์ตลงทุนระยะยาวในกลุ่มพลังงานและไอที บล.ฟินันเซีย ไซรัส',
                    25000000,
                    2,
                    'active',
                    'ตลาดหลักทรัพย์แห่งประเทศไทย (SET)',
                    'PORT-SET50-PRW-9921'
                ],
                [
                    'AST-FIN-003',
                    'บัญชีเงินฝากประจำพิเศษ 36 เดือน อัตราดอกเบี้ยทวีทรัพย์',
                    'ทรัพย์สินอื่นๆ',
                    'financial',
                    'สินทรัพย์ทางการเงิน (เงินฝาก หุ้น พันธบัตร)',
                    'เงินฝากคุ้มครองโดยสถาบันคุ้มครองเงินฝาก ธนาคารกรุงไทย',
                    8500000,
                    4,
                    'active',
                    'ธนาคารกรุงไทย สาขาสยามพารากอน',
                    'KTB-FIXED-DEP-36M-0081'
                ],

                // 4. ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ (office)
                [
                    'AST-OFC-001',
                    'ระบบคอมพิวเตอร์แม่ข่าย Enterprise Data Center Cloud Server Rack (Dell)',
                    'ทรัพย์สินอื่นๆ',
                    'office',
                    'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ',
                    'เซิร์ฟเวอร์ PowerEdge R750 พร้อมระบบสตอเรจ SAN 120TB และ UPS อุตสาหกรรม',
                    7800000,
                    3,
                    'under_review',
                    'อาคารศูนย์ข้อมูล Data Center ทาวเวอร์ ชั้น 18',
                    'DELL-PE-R750-SRV-2024'
                ],
                [
                    'AST-OFC-002',
                    'คอมพิวเตอร์กราฟิกและตัดต่อระดับสูง Apple Mac Studio M2 Ultra (15 เครื่อง)',
                    'ทรัพย์สินอื่นๆ',
                    'office',
                    'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ',
                    'คอมพิวเตอร์ประมวลผลสูงสำหรับแผนกวิจัยพัฒนาและโมเดล 3D AI',
                    2400000,
                    3,
                    'active',
                    'แผนก R&D สำนักงานใหญ่ อโศก',
                    'APL-MAC-STU-ULTRA-SET15'
                ],
                [
                    'AST-OFC-003',
                    'ชุดโต๊ะทำงานผู้บริหารและเก้าอี้เพื่อสุขภาพ Herman Miller Aeron (20 ชุด)',
                    'ทรัพย์สินอื่นๆ',
                    'office',
                    'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ',
                    'เฟอร์นิเจอร์สำนักงานเกรดพรีเมียมรองรับสรีระมาตรฐานสากล',
                    1850000,
                    4,
                    'active',
                    'อาคารสำนักงานวัฒนพาณิชย์ ชั้น 24',
                    'HM-AERON-SET-20-B24'
                ]
            ];

            initialAssets.forEach(item => {
                assetStmt.run(item);
            });
            assetStmt.finalize();
            console.log('[DB] Seeded 12 assets under topic "ทรัพย์สินอื่นๆ" successfully!');
        }
    });
});

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll
};
