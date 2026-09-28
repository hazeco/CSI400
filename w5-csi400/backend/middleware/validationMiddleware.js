const { body, query, param, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Helper to sanitize any string against XSS (removing all HTML tags and dangerous attributes)
const cleanHtml = (dirty) => {
    if (typeof dirty !== 'string') return dirty;
    return sanitizeHtml(dirty, {
        allowedTags: [], // No HTML tags permitted
        allowedAttributes: {}
    }).trim();
};

// Middleware to check validation results and return 400 Bad Request
const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed: Invalid input data',
            details: errors.array().map(e => ({
                field: e.path || e.param,
                message: e.msg,
                value: e.value
            })),
            status: 400
        });
    }
    next();
};

// Validation rules for adding / updating Assets (Topic: ทรัพย์สินอื่นๆ)
const validateAssetInput = [
    body('name')
        .trim()
        .notEmpty().withMessage('ชื่อทรัพย์สินห้ามเป็นค่าว่าง')
        .isLength({ min: 3, max: 200 }).withMessage('ชื่อทรัพย์สินต้องมีความยาวระหว่าง 3 - 200 ตัวอักษร')
        .customSanitizer(value => cleanHtml(value)),

    body('asset_type')
        .trim()
        .isIn(['machinery', 'valuable', 'financial', 'office'])
        .withMessage('ประเภททรัพย์สินต้องเป็นหนึ่งใน: machinery (เครื่องจักร), valuable (ตู้เซฟ/อัญมณี), financial (สินทรัพย์การเงิน), office (ของใช้สำนักงาน)'),

    body('value')
        .notEmpty().withMessage('มูลค่าทรัพย์สินห้ามเป็นค่าว่าง')
        .isFloat({ min: 0 }).withMessage('มูลค่าทรัพย์สินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0')
        .toFloat(),

    body('customer_id')
        .notEmpty().withMessage('รหัสผู้ถือครอง (customer_id) ห้ามเป็นค่าว่าง')
        .isInt({ min: 1 }).withMessage('รหัสผู้ถือครองต้องเป็นตัวเลขจำนวนเต็มบวก')
        .toInt(),

    body('description')
        .optional()
        .customSanitizer(value => cleanHtml(value)),

    body('location')
        .optional()
        .customSanitizer(value => cleanHtml(value)),

    body('serial_number')
        .optional()
        .trim()
        .customSanitizer(value => cleanHtml(value)),

    body('status')
        .optional()
        .isIn(['active', 'pledged', 'under_review', 'liquidated'])
        .withMessage('สถานะทรัพย์สินต้องเป็น: active, pledged, under_review หรือ liquidated'),

    checkValidationResult
];

// Validation rules for Login
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('กรุณากรอก Username')
        .isAlphanumeric().withMessage('Username ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น')
        .isLength({ min: 3, max: 50 }).withMessage('Username ต้องมีความยาว 3-50 ตัวอักษร'),

    body('password')
        .notEmpty().withMessage('กรุณากรอก Password')
        .isLength({ min: 6 }).withMessage('Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),

    checkValidationResult
];

// Validation for Report query parameter: minValue
const validateHighValueQuery = [
    query('minValue')
        .optional()
        .isFloat({ min: 0 }).withMessage('minValue ต้องเป็นตัวเลขบวก')
        .toFloat(),
    checkValidationResult
];

// Validation for Report query parameter: assetType
const validateAssetTypeQuery = [
    query('assetType')
        .optional()
        .trim()
        .customSanitizer(value => cleanHtml(value)),
    checkValidationResult
];

module.exports = {
    cleanHtml,
    checkValidationResult,
    validateAssetInput,
    validateLogin,
    validateHighValueQuery,
    validateAssetTypeQuery
};
