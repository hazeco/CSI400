const fs = require('fs');
const path = require('path');

const INITIAL_HEROES_PATH = path.join(__dirname, 'initialHeroes.json');

// In-Memory Runtime Store (prevents disk write churn that triggers Live Server auto-reload)
let runtimeHeroes = [];

function loadInitialHeroes() {
    try {
        const raw = fs.readFileSync(INITIAL_HEROES_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        return [];
    }
}

// Initialize memory store on boot
runtimeHeroes = loadInitialHeroes();

function getAllHeroes() {
    // Return deep copy so callers cannot mutate internal store directly
    return JSON.parse(JSON.stringify(runtimeHeroes));
}

function getHeroById(id) {
    return runtimeHeroes.find(h => h.id === Number(id)) || null;
}

function createHero(payload) {
    const nextId = runtimeHeroes.length > 0 ? Math.max(...runtimeHeroes.map(h => h.id)) + 1 : 1;
    const newHero = {
        id: nextId,
        name: payload.name.trim(),
        codename: payload.codename.trim(),
        powerClass: payload.powerClass || 'Genius / Tech',
        powerLevel: Number(payload.powerLevel) || 75,
        status: payload.status || 'Active Duty',
        affiliation: payload.affiliation || 'Avengers Core',
        baseLocation: payload.baseLocation || 'Avengers Tower, NYC',
        clearanceLevel: payload.clearanceLevel || 'Level Beta',
        gear: Array.isArray(payload.gear) ? payload.gear : (payload.gear ? [payload.gear] : []),
        missionsCompleted: Number(payload.missionsCompleted) || 0,
        createdAt: new Date().toISOString()
    };
    runtimeHeroes.push(newHero);
    return newHero;
}

function updateHero(id, payload) {
    const index = runtimeHeroes.findIndex(h => h.id === Number(id));
    if (index === -1) return null;

    const existing = runtimeHeroes[index];
    const updated = {
        ...existing,
        ...payload,
        id: existing.id, // Preserve ID
        updatedAt: new Date().toISOString()
    };
    runtimeHeroes[index] = updated;
    return updated;
}

function deleteHero(id) {
    const index = runtimeHeroes.findIndex(h => h.id === Number(id));
    if (index === -1) return false;

    const deleted = runtimeHeroes.splice(index, 1)[0];
    return deleted;
}

function resetStore() {
    runtimeHeroes = loadInitialHeroes();
    return JSON.parse(JSON.stringify(runtimeHeroes));
}

function getStats() {
    const statusCounts = {};
    const classCounts = {};
    let totalPower = 0;

    runtimeHeroes.forEach(h => {
        statusCounts[h.status] = (statusCounts[h.status] || 0) + 1;
        classCounts[h.powerClass] = (classCounts[h.powerClass] || 0) + 1;
        totalPower += (h.powerLevel || 0);
    });

    return {
        totalHeroes: runtimeHeroes.length,
        avgPowerLevel: runtimeHeroes.length ? Math.round(totalPower / runtimeHeroes.length) : 0,
        statusBreakdown: statusCounts,
        classBreakdown: classCounts,
        activeDeployments: statusCounts['Active Duty'] || 0
    };
}

module.exports = {
    getAllHeroes,
    getHeroById,
    createHero,
    updateHero,
    deleteHero,
    resetStore,
    getStats
};
