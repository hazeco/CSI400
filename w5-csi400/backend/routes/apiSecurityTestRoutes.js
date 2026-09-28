const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { cleanHtml } = require('../middleware/validationMiddleware');
const { dbGet } = require('../db');

// 1. GET /api/private-data - Endpoint ตรงตามตัวอย่างโจทย์หน้า 25
// มีการป้องกันด้วย CORS (ระดับเซิร์ฟเวอร์) และ JWT (ระดับข้อมูล)
router.get('/private-data', authenticateToken, (req, res) => {
    res.json({
        message: 'Private API Access Granted',
        accessed_by: req.user.username,
        role: req.user.role,
        origin: req.headers.origin || 'Direct/Postman',
        data: ['secret1', 'secret2', 'secret3'],
        timestamp: new Date().toISOString()
    });
});

// 1.1 POST /api/security/simulate-cors - จำลองการตรวจสอบ CORS Origin สำหรับการทดสอบบน Frontend Dashboard
router.post('/security/simulate-cors', (req, res) => {
    const testOrigin = req.body.origin;
    const { isOriginAllowed, allowedDomains } = require('../middleware/corsMiddleware');

    if (!testOrigin) {
        return res.status(400).json({ error: 'Origin is required' });
    }

    if (isOriginAllowed(testOrigin)) {
        return res.status(200).json({
            status: 200,
            message: `Origin "${testOrigin}" ได้รับอนุญาต (Whitelisted) ผ่านการตรวจสอบ CORS สำเร็จ`,
            origin: testOrigin,
            allowed: true,
            cors_header_sent: {
                'Access-Control-Allow-Origin': testOrigin,
                'Access-Control-Allow-Credentials': 'true'
            }
        });
    } else {
        return res.status(403).json({
            error: 'Access denied: CORS policy does not allow this origin',
            attemptedOrigin: testOrigin,
            status: 403,
            allowed: false,
            cors_header_sent: null,
            allowedDomainsSample: allowedDomains.slice(0, 3)
        });
    }
});

// 2. POST /api/security/test-xss - Endpoint สาธิตการทดสอบและป้องกัน XSS (หน้า 10-11)
router.post('/test-xss', (req, res) => {
    const rawComment = req.body.comment || '';
    const rawUsername = req.body.username || '';

    // Sanitize with sanitize-html (OWASP Best Practice)
    const sanitizedComment = cleanHtml(rawComment);
    const sanitizedUsername = cleanHtml(rawUsername);

    const hasDangerousScript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(rawComment)
        || /javascript:/gi.test(rawComment)
        || /onerror=/gi.test(rawComment);

    res.json({
        message: 'ผลการทดสอบการป้องกัน XSS (Sanitize HTML Demonstration)',
        input_received: {
            username: rawUsername,
            comment: rawComment
        },
        sanitized_output: {
            username: sanitizedUsername,
            comment: sanitizedComment
        },
        security_analysis: {
            threat_detected: hasDangerousScript,
            explanation: hasDangerousScript 
                ? 'ตรวจพบแท็ก <script> หรือโค้ดอันตราย! ระบบได้ตัดออกเรียบร้อยแล้ว ไม่ถูกประมวลผลบนเบราว์เซอร์'
                : 'ข้อมูลปลอดภัย ไม่พบมัลลิเชียสสคริปต์'
        }
    });
});

// 3. POST /api/security/test-sqli - Endpoint สาธิตการทดสอบและป้องกัน SQL Injection (หน้า 12-17)
router.post('/test-sqli', async (req, res) => {
    const testUsername = req.body.username || '';
    const isPayloadAttempt = testUsername.includes("'") || testUsername.toLowerCase().includes("or") || testUsername.includes("--");

    try {
        // Safe Parameterized Query
        const safeResult = await dbGet('SELECT id, username, name, role FROM users WHERE username = ?', [testUsername]);

        res.json({
            message: 'ผลการทดสอบการป้องกัน SQL Injection (Parameterized Query Demonstration)',
            input_tested: testUsername,
            payload_pattern_detected: isPayloadAttempt,
            safe_query_executed: 'SELECT id, username, name, role FROM users WHERE username = ?',
            query_parameter: [testUsername],
            result_found: safeResult ? true : false,
            user_data: safeResult || null,
            security_analysis: {
                is_secure: true,
                explanation: isPayloadAttempt
                    ? 'อินพุตที่ส่งมามีรูปแบบ SQL Injection (เช่น \' OR \'1\'=\'1) แต่ระบบใช้ Parameterized Query ทำให้ Database มองเป็นสตริงธรรมดา ไม่ถูกแฮก และไม่พบผู้ใช้งานชื่อนี้'
                    : 'ค้นหาด้วย Parameterized Query สำเร็จและปลอดภัย'
            }
        });
    } catch (err) {
        console.error('[SQLI TEST ERROR]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
