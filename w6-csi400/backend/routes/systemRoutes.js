const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// GET /api/system/health - System health and API registry
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'Avengers Quinjet & Helicarrier API Command Hub',
        subject: 'CSI400 Web Services - Week 6: API Testing (Postman + Mocha/Chai)',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        supportedTestingFrameworks: [
            'Postman Collections v2.1 (pm.test, pm.expect, pre-request scripts)',
            'Newman CLI Automated Test Runner',
            'Mocha Test Framework (describe, it, before/after hooks)',
            'Chai Assertion Library (expect style: to.have.status, to.be.an, to.have.property)',
            'Supertest / HTTP In-Process API Client'
        ]
    });
});

// GET /api/system/postman-files - Returns raw Postman Collection and Environment JSON
router.get('/postman-files', (req, res) => {
    try {
        const collectionPath = path.join(__dirname, '../../postman/Avengers_Hero_API.postman_collection.json');
        const envPath = path.join(__dirname, '../../postman/Avengers_Hero_API.postman_environment.json');

        const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf-8'));
        const environment = JSON.parse(fs.readFileSync(envPath, 'utf-8'));

        res.status(200).json({
            success: true,
            collection,
            environment
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to read Postman files',
            message: err.message
        });
    }
});

module.exports = router;
