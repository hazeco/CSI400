const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { validateAssetInput } = require('../middleware/validationMiddleware');

// Mapping type key to Thai title for "ทรัพย์สินอื่นๆ"
const assetTypeTitles = {
    machinery: 'เครื่องจักร เครื่องมือและอุปกรณ์การผลิต',
    valuable: 'ตู้เซฟ อัญมณี หรือทรัพย์สินมีค่า',
    financial: 'สินทรัพย์ทางการเงิน เช่น เงินฝาก หุ้น พันธบัตร',
    office: 'ของใช้สำนักงาน เฟอร์นิเจอร์ คอมพิวเตอร์ หรืออุปกรณ์สำนักงานอื่น ๆ'
};

// All endpoints in this router are Private APIs and require JWT token
router.use(authenticateToken);

// 1. GET /api/assets - Asset Ownership Inquiry API: รายการทรัพย์สินทั้งหมด
router.get('/', async (req, res) => {
    try {
        const { type, status, search } = req.query;
        let sql = `
            SELECT 
                a.id, a.asset_code, a.name, a.category, a.asset_type, a.asset_type_th,
                a.description, a.value, a.status, a.location, a.serial_number,
                a.created_at, a.updated_at,
                c.id AS customer_id, c.customer_code, c.name AS owner_name, c.email AS owner_email, c.phone AS owner_phone
            FROM assets a
            JOIN customers c ON a.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            sql += ` AND a.asset_type = ?`;
            params.push(type);
        }

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }

        if (search) {
            sql += ` AND (a.name LIKE ? OR a.asset_code LIKE ? OR a.serial_number LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        sql += ` ORDER BY a.id DESC`;

        const assets = await dbAll(sql, params);
        res.json({
            message: 'ดึงรายการทรัพย์สินทั้งหมดสำเร็จ (Asset List Fetched)',
            count: assets.length,
            data: assets
        });
    } catch (err) {
        console.error('[ASSET GET ALL ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. GET /api/assets/:id - Production Management / Inquiry API: แสดงรายละเอียดทรัพย์สินและผู้ถือครอง
router.get('/:id', async (req, res) => {
    const assetId = parseInt(req.params.id, 10);
    if (isNaN(assetId)) {
        return res.status(400).json({ error: 'Invalid asset ID parameter' });
    }

    try {
        // OWASP Parameterized Query
        const sql = `
            SELECT 
                a.id, a.asset_code, a.name, a.category, a.asset_type, a.asset_type_th,
                a.description, a.value, a.status, a.location, a.serial_number,
                a.created_at, a.updated_at,
                c.id AS customer_id, c.customer_code, c.name AS owner_name, 
                c.id_card AS owner_id_card, c.email AS owner_email, c.phone AS owner_phone,
                c.customer_type AS owner_type
            FROM assets a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.id = ?
        `;
        const asset = await dbGet(sql, [assetId]);

        if (!asset) {
            return res.status(404).json({
                error: 'Asset not found',
                message: `ไม่พบข้อมูลทรัพย์สินรหัส ID: ${assetId}`,
                status: 404
            });
        }

        res.json({
            message: 'ดึงรายละเอียดทรัพย์สินสำเร็จ (Asset Detail Fetched)',
            data: asset
        });
    } catch (err) {
        console.error('[ASSET GET ONE ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. POST /api/assets - Production Management API: เพิ่มข้อมูลการถือครองทรัพย์สิน (เจ้าหน้าที่ระบบ / Admin / Officer เท่านั้น)
router.post('/', requireRole(['admin', 'officer']), validateAssetInput, async (req, res) => {
    const {
        name,
        asset_type,
        value,
        customer_id,
        description = '',
        location = '',
        serial_number = '',
        status = 'active'
    } = req.body;

    try {
        // Verify customer exists
        const customer = await dbGet('SELECT id, name FROM customers WHERE id = ?', [customer_id]);
        if (!customer) {
            return res.status(400).json({
                error: 'Invalid customer_id',
                message: `ไม่พบข้อมูลผู้ถือครองทรัพย์สิน ID: ${customer_id} ในระบบ`,
                status: 400
            });
        }

        // Generate automated asset code (e.g. AST-MCH-XXXX)
        const prefixMap = {
            machinery: 'AST-MCH',
            valuable: 'AST-VAL',
            financial: 'AST-FIN',
            office: 'AST-OFC'
        };
        const prefix = prefixMap[asset_type] || 'AST-OTH';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const asset_code = `${prefix}-${Date.now().toString().slice(-4)}${randomNum}`;
        const asset_type_th = assetTypeTitles[asset_type] || 'ทรัพย์สินอื่นๆ';
        const category = 'ทรัพย์สินอื่นๆ';

        // Parameterized INSERT query
        const insertSql = `
            INSERT INTO assets (
                asset_code, name, category, asset_type, asset_type_th,
                description, value, customer_id, status, location, serial_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await dbRun(insertSql, [
            asset_code,
            name,
            category,
            asset_type,
            asset_type_th,
            description,
            value,
            customer_id,
            status,
            location,
            serial_number
        ]);

        const newAsset = await dbGet(`
            SELECT a.*, c.name AS owner_name 
            FROM assets a 
            JOIN customers c ON a.customer_id = c.id 
            WHERE a.id = ?
        `, [result.lastID]);

        res.status(201).json({
            message: 'เพิ่มข้อมูลการถือครองทรัพย์สินสำเร็จ (Asset Created Successfully)',
            status: 201,
            data: newAsset
        });
    } catch (err) {
        console.error('[ASSET CREATE ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. PUT /api/assets/:id - Production Management API: แก้ไขข้อมูลการถือครองทรัพย์สิน (เจ้าหน้าที่ระบบ / Admin / Officer เท่านั้น)
router.put('/:id', requireRole(['admin', 'officer']), validateAssetInput, async (req, res) => {
    const assetId = parseInt(req.params.id, 10);
    if (isNaN(assetId)) {
        return res.status(400).json({ error: 'Invalid asset ID parameter' });
    }

    const {
        name,
        asset_type,
        value,
        customer_id,
        description = '',
        location = '',
        serial_number = '',
        status = 'active'
    } = req.body;

    try {
        // Check existing asset
        const existing = await dbGet('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (!existing) {
            return res.status(404).json({
                error: 'Asset not found',
                message: `ไม่พบข้อมูลทรัพย์สิน ID: ${assetId} ที่ต้องการแก้ไข`,
                status: 404
            });
        }

        // Verify customer exists
        const customer = await dbGet('SELECT id FROM customers WHERE id = ?', [customer_id]);
        if (!customer) {
            return res.status(400).json({
                error: 'Invalid customer_id',
                message: `ไม่พบข้อมูลผู้ถือครองทรัพย์สิน ID: ${customer_id} ในระบบ`,
                status: 400
            });
        }

        const asset_type_th = assetTypeTitles[asset_type] || existing.asset_type_th;

        // Parameterized UPDATE query
        const updateSql = `
            UPDATE assets
            SET name = ?,
                asset_type = ?,
                asset_type_th = ?,
                description = ?,
                value = ?,
                customer_id = ?,
                status = ?,
                location = ?,
                serial_number = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await dbRun(updateSql, [
            name,
            asset_type,
            asset_type_th,
            description,
            value,
            customer_id,
            status,
            location,
            serial_number,
            assetId
        ]);

        const updatedAsset = await dbGet(`
            SELECT a.*, c.name AS owner_name 
            FROM assets a 
            JOIN customers c ON a.customer_id = c.id 
            WHERE a.id = ?
        `, [assetId]);

        res.json({
            message: 'แก้ไขข้อมูลการถือครองทรัพย์สินสำเร็จ (Asset Updated Successfully)',
            data: updatedAsset
        });
    } catch (err) {
        console.error('[ASSET UPDATE ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. DELETE /api/assets/:id - ลบรายการทรัพย์สิน (เฉพาะ Admin สูงสุดเท่านั้น)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
    const assetId = parseInt(req.params.id, 10);
    if (isNaN(assetId)) {
        return res.status(400).json({ error: 'Invalid asset ID parameter' });
    }

    try {
        const existing = await dbGet('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (!existing) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        await dbRun('DELETE FROM assets WHERE id = ?', [assetId]);
        res.json({
            message: `ลบข้อมูลทรัพย์สิน ID: ${assetId} (${existing.name}) สำเร็จ`,
            status: 200
        });
    } catch (err) {
        console.error('[ASSET DELETE ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
