const path = require('path');
const bcrypt = require('bcryptjs');

// Default initial users
const defaultUsers = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), name: 'นายพีรพัฒน์ มั่นคง (System Admin)', role: 'admin', organization: 'Central Asset Registrar', created_at: new Date().toISOString() },
    { id: 2, username: 'bank_officer', password: bcrypt.hashSync('officer123', 10), name: 'ธนกฤต บริรักษ์ (Bank A Officer)', role: 'officer', organization: 'Bank A Production Client', created_at: new Date().toISOString() },
    { id: 3, username: 'partner_agent', password: bcrypt.hashSync('partner123', 10), name: 'วรินทร คู่ค้า (Bank B Partner)', role: 'partner', organization: 'Bank B Partner Client', created_at: new Date().toISOString() }
];

// Default initial customers
const defaultCustomers = [
    { id: 1, customer_code: 'CUST-001', name: 'นายสมศักดิ์ มหาทรัพย์เจริญ', id_card: '1103701234567', email: 'somsak@asset.co.th', phone: '081-234-5678', customer_type: 'individual', created_at: new Date().toISOString() },
    { id: 2, customer_code: 'CUST-002', name: 'นางสาวแพรวา ธนบดี', id_card: '3100609876543', email: 'praewa@wealthcorp.th', phone: '089-876-5432', customer_type: 'individual', created_at: new Date().toISOString() },
    { id: 3, customer_code: 'CUST-003', name: 'บริษัท สยามแอดวานซ์อินดัสทรี จำกัด', id_card: '0105558012345', email: 'contact@siamadvance.com', phone: '02-765-4321', customer_type: 'corporate', created_at: new Date().toISOString() },
    { id: 4, customer_code: 'CUST-004', name: 'นายกฤษฎา วัฒนพาณิชย์', id_card: '1100405556677', email: 'kritsada@panich.org', phone: '086-555-4433', customer_type: 'individual', created_at: new Date().toISOString() }
];

// Default initial assets (Topic: ทรัพย์สินอื่นๆ - Other Assets)
const defaultAssets = [
    // 1. เครื่องจักร เครื่องมือและอุปกรณ์การผลิต (machinery)
    { id: 1, asset_code: 'AST-MCH-001', name: 'เครื่องกลึงอัตโนมัติ CNC 5 แกน Precision High-Speed', category: 'ทรัพย์สินอื่นๆ', asset_type: 'machinery', asset_type_th: 'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต', description: 'เครื่องจักรความแม่นยำสูงนำเข้าจากเยอรมนี สำหรับขึ้นรูปชิ้นส่วนอากาศยานและยานยนต์', value: 18500000, customer_id: 3, status: 'active', location: 'โรงงานนิคมอุตสาหกรรมบางปู สมุทรปราการ', serial_number: 'CNC-DE-889421-2024', created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
    { id: 2, asset_code: 'AST-MCH-002', name: 'แขนกลหุ่นยนต์ประกอบชิ้นส่วนอัตโนมัติ Fanuc Robot 6-Axis', category: 'ทรัพย์สินอื่นๆ', asset_type: 'machinery', asset_type_th: 'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต', description: 'แขนกลหุ่นยนต์อุตสาหกรรมพร้อมระบบ AI Vision Control', value: 12000000, customer_id: 3, status: 'active', location: 'โรงงานนิคมอุตสาหกรรมอีสเทิร์นซีบอร์ด ระยอง', serial_number: 'FNC-RBT-6AX-55321', created_at: '2026-09-02T09:00:00Z', updated_at: '2026-09-02T09:00:00Z' },
    { id: 3, asset_code: 'AST-MCH-003', name: 'หม้อไอน้ำอุตสาหกรรมแรงดันสูง Industrial Steam Boiler 15 Ton/Hr', category: 'ทรัพย์สินอื่นๆ', asset_type: 'machinery', asset_type_th: 'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต', description: 'หม้อไอน้ำประหยัดพลังงานมาตรฐานสากล ASME', value: 6500000, customer_id: 3, status: 'pledged', location: 'โรงงานแปรรูปอาหาร นิคมนวนคร ปทุมธานี', serial_number: 'BLR-ASME-2023-09', created_at: '2026-09-03T10:00:00Z', updated_at: '2026-09-03T10:00:00Z' },

    // 2. ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า (valuable)
    { id: 4, asset_code: 'AST-VAL-001', name: 'ชุดอัญมณีเพชรแท้ Blue Diamond Collection 15 กะรัต พร้อมใบเซอร์ GIA', category: 'ทรัพย์สินอื่นๆ', asset_type: 'valuable', asset_type_th: 'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า', description: 'เพชรน้ำหนึ่งระดับ Rare Grade พร้อมใบรับรองจากสถาบัน GIA สหรัฐอเมริกา', value: 45000000, customer_id: 2, status: 'active', location: 'ห้องมั่นคง ธนาคารกรุงเทพ สำนักงานใหญ่ สีลม', serial_number: 'GIA-DIA-BLUE-15CT-2025', created_at: '2026-09-04T11:00:00Z', updated_at: '2026-09-04T11:00:00Z' },
    { id: 5, asset_code: 'AST-VAL-002', name: 'ทองคำแท่งบริสุทธิ์ 99.99% ตรามาตรฐาน LBMA น้ำหนักรวม 100 บาททอง', category: 'ทรัพย์สินอื่นๆ', asset_type: 'valuable', asset_type_th: 'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า', description: 'ทองคำแท่งคุณภาพส่งออก ได้รับการรับรองจากสมาคมค้าทองคำ', value: 4250000, customer_id: 1, status: 'pledged', location: 'ตู้เซฟนิรภัยสาขาธนาคารกสิกรไทย พหลโยธิน', serial_number: 'LBMA-GLD-9999-100B', created_at: '2026-09-05T12:00:00Z', updated_at: '2026-09-05T12:00:00Z' },
    { id: 6, asset_code: 'AST-VAL-003', name: 'ตู้เซฟนิรภัยมาตรฐานธนาคาร Chubbsafes Sovereign Class VI พร้อมระบบชีวมิติ', category: 'ทรัพย์สินอื่นๆ', asset_type: 'valuable', asset_type_th: 'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า', description: 'ตู้เซฟป้องกันการโจรกรรมและการเจาะระเบิด มาตรฐาน EN 1143-1', value: 1500000, customer_id: 1, status: 'active', location: 'คฤหาสน์มหาทรัพย์เจริญ ซอยทองหล่อ 13', serial_number: 'CHUBB-SOV-VI-4401', created_at: '2026-09-06T13:00:00Z', updated_at: '2026-09-06T13:00:00Z' },

    // 3. สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร (financial)
    { id: 7, asset_code: 'AST-FIN-001', name: 'พันธบัตรรัฐบาลเพื่อการออมและพัฒนาโครงสร้างพื้นฐานแห่งชาติ (10 ปี)', category: 'ทรัพย์สินอื่นๆ', asset_type: 'financial', asset_type_th: 'สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร', description: 'พันธบัตรกระทรวงการคลัง ดอกเบี้ยคงที่ 3.85% ต่อปี ครบกำหนดไถ่ถอนปี 2034', value: 30000000, customer_id: 1, status: 'active', location: 'ธนาคารแห่งประเทศไทย / บัญชีหลักทรัพย์ธนาคารไทยพาณิชย์', serial_number: 'TH-BOND-GOV-2024-10Y', created_at: '2026-09-07T14:00:00Z', updated_at: '2026-09-07T14:00:00Z' },
    { id: 8, asset_code: 'AST-FIN-002', name: 'พอร์ตหุ้นสามัญในกลุ่มดัชนี SET50 บริษัทจดทะเบียนชั้นนำ', category: 'ทรัพย์สินอื่นๆ', asset_type: 'financial', asset_type_th: 'สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร', description: 'พอร์ตลงทุนระยะยาวในกลุ่มพลังงานและไอที บล.ฟินันเซีย ไซรัส', value: 25000000, customer_id: 2, status: 'active', location: 'ตลาดหลักทรัพย์แห่งประเทศไทย (SET)', serial_number: 'PORT-SET50-PRW-9921', created_at: '2026-09-08T15:00:00Z', updated_at: '2026-09-08T15:00:00Z' },
    { id: 9, asset_code: 'AST-FIN-003', name: 'บัญชีเงินฝากประจำพิเศษ 36 เดือน อัตราดอกเบี้ยทวีทรัพย์', category: 'ทรัพย์สินอื่นๆ', asset_type: 'financial', asset_type_th: 'สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร', description: 'เงินฝากคุ้มครองโดยสถาบันคุ้มครองเงินฝาก ธนาคารกรุงไทย', value: 8500000, customer_id: 4, status: 'active', location: 'ธนาคารกรุงไทย สาขาสยามพารากอน', serial_number: 'KTB-FIXED-DEP-36M-0081', created_at: '2026-09-09T16:00:00Z', updated_at: '2026-09-09T16:00:00Z' },

    // 4. ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ (office)
    { id: 10, asset_code: 'AST-OFC-001', name: 'ระบบคอมพิวเตอร์แม่ข่าย Enterprise Data Center Cloud Server Rack (Dell)', category: 'ทรัพย์สินอื่นๆ', asset_type: 'office', asset_type_th: 'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ', description: 'เซิร์ฟเวอร์ PowerEdge R750 พร้อมระบบสตอเรจ SAN 120TB และ UPS อุตสาหกรรม', value: 7800000, customer_id: 3, status: 'under_review', location: 'อาคารศูนย์ข้อมูล Data Center ทาวเวอร์ ชั้น 18', serial_number: 'DELL-PE-R750-SRV-2024', created_at: '2026-09-10T17:00:00Z', updated_at: '2026-09-10T17:00:00Z' },
    { id: 11, asset_code: 'AST-OFC-002', name: 'คอมพิวเตอร์กราฟิกและตัดต่อระดับสูง Apple Mac Studio M2 Ultra (15 เครื่อง)', category: 'ทรัพย์สินอื่นๆ', asset_type: 'office', asset_type_th: 'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ', description: 'คอมพิวเตอร์ประมวลผลสูงสำหรับแผนกวิจัยพัฒนาและโมเดล 3D AI', value: 2400000, customer_id: 3, status: 'active', location: 'แผนก R&D สำนักงานใหญ่ อโศก', serial_number: 'APL-MAC-STU-ULTRA-SET15', created_at: '2026-09-11T18:00:00Z', updated_at: '2026-09-11T18:00:00Z' },
    { id: 12, asset_code: 'AST-OFC-003', name: 'ชุดโต๊ะทำงานผู้บริหารและเก้าอี้เพื่อสุขภาพ Herman Miller Aeron (20 ชุด)', category: 'ทรัพย์สินอื่นๆ', asset_type: 'office', asset_type_th: 'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ', description: 'เฟอร์นิเจอร์สำนักงานเกรดพรีเมียมรองรับสรีระมาตรฐานสากล', value: 1850000, customer_id: 4, status: 'active', location: 'อาคารสำนักงานวัฒนพาณิชย์ ชั้น 24', serial_number: 'HM-AERON-SET-20-B24', created_at: '2026-09-12T19:00:00Z', updated_at: '2026-09-12T19:00:00Z' }
];

let sqlite3;
let db = null;
let useFallback = false;

// Attempt to load sqlite3 native library with try-catch (Protects against Cloud GLIBC mismatch)
try {
    sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.warn('[DB WARNING] SQLite connection failed, switching to memory store:', err.message);
            useFallback = true;
        } else {
            console.log('[DB SUCCESS] Connected to SQLite database:', dbPath);
        }
    });
} catch (nativeErr) {
    console.warn('[DB WARNING] Native sqlite3 binding could not be loaded on this environment:');
    console.warn('             ' + nativeErr.message);
    console.log('[DB INFO] ✨ Activating built-in resilient database engine (No native GLIBC dependencies required).');
    useFallback = true;
}

// In-Memory Data Store fallback
const memoryStore = {
    users: [...defaultUsers],
    customers: [...defaultCustomers],
    assets: [...defaultAssets],
    nextAssetId: 13
};

// Promisified DB helpers
const dbRun = (sql, params = []) => {
    if (useFallback || !db) {
        return handleMemoryRun(sql, params);
    }
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const dbGet = (sql, params = []) => {
    if (useFallback || !db) {
        return handleMemoryGet(sql, params);
    }
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const dbAll = (sql, params = []) => {
    if (useFallback || !db) {
        return handleMemoryAll(sql, params);
    }
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// --- In-Memory Engine Handlers (Fail-Safe for Cloud Deployments) ---
function handleMemoryGet(sql, params) {
    const s = sql.toLowerCase();
    
    // User login check: SELECT * FROM users WHERE username = ?
    if (s.includes('from users') && s.includes('username = ?')) {
        const username = params[0];
        const user = memoryStore.users.find(u => u.username === username);
        return Promise.resolve(user || null);
    }

    // Customer check: SELECT id, name FROM customers WHERE id = ?
    if (s.includes('from customers') && s.includes('id = ?')) {
        const id = parseInt(params[0], 10);
        const customer = memoryStore.customers.find(c => c.id === id);
        return Promise.resolve(customer || null);
    }

    // Single asset with customer join
    if (s.includes('from assets') && s.includes('where a.id = ?')) {
        const id = parseInt(params[0], 10);
        const a = memoryStore.assets.find(item => item.id === id);
        if (!a) return Promise.resolve(null);
        const c = memoryStore.customers.find(item => item.id === a.customer_id) || {};
        return Promise.resolve({
            ...a,
            customer_code: c.customer_code,
            owner_name: c.name,
            owner_id_card: c.id_card,
            owner_email: c.email,
            owner_phone: c.phone,
            owner_type: c.customer_type
        });
    }

    // Simple asset check: SELECT * FROM assets WHERE id = ?
    if (s.includes('from assets') && s.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        const a = memoryStore.assets.find(item => item.id === id);
        return Promise.resolve(a || null);
    }

    // Summary stats
    if (s.includes('count(*) as total_assets')) {
        const total_assets = memoryStore.assets.length;
        const total_value = memoryStore.assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
        const uniqueOwners = new Set(memoryStore.assets.map(a => a.customer_id)).size;
        return Promise.resolve({
            total_assets,
            total_value,
            total_owners: uniqueOwners
        });
    }

    return Promise.resolve(null);
}

function handleMemoryAll(sql, params) {
    const s = sql.toLowerCase();

    // Summary: group by asset_type
    if (s.includes('group by asset_type')) {
        const groups = {};
        memoryStore.assets.forEach(a => {
            if (!groups[a.asset_type]) {
                groups[a.asset_type] = {
                    asset_type: a.asset_type,
                    asset_type_th: a.asset_type_th,
                    count: 0,
                    total_value: 0
                };
            }
            groups[a.asset_type].count += 1;
            groups[a.asset_type].total_value += Number(a.value) || 0;
        });
        const rows = Object.values(groups).map(g => ({
            ...g,
            average_value: Math.round((g.total_value / g.count) * 100) / 100
        }));
        rows.sort((a, b) => b.total_value - a.total_value);
        return Promise.resolve(rows);
    }

    // Summary: group by status
    if (s.includes('group by status')) {
        const groups = {};
        memoryStore.assets.forEach(a => {
            if (!groups[a.status]) {
                groups[a.status] = { status: a.status, count: 0, total_value: 0 };
            }
            groups[a.status].count += 1;
            groups[a.status].total_value += Number(a.value) || 0;
        });
        return Promise.resolve(Object.values(groups));
    }

    // Top owners report
    if (s.includes('group by c.id')) {
        const rows = memoryStore.customers.map(c => {
            const userAssets = memoryStore.assets.filter(a => a.customer_id === c.id);
            const total_value = userAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
            return {
                id: c.id,
                customer_code: c.customer_code,
                name: c.name,
                asset_count: userAssets.length,
                total_value
            };
        });
        rows.sort((a, b) => b.total_value - a.total_value);
        return Promise.resolve(rows);
    }

    // High value assets: WHERE a.value >= ?
    if (s.includes('where a.value >= ?')) {
        const minVal = parseFloat(params[0]) || 0;
        const matched = memoryStore.assets
            .filter(a => Number(a.value) >= minVal)
            .map(a => {
                const c = memoryStore.customers.find(item => item.id === a.customer_id) || {};
                return {
                    ...a,
                    owner_name: c.name,
                    owner_email: c.email,
                    owner_phone: c.phone
                };
            });
        matched.sort((a, b) => b.value - a.value);
        return Promise.resolve(matched);
    }

    // Ownership by type report: WHERE (LOWER(a.asset_type) = LOWER(?) OR a.asset_type_th LIKE ?)
    if (s.includes('from assets a join customers c') && s.includes('asset_type')) {
        let matched = memoryStore.assets;
        if (params.length > 0) {
            const typeFilter = String(params[0]).toLowerCase();
            matched = matched.filter(a => 
                a.asset_type.toLowerCase() === typeFilter || 
                a.asset_type_th.includes(typeFilter)
            );
        }
        const rows = matched.map(a => {
            const c = memoryStore.customers.find(item => item.id === a.customer_id) || {};
            return {
                asset_id: a.id,
                asset_code: a.asset_code,
                asset_name: a.name,
                asset_type: a.asset_type,
                asset_type_th: a.asset_type_th,
                value: a.value,
                status: a.status,
                location: a.location,
                customer_id: c.id,
                customer_code: c.customer_code,
                owner_name: c.name,
                owner_id_card: c.id_card,
                owner_email: c.email,
                owner_phone: c.phone,
                customer_type: c.customer_type
            };
        });
        rows.sort((a, b) => b.value - a.value);
        return Promise.resolve(rows);
    }

    // Customer assets: WHERE customer_id = ?
    if (s.includes('where customer_id = ?')) {
        const cid = parseInt(params[0], 10);
        const rows = memoryStore.assets.filter(a => a.customer_id === cid);
        rows.sort((a, b) => b.value - a.value);
        return Promise.resolve(rows);
    }

    // General Assets list with optional filter
    if (s.includes('from assets a') && s.includes('join customers c')) {
        let results = [...memoryStore.assets];

        if (params.length > 0) {
            // Check if filter by type or search was passed
            for (let i = 0; i < params.length; i++) {
                const p = String(params[i]);
                if (['machinery', 'valuable', 'financial', 'office'].includes(p)) {
                    results = results.filter(a => a.asset_type === p);
                } else if (['active', 'pledged', 'under_review', 'liquidated'].includes(p)) {
                    results = results.filter(a => a.status === p);
                } else if (p.startsWith('%') && p.endsWith('%')) {
                    const term = p.slice(1, -1).toLowerCase();
                    results = results.filter(a => 
                        a.name.toLowerCase().includes(term) || 
                        a.asset_code.toLowerCase().includes(term) ||
                        (a.serial_number && a.serial_number.toLowerCase().includes(term))
                    );
                }
            }
        }

        const rows = results.map(a => {
            const c = memoryStore.customers.find(item => item.id === a.customer_id) || {};
            return {
                ...a,
                owner_name: c.name,
                owner_email: c.email,
                owner_phone: c.phone
            };
        });
        rows.sort((a, b) => b.id - a.id);
        return Promise.resolve(rows);
    }

    // Customers list
    if (s.includes('from customers c')) {
        const rows = memoryStore.customers.map(c => {
            const userAssets = memoryStore.assets.filter(a => a.customer_id === c.id);
            const total_asset_value = userAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
            return {
                ...c,
                total_assets: userAssets.length,
                total_asset_value
            };
        });
        return Promise.resolve(rows);
    }

    return Promise.resolve([]);
}

function handleMemoryRun(sql, params) {
    const s = sql.toLowerCase();

    // INSERT INTO assets
    if (s.includes('insert into assets')) {
        const [asset_code, name, category, asset_type, asset_type_th, description, value, customer_id, status, location, serial_number] = params;
        const newAsset = {
            id: memoryStore.nextAssetId++,
            asset_code,
            name,
            category: category || 'ทรัพย์สินอื่นๆ',
            asset_type,
            asset_type_th,
            description: description || '',
            value: Number(value),
            customer_id: parseInt(customer_id, 10),
            status: status || 'active',
            location: location || '',
            serial_number: serial_number || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        memoryStore.assets.unshift(newAsset);
        return Promise.resolve({ lastID: newAsset.id, changes: 1 });
    }

    // UPDATE assets
    if (s.includes('update assets')) {
        const assetId = parseInt(params[params.length - 1], 10);
        const index = memoryStore.assets.findIndex(a => a.id === assetId);
        if (index !== -1) {
            const [name, asset_type, asset_type_th, description, value, customer_id, status, location, serial_number] = params;
            memoryStore.assets[index] = {
                ...memoryStore.assets[index],
                name,
                asset_type,
                asset_type_th,
                description,
                value: Number(value),
                customer_id: parseInt(customer_id, 10),
                status,
                location,
                serial_number,
                updated_at: new Date().toISOString()
            };
            return Promise.resolve({ lastID: assetId, changes: 1 });
        }
        return Promise.resolve({ lastID: 0, changes: 0 });
    }

    // DELETE FROM assets
    if (s.includes('delete from assets')) {
        const assetId = parseInt(params[0], 10);
        const initLen = memoryStore.assets.length;
        memoryStore.assets = memoryStore.assets.filter(a => a.id !== assetId);
        return Promise.resolve({ changes: initLen - memoryStore.assets.length });
    }

    return Promise.resolve({ lastID: 0, changes: 0 });
}

// Initialize SQLite tables if native sqlite is active
if (db && !useFallback) {
    db.serialize(() => {
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

        // Seed check
        db.get('SELECT COUNT(*) AS count FROM users', [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log('[DB] Seeding users into SQLite...');
                const userStmt = db.prepare(`INSERT INTO users (username, password, name, role, organization) VALUES (?, ?, ?, ?, ?)`);
                defaultUsers.forEach(u => userStmt.run([u.username, u.password, u.name, u.role, u.organization]));
                userStmt.finalize();
            }
        });

        db.get('SELECT COUNT(*) AS count FROM customers', [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log('[DB] Seeding customers into SQLite...');
                const custStmt = db.prepare(`INSERT INTO customers (customer_code, name, id_card, email, phone, customer_type) VALUES (?, ?, ?, ?, ?, ?)`);
                defaultCustomers.forEach(c => custStmt.run([c.customer_code, c.name, c.id_card, c.email, c.phone, c.customer_type]));
                custStmt.finalize();
            }
        });

        db.get('SELECT COUNT(*) AS count FROM assets', [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log('[DB] Seeding assets into SQLite...');
                const assetStmt = db.prepare(`
                    INSERT INTO assets (
                        asset_code, name, category, asset_type, asset_type_th,
                        description, value, customer_id, status, location, serial_number
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                defaultAssets.forEach(a => {
                    assetStmt.run([
                        a.asset_code, a.name, a.category, a.asset_type, a.asset_type_th,
                        a.description, a.value, a.customer_id, a.status, a.location, a.serial_number
                    ]);
                });
                assetStmt.finalize();
                console.log('[DB] Seeded 12 assets in SQLite successfully!');
            }
        });
    });
}

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll,
    isFallback: () => useFallback
};
