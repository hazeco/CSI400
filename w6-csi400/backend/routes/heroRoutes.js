const express = require('express');
const router = express.Router();
const heroStore = require('../data/heroStore');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Role-based Access Control Check (RBAC):
// If an Authorization Bearer token is provided, verify whether the user has admin role
function requireAdminIfAuthenticated(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            try {
                const decoded = jwt.verify(parts[1], JWT_SECRET);
                req.user = decoded;
                if (decoded.role !== 'admin') {
                    return res.status(403).json({
                        success: false,
                        error: 'Forbidden',
                        message: `Access denied. Agent '${decoded.name}' (Role: ${decoded.role}) does not have admin clearance to modify heroes. Only Tony Stark (admin) can perform this action.`
                    });
                }
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid access token provided'
                });
            }
        }
    }
    next();
}

// 1. GET /api/heroes - Retrieve all heroes with optional filtering
router.get('/', (req, res) => {
    let heroes = heroStore.getAllHeroes();
    const { status, powerClass, search } = req.query;

    if (status) {
        heroes = heroes.filter(h => h.status.toLowerCase() === status.toLowerCase());
    }
    if (powerClass) {
        heroes = heroes.filter(h => h.powerClass.toLowerCase().includes(powerClass.toLowerCase()));
    }
    if (search) {
        const q = search.toLowerCase();
        heroes = heroes.filter(h =>
            h.name.toLowerCase().includes(q) ||
            h.codename.toLowerCase().includes(q) ||
            (h.powerClass && h.powerClass.toLowerCase().includes(q))
        );
    }

    res.status(200).json({
        success: true,
        count: heroes.length,
        heroes: heroes
    });
});

// 2. GET /api/heroes/stats/summary - Operational telemetry & statistics
router.get('/stats/summary', (req, res) => {
    const stats = heroStore.getStats();
    res.status(200).json({
        success: true,
        summary: stats,
        timestamp: new Date().toISOString()
    });
});

// 3. GET /api/heroes/:id - Retrieve specific hero
router.get('/:id', (req, res) => {
    const heroId = Number(req.params.id);
    if (isNaN(heroId)) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Hero ID must be a valid numeric integer'
        });
    }

    const hero = heroStore.getHeroById(heroId);
    if (!hero) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: `Hero with ID #${heroId} was not found in Avengers registry`
        });
    }

    res.status(200).json({
        success: true,
        hero: hero
    });
});

// 4. POST /api/heroes - Register a new hero (Admin RBAC checked if token supplied)
router.post('/', requireAdminIfAuthenticated, (req, res) => {
    const { name, codename, powerClass, powerLevel, status, affiliation, baseLocation, clearanceLevel, gear, missionsCompleted } = req.body || {};

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Hero real "name" is required and must be a non-empty string'
        });
    }

    if (!codename || typeof codename !== 'string' || !codename.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Hero superhero "codename" is required and must be a non-empty string'
        });
    }

    // Check duplicate codename
    const existing = heroStore.getAllHeroes().find(h => h.codename.toLowerCase() === codename.trim().toLowerCase());
    if (existing) {
        return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Hero with codename '${codename}' is already registered (ID: #${existing.id})`
        });
    }

    const newHero = heroStore.createHero({
        name,
        codename,
        powerClass,
        powerLevel,
        status,
        affiliation,
        baseLocation,
        clearanceLevel,
        gear,
        missionsCompleted
    });

    res.status(201).json({
        success: true,
        message: `Hero '${newHero.codename}' successfully registered into Avengers Roster`,
        hero: newHero
    });
});

// 5. PUT /api/heroes/:id - Update existing hero (Admin RBAC checked if token supplied)
router.put('/:id', requireAdminIfAuthenticated, (req, res) => {
    const heroId = Number(req.params.id);
    if (isNaN(heroId)) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Hero ID must be a valid numeric integer'
        });
    }

    const existing = heroStore.getHeroById(heroId);
    if (!existing) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: `Cannot update: Hero #${heroId} not found in database`
        });
    }

    const updated = heroStore.updateHero(heroId, req.body);
    res.status(200).json({
        success: true,
        message: `Hero #${heroId} (${updated.codename}) updated successfully`,
        hero: updated
    });
});

// 6. DELETE /api/heroes/:id - Decommission hero (Admin RBAC checked if token supplied)
router.delete('/:id', requireAdminIfAuthenticated, (req, res) => {
    const heroId = Number(req.params.id);
    if (isNaN(heroId)) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Hero ID must be a valid numeric integer'
        });
    }

    const deleted = heroStore.deleteHero(heroId);
    if (!deleted) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: `Cannot delete: Hero #${heroId} not found in database`
        });
    }

    res.status(200).json({
        success: true,
        message: `Hero #${heroId} (${deleted.codename}) decommissioned from registry`,
        decommissionedHero: deleted
    });
});

// 7. POST /api/heroes/reset - Reset dataset to initial state (useful for test isolation)
router.post('/reset', (req, res) => {
    const initial = heroStore.resetStore();
    res.status(200).json({
        success: true,
        message: 'Hero registry reset to default Avengers roster',
        totalHeroes: initial.length
    });
});

module.exports = router;
