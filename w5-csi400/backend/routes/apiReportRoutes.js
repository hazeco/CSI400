const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateHighValueQuery, validateAssetTypeQuery } = require('../middleware/validationMiddleware');

router.use(authenticateToken);

// 3. Asset Ownership Summary API (PDF Page 26)
// GET /api/reports/assets/summary
router.get('/assets/summary', async (req, res) => {
    try {
        // Total assets count and total value
        const totalStats = await dbGet(`
            SELECT 
                COUNT(*) AS total_assets,
                COALESCE(SUM(value), 0) AS total_value,
                COUNT(DISTINCT customer_id) AS total_owners
            FROM assets
        `);

        // Group by asset type (Focus: ทรัพย์สินอื่นๆ - Other Assets)
        const typeBreakdown = await dbAll(`
            SELECT 
                asset_type,
                asset_type_th,
                COUNT(*) AS count,
                COALESCE(SUM(value), 0) AS total_value,
                ROUND(AVG(value), 2) AS average_value
            FROM assets
            GROUP BY asset_type, asset_type_th
            ORDER BY total_value DESC
        `);

        // Group by ownership status
        const statusBreakdown = await dbAll(`
            SELECT 
                status,
                COUNT(*) AS count,
                COALESCE(SUM(value), 0) AS total_value
            FROM assets
            GROUP BY status
            ORDER BY count DESC
        `);

        // Group by owner
        const topOwners = await dbAll(`
            SELECT 
                c.id, c.customer_code, c.name,
                COUNT(a.id) AS asset_count,
                COALESCE(SUM(a.value), 0) AS total_value
            FROM customers c
            JOIN assets a ON c.id = a.customer_id
            GROUP BY c.id
            ORDER BY total_value DESC
        `);

        res.json({
            message: 'รายงานสรุปการถือครองทรัพย์สิน (Asset Ownership Summary Report)',
            category_scope: 'ทรัพย์สินอื่นๆ (Other Assets)',
            summary: {
                total_assets: totalStats.total_assets,
                total_owners: totalStats.total_owners,
                total_asset_value: totalStats.total_value,
                total_asset_value_formatted: Number(totalStats.total_value).toLocaleString('th-TH') + ' บาท'
            },
            by_asset_type: typeBreakdown,
            by_ownership_status: statusBreakdown,
            top_owners: topOwners
        });
    } catch (err) {
        console.error('[REPORT SUMMARY ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. High-Value Asset Report API (PDF Page 26)
// GET /api/reports/assets/high-value?minValue=10000000
router.get('/assets/high-value', validateHighValueQuery, async (req, res) => {
    try {
        const minValue = parseFloat(req.query.minValue) || 10000000; // Default 10,000,000 Baht per assignment

        // OWASP Parameterized Query - prevents SQL Injection via minValue
        const sql = `
            SELECT 
                a.id, a.asset_code, a.name, a.category, a.asset_type, a.asset_type_th,
                a.description, a.value, a.status, a.location, a.serial_number,
                c.id AS customer_id, c.customer_code, c.name AS owner_name, 
                c.email AS owner_email, c.phone AS owner_phone
            FROM assets a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.value >= ?
            ORDER BY a.value DESC
        `;

        const highValueAssets = await dbAll(sql, [minValue]);
        const sumValue = highValueAssets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

        res.json({
            message: `รายงานทรัพย์สินที่มีมูลค่าสูง (ตั้งแต่ ${minValue.toLocaleString('th-TH')} บาทขึ้นไป)`,
            filter_minValue: minValue,
            matched_count: highValueAssets.length,
            total_high_value_sum: sumValue,
            total_high_value_formatted: sumValue.toLocaleString('th-TH') + ' บาท',
            assets: highValueAssets
        });
    } catch (err) {
        console.error('[REPORT HIGH VALUE ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Asset Type Ownership Report API (PDF Page 26)
// GET /api/reports/ownership?assetType=machinery
router.get('/ownership', validateAssetTypeQuery, async (req, res) => {
    try {
        const { assetType } = req.query;

        let sql = `
            SELECT 
                a.id AS asset_id, a.asset_code, a.name AS asset_name,
                a.asset_type, a.asset_type_th, a.value, a.status, a.location,
                c.id AS customer_id, c.customer_code, c.name AS owner_name,
                c.id_card AS owner_id_card, c.email AS owner_email, c.phone AS owner_phone,
                c.customer_type
            FROM assets a
            JOIN customers c ON a.customer_id = c.id
        `;
        const params = [];

        if (assetType) {
            sql += ` WHERE (LOWER(a.asset_type) = LOWER(?) OR a.asset_type_th LIKE ?)`;
            params.push(assetType, `%${assetType}%`);
        }

        sql += ` ORDER BY a.value DESC`;

        // OWASP Parameterized Query
        const records = await dbAll(sql, params);

        // Group by owner
        const ownerMap = {};
        records.forEach(row => {
            if (!ownerMap[row.customer_id]) {
                ownerMap[row.customer_id] = {
                    customer_id: row.customer_id,
                    customer_code: row.customer_code,
                    owner_name: row.owner_name,
                    contact: {
                        email: row.owner_email,
                        phone: row.owner_phone
                    },
                    customer_type: row.customer_type,
                    assets: [],
                    total_value_in_type: 0
                };
            }
            ownerMap[row.customer_id].assets.push({
                asset_id: row.asset_id,
                asset_code: row.asset_code,
                name: row.asset_name,
                asset_type: row.asset_type,
                asset_type_th: row.asset_type_th,
                value: row.value,
                status: row.status,
                location: row.location
            });
            ownerMap[row.customer_id].total_value_in_type += Number(row.value) || 0;
        });

        const ownersList = Object.values(ownerMap);

        res.json({
            message: assetType 
                ? `รายงานค้นหาผู้ถือครองทรัพย์สินประเภท: ${assetType}`
                : 'รายงานค้นหาผู้ถือครองทรัพย์สินทุกประเภท',
            queried_type: assetType || 'all',
            total_owners_found: ownersList.length,
            total_assets_found: records.length,
            data: ownersList
        });
    } catch (err) {
        console.error('[REPORT OWNERSHIP ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
