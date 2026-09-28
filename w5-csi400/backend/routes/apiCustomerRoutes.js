const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET /api/customers - รายการผู้ถือครอง/ลูกค้าทั้งหมด
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.id, c.customer_code, c.name, c.id_card, c.email, c.phone, c.customer_type, c.created_at,
                COUNT(a.id) AS total_assets,
                COALESCE(SUM(a.value), 0) AS total_asset_value
            FROM customers c
            LEFT JOIN assets a ON c.id = a.customer_id
            GROUP BY c.id
            ORDER BY c.id ASC
        `;
        const customers = await dbAll(sql);
        res.json({
            message: 'ดึงรายชื่อผู้ถือครองทรัพย์สินทั้งหมดสำเร็จ',
            count: customers.length,
            data: customers
        });
    } catch (err) {
        console.error('[CUSTOMER ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/customers/:id/assets - Asset Ownership Inquiry API: ข้อมูลทรัพย์สินของผู้ถือครองรายบุคคล (PDF Page 26)
router.get('/:id/assets', async (req, res) => {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID parameter' });
    }

    try {
        // OWASP Parameterized Query
        const customer = await dbGet('SELECT * FROM customers WHERE id = ?', [customerId]);
        if (!customer) {
            return res.status(404).json({
                error: 'Customer not found',
                message: `ไม่พบข้อมูลลูกค้า/ผู้ถือครองรหัส ID: ${customerId}`,
                status: 404
            });
        }

        const assets = await dbAll(`
            SELECT 
                id, asset_code, name, category, asset_type, asset_type_th,
                description, value, status, location, serial_number, created_at
            FROM assets
            WHERE customer_id = ?
            ORDER BY value DESC
        `, [customerId]);

        const totalValue = assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

        res.json({
            message: `ดึงรายการทรัพย์สินของ ${customer.name} สำเร็จ`,
            customer: {
                id: customer.id,
                customer_code: customer.customer_code,
                name: customer.name,
                id_card: customer.id_card,
                email: customer.email,
                phone: customer.phone,
                customer_type: customer.customer_type
            },
            asset_summary: {
                total_items: assets.length,
                total_value: totalValue
            },
            assets
        });
    } catch (err) {
        console.error('[CUSTOMER ASSETS ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
