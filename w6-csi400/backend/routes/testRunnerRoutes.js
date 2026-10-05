const express = require('express');
const router = express.Router();
const path = require('path');
const Mocha = require('mocha');
const heroStore = require('../data/heroStore');

// Cache of latest test run results
let latestTestRun = null;

// GET /api/tests/suites - Metadata of available test suites
router.get('/suites', (req, res) => {
    res.status(200).json({
        success: true,
        suites: [
            {
                id: 'hero-api',
                name: 'Avengers Hero API Suite (CRUD & Validation)',
                framework: 'Mocha + Chai (Expect Style)',
                file: 'test/hero.api.test.js',
                description: 'Tests GET /api/heroes, GET /:id, POST, PUT, DELETE, plus 400 Bad Request & 404 Not Found scenarios'
            },
            {
                id: 'auth-api',
                name: 'Security & Authentication Suite',
                framework: 'Mocha + Chai + JWT',
                file: 'test/auth.api.test.js',
                description: 'Tests login credentials, 401 Unauthorized negative cases, token claims & headers'
            },
            {
                id: 'postman-newman',
                name: 'Postman Collection Runner Suite',
                framework: 'Newman CLI / Mocha Wrapper',
                file: 'test/newman.test.js',
                description: 'Executes Avengers_Hero_API.postman_collection.json via Newman runner'
            }
        ],
        latestRun: latestTestRun ? {
            timestamp: latestTestRun.timestamp,
            passed: latestTestRun.passes.length,
            failed: latestTestRun.failures.length,
            total: latestTestRun.total,
            duration: latestTestRun.duration
        } : null
    });
});

// POST /api/tests/run - Run Mocha test suite programmatically & return live JSON results
router.post('/run', (req, res) => {
    // Reset store before running tests to ensure deterministic results
    heroStore.resetStore();

    // Create fresh Mocha instance
    const mocha = new Mocha({
        timeout: 10000,
        reporter: function (runner) {
            // In-memory custom collector
            const passes = [];
            const failures = [];
            let start = Date.now();

            runner.on('pass', function (test) {
                passes.push({
                    title: test.title,
                    fullTitle: test.fullTitle(),
                    suite: test.parent ? test.parent.title : 'Root',
                    duration: test.duration || 0,
                    status: 'passed'
                });
            });

            runner.on('fail', function (test, err) {
                failures.push({
                    title: test.title,
                    fullTitle: test.fullTitle(),
                    suite: test.parent ? test.parent.title : 'Root',
                    duration: test.duration || 0,
                    status: 'failed',
                    error: {
                        message: err.message,
                        stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : null,
                        actual: err.actual,
                        expected: err.expected
                    }
                });
            });

            runner.on('end', function () {
                const duration = Date.now() - start;
                latestTestRun = {
                    timestamp: new Date().toISOString(),
                    total: passes.length + failures.length,
                    passedCount: passes.length,
                    failedCount: failures.length,
                    passRate: Math.round((passes.length / (passes.length + failures.length || 1)) * 100),
                    duration: duration,
                    passes: passes,
                    failures: failures
                };

                // Clear require cache for test files so future runs re-execute cleanly
                testFiles.forEach(file => {
                    delete require.cache[require.resolve(file)];
                });

                res.status(200).json({
                    success: true,
                    message: 'Automated test suite completed execution',
                    summary: {
                        total: latestTestRun.total,
                        passed: latestTestRun.passedCount,
                        failed: latestTestRun.failedCount,
                        passRate: `${latestTestRun.passRate}%`,
                        durationMs: latestTestRun.duration
                    },
                    passes: latestTestRun.passes,
                    failures: latestTestRun.failures
                });
            });
        }
    });

    const testFiles = [
        path.join(__dirname, '../../test/hero.api.test.js'),
        path.join(__dirname, '../../test/auth.api.test.js')
    ];

    testFiles.forEach(file => {
        mocha.addFile(file);
    });

    try {
        mocha.run();
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Test Execution Failed',
            message: err.message
        });
    }
});

// GET /api/tests/latest - Retrieve the latest test execution results
router.get('/latest', (req, res) => {
    if (!latestTestRun) {
        return res.status(200).json({
            success: true,
            hasRun: false,
            message: 'No test runs executed yet. Trigger a run from the dashboard.'
        });
    }

    res.status(200).json({
        success: true,
        hasRun: true,
        latestRun: latestTestRun
    });
});

module.exports = router;
