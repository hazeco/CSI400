require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const heroRoutes = require('./routes/heroRoutes');
const testRunnerRoutes = require('./routes/testRunnerRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl.startsWith('/api')) {
            console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve postman folder for direct file download
app.use('/postman', express.static(path.join(__dirname, '../postman')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/tests', testRunnerRoutes);
app.use('/api/system', systemRoutes);

// Fallback for SPA/Frontend
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
        });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server if executed directly
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 Avengers Quinjet API & QA Hub - CSI400 Week 6`);
        console.log(`🌐 Server running at: http://localhost:${PORT}`);
        console.log(`🧪 Mocha/Chai Automated Testing & Postman Runner Ready`);
        console.log(`=======================================================`);
    });
}

module.exports = app;
