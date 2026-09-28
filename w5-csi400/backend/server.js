require('dotenv').config();
const express = require('express');
const path = require('path');
const { corsMiddleware, handleCorsError, corsOptions, allowedDomains } = require('./middleware/corsMiddleware');
const cors = require('cors');

// Import Route Handlers
const apiAuthRoutes = require('./routes/apiAuthRoutes');
const apiAssetRoutes = require('./routes/apiAssetRoutes');
const apiCustomerRoutes = require('./routes/apiCustomerRoutes');
const apiReportRoutes = require('./routes/apiReportRoutes');
const apiSecurityTestRoutes = require('./routes/apiSecurityTestRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Content Security Policy (CSP) - OWASP Standard (PDF Page 10)
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:;"
    );
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 2. CORS Middleware with Preflight OPTIONS Handling (PDF Page 6, 20, 25)
app.use(corsMiddleware);
app.options(/(.*)/, cors(corsOptions));

// 3. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. Public Info / Health Endpoint
app.get('/api/public/info', (req, res) => {
    res.json({
        system_name: 'CSI400 Private Asset Ownership System',
        topic: 'ระบบตรวจสอบการถือครองทรัพย์สิน (หัวข้อ: ทรัพย์สินอื่นๆ - Other Assets)',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        cors_whitelisted_domains: allowedDomains,
        security_features: [
            'CORS Whitelist Verification (Dev 5500, Bank A, Bank B)',
            'JWT Bearer Token Authentication (Private API)',
            'Parameterized SQL Queries (OWASP Anti-SQL Injection)',
            'Input Validation & HTML Sanitization (Anti-XSS)',
            'Content Security Policy (CSP) & Secure Error Masking'
        ],
        documentation_routes: {
            auth: 'POST /api/auth/login',
            assets: 'GET, POST, PUT, DELETE /api/assets',
            customers: 'GET /api/customers, GET /api/customers/:id/assets',
            reports: [
                'GET /api/reports/assets/summary',
                'GET /api/reports/assets/high-value?minValue=10000000',
                'GET /api/reports/ownership?assetType=machinery'
            ],
            security_tests: [
                'GET /api/private-data',
                'POST /api/security/test-xss',
                'POST /api/security/test-sqli'
            ]
        }
    });
});

// 6. Register API Routes
app.use('/api/auth', apiAuthRoutes);
app.use('/api/assets', apiAssetRoutes);
app.use('/api/customers', apiCustomerRoutes);
app.use('/api/reports', apiReportRoutes);
app.use('/api', apiSecurityTestRoutes); // /api/private-data, /api/security/...

// 7. Fallback for SPA/Frontend in production
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 8. CORS Error Handler (Status Code 403 - PDF Page 22, 23, 25)
app.use(handleCorsError);

// 9. Generic Global Error Handler (OWASP 4.4.5: Never expose raw SQL errors)
app.use((err, req, res, next) => {
    console.error('[UNHANDLED SERVER ERROR]', err.stack || err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาตรวจสอบ Server Log',
        status: 500
    });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 CSI400 Week 5 Backend Server running on port ${PORT}`);
        console.log(`📡 URL: http://localhost:${PORT}`);
        console.log(`🛡️  CORS Allowed Origins:`);
        allowedDomains.forEach(domain => console.log(`   - ${domain}`));
        console.log(`====================================================`);
    });
}

module.exports = app;
